"""
Spatial Clustering Engine for SwachhRoute AI
Executes DBSCAN to detect persistent illegal waste dumping black spots and convex hulls.
Problem Statement CS11 - NeuraMorphix HackForge 2026
"""

import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.cluster import DBSCAN
from scipy.spatial import ConvexHull
from app.config import DBSCAN_EPS_METERS, DBSCAN_MIN_SAMPLES
from app.models import Report, HotspotCluster

EARTH_RADIUS_METERS = 6371000.0

def cluster_waste_reports(reports: List[Report]) -> Tuple[List[HotspotCluster], List[Report]]:
    """
    Groups individual waste reports into high-density persistent black spot clusters
    using the DBSCAN algorithm with Haversine distance metric.
    Returns:
        - List of HotspotCluster models (with convex hull polygons)
        - Updated list of Report objects with their assigned cluster_id
    """
    if len(reports) < DBSCAN_MIN_SAMPLES:
        # Not enough reports to form a statistically valid density cluster
        return [], reports

    # Convert coordinates to radians for Haversine metric (lat, lng in radians)
    coords_deg = np.array([[r.lat, r.lng] for r in reports])
    coords_rad = np.radians(coords_deg)

    # eps in radians
    eps_rad = DBSCAN_EPS_METERS / EARTH_RADIUS_METERS

    db = DBSCAN(eps=eps_rad, min_samples=DBSCAN_MIN_SAMPLES, metric="haversine")
    labels = db.fit_predict(coords_rad)

    clusters: List[HotspotCluster] = []
    unique_labels = set(labels)

    # Update cluster_id in reports
    for idx, report in enumerate(reports):
        lbl = int(labels[idx])
        report.cluster_id = lbl if lbl != -1 else None

    # Process each discovered cluster
    for lbl in unique_labels:
        if lbl == -1:
            # Noise / isolated single reports
            continue

        cluster_indices = np.where(labels == lbl)[0]
        cluster_reports = [reports[i] for i in cluster_indices]
        cluster_coords = coords_deg[cluster_indices]

        # Calculate cluster centroid
        centroid_lat = float(np.mean(cluster_coords[:, 0]))
        centroid_lng = float(np.mean(cluster_coords[:, 1]))

        # Calculate bounding polygon (Convex Hull)
        polygon = _compute_cluster_polygon(cluster_coords, centroid_lat, centroid_lng)

        # Aggregate metrics
        report_count = len(cluster_reports)
        mean_severity = float(np.mean([r.severity_score for r in cluster_reports]))
        
        # Primary hazard class (most frequent)
        hazard_counts: Dict[str, int] = {}
        for r in cluster_reports:
            hazard_counts[r.hazard_class] = hazard_counts.get(r.hazard_class, 0) + 1
        primary_hazard = max(hazard_counts.items(), key=lambda x: x[1])[0]

        # Machinery needed
        machinery_counts: Dict[str, int] = {}
        for r in cluster_reports:
            machinery_counts[r.machinery_needed] = machinery_counts.get(r.machinery_needed, 0) + 1
        recommended_machinery = max(machinery_counts.items(), key=lambda x: x[1])[0]

        # Estimated tonnage in kilograms (realistic urban black-spot size: 400 - 1200 kg)
        base_kg = 90 * report_count
        severity_multiplier = 1.0 + (mean_severity / 10.0)
        estimated_tonnage = int(base_kg * severity_multiplier)

        # Name based on nearby landmark / ward
        cluster_name = f"Hotspot #{lbl + 1} ({primary_hazard.split('/')[0].strip()})"

        cluster_obj = HotspotCluster(
            cluster_id=int(lbl + 1),
            name=cluster_name,
            centroid_lat=round(centroid_lat, 6),
            centroid_lng=round(centroid_lng, 6),
            polygon=polygon,
            report_ids=[r.id for r in cluster_reports],
            report_count=report_count,
            severity_score=round(mean_severity, 1),
            estimated_tonnage_kg=estimated_tonnage,
            chronic_recurrence_count=report_count,
            primary_hazard=primary_hazard,
            recommended_machinery=recommended_machinery
        )
        clusters.append(cluster_obj)

    # Sort clusters by severity score descending (highest priority first)
    clusters.sort(key=lambda c: c.severity_score, reverse=True)
    return clusters, reports

def _compute_cluster_polygon(coords: np.ndarray, c_lat: float, c_lng: float) -> List[List[float]]:
    """
    Generates a clean geographic boundary polygon for the cluster.
    Uses 2D Convex Hull when non-collinear; generates buffered envelope for small/collinear clusters.
    """
    n_points = len(coords)

    if n_points >= 3:
        try:
            hull = ConvexHull(coords)
            hull_pts = coords[hull.vertices]
            # Close the polygon loop by repeating the first vertex
            polygon = [[round(float(p[0]), 6), round(float(p[1]), 6)] for p in hull_pts]
            polygon.append(polygon[0])
            return polygon
        except Exception:
            # Fallback if points are collinear
            pass

    # For 1-2 points or collinear coordinates, generate an 8-sided circle buffer (~60m radius)
    radius_deg = 60.0 / 111139.0  # Approx 60 meters in latitude degrees
    angles = np.linspace(0, 2 * np.pi, 9)
    polygon = []
    for a in angles:
        lat = c_lat + radius_deg * np.sin(a)
        lng = c_lng + (radius_deg * np.cos(a)) / np.cos(np.radians(c_lat))
        polygon.append([round(float(lat), 6), round(float(lng), 6)])

    return polygon
