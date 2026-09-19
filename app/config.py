"""
Configuration and constants for SwachhRoute AI
Problem Statement CS11 - NeuraMorphix HackForge 2026
"""

from typing import Dict, Any

# Target Municipal Ward (Pune Municipal Corporation - Kothrud / Karve Road Ward)
# Benchmark urban ward with mixed residential, commercial, and college areas
WARD_NAME = "Pune Municipal Corporation - Ward 12 (Kothrud / Karve Road)"
CITY_CENTER = {"lat": 18.5074, "lng": 73.8077}

# Municipal Facilities
DEPOT_LOCATION = {
    "id": "DEPOT_01",
    "name": "Kothrud Central Solid Waste Transport Depot",
    "lat": 18.5035,
    "lng": 73.8115,
    "type": "depot"
}

DISPOSAL_FACILITY = {
    "id": "LANDFILL_01",
    "name": "Paud Road Transfer Station & Material Recovery Facility",
    "lat": 18.5135,
    "lng": 73.7920,
    "type": "landfill"
}

# DBSCAN Spatial Clustering Hyperparameters
DBSCAN_EPS_METERS = 180.0  # Cluster radius in meters (~2-3 urban street blocks)
DBSCAN_MIN_SAMPLES = 3     # Minimum recurring complaints to classify as persistent black spot

# Local Ollama AI Settings
OLLAMA_BASE_URL = "http://127.0.0.1:11434"
OLLAMA_MODEL = "llama3.2:3b"
OLLAMA_TIMEOUT_SECONDS = 5.0

# Standard Fleet Configuration
DEFAULT_FLEET = [
    {
        "id": "TRUCK_01",
        "name": "Compactor MH-12-Q-4481",
        "type": "Hydraulic Compactor (Heavy)",
        "capacity_kg": 4500,
        "fuel_economy_kmpl": 3.0,
        "max_speed_kmh": 35.0,
        "suitable_for_narrow_alleys": False
    },
    {
        "id": "TRUCK_02",
        "name": "Tipper MH-12-RN-8812",
        "type": "Mini Tipper (Light)",
        "capacity_kg": 1800,
        "fuel_economy_kmpl": 7.5,
        "max_speed_kmh": 40.0,
        "suitable_for_narrow_alleys": True
    },
    {
        "id": "TRUCK_03",
        "name": "Tipper MH-12-RN-9023",
        "type": "Mini Tipper (Light)",
        "capacity_kg": 1800,
        "fuel_economy_kmpl": 7.5,
        "max_speed_kmh": 40.0,
        "suitable_for_narrow_alleys": True
    }
]

# Economic & Environmental Impact Constants (CPCB & MoHUA Standards)
DIESEL_COST_PER_LITRE_INR = 92.50
CO2_KG_PER_LITRE_DIESEL = 2.68
BASELINE_UNOPTIMIZED_FACTOR = 1.35  # Empirical unoptimized fleet travels ~35% more dead mileage
