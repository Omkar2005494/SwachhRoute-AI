# SwachhRoute AI 🚛🌱
### Autonomous Geospatial Hotspot Clustering & Dynamic Fleet Route Optimizer
**Problem Statement:** CS11 — Geospatial Environment: Mapping Waste-Dumping Hotspots and Improving Collection Routes  
**Hackathon:** NeuraMorphix HackForge 2026  
**Team:** Stackverse-labs  
**Lead:** Omkar Karibasappa Bhandari  

---

## 🌟 Overview & Innovation

In Indian cities, **75% to 85% of municipal solid waste expenditure is consumed purely by transport logistics and diesel fuel** (CPCB / NITI Aayog). Yet, cities remain plagued by recurring illegal "black spots" because current citizen grievance apps (e.g., Swachhata-MoHUA) operate as reactive ticketing tools that clean spots only to see them recur 48 hours later.

**SwachhRoute AI** bridges this chasm by connecting crowdsourced citizen complaints directly to municipal fleet logistics:
1. **Local Cognitive AI (Meta Llama 3.2 3B via Ollama):** Extracts hazard classification, severity scores (1–10), and required machinery from messy colloquial Hinglish/vernacular text—running **100% locally** with zero cloud costs and strict DPDP Act 2023 compliance.
2. **Spatio-Temporal Clustering (DBSCAN):** Groups scattered citizen complaints into persistent black-spot convex hulls, filtering out single-use litter noise.
3. **Dynamic Fleet Routing (Google OR-Tools CVRP):** Solves the Capacitated Vehicle Routing Problem across a heterogeneous fleet (heavy compactors vs. mini tippers) using real road network distances, cutting dead mileage and diesel burn by **10%–25%**.
4. **Root-Cause Prevention & Driver Briefings:** Generates localized vernacular shift manifests for drivers and diagnostic policy recommendations for ward commissioners.

---

## 🏗️ System Architecture

```
[ Citizen Mobile Report ] 
  • Geotagged photo + Hinglish text ("Kothrud bridge ke peeche nullah choked")
       │
       ▼
[ Local Llama 3.2 3B (Ollama) ]
  • Extracts: Hazard Class, Severity (9/10), Vehicle: Compactor, Urgency: Immediate
       │
       ▼
[ Spatial Clustering: DBSCAN Engine ]
  • Groups complaints within 180m radius into persistent Black Spot Convex Hulls
       │
       ▼
[ Fleet Optimization: Google OR-Tools (CVRP) ]
  • Solves Capacitated Vehicle Routing Problem constrained by truck payloads
  • Road-snapped street paths connecting Depot ──► Hotspots ──► Transfer Station
       │
       ▼
[ Actionable Outputs ]
  • Interactive Dark-Mode GIS Command Center (Leaflet)
  • Vernacular Driver Shift Manifests (Hindi/Marathi/English)
  • Municipal Ward Officer Root-Cause Policy Alerts
```

---

## 🚀 Quickstart & Demo Setup

### Prerequisites
* Python 3.10+ (Tested on Python 3.14 on macOS Apple Silicon M2)
* Local Ollama with `llama3.2:3b` (Optional: built-in semantic heuristic fallback activates if Ollama is paused)

### 1. Installation
```bash
pip install -r requirements.txt
```

### 2. Launch the Application
```bash
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Open your browser and navigate to: **`http://localhost:8000`**

### 3. Run Automated Verification Suite
```bash
python3 test_pipeline.py
```

---

## 🎬 3-Minute Live Jury Demo Script (Google Meet)

1. **Step 1: The Command Center Map (45 seconds)**
   * Open `http://localhost:8000`. Show the dark-mode Leaflet GIS map of **Pune Ward 12 (Kothrud)**.
   * Point out the **45 active citizen reports** and the **5 persistent black-spot polygons** clustered by DBSCAN.
   * Highlight the impact cards: `Fuel Saved: 25.0% | ₹104 saved / shift | 3.03 kg CO2 cut`.

2. **Step 2: The Real-Time Citizen Ingestion (45 seconds)**
   * Click the **"Citizen Report"** tab on the sidebar.
   * Click the preset chip **"💉 Medical Syringes"** (or click anywhere on the map).
   * Click **"Parse with Local AI & Submit Report"**.
   * Watch **Meta Llama 3.2 3B** parse the Hinglish text in < 400ms into:
     * `Hazard: Biomedical Hazardous | Severity: 9/10 | Vehicle: Hydraulic Compactor | Urgency: Immediate`.
   * Show that the new report appears live on the map and DBSCAN instantly recalculates the cluster.

3. **Step 3: Solving the Fleet Routes (45 seconds)**
   * Click the top button: **"Solve Fleet Routes"**.
   * **Google OR-Tools** solves the CVRP in 50ms.
   * Point to the **3 vibrant, road-snapped truck paths**:
     * Emerald Green: Heavy Compactor MH-12-Q-4481 clearing high-tonnage spots.
     * Cyan: Mini Tipper MH-12-RN-9023 clearing narrow residential alleys.
   * Show that no vehicle exceeds its legal payload capacity!

4. **Step 4: Driver Manifest & Root-Cause Policy (30 seconds)**
   * Switch to **"Driver Manifest"**: Show the localized Hinglish briefing for driver *Santosh Gaikwad* with bold safety warnings for bio-hazardous stops.
   * Switch to **"Policy Insights"**: Show the AI root-cause diagnostic explaining *why* Hotspot #1 recurs (late-night vegetable vendors) and recommending a 2.5-ton community container and 11:30 PM shift.

5. **Step 5: The Edge & Privacy Conclusion (15 seconds)**
   * Conclude: *"This entire system runs 100% on-premise on local municipal hardware with zero recurring cloud API costs, compliant with India's DPDP Act 2023."*

---

## ⚖️ Open-Source Attribution & Compliance

In strict compliance with NeuraMorphix HackForge originality and licensing rules, all open-source libraries are attributed:
* **Google OR-Tools:** Apache 2.0 License ([google/or-tools](https://github.com/google/or-tools))
* **Scikit-Learn:** BSD 3-Clause License ([scikit-learn](https://scikit-learn.org))
* **Meta Llama 3.2 3B:** Llama 3.2 Community License ([meta.com](https://llama.meta.com))
* **Leaflet.js & CARTO:** BSD 2-Clause / OpenStreetMap Contributors ([leafletjs.com](https://leafletjs.com))
* **FastAPI & Uvicorn:** MIT License ([fastapi.tiangolo.com](https://fastapi.tiangolo.com))
