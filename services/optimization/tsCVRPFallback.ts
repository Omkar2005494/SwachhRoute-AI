/**
 * SwachhRoute AI — Deterministic In-Process CVRP Fallback Engine
 * Used when Python Google OR-Tools microservice is offline or unreachable.
 * 
 * IMPORTANT:
 * This heuristic is strictly a demonstration preview and is visibly tagged as
 * 'deterministic_fallback' (NOT mathematically solved by Google OR-Tools).
 */

import {
  OptimizedRoute,
  RouteStop,
  CapacityException,
  OptimizationResult,
  FleetVehicle,
  Hotspot,
  MunicipalDepot,
} from '@/types';

const EARTH_RADIUS_METERS = 6378137.0;

function project4326To3857(lat: number, lng: number): [number, number] {
  const x = lng * (Math.PI / 180.0) * EARTH_RADIUS_METERS;
  const clampedLat = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const latRad = clampedLat * (Math.PI / 180.0);
  const y = Math.log(Math.tan(Math.PI / 4.0 + latRad / 2.0)) * EARTH_RADIUS_METERS;
  return [x, y];
}

function geometricDistanceMeters(p1: [number, number], p2: [number, number]): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return Math.round(Math.hypot(dx, dy));
}

export function solveCVRPFallback(
  depot: MunicipalDepot,
  hotspots: Hotspot[],
  vehicles: FleetVehicle[]
): OptimizationResult {
  const startTime = Date.now();
  const nowIso = new Date().toISOString();

  // 1. Filter dispatchable vehicles
  const dispatchableVehicles = vehicles.filter(
    (v) => v.status === 'available' && v.availableForDispatch && v.capacityKg > 0
  );

  const capacityExceptions: CapacityException[] = [];
  const feasibleHotspots: Hotspot[] = [];
  let totalInputDemandKg = 0;

  for (const h of hotspots) {
    const demandKg = Math.round(h.totalEstimatedWasteKg || 0);
    totalInputDemandKg += demandKg;

    const requiresSpecialized = h.recommendedMachinery.includes('backhoe');
    const exceedsStandardCompactor = demandKg > 4500;

    if (requiresSpecialized || exceedsStandardCompactor) {
      let reason = `Demand (${demandKg.toLocaleString()} kg) exceeds standard 4,500 kg hauling compactor capacity.`;
      if (requiresSpecialized) {
        reason += ' Site requires BACK-01 Backhoe specialized remediation equipment for heavy debris.';
      }
      capacityExceptions.push({
        hotspotId: h.id,
        zoneName: h.zoneName,
        demandedKg: demandKg,
        maxVehicleCapacityKg: 4500,
        recommendedMachinery: h.recommendedMachinery,
        reason,
        remediationAction: 'Dispatch specialized heavy remediation machinery (BACK-01 Backhoe) and secondary multi-lift hauler.',
      });
    } else {
      feasibleHotspots.push(h);
    }
  }

  const depotProjected = project4326To3857(depot.coordinates[0], depot.coordinates[1]);
  const routes: OptimizedRoute[] = [];
  const unvisitedHotspots = [...feasibleHotspots];
  let totalFleetDistanceMeters = 0;
  let totalServedDemandKg = 0;
  let totalStopsServed = 0;

  // Sort dispatchable vehicles by capacity descending
  const sortedVehicles = [...dispatchableVehicles].sort((a, b) => b.capacityKg - a.capacityKg);

  for (let vIdx = 0; vIdx < sortedVehicles.length; vIdx++) {
    if (unvisitedHotspots.length === 0) break;

    const vehicle = sortedVehicles[vIdx];
    let currentLoadKg = 0;
    let currentPosProjected = depotProjected;
    let currentPosCoords = depot.coordinates;
    const stops: RouteStop[] = [];
    let routeDistanceMeters = 0;
    const polyline: [number, number][] = [depot.coordinates];

    while (unvisitedHotspots.length > 0) {
      // Find nearest feasible hotspot that fits vehicle's remaining capacity
      let bestIdx = -1;
      let minDistance = Infinity;

      for (let i = 0; i < unvisitedHotspots.length; i++) {
        const candidate = unvisitedHotspots[i];
        const demand = Math.round(candidate.totalEstimatedWasteKg || 0);
        if (currentLoadKg + demand <= vehicle.capacityKg) {
          const candProjected = project4326To3857(
            candidate.centerCoordinates[0],
            candidate.centerCoordinates[1]
          );
          const dist = geometricDistanceMeters(currentPosProjected, candProjected);
          if (dist < minDistance) {
            minDistance = dist;
            bestIdx = i;
          }
        }
      }

      if (bestIdx === -1) {
        // Vehicle cannot fit any remaining hotspot
        break;
      }

      const chosen = unvisitedHotspots.splice(bestIdx, 1)[0];
      const chosenDemand = Math.round(chosen.totalEstimatedWasteKg || 0);
      currentLoadKg += chosenDemand;
      routeDistanceMeters += minDistance;

      currentPosCoords = chosen.centerCoordinates;
      currentPosProjected = project4326To3857(chosen.centerCoordinates[0], chosen.centerCoordinates[1]);
      polyline.push(chosen.centerCoordinates);

      const sequence = stops.length + 1;
      stops.push({
        stopId: `STP-${vehicle.id}-${sequence.toString().padStart(2, '0')}`,
        sequence,
        stopSequence: sequence,
        hotspotId: chosen.id,
        latitude: chosen.centerCoordinates[0],
        longitude: chosen.centerCoordinates[1],
        location: chosen.centerCoordinates,
        addressName: chosen.zoneName,
        estimatedDemandKg: chosenDemand,
        estimatedWasteKg: chosenDemand,
        cumulativeLoadKg: currentLoadKg,
        remainingVehicleCapacityKg: vehicle.capacityKg - currentLoadKg,
        requiredMachinery: vehicle.vehicleType,
        plannedArrivalTime: nowIso,
        status: 'pending',
      });
    }

    if (stops.length > 0) {
      // Return to depot
      const returnDist = geometricDistanceMeters(currentPosProjected, depotProjected);
      routeDistanceMeters += returnDist;
      polyline.push(depot.coordinates);

      totalFleetDistanceMeters += routeDistanceMeters;
      totalServedDemandKg += currentLoadKg;
      totalStopsServed += stops.length;

      const routeId = `ROUTE-${(routes.length + 1).toString().padStart(2, '0')}`;
      routes.push({
        id: routeId,
        routeId,
        vehicleId: vehicle.id,
        vehicleType: vehicle.vehicleType,
        depotId: depot.id,
        depotLocation: depot.coordinates,
        stopIds: stops.map((s) => s.hotspotId || ''),
        stopOrder: stops.map((s) => s.sequence),
        stops,
        totalDistanceMeters: routeDistanceMeters,
        totalDistanceKm: Math.round((routeDistanceMeters / 1000.0) * 10) / 10,
        totalDurationMinutes: Math.round((routeDistanceMeters / 1000.0) * 1.8) + stops.length * 12,
        totalDemandKg: currentLoadKg,
        totalWasteCollectedKg: currentLoadKg,
        vehicleCapacityKg: vehicle.capacityKg,
        remainingCapacityKg: vehicle.capacityKg - currentLoadKg,
        polylineCoordinates: polyline,
        roadDistanceMeters: null,
        roadDistanceKm: null,
        roadDurationSeconds: null,
        roadDurationMinutes: null,
        roadGeometry: null,
        routingEngine: 'unavailable',
        optimizationEngine: 'deterministic_fallback',
        optimizationAlgorithm: 'Deterministic Nearest-Neighbor Heuristic (Fallback Preview)',
        solverStatus: 'FALLBACK_HEURISTIC_APPLIED',
        status: 'active',
        operationalStatus: 'optimized',
        generatedAt: nowIso,
        optimizedAt: nowIso,
      });
    }
  }

  // Any remaining unvisited hotspots become capacity exceptions
  for (const leftover of unvisitedHotspots) {
    const demand = Math.round(leftover.totalEstimatedWasteKg || 0);
    capacityExceptions.push({
      hotspotId: leftover.id,
      zoneName: leftover.zoneName,
      demandedKg: demand,
      maxVehicleCapacityKg: 4500,
      recommendedMachinery: leftover.recommendedMachinery,
      reason: 'Vehicle fleet cumulative capacity exhausted. Could not assign without exceeding vehicle limit.',
      remediationAction: 'Deploy secondary collection shift or reserve tipper.',
    });
  }

  const executionTimeMs = Date.now() - startTime;
  const totalExceptionDemandKg = capacityExceptions.reduce((sum, e) => sum + e.demandedKg, 0);

  return {
    routes,
    totalDistanceMeters: totalFleetDistanceMeters,
    totalDistanceKm: Math.round((totalFleetDistanceMeters / 1000.0) * 10) / 10,
    totalDemandKg: totalInputDemandKg,
    totalServedDemandKg,
    totalExceptionDemandKg,
    vehiclesUsedCount: routes.length,
    vehiclesTotalCount: dispatchableVehicles.length,
    stopsCount: totalStopsServed,
    capacityExceptions,
    solverStatus: 'FALLBACK_PREVIEW',
    optimizationEngine: 'deterministic_fallback',
    executionTimeMs,
    optimizedAt: nowIso,
  };
}
