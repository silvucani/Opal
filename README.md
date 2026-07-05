<div align="center">

# 🍊 Opal — SD-WAN Fleet Audit & Migration Optimizer

**Hackathon Orange Business × Epitech — February 2026**

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![LangChain](https://img.shields.io/badge/LangChain-0.1%2B-green.svg)](https://langchain.com/)
[![Tests](https://img.shields.io/badge/tests-55%20passed-brightgreen.svg)](tests/)

*An AI-powered audit tool that reduced SD-WAN replacement costs by 64% through real telemetry analysis.*

[🇫🇷 Français](#-français) · [🇬🇧 English](#-english) · [📁 Structure](#-project-structure) · [🗄️ Database](#️-database--8-tables)

</div>

---

## 🇫🇷 Français

### 🎯 Objectif

Optimiser le remplacement d'un parc de **90 routeurs SD-WAN** (Edge 840 / Edge 680 → Edge 7x0).
Le but est d'analyser la **télémétrie réelle** du réseau pour proposer une architecture cible **économiquement viable** et **techniquement robuste**, plutôt qu'un remplacement "1 pour 1" coûteux.

Un **assistant IA local** (LLM) permet de poser des questions en langage naturel sur le parc, les coûts et la stratégie de migration — 100% confidentiel, zéro donnée dans le cloud.

### 📊 Contexte Business

* **Parc actuel :** 80 sites Edge 840 (End of Life) + 10 sites Edge 680 (End of Sale)
* **Problème :** Un remplacement tout-en-740 coûterait **63 000** (relatif) — sur-dimensionné pour la plupart des sites
* **Solution :** Algorithme de décision basé sur la consommation réelle (Throughput, Tunnels, Flows, SFP)
* **Résultat :** Coût optimisé **22 250** — soit **64% d'économies**

### 📈 Résultats de l'Audit

| Indicateur | Valeur |
|---|---|
| 📦 Équipements audités | 90 |
| 🔴 CRITICAL (EoL dépassé) | 80 sites (Edge 840) |
| 🟠 HIGH (EoS dépassé) | 10 sites (Edge 680) |
| ➡️ Edge 710 recommandés | 71 sites |
| ➡️ Edge 720 recommandés | 15 sites |
| ➡️ Edge 740 recommandés | 4 sites |
| 💰 Coût optimisé | 22 250 |
| 💸 Coût baseline (tout 740) | 63 000 |
| **✅ Économies** | **40 750 (64%)** |

**Pourquoi pas tout en Edge 740 ?** La plupart des sites ont un faible débit — un Edge 710 suffit. On ne recommande un 720/740 que quand les mesures l'exigent :
* **Edge 720** : 2+ ports SFP, tunnels > 50, ou débit > 395 Mbps
* **Edge 740** : tunnels > 400, débit > 2300 Mbps, ou flows/s > 18 000

### 🤖 Assistant IA (LLM Local)

Un LLM local (Ollama) connecté à la base de données permet de poser des questions en français :

```
Question > Combien d'équipements sont dans le parc ?
→ Il y a 90 équipements dans le parc actuel.

Question > Quels sites nécessitent un Edge 740 et pourquoi ?
→ 4 sites : host-edge680-08 (450 tunnels), host-edge840-14 (21000 flows/s)...

Question > Combien coûte la migration totale ?
→ Coût optimisé: 22 250 vs baseline 63 000 = 64% d'économies.

Question > export
→ 90 fichiers JSON créés dans exports/
```

Le LLM ne calcule rien — il interroge la base SQLite pré-remplie et synthétise les résultats.

**Mémoire adaptative** : chaque interaction (succès/erreur) est capturée. Plus on l'utilise, plus il est précis. 🧠

### 🛠️ Architecture & Stack

```
┌─────────────────────────────────────────────────────┐
│                  👤 UTILISATEUR                      │
│             (Jury / Ingénieur réseau)                │
│                Question en français                  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│              🤖 src/llm_agent.py                     │
│             LangChain SQL Agent                      │
│      + Mémoire adaptative (llm_memory.json)          │
└──────┬───────────────────────────────┬───────────────┘
       │                               │
       ▼                               ▼
┌──────────────┐              ┌────────────────────┐
│  🗄️ SQLite   │              │  🧠 LLM Local      │
│  8 tables    │              │  Ollama via         │
│  323 rows    │              │  Open WebUI         │
│              │              │  (OpenAI-compat.)   │
└──────────────┘              └────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│              🌐 frontend/                            │
│         React 19 + Recharts Dashboard                │
│    Vue d'ensemble · Arborescence · Chatbot IA        │
└──────────────────────────────────────────────────────┘
```

**Flux** : Question → LLM génère du SQL → Exécute sur la DB → LLM synthétise → Réponse en français

### 🚀 Installation

```bash
# 1. Cloner le repo
git clone https://github.com/silvucani/Opal.git && cd Opal

# 2. Installer les dépendances Python
pip install -r requirements.txt

# 3. Remplir la base de données depuis l'Excel source
python src/populate_db.py

# 4. Lancer l'assistant IA (CLI)
python src/llm_agent.py

# 5. Lancer les tests (55 tests)
python -m pytest tests/ -v
```

#### 🌐 Dashboard Web (optionnel)

```bash
cd frontend
npm install
npm run dev     # → http://localhost:5173
```

### 🔌 Connexion au LLM

L'agent utilise une API compatible OpenAI. Configurez votre propre instance Ollama :

| Paramètre | Valeur par défaut |
|---|---|
| 🌐 Base URL | `http://localhost:11434/v1` |
| 🖥️ Interface | Open WebUI (Docker) |
| ⚙️ Backend | Ollama |
| 🤖 Modèles recommandés | `qwen2.5-coder:7b` / `mistral-nemo` |
| 📡 Protocole | OpenAI-compatible API |

> **Note :** Le projet a été développé avec un LLM hébergé localement via Tailscale VPN. Remplacez `base_url` dans `src/llm_agent.py` par votre propre endpoint Ollama.

---

## 🇬🇧 English

### 🎯 Objective

Optimize the replacement of a **90-device SD-WAN fleet** (Edge 840 / Edge 680 → Edge 7x0).
The goal is to analyze **real network telemetry** to propose a target architecture that is **cost-effective** and **technically robust**, rather than an expensive "1-for-1" replacement.

A **local AI assistant** (LLM) allows asking questions in natural language about the fleet, costs, and migration strategy — 100% confidential, zero data sent to the cloud.

### 📊 Business Context

* **Current fleet:** 80x Edge 840 (End of Life) + 10x Edge 680 (End of Sale)
* **Problem:** An all-740 replacement would cost **63,000** (relative) — oversized for most sites
* **Solution:** Decision algorithm based on actual usage (Throughput, Tunnels, Flows, SFP ports)
* **Result:** Optimized cost **22,250** — that's **64% savings**

### 📈 Audit Results

| Metric | Value |
|---|---|
| 📦 Devices audited | 90 |
| 🔴 CRITICAL (past EoL) | 80 sites (Edge 840) |
| 🟠 HIGH (past EoS) | 10 sites (Edge 680) |
| ➡️ Edge 710 recommended | 71 sites |
| ➡️ Edge 720 recommended | 15 sites |
| ➡️ Edge 740 recommended | 4 sites |
| 💰 Optimized cost | 22,250 |
| 💸 Baseline (all 740) | 63,000 |
| **✅ Savings** | **40,750 (64%)** |

### 🤖 AI Assistant (Local LLM)

A local LLM (Ollama) connected to the database allows natural language queries:

* *"How many devices in the fleet?"* → 90
* *"Which sites need an Edge 740 and why?"* → 4 sites with technical justification
* *"What's the total migration cost?"* → optimized vs. baseline comparison
* *"Export data to JSON"* → generates files for the web frontend

The LLM computes nothing — it queries the pre-filled SQLite database and synthesizes results.

**Adaptive memory**: every interaction (success/error) is captured. The more you use it, the more accurate it gets. 🧠

### 🚀 Quick Start

```bash
git clone https://github.com/silvucani/Opal.git && cd Opal
pip install -r requirements.txt
python src/populate_db.py     # Fill the database from Excel source
python src/llm_agent.py       # Start the AI assistant (CLI)
python -m pytest tests/ -v    # Run 55 unit tests
```

#### 🌐 Web Dashboard (optional)

```bash
cd frontend && npm install && npm run dev
# Open http://localhost:5173
```

### 🔌 Connecting your own LLM

The agent uses an OpenAI-compatible API endpoint. Replace the `base_url` in `src/llm_agent.py` with your own Ollama or any other compatible LLM server URL.

---

## 📁 Project Structure

```
Opal/
├── 📄 README.md
├── 📄 LICENSE
├── 📄 .gitignore
├── 📄 requirements.txt
│
├── 🐍 src/                            ← Python source code
│   ├── audit_engine.py                ← Audit engine (pure functions, zero side effects)
│   ├── populate_db.py                 ← SQLite population from Excel + reference data
│   ├── export_json.py                 ← JSON export for web frontend
│   └── llm_agent.py                   ← AI assistant (LangChain + Ollama)
│
├── 🧪 tests/                          ← Unit tests
│   └── test_audit_engine.py           ← 55 tests for the audit engine
│
├── 💾 data/                            ← Input data
│   └── data_hackathon_extended.xlsx    ← Fleet inventory + real telemetry measurements
│   (*.db and generated files are gitignored — run populate_db.py to create them)
│
├── 🌐 frontend/                        ← React 19 web dashboard
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       └── OpalDashboard.jsx          ← Full dashboard: overview, network tree, AI chatbot
│
└── 📚 docs/                            ← Reference documents
    ├── SD-WAN edges lifecycle.pdf     ← Official Arista EoS/EoL dates
    ├── VeloCloud-SD-WAN-Edge-7x0-Series.pdf ← Edge 7x0 specs
    ├── edges measured max values.pdf  ← Current fleet measurements
    └── release-notes/                 ← SD-WAN version release notes
```

## 🗄️ Database — 8 Tables

| Table | Content | Rows |
|---|---|---|
| `parc_actuel` | Fleet inventory (90 devices) | 90 |
| `mesures_detaillees` | Throughput, tunnels, flows, ports per device | 90 |
| `scenarios_migration` | Edge 7x0 recommendation + cost + complexity | 90 |
| `lifecycle` | EoS/EoL dates per model (Arista source) | 12 |
| `edge_7x0_specs` | Technical specs Edge 710, 720, 740 | 3 |
| `software_compatibility` | Model/version compatibility matrix | 27 |
| `upgrade_paths` | Step-by-step software upgrade sequences | 5 |
| `catalogue_reference` | Hardware + license relative costs | 6 |

> The database is **not committed** to the repo. Run `python src/populate_db.py` to regenerate it from `data/data_hackathon_extended.xlsx`.

## 🔒 Confidentiality

* **100% local** — no data leaves your machine
* LLM runs on your own hardware via Ollama
* Network infrastructure data is anonymized in this public demo

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

*🍊 Built at the Orange Business × Epitech Hackathon — February 2026*
