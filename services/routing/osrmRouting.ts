/**
 * SwachhRoute AI — OSRM Road Routing Client Service
 * Queries /api/routing/osrm with deterministic session caching and failure protection.
 */

import { RoadRouteResult } from '@/types';

// In-memory session cache to protect against duplicate external queries
const roadRouteCache = new Map<string, RoadRouteResult>();

/**
 * Builds a deterministic cache key from route identity and ordered coordinates
 */
function buildCacheKey(
  waypoints: [number, number][],
  routeId?: string,
  vehicleId?: string
): string {
  const coordSignature = waypoints
    .map(([lat, lon]) => `${lat.toFixed(6)},${lon.toFixed(6)}`)
    .join(';');
  return `${routeId || 'anon-route'}:${vehicleId || 'anon-vehicle'}:${coordSignature}`;
}

/**
 * Retrieves road-network distance, duration, and road-snapped polyline geometry for ordered waypoints.
 */
export async function getRoadRoute(
  waypoints: [number, number][],
  routeId?: string,
  vehicleId?: string
): Promise<RoadRouteResult> {
  if (!waypoints || waypoints.length < 2) {
    return {
      roadDistanceMeters: null,
      roadDistanceKm: null,
      roadDurationSeconds: null,
      roadDurationMinutes: null,
      roadGeometry: null,
      routingEngine: 'unavailable',
      error: 'At least 2 waypoints required for road routing',
    };
  }

  const cacheKey = buildCacheKey(waypoints, routeId, vehicleId);

  // Check in-memory session cache
  if (roadRouteCache.has(cacheKey)) {
    const cached = roadRouteCache.get(cacheKey)!;
    return { ...cached, cached: true };
  }

  try {
    const response = await fetch('/api/routing/osrm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waypoints }),
    });

    if (!response.ok) {
      console.warn(`[Routing Service] /api/routing/osrm returned HTTP status ${response.status}`);
      return {
        roadDistanceMeters: null,
        roadDistanceKm: null,
        roadDurationSeconds: null,
        roadDurationMinutes: null,
        roadGeometry: null,
        routingEngine: 'unavailable',
        error: `HTTP error ${response.status}`,
      };
    }

    const result: RoadRouteResult = await response.json();

    // Cache successful OSRM result in session memory
    if (result.routingEngine === 'osrm' && result.roadGeometry) {
      roadRouteCache.set(cacheKey, result);
    }

    return result;
  } catch (err) {
    console.warn('[Routing Service] Failed to contact /api/routing/osrm:', err);
    return {
      roadDistanceMeters: null,
      roadDistanceKm: null,
      roadDurationSeconds: null,
      roadDurationMinutes: null,
      roadGeometry: null,
      routingEngine: 'unavailable',
      error: (err as Error).message,
    };
  }
}

/**
 * Invalidate the session cache for road routes (e.g. on explicit recalculation)
 */
export function clearRoadRoutingCache(): void {
  roadRouteCache.clear();
}
