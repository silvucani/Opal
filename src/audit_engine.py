"""
SD-WAN VeloCloud Fleet Audit Engine — Pure Functions
=====================================================
All business logic as pure functions operating on immutable data.
No side effects, no I/O, no database access.
"""

from typing import NamedTuple


# ---------------------------------------------------------------------------
# Immutable data types
# ---------------------------------------------------------------------------

class DeviceRecord(NamedTuple):
    hostname: str
    model: str
    version: str
    throughput_mbps: int
    sfp_ports: int
    rj45_ports: int
    tunnels: int
    flows_per_sec: int
    concurrent_flows: int
    nat_entries: int


class LifecycleInfo(NamedTuple):
    model: str
    eos_date: str
    eol_date: str
    status: str       # e.g. "EoS reached", "Past EoL"
    urgency: str       # CRITICAL / HIGH / MEDIUM / LOW


class MigrationTarget(NamedTuple):
    target_model: str       # Edge 710, Edge 720, Edge 740
    license_tier: str       # Enterprise
    bandwidth_tier: str     # e.g. "50M"
    upgrade_path: str       # e.g. "4.2.2 -> 4.5.2 -> ..."
    cause: str              # why 720/740 was chosen
    cost: int               # relative cost (HW + license)
    complexity: str         # Faible / Moyenne / Elevee


class AuditResult(NamedTuple):
    device: DeviceRecord
    lifecycle: LifecycleInfo
    target: MigrationTarget


# ---------------------------------------------------------------------------
# Lifecycle classification (from Arista official lifecycle PDF)
# ---------------------------------------------------------------------------

_LIFECYCLE_TABLE = {
    "Edge 840":  ("09/29/2020", "09/29/2025", "Past EoL — no vendor support",   "CRITICAL"),
    "Edge 680":  ("07/29/2022", "07/29/2027", "EoS reached — plan replacement", "HIGH"),
    "Edge 640":  ("07/29/2022", "07/29/2027", "EoS reached — plan replacement", "HIGH"),
    "Edge 620":  ("04/01/2025", "04/01/2030", "EoS reached — plan replacement", "HIGH"),
    "Edge 610":  ("08/01/2024", "08/01/2029", "EoS reached — plan replacement", "HIGH"),
    "Edge 510":  ("08/01/2024", "08/01/2029", "EoS reached — plan replacement", "HIGH"),
    "Edge 520":  ("03/25/2021", "03/25/2027", "EoS reached — plan replacement", "HIGH"),
    "Edge 540":  ("03/25/2021", "03/25/2027", "EoS reached — plan replacement", "HIGH"),
    "Edge 500":  ("12/10/2016", "12/10/2021", "Past EoL — no vendor support",   "CRITICAL"),
    "Edge 1000": ("07/16/2017", "07/16/2022", "Past EoL — no vendor support",   "CRITICAL"),
    "Edge 2000": ("08/17/2020", "08/17/2025", "Past EoL — no vendor support",   "CRITICAL"),
}


def classify_lifecycle(model: str) -> LifecycleInfo:
    """Classify a device model into lifecycle urgency tier."""
    normalized = _normalize_model(model)
    if normalized in _LIFECYCLE_TABLE:
        eos, eol, status, urgency = _LIFECYCLE_TABLE[normalized]
        return LifecycleInfo(normalized, eos, eol, status, urgency)
    return LifecycleInfo(normalized, "Unknown", "Unknown", "Unknown model — manual review", "MEDIUM")


def _normalize_model(raw_model: str) -> str:
    """Normalize model strings like 'Edge840' -> 'Edge 840'."""
    cleaned = raw_model.strip()
    # Insert space between 'Edge' and digits if missing
    if cleaned.startswith("Edge") and len(cleaned) > 4 and cleaned[4].isdigit():
        return f"Edge {cleaned[4:]}"
    return cleaned


# ---------------------------------------------------------------------------
# Hardware sizing (from Edge 7x0 datasheet specs)
# ---------------------------------------------------------------------------

# Edge 7x0 performance ceilings (from datasheet)
_EDGE_710_LIMITS = {
    "max_throughput_imix": 395,      # Mb/s routed IMIX
    "max_tunnels": 50,
    "max_flows_per_sec": 4000,
    "max_concurrent_flows": 225_000,
    "max_nat_entries": 225_000,
    "max_sfp_ports": 1,              # 1x 1G SFP
}

_EDGE_720_LIMITS = {
    "max_throughput_imix": 2300,     # Mb/s routed IMIX
    "max_tunnels": 400,
    "max_flows_per_sec": 18_000,
    "max_concurrent_flows": 440_000,
    "max_nat_entries": 440_000,
    "max_sfp_ports": 2,              # 2x 1G/10G SFP+
}

_EDGE_740_LIMITS = {
    "max_throughput_imix": 3500,     # Mb/s routed IMIX
    "max_tunnels": 800,
    "max_flows_per_sec": 26_000,
    "max_concurrent_flows": 900_000,
    "max_nat_entries": 900_000,
    "max_sfp_ports": 2,              # 2x 1G/10G SFP+
}


def determine_target_model(device: DeviceRecord) -> tuple:
    """
    Determine the smallest Edge 7x0 model that fits the device's measured data.
    Returns (model_name, cause_string).
    """
    causes = []

    # Check if Edge 740 is required
    needs_740 = False
    if device.tunnels > _EDGE_720_LIMITS["max_tunnels"]:
        needs_740 = True
        causes.append("tunnels")
    if device.flows_per_sec > _EDGE_720_LIMITS["max_flows_per_sec"]:
        needs_740 = True
        causes.append("flows/s")
    if device.throughput_mbps > _EDGE_720_LIMITS["max_throughput_imix"]:
        needs_740 = True
        causes.append("IMIX throughput")
    if device.concurrent_flows > _EDGE_720_LIMITS["max_concurrent_flows"]:
        needs_740 = True
        causes.append("concurrent flows")
    if device.nat_entries > _EDGE_720_LIMITS["max_nat_entries"]:
        needs_740 = True
        causes.append("NAT entries")

    if needs_740:
        return ("Edge 740", " + ".join(causes))

    # Check if Edge 720 is required
    needs_720 = False
    # NOTE BUG 2 (audit) : Edge 840-53 et 840-54 ont 2 SFP mais faible debit
    # (24/22 Mbps). Le PDF expert suggerait Edge 710 30M (recablage RJ45 possible).
    # On conserve la regle stricte 2 SFP → Edge 720 car :
    #   - Le recablage SFP→RJ45 n'est pas garanti sur tous les sites
    #   - Edge 720 offre une marge de securite pour l'evolutivite
    #   - Difference de cout faible (350 vs 200 par equipement, 2 sites seulement)
    if device.sfp_ports >= 2:
        needs_720 = True
        causes.append("SFP")
    if device.tunnels > _EDGE_710_LIMITS["max_tunnels"]:
        needs_720 = True
        causes.append("tunnels")
    if device.flows_per_sec > _EDGE_710_LIMITS["max_flows_per_sec"]:
        needs_720 = True
        causes.append("flows/s")
    if device.throughput_mbps > _EDGE_710_LIMITS["max_throughput_imix"]:
        needs_720 = True
        causes.append("IMIX throughput")
    if device.concurrent_flows > _EDGE_710_LIMITS["max_concurrent_flows"]:
        needs_720 = True
        causes.append("concurrent flows")
    if device.nat_entries > _EDGE_710_LIMITS["max_nat_entries"]:
        needs_720 = True
        causes.append("NAT entries")

    if needs_720:
        return ("Edge 720", " + ".join(causes))

    return ("Edge 710", "")


# ---------------------------------------------------------------------------
# Bandwidth tier selection (from 7x0 datasheet)
# ---------------------------------------------------------------------------

_BANDWIDTH_TIERS_710 = (10, 30, 50, 100, 200, 500)
_BANDWIDTH_TIERS_720 = (10, 30, 50, 100, 200, 500, 1000, 2000, 10000)
_BANDWIDTH_TIERS_740 = (100, 200, 500, 1000, 2000, 10000)

_BW_TIERS_BY_MODEL = {
    "Edge 710": _BANDWIDTH_TIERS_710,
    "Edge 720": _BANDWIDTH_TIERS_720,
    "Edge 740": _BANDWIDTH_TIERS_740,
}

_TIER_LABELS = {
    10: "10M", 30: "30M", 50: "50M", 100: "100M", 200: "200M",
    500: "500M", 1000: "1G", 2000: "2G", 10000: "10G",
}


def determine_bandwidth_tier(target_model: str, throughput_mbps: int) -> str:
    """Select the smallest bandwidth tier that covers the measured throughput."""
    tiers = _BW_TIERS_BY_MODEL.get(target_model, _BANDWIDTH_TIERS_710)
    for tier in tiers:
        if tier >= throughput_mbps:
            return _TIER_LABELS[tier]
    # If throughput exceeds all tiers, return the highest
    return _TIER_LABELS[tiers[-1]]


# ---------------------------------------------------------------------------
# License tier
# ---------------------------------------------------------------------------

def determine_license_tier() -> str:
    """
    Determine the license tier for this fleet.
    Client uses Dynamic Branch-to-Branch + Enhanced Firewall → Enterprise minimum.
    Enterprise includes Dynamic B2B. Enhanced Firewall is add-on on Enterprise.
    We recommend Enterprise (not Premium) since client doesn't use Gateway-to-SaaS.
    """
    return "Enterprise"


# ---------------------------------------------------------------------------
# Software upgrade path
# ---------------------------------------------------------------------------
#
# Sources (Release Notes officielles) :
#   - RN 5.2.3 : "An Edge can be upgraded directly to Release 5.2.3
#                  from any Release 4.x or later"
#   - RN 6.4.0 : "An Edge can be upgraded directly to Release 6.4.0
#                  from Release 4.5.x or later"
#
# Chemin conservateur via jalons LTS pour la fiabilité :
#   4.2.2 → 5.2.3 (LTS) → 6.1.x (LTS) → 6.4.x   (3 sauts)

_UPGRADE_PATHS = {
    "4.2.2": "4.2.2 -> 5.2.3 (LTS) -> 6.1.x (LTS) -> 6.4.x",
    "4.5":   "4.5.x -> 5.2.3 (LTS) -> 6.1.x (LTS) -> 6.4.x",
    "5.0":   "5.0.x -> 6.4.x",            # direct (RN 6.4.0 : 4.5+ accepte)
    "5.2":   "5.2.x -> 6.4.x",            # direct
    "5.4":   "5.4.x -> 6.4.x",            # direct
    "6.0":   "6.0.x -> 6.4.x",            # direct
    "6.1":   "6.1.x -> 6.4.x",            # direct
}

# ---------------------------------------------------------------------------
# BUG 3 fix — Version logicielle max par modele legacy
# ---------------------------------------------------------------------------
# Edge 840 est EoL depuis 09/2025 : ne supporte PAS au-dela de 5.2.x
# Edge 680 est EoS : supporte jusqu'a 6.1.x max (6.4.x = Non dans la matrice)
# Le sujet dit : "Priorite aux upgrades SW car rapides des signature du contrat.
#                 Remplacement HW dans un second temps."
# Donc : upgrade SW temporaire au max du modele → puis remplacement HW Edge 7x0

_MODEL_SW_CEILING = {
    "Edge 840":  "5.2.x",
    "Edge 500":  "5.2.x",
    "Edge 1000": "5.2.x",
    "Edge 2000": "5.2.x",
    "Edge 680":  "6.1.x",
    "Edge 640":  "6.1.x",
    "Edge 620":  "6.1.x",
    "Edge 610":  "6.1.x",
    "Edge 510":  "6.1.x",
    "Edge 520":  "6.1.x",
    "Edge 540":  "6.1.x",
}


def compute_upgrade_path(current_version: str, model: str = "") -> str:
    """Compute the stepped upgrade path from current version.

    Takes into account hardware limitations per model:
    - Edge 840/500/1000/2000 : max 5.2.x → then HW replacement by Edge 7x0 on 6.4.x
    - Edge 680/640/6xx/5xx   : max 6.1.x → then HW replacement by Edge 7x0 on 6.4.x
    - Edge 7x0 / unknown     : full path to 6.4.x (no ceiling)
    """
    normalized = _normalize_model(model) if model else ""
    ceiling = _MODEL_SW_CEILING.get(normalized)

    if ceiling == "5.2.x":
        # Models capped at 5.2.x (Edge 840, 500, 1000, 2000)
        if current_version.startswith("4."):
            return (f"{current_version} -> 5.2.3 (LTS, max {normalized})"
                    f" -> remplacement HW Edge 7x0 en 6.4.x")
        if current_version.startswith("5.0"):
            return (f"5.0.x -> 5.2.3 (LTS, max {normalized})"
                    f" -> remplacement HW Edge 7x0 en 6.4.x")
        return (f"{current_version} (deja au max {normalized})"
                f" -> remplacement HW Edge 7x0 en 6.4.x")

    if ceiling == "6.1.x":
        # Models capped at 6.1.x (Edge 680, 640, 6xx, 5xx)
        if current_version.startswith("4."):
            return (f"{current_version} -> 5.2.3 (LTS) -> 6.1.x (LTS, max {normalized})"
                    f" -> remplacement HW Edge 7x0 en 6.4.x")
        if current_version.startswith("5."):
            return (f"{current_version} -> 6.1.x (LTS, max {normalized})"
                    f" -> remplacement HW Edge 7x0 en 6.4.x")
        return (f"{current_version} (deja au max {normalized})"
                f" -> remplacement HW Edge 7x0 en 6.4.x")

    # No ceiling — model supports 6.4.x (Edge 7x0, or no model specified)
    if current_version in _UPGRADE_PATHS:
        return _UPGRADE_PATHS[current_version]
    parts = current_version.split(".")
    if len(parts) >= 2:
        prefix = f"{parts[0]}.{parts[1]}"
        if prefix in _UPGRADE_PATHS:
            return _UPGRADE_PATHS[prefix]
    return f"{current_version} -> 6.4.x (chemin a verifier manuellement)"


# ---------------------------------------------------------------------------
# Cost computation
# ---------------------------------------------------------------------------

_HW_COST = {"Edge 710": 100, "Edge 720": 250, "Edge 740": 600}
_LICENSE_COST = {"Standard": 50, "Enterprise": 100, "Premium": 150}


def compute_cost(target_model: str, license_tier: str) -> int:
    """Compute relative cost = hardware + license."""
    hw = _HW_COST.get(target_model, 0)
    lic = _LICENSE_COST.get(license_tier, 0)
    return hw + lic


# ---------------------------------------------------------------------------
# Complexity assessment
# ---------------------------------------------------------------------------

def assess_complexity(device: DeviceRecord, target_model: str) -> str:
    """Assess migration complexity based on device characteristics."""
    if target_model == "Edge 740":
        return "Elevee"
    if target_model == "Edge 720":
        return "Moyenne"
    # Edge 710 with version 4.x requires multi-step upgrade
    if device.version.startswith("4."):
        return "Moyenne"
    return "Faible"


# ---------------------------------------------------------------------------
# Full pipeline — compose all pure functions
# ---------------------------------------------------------------------------

def build_migration_scenario(device: DeviceRecord) -> AuditResult:
    """Build a complete audit result for a single device."""
    lifecycle = classify_lifecycle(device.model)
    target_model, cause = determine_target_model(device)
    bw_tier = determine_bandwidth_tier(target_model, device.throughput_mbps)
    license_tier = determine_license_tier()
    upgrade_path = compute_upgrade_path(device.version, device.model)
    cost = compute_cost(target_model, license_tier)
    complexity = assess_complexity(device, target_model)

    target = MigrationTarget(
        target_model=target_model,
        license_tier=license_tier,
        bandwidth_tier=bw_tier,
        upgrade_path=upgrade_path,
        cause=cause,
        cost=cost,
        complexity=complexity,
    )
    return AuditResult(device=device, lifecycle=lifecycle, target=target)


def audit_fleet(devices: tuple) -> tuple:
    """Run the full audit pipeline on all devices. Returns tuple of AuditResults."""
    return tuple(build_migration_scenario(d) for d in devices)


# ---------------------------------------------------------------------------
# Reporting helpers (pure — return strings, no I/O)
# ---------------------------------------------------------------------------

def format_summary(results: tuple) -> str:
    """Generate an executive summary string."""
    total = len(results)
    urgency_counts = {}
    model_counts = {}
    total_cost_optimized = 0
    total_cost_baseline = 0  # all Edge 740 Enterprise

    for r in results:
        urgency_counts[r.lifecycle.urgency] = urgency_counts.get(r.lifecycle.urgency, 0) + 1
        model_counts[r.target.target_model] = model_counts.get(r.target.target_model, 0) + 1
        total_cost_optimized += r.target.cost
        total_cost_baseline += compute_cost("Edge 740", "Enterprise")

    savings = total_cost_baseline - total_cost_optimized

    lines = [
        "=" * 70,
        "EXECUTIVE SUMMARY — SD-WAN Fleet Audit",
        "=" * 70,
        f"Total devices audited: {total}",
        "",
        "Urgency classification:",
    ]
    for urg in ("CRITICAL", "HIGH", "MEDIUM", "LOW"):
        count = urgency_counts.get(urg, 0)
        if count > 0:
            lines.append(f"  {urg}: {count} devices")

    lines.append("")
    lines.append("Recommended target models:")
    for model in ("Edge 710", "Edge 720", "Edge 740"):
        count = model_counts.get(model, 0)
        if count > 0:
            lines.append(f"  {model}: {count} devices")

    lines.extend([
        "",
        f"Optimized total cost (relative): {total_cost_optimized}",
        f"Baseline cost (all Edge 740 Enterprise): {total_cost_baseline}",
        f"Savings vs baseline: {savings} ({savings * 100 // total_cost_baseline}%)",
        "",
        "Software migration:",
        "  Phase 0: Upgrade VCO (Orchestrator) to 6.4.x",
        "  Phase 1: Upgrade VCG (Gateways) to 6.4.x",
        "  Phase 2: Edge 840 — upgrade SW a 5.2.3 (max) puis remplacement HW par Edge 7x0",
        "  Phase 3: Edge 680 — upgrade SW a 6.1.x (max) puis remplacement HW par Edge 7x0",
        "  Phase 4: Edge 7x0 — deployes directement en 6.4.x",
        "=" * 70,
    ])
    return "\n".join(lines)


def format_detail_table(results: tuple) -> str:
    """Generate a per-device detail table string."""
    header = (
        f"{'#':<4} {'Hostname':<22} {'Model':<12} {'Version':<10} "
        f"{'Urgency':<10} {'Target':<10} {'License':<12} {'BW Tier':<8} "
        f"{'Cost':<6} {'Complexity':<10} {'Cause'}"
    )
    sep = "-" * len(header)
    lines = [sep, header, sep]

    for i, r in enumerate(sorted(results, key=lambda x: x.device.hostname), 1):
        lines.append(
            f"{i:<4} {r.device.hostname:<22} {r.device.model:<12} {r.device.version:<10} "
            f"{r.lifecycle.urgency:<10} {r.target.target_model:<10} {r.target.license_tier:<12} "
            f"{r.target.bandwidth_tier:<8} {r.target.cost:<6} {r.target.complexity:<10} "
            f"{r.target.cause}"
        )

    lines.append(sep)
    return "\n".join(lines)
