#!/usr/bin/env python3
"""
SwachhRoute AI — Python Scikit-learn DBSCAN Clustering & Convex Hull Service
NeuraMorphix HackForge 2026 | Problem Statement CS11

Deterministic Geospatial Analysis:
- Input Coordinates: EPSG:4326 (WGS 84 latitude/longitude)
- Metric Processing: EPSG:3857 (Web Mercator meters) for Euclidean distance clustering
- Parameters: epsilon = 180 meters, min_samples = 3
- Output: Hotspots with centroid, convex hull polygon (EPSG:4326), and cluster assignments.
"""

import sys
import json
import math
from collections import Counter
import numpy as np
from sklearn.cluster import DBSCAN
from scipy.spatial import ConvexHull

EARTH_RADIUS_METERS = 6378137.0

def project_4326_to_3857(lat, lng):
    """
    Projects WGS84 lat/lng degrees to EPSG:3857 Web Mercator meters.
    Note: EPSG:3857 provides meter-based projected coordinates suitable for
    this local Bengaluru demonstration's distance-based clustering.
    """
    x = lng * (math.pi / 180.0) * EARTH_RADIUS_METERS
    clamped_lat = max(-85.05112878, min(85.05112878, lat))
    lat_rad = clamped_lat * (math.pi / 180.0)
    y = math.log(math.tan(math.pi / 4.0 + lat_rad / 2.0)) * EARTH_RADIUS_METERS
    return x, y

def unproject_3857_to_4326(x, y):
    """
    Unprojects EPSG:3857 meters back to EPSG:4326 WGS84 latitude/longitude.
    """
    lng = (x / EARTH_RADIUS_METERS) * (180.0 / math.pi)
    lat_rad = 2.0 * math.atan(math.exp(y / EARTH_RADIUS_METERS)) - math.pi / 2.0
    lat = lat_rad * (180.0 / math.pi)
    return round(lat, 6), round(lng, 6)

def compute_operational_buffer(points_4326, buffer_radius_m=35.0):
    """
    Fallback geometry: Constructs an operational buffer envelope (octagon)
    around the cluster centroid when reports are collinear or have insufficient
    distinct points for a true 2D convex simplex.
    """
    lats = [p[0] for p in points_4326]
    lngs = [p[1] for p in points_4326]
    c_lat = sum(lats) / len(lats)
    c_lng = sum(lngs) / len(lngs)
    
    # Approx degree offsets for 35m at ~13° N
    d_lat = buffer_radius_m / 111000.0
    d_lng = buffer_radius_m / (111000.0 * math.cos(math.radians(c_lat)))
    
    # 8-vertex bounding octagon
    octagon = [
        [round(c_lat + d_lat, 6), round(c_lng, 6)],
        [round(c_lat + d_lat * 0.7, 6), round(c_lng + d_lng * 0.7, 6)],
        [round(c_lat, 6), round(c_lng + d_lng, 6)],
        [round(c_lat - d_lat * 0.7, 6), round(c_lng + d_lng * 0.7, 6)],
        [round(c_lat - d_lat, 6), round(c_lng, 6)],
        [round(c_lat - d_lat * 0.7, 6), round(c_lng - d_lng * 0.7, 6)],
        [round(c_lat, 6), round(c_lng - d_lng, 6)],
        [round(c_lat + d_lat * 0.7, 6), round(c_lng - d_lng * 0.7, 6)],
    ]
    return octagon

VALID_CATEGORIES = {
    'household', 'commercial', 'construction_debris', 'organic',
    'plastic', 'hazardous', 'electronic', 'mixed'
}
CATEGORY_MAP = {
    'Household Waste': 'household',
    'Commercial Waste': 'commercial',
    'Construction & Debris': 'construction_debris',
    'Organic/Green Waste': 'organic',
    'Plastic Dump': 'plastic',
    'Hazardous/Medical': 'hazardous',
    'Electronic Waste': 'electronic',
    'Mixed Waste': 'mixed',
}

VALID_HAZARDS = {
    'organic_decay', 'severe_odor', 'biomedical', 'drain_flood_risk',
    'construction_debris', 'sharp_objects', 'fire_risk', 'hazardous_material',
    'mixed_waste', 'none_identified'
}
HAZARD_MAP = {
    'sharp_physical': 'sharp_objects',
    'biohazard': 'biomedical',
    'flammable': 'fire_risk',
    'chemical': 'hazardous_material',
    'none': 'none_identified',
    'none_identified': 'none_identified',
}

VALID_MACHINERY = {'hydraulic_compactor', 'mini_tipper', 'backhoe'}
MACHINERY_MAP = {
    'Compactor Truck (10T)': 'hydraulic_compactor',
    'Mini Tipper (2T)': 'mini_tipper',
    'JCB / Heavy Loader': 'backhoe',
    'Roll-on Roll-off (Ro-Ro)': 'backhoe',
    'Roll-on Roll-off': 'backhoe',
    'Suction Tanker': 'hydraulic_compactor',
}

def calculate_priority_score(avg_sev, max_sev, report_count, hazards):
    """
    Deterministic hotspot priority calculation:
    S = 0.6 * avgSev + 0.4 * maxSev + densityBonus + hazardBonus
    """
    base_sev = (avg_sev * 0.6) + (max_sev * 0.4)
    
    density_bonus = 0.0
    if report_count >= 6:
        density_bonus = 1.5
    elif report_count >= 4:
        density_bonus = 0.8
        
    hazard_bonus = 0.0
    critical_hazards = {'biomedical', 'hazardous_material', 'drain_flood_risk', 'fire_risk'}
    if any(h in critical_hazards for h in hazards):
        hazard_bonus = 1.2
    elif any(h in {'severe_odor', 'construction_debris', 'sharp_objects'} for h in hazards):
        hazard_bonus = 0.6
        
    score = min(10.0, base_sev + density_bonus + hazard_bonus)
    
    if score >= 8.0:
        level = 'critical'
    elif score >= 6.5:
        level = 'high'
    elif score >= 4.5:
        level = 'medium'
    else:
        level = 'low'
        
    score_100 = int(round(score * 10))
    return score_100, level

def derive_recommended_machinery(dominant_category, dominant_hazard, member_reports):
    """
    Deterministically derives recommended machinery from cluster member evidence.
    Returns strictly one of: 'hydraulic_compactor', 'mini_tipper', 'backhoe'
    """
    # 1. Check if any member report explicitly required backhoe
    for r in member_reports:
        m_list = r.get('machineryRequired') or []
        for m in m_list:
            norm_m = MACHINERY_MAP.get(m, m)
            if norm_m == 'backhoe':
                return 'backhoe'

    # Construction debris category or sharp objects/debris hazard -> backhoe
    if dominant_category == 'construction_debris' or dominant_hazard in {'construction_debris', 'sharp_objects'}:
        return 'backhoe'

    # 2. Check if hydraulic compactor required or conditions met
    total_waste_kg = sum(float(r.get('estimatedWasteKg') or 0) for r in member_reports)
    for r in member_reports:
        m_list = r.get('machineryRequired') or []
        for m in m_list:
            norm_m = MACHINERY_MAP.get(m, m)
            if norm_m == 'hydraulic_compactor':
                return 'hydraulic_compactor'

    if (total_waste_kg >= 800 or
        dominant_category in {'household', 'commercial', 'plastic', 'hazardous'} or
        dominant_hazard in {'biomedical', 'drain_flood_risk', 'fire_risk'}):
        return 'hydraulic_compactor'

    return 'mini_tipper'

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input or raw_input.strip() == '':
            print(json.dumps({'error': 'No input data provided'}))
            sys.exit(1)
            
        parsed_input = json.loads(raw_input)
        if isinstance(parsed_input, dict):
            reports = parsed_input.get('reports', [])
            epsilon_m = float(parsed_input.get('epsMeters', 180.0))
            min_samples = int(parsed_input.get('minSamples', 3))
        elif isinstance(parsed_input, list):
            reports = parsed_input
            epsilon_m = 180.0
            min_samples = 3
        else:
            reports = []
            epsilon_m = 180.0
            min_samples = 3

        if not isinstance(reports, list) or len(reports) == 0:
            print(json.dumps({
                'hotspots': [],
                'clusteredReportsCount': 0,
                'noiseReportsCount': 0,
                'totalReportsCount': 0,
                'clusterAssignments': {},
                'engine': 'python_scikit_learn',
                'parameters': {'epsilonMeters': int(epsilon_m), 'minSamples': min_samples}
            }))
            return

        # 1. Project to EPSG:3857 Web Mercator meters
        projected_coords = []
        valid_reports = []
        for r in reports:
            lat = float(r['latitude'])
            lng = float(r['longitude'])
            x, y = project_4326_to_3857(lat, lng)
            projected_coords.append([x, y])
            valid_reports.append(r)

        X = np.array(projected_coords)

        # 2. Run Scikit-learn DBSCAN (eps=180m, min_samples=3)
        db = DBSCAN(eps=epsilon_m, min_samples=min_samples, metric='euclidean').fit(X)
        labels = db.labels_

        cluster_assignments = {}
        unique_labels = sorted(set(labels))
        hotspots = []
        clustered_count = 0
        noise_count = 0

        # Map cluster labels to cluster ID strings
        cluster_id_map = {}
        counter = 1
        for lbl in unique_labels:
            if lbl != -1:
                cluster_id_map[lbl] = f"HOT-{counter:02d}"
                counter += 1

        for i, lbl in enumerate(labels):
            rep_id = valid_reports[i]['id']
            if lbl == -1:
                cluster_assignments[rep_id] = 'noise'
                noise_count += 1
            else:
                cluster_assignments[rep_id] = cluster_id_map[lbl]
                clustered_count += 1

        # 3. Derive Hotspot Intelligence for each cluster
        for lbl, cluster_id in cluster_id_map.items():
            member_indices = [idx for idx, l in enumerate(labels) if l == lbl]
            member_reports = [valid_reports[idx] for idx in member_indices]
            member_pts_3857 = X[member_indices]
            member_pts_4326 = [[r['latitude'], r['longitude']] for r in member_reports]
            member_ids = [r['id'] for r in member_reports]

            # A. Centroid calculation in projected space, then unprojected to EPSG:4326
            c_x = float(np.mean(member_pts_3857[:, 0]))
            c_y = float(np.mean(member_pts_3857[:, 1]))
            centroid_lat, centroid_lng = unproject_3857_to_4326(c_x, c_y)

            # B. Convex Hull calculation
            bounding_polygon = []
            geometry_type = 'convex_hull'
            
            # Check unique points
            unique_pts = np.unique(member_pts_3857, axis=0)
            if len(unique_pts) >= 3:
                try:
                    hull = ConvexHull(unique_pts)
                    # Vertices ordered around perimeter
                    hull_vertices_4326 = []
                    for vertex_idx in hull.vertices:
                        px, py = unique_pts[vertex_idx]
                        plat, plng = unproject_3857_to_4326(px, py)
                        hull_vertices_4326.append([plat, plng])
                    bounding_polygon = hull_vertices_4326
                except Exception:
                    # Fallback to operational buffer when points are collinear
                    bounding_polygon = compute_operational_buffer(member_pts_4326)
                    geometry_type = 'operational_buffer'
            else:
                # Less than 3 unique points
                bounding_polygon = compute_operational_buffer(member_pts_4326)
                geometry_type = 'operational_buffer'

            # C. Aggregate Severity
            sev_scores = []
            for r in member_reports:
                # Use AI numerical severity if available, otherwise map from severity enum
                if 'aiAnalysis' in r and r['aiAnalysis'] and 'severity' in r['aiAnalysis']:
                    sev_scores.append(float(r['aiAnalysis']['severity']))
                elif r.get('severity') == 'critical':
                    sev_scores.append(9.0)
                elif r.get('severity') == 'high':
                    sev_scores.append(7.0)
                elif r.get('severity') == 'medium':
                    sev_scores.append(5.0)
                else:
                    sev_scores.append(3.0)

            avg_sev = round(sum(sev_scores) / len(sev_scores), 1)
            max_sev = int(max(sev_scores))

            # D. Total Estimated Waste (Advisory)
            total_waste_kg = sum(float(r.get('estimatedWasteKg') or 0) for r in member_reports)

            # E. Dominant Category
            raw_categories = [r.get('category', 'household') for r in member_reports]
            norm_categories = [CATEGORY_MAP.get(c, c) for c in raw_categories]
            valid_cats = [c for c in norm_categories if c in VALID_CATEGORIES] or ['household']
            cat_counts = Counter(valid_cats)
            dominant_category = cat_counts.most_common(1)[0][0]

            # F. Dominant Hazard
            raw_hazards = [
                (r.get('aiAnalysis') or {}).get('hazard') or r.get('hazard', 'none_identified')
                for r in member_reports
            ]
            norm_hazards = [HAZARD_MAP.get(h, h) for h in raw_hazards]
            valid_hazards = [h for h in norm_hazards if h in VALID_HAZARDS] or ['none_identified']
            real_hazards = [h for h in valid_hazards if h != 'none_identified']
            if real_hazards:
                hazard_counts = Counter(real_hazards)
                dominant_hazard = hazard_counts.most_common(1)[0][0]
            else:
                dominant_hazard = 'none_identified'

            # G. Recommended Machinery (strictly one of: hydraulic_compactor, mini_tipper, backhoe)
            rec_mach = derive_recommended_machinery(dominant_category, dominant_hazard, member_reports)

            # H. Deterministic Priority Level
            priority_score, urgency_level = calculate_priority_score(avg_sev, max_sev, len(member_reports), valid_hazards)

            # Zone naming from member ward name
            zone_names = [r.get('wardName') for r in member_reports if r.get('wardName')]
            zone_name = zone_names[0] if zone_names else f"Sector {cluster_id}"

            hotspots.append({
                'id': cluster_id,
                'clusterLabel': int(lbl),
                'centerCoordinates': [centroid_lat, centroid_lng],
                'boundingPolygon': bounding_polygon,
                'geometryType': geometry_type,
                'reportIds': member_ids,
                'reportCount': len(member_reports),
                'totalEstimatedWasteKg': round(total_waste_kg, 1),
                'severityScore': priority_score,
                'averageSeverity': avg_sev,
                'maxSeverity': max_sev,
                'urgencyLevel': urgency_level,
                'dominantCategory': dominant_category,
                'dominantWasteCategory': dominant_category,
                'dominantHazard': dominant_hazard,
                'recommendedMachinery': [rec_mach],
                'recommendedMachineryType': rec_mach,
                'status': 'active',
                'createdAt': member_reports[0].get('timestamp', '2026-09-20T08:00:00Z'),
                'lastUpdatedAt': member_reports[-1].get('timestamp', '2026-09-20T10:00:00Z'),
                'zoneName': zone_name
            })

        # Sort hotspots by severity score descending
        hotspots.sort(key=lambda h: h['severityScore'], reverse=True)

        output = {
            'hotspots': hotspots,
            'clusteredReportsCount': clustered_count,
            'noiseReportsCount': noise_count,
            'totalReportsCount': len(valid_reports),
            'clusterAssignments': cluster_assignments,
            'engine': 'python_scikit_learn',
            'parameters': {
                'epsilonMeters': 180,
                'minSamples': 3
            }
        }

        print(json.dumps(output))

    except Exception as e:
        sys.stderr.write(f"DBSCAN clustering failed: {str(e)}\n")
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
