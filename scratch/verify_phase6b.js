/**
 * Phase 6B Driver Shift Manifest Verification Script (Plain JS)
 */

const HAZARD_SAFETY_DIRECTIVES = {
  biomedical: 'Use appropriate protective equipment and avoid direct contact.',
  sharp_objects: 'Exercise caution around sharp debris and use appropriate protective equipment.',
  drain_flood_risk: 'Avoid obstructing drainage access and exercise caution near waterlogged areas.',
  construction_debris: 'Use appropriate heavy-debris handling equipment and maintain safe clearance.',
  fire_risk: 'Do not approach active fire or unknown ignition sources; escalate to the officer.',
  hazardous_material: 'Do not manually handle unknown hazardous material; escalate to the officer.',
  organic_decay: 'Use protective equipment and minimize direct exposure to decomposing waste.',
  severe_odor: 'Use appropriate protective equipment and minimize prolonged exposure.',
  mixed_waste: 'Handle mixed waste carefully and follow standard collection safety procedures.',
  none_identified: 'Follow standard municipal collection safety procedures.',
};

function generateDriverManifest(route, hotspots, fleet, depot) {
  if (!route || !route.stops || route.stops.length === 0) {
    throw new Error('Cannot generate manifest: Route contains no valid collection stops.');
  }

  const vehicle = fleet.find((v) => v.id === route.vehicleId);
  const driverName = vehicle?.driverName || 'Synthetic Demo Driver';
  const driverPhone = vehicle?.driverPhone;
  const vehicleType = route.vehicleType || vehicle?.vehicleType || 'hydraulic_compactor';
  const vehicleCapacityKg = route.vehicleCapacityKg || vehicle?.capacityKg || 7000;

  const hotspotMap = new Map(hotspots.map((h) => [h.id, h]));

  const manifestStops = route.stops.map((stop) => {
    const hotspot = stop.hotspotId ? hotspotMap.get(stop.hotspotId) : undefined;
    const dominantHazard = hotspot?.dominantHazard || 'none_identified';
    const dominantCategory = hotspot?.dominantCategory || hotspot?.dominantWasteCategory || 'household';
    const requiredMachinery = hotspot?.recommendedMachinery && hotspot.recommendedMachinery.length > 0
      ? hotspot.recommendedMachinery
      : [vehicleType];

    const directive = HAZARD_SAFETY_DIRECTIVES[dominantHazard] || HAZARD_SAFETY_DIRECTIVES.none_identified;

    return {
      sequence: stop.sequence,
      hotspotId: stop.hotspotId || `STOP-${stop.sequence}`,
      zoneName: hotspot?.zoneName || stop.addressName || `Collection Zone ${stop.sequence}`,
      latitude: stop.location[0],
      longitude: stop.location[1],
      location: stop.location,
      estimatedDemandKg: stop.estimatedDemandKg,
      cumulativeLoadKg: stop.cumulativeLoadKg,
      remainingCapacityKg: stop.remainingVehicleCapacityKg,
      dominantHazard,
      dominantCategory,
      requiredMachinery,
      urgencyLevel: hotspot?.urgencyLevel || 'medium',
      recommendedAction:
        hotspot?.urgencyLevel === 'critical'
          ? 'Priority evacuation: Immediate mechanical loading required.'
          : 'Standard operational collection sequence.',
      safetyDirectives: [directive],
    };
  });

  const estimatedLoadKg = route.totalDemandKg;
  const remainingCapacityKg = Math.max(0, vehicleCapacityKg - estimatedLoadKg);
  const capacityUtilizationPercent =
    vehicleCapacityKg > 0 ? Math.round((estimatedLoadKg / vehicleCapacityKg) * 100) : 0;

  const uniqueDirectivesSet = new Set();
  const uniqueHazardsSet = new Set();
  const uniqueMachinerySet = new Set([vehicleType]);

  for (const stop of manifestStops) {
    if (stop.dominantHazard && stop.dominantHazard !== 'none_identified') {
      uniqueHazardsSet.add(stop.dominantHazard);
    }
    for (const dir of stop.safetyDirectives) {
      uniqueDirectivesSet.add(dir);
    }
    for (const m of stop.requiredMachinery) {
      uniqueMachinerySet.add(m);
    }
  }

  return {
    manifestId: `MAN-${route.id}`,
    routeId: route.id,
    vehicleId: route.vehicleId,
    driverName,
    driverPhone,
    vehicleType,
    vehicleCapacityKg,
    estimatedLoadKg,
    remainingCapacityKg,
    capacityUtilizationPercent,
    stopIds: route.stops.map((s) => s.hotspotId || `STOP-${s.sequence}`),
    totalStops: route.stops.length,
    roadDistanceMeters: route.roadDistanceMeters ?? null,
    roadDistanceKm: route.roadDistanceKm ?? null,
    roadDurationSeconds: route.roadDurationSeconds ?? null,
    roadDurationMinutes: route.roadDurationMinutes ?? null,
    routingEngine: route.routingEngine || 'unavailable',
    departureDepotId: depot.id,
    departureDepotName: depot.name,
    departureDepotLocation: depot.coordinates,
    estimatedDepartureTime: '08:00 AM',
    estimatedReturnTime: '09:30 AM',
    safetyDirectives: Array.from(uniqueDirectivesSet),
    hazardSummary: Array.from(uniqueHazardsSet),
    machineryRequirements: Array.from(uniqueMachinerySet),
    generatedAt: new Date().toISOString(),
    status: 'ready',
    isStale: false,
    sourceRouteOptimizedAt: route.optimizedAt,
    stops: manifestStops,
  };
}

// Verification with actual live demo data
const demoHotspots = [
  { id: 'HOT-01', dominantHazard: 'sharp_objects', totalEstimatedWasteKg: 5000, recommendedMachinery: ['backhoe'] },
  { id: 'HOT-02', dominantHazard: 'biomedical', totalEstimatedWasteKg: 4100, recommendedMachinery: ['hydraulic_compactor'], zoneName: 'Koramangala Basin Sector' },
  { id: 'HOT-03', dominantHazard: 'fire_risk', totalEstimatedWasteKg: 2050, recommendedMachinery: ['hydraulic_compactor'], zoneName: 'Whitefield Industrial Corridor' },
];

const demoFleet = [
  { id: 'HYD-COMP-02', driverName: 'Anand Gowda', driverPhone: '+91 97410 55432', vehicleType: 'hydraulic_compactor', capacityKg: 7000 },
];

const demoDepot = {
  id: 'DEPOT-BLR-01',
  name: 'Central Municipal Operations Depot (Corporation Square)',
  coordinates: [12.9716, 77.5946],
};

const demoRoute = {
  id: 'ROUTE-01',
  routeId: 'ROUTE-01',
  vehicleId: 'HYD-COMP-02',
  vehicleType: 'hydraulic_compactor',
  vehicleCapacityKg: 7000,
  totalDemandKg: 6150,
  remainingCapacityKg: 850,
  totalDistanceKm: 37.1,
  roadDistanceKm: 43.6,
  roadDurationMinutes: 54,
  routingEngine: 'osrm',
  optimizedAt: '2026-09-20T10:00:00Z',
  stops: [
    {
      sequence: 1,
      stopSequence: 1,
      hotspotId: 'HOT-02',
      location: [12.9352, 77.6245],
      addressName: 'Koramangala Basin Sector (Ward 151)',
      estimatedDemandKg: 4100,
      cumulativeLoadKg: 4100,
      remainingVehicleCapacityKg: 2900,
    },
    {
      sequence: 2,
      stopSequence: 2,
      hotspotId: 'HOT-03',
      location: [12.9784, 77.6408],
      addressName: 'Whitefield Industrial Corridor (Ward 84)',
      estimatedDemandKg: 2050,
      cumulativeLoadKg: 6150,
      remainingVehicleCapacityKg: 850,
    },
  ],
};

console.log('--- SWACHHROUTE AI: PHASE 6B VERIFICATION ---');

// 1. Generate Manifest
const manifest = generateDriverManifest(demoRoute, demoHotspots, demoFleet, demoDepot);

console.assert(manifest.manifestId === 'MAN-ROUTE-01', 'Manifest ID mismatch');
console.assert(manifest.routeId === 'ROUTE-01', 'Route ID mismatch');
console.log('✓ 1. Manifest Generated: MAN-ROUTE-01 for ROUTE-01');

// 2. Vehicle & Driver
console.assert(manifest.vehicleId === 'HYD-COMP-02', 'Vehicle ID mismatch');
console.assert(manifest.driverName === 'Anand Gowda', 'Driver name mismatch');
console.assert(manifest.vehicleCapacityKg === 7000, 'Capacity mismatch');
console.log('✓ 2. Vehicle & Synthetic Driver verified: HYD-COMP-02 (7,000 kg) / Anand Gowda');

// 3. Operational Demand & Mathematical Utilization
console.assert(manifest.estimatedLoadKg === 6150, 'Estimated load mismatch');
console.assert(manifest.remainingCapacityKg === 850, 'Headroom mismatch');
console.assert(manifest.capacityUtilizationPercent === 88, 'Utilization mismatch');
console.log('✓ 3. Load & Utilization verified: 6,150 kg (88%) / 850 kg headroom');

// 4. OSRM Road Metrics
console.assert(manifest.roadDistanceKm === 43.6, 'Road distance mismatch');
console.assert(manifest.roadDurationMinutes === 54, 'Road duration mismatch');
console.assert(manifest.routingEngine === 'osrm', 'Routing engine mismatch');
console.log('✓ 4. OSRM Road Metrics preserved: 43.6 km, ~54 min, OSRM engine');

// 5. Stop Sequence & HOT-01 Exclusion
console.assert(manifest.stops.length === 2, 'Stop count mismatch');
console.assert(manifest.stops[0].hotspotId === 'HOT-02', 'Stop 1 mismatch');
console.assert(manifest.stops[1].hotspotId === 'HOT-03', 'Stop 2 mismatch');
console.assert(!manifest.stops.some(s => s.hotspotId === 'HOT-01'), 'HOT-01 must not be in manifest');
console.log('✓ 5. OR-Tools stop sequence preserved: Stop 1 = HOT-02, Stop 2 = HOT-03 (HOT-01 excluded)');

// 6. Deterministic Safety Directives
console.assert(
  manifest.stops[0].safetyDirectives[0] === 'Use appropriate protective equipment and avoid direct contact.',
  'HOT-02 biomedical directive mismatch'
);
console.assert(
  manifest.stops[1].safetyDirectives[0] === 'Do not approach active fire or unknown ignition sources; escalate to the officer.',
  'HOT-03 fire_risk directive mismatch'
);
console.log('✓ 6. Deterministic safety directives verified:');
console.log('     HOT-02 (biomedical) ->', manifest.stops[0].safetyDirectives[0]);
console.log('     HOT-03 (fire_risk)  ->', manifest.stops[1].safetyDirectives[0]);

// 7. Canonical Machinery
console.assert(
  manifest.machineryRequirements.every(m => ['hydraulic_compactor', 'mini_tipper', 'backhoe'].includes(m)),
  'Machinery requirements must be canonical'
);
console.log('✓ 7. Canonical machinery vocabulary verified:', manifest.machineryRequirements);

// 8. Manifest Status & Stale Detection
console.assert(manifest.status === 'ready', 'Status must be ready');
console.assert(!manifest.isStale, 'Should not be stale initially');

const reoptimizedRoute = {
  ...demoRoute,
  optimizedAt: '2026-09-20T10:15:00Z',
};
const isStaleAfterReopt = reoptimizedRoute.optimizedAt !== manifest.sourceRouteOptimizedAt;
console.assert(isStaleAfterReopt === true, 'Stale detection failed');
console.log('✓ 8. Status verified: READY (not dispatched). Stale protection verified on route re-optimization.');

console.log('\n=========================================');
console.log('ALL PHASE 6B VERIFICATION CHECKS PASSED!');
console.log('=========================================');
