"""
SD-WAN Fleet Audit — LLM Q&A Bridge (Ollama via Open WebUI)
=============================================================
Architecture RAG :
  1. populate_db.py remplit la DB avec toutes les donnees de reference
  2. Ce script connecte le LLM local (Ollama/Open WebUI) a la DB via LangChain SQL Agent
  3. Le jury pose des questions -> le LLM lit la DB -> repond en langage naturel

Le LLM ne calcule rien. Il lit les donnees pre-calculees et les explique.

Module "Assistant Intelligent" (LLM Local)
------------------------------------------
La base de donnees SQLite hackathon_sdwan.db consolide les donnees d'entree
(Inventaire, Metriques) et les resultats de la migration.
Un LLM Local est utilise pour interagir avec cette base.

Objectifs du module LLM :
1. Interface Natural Language : Permettre aux ingenieurs reseau de poser des
   questions en francais sur l'etat du parc sans connaitre le SQL.
2. Confidentialite : Execution 100% locale (Off-grid) pour respecter la
   sensibilite des donnees d'infrastructure (Data Privacy).
3. Validation : Verifier la coherence des donnees migrees (ex: comparer le
   Measured Throughput avec la Target License dans la DB).

Flux technique :
  User Prompt -> LLM (Generation SQL) -> Execution sur hackathon_sdwan.db
  -> LLM (Synthese de la reponse) -> User

Systeme de memoire adaptative :
  - Chaque interaction (succes/erreur) est capturee automatiquement
  - Les erreurs SQL et leurs corrections sont enregistrees
  - Les questions sont taggees par categorie semantique
  - A chaque nouvelle question, les exemples pertinents sont injectes dans le prompt
  - Plus le systeme est utilise, plus il devient precis

Compatibilite multi-modeles :
  - Mistral: echappe les underscores (sql\\_db\\_query) -> nettoyage automatique
  - Qwen: parfois oublie Final Answer -> extraction fallback
  - DeepSeek-coder: modele code-only, retourne null -> non supporte
  - Tous: gere les erreurs de parsing ReAct gracieusement
"""

import io
import json
import re
import sys
import sqlite3
import logging
from datetime import datetime
from pathlib import Path

_SCRIPT_DIR = Path(__file__).parent            # src/
_PROJECT_ROOT = _SCRIPT_DIR.parent             # project root
sys.path.insert(0, str(_SCRIPT_DIR))

from langchain_community.utilities import SQLDatabase
from langchain_openai import ChatOpenAI
from langchain_community.agent_toolkits import create_sql_agent
from langchain_core.messages import AIMessage
from langchain_core.tools import Tool

# ---------------------------------------------------------------------------
# Configuration — Ollama via Open WebUI (Docker) sur PC distant (Tailscale VPN)
# ---------------------------------------------------------------------------

IP_SERVEUR = "100.68.79.54"
PORT_WEBUI = "3000"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAzMTk3NmU0LTFjMzgtNGExNC1hNDc4LWMyY2YyNDAxNTdhYSIsImV4cCI6MTc3Mjg5NTc2OCwianRpIjoiZDY1OTNkYzYtZmU1OC00Y2I1LWFiNzUtOGM1YjZmN2I2ZTkxIn0.cdjYYUoEx1bj812ZOdgVv5-uOXuH6uxRQQ9YzgDBlmw"
MODEL_NAME = "qwen3-fast:latest"

_DB_FILE = _PROJECT_ROOT / "data" / "hackathon_sdwan_v2.db"
_MEMORY_FILE = _PROJECT_ROOT / "data" / "llm_memory.json"
DB_URI = f"sqlite:///{_DB_FILE}"


# ===========================================================================
# BACKSLASH CLEANING — Fix Mistral markdown escaping via proper subclass
# ===========================================================================

def _clean_backslashes(text):
    """Remove Markdown backslash-escapes from LLM output.

    Models like Mistral escape underscores: sql\\_db\\_query, parc\\_actuel
    which breaks LangChain's ReAct parser that expects exact tool names.
    """
    if not text:
        return text
    return text.replace("\\_", "_").replace("\\*", "*").replace("\\#", "#")


class _CleanChatOpenAI(ChatOpenAI):
    """ChatOpenAI subclass that cleans backslash-escapes from model output.

    This is a proper subclass so it passes Pydantic validation in LangChain.
    """

    def _generate(self, *args, **kwargs):
        result = super()._generate(*args, **kwargs)
        # Clean each generation
        for gen in result.generations:
            if hasattr(gen, "message") and hasattr(gen.message, "content"):
                gen.message.content = _clean_backslashes(gen.message.content)
            if hasattr(gen, "text"):
                gen.text = _clean_backslashes(gen.text)
        return result

    def invoke(self, input, config=None, **kwargs):
        result = super().invoke(input, config=config, **kwargs)
        if hasattr(result, "content"):
            cleaned = _clean_backslashes(result.content)
            if cleaned != result.content:
                result = AIMessage(
                    content=cleaned,
                    additional_kwargs=getattr(result, "additional_kwargs", {}),
                    response_metadata=getattr(result, "response_metadata", {}),
                )
        return result


# ===========================================================================
# ADAPTIVE MEMORY SYSTEM — learn from successes AND errors automatically
# ===========================================================================

_CATEGORIES = {
    "lifecycle": (
        "fin de vie", "end of life", "eol", "eos", "fin de support",
        "fin de vente", "obsolete", "critique", "critical", "urgent",
    ),
    "migration": (
        "edge 740", "edge 720", "edge 710", "7x0", "remplacement",
        "migration", "remplacer", "nouveau modele", "recommand",
        "quel modele", "suggere",
    ),
    "cost": (
        "cout", "coute", "prix", "budget", "economie", "saving",
        "optimis", "compar", "baseline", "740 enterprise",
    ),
    "upgrade": (
        "upgrade", "mise a jour", "version", "logiciel", "chemin",
        "path", "4.2.2", "5.0", "6.4", "vco", "gateway",
    ),
    "inventory": (
        "combien", "nombre", "total", "parc", "inventaire",
        "equipement", "liste", "tous", "count",
    ),
    "host_detail": (
        "host-", "edge840-", "edge680-", "site", "specifique",
        "detail", "pourquoi",
    ),
    "specs": (
        "spec", "technique", "debit", "throughput", "tunnel",
        "sfp", "port", "flow", "nat", "capacite",
    ),
}


def _classify_question(question):
    """Tag a question with semantic categories based on keywords."""
    q_lower = question.lower()
    tags = []
    for category, keywords in _CATEGORIES.items():
        if any(kw in q_lower for kw in keywords):
            tags.append(category)
    return tags if tags else ["general"]


def _load_memory():
    """Load full memory from disk."""
    if _MEMORY_FILE.exists():
        try:
            data = json.loads(_MEMORY_FILE.read_text(encoding="utf-8"))
            if isinstance(data, dict) and "successes" in data:
                return data
        except (json.JSONDecodeError, OSError):
            pass
    return {
        "successes": [],
        "errors": [],
        "sql_corrections": {},
        "stats": {"total_questions": 0, "total_successes": 0, "total_errors": 0},
    }


def _save_memory(memory):
    """Persist memory to disk."""
    try:
        _MEMORY_FILE.write_text(
            json.dumps(memory, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    except OSError:
        pass  # Non-critical — don't crash on write errors


def _record_success(question, sql_queries, answer, categories):
    """Record a successful interaction with all metadata."""
    memory = _load_memory()
    q_lower = question.strip().lower()

    for entry in memory["successes"]:
        if entry.get("question", "").strip().lower() == q_lower:
            entry["sql"] = sql_queries
            entry["answer"] = answer
            entry["categories"] = categories
            entry["timestamp"] = datetime.now().isoformat()
            entry["hit_count"] = entry.get("hit_count", 0) + 1
            _save_memory(memory)
            return

    memory["successes"].append({
        "question": question.strip(),
        "sql": sql_queries,
        "answer": answer,
        "categories": categories,
        "timestamp": datetime.now().isoformat(),
        "hit_count": 1,
    })

    if len(memory["successes"]) > 100:
        memory["successes"] = memory["successes"][-100:]

    memory["stats"]["total_questions"] = memory["stats"].get("total_questions", 0) + 1
    memory["stats"]["total_successes"] = memory["stats"].get("total_successes", 0) + 1
    _save_memory(memory)


def _record_error(question, bad_sql, error_msg, correction_sql, categories):
    """Record an error and its correction so the LLM avoids the same mistake."""
    memory = _load_memory()

    memory["errors"].append({
        "question": question.strip(),
        "bad_sql": bad_sql,
        "error": error_msg,
        "correction": correction_sql,
        "categories": categories,
        "timestamp": datetime.now().isoformat(),
    })

    if len(memory["errors"]) > 50:
        memory["errors"] = memory["errors"][-50:]

    if bad_sql and correction_sql:
        memory["sql_corrections"][bad_sql.strip()] = correction_sql.strip()

    memory["stats"]["total_questions"] = memory["stats"].get("total_questions", 0) + 1
    memory["stats"]["total_errors"] = memory["stats"].get("total_errors", 0) + 1
    _save_memory(memory)


def _find_relevant_examples(question, max_examples=5):
    """Find the most relevant past successes for a given question."""
    memory = _load_memory()
    categories = _classify_question(question)
    q_lower = question.strip().lower()

    scored = []
    for entry in memory.get("successes", []):
        score = 0
        entry_cats = entry.get("categories", [])
        score += len(set(categories) & set(entry_cats)) * 3

        q_words = set(q_lower.split())
        e_words = set(entry.get("question", "").lower().split())
        score += len(q_words & e_words)
        score += min(entry.get("hit_count", 0), 5)

        if score > 0:
            scored.append((score, entry))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [entry for _, entry in scored[:max_examples]]


def _find_relevant_errors(question, max_errors=3):
    """Find past errors relevant to this question type."""
    memory = _load_memory()
    categories = _classify_question(question)

    relevant = []
    for entry in memory.get("errors", []):
        entry_cats = entry.get("categories", [])
        if set(categories) & set(entry_cats):
            relevant.append(entry)

    return relevant[-max_errors:]


def _build_dynamic_context(question):
    """Build dynamic few-shot context from memory, tailored to the question."""
    examples = _find_relevant_examples(question)
    errors = _find_relevant_errors(question)
    parts = []

    if examples:
        parts.append("\n=== EXEMPLES SIMILAIRES REUSSIS (appris automatiquement) ===")
        for ex in examples:
            parts.append(f"Q: {ex['question']}")
            if ex.get("sql"):
                for sql in ex["sql"][:2]:
                    parts.append(f"SQL: {sql}")
            parts.append(f"R: {ex['answer'][:200]}")
            parts.append("")

    if errors:
        parts.append("=== ERREURS A EVITER (appris automatiquement) ===")
        for err in errors:
            if err.get("bad_sql"):
                parts.append(f"MAUVAIS SQL: {err['bad_sql']}")
                parts.append(f"ERREUR: {err['error'][:100]}")
                if err.get("correction"):
                    parts.append(f"CORRECTION: {err['correction']}")
                parts.append("")

    return "\n".join(parts)


def _get_memory_stats():
    """Return memory stats string for display."""
    memory = _load_memory()
    n_success = len(memory.get("successes", []))
    n_errors = len(memory.get("errors", []))
    n_corrections = len(memory.get("sql_corrections", {}))
    return (
        f"{n_success} reponses, "
        f"{n_errors} erreurs, "
        f"{n_corrections} corrections SQL"
    )


# ===========================================================================
# SYSTEM PROMPT + SUFFIX
# ===========================================================================

SYSTEM_PROMPT = """Tu es l'expert technique Orange Business pour l'audit SD-WAN VeloCloud.
Tu reponds aux questions en FRANCAIS en interrogeant la base de donnees SQLite.

=== SCHEMA EXACT DES TABLES ===

TABLE parc_actuel (90 equipements):
  nom_hote TEXT PK, modele_actuel TEXT, version_logicielle TEXT,
  debit_max_mesure INTEGER, nb_ports_sfp_utilises INTEGER, nb_tunnels_max INTEGER

TABLE mesures_detaillees (90 equipements, donnees completes):
  nom_hote TEXT PK, modele TEXT, version TEXT,
  debit_max_mbps INTEGER, max_tunnels INTEGER, max_flows_par_sec INTEGER,
  max_flux_concurrents INTEGER, max_entrees_nat INTEGER,
  ports_rj45_utilises INTEGER, ports_sfp_utilises INTEGER

TABLE scenarios_migration (90 scenarios de remplacement pre-calcules):
  id_scenario INTEGER PK, nom_hote TEXT FK,
  nouveau_modele_suggere TEXT, nouvelle_licence_suggeree TEXT,
  chemin_migration_logicielle TEXT, cout_total_estime INTEGER,
  complexite_intervention TEXT

TABLE lifecycle (dates EoS/EoL par modele):
  modele TEXT PK, date_fin_vente TEXT, date_fin_support TEXT,
  urgence TEXT, statut TEXT, remplacement_recommande TEXT

TABLE edge_7x0_specs (specs des modeles cibles):
  modele TEXT PK, debit_max_imix_mbps INTEGER, max_tunnels INTEGER,
  flows_par_seconde INTEGER, max_flux_concurrents INTEGER,
  max_entrees_nat INTEGER, nb_ports_sfp INTEGER, type_sfp TEXT,
  nb_ports_rj45 INTEGER, ram_go INTEGER, tiers_bande_passante TEXT

TABLE software_compatibility:
  modele TEXT, branche_version TEXT, supporte TEXT, notes TEXT

TABLE upgrade_paths:
  version_source TEXT, version_cible TEXT, etapes TEXT, notes_ordre TEXT

TABLE catalogue_reference:
  id_modele TEXT, type_produit TEXT, cout_relatif INTEGER,
  debit_max_mbps INTEGER, nb_ports_sfp_max INTEGER, description_fr TEXT

=== EXEMPLES SQL CORRECTS ===

SELECT COUNT(*) FROM parc_actuel;
SELECT nom_hote, nouveau_modele_suggere, cout_total_estime FROM scenarios_migration WHERE nouveau_modele_suggere = 'Edge 740';
SELECT s.nom_hote, m.debit_max_mbps, m.max_tunnels, m.max_flows_par_sec, m.max_entrees_nat FROM scenarios_migration s JOIN mesures_detaillees m ON s.nom_hote = m.nom_hote WHERE s.nouveau_modele_suggere = 'Edge 740';
SELECT SUM(cout_total_estime) FROM scenarios_migration;
SELECT nouveau_modele_suggere, COUNT(*) as nb FROM scenarios_migration GROUP BY nouveau_modele_suggere;
SELECT modele, urgence, date_fin_vente, date_fin_support FROM lifecycle WHERE urgence = 'CRITICAL';
SELECT etapes FROM upgrade_paths WHERE version_source = '4.2.2';
SELECT modele, branche_version, supporte, notes FROM software_compatibility WHERE modele = 'Edge 840' AND supporte = 'Oui' ORDER BY branche_version DESC LIMIT 1;
SELECT modele, branche_version, supporte, notes FROM software_compatibility WHERE modele = 'Edge 680' AND supporte = 'Oui' ORDER BY branche_version DESC LIMIT 1;
SELECT SUM(cout_total_estime) as cout_optimise, COUNT(*) * 700 as cout_tout_740, COUNT(*) * 700 - SUM(cout_total_estime) as economies FROM scenarios_migration;

=== CONNAISSANCES PRE-CALCULEES (utilise-les directement si pertinent) ===

Versions max par modele :
- Edge 840 : max 5.2.x (EoL 09/2025, ne supporte PAS 5.4+/6.x). Remplacer par Edge 7x0.
- Edge 680 : max 6.1.x (EoS 07/2022, 6.4.x non supporte). Remplacer par Edge 7x0.
- Edge 7x0 (710/720/740) : version cible 6.4.x (LTS candidate).

Upgrade paths (depuis Release Notes officielles) :
- Edge 840 v4.2.2 : 4.2.2 -> 5.2.3 (LTS, max Edge 840) -> remplacement HW Edge 7x0 en 6.4.x
- Edge 680 v5.0.0 : 5.0.0 -> 6.1.x (LTS, max Edge 680) -> remplacement HW Edge 7x0 en 6.4.x
- Ordre obligatoire : VCO d'abord, puis Gateways, puis Edges par batch.

Parc actuel : 90 equipements (80x Edge 840 v4.2.2 + 10x Edge 680 v5.0.0).
Migration : 71x Edge 710, 15x Edge 720, 4x Edge 740 (tous en licence Enterprise).
Cout optimise : 22 250 vs baseline 63 000 (tout Edge 740) = 64% d'economies.
4 sites en Edge 740 : host-edge680-08, host-edge680-09, host-edge840-14, host-edge840-17.

=== REGLES ===
- Utilise DIRECTEMENT sql_db_query. Pas sql_db_query_checker.
- scenarios_migration contient DEJA les resultats calcules. Utilise-la en priorite.
- Reponds en francais. Donne des chiffres precis.
- NE repete JAMAIS la meme requete SQL.
- N'echappe PAS les underscores. Ecris sql_db_query, pas sql\\_db\\_query.
- Si on te demande d'exporter en JSON, utilise l'outil export_json.
- Si tu connais deja la reponse grace aux CONNAISSANCES PRE-CALCULEES, reponds directement sans SQL.
"""

SUFFIX_PROMPT = """=== EXEMPLES COMPLETS ===

Exemple 1:
Question: Combien d'equipements sont dans le parc ?
Thought: Je vais compter les equipements dans parc_actuel.
Action: sql_db_query
Action Input: SELECT COUNT(*) FROM parc_actuel
Observation: [(90,)]
Thought: J'ai la reponse.
Final Answer: Il y a 90 equipements dans le parc actuel.

Exemple 2:
Question: Quels sites necessitent un Edge 740 ?
Thought: Je cherche dans scenarios_migration avec un JOIN sur mesures_detaillees.
Action: sql_db_query
Action Input: SELECT s.nom_hote, m.debit_max_mbps, m.max_tunnels, m.max_flows_par_sec, m.max_entrees_nat FROM scenarios_migration s JOIN mesures_detaillees m ON s.nom_hote = m.nom_hote WHERE s.nouveau_modele_suggere = 'Edge 740'
Observation: [('host-edge680-08', 589, 450, 22000, 100000), ('host-edge680-09', 1284, 30, 22000, 600000), ('host-edge840-14', 1430, 60, 21000, 100000), ('host-edge840-17', 2300, 40, 22000, 500000)]
Thought: J'ai les donnees. 4 sites necessitent un Edge 740.
Final Answer: 4 sites necessitent un Edge 740 :\n- host-edge680-08 : 450 tunnels, 22000 flows/s\n- host-edge680-09 : 22000 flows/s, 600000 NAT entries\n- host-edge840-14 : 21000 flows/s, 1430 Mbps\n- host-edge840-17 : 22000 flows/s, 2300 Mbps

Exemple 3:
Question: Quelle est la version maximum pour un Edge 840 ?
Thought: Je cherche dans software_compatibility la version max supportee.
Action: sql_db_query
Action Input: SELECT modele, branche_version, supporte, notes FROM software_compatibility WHERE modele = 'Edge 840' AND supporte = 'Oui' ORDER BY branche_version DESC LIMIT 1
Observation: [('Edge 840', '5.2.x', 'Oui', 'Max version supportee pour Edge 840')]
Thought: J'ai la reponse.
Final Answer: La version maximum supportee pour un Edge 840 est la **5.2.x**. Au-dela (5.4.x, 6.x), le Edge 840 n'est plus supporte car il est en fin de vie (EoL 09/2025). Il faudra remplacer le hardware par un Edge 7x0 pour passer en 6.4.x.

Exemple 4:
Question: Exporte les donnees en JSON
Thought: L'utilisateur veut exporter les donnees. J'utilise l'outil export_json.
Action: export_json
Action Input: export
Observation: Export JSON termine avec succes. 90 fichiers individuels...
Thought: L'export est fait.
Final Answer: Les donnees ont ete exportees en JSON dans le dossier exports/ (90 fichiers par equipement + stats.json + fleet.json).

=== REGLES DE FORMAT (TRES IMPORTANT) ===
- TOUJOURS suivre ce format apres une Observation :
  Thought: [ta reflexion courte]
  Final Answer: [ta reponse complete en francais]
- NE JAMAIS repeter la requete SQL dans la reponse finale.
- NE JAMAIS dire "la colonne n'existe pas" ou "je ne peux pas". Tu as les donnees, reponds.
- NE JAMAIS ecrire de bloc de code SQL dans Final Answer.
- UNE seule requete SQL suffit. Pas besoin d'en faire 2.
- N'echappe PAS les underscores avec des backslash.
- Si tu connais la reponse sans SQL (grace aux connaissances pre-calculees), ecris directement :
  Thought: Je connais la reponse.
  Final Answer: [reponse]

Begin!

Question: {input}
Thought: {agent_scratchpad}"""


def _parse_error_handler(error):
    """Extract useful text from LLM output when ReAct parsing fails.

    The LLM sometimes ignores the ReAct format (Thought/Action/Final Answer)
    and just writes free-form text. This handler tries to salvage useful
    content from the raw LLM output and force it into a Final Answer.
    """
    text = str(error)
    text = _clean_backslashes(text)
    marker = "Could not parse LLM output: `"
    if marker in text:
        start = text.index(marker) + len(marker)
        end = text.rfind("`")
        if end > start:
            extracted = text[start:end]

            # If the LLM wrote "Final Answer:" somewhere in the mess, extract it
            fa_marker = "Final Answer:"
            if fa_marker in extracted:
                answer = extracted[extracted.index(fa_marker) + len(fa_marker):].strip()
                if answer:
                    return f"Final Answer: {answer}"

            # Strip SQL blocks and schema explanations that confuse users
            cleaned = extracted
            # Remove markdown code blocks (```sql ... ```)
            cleaned = re.sub(r"```[\s\S]*?```", "", cleaned)
            # Remove lines starting with "SELECT" (SQL repeats)
            cleaned = re.sub(r"(?m)^SELECT\b.*$", "", cleaned)
            # Remove lines about "la colonne n'existe pas" etc.
            cleaned = re.sub(
                r"(?m)^.*(colonne|n'existe pas|schema|Vous avez fourni).*$",
                "", cleaned,
            )
            cleaned = cleaned.strip()

            if cleaned:
                return f"Reponds maintenant. Final Answer: {cleaned}"
            else:
                return ("Format incorrect. Ecris UNIQUEMENT: "
                        "Thought: [reflexion]\nFinal Answer: [reponse en francais]")
    return ("Format incorrect. Ecris UNIQUEMENT: "
            "Thought: [reflexion]\nFinal Answer: [reponse en francais]")


# ---------------------------------------------------------------------------
# Ensure DB is populated
# ---------------------------------------------------------------------------

def ensure_db_populated():
    """Check if reference tables exist and are filled. If not, run populate_db."""
    conn = sqlite3.connect(str(_DB_FILE))
    try:
        tables = [r[0] for r in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).fetchall()]

        missing = {"lifecycle", "edge_7x0_specs", "software_compatibility",
                    "upgrade_paths", "mesures_detaillees", "scenarios_migration"} - set(tables)

        if missing:
            print(f"[AUTO] Tables manquantes: {missing}")
            print("[AUTO] Lancement de populate_db.py...")
            from populate_db import main as populate
            populate()
            return

        count = conn.execute("SELECT COUNT(*) FROM scenarios_migration").fetchone()[0]
        if count == 0:
            print("[AUTO] scenarios_migration vide — lancement de populate_db.py...")
            from populate_db import main as populate
            populate()
        else:
            print(f"[OK] Base RAG prete — {count} scenarios, "
                  f"{conn.execute('SELECT COUNT(*) FROM lifecycle').fetchone()[0]} modeles lifecycle, "
                  f"{conn.execute('SELECT COUNT(*) FROM edge_7x0_specs').fetchone()[0]} specs 7x0")
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# LLM + DB factory
# ---------------------------------------------------------------------------

def _create_llm():
    """Create the LLM connection with backslash cleaning.

    Performance tuning:
    - temperature=0 : deterministic, no sampling overhead
    - max_tokens=512 : limite la longueur de reponse (evite les divagations)
    - streaming=False : attend la reponse complete (plus simple a parser)
    """
    base_url = f"http://{IP_SERVEUR}:{PORT_WEBUI}/api"
    return _CleanChatOpenAI(
        base_url=base_url,
        api_key=API_KEY,
        model=MODEL_NAME,
        temperature=0,
        max_tokens=512,
        streaming=False,
        request_timeout=120,
    )


_INCLUDE_TABLES = [
    "parc_actuel", "mesures_detaillees", "scenarios_migration",
    "lifecycle", "edge_7x0_specs", "software_compatibility",
    "upgrade_paths", "catalogue_reference",
]


def _create_db():
    """Create the SQLDatabase connection.

    Performance: include_tables limits schema introspection to only
    the tables the LLM needs, avoiding slow PRAGMA calls on irrelevant tables.
    """
    return SQLDatabase.from_uri(DB_URI, include_tables=_INCLUDE_TABLES)


def _run_export(_input=""):
    """Tool callable by the LLM agent to export fleet data to JSON."""
    try:
        from export_json import export_all
        edges, stats, _ = export_all()
        n = stats["fleet_summary"]["total_devices"]
        cost = stats["migration_summary"]["total_cost_optimized"]
        savings = stats["migration_summary"]["savings"]
        pct = stats["migration_summary"]["savings_percent"]
        return (
            f"Export JSON termine avec succes. "
            f"{n} fichiers individuels dans exports/edges/, "
            f"stats.json et fleet.json crees. "
            f"Cout optimise: {cost}, economies: {savings} ({pct}% vs baseline)."
        )
    except Exception as e:
        return f"Erreur lors de l'export: {e}"


_EXPORT_TOOL = Tool(
    name="export_json",
    func=_run_export,
    description=(
        "Exporte toutes les donnees du parc SD-WAN en fichiers JSON. "
        "Cree un fichier par equipement dans exports/edges/, "
        "un fichier stats.json avec les statistiques globales, "
        "et un fichier fleet.json avec le tableau complet. "
        "Utilise cet outil quand l'utilisateur demande d'exporter, "
        "generer des JSON, ou preparer les donnees pour le site web."
    ),
)


def _create_agent(llm, db, question):
    """Create a fresh agent with dynamic context tailored to this question.

    Performance tuning:
    - max_iterations=4 : la plupart des questions se resolvent en 1-2 iterations.
      8 = le LLM tourne en boucle et perd du temps sur des erreurs repetees.
    - max_execution_time=60 : 2 min c'est trop long, 60s suffit largement.
    """
    dynamic_context = _build_dynamic_context(question)
    full_prefix = SYSTEM_PROMPT + dynamic_context

    return create_sql_agent(
        llm,
        db=db,
        verbose=True,
        agent_type="zero-shot-react-description",
        handle_parsing_errors=_parse_error_handler,
        prefix=full_prefix,
        suffix=SUFFIX_PROMPT,
        input_variables=["input", "agent_scratchpad"],
        extra_tools=[_EXPORT_TOOL],
        max_iterations=4,
        max_execution_time=60,
    )


# ---------------------------------------------------------------------------
# Verbose output parser
# ---------------------------------------------------------------------------

_SQL_ACTION_RE = re.compile(
    r"Action Input:\s*(SELECT\b.+?)(?:\n|$)", re.IGNORECASE | re.DOTALL
)
_SQL_ERROR_RE = re.compile(
    r"(OperationalError|no such column|no such table|syntax error).{0,200}",
    re.IGNORECASE,
)


def _extract_sql_and_errors(verbose_text):
    """Parse verbose chain text to extract executed SQL and any errors."""
    sql_queries = _SQL_ACTION_RE.findall(verbose_text)
    errors = _SQL_ERROR_RE.findall(verbose_text)
    return sql_queries, errors


# ---------------------------------------------------------------------------
# Interactive Q&A with automatic learning
# ---------------------------------------------------------------------------

def interactive_mode(llm, db):
    """Boucle interactive avec apprentissage automatique en arriere-plan."""
    print()
    print("=" * 60)
    print("  SD-WAN Audit — Posez vos questions (quit pour sortir)")
    print("=" * 60)
    print()
    print("  Exemples :")
    print("  - Combien d'equipements sont dans le parc ?")
    print("  - Quels equipements sont en fin de vie ?")
    print("  - Quel modele recommandes-tu pour host-edge840-14 ?")
    print("  - Combien coute la migration totale ?")
    print("  - Quel est le chemin d'upgrade pour la version 4.2.2 ?")
    print("  - Quels sites necessitent un Edge 740 et pourquoi ?")
    print("  - Compare le cout optimise vs tout en Edge 740")
    print()
    print("  Commandes speciales :")
    print("  - export   — Exporter les donnees en JSON pour le site web")
    print("  - memoire  — Afficher les stats de la memoire d'apprentissage")
    print()
    print(f"  [Memoire: {_get_memory_stats()}]")
    print()

    while True:
        try:
            question = input("Question > ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nAu revoir!")
            break

        if not question:
            continue
        if question.lower() in ("quit", "exit", "q"):
            print("Au revoir!")
            break
        if question.lower() in ("memoire", "memory", "stats"):
            print(f"\n  [Memoire: {_get_memory_stats()}]\n")
            continue
        if question.lower() in ("export", "export json", "json"):
            try:
                from export_json import export_all
                print()
                export_all()
                print()
            except Exception as e:
                print(f"Erreur export : {e}\n")
            continue

        categories = _classify_question(question)

        # Create a fresh agent with context tailored to this question
        agent = _create_agent(llm, db, question)

        # Capture verbose output to extract SQL
        log_capture = io.StringIO()
        handler = logging.StreamHandler(log_capture)
        handler.setLevel(logging.DEBUG)
        logger = logging.getLogger("langchain")
        logger.addHandler(handler)

        try:
            response = agent.invoke({"input": question})
            output = response.get("output", "Pas de reponse.")

            # Clean any remaining backslashes in output
            output = _clean_backslashes(output)

            print(f"\n{'='*60}")
            print(output)
            print(f"{'='*60}\n")

            # --- AUTOMATIC LEARNING ---
            verbose_text = log_capture.getvalue()
            sql_queries, sql_errors = _extract_sql_and_errors(verbose_text)

            if output and "Agent stopped" not in output and output != "Pas de reponse.":
                _record_success(question, sql_queries, output, categories)
                print(f"  [Appris — {len(sql_queries)} SQL, categories: {categories}]")

                if len(sql_queries) > 1 and sql_errors:
                    for err_text in sql_errors:
                        _record_error(
                            question,
                            sql_queries[0] if sql_queries else "",
                            err_text,
                            sql_queries[-1] if sql_queries else "",
                            categories,
                        )
                    print(f"  [Erreurs corrigees memorisees: {len(sql_errors)}]")
            else:
                if sql_errors:
                    for err_text in sql_errors:
                        _record_error(
                            question,
                            sql_queries[0] if sql_queries else "",
                            err_text, "", categories,
                        )
                    print("  [Erreur memorisee]")

            print()

        except Exception as e:
            err_msg = str(e)
            err_msg = _clean_backslashes(err_msg)

            marker = "Could not parse LLM output: `"
            if marker in err_msg:
                start = err_msg.index(marker) + len(marker)
                end = err_msg.rfind("`")
                if end > start:
                    extracted = err_msg[start:end]

                    # Clean up the extracted text — remove SQL repeats,
                    # schema explanations, and markdown code blocks
                    cleaned = extracted
                    cleaned = re.sub(r"```[\s\S]*?```", "", cleaned)
                    cleaned = re.sub(r"(?m)^SELECT\b.*$", "", cleaned)
                    cleaned = re.sub(
                        r"(?m)^.*(colonne|n'existe pas|schema|Vous avez fourni|requete SQL).*$",
                        "", cleaned,
                    )
                    # If there's a "Final Answer:" buried in the text, extract it
                    fa = "Final Answer:"
                    if fa in cleaned:
                        cleaned = cleaned[cleaned.index(fa) + len(fa):]
                    cleaned = cleaned.strip()

                    if not cleaned:
                        cleaned = extracted.strip()

                    print(f"\n{'='*60}")
                    print(cleaned)
                    print(f"{'='*60}\n")

                    verbose_text = log_capture.getvalue()
                    sql_queries, _ = _extract_sql_and_errors(verbose_text)
                    _record_success(question, sql_queries, cleaned, categories)
                    print(f"  [Appris (format partiel)]\n")
                    continue

            print(f"Erreur : {err_msg}\n")
            _record_error(question, "", err_msg[:200], "", categories)

        finally:
            logger.removeHandler(handler)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=" * 60)
    print("  SD-WAN VeloCloud — Assistant IA (Ollama)")
    print("  Orange Business x Epitech Hackathon 2026")
    print("=" * 60)
    print()

    # 1. Ensure DB has all data
    ensure_db_populated()
    print()

    # 2. Connect LLM
    base_url = f"http://{IP_SERVEUR}:{PORT_WEBUI}/api"
    print(f"[LLM] Connexion Ollama via Open WebUI : {base_url}")
    print(f"[LLM] Modele : {MODEL_NAME}")

    try:
        llm = _create_llm()
        db = _create_db()
        print("[OK] Agent LLM pret.\n")
    except Exception as e:
        print(f"\n[ERREUR] {e}")
        print()
        print("Verifiez que :")
        print(f"  1. Open WebUI tourne sur http://{IP_SERVEUR}:{PORT_WEBUI}")
        print(f"  2. Ollama est lance avec le modele {MODEL_NAME}")
        print("  3. Le VPN Tailscale est connecte")
        sys.exit(1)

    # 3. Q&A with adaptive learning
    interactive_mode(llm, db)


if __name__ == "__main__":
    main()
