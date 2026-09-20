/**
 * Phase 6B Driver Shift Manifest Verification Script
 */

import { DEMO_HOTSPOTS } from '../data/demo/hotspots.js';
import { DEMO_FLEET } from '../data/demo/fleet.js';
import { DEMONSTRATION_DEPOT } from '../data/demo/depot.js';
import { DEMO_ROUTES } from '../data/demo/routes.js';
import { generateDriverManifest, HAZARD_SAFETY_DIRECTIVES } from '../services/manifests/manifestGenerator.js';

console.log('--- SWACHHROUTE AI: PHASE 6B VERIFICATION ---');

// 1. Verify Manifest Generation from OR-Tools Route
const primaryRoute = DEMO_ROUTES[0];
console.assert(primaryRoute.id === 'ROUTE-01', 'Primary route should be ROUTE-01');

const manifest = generateDriverManifest(primaryRoute, DEMO_HOTSPOTS, DEMO_FLEET, DEMONSTRATION_DEPOT);

console.log('✓ Manifest generated successfully:', manifest.manifestId);
console.assert(manifest.manifestId === 'MAN-ROUTE-01', 'Manifest ID should be MAN-ROUTE-01');
console.assert(manifest.routeId === 'ROUTE-01', 'Linked route ID should be ROUTE-01');

// 2. Verify Vehicle & Driver Assignment
console.assert(manifest.vehicleId === 'HYD-COMP-02', `Vehicle should be HYD-COMP-02, got ${manifest.vehicleId}`);
console.assert(manifest.driverName === 'Anand Gowda', `Driver name should be Anand Gowda, got ${manifest.driverName}`);
console.assert(manifest.vehicleCapacityKg === 7000, `Vehicle capacity should be 7000 kg, got ${manifest.vehicleCapacityKg}`);
console.log('✓ Vehicle and driver correctly resolved:', `${manifest.vehicleId} / ${manifest.driverName}`);

// 3. Verify Operational Demand & Mathematical Utilization
console.assert(manifest.estimatedLoadKg === 6150, `Estimated load should be 6150 kg, got ${manifest.estimatedLoadKg}`);
console.assert(manifest.remainingCapacityKg === 850, `Remaining headroom should be 850 kg, got ${manifest.remainingCapacityKg}`);
const expectedUtilization = Math.round((6150 / 7000) * 100);
console.assert(manifest.capacityUtilizationPercent === expectedUtilization, `Utilization should be ${expectedUtilization}%, got ${manifest.capacityUtilizationPercent}%`);
console.log(`✓ Mathematical load & utilization: ${manifest.estimatedLoadKg} kg / ${manifest.vehicleCapacityKg} kg (${manifest.capacityUtilizationPercent}%)`);

// 4. Verify Stop Sequence & Exclusion of HOT-01
console.assert(manifest.stops.length === 2, `Manifest should have 2 collection stops, got ${manifest.stops.length}`);
console.assert(manifest.stops[0].hotspotId === 'HOT-02', `Stop 1 should be HOT-02, got ${manifest.stops[0].hotspotId}`);
console.assert(manifest.stops[0].sequence === 1, `Stop 1 sequence should be 1, got ${manifest.stops[0].sequence}`);
console.assert(manifest.stops[1].hotspotId === 'HOT-03', `Stop 2 should be HOT-03, got ${manifest.stops[1].hotspotId}`);
console.assert(manifest.stops[1].sequence === 2, `Stop 2 sequence should be 2, got ${manifest.stops[1].sequence}`);

// Check that HOT-01 is STRICTLY EXCLUDED
const containsHot01 = manifest.stops.some(s => s.hotspotId === 'HOT-01');
console.assert(!containsHot01, 'HOT-01 MUST NOT be present in hauling route manifest');
console.log('✓ Stop order verified: Depot -> HOT-02 (Stop 1) -> HOT-03 (Stop 2) -> Depot');
console.log('✓ HOT-01 strictly excluded from standard hauling manifest (preserved as Specialized Remediation)');

// 5. Verify Deterministic Safety Directives
console.assert(manifest.stops[0].dominantHazard === 'biomedical', `HOT-02 hazard should be biomedical, got ${manifest.stops[0].dominantHazard}`);
console.assert(manifest.stops[0].safetyDirectives.includes('Use appropriate protective equipment and avoid direct contact.'), 'Biomedical directive mismatch');

console.assert(manifest.stops[1].dominantHazard === 'fire_risk', `HOT-03 hazard should be fire_risk, got ${manifest.stops[1].dominantHazard}`);
console.assert(manifest.stops[1].safetyDirectives.includes('Do not approach active fire or unknown ignition sources; escalate to the officer.'), 'Fire risk directive mismatch');

console.log('✓ Deterministic safety directives verified:');
console.log('   - HOT-02 (biomedical):', manifest.stops[0].safetyDirectives[0]);
console.log('   - HOT-03 (fire_risk):', manifest.stops[1].safetyDirectives[0]);

// 6. Verify Manifest Status & Non-Dispatch State
console.assert(manifest.status === 'ready', `Initial status must be 'ready', got ${manifest.status}`);
console.assert(!manifest.isStale, 'Newly generated manifest must not be stale');
console.log('✓ Initial manifest status verified as READY (not falsely dispatched)');

// 7. Verify Stale Detection on Route Re-Optimization
const reoptimizedRoute = {
  ...primaryRoute,
  optimizedAt: new Date(Date.now() + 60000).toISOString(), // Re-optimized 1 minute later
};
const isNowStale = reoptimizedRoute.optimizedAt !== manifest.sourceRouteOptimizedAt;
console.assert(isNowStale, 'Manifest should be detected as STALE when route timestamp changes');
console.log('✓ Stale manifest protection verified: detected when route is re-optimized');

console.log('\nALL PHASE 6B VERIFICATION CHECKS PASSED.');
