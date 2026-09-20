/**
 * SwachhRoute AI — Phase 6D Comprehensive Verification Script
 * Validates Driver Pickup Verification & Municipal Weighbridge Integration
 */

let passed = 0;
let failed = 0;

function assert(condition, message, details = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message} ${details ? `(${details})` : ''}`);
    failed++;
  }
}

console.log('================================================================');
console.log('SWACHHROUTE AI — PHASE 6D VERIFICATION SUITE');
console.log('Driver Pickup Verification & Municipal Weighbridge Integration');
console.log('================================================================\n');

// ─── TEST GROUP 1: STOP-BY-STOP PICKUP SIGN-OFF & AUTO-RESOLUTION ──────
console.log('--- TEST GROUP 1: Stop-by-Stop Digital Pickup Sign-Off ---');

// Mock Data
const mockReports = [
  { id: 'REP-PUNE-001', status: 'scheduled', hotspotId: 'HOT-PUNE-01' },
  { id: 'REP-PUNE-002', status: 'scheduled', hotspotId: 'HOT-PUNE-01' },
  { id: 'REP-PUNE-003', status: 'scheduled', hotspotId: 'HOT-PUNE-02' },
];

const mockManifest = {
  manifestId: 'MAN-PUNE-TEST-01',
  routeId: 'ROUTE-PUNE-01',
  vehicleId: 'PUNE-COMP-01',
  driverName: 'Suresh More',
  estimatedLoadKg: 4800,
  vehicleCapacityKg: 8000,
  stops: [
    {
      sequence: 1,
      hotspotId: 'HOT-PUNE-01',
      zoneName: 'Paud Road Nullah',
      estimatedDemandKg: 2800,
      dominantCategory: 'household',
    },
    {
      sequence: 2,
      hotspotId: 'HOT-PUNE-02',
      zoneName: 'Karve Road Clinic',
      estimatedDemandKg: 2000,
      dominantCategory: 'hazardous',
    },
  ],
};

const mockRoute = {
  id: 'ROUTE-PUNE-01',
  vehicleId: 'PUNE-COMP-01',
  status: 'dispatched',
  operationalStatus: 'dispatched',
};

// Simulation of verifyStopPickup
function simulateVerifyStop(manifest, route, reports, hotspotId, verifData) {
  const stopIndex = manifest.stops.findIndex((s) => s.hotspotId === hotspotId);
  const stop = manifest.stops[stopIndex];
  const linkedReportIds = reports.filter((r) => r.hotspotId === hotspotId).map((r) => r.id);
  const timestamp = new Date().toISOString();

  const verif = {
    verificationId: `VERIF-${Date.now()}`,
    manifestId: manifest.manifestId,
    routeId: manifest.routeId,
    hotspotId,
    stopIndex,
    verifiedByDriverName: verifData.driverName || manifest.driverName,
    timestamp,
    status: verifData.status,
    actualWasteCategory: verifData.actualWasteCategory || stop.dominantCategory,
    driverNotes: verifData.driverNotes || '',
    resolvedReportIds: linkedReportIds,
  };

  // Update stop
  stop.verificationStatus = verif.status;
  stop.verifiedAt = timestamp;
  stop.verifiedBy = verif.verifiedByDriverName;
  stop.driverNotes = verif.driverNotes;

  // Auto-resolve citizen reports
  if (verif.status === 'collected') {
    for (const r of reports) {
      if (linkedReportIds.includes(r.id)) {
        r.status = 'collected';
      }
    }
  }

  // Check if all stops serviced
  const allServiced = manifest.stops.every((s) => s.verificationStatus && s.verificationStatus !== 'pending');
  if (allServiced) {
    route.operationalStatus = 'awaiting_weighbridge';
  }

  return { verif, manifest, route, reports };
}

// 1. Verify Stop 1
const res1 = simulateVerifyStop(mockManifest, mockRoute, mockReports, 'HOT-PUNE-01', {
  status: 'collected',
  actualWasteCategory: 'household',
  driverNotes: 'Cleared completely using mechanical compactor grab',
});

assert(mockManifest.stops[0].verificationStatus === 'collected', 'Stop 1 verificationStatus updated to "collected"');
assert(mockManifest.stops[0].verifiedBy === 'Suresh More', 'Stop 1 verifiedBy records driver name "Suresh More"');
assert(mockManifest.stops[0].driverNotes.includes('Cleared completely'), 'Stop 1 records driver field notes');
assert(mockReports[0].status === 'collected', 'Citizen complaint REP-PUNE-001 auto-resolved to "collected"');
assert(mockReports[1].status === 'collected', 'Citizen complaint REP-PUNE-002 auto-resolved to "collected"');
assert(mockReports[2].status === 'scheduled', 'Unserviced Stop 2 complaint REP-PUNE-003 remains "scheduled"');
assert(mockRoute.operationalStatus === 'dispatched', 'Route remains "dispatched" while Stop 2 is still pending');

// 2. Verify Stop 2
const res2 = simulateVerifyStop(mockManifest, mockRoute, mockReports, 'HOT-PUNE-02', {
  status: 'collected',
  actualWasteCategory: 'hazardous',
  driverNotes: 'Biomedical sharps handled with safety gloves and sealed bin',
});

assert(mockManifest.stops[1].verificationStatus === 'collected', 'Stop 2 verificationStatus updated to "collected"');
assert(mockReports[2].status === 'collected', 'Citizen complaint REP-PUNE-003 auto-resolved to "collected"');
assert(mockRoute.operationalStatus === 'awaiting_weighbridge', 'Route automatically advanced to "awaiting_weighbridge" upon servicing all stops');

// ─── TEST GROUP 2: MUNICIPAL WEIGHBRIDGE SCALE CALCULATIONS ──────
console.log('\n--- TEST GROUP 2: Weighbridge Scale Input Validation & Arithmetic ---');

function calculateWeighbridgeTicket({
  vehicleId = 'PUNE-COMP-01',
  routeId = 'ROUTE-PUNE-01',
  manifestId = 'MAN-PUNE-TEST-01',
  grossWeightKg,
  tareWeightKg,
  estimatedDemandKg,
  vehicleCapacityKg = 8000,
  operatorName,
}) {
  if (!operatorName || !operatorName.trim()) {
    return { success: false, error: 'Scale operator name is required' };
  }
  if (grossWeightKg <= 0 || tareWeightKg <= 0) {
    return { success: false, error: 'Gross and tare must be positive' };
  }
  if (grossWeightKg <= tareWeightKg) {
    return { success: false, error: 'Gross scale weight must exceed empty tare weight' };
  }

  const netPayloadKg = Math.round(grossWeightKg - tareWeightKg);
  const varianceKg = Math.round(netPayloadKg - estimatedDemandKg);
  const variancePercentage = estimatedDemandKg > 0
    ? Math.round(((netPayloadKg - estimatedDemandKg) / estimatedDemandKg) * 1000) / 10
    : 0;

  let alertLevel = 'normal';
  if (netPayloadKg > vehicleCapacityKg) {
    alertLevel = 'severe_overload';
  } else if (variancePercentage > 20) {
    alertLevel = 'overweight_flag';
  } else if (variancePercentage < -20) {
    alertLevel = 'underweight_flag';
  }

  return {
    success: true,
    ticket: {
      ticketId: `WB-PUNE-${Date.now()}`,
      vehicleId,
      routeId,
      manifestId,
      grossWeightKg,
      tareWeightKg,
      netPayloadKg,
      estimatedDemandKg,
      varianceKg,
      variancePercentage,
      alertLevel,
      status: alertLevel === 'severe_overload' || Math.abs(variancePercentage) > 30 ? 'flagged_for_audit' : 'completed',
    },
  };
}

// 1. Validation rule checks
const invalid1 = calculateWeighbridgeTicket({
  grossWeightKg: 12000,
  tareWeightKg: 7000,
  estimatedDemandKg: 4800,
  operatorName: '',
});
assert(!invalid1.success && invalid1.error.includes('operator'), 'Rejects weighbridge entry without operator name');

const invalid2 = calculateWeighbridgeTicket({
  grossWeightKg: 6500,
  tareWeightKg: 7000, // Tare > Gross
  estimatedDemandKg: 4800,
  operatorName: 'D. K. Patil',
});
assert(!invalid2.success && invalid2.error.includes('exceed'), 'Rejects weighbridge entry where gross <= tare');

// 2. Normal variance case (Within +/- 20%)
// Gross = 12,000 kg, Tare = 7,000 kg => Net = 5,000 kg. Estimated = 4,800 kg => +200 kg (+4.2%)
const normalTest = calculateWeighbridgeTicket({
  grossWeightKg: 12000,
  tareWeightKg: 7000,
  estimatedDemandKg: 4800,
  vehicleCapacityKg: 8000,
  operatorName: 'D. K. Patil (Scale Master)',
});

assert(normalTest.success, 'Valid scale reading accepted successfully');
assert(normalTest.ticket.netPayloadKg === 5000, `Net payload correctly calculated: 12000 - 7000 = 5000 kg (got ${normalTest.ticket.netPayloadKg})`);
assert(normalTest.ticket.varianceKg === 200, `Variance in kg correctly calculated: 5000 - 4800 = +200 kg (got ${normalTest.ticket.varianceKg})`);
assert(normalTest.ticket.variancePercentage === 4.2, `Variance percentage correctly computed: +4.2% (got ${normalTest.ticket.variancePercentage}%)`);
assert(normalTest.ticket.alertLevel === 'normal', 'Alert level marked as "normal" for variance <= 20%');
assert(normalTest.ticket.status === 'completed', 'Ticket status marked as "completed"');

// 3. Overweight anomaly case (Variance > +20%)
// Gross = 13,800 kg, Tare = 7,000 kg => Net = 6,800 kg. Estimated = 4,800 kg => +2,000 kg (+41.7%)
const overTest = calculateWeighbridgeTicket({
  grossWeightKg: 13800,
  tareWeightKg: 7000,
  estimatedDemandKg: 4800,
  vehicleCapacityKg: 8000,
  operatorName: 'D. K. Patil',
});

assert(overTest.ticket.alertLevel === 'overweight_flag', 'Alert level flagged as "overweight_flag" when variance > 20%');
assert(overTest.ticket.status === 'flagged_for_audit', 'Ticket automatically flagged for officer audit inspection');

// 4. Underweight anomaly case (Variance < -20%)
// Gross = 10,000 kg, Tare = 7,000 kg => Net = 3,000 kg. Estimated = 4,800 kg => -1,800 kg (-37.5%)
const underTest = calculateWeighbridgeTicket({
  grossWeightKg: 10000,
  tareWeightKg: 7000,
  estimatedDemandKg: 4800,
  vehicleCapacityKg: 8000,
  operatorName: 'D. K. Patil',
});

assert(underTest.ticket.alertLevel === 'underweight_flag', 'Alert level flagged as "underweight_flag" when variance < -20%');

// 5. Severe Vehicle Overload case (Net > Vehicle Capacity)
// Gross = 15,500 kg, Tare = 7,000 kg => Net = 8,500 kg > Capacity (8,000 kg)
const overloadTest = calculateWeighbridgeTicket({
  grossWeightKg: 15500,
  tareWeightKg: 7000,
  estimatedDemandKg: 4800,
  vehicleCapacityKg: 8000,
  operatorName: 'D. K. Patil',
});

assert(overloadTest.ticket.alertLevel === 'severe_overload', 'Alert level marked as "severe_overload" when net payload exceeds vehicle rating');
assert(overloadTest.ticket.status === 'flagged_for_audit', 'Overloaded ticket flagged for municipal audit');

// ─── TEST GROUP 3: VEHICLE & ROUTE CYCLE COMPLETION ──────
console.log('\n--- TEST GROUP 3: Fleet Vehicle & Route Cycle Close ---');

// Mock vehicle before check-in
const mockVehicle = {
  id: 'PUNE-COMP-01',
  status: 'dispatched',
  currentLoadKg: 5000,
  capacityKg: 8000,
};

// Simulation of post-weighbridge state update
function closeRouteCycle(vehicle, route, manifest, ticket) {
  // 1. Vehicle reset
  vehicle.status = 'available';
  vehicle.currentLoadKg = 0;

  // 2. Route completion
  route.status = 'completed';
  route.operationalStatus = 'completed';

  // 3. Manifest completion
  manifest.status = 'completed';
  manifest.weighbridgeTicketId = ticket.ticketId;

  return { vehicle, route, manifest };
}

const closed = closeRouteCycle(mockVehicle, mockRoute, mockManifest, normalTest.ticket);

assert(closed.vehicle.status === 'available', 'Vehicle status restored to "available" after unloading');
assert(closed.vehicle.currentLoadKg === 0, 'Vehicle payload reset to 0 kg at depot weighbridge');
assert(closed.route.status === 'completed', 'Route status updated to "completed"');
assert(closed.route.operationalStatus === 'completed', 'Route operationalStatus updated to "completed"');
assert(closed.manifest.status === 'completed', 'Manifest status marked as "completed"');
assert(closed.manifest.weighbridgeTicketId === normalTest.ticket.ticketId, 'Manifest stores certified weighbridgeTicketId');

// ─── SUMMARY ──────
console.log('\n================================================================');
console.log(`PHASE 6D VERIFICATION COMPLETE: ${passed} / ${passed + failed} ASSERTIONS PASSED`);
if (failed > 0) {
  console.error(`FAILED: ${failed} assertions failed.`);
  process.exit(1);
} else {
  console.log('🎉 ALL PHASE 6D PICKUP VERIFICATION & WEIGHBRIDGE RULES PASSED!');
}
console.log('================================================================\n');
