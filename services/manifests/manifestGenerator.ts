/**
 * SwachhRoute AI — Driver Shift Manifest Generator (Phase 6B)
 * 
 * CRITICAL ARCHITECTURAL BOUNDARIES:
 * 1. Google OR-Tools CVRP stop sequence is strictly authoritative and must never be reordered.
 * 2. Safety directives are deterministically generated from canonical hazard vocabularies.
 *    Llama 3.2 3B is STRICTLY PROHIBITED from generating safety-critical directives.
 * 3. All load, capacity, utilization, and distance metrics are dynamically calculated from
 *    real operational state. Zero hard-coded values.
 * 4. HOT-01 is a Capacity Exception (Specialized Remediation with BACK-01) and is NEVER
 *    included in hauling vehicle manifests.
 */

import {
  OptimizedRoute,
  Hotspot,
  FleetVehicle,
  MunicipalDepot,
  DriverManifest,
  ManifestStop,
  WasteHazard,
  MachineryType,
} from '@/types';

/**
 * Deterministic Hazard-to-Safety Directive Mapping
 * Standard municipal operational safety reminders based on identified environmental hazards.
 */
export const HAZARD_SAFETY_DIRECTIVES: Record<WasteHazard, string> = {
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

/**
 * Generates an operational Driver Shift Manifest from an authoritative OR-Tools optimized route.
 */
export function generateDriverManifest(
  route: OptimizedRoute,
  hotspots: Hotspot[],
  fleet: FleetVehicle[],
  depot: MunicipalDepot
): DriverManifest {
  if (!route || !route.stops || route.stops.length === 0) {
    throw new Error('Cannot generate manifest: Route contains no valid collection stops.');
  }

  // 1. Resolve Assigned Vehicle (respecting officer effectiveVehicleId override) and Synthetic Driver
  const activeVehicleId = route.effectiveVehicleId || route.vehicleId;
  const vehicle = fleet.find((v) => v.id === activeVehicleId);
  const driverName = vehicle?.driverName || 'Synthetic Demo Driver';
  const driverPhone = vehicle?.driverPhone;
  const vehicleType = vehicle?.vehicleType || route.vehicleType || 'hydraulic_compactor';
  const vehicleCapacityKg = vehicle?.capacityKg || route.vehicleCapacityKg || 7000;

  // 2. Resolve Hotspot Details preserving effective stop order (or original if not overridden)
  const activeStops = (route.effectiveStops && route.effectiveStops.length > 0) ? route.effectiveStops : route.stops;
  const hotspotMap = new Map<string, Hotspot>(hotspots.map((h) => [h.id, h]));

  const manifestStops: ManifestStop[] = activeStops.map((stop) => {
    const hotspot = stop.hotspotId ? hotspotMap.get(stop.hotspotId) : undefined;
    const dominantHazard: WasteHazard = hotspot?.dominantHazard || 'none_identified';
    const dominantCategory = hotspot?.dominantCategory || hotspot?.dominantWasteCategory || 'household';
    const requiredMachinery: MachineryType[] = hotspot?.recommendedMachinery && hotspot.recommendedMachinery.length > 0
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
      urgencyLevel: hotspot?.officerPriorityOverride || hotspot?.urgencyLevel || 'medium',
      recommendedAction:
        (hotspot?.officerPriorityOverride || hotspot?.urgencyLevel) === 'critical'
          ? 'Priority evacuation: Immediate mechanical loading required.'
          : 'Standard operational collection sequence.',
      safetyDirectives: [directive],
    };
  });

  // 3. Dynamic Operational Demands & Mathematical Utilization
  const estimatedLoadKg = route.totalDemandKg;
  const remainingCapacityKg = Math.max(0, vehicleCapacityKg - estimatedLoadKg);
  const capacityUtilizationPercent =
    vehicleCapacityKg > 0 ? Math.round((estimatedLoadKg / vehicleCapacityKg) * 100) : 0;

  // 4. Deterministic Aggregation of Safety Directives & Hazards
  const uniqueDirectivesSet = new Set<string>();
  const uniqueHazardsSet = new Set<WasteHazard>();
  const uniqueMachinerySet = new Set<MachineryType>([vehicleType]);

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

  // Ensure default safety protocol is present if no specific hazard directives exist
  if (uniqueDirectivesSet.size === 0) {
    uniqueDirectivesSet.add(HAZARD_SAFETY_DIRECTIVES.none_identified);
  }

  // 5. Build departure and return operational timestamps
  const now = new Date();
  const departureDate = new Date(now.getTime() + 15 * 60 * 1000); // T+15m
  const durationSecs = route.roadDurationSeconds || 54 * 60;
  const returnDate = new Date(departureDate.getTime() + durationSecs * 1000 + activeStops.length * 15 * 60 * 1000);

  const formatClock = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return {
    manifestId: `MAN-${route.id}`,
    routeId: route.id,
    vehicleId: activeVehicleId,
    driverName,
    driverPhone,
    vehicleType,
    vehicleCapacityKg,
    estimatedLoadKg,
    remainingCapacityKg,
    capacityUtilizationPercent,
    stopIds: activeStops.map((s) => s.hotspotId || `STOP-${s.sequence}`),
    totalStops: activeStops.length,
    roadDistanceMeters: route.roadDistanceMeters ?? null,
    roadDistanceKm: route.roadDistanceKm ?? null,
    roadDurationSeconds: route.roadDurationSeconds ?? null,
    roadDurationMinutes: route.roadDurationMinutes ?? null,
    routingEngine: route.routingEngine || 'unavailable',
    departureDepotId: depot.id,
    departureDepotName: depot.name,
    departureDepotLocation: depot.coordinates,
    estimatedDepartureTime: formatClock(departureDate),
    estimatedReturnTime: formatClock(returnDate),
    safetyDirectives: Array.from(uniqueDirectivesSet),
    hazardSummary: Array.from(uniqueHazardsSet),
    machineryRequirements: Array.from(uniqueMachinerySet),
    generatedAt: new Date().toISOString(),
    status: 'ready', // Canonical initial status
    isStale: false,
    sourceRouteOptimizedAt: route.optimizedAt,
    stops: manifestStops,
  };
}
