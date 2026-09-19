"""
FastAPI Server for SwachhRoute AI
Problem Statement CS11 - NeuraMorphix HackForge 2026
Team: Stackverse-labs
"""

import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.config import (
    WARD_NAME,
    CITY_CENTER,
    DEPOT_LOCATION,
    DISPOSAL_FACILITY,
    DEFAULT_FLEET
)
from app.models import (
    Report,
    ReportCreate,
    HotspotCluster,
    OptimizationResponse,
    DriverManifest,
    PolicyInsight
)
from app.nlp_service import (
    extract_hazard_info,
    generate_driver_briefing,
    generate_policy_insight
)
from app.clustering import cluster_waste_reports
from app.router import optimize_collection_routes
from app.seed_data import generate_seed_reports

# Initialize FastAPI Application
app = FastAPI(
    title="SwachhRoute AI Engine",
    description="Autonomous Geospatial Hotspot Clustering & Dynamic Fleet Route Optimizer",
    version="1.0.0"
)

# Enable CORS for seamless local and multi-origin interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory State Store (Session State)
STATE: Dict[str, Any] = {
    "reports": [],
    "clusters": [],
    "last_optimization": None,
    "fleet": DEFAULT_FLEET
}

@app.on_event("startup")
def startup_event():
    """Initializes the database with realistic seed data on server launch."""
    print("🚀 Initializing SwachhRoute AI with Pune Ward 12 seed dataset...")
    STATE["reports"] = generate_seed_reports()
    # Run initial clustering on startup
    clusters, updated_reports = cluster_waste_reports(STATE["reports"])
    STATE["clusters"] = clusters
    STATE["reports"] = updated_reports
    print(f"✅ Loaded {len(STATE['reports'])} reports across {len(STATE['clusters'])} spatial clusters.")

# API Endpoints
@app.get("/api/health")
def health_check():
    """Returns system status, active counts, and hardware telemetry."""
    return {
        "status": "online",
        "ward": WARD_NAME,
        "center": CITY_CENTER,
        "active_reports": len(STATE["reports"]),
        "detected_hotspots": len(STATE["clusters"]),
        "fleet_vehicles_available": len(STATE["fleet"]),
        "local_ai_model": "Meta Llama 3.2 3B Instruct (Ollama)",
        "compliance": "DPDP Act 2023 On-Premise Sovereign Execution"
    }

@app.get("/api/reports", response_model=List[Report])
def get_all_reports():
    """Returns all active crowdsourced citizen waste reports."""
    return STATE["reports"]

@app.post("/api/reports", response_model=Report)
def submit_new_report(report_in: ReportCreate):
    """
    Ingests a live citizen complaint, parses hazard severity using local Llama 3.2 3B,
    and appends it to the spatial database.
    """
    ai_meta = extract_hazard_info(report_in.text)
    new_id = f"REP_{len(STATE['reports']) + 101}"

    new_report = Report(
        id=new_id,
        text=report_in.text,
        lat=round(report_in.lat, 6),
        lng=round(report_in.lng, 6),
        image_url=report_in.image_url or "/static/assets/sample_1.jpg",
        citizen_name=report_in.citizen_name or "Live Citizen Reporter",
        ward=report_in.ward or "Ward 12",
        timestamp="Just Now (Live Report)",
        hazard_class=ai_meta["hazard_class"],
        severity_score=ai_meta["severity_score"],
        machinery_needed=ai_meta["machinery_needed"],
        urgency=ai_meta["urgency"],
        is_resolved=False,
        cluster_id=None
    )

    STATE["reports"].insert(0, new_report)

    # Re-run spatial clustering to immediately reflect the new complaint
    clusters, updated_reports = cluster_waste_reports(STATE["reports"])
    STATE["clusters"] = clusters
    STATE["reports"] = updated_reports

    return new_report

@app.post("/api/cluster", response_model=List[HotspotCluster])
def trigger_clustering():
    """
    Executes DBSCAN spatial density clustering over all active reports
    and calculates bounding convex hull polygons.
    """
    clusters, updated_reports = cluster_waste_reports(STATE["reports"])
    STATE["clusters"] = clusters
    STATE["reports"] = updated_reports
    return STATE["clusters"]

@app.post("/api/optimize-routes", response_model=OptimizationResponse)
def trigger_route_optimization(fleet_payload: Optional[List[Dict[str, Any]]] = None):
    """
    Executes Google OR-Tools CVRP solver to generate optimal, capacity-constrained
    collection paths for municipal trucks.
    """
    active_fleet = fleet_payload if fleet_payload else STATE["fleet"]
    opt_result = optimize_collection_routes(STATE["clusters"], active_fleet)
    STATE["last_optimization"] = opt_result
    return opt_result

@app.get("/api/driver-manifest/{truck_id}", response_model=DriverManifest)
def get_driver_manifest(truck_id: str):
    """
    Generates a localized vernacular shift briefing and safety checklist
    for a specific vehicle and driver using Llama 3.2 3B.
    """
    if not STATE["last_optimization"]:
        # Run optimization if not yet executed
        STATE["last_optimization"] = optimize_collection_routes(STATE["clusters"], STATE["fleet"])

    matching_route = next(
        (r for r in STATE["last_optimization"].routes if r.vehicle_id == truck_id),
        None
    )

    if not matching_route:
        raise HTTPException(status_code=404, detail=f"No active route found for truck ID: {truck_id}")

    stops_data = [s.dict() for s in matching_route.stops]
    briefing = generate_driver_briefing(matching_route.vehicle_name, stops_data)

    driver_name_map = {
        "TRUCK_01": "Santosh Gaikwad (Senior Operator)",
        "TRUCK_02": "Baban Jadhav (Driver)",
        "TRUCK_03": "Pravin Kamble (Driver)"
    }

    return DriverManifest(
        truck_id=matching_route.vehicle_id,
        truck_name=matching_route.vehicle_name,
        driver_name=driver_name_map.get(truck_id, "Municipal Staff Driver"),
        shift_date="Today's Active Morning Shift (06:30 AM - 01:30 PM)",
        total_stops=len(matching_route.stops),
        total_load_kg=matching_route.total_tonnage_kg,
        stops_summary=stops_data,
        vernacular_instructions=briefing["vernacular_instructions"],
        safety_alerts=briefing["safety_alerts"]
    )

@app.get("/api/policy-insights", response_model=List[PolicyInsight])
def get_policy_insights():
    """
    Analyzes persistent hotspot clusters and generates root-cause diagnostic
    recommendations for municipal ward commissioners.
    """
    insights = []
    for c in STATE["clusters"]:
        insight_data = generate_policy_insight(
            c.cluster_id, c.name, c.chronic_recurrence_count, c.primary_hazard
        )
        insights.append(PolicyInsight(**insight_data))
    return insights

@app.post("/api/reset")
def reset_database():
    """Resets dataset back to default Pune Ward 12 seed state."""
    STATE["reports"] = generate_seed_reports()
    clusters, updated_reports = cluster_waste_reports(STATE["reports"])
    STATE["clusters"] = clusters
    STATE["reports"] = updated_reports
    STATE["last_optimization"] = None
    return {"status": "success", "message": "Database reset to default seed state."}

# Mount static web directory
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def serve_index():
    """Serves the main Command Center Single Page Application."""
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse(
        content={"message": "SwachhRoute AI API is live! Frontend is initializing."}
    )
