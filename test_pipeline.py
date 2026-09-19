"""
Automated Verification Suite for SwachhRoute AI
Tests:
1. Ingestion of citizen reports and AI hazard extraction
2. DBSCAN spatial clustering and polygon generation
3. Google OR-Tools CVRP route optimization with capacity limits
4. Driver manifest generation and policy insights
"""

from app.main import app, STATE, startup_event
from app.models import ReportCreate
from app.nlp_service import extract_hazard_info, generate_driver_briefing, generate_policy_insight
from app.clustering import cluster_waste_reports
from app.router import optimize_collection_routes

def test_nlp_extraction():
    # Test biomedical complaint
    bio_res = extract_hazard_info("Used syringes and blood vials thrown behind pathology clinic")
    assert bio_res["hazard_class"] == "Biomedical Hazardous"
    assert bio_res["severity_score"] >= 8

    # Test organic mandi complaint
    veg_res = extract_hazard_info("Sabzi mandi rotten cabbage and tomatoes dumped on footpath")
    assert "Organic" in veg_res["hazard_class"]
    assert veg_res["severity_score"] >= 6

    # Test construction malba
    malba_res = extract_hazard_info("Contractor dumped cement concrete malba on corner plot")
    assert malba_res["hazard_class"] == "Construction Debris"

def test_dbscan_clustering():
    startup_event()
    reports = STATE["reports"]
    assert len(reports) >= 40

    clusters, updated_reports = cluster_waste_reports(reports)
    assert len(clusters) >= 4, f"Expected at least 4 clusters, got {len(clusters)}"

    for c in clusters:
        assert c.report_count >= 3
        assert len(c.polygon) >= 3
        assert c.estimated_tonnage_kg > 0
        assert 1.0 <= c.severity_score <= 10.0

def test_cvrp_optimization():
    startup_event()
    clusters, _ = cluster_waste_reports(STATE["reports"])
    opt = optimize_collection_routes(clusters)

    assert opt.total_distance_km > 0
    assert opt.fuel_saved_litres >= 0
    assert opt.cost_saved_inr >= 0
    assert len(opt.routes) == 3

    # Verify no truck exceeded its capacity
    for route in opt.routes:
        assert route.total_tonnage_kg <= route.capacity_kg, (
            f"Truck {route.vehicle_name} exceeded capacity! "
            f"Load: {route.total_tonnage_kg}, Max: {route.capacity_kg}"
        )

def test_driver_manifest():
    briefing = generate_driver_briefing(
        "Compactor MH-12-Q-4481",
        [
            {"stop_name": "Hotspot #1", "demand_kg": 800, "severity_score": 9},
            {"stop_name": "Hotspot #2", "demand_kg": 600, "severity_score": 5}
        ]
    )
    assert "चालक" in briefing["vernacular_instructions"]
    assert len(briefing["safety_alerts"]) > 0

def test_policy_insight():
    insight = generate_policy_insight(1, "Hotspot #1 (Organic)", 8, "Organic Wet Waste")
    assert "vendor" in insight["diagnosed_root_cause"].lower()
    assert len(insight["preventative_policy_recommendation"]) > 10

if __name__ == "__main__":
    print("Running SwachhRoute AI Automated Test Suite...")
    test_nlp_extraction()
    print("✅ test_nlp_extraction passed")
    test_dbscan_clustering()
    print("✅ test_dbscan_clustering passed")
    test_cvrp_optimization()
    print("✅ test_cvrp_optimization passed")
    test_driver_manifest()
    print("✅ test_driver_manifest passed")
    test_policy_insight()
    print("✅ test_policy_insight passed")
    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY! Ready for deployment.")
