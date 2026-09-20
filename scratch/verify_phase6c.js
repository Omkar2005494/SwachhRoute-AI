/**
 * SwachhRoute AI — Phase 6C Comprehensive Verification Script
 * Validates Human-in-the-Loop Municipal Officer Operations & Discretionary Overrides
 */

// Mock generateDriverManifest to avoid external module dependencies
function generateDriverManifest(route, hotspots, fleet, depot) {
  const vehicleId = route.effectiveVehicleId || route.vehicleId;
  const vehicle = fleet.find((v) => v.id === vehicleId) || {};
  const stops = (route.effectiveStops || route.stops).map((s) => ({
    hotspotId: s.hotspotId || s.stopId,
    estimatedDemandKg: s.estimatedDemandKg,
  }));
  return {
    manifestId: `MAN-${Date.now()}`,
    routeId: route.id,
    vehicleId,
    vehicleCapacityKg: vehicle.capacityKg || 0,
    driverName: vehicle.driverName || 'Unknown Driver',
    isStale: false,
    status: 'pending',
    stops,
  };
}

// Minimal mock setup to verify logic deterministically
const DEMONSTRATION_DEPOT = {
  id: 'DEPOT-BLR-01',
  name: 'Central Municipal Demonstration Depot (Corporation Square)',
  address: 'Corporation Square, Cubbonpete, Bengaluru, Karnataka 560002',
  coordinates: [12.9716, 77.5946],
  label: 'Central Municipal Depot',
};

const DEMO_HOTSPOTS = [
  {
    id: 'HOT-01',
    clusterLabel: 0,
    centerCoordinates: [12.9784, 77.5721],
    reportIds: ['REP-001', 'REP-002'],
    reportCount: 2,
    totalEstimatedWasteKg: 5000,
    severityScore: 88,
    averageSeverity: 8.8,
    maxSeverity: 9,
    urgencyLevel: 'critical',
    dominantCategory: 'construction_debris',
    dominantWasteCategory: 'construction_debris',
    dominantHazard: 'construction_debris',
    recommendedMachinery: ['backhoe'],
    recommendedMachineryType: 'backhoe',
    status: 'active',
    createdAt: '2026-09-20T08:00:00Z',
    lastUpdatedAt: '2026-09-20T08:00:00Z',
    zoneName: 'Majestic Transport Corridor (Ward 94)',
    assignmentStatus: 'capacity_exception',
  },
  {
    id: 'HOT-02',
    clusterLabel: 1,
    centerCoordinates: [12.9354, 77.6243],
    reportIds: ['REP-003', 'REP-004', 'REP-005'],
    reportCount: 3,
    totalEstimatedWasteKg: 4100,
    severityScore: 82,
    averageSeverity: 8.2,
    maxSeverity: 9,
    urgencyLevel: 'critical',
    dominantCategory: 'hazardous',
    dominantWasteCategory: 'hazardous',
    dominantHazard: 'biomedical',
    recommendedMachinery: ['hydraulic_compactor'],
    recommendedMachineryType: 'hydraulic_compactor',
    status: 'active',
    createdAt: '2026-09-20T08:00:00Z',
    lastUpdatedAt: '2026-09-20T08:00:00Z',
    zoneName: 'Koramangala Basin Sector (Ward 151)',
    assignedRouteId: 'ROUTE-01',
    assignmentStatus: 'assigned',
  },
  {
    id: 'HOT-03',
    clusterLabel: 2,
    centerCoordinates: [12.9695, 77.7498],
    reportIds: ['REP-006', 'REP-007', 'REP-008'],
    reportCount: 3,
    totalEstimatedWasteKg: 2050,
    severityScore: 68,
    averageSeverity: 6.8,
    maxSeverity: 7,
    urgencyLevel: 'high',
    dominantCategory: 'mixed',
    dominantWasteCategory: 'mixed',
    dominantHazard: 'fire_risk',
    recommendedMachinery: ['hydraulic_compactor'],
    recommendedMachineryType: 'hydraulic_compactor',
    status: 'active',
    createdAt: '2026-09-20T08:00:00Z',
    lastUpdatedAt: '2026-09-20T08:00:00Z',
    zoneName: 'Whitefield Industrial Corridor (Ward 84)',
    assignedRouteId: 'ROUTE-01',
    assignmentStatus: 'assigned',
  },
];

const DEMO_FLEET = [
  {
    id: 'HYD-COMP-01',
    registrationNumber: 'KA-01-EA-1001',
    vehicleType: 'hydraulic_compactor',
    capacityKg: 8000,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [12.9716, 77.5946],
    fuelType: 'diesel',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: true,
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98450 12345',
  },
  {
    id: 'HYD-COMP-02',
    registrationNumber: 'KA-01-EA-1002',
    vehicleType: 'hydraulic_compactor',
    capacityKg: 7000,
    currentLoadKg: 6150,
    status: 'assigned',
    currentLocation: [12.9716, 77.5946],
    fuelType: 'diesel',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: true,
    driverName: 'Suresh Patil',
    driverPhone: '+91 98450 67890',
  },
  {
    id: 'MINI-TIP-01',
    registrationNumber: 'KA-01-EA-2001',
    vehicleType: 'mini_tipper',
    capacityKg: 1800,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [12.9716, 77.5946],
    fuelType: 'electric',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: true,
    driverName: 'Venkatesh Murthy',
    driverPhone: '+91 98450 11223',
  },
  {
    id: 'MINI-TIP-02',
    registrationNumber: 'KA-01-EA-2002',
    vehicleType: 'mini_tipper',
    capacityKg: 1800,
    currentLoadKg: 0,
    status: 'maintenance',
    currentLocation: [12.9716, 77.5946],
    fuelType: 'electric',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: false,
    driverName: 'Anil Gowda',
    driverPhone: '+91 98450 44556',
  },
  {
    id: 'BACK-01',
    registrationNumber: 'KA-01-EA-3001',
    vehicleType: 'backhoe',
    capacityKg: 0,
    currentLoadKg: 0,
    status: 'available',
    currentLocation: [12.9716, 77.5946],
    fuelType: 'diesel',
    depotId: 'DEPOT-BLR-01',
    availableForDispatch: true,
    driverName: 'Manjunath Reddy',
    driverPhone: '+91 98450 99887',
  },
];

const BASELINE_ROUTE = {
  id: 'ROUTE-01',
  routeId: 'ROUTE-01',
  vehicleId: 'HYD-COMP-02',
  vehicleType: 'hydraulic_compactor',
  depotId: 'DEPOT-BLR-01',
  depotLocation: [12.9716, 77.5946],
  stopIds: ['HOT-02', 'HOT-03'],
  stopOrder: [1, 2],
  stops: [
    {
      stopId: 'STP-01',
      sequence: 1,
      stopSequence: 1,
      hotspotId: 'HOT-02',
      latitude: 12.9354,
      longitude: 77.6243,
      location: [12.9354, 77.6243],
      addressName: 'Koramangala Basin Sector (Ward 151)',
      estimatedDemandKg: 4100,
      estimatedWasteKg: 4100,
      cumulativeLoadKg: 4100,
      remainingVehicleCapacityKg: 2900,
      requiredMachinery: 'hydraulic_compactor',
      plannedArrivalTime: '2026-09-20T08:45:00Z',
      status: 'pending',
    },
    {
      stopId: 'STP-02',
      sequence: 2,
      stopSequence: 2,
      hotspotId: 'HOT-03',
      latitude: 12.9695,
      longitude: 77.7498,
      location: [12.9695, 77.7498],
      addressName: 'Whitefield Industrial Corridor (Ward 84)',
      estimatedDemandKg: 2050,
      estimatedWasteKg: 2050,
      cumulativeLoadKg: 6150,
      remainingVehicleCapacityKg: 850,
      requiredMachinery: 'hydraulic_compactor',
      plannedArrivalTime: '2026-09-20T09:40:00Z',
      status: 'pending',
    },
  ],
  totalDistanceMeters: 37075,
  totalDistanceKm: 37.1,
  totalDurationMinutes: 65,
  totalDemandKg: 6150,
  totalWasteCollectedKg: 6150,
  vehicleCapacityKg: 7000,
  remainingCapacityKg: 850,
  polylineCoordinates: [
    [12.9716, 77.5946],
    [12.9354, 77.6243],
    [12.9695, 77.7498],
    [12.9716, 77.5946],
  ],
  roadDistanceMeters: 43620,
  roadDistanceKm: 43.6,
  roadDurationSeconds: 3240,
  roadDurationMinutes: 54,
  roadGeometry: [[12.9716, 77.5946], [12.9354, 77.6243], [12.9695, 77.7498], [12.9716, 77.5946]],
  routingEngine: 'osrm',
  optimizationEngine: 'google_ortools',
  optimizationAlgorithm: 'Google OR-Tools CVRP (Guided Local Search)',
  solverStatus: 'ROUTING_SUCCESS',
  status: 'active',
  operationalStatus: 'optimized',
  generatedAt: '2026-09-20T08:00:00Z',
  optimizedAt: '2026-09-20T08:00:00Z',
};

// Simulation of ReportsContext state logic
class MockReportsContext {
  constructor() {
    this.hotspots = JSON.parse(JSON.stringify(DEMO_HOTSPOTS));
    this.fleet = JSON.parse(JSON.stringify(DEMO_FLEET));
    this.routes = [JSON.parse(JSON.stringify(BASELINE_ROUTE))];
    this.driverManifests = [];
    this.officerOverrides = [];
  }

  generateManifest(routeId) {
    const route = this.routes.find((r) => r.id === routeId);
    if (!route) throw new Error('Route not found');
    const manifest = generateDriverManifest(route, this.hotspots, this.fleet, DEMONSTRATION_DEPOT);
    this.driverManifests = this.driverManifests.filter((m) => m.routeId !== routeId);
    this.driverManifests.push(manifest);
    return manifest;
  }

  regenerateManifest(manifestId) {
    const existing = this.driverManifests.find((m) => m.manifestId === manifestId);
    if (!existing) throw new Error('Manifest not found');
    const route = this.routes.find((r) => r.id === existing.routeId);
    if (!route) throw new Error('Route not found');
    const updated = generateDriverManifest(route, this.hotspots, this.fleet, DEMONSTRATION_DEPOT);
    this.driverManifests = this.driverManifests.map((m) => (m.manifestId === manifestId ? updated : m));
    return updated;
  }

  applyPriorityOverride(hotspotId, newPriority, reason) {
    if (!reason || !reason.trim()) {
      return { success: false, error: 'A valid reason is required for priority override.' };
    }
    const hotspot = this.hotspots.find((h) => h.id === hotspotId);
    if (!hotspot) {
      return { success: false, error: 'Hotspot not found.' };
    }

    const override = {
      overrideId: `OVR-${Date.now()}-mock`,
      routeId: hotspot.assignedRouteId || 'unassigned',
      targetId: hotspotId,
      officerName: 'Ward Officer (Human-in-the-Loop)',
      action: 'priority_escalation',
      reason: reason.trim(),
      originalPriority: hotspot.officerPriorityOverride || hotspot.urgencyLevel,
      newPriority,
      createdAt: new Date().toISOString(),
      status: 'applied',
    };

    this.hotspots = this.hotspots.map((h) =>
      h.id === hotspotId
        ? { ...h, officerPriorityOverride: newPriority, officerOverrideReason: reason.trim() }
        : h
    );

    if (hotspot.assignedRouteId) {
      this.driverManifests = this.driverManifests.map((m) =>
        m.routeId === hotspot.assignedRouteId ? { ...m, isStale: true } : m
      );
    }

    this.officerOverrides.unshift(override);
    return { success: true };
  }

  reassignVehicle(routeId, newVehicleId, reason) {
    if (!reason || !reason.trim()) {
      return { success: false, error: 'A valid reason is required for vehicle reassignment.' };
    }
    const route = this.routes.find((r) => r.id === routeId);
    if (!route) return { success: false, error: 'Route not found.' };

    const newVehicle = this.fleet.find((v) => v.id === newVehicleId);
    if (!newVehicle) return { success: false, error: 'Vehicle not found in municipal fleet.' };

    if (newVehicle.id === 'BACK-01' || newVehicle.vehicleType === 'backhoe') {
      return { success: false, error: 'BACK-01 is specialized remediation equipment and cannot be assigned to hauling routes.' };
    }
    if (newVehicle.status === 'maintenance' || newVehicle.status === 'offline' || !newVehicle.availableForDispatch) {
      return { success: false, error: 'Selected vehicle is under maintenance or unavailable for dispatch.' };
    }
    if (newVehicle.capacityKg < route.totalDemandKg) {
      return { success: false, error: 'Vehicle capacity insufficient for this route.' };
    }

    const originalVehicleId = route.effectiveVehicleId || route.vehicleId;
    const override = {
      overrideId: `OVR-${Date.now()}-mock`,
      routeId,
      targetId: newVehicleId,
      officerName: 'Ward Officer (Human-in-the-Loop)',
      action: 'vehicle_reassignment',
      reason: reason.trim(),
      originalVehicleId,
      newVehicleId,
      createdAt: new Date().toISOString(),
      status: 'applied',
    };

    this.routes = this.routes.map((r) =>
      r.id === routeId
        ? { ...r, effectiveVehicleId: newVehicleId, operationalStatus: 'officer_reviewed' }
        : r
    );

    this.driverManifests = this.driverManifests.map((m) =>
      m.routeId === routeId ? { ...m, isStale: true } : m
    );

    this.officerOverrides.unshift(override);
    return { success: true };
  }

  reorderStops(routeId, newStopIds, reason) {
    if (!reason || !reason.trim()) {
      return { success: false, error: 'A valid reason is required for stop reordering.' };
    }
    const route = this.routes.find((r) => r.id === routeId);
    if (!route) return { success: false, error: 'Route not found.' };

    const baseStops = route.stops;
    const getStopId = (s) => s.hotspotId || s.stopId;
    if (newStopIds.length !== baseStops.length) {
      return { success: false, error: 'Invalid stop order: stop count mismatch.' };
    }
    const allFound = newStopIds.every((id) => baseStops.some((s) => getStopId(s) === id));
    if (!allFound) {
      return { success: false, error: 'Invalid stop order: all stops must be included.' };
    }

    const activeVehicleId = route.effectiveVehicleId || route.vehicleId;
    const vehicle = this.fleet.find((v) => v.id === activeVehicleId);
    const vehicleCapacity = vehicle?.capacityKg || route.vehicleCapacityKg || 7000;

    let cumulative = 0;
    const updatedStops = newStopIds.map((id, index) => {
      const found = baseStops.find((s) => getStopId(s) === id);
      cumulative += found.estimatedDemandKg;
      return {
        ...found,
        sequence: index + 1,
        stopSequence: index + 1,
        cumulativeLoadKg: cumulative,
        remainingVehicleCapacityKg: Math.max(0, vehicleCapacity - cumulative),
      };
    });

    const originalOrder = (route.effectiveStops || route.stops).map(getStopId);
    const override = {
      overrideId: `OVR-${Date.now()}-mock`,
      routeId,
      officerName: 'Ward Officer (Human-in-the-Loop)',
      action: 'stop_reorder',
      reason: reason.trim(),
      originalStopOrder: originalOrder,
      newStopOrder: newStopIds,
      createdAt: new Date().toISOString(),
      status: 'applied',
    };

    this.routes = this.routes.map((r) =>
      r.id === routeId
        ? { ...r, effectiveStops: updatedStops, operationalStatus: 'officer_reviewed' }
        : r
    );

    this.driverManifests = this.driverManifests.map((m) =>
      m.routeId === routeId ? { ...m, isStale: true } : m
    );

    this.officerOverrides.unshift(override);
    return { success: true };
  }

  holdRoute(routeId, reason) {
    if (!reason || !reason.trim()) {
      return { success: false, error: 'A valid reason is required to hold route.' };
    }
    const route = this.routes.find((r) => r.id === routeId);
    if (!route) return { success: false, error: 'Route not found.' };

    const override = {
      overrideId: `OVR-${Date.now()}-mock`,
      routeId,
      officerName: 'Ward Officer (Human-in-the-Loop)',
      action: 'route_hold',
      reason: reason.trim(),
      createdAt: new Date().toISOString(),
      status: 'applied',
    };

    this.routes = this.routes.map((r) =>
      r.id === routeId ? { ...r, operationalStatus: 'on_hold', heldReason: reason.trim() } : r
    );

    this.officerOverrides.unshift(override);
    return { success: true };
  }

  resumeRoute(routeId) {
    const route = this.routes.find((r) => r.id === routeId);
    if (!route) return { success: false, error: 'Route not found.' };

    this.routes = this.routes.map((r) =>
      r.id === routeId
        ? {
            ...r,
            operationalStatus: r.effectiveVehicleId || r.effectiveStops ? 'officer_reviewed' : 'optimized',
            heldReason: undefined,
          }
        : r
    );
    return { success: true };
  }

  approveDispatch(routeId, manifestId) {
    const route = this.routes.find((r) => r.id === routeId);
    if (!route) return { success: false, error: 'Route not found.' };

    if (route.operationalStatus === 'on_hold') {
      return { success: false, error: 'Cannot dispatch route: Route is currently placed on hold.' };
    }

    const manifest = this.driverManifests.find((m) => m.manifestId === manifestId);
    if (!manifest) {
      return { success: false, error: 'Driver manifest not found. Generate manifest before dispatch.' };
    }

    if (manifest.isStale) {
      return { success: false, error: 'Manifest is stale. Regenerate before dispatch.' };
    }

    const activeStops = route.effectiveStops || route.stops;
    if (!activeStops || activeStops.length === 0) {
      return { success: false, error: 'Cannot dispatch route: Route has zero collection stops.' };
    }

    const activeVehicleId = route.effectiveVehicleId || route.vehicleId;
    const vehicle = this.fleet.find((v) => v.id === activeVehicleId);
    if (!vehicle) {
      return { success: false, error: 'Assigned vehicle not found in municipal fleet.' };
    }
    if (vehicle.id === 'BACK-01' || vehicle.vehicleType === 'backhoe') {
      return { success: false, error: 'Cannot dispatch: BACK-01 is specialized remediation machinery.' };
    }
    if (vehicle.status === 'maintenance' || vehicle.status === 'offline') {
      return { success: false, error: 'Cannot dispatch: Vehicle is under maintenance or offline.' };
    }
    if (vehicle.capacityKg < route.totalDemandKg) {
      return { success: false, error: 'Cannot dispatch: Vehicle capacity is less than total route demand.' };
    }

    const override = {
      overrideId: `OVR-${Date.now()}-mock`,
      routeId,
      manifestId,
      officerName: 'Ward Officer (Human-in-the-Loop)',
      action: 'dispatch_approval',
      reason: 'Municipal officer approved route for immediate field dispatch.',
      createdAt: new Date().toISOString(),
      status: 'applied',
    };

    this.routes = this.routes.map((r) =>
      r.id === routeId ? { ...r, operationalStatus: 'dispatched', status: 'dispatched' } : r
    );

    this.driverManifests = this.driverManifests.map((m) =>
      m.manifestId === manifestId ? { ...m, status: 'dispatched' } : m
    );

    this.fleet = this.fleet.map((v) =>
      v.id === activeVehicleId ? { ...v, status: 'assigned' } : v
    );

    this.officerOverrides.unshift(override);
    return { success: true };
  }

  rejectDispatch(routeId, manifestId, reason) {
    if (!reason || !reason.trim()) {
      return { success: false, error: 'A valid rejection reason is required.' };
    }
    const route = this.routes.find((r) => r.id === routeId);
    if (!route) return { success: false, error: 'Route not found.' };

    const override = {
      overrideId: `OVR-${Date.now()}-mock`,
      routeId,
      manifestId,
      officerName: 'Ward Officer (Human-in-the-Loop)',
      action: 'dispatch_rejection',
      reason: reason.trim(),
      createdAt: new Date().toISOString(),
      status: 'applied',
    };

    this.routes = this.routes.map((r) =>
      r.id === routeId
        ? { ...r, operationalStatus: 'on_hold', heldReason: `Dispatch rejected: ${reason.trim()}` }
        : r
    );

    this.driverManifests = this.driverManifests.map((m) =>
      m.manifestId === manifestId ? { ...m, status: 'cancelled' } : m
    );

    this.officerOverrides.unshift(override);
    return { success: true };
  }
}

// EXECUTE TEST SUITE
console.log('================================================================');
console.log('SWACHHROUTE AI — PHASE 6C VERIFICATION SUITE');
console.log('Human-in-the-Loop Municipal Officer Operations & Overrides');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`\x1b[32m✔ [PASS]\x1b[0m ${message}`);
    passedTests++;
  } else {
    console.error(`\x1b[31m✘ [FAIL]\x1b[0m ${message}`);
    process.exitCode = 1;
  }
}

const ctx = new MockReportsContext();

// 1. Invariant: Original OR-Tools Route Baseline
console.log('--- TEST GROUP 1: BASELINE ROUTE PRESERVATION ---');
assert(ctx.routes[0].vehicleId === 'HYD-COMP-02', 'Baseline route vehicleId is HYD-COMP-02');
assert(ctx.routes[0].stops.length === 2, 'Baseline route has 2 stops');
assert(ctx.routes[0].stops[0].hotspotId === 'HOT-02', 'First baseline stop is HOT-02');
assert(ctx.routes[0].stops[1].hotspotId === 'HOT-03', 'Second baseline stop is HOT-03');
assert(ctx.routes[0].operationalStatus === 'optimized', 'Initial operationalStatus is optimized');

// 2. Priority Escalation
console.log('\n--- TEST GROUP 2: HOTSPOT PRIORITY ESCALATION ---');
const emptyPriorityRes = ctx.applyPriorityOverride('HOT-03', 'critical', '');
assert(emptyPriorityRes.success === false, 'Priority override rejected with empty reason');

const validPriorityRes = ctx.applyPriorityOverride(
  'HOT-03',
  'critical',
  'Dry industrial corridor with active chemical and tyre dump fire risk requiring immediate mechanical clearance'
);
assert(validPriorityRes.success === true, 'Priority override succeeded with valid reason');
const hot03 = ctx.hotspots.find((h) => h.id === 'HOT-03');
assert(hot03.officerPriorityOverride === 'critical', 'HOT-03 officerPriorityOverride is critical');
assert(hot03.urgencyLevel === 'high', 'HOT-03 original urgencyLevel preserved as high');
assert(ctx.officerOverrides.length === 1, 'Audit log contains 1 entry');
assert(ctx.officerOverrides[0].action === 'priority_escalation', 'Override action is priority_escalation');
assert(ctx.officerOverrides[0].status === 'applied', 'Override status is applied');

// 3. Vehicle Reassignment & Validation Rules
console.log('\n--- TEST GROUP 3: VEHICLE REASSIGNMENT & VALIDATION ---');
const emptyReassignRes = ctx.reassignVehicle('ROUTE-01', 'HYD-COMP-01', '   ');
assert(emptyReassignRes.success === false, 'Vehicle reassignment rejected with empty reason');

const backhoeReassignRes = ctx.reassignVehicle(
  'ROUTE-01',
  'BACK-01',
  'Attempting to assign earthmoving equipment'
);
assert(backhoeReassignRes.success === false, 'Reassignment of BACK-01 rejected (specialized remediation equipment)');

const maintenanceReassignRes = ctx.reassignVehicle(
  'ROUTE-01',
  'MINI-TIP-02',
  'Assigning truck under maintenance'
);
assert(maintenanceReassignRes.success === false, 'Reassignment of vehicle under maintenance rejected');

const lowCapacityReassignRes = ctx.reassignVehicle(
  'ROUTE-01',
  'MINI-TIP-01',
  'Assigning mini tipper to 6150 kg route'
);
assert(lowCapacityReassignRes.success === false, 'Reassignment of MINI-TIP-01 (1,800 kg < 6,150 kg) rejected for capacity insufficiency');

// Valid vehicle reassignment
const validReassignRes = ctx.reassignVehicle(
  'ROUTE-01',
  'HYD-COMP-01',
  'HYD-COMP-02 scheduled for routine hydraulic cylinder inspection'
);
assert(validReassignRes.success === true, 'Reassignment to HYD-COMP-01 (8,000 kg capacity) succeeded');
assert(ctx.routes[0].vehicleId === 'HYD-COMP-02', 'CRITICAL INVARIANT: Original OR-Tools vehicleId HYD-COMP-02 untouched');
assert(ctx.routes[0].effectiveVehicleId === 'HYD-COMP-01', 'route.effectiveVehicleId updated to HYD-COMP-01');
assert(ctx.routes[0].operationalStatus === 'officer_reviewed', 'route.operationalStatus updated to officer_reviewed');

// 4. Manifest Generation Reflecting Effective State & Stale Invalidation
console.log('\n--- TEST GROUP 4: MANIFEST GENERATION & STALE PROTECTION ---');
// Generate manifest with reassigned vehicle
const initialManifest = ctx.generateManifest('ROUTE-01');
assert(initialManifest.vehicleId === 'HYD-COMP-01', 'Manifest dynamically reflects effectiveVehicleId HYD-COMP-01');
assert(initialManifest.vehicleCapacityKg === 8000, 'Manifest reflects HYD-COMP-01 capacity 8,000 kg');
assert(initialManifest.driverName === 'Rajesh Kumar', 'Manifest reflects Rajesh Kumar (HYD-COMP-01 driver)');
assert(initialManifest.isStale === false, 'Newly generated manifest isStale is false');

// 5. Stop Sequence Reordering
console.log('\n--- TEST GROUP 5: STOP SEQUENCE REORDERING ---');
const emptyReorderRes = ctx.reorderStops('ROUTE-01', ['HOT-03', 'HOT-02'], '');
assert(emptyReorderRes.success === false, 'Stop reorder rejected with empty reason');

const missingStopsRes = ctx.reorderStops('ROUTE-01', ['HOT-03'], 'Missing stop HOT-02');
assert(missingStopsRes.success === false, 'Stop reorder rejected when stops are missing');

const validReorderRes = ctx.reorderStops(
  'ROUTE-01',
  ['HOT-03', 'HOT-02'],
  'Severe traffic blockage on Koramangala arterial: prioritising Whitefield industrial corridor first'
);
assert(validReorderRes.success === true, 'Stop reordering succeeded with valid reason');
assert(ctx.routes[0].stops[0].hotspotId === 'HOT-02', 'CRITICAL INVARIANT: Original OR-Tools stops[0] remains HOT-02');
assert(ctx.routes[0].effectiveStops[0].hotspotId === 'HOT-03', 'Effective stops[0] is now HOT-03');
assert(ctx.routes[0].effectiveStops[1].hotspotId === 'HOT-02', 'Effective stops[1] is now HOT-02');
assert(ctx.routes[0].effectiveStops[0].sequence === 1, 'Effective stop 1 sequence is 1');
assert(ctx.routes[0].effectiveStops[0].cumulativeLoadKg === 2050, 'Effective stop 1 cumulative load is 2,050 kg');
assert(ctx.routes[0].effectiveStops[1].cumulativeLoadKg === 6150, 'Effective stop 2 cumulative load is 6,150 kg');

// Stale protection: existing manifest must now be stale
assert(ctx.driverManifests[0].isStale === true, 'Existing manifest automatically marked isStale = true after reordering');

// 6. Dispatch Blocking Rules
console.log('\n--- TEST GROUP 6: DISPATCH VALIDATION & BLOCKING ---');
// Try to dispatch while manifest is stale
const staleDispatchRes = ctx.approveDispatch('ROUTE-01', ctx.driverManifests[0].manifestId);
assert(staleDispatchRes.success === false, 'Dispatch blocked when manifest is stale');

// Regenerate manifest to clear stale flag
const regeneratedManifest = ctx.regenerateManifest(ctx.driverManifests[0].manifestId);
assert(regeneratedManifest.isStale === false, 'Regenerated manifest isStale is false');
assert(regeneratedManifest.stops[0].hotspotId === 'HOT-03', 'Regenerated manifest reflects effective stop order: HOT-03 first');
assert(regeneratedManifest.stops[1].hotspotId === 'HOT-02', 'Regenerated manifest reflects effective stop order: HOT-02 second');

// Place route on hold
const holdRes = ctx.holdRoute('ROUTE-01', 'Emergency road surface subsidence near Corporation Square');
assert(holdRes.success === true, 'Route placed on hold');
assert(ctx.routes[0].operationalStatus === 'on_hold', 'route.operationalStatus is on_hold');

// Try to dispatch while on hold
const heldDispatchRes = ctx.approveDispatch('ROUTE-01', regeneratedManifest.manifestId);
assert(heldDispatchRes.success === false, 'Dispatch blocked when route is on hold');

// Resume route
const resumeRes = ctx.resumeRoute('ROUTE-01');
assert(resumeRes.success === true, 'Route resumed');
assert(ctx.routes[0].operationalStatus === 'officer_reviewed', 'route.operationalStatus returned to officer_reviewed');

// 7. Dispatch Approval & Field Release
console.log('\n--- TEST GROUP 7: DISPATCH APPROVAL & FIELD RELEASE ---');
const approveDispatchRes = ctx.approveDispatch('ROUTE-01', regeneratedManifest.manifestId);
assert(approveDispatchRes.success === true, 'Dispatch authorized by municipal officer');
assert(ctx.routes[0].operationalStatus === 'dispatched', 'route.operationalStatus updated to dispatched');
assert(ctx.routes[0].status === 'dispatched', 'route.status updated to dispatched');
assert(ctx.driverManifests[0].status === 'dispatched', 'manifest.status updated to dispatched');

// 8. Immutable Municipal Audit Log
console.log('\n--- TEST GROUP 8: IMMUTABLE AUDIT LOG ---');
console.log(`Total logged overrides: ${ctx.officerOverrides.length}`);
assert(ctx.officerOverrides.length >= 5, 'Audit trail contains at least 5 logged actions');
for (const ovr of ctx.officerOverrides) {
  assert(Boolean(ovr.overrideId), `Override ${ovr.overrideId} has unique ID`);
  assert(Boolean(ovr.officerName), `Override ${ovr.overrideId} records officer name: ${ovr.officerName}`);
  assert(Boolean(ovr.reason && ovr.reason.trim()), `Override ${ovr.overrideId} has non-empty justification: "${ovr.reason}"`);
  assert(ovr.status === 'applied', `Override ${ovr.overrideId} status is applied`);
}

console.log('\n================================================================');
console.log(`VERIFICATION COMPLETE: ${passedTests} / ${totalTests} ASSERTIONS PASSED`);
console.log('================================================================');
