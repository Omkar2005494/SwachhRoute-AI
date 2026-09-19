"""
NLP and Cognitive AI Service for SwachhRoute AI
Connects to local Meta Llama 3.2 3B via Ollama with resilient heuristic fallback.
Problem Statement CS11 - NeuraMorphix HackForge 2026
"""

import json
import re
import requests
from typing import Dict, Any, List
from app.config import OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_TIMEOUT_SECONDS

def extract_hazard_info(text: str) -> Dict[str, Any]:
    """
    Extracts structured hazard classification, severity score (1-10),
    required machinery, and urgency tier from unstructured citizen text.
    First attempts local Ollama Llama 3.2 3B; falls back to domain heuristic rules.
    """
    cleaned_text = text.strip()
    if not cleaned_text:
        return _default_hazard_info()

    # Attempt Local Ollama Llama 3.2 3B execution
    try:
        prompt = (
            "You are an expert municipal solid waste inspector in India. "
            "Analyze the following citizen complaint and return ONLY a valid JSON object with these keys:\n"
            "- hazard_class: string (one of 'Biomedical Hazardous', 'Animal Carcass / Bio-Hazard', "
            "'Drain Blockage / Silt', 'Organic Wet Waste', 'Construction Debris', 'Plastic / Dry Waste')\n"
            "- severity_score: integer from 1 to 10 (10 being immediate public health threat)\n"
            "- machinery_needed: string (one of 'Hydraulic Compactor (Heavy)', 'Mini Tipper (Light)', 'Backhoe Loader')\n"
            "- urgency: string (one of 'Immediate', 'Within 4h', 'Scheduled')\n\n"
            f"Citizen Complaint: \"{cleaned_text}\"\n"
            "JSON output:"
        )

        resp = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.1,
                    "num_predict": 120
                }
            },
            timeout=OLLAMA_TIMEOUT_SECONDS
        )

        if resp.status_code == 200:
            result = resp.json().get("response", "")
            parsed = json.loads(result)
            if "hazard_class" in parsed and "severity_score" in parsed:
                return {
                    "hazard_class": str(parsed.get("hazard_class", "Organic Wet Waste")),
                    "severity_score": int(max(1, min(10, parsed.get("severity_score", 5)))),
                    "machinery_needed": str(parsed.get("machinery_needed", "Mini Tipper (Light)")),
                    "urgency": str(parsed.get("urgency", "Within 4h")),
                    "ai_engine": f"Meta Llama 3.2 3B (Local via Ollama)"
                }
    except Exception:
        # Graceful fallback to deterministic rule engine if Ollama is paused
        pass

    # Heuristic Fallback based on Indian municipal waste taxonomy
    heuristic_res = _heuristic_extract(cleaned_text)
    heuristic_res["ai_engine"] = "Local Semantic Rule Parser (DPDP Compliant)"
    return heuristic_res

def _heuristic_extract(text: str) -> Dict[str, Any]:
    lower = text.lower()

    # Biomedical / Hospital waste (Highest Hazard)
    if any(k in lower for k in ["needle", "syringe", "hospital", "clinic", "bandage", "medicine", "pharma", "biomedical"]):
        return {
            "hazard_class": "Biomedical Hazardous",
            "severity_score": 9,
            "machinery_needed": "Hydraulic Compactor (Heavy)",
            "urgency": "Immediate"
        }

    # Animal carcass / dead body / severe decay
    if any(k in lower for k in ["dead animal", "carcass", "dead dog", "kutta", "gai", "janwar", "decaying", "durgandh", "stench"]):
        return {
            "hazard_class": "Animal Carcass / Bio-Hazard",
            "severity_score": 9,
            "machinery_needed": "Hydraulic Compactor (Heavy)",
            "urgency": "Immediate"
        }

    # Drainage / Nullah blockage (Urban Flood Risk)
    if any(k in lower for k in ["drain", "nullah", "nala", "gutter", "overflow", "monsoon", "flood", "clogged", "choke"]):
        return {
            "hazard_class": "Drain Blockage / Silt",
            "severity_score": 8,
            "machinery_needed": "Hydraulic Compactor (Heavy)",
            "urgency": "Immediate"
        }

    # Market / Rotten food / Vegetable waste
    if any(k in lower for k in ["sabzi", "vegetable", "market", "mandi", "rotten", "food waste", "canteen", "fruit", "kachra"]):
        return {
            "hazard_class": "Organic Wet Waste",
            "severity_score": 7,
            "machinery_needed": "Hydraulic Compactor (Heavy)",
            "urgency": "Within 4h"
        }

    # Construction debris / Malba
    if any(k in lower for k in ["debris", "malba", "cement", "bricks", "stone", "construction", "renovation", "sand"]):
        return {
            "hazard_class": "Construction Debris",
            "severity_score": 6,
            "machinery_needed": "Mini Tipper (Light)",
            "urgency": "Within 4h"
        }

    # Dry recyclables / Plastic / Bottles
    return {
        "hazard_class": "Plastic / Dry Waste",
        "severity_score": 4,
        "machinery_needed": "Mini Tipper (Light)",
        "urgency": "Scheduled"
    }

def _default_hazard_info() -> Dict[str, Any]:
    return {
        "hazard_class": "Mixed Municipal Waste",
        "severity_score": 5,
        "machinery_needed": "Mini Tipper (Light)",
        "urgency": "Within 4h",
        "ai_engine": "Rule-Based Baseline"
    }

def generate_driver_briefing(truck_name: str, stops_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generates a localized, human-readable shift briefing for sanitation drivers
    highlighting critical hazards and stop sequencing.
    """
    stop_count = len(stops_data)
    total_tonnage = sum(s.get("demand_kg", 0) for s in stops_data)

    high_hazards = [s for s in stops_data if s.get("severity_score", 0) >= 8]

    # Vernacular Hinglish instructions for driver
    instructions_hi = (
        f"चालक {truck_name} के लिए आज का रूट:\n"
        f"कुल {stop_count} स्टॉप्स हैं, अनुमानित कचरा: {total_tonnage} किग्रा।\n"
    )

    if high_hazards:
        hazard_names = ", ".join([h.get("stop_name", "") for h in high_hazards[:2]])
        instructions_hi += (
            f"⚠️ विशेष सावधानी: {hazard_names} पर गंभीर सड़न/बायो-कचरा है। "
            f"सुरक्षात्मक दस्ताने और मास्क पहनकर ही लोडिंग करें।"
        )
    else:
        instructions_hi += "सभी स्टॉप्स सामान्य गति से क्लीयर करें। डिपो वापसी 12:30 PM तक सुनिश्चित करें।"

    safety_alerts = []
    if high_hazards:
        safety_alerts.append("Use safety gloves & gumboots for wet organic and biomedical piles.")
        safety_alerts.append("Clear nullah-adjacent waste before noon to prevent drain back-flow.")
    else:
        safety_alerts.append("Standard PPE (Gloves & reflective safety vest) mandatory.")

    return {
        "vernacular_instructions": instructions_hi,
        "safety_alerts": safety_alerts
    }

def generate_policy_insight(cluster_id: int, location_name: str, recurrence_count: int, primary_hazard: str) -> Dict[str, Any]:
    """
    Diagnoses the root cause of chronic black-spots and provides actionable
    municipal policy interventions.
    """
    if "Organic" in primary_hazard or "Wet" in primary_hazard:
        root_cause = "Late-night vegetable and fruit vendors dumping unsellable produce after market hours (10 PM – 12 AM)."
        policy_rec = "Reschedule primary tipper collection to 11:30 PM and install a dedicated 2.5-ton covered organic bin at the junction."
    elif "Biomedical" in primary_hazard:
        root_cause = "Local outpatient clinics and diagnostic labs bypassing private bio-waste disposal vendors to avoid commercial fees."
        policy_rec = "Issue formal notice under Bio-Medical Waste Management Rules 2016 and mandate barcoded yellow-bag disposal audits for all Ward clinics."
    elif "Drain" in primary_hazard or "Carcass" in primary_hazard:
        root_cause = "Absence of stormwater drain grates and blind-spot street corners encouraging unauthorized nighttime dumping."
        policy_rec = "Install CCTV surveillance on culvert bridge, erect heavy metal mesh grates, and position a high-lumen solar LED floodlight."
    elif "Construction" in primary_hazard:
        root_cause = "Unauthorized small-scale home renovation contractors dumping concrete malba on vacant plots."
        policy_rec = "Designate a notified Construction & Demolition (C&D) drop-off depot with on-demand WhatsApp booking."
    else:
        root_cause = "High pedestrian transit footfall combined with missing segregated litter receptacles along transit corridor."
        policy_rec = "Install paired dry/wet twin bins at 50-meter intervals and engage shopkeepers for community monitoring."

    return {
        "cluster_id": cluster_id,
        "location_name": location_name,
        "recurrence_count": recurrence_count,
        "primary_waste_type": primary_hazard,
        "diagnosed_root_cause": root_cause,
        "preventative_policy_recommendation": policy_rec
    }
