"""
SD-WAN Fleet — Export JSON pour le frontend web
=================================================
Lit la base SQLite et exporte :
  - exports/edges/<hostname>.json  — un fichier par equipement (arborescence)
  - exports/stats.json             — statistiques globales du parc
  - exports/fleet.json             — tableau complet de tous les equipements

Peut etre lance en standalone ou appele depuis llm_agent.py via export_all().
"""

import json
import sqlite3
from pathlib import Path

_SCRIPT_DIR = Path(__file__).parent            # src/
_PROJECT_ROOT = _SCRIPT_DIR.parent             # project root
_DB_FILE = _PROJECT_ROOT / "data" / "hackathon_sdwan_v2.db"
_EXPORT_DIR = _PROJECT_ROOT / "exports"
_EDGES_DIR = _EXPORT_DIR / "edges"


def _connect():
    """Open a read-only connection to the DB."""
    return sqlite3.connect(str(_DB_FILE))


def _row_to_dict(cursor, row):
    """Convert a sqlite3 row to a dict using column names."""
    return {col[0]: row[i] for i, col in enumerate(cursor.description)}


def _query_all(conn, sql):
    """Execute a query and return all rows as list of dicts."""
    cursor = conn.execute(sql)
    return [_row_to_dict(cursor, row) for row in cursor.fetchall()]


def _normalize_model(raw_model):
    """Normalize model strings like 'Edge680' -> 'Edge 680'."""
    cleaned = str(raw_model).strip()
    if cleaned.startswith("Edge") and len(cleaned) > 4 and cleaned[4].isdigit():
        return f"Edge {cleaned[4:]}"
    return cleaned


def _build_edge_record(parc_row, mesure_row, scenario_row, lifecycle_row):
    """Build a complete edge JSON record from joined data.

    Prefers mesures_detaillees for model/version (more reliable than parc_actuel
    which may have stale data from the original DB import).
    """
    # Model: prefer mesures_detaillees over parc_actuel
    raw_model = (
        mesure_row.get("modele", "") if mesure_row
        else parc_row.get("modele_actuel", "")
    )
    model = _normalize_model(raw_model)
    # Version: prefer mesures_detaillees over parc_actuel
    version = (
        mesure_row.get("version", "") if mesure_row
        else parc_row.get("version_logicielle", "")
    )
    return {
        "hostname": parc_row.get("nom_hote", ""),
        "name": parc_row.get("nom_hote", ""),
        "model": model,
        "reference": model,
        "version": version,
        "lifecycle": {
            "urgency": lifecycle_row.get("urgence", "UNKNOWN") if lifecycle_row else "UNKNOWN",
            "status": lifecycle_row.get("statut", "") if lifecycle_row else "",
            "eos_date": lifecycle_row.get("date_fin_vente", "") if lifecycle_row else "",
            "eol_date": lifecycle_row.get("date_fin_support", "") if lifecycle_row else "",
            "is_eos": True,
            "is_eol": (lifecycle_row.get("urgence", "") == "CRITICAL") if lifecycle_row else False,
        },
        "measured": {
            "throughput_mbps": mesure_row.get("debit_max_mbps", 0) if mesure_row else parc_row.get("debit_max_mesure", 0),
            "tunnels": mesure_row.get("max_tunnels", 0) if mesure_row else parc_row.get("nb_tunnels_max", 0),
            "flows_per_sec": mesure_row.get("max_flows_par_sec", 0) if mesure_row else 0,
            "concurrent_flows": mesure_row.get("max_flux_concurrents", 0) if mesure_row else 0,
            "nat_entries": mesure_row.get("max_entrees_nat", 0) if mesure_row else 0,
            "sfp_ports": mesure_row.get("ports_sfp_utilises", 0) if mesure_row else parc_row.get("nb_ports_sfp_utilises", 0),
            "rj45_ports": mesure_row.get("ports_rj45_utilises", 0) if mesure_row else 0,
        },
        "migration": {
            "target_model": scenario_row.get("nouveau_modele_suggere", "") if scenario_row else "",
            "license": scenario_row.get("nouvelle_licence_suggeree", "") if scenario_row else "",
            "upgrade_path": scenario_row.get("chemin_migration_logicielle", "") if scenario_row else "",
            "cost": scenario_row.get("cout_total_estime", 0) if scenario_row else 0,
            "complexity": scenario_row.get("complexite_intervention", "") if scenario_row else "",
        },
    }


def export_edges(conn):
    """Export one JSON file per edge device into exports/edges/."""
    _EDGES_DIR.mkdir(parents=True, exist_ok=True)

    parc = {r["nom_hote"]: r for r in _query_all(conn, "SELECT * FROM parc_actuel")}
    mesures = {r["nom_hote"]: r for r in _query_all(conn, "SELECT * FROM mesures_detaillees")}
    scenarios = {r["nom_hote"]: r for r in _query_all(conn, "SELECT * FROM scenarios_migration")}
    lifecycles = {r["modele"]: r for r in _query_all(conn, "SELECT * FROM lifecycle")}

    edges = []
    for hostname, parc_row in sorted(parc.items()):
        mesure_row = mesures.get(hostname)
        scenario_row = scenarios.get(hostname)
        # Use mesures_detaillees model (more accurate), normalized for lifecycle lookup
        raw_model = (
            mesure_row.get("modele", "") if mesure_row
            else parc_row.get("modele_actuel", "")
        )
        model = _normalize_model(raw_model)
        lifecycle_row = lifecycles.get(model)

        record = _build_edge_record(parc_row, mesure_row, scenario_row, lifecycle_row)
        edges.append(record)

        # Write individual file
        filepath = _EDGES_DIR / f"{hostname}.json"
        filepath.write_text(
            json.dumps(record, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    return edges


def export_stats(conn, edges):
    """Export global statistics into exports/stats.json."""
    _EXPORT_DIR.mkdir(parents=True, exist_ok=True)

    # Model distribution (current)
    current_models = {}
    for e in edges:
        m = e["model"]
        current_models[m] = current_models.get(m, 0) + 1

    # Lifecycle urgency
    urgency_counts = {}
    for e in edges:
        u = e["lifecycle"]["urgency"]
        urgency_counts[u] = urgency_counts.get(u, 0) + 1

    # Target model distribution
    target_models = {}
    for e in edges:
        t = e["migration"]["target_model"]
        if t:
            target_models[t] = target_models.get(t, 0) + 1

    # Costs
    total_optimized = sum(e["migration"]["cost"] for e in edges)
    total_baseline = len(edges) * 700  # all Edge 740 Enterprise = 600 + 100
    savings = total_baseline - total_optimized
    savings_pct = round(savings * 100 / total_baseline) if total_baseline > 0 else 0

    # Complexity
    complexity_counts = {}
    for e in edges:
        c = e["migration"]["complexity"]
        if c:
            complexity_counts[c] = complexity_counts.get(c, 0) + 1

    # Version distribution
    version_counts = {}
    for e in edges:
        v = e["version"]
        version_counts[v] = version_counts.get(v, 0) + 1

    # Lifecycle details from DB
    lifecycle_data = _query_all(conn, "SELECT * FROM lifecycle")

    # Edge 7x0 specs from DB
    specs_data = _query_all(conn, "SELECT * FROM edge_7x0_specs")

    # Upgrade paths from DB
    upgrade_data = _query_all(conn, "SELECT * FROM upgrade_paths")

    # Catalogue
    catalogue_data = _query_all(conn, "SELECT * FROM catalogue_reference")

    stats = {
        "fleet_summary": {
            "total_devices": len(edges),
            "current_models": current_models,
            "versions": version_counts,
        },
        "lifecycle_summary": {
            "urgency_distribution": urgency_counts,
            "details": lifecycle_data,
        },
        "migration_summary": {
            "target_models": target_models,
            "total_cost_optimized": total_optimized,
            "total_cost_baseline_all_740": total_baseline,
            "savings": savings,
            "savings_percent": savings_pct,
            "complexity_distribution": complexity_counts,
        },
        "reference_data": {
            "edge_7x0_specs": specs_data,
            "upgrade_paths": upgrade_data,
            "catalogue": catalogue_data,
        },
    }

    filepath = _EXPORT_DIR / "stats.json"
    filepath.write_text(
        json.dumps(stats, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return stats


def export_fleet(edges):
    """Export the full fleet as a single JSON array into exports/fleet.json."""
    _EXPORT_DIR.mkdir(parents=True, exist_ok=True)

    filepath = _EXPORT_DIR / "fleet.json"
    filepath.write_text(
        json.dumps(edges, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return filepath


def export_all():
    """Run the full export pipeline. Returns (edges, stats, fleet_path)."""
    conn = _connect()
    try:
        print("[EXPORT] Lecture de la base de donnees...")
        edges = export_edges(conn)
        print(f"[EXPORT] {len(edges)} fichiers JSON crees dans exports/edges/")

        stats = export_stats(conn, edges)
        print(f"[EXPORT] stats.json cree — {stats['fleet_summary']['total_devices']} devices")
        print(f"         Cout optimise: {stats['migration_summary']['total_cost_optimized']}")
        print(f"         Cout baseline: {stats['migration_summary']['total_cost_baseline_all_740']}")
        print(f"         Economies: {stats['migration_summary']['savings']} ({stats['migration_summary']['savings_percent']}%)")

        fleet_path = export_fleet(edges)
        print(f"[EXPORT] fleet.json cree — tableau complet")

        print(f"\n[OK] Export termine dans {_EXPORT_DIR}/")
        print(f"     exports/edges/     — {len(edges)} fichiers (1 par equipement)")
        print(f"     exports/stats.json — statistiques globales")
        print(f"     exports/fleet.json — tableau complet")

        return edges, stats, fleet_path
    finally:
        conn.close()


def main():
    """Standalone entry point."""
    print("=" * 60)
    print("  SD-WAN Fleet — Export JSON")
    print("=" * 60)
    print()
    export_all()


if __name__ == "__main__":
    main()
