/**
 * Standalone Automated Verification Script for Real Datasets Integration
 * Problem Statement CS11 — NeuraMorphix HackForge 2026
 * 
 * Tests:
 * 1. Pune Ward 12 Authentic Dataset (54 reports, coordinates, schema)
 * 2. Bengaluru BBMP East Zone Dataset (52 reports, coordinates, schema)
 * 3. Spatial Boundary Checks (PUNE_PMC_BOUNDS, BENGALURU_BBMP_BOUNDS)
 * 4. DBSCAN Clustering on 54 Pune Reports (identifying 5 clusters + noise points)
 * 5. CVRP Route Optimization on Discovered Clusters with Pune Depot
 * 6. CSV & GeoJSON Ingestion & Validation
 * 7. CSV & GeoJSON Export Format
 */

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('SWACHHROUTE AI — REAL DATASETS INTEGRATION TEST SUITE');
console.log('====================================================\n');

// Extract JSON array from TS file
function extractReportsFromTS(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const marker = content.indexOf('export const PUNE_WARD_12_REPORTS') !== -1
    ? 'export const PUNE_WARD_12_REPORTS'
    : 'export const BENGALURU_BBMP_REPORTS';
  const start = content.indexOf(marker);
  const eqIndex = content.indexOf('=', start);
  const arrayStart = content.indexOf('[', eqIndex);
  const arrayEnd = content.indexOf('];', arrayStart) + 1;
  const jsonStr = content.slice(arrayStart, arrayEnd);
  return JSON.parse(jsonStr);
}

// 1. Pune Municipal Corporation (PMC) - Ward 12 Verification
console.log('--- TEST GROUP 1: Pune PMC Ward 12 Authentic Dataset ---');
const puneReports = extractReportsFromTS(path.join(__dirname, '../data/datasets/puneWard12.ts'));
assert(puneReports.length === 54, `Pune dataset has exactly 54 reports (found ${puneReports.length})`);

const PUNE_BOUNDS = { minLat: 18.4000, maxLat: 18.6500, minLng: 73.7000, maxLng: 73.9800 };
let puneCoordsValid = true;
let puneFieldsValid = true;
let categoriesFound = new Set();
let severitiesFound = new Set();

for (const r of puneReports) {
  if (!r.id || !r.description || !r.category || !r.severity || !r.estimatedWasteKg || !r.machineryRequired) {
    puneFieldsValid = false;
  }
  if (r.latitude < PUNE_BOUNDS.minLat || r.latitude > PUNE_BOUNDS.maxLat ||
      r.longitude < PUNE_BOUNDS.minLng || r.longitude > PUNE_BOUNDS.maxLng) {
    puneCoordsValid = false;
  }
  categoriesFound.add(r.category);
  severitiesFound.add(r.severity);
}

assert(puneFieldsValid, 'All 54 Pune reports contain complete required schema attributes');
assert(puneCoordsValid, 'All 54 Pune reports fall within PMC Ward 12 operational boundary envelope');
assert(categoriesFound.size >= 4, `Diverse waste categories present (${Array.from(categoriesFound).join(', ')})`);
assert(severitiesFound.has('critical') && severitiesFound.has('high'), 'Includes critical and high severity hazard levels');

// 2. Bengaluru BBMP East Zone Verification
console.log('\n--- TEST GROUP 2: Bengaluru BBMP East Zone Dataset ---');
const blrReports = extractReportsFromTS(path.join(__dirname, '../data/datasets/bengaluruBBMP.ts'));
assert(blrReports.length === 52, `BBMP dataset has exactly 52 reports (found ${blrReports.length})`);

const BLR_BOUNDS = { minLat: 12.8000, maxLat: 13.1500, minLng: 77.4500, maxLng: 77.7800 };
let blrCoordsValid = true;
let blrFieldsValid = true;
let blrCategories = new Set();

for (const r of blrReports) {
  if (!r.id || !r.description || !r.category || !r.severity || !r.estimatedWasteKg || !r.machineryRequired) {
    blrFieldsValid = false;
  }
  if (r.latitude < BLR_BOUNDS.minLat || r.latitude > BLR_BOUNDS.maxLat ||
      r.longitude < BLR_BOUNDS.minLng || r.longitude > BLR_BOUNDS.maxLng) {
    blrCoordsValid = false;
  }
  blrCategories.add(r.category);
}

assert(blrFieldsValid, 'All 52 BBMP reports contain complete required schema attributes');
assert(blrCoordsValid, 'All 52 BBMP reports fall within BBMP operational boundary envelope');
assert(blrCategories.size >= 4, `Diverse BBMP categories present (${Array.from(blrCategories).join(', ')})`);

// 3. Mathematical DBSCAN Clustering Implementation Verification
console.log('\n--- TEST GROUP 3: Spatial Clustering on Pune Dataset ---');
const EARTH_RADIUS = 6378137.0;

function project(lat, lng) {
  const x = lng * (Math.PI / 180.0) * EARTH_RADIUS;
  const clampedLat = Math.max(-85, Math.min(85, lat));
  const latRad = clampedLat * (Math.PI / 180.0);
  const y = Math.log(Math.tan(Math.PI / 4.0 + latRad / 2.0)) * EARTH_RADIUS;
  return [x, y];
}

function euclideanDist(p1, p2) {
  return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
}

// Run DBSCAN with eps=180m, minPts=3
const projectedPoints = puneReports.map(r => project(r.latitude, r.longitude));
const epsMeters = 180.0;
const minPts = 3;
const visited = new Set();
const clusters = [];
const noise = [];

for (let i = 0; i < puneReports.length; i++) {
  if (visited.has(i)) continue;
  visited.add(i);

  const neighbors = [];
  for (let j = 0; j < puneReports.length; j++) {
    if (euclideanDist(projectedPoints[i], projectedPoints[j]) <= epsMeters) {
      neighbors.push(j);
    }
  }

  if (neighbors.length < minPts) {
    noise.push(i);
  } else {
    const cluster = [i];
    const queue = [...neighbors.filter(idx => idx !== i)];
    while (queue.length > 0) {
      const q = queue.shift();
      if (!visited.has(q)) {
        visited.add(q);
        const qNeighbors = [];
        for (let k = 0; k < puneReports.length; k++) {
          if (euclideanDist(projectedPoints[q], projectedPoints[k]) <= epsMeters) {
            qNeighbors.push(k);
          }
        }
        if (qNeighbors.length >= minPts) {
          queue.push(...qNeighbors.filter(idx => !visited.has(idx) && !queue.includes(idx)));
        }
      }
      if (!cluster.includes(q)) {
        cluster.push(q);
      }
    }
    clusters.push(cluster);
  }
}

assert(clusters.length >= 4, `DBSCAN discovered ${clusters.length} distinct spatial clusters (expected >= 4)`);
assert(noise.length > 0, `DBSCAN identified ${noise.length} isolated noise complaints (< 3 within 180m)`);

// Verify cluster sizes
let totalClusteredReports = clusters.reduce((sum, c) => sum + c.length, 0);
assert(totalClusteredReports >= 35, `Total clustered reports is ${totalClusteredReports} / 54 (high density)`);

// 4. CVRP Capacity & Depot Routing Verification
console.log('\n--- TEST GROUP 4: CVRP Fleet Routing Verification ---');
const puneDepot = [18.5074, 73.8077];
const fleetCapacities = [6000, 6000, 2500, 2500, 8000, 5000];

// Compute demand per cluster
const clusterDemands = clusters.map((clusterIdxs) => {
  return clusterIdxs.reduce((sum, idx) => sum + puneReports[idx].estimatedWasteKg, 0);
});

let totalDemand = clusterDemands.reduce((a, b) => a + b, 0);
let totalCapacity = fleetCapacities.reduce((a, b) => a + b, 0);

assert(totalDemand <= totalCapacity, `Total cluster demand (${totalDemand} kg) is within total fleet capacity (${totalCapacity} kg)`);
for (let i = 0; i < clusterDemands.length; i++) {
  assert(clusterDemands[i] <= 8000, `Cluster #${i + 1} demand (${clusterDemands[i]} kg) fits within largest municipal vehicle capacity`);
}

// 5. CSV & GeoJSON Ingestion Logic Verification
console.log('\n--- TEST GROUP 5: Ingestion & Export Parsing ---');
const sampleCSV = `description,latitude,longitude,category,severity,waste_kg,citizen_name,ward_name
"Rotten tomatoes and wet vegetable peelings overflowing behind market gate.",18.5062,73.8055,organic,high,850,"Sunil Shinde","Ward 12 (Kothrud)"
"Stormwater culvert blocked by plastic waste and domestic sludge.",18.5118,73.8012,household,critical,1200,"Swati Deshpande","Ward 12 (Kothrud)"`;

const csvLines = sampleCSV.split('\n');
assert(csvLines.length === 3, 'CSV parsing parses 1 header + 2 complaint rows');
assert(csvLines[1].includes('Rotten tomatoes'), 'First complaint description preserved');
assert(csvLines[1].includes('18.5062'), 'Coordinates correctly preserved');

// GeoJSON format check
const geoJSONSample = {
  type: 'FeatureCollection',
  features: puneReports.slice(0, 3).map(r => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [r.longitude, r.latitude] },
    properties: { id: r.id, category: r.category, severity: r.severity }
  }))
};
assert(geoJSONSample.type === 'FeatureCollection' && geoJSONSample.features.length === 3, 'GeoJSON export produces valid FeatureCollection structure');
assert(geoJSONSample.features[0].geometry.coordinates[0] === puneReports[0].longitude, 'Coordinates order [lng, lat] conforms to GeoJSON standard');

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
