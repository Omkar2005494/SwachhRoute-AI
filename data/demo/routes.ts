import { OptimizedRoute } from '@/types';

/**
 * Lightweight Synthetic Demonstration Routes
 * Solved via Google OR-Tools CVRP (Capacitated Vehicle Routing Problem).
 * NOTE: Polyline coordinates in Phase 5 represent geometric preview segments connecting Depot -> Stops -> Depot.
 * Road-snapped routing belongs strictly to Phase 6.
 */
export const DEMO_ROUTES: OptimizedRoute[] = [
  {
    id: 'ROUTE-01',
    routeId: 'ROUTE-01',
    vehicleId: 'HYD-COMP-02',
    vehicleType: 'hydraulic_compactor',
    depotId: 'DEPOT-BLR-01',
    depotLocation: [12.9716, 77.5946], // Central Municipal Depot (Corporation Square)
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
      [12.9716, 77.5946], // Depot
      [12.9354, 77.6243], // HOT-02
      [12.9695, 77.7498], // HOT-03
      [12.9716, 77.5946], // Return to Depot
    ],
    roadDistanceMeters: null,
    roadDistanceKm: null,
    roadDurationSeconds: null,
    roadDurationMinutes: null,
    roadGeometry: null,
    routingEngine: 'unavailable',
    optimizationEngine: 'google_ortools',
    optimizationAlgorithm: 'Google OR-Tools CVRP (Guided Local Search)',
    solverStatus: 'ROUTING_SUCCESS',
    status: 'active',
    operationalStatus: 'optimized',
    generatedAt: '2026-09-20T08:00:00Z',
    optimizedAt: '2026-09-20T08:00:00Z',
  },
];
