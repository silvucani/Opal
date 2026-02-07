"""
Unit tests for SD-WAN Fleet Audit Engine
==========================================
Tests written alongside code — functional approach, no mocks needed (pure functions).
"""

import sys
from pathlib import Path

# Add src/ to path so we can import audit_engine
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

import unittest
from audit_engine import (
    DeviceRecord,
    LifecycleInfo,
    MigrationTarget,
    AuditResult,
    classify_lifecycle,
    determine_target_model,
    determine_bandwidth_tier,
    determine_license_tier,
    compute_upgrade_path,
    compute_cost,
    assess_complexity,
    build_migration_scenario,
    audit_fleet,
    format_summary,
    _normalize_model,
)


def _make_device(
    hostname="test-edge-01",
    model="Edge 840",
    version="4.2.2",
    throughput_mbps=40,
    sfp_ports=1,
    rj45_ports=3,
    tunnels=30,
    flows_per_sec=2000,
    concurrent_flows=50000,
    nat_entries=100000,
):
    """Helper to create DeviceRecord with sensible defaults."""
    return DeviceRecord(
        hostname, model, version, throughput_mbps, sfp_ports,
        rj45_ports, tunnels, flows_per_sec, concurrent_flows, nat_entries,
    )


class TestNormalizeModel(unittest.TestCase):
    def test_already_normalized(self):
        self.assertEqual(_normalize_model("Edge 840"), "Edge 840")

    def test_missing_space(self):
        self.assertEqual(_normalize_model("Edge840"), "Edge 840")

    def test_with_whitespace(self):
        self.assertEqual(_normalize_model("  Edge 680  "), "Edge 680")


class TestClassifyLifecycle(unittest.TestCase):
    def test_edge840_is_critical(self):
        result = classify_lifecycle("Edge 840")
        self.assertEqual(result.urgency, "CRITICAL")
        self.assertEqual(result.eos_date, "09/29/2020")
        self.assertEqual(result.eol_date, "09/29/2025")

    def test_edge680_is_high(self):
        result = classify_lifecycle("Edge 680")
        self.assertEqual(result.urgency, "HIGH")

    def test_edge500_is_critical(self):
        result = classify_lifecycle("Edge 500")
        self.assertEqual(result.urgency, "CRITICAL")

    def test_edge510_is_high(self):
        result = classify_lifecycle("Edge 510")
        self.assertEqual(result.urgency, "HIGH")

    def test_edge1000_is_critical(self):
        result = classify_lifecycle("Edge 1000")
        self.assertEqual(result.urgency, "CRITICAL")

    def test_normalized_input(self):
        result = classify_lifecycle("Edge840")
        self.assertEqual(result.urgency, "CRITICAL")
        self.assertEqual(result.model, "Edge 840")

    def test_unknown_model(self):
        result = classify_lifecycle("Edge 9999")
        self.assertEqual(result.urgency, "MEDIUM")


class TestDetermineTargetModel(unittest.TestCase):
    def test_small_site_gets_710(self):
        device = _make_device(throughput_mbps=40, sfp_ports=1, tunnels=30)
        model, cause = determine_target_model(device)
        self.assertEqual(model, "Edge 710")
        self.assertEqual(cause, "")

    def test_two_sfp_gets_720(self):
        device = _make_device(sfp_ports=2, throughput_mbps=40, tunnels=30)
        model, cause = determine_target_model(device)
        self.assertEqual(model, "Edge 720")
        self.assertIn("SFP", cause)

    def test_high_tunnels_gets_720(self):
        device = _make_device(tunnels=80, sfp_ports=1)
        model, cause = determine_target_model(device)
        self.assertEqual(model, "Edge 720")
        self.assertIn("tunnels", cause)

    def test_very_high_tunnels_gets_740(self):
        device = _make_device(tunnels=450, sfp_ports=2)
        model, cause = determine_target_model(device)
        self.assertEqual(model, "Edge 740")
        self.assertIn("tunnels", cause)

    def test_high_throughput_gets_720(self):
        device = _make_device(throughput_mbps=840, sfp_ports=2)
        model, cause = determine_target_model(device)
        self.assertEqual(model, "Edge 720")

    def test_very_high_throughput_gets_740(self):
        device = _make_device(throughput_mbps=1430, sfp_ports=2, tunnels=60, flows_per_sec=21000)
        model, cause = determine_target_model(device)
        self.assertEqual(model, "Edge 740")

    def test_high_flows_gets_740(self):
        device = _make_device(flows_per_sec=19000, tunnels=80, sfp_ports=2, concurrent_flows=480000)
        model, cause = determine_target_model(device)
        self.assertEqual(model, "Edge 740")
        self.assertIn("flows/s", cause)

    def test_high_nat_gets_740(self):
        device = _make_device(nat_entries=600000, sfp_ports=2)
        model, cause = determine_target_model(device)
        self.assertEqual(model, "Edge 740")
        self.assertIn("NAT entries", cause)

    def test_zero_sfp_low_throughput_gets_710(self):
        device = _make_device(sfp_ports=0, throughput_mbps=5, tunnels=30)
        model, cause = determine_target_model(device)
        self.assertEqual(model, "Edge 710")

    # --- Validate against known expected targets from PDF ---
    def test_host_edge840_01_expected_710(self):
        device = _make_device("host-edge840-01", throughput_mbps=8, sfp_ports=1, tunnels=30)
        model, _ = determine_target_model(device)
        self.assertEqual(model, "Edge 710")

    def test_host_edge840_06_expected_720_sfp(self):
        device = _make_device("host-edge840-06", throughput_mbps=80, sfp_ports=2, tunnels=30)
        model, cause = determine_target_model(device)
        self.assertEqual(model, "Edge 720")
        self.assertIn("SFP", cause)

    def test_host_edge840_14_expected_740(self):
        device = _make_device(
            "host-edge840-14", throughput_mbps=1430, sfp_ports=2,
            tunnels=60, flows_per_sec=21000, concurrent_flows=50000, nat_entries=100000,
        )
        model, _ = determine_target_model(device)
        self.assertEqual(model, "Edge 740")

    def test_host_edge840_15_expected_720_tunnels(self):
        device = _make_device("host-edge840-15", throughput_mbps=88, sfp_ports=1, tunnels=80)
        model, cause = determine_target_model(device)
        self.assertEqual(model, "Edge 720")
        self.assertIn("tunnels", cause)

    def test_host_edge680_08_expected_740(self):
        device = _make_device(
            "host-edge680-08", model="Edge 680", throughput_mbps=589,
            sfp_ports=2, tunnels=450, flows_per_sec=22000,
        )
        model, cause = determine_target_model(device)
        self.assertEqual(model, "Edge 740")

    def test_host_edge680_09_expected_740_nat(self):
        device = _make_device(
            "host-edge680-09", model="Edge 680", throughput_mbps=1284,
            sfp_ports=2, tunnels=30, flows_per_sec=22000, nat_entries=600000,
        )
        model, cause = determine_target_model(device)
        self.assertEqual(model, "Edge 740")


class TestBandwidthTier(unittest.TestCase):
    def test_710_low_throughput(self):
        self.assertEqual(determine_bandwidth_tier("Edge 710", 8), "10M")

    def test_710_medium_throughput(self):
        self.assertEqual(determine_bandwidth_tier("Edge 710", 40), "50M")

    def test_710_100m(self):
        self.assertEqual(determine_bandwidth_tier("Edge 710", 67), "100M")

    def test_710_200m(self):
        self.assertEqual(determine_bandwidth_tier("Edge 710", 109), "200M")

    def test_720_1g(self):
        self.assertEqual(determine_bandwidth_tier("Edge 720", 840), "1G")

    def test_720_500m(self):
        self.assertEqual(determine_bandwidth_tier("Edge 720", 289), "500M")

    def test_740_2g(self):
        self.assertEqual(determine_bandwidth_tier("Edge 740", 1430), "2G")

    def test_740_1g(self):
        self.assertEqual(determine_bandwidth_tier("Edge 740", 589), "1G")

    def test_740_minimum_is_100m(self):
        # Edge 740 starts at 100M, even for low throughput
        self.assertEqual(determine_bandwidth_tier("Edge 740", 10), "100M")

    def test_exact_boundary(self):
        self.assertEqual(determine_bandwidth_tier("Edge 710", 50), "50M")


class TestLicenseTier(unittest.TestCase):
    def test_always_enterprise(self):
        self.assertEqual(determine_license_tier(), "Enterprise")


class TestUpgradePath(unittest.TestCase):
    def test_version_422(self):
        path = compute_upgrade_path("4.2.2")
        self.assertEqual(path, "4.2.2 -> 4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x")

    def test_version_452(self):
        path = compute_upgrade_path("4.5.2")
        self.assertEqual(path, "4.5.2 -> 5.0.x -> 5.4.x -> 6.1.x -> 6.4.x")

    def test_version_50x(self):
        path = compute_upgrade_path("5.0.1")
        self.assertEqual(path, "5.0.x -> 5.4.x -> 6.1.x -> 6.4.x")

    def test_version_54x(self):
        path = compute_upgrade_path("5.4.0")
        self.assertEqual(path, "5.4.x -> 6.1.x -> 6.4.x")

    def test_version_61x(self):
        path = compute_upgrade_path("6.1.2")
        self.assertEqual(path, "6.1.x -> 6.4.x")

    def test_unknown_version(self):
        path = compute_upgrade_path("3.0.0")
        self.assertIn("verify manually", path)


class TestCost(unittest.TestCase):
    def test_710_enterprise(self):
        self.assertEqual(compute_cost("Edge 710", "Enterprise"), 200)

    def test_720_enterprise(self):
        self.assertEqual(compute_cost("Edge 720", "Enterprise"), 350)

    def test_740_enterprise(self):
        self.assertEqual(compute_cost("Edge 740", "Enterprise"), 700)

    def test_710_standard(self):
        self.assertEqual(compute_cost("Edge 710", "Standard"), 150)


class TestComplexity(unittest.TestCase):
    def test_740_is_elevee(self):
        device = _make_device()
        self.assertEqual(assess_complexity(device, "Edge 740"), "Elevee")

    def test_720_is_moyenne(self):
        device = _make_device()
        self.assertEqual(assess_complexity(device, "Edge 720"), "Moyenne")

    def test_710_with_v4_is_moyenne(self):
        device = _make_device(version="4.2.2")
        self.assertEqual(assess_complexity(device, "Edge 710"), "Moyenne")

    def test_710_with_v6_is_faible(self):
        device = _make_device(version="6.1.0")
        self.assertEqual(assess_complexity(device, "Edge 710"), "Faible")


class TestBuildMigrationScenario(unittest.TestCase):
    def test_returns_audit_result(self):
        device = _make_device()
        result = build_migration_scenario(device)
        self.assertIsInstance(result, AuditResult)
        self.assertEqual(result.device, device)
        self.assertEqual(result.lifecycle.urgency, "CRITICAL")
        self.assertEqual(result.target.target_model, "Edge 710")
        self.assertEqual(result.target.license_tier, "Enterprise")

    def test_720_scenario(self):
        device = _make_device(sfp_ports=2, throughput_mbps=80)
        result = build_migration_scenario(device)
        self.assertEqual(result.target.target_model, "Edge 720")
        self.assertIn("SFP", result.target.cause)


class TestAuditFleet(unittest.TestCase):
    def test_processes_all_devices(self):
        devices = tuple(_make_device(hostname=f"host-{i}") for i in range(5))
        results = audit_fleet(devices)
        self.assertEqual(len(results), 5)
        self.assertTrue(all(isinstance(r, AuditResult) for r in results))

    def test_empty_fleet(self):
        results = audit_fleet(())
        self.assertEqual(len(results), 0)


class TestFormatSummary(unittest.TestCase):
    def test_summary_contains_key_info(self):
        devices = tuple(_make_device(hostname=f"host-{i}") for i in range(3))
        results = audit_fleet(devices)
        summary = format_summary(results)
        self.assertIn("Total devices audited: 3", summary)
        self.assertIn("CRITICAL", summary)
        self.assertIn("Edge 710", summary)
        self.assertIn("Savings", summary)


if __name__ == "__main__":
    unittest.main()
