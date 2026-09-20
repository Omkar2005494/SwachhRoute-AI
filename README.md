# SwachhRoute AI — Autonomous Waste Hotspot Clustering & Dynamic Fleet Route Optimiser

> **NeuraMorphix HackForge 2026** | **Problem Statement CS11** — Geospatial Environment: Mapping Waste-Dumping Hotspots and Improving Collection Routes  
> *"From Waste Reports to Smarter Routes."*

---

## ⚠️ Important Notice
This application includes **Simulated Demonstration Data** for development and evaluation. Synthetic coordinate telemetry is modeled after a representative metropolitan region (synthetic Bengaluru urban bounds) and does not represent authentic or official BBMP municipal telemetry.

---

## Architecture Flow (Source of Truth)

The platform follows a strict 6-stage end-to-end pipeline:

```
USER INPUT
    ↓
DATA COLLECTION
    ↓
DATA PROCESSING
    ↓
AI / GEOSPATIAL / OPTIMIZATION LOGIC
    ↓
OUTPUT
    ↓
FEEDBACK & IMPROVEMENT
```

### Pipeline Details:

1. **User Input**: Multi-modal citizen reports via Text, Voice Audio (Web Speech API), Geo-tagged Photo, and Location coordinates.
2. **Data Collection**: GPS coordinates (EPSG:4326), timestamps, incident description, evidence media, fleet telemetry. Immediate client-side synchronization across routes.
3. **Data Processing**: Coordinate projection (EPSG:4326 stored; EPSG:3857 projected for metric clustering), text cleaning, synthetic Bengaluru city boundary validation, and schema sanitization.
4. **AI / Geospatial / Optimization Logic**:
   - **Local AI (Meta Llama 3.2 3B via Ollama)**: Complaint understanding, severity grading (1-10), hazard extraction, machinery recommendations, driver briefing text. (*Strictly non-numerical / non-spatial*).
   - **Geospatial Intelligence (DBSCAN + Convex Hull)**: Python Scikit-learn DBSCAN (`ε = 180m`, `MinPts = 3`) + SciPy Convex Hull (with 35m operational buffer protection for collinear points). Deterministic TypeScript DBSCAN fallback engine included.
   - **Optimization (Google OR-Tools CVRP + Guided Local Search)**: Fleet assignment, vehicle capacity optimization, and route sequence solving *(Future Phase)*.
   - **Road Routing (OSRM)**: Snapping route segments to street networks *(Future Phase)*.
5. **Output**: Interactive municipal operations command center, dynamic hotspot polygons, road-snapped route polylines, driver shift manifests.
6. **Feedback & Improvement**: Officer overrides, pickup verification, recurrence scoring, and adaptive routing updates.

---

## Technology Stack

- **Frontend & App Framework**: Next.js 14 (App Router), TypeScript 5, React 18, Tailwind CSS, Lucide Icons
- **Mapping**: Leaflet, React-Leaflet, OpenStreetMap
- **Local AI Engine**: Meta Llama 3.2 3B via Ollama (`http://127.0.0.1:11434`)
- **Geospatial Analytics**: Python 3 (Scikit-learn DBSCAN, SciPy Convex Hull, NumPy) with deterministic TypeScript fallback
- **Coordinate System**: EPSG:4326 (storage & Leaflet display) ↔ EPSG:3857 (meter-based projected coordinates for local Bengaluru distance-based clustering)

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v26)
- npm 9+
- Python 3 with `scikit-learn`, `scipy`, `numpy` (for primary DBSCAN clustering)
- Ollama with `llama3.2:3b` (for local natural language understanding)

### Installation
```bash
npm install
pip install scikit-learn scipy numpy
```

### Running Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to access the Municipal Operations Command Center dashboard.
Navigate to `/hotspots` to inspect autonomous DBSCAN clusters and convex hull boundaries.
Navigate to `/reports` to submit new citizen waste complaints.

### Verification & Type-Check
```bash
npm run type-check
npm run build
```
