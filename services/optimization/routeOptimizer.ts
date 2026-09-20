/**
 * Fleet Optimization Service Boundary — Google OR-Tools CVRP
 * Solves the Capacitated Vehicle Routing Problem using Guided Local Search.
 */

import { FleetVehicle, Hotspot, MunicipalDepot, OptimizationResult } from '@/types';

export interface CVRPOptimizationRequest {
  depot: MunicipalDepot;
  hotspots: Hotspot[];
  vehicles: FleetVehicle[];
  maxTimeSeconds?: number;
}

/**
 * Service Client for CVRP solving via Google OR-Tools microservice / API route
 */
export async function optimizeFleetRoutes(
  request: CVRPOptimizationRequest
): Promise<OptimizationResult> {
  const response = await fetch('/api/optimization/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Optimization API failed with status ${response.status}`);
  }

  const result: OptimizationResult = await response.json();
  return result;
}
