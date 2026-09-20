/**
 * SwachhRoute AI — Deterministic TypeScript DBSCAN Fallback Engine
 * Provides guaranteed in-process clustering if Python microservice is unavailable.
 *
 * NOTE ON PROJECTION:
 * EPSG:3857 provides meter-based projected coordinates suitable for this local
 * Bengaluru demonstration's distance-based clustering.
 * Storage and map display remain in EPSG:4326 (latitude/longitude).
 */

import {
  WasteReport,
  Hotspot,
  ClusteringResult,
  HotspotGeometryType,
  WasteSeverity,
  WasteCategory,
  HazardLevel,
  MachineryType,
  AIMachineryType,
} from '@/types';

const EARTH_RADIUS_METERS = 6378137.0;

/**
 * Projects EPSG:4326 (lat, lng) to EPSG:3857 (x, y in meters).
 */
export function latLngToEPSG3857(lat: number, lng: number): [number, number] {
  const x = EARTH_RADIUS_METERS * ((lng * Math.PI) / 180.0);
  const latRad = (lat * Math.PI) / 180.0;
  const clampedLat = Math.max(Math.min(latRad, Math.PI / 2 - 1e-6), -Math.PI / 2 + 1e-6);
  const y = EARTH_RADIUS_METERS * Math.log(Math.tan(Math.PI / 4.0 + clampedLat / 2.0));
  return [x, y];
}

/**
 * Unprojects EPSG:3857 (x, y in meters) back to EPSG:4326 [lat, lng].
 */
export function epsg3857ToLatLng(x: number, y: number): [number, number] {
  const lng = (x / EARTH_RADIUS_METERS) * (180.0 / Math.PI);
  const latRad = 2.0 * Math.atan(Math.exp(y / EARTH_RADIUS_METERS)) - Math.PI / 2.0;
  const lat = (latRad * 180.0) / Math.PI;
  return [lat, lng];
}

function euclideanDistance(p1: [number, number], p2: [number, number]): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 2D cross product of OA and OB vectors:
 * Returns positive for counter-clockwise turn, negative for clockwise, 0 for collinear.
 */
function crossProduct(
  o: [number, number],
  a: [number, number],
  b: [number, number]
): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

/**
 * Computes Convex Hull using Andrew's Monotone Chain algorithm on projected coordinates.
 * Returns array of [x, y] vertices in counter-clockwise order.
 */
function compute2DConvexHull(points: [number, number][]): [number, number][] {
  if (points.length <= 2) return points;

  // Deduplicate and sort by x then y
  const sorted = [...points].sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));

  // Build lower hull
  const lower: [number, number][] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  // Build upper hull
  const upper: [number, number][] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/**
 * Generates an 8-vertex 35m operational buffer polygon around points
 * used when points are collinear or 2D convex hull collapses.
 */
function generateOperationalBuffer(
  points: [number, number][],
  bufferMeters = 35.0
): [number, number][] {
  const bufferPoints: [number, number][] = [];
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];

  for (const [x, y] of points) {
    for (const deg of angles) {
      const rad = (deg * Math.PI) / 180.0;
      bufferPoints.push([
        x + bufferMeters * Math.cos(rad),
        y + bufferMeters * Math.sin(rad),
      ]);
    }
  }

  return compute2DConvexHull(bufferPoints);
}

function severityToNumeric(sev: WasteSeverity | string): number {
  switch (sev) {
    case 'critical':
      return 9;
    case 'high':
      return 7;
    case 'medium':
      return 5;
    case 'low':
    default:
      return 3;
  }
}

/**
 * Runs deterministic DBSCAN clustering on waste reports.
 */
export function runTypeScriptDBSCAN(
  reports: WasteReport[],
  epsMeters = 180.0,
  minSamples = 3
): ClusteringResult {
  const n = reports.length;
  if (n === 0) {
    return {
      hotspots: [],
      clusteredReportsCount: 0,
      noiseReportsCount: 0,
      totalReportsCount: 0,
      clusterAssignments: {},
      engine: 'deterministic_fallback',
      executionTimeMs: 0,
      parameters: {
        epsilonMeters: epsMeters,
        minSamples,
      },
    };
  }

  const startTime = Date.now();

  // 1. Project to EPSG:3857
  const projected: [number, number][] = reports.map((r) =>
    latLngToEPSG3857(r.latitude, r.longitude)
  );

  // 2. Precompute pairwise distance matrix
  const distMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = euclideanDistance(projected[i], projected[j]);
      distMatrix[i][j] = d;
      distMatrix[j][i] = d;
    }
  }

  // 3. DBSCAN clustering
  // labels: -2 = unvisited, -1 = noise, >= 0 = clusterId
  const labels = new Array<number>(n).fill(-2);
  let clusterId = 0;

  const getRegion = (idx: number): number[] => {
    const neighbors: number[] = [];
    for (let j = 0; j < n; j++) {
      if (distMatrix[idx][j] <= epsMeters) {
        neighbors.push(j);
      }
    }
    return neighbors;
  };

  for (let i = 0; i < n; i++) {
    if (labels[i] !== -2) continue;

    const neighbors = getRegion(i);
    if (neighbors.length < minSamples) {
      labels[i] = -1; // noise
    } else {
      labels[i] = clusterId;
      const queue = [...neighbors];

      let qi = 0;
      while (qi < queue.length) {
        const pt = queue[qi++];
        if (labels[pt] === -1) {
          labels[pt] = clusterId;
        }
        if (labels[pt] === -2) {
          labels[pt] = clusterId;
          const ptNeighbors = getRegion(pt);
          if (ptNeighbors.length >= minSamples) {
            for (const pn of ptNeighbors) {
              if (!queue.includes(pn)) {
                queue.push(pn);
              }
            }
          }
        }
      }
      clusterId++;
    }
  }

  // 4. Aggregate clusters into Hotspot objects
  const clusterGroups = new Map<number, number[]>();
  const clusterAssignments: Record<string, string> = {};
  let noiseReportsCount = 0;
  let clusteredReportsCount = 0;

  // Build cluster label -> hotspot ID map
  const clusterIdMap: Record<number, string> = {};
  let hotCounter = 1;
  for (let i = 0; i < clusterId; i++) {
    clusterIdMap[i] = `HOT-${String(hotCounter).padStart(2, '0')}`;
    hotCounter++;
  }

  for (let i = 0; i < n; i++) {
    const lbl = labels[i];
    const repId = reports[i].id;
    if (lbl === -1) {
      clusterAssignments[repId] = 'noise';
      noiseReportsCount++;
    } else {
      clusterAssignments[repId] = clusterIdMap[lbl] || `HOT-${lbl + 1}`;
      clusteredReportsCount++;
      if (!clusterGroups.has(lbl)) {
        clusterGroups.set(lbl, []);
      }
      clusterGroups.get(lbl)!.push(i);
    }
  }

  const hotspots: Hotspot[] = [];

  for (const [lbl, indices] of clusterGroups.entries()) {
    const clusterReports = indices.map((idx) => reports[idx]);
    const clusterProjected = indices.map((idx) => projected[idx]);

    // Centroid in EPSG:4326
    const avgLat = clusterReports.reduce((s, r) => s + r.latitude, 0) / clusterReports.length;
    const avgLng = clusterReports.reduce((s, r) => s + r.longitude, 0) / clusterReports.length;
    const centerCoordinates: [number, number] = [
      Math.round(avgLat * 100000) / 100000,
      Math.round(avgLng * 100000) / 100000,
    ];

    // Convex Hull & Operational Buffer
    let hullProjected: [number, number][];
    let geometryType: HotspotGeometryType = 'convex_hull';

    const rawHull = compute2DConvexHull(clusterProjected);
    // Check if points are collinear (fewer than 3 unique vertices on hull)
    if (rawHull.length < 3) {
      hullProjected = generateOperationalBuffer(clusterProjected, 35.0);
      geometryType = 'operational_buffer';
    } else {
      hullProjected = rawHull;
      geometryType = 'convex_hull';
    }

    // Convert hull back to EPSG:4326 [lat, lng]
    const boundingPolygon: [number, number][] = hullProjected.map((pt) => {
      const [lat, lng] = epsg3857ToLatLng(pt[0], pt[1]);
      return [Math.round(lat * 100000) / 100000, Math.round(lng * 100000) / 100000];
    });

    // Waste & Priority Metrics
    const totalEstimatedWasteKg = clusterReports.reduce(
      (sum, r) => sum + (r.estimatedWasteKg || 0),
      0
    );

    // Dominant Category
    const catCounts = new Map<WasteCategory, number>();
    for (const r of clusterReports) {
      catCounts.set(r.category, (catCounts.get(r.category) || 0) + 1);
    }
    let dominantCategory: WasteCategory = clusterReports[0].category;
    let maxCatCount = 0;
    for (const [cat, count] of catCounts.entries()) {
      if (count > maxCatCount) {
        maxCatCount = count;
        dominantCategory = cat;
      }
    }

    // Dominant Hazard
    const hazardCounts = new Map<HazardLevel, number>();
    for (const r of clusterReports) {
      const h: HazardLevel = r.hazard || 'none_identified';
      if (h !== 'none_identified') {
        hazardCounts.set(h, (hazardCounts.get(h) || 0) + 1);
      }
    }
    let dominantHazard: HazardLevel = 'none_identified';
    let maxHazardCount = 0;
    for (const [haz, count] of hazardCounts.entries()) {
      if (count > maxHazardCount) {
        maxHazardCount = count;
        dominantHazard = haz;
      }
    }

    // Severity Metrics
    const numericSeverities = clusterReports.map((r) => severityToNumeric(r.severity));
    const avgSeverity =
      numericSeverities.reduce((a, b) => a + b, 0) / numericSeverities.length;
    const maxSeverity = Math.max(...numericSeverities);

    // Deterministic Priority Score: 0 - 100
    const score = Math.min(
      100,
      Math.round(avgSeverity * 6.5 + (totalEstimatedWasteKg / 1000) * 5.0 + maxSeverity * 2.5)
    );

    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (score >= 80 || maxSeverity >= 9) urgencyLevel = 'critical';
    else if (score >= 60 || maxSeverity >= 7) urgencyLevel = 'high';
    else if (score >= 40) urgencyLevel = 'medium';

    // Machinery recommendation (strictly one of: hydraulic_compactor, mini_tipper, backhoe)
    let machineryType: MachineryType = 'hydraulic_compactor';

    const hasBackhoeReport = clusterReports.some((r) =>
      r.machineryRequired?.includes('backhoe')
    );

    if (
      hasBackhoeReport ||
      dominantCategory === 'construction_debris' ||
      dominantHazard === 'sharp_objects' ||
      dominantHazard === 'construction_debris'
    ) {
      machineryType = 'backhoe';
    } else if (
      totalEstimatedWasteKg >= 800 ||
      clusterReports.some((r) => r.machineryRequired?.includes('hydraulic_compactor')) ||
      dominantCategory === 'household' ||
      dominantCategory === 'commercial' ||
      dominantCategory === 'plastic' ||
      dominantHazard === 'biomedical' ||
      dominantHazard === 'drain_flood_risk' ||
      dominantHazard === 'fire_risk'
    ) {
      machineryType = 'hydraulic_compactor';
    } else {
      machineryType = 'mini_tipper';
    }

    const machinery: MachineryType[] = [machineryType];

    // Zone naming from reports if available
    const wardWithCount = new Map<string, number>();
    for (const r of clusterReports) {
      if (r.wardName) {
        wardWithCount.set(r.wardName, (wardWithCount.get(r.wardName) || 0) + 1);
      }
    }
    let zoneName = `Urban Waste Hotspot #${lbl + 1}`;
    if (wardWithCount.size > 0) {
      let topWard = '';
      let topCount = 0;
      for (const [w, c] of wardWithCount.entries()) {
        if (c > topCount) {
          topCount = c;
          topWard = w;
        }
      }
      zoneName = `${topWard} Sector Hotspot`;
    }

    const hotspotId = clusterIdMap[lbl] || `HOT-${String(lbl + 1).padStart(2, '0')}`;

    hotspots.push({
      id: hotspotId,
      clusterLabel: lbl,
      centerCoordinates,
      boundingPolygon,
      geometryType,
      reportIds: clusterReports.map((r) => r.id),
      reportCount: clusterReports.length,
      totalEstimatedWasteKg,
      severityScore: score,
      averageSeverity: Math.round(avgSeverity * 10) / 10,
      maxSeverity,
      urgencyLevel,
      dominantCategory,
      dominantWasteCategory: dominantCategory,
      dominantHazard,
      recommendedMachinery: machinery,
      recommendedMachineryType: machineryType,
      status: 'active',
      createdAt: clusterReports[0]?.timestamp || new Date().toISOString(),
      lastUpdatedAt: clusterReports[clusterReports.length - 1]?.timestamp || new Date().toISOString(),
      zoneName,
    });
  }

  // Sort hotspots by severity score descending
  hotspots.sort((a, b) => b.severityScore - a.severityScore);

  const duration = Date.now() - startTime;

  return {
    hotspots,
    clusteredReportsCount,
    noiseReportsCount,
    totalReportsCount: n,
    clusterAssignments,
    engine: 'deterministic_fallback',
    executionTimeMs: duration,
    parameters: {
      epsilonMeters: epsMeters,
      minSamples,
    },
  };
}
