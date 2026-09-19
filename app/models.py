"""
Pydantic Data Schemas for SwachhRoute AI
Problem Statement CS11 - NeuraMorphix HackForge 2026
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ReportCreate(BaseModel):
    text: str = Field(..., description="Citizen's textual or transcribed description of the waste")
    lat: float = Field(..., description="Latitude of the waste report")
    lng: float = Field(..., description="Longitude of the waste report")
    image_url: Optional[str] = Field(default="/static/assets/sample_dump.jpg", description="URL or data-URI of photo")
    citizen_name: Optional[str] = Field(default="Anonymous Citizen")
    ward: Optional[str] = Field(default="Ward 12")

class Report(BaseModel):
    id: str
    text: str
    lat: float
    lng: float
    image_url: str
    citizen_name: str
    ward: str
    timestamp: str
    hazard_class: str = Field(..., description="e.g., Organic Wet, Biomedical, Construction Debris, Plastic Dry")
    severity_score: int = Field(..., ge=1, le=10, description="Severity rating 1 (minor) to 10 (critical)")
    machinery_needed: str = Field(..., description="Recommended collection vehicle type")
    urgency: str = Field(..., description="Immediate, Within 4h, Scheduled")
    is_resolved: bool = False
    cluster_id: Optional[int] = None

class HotspotCluster(BaseModel):
    cluster_id: int
    name: str
    centroid_lat: float
    centroid_lng: float
    polygon: List[List[float]] = Field(..., description="List of [lat, lng] coordinates forming the convex hull boundary")
    report_ids: List[str]
    report_count: int
    severity_score: float
    estimated_tonnage_kg: int
    chronic_recurrence_count: int
    primary_hazard: str
    recommended_machinery: str

class RouteStop(BaseModel):
    stop_index: int
    stop_id: str
    stop_name: str
    lat: float
    lng: float
    demand_kg: int
    hazard_class: str
    severity_score: int
    eta_minutes_from_start: int

class VehicleRoute(BaseModel):
    vehicle_id: str
    vehicle_name: str
    vehicle_type: str
    capacity_kg: int
    total_tonnage_kg: int
    utilization_pct: float
    total_distance_km: float
    estimated_duration_mins: int
    fuel_used_litres: float
    stops: List[RouteStop]
    path_coordinates: List[List[float]] = Field(..., description="Road-snapped polyline coordinates for map animation")

class OptimizationResponse(BaseModel):
    timestamp: str
    ward_name: str
    total_hotspots_targeted: int
    total_tonnage_cleared_kg: int
    total_distance_km: float
    fuel_saved_litres: float
    fuel_saved_pct: float
    cost_saved_inr: float
    co2_avoided_kg: float
    routes: List[VehicleRoute]
    unvisited_hotspots: List[str] = []

class DriverManifest(BaseModel):
    truck_id: str
    truck_name: str
    driver_name: str
    shift_date: str
    total_stops: int
    total_load_kg: int
    stops_summary: List[Dict[str, Any]]
    vernacular_instructions: str
    safety_alerts: List[str]

class PolicyInsight(BaseModel):
    cluster_id: int
    location_name: str
    recurrence_count: int
    primary_waste_type: str
    diagnosed_root_cause: str
    preventative_policy_recommendation: str
