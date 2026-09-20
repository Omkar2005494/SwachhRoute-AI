import { NextRequest, NextResponse } from 'next/server';
import { OSRMRouteResponse, RoadRouteResult } from '@/types';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        roadDistanceMeters: null,
        roadDistanceKm: null,
        roadDurationSeconds: null,
        roadDurationMinutes: null,
        roadGeometry: null,
        routingEngine: 'unavailable',
        error: 'Invalid JSON request body',
      } as RoadRouteResult,
      { status: 400 }
    );
  }

  const { waypoints } = body;

  // 1. Strict Coordinate Validation
  if (!Array.isArray(waypoints) || waypoints.length < 2) {
    return NextResponse.json(
      {
        roadDistanceMeters: null,
        roadDistanceKm: null,
        roadDurationSeconds: null,
        roadDurationMinutes: null,
        roadGeometry: null,
        routingEngine: 'unavailable',
        error: 'Waypoints must be an array of at least 2 coordinate pairs [latitude, longitude].',
      } as RoadRouteResult,
      { status: 400 }
    );
  }

  for (let i = 0; i < waypoints.length; i++) {
    const pt = waypoints[i];
    if (
      !Array.isArray(pt) ||
      pt.length < 2 ||
      !Number.isFinite(pt[0]) ||
      !Number.isFinite(pt[1]) ||
      pt[0] < -90 ||
      pt[0] > 90 ||
      pt[1] < -180 ||
      pt[1] > 180
    ) {
      return NextResponse.json(
        {
          roadDistanceMeters: null,
          roadDistanceKm: null,
          roadDurationSeconds: null,
          roadDurationMinutes: null,
          roadGeometry: null,
          routingEngine: 'unavailable',
          error: `Invalid coordinate pair at index ${i}: [${pt}]`,
        } as RoadRouteResult,
        { status: 400 }
      );
    }
  }

  // 2. Explicit Coordinate Conversion: [latitude, longitude] -> "longitude,latitude"
  const osrmCoordsString = waypoints
    .map(([lat, lon]: [number, number]) => `${lon},${lat}`)
    .join(';');

  // Configurable OSRM endpoint (default: public OSRM demonstration server)
  const baseUrl = process.env.OSRM_BASE_URL || 'http://router.project-osrm.org';
  const targetUrl = `${baseUrl.replace(/\/$/, '')}/route/v1/driving/${osrmCoordsString}?overview=full&geometries=geojson`;

  try {
    // 3. Request with 10-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SwachhRoute-AI-Municipal-Fleet/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[OSRM API] External server returned status ${response.status}: ${response.statusText}`);
      return NextResponse.json({
        roadDistanceMeters: null,
        roadDistanceKm: null,
        roadDurationSeconds: null,
        roadDurationMinutes: null,
        roadGeometry: null,
        routingEngine: 'unavailable',
        error: `OSRM HTTP error ${response.status}: ${response.statusText}`,
      } as RoadRouteResult);
    }

    const data: OSRMRouteResponse = await response.json();

    // 4. Strict Response Validation
    if (data.code !== 'Ok' || !Array.isArray(data.routes) || data.routes.length === 0) {
      console.warn(`[OSRM API] OSRM returned non-Ok code: ${data.code}`);
      return NextResponse.json({
        roadDistanceMeters: null,
        roadDistanceKm: null,
        roadDurationSeconds: null,
        roadDurationMinutes: null,
        roadGeometry: null,
        routingEngine: 'unavailable',
        error: `OSRM routing code: ${data.code}`,
      } as RoadRouteResult);
    }

    const primaryRoute = data.routes[0];

    if (!Number.isFinite(primaryRoute.distance) || !Number.isFinite(primaryRoute.duration)) {
      return NextResponse.json({
        roadDistanceMeters: null,
        roadDistanceKm: null,
        roadDurationSeconds: null,
        roadDurationMinutes: null,
        roadGeometry: null,
        routingEngine: 'unavailable',
        error: 'Malformed distance or duration in OSRM response',
      } as RoadRouteResult);
    }

    if (!primaryRoute.geometry || !Array.isArray(primaryRoute.geometry.coordinates)) {
      return NextResponse.json({
        roadDistanceMeters: null,
        roadDistanceKm: null,
        roadDurationSeconds: null,
        roadDurationMinutes: null,
        roadGeometry: null,
        routingEngine: 'unavailable',
        error: 'Missing or malformed geometry coordinates in OSRM response',
      } as RoadRouteResult);
    }

    // 5. Explicit Geometry Conversion: GeoJSON [longitude, latitude] -> Leaflet [latitude, longitude]
    const leafletGeometry: [number, number][] = primaryRoute.geometry.coordinates.map(
      ([lon, lat]: [number, number]) => [lat, lon]
    );

    const roadDistanceMeters = Math.round(primaryRoute.distance);
    const roadDistanceKm = Math.round((primaryRoute.distance / 1000.0) * 100) / 100;
    const roadDurationSeconds = Math.round(primaryRoute.duration);
    const roadDurationMinutes = Math.round((primaryRoute.duration / 60.0) * 10) / 10;

    return NextResponse.json({
      roadDistanceMeters,
      roadDistanceKm,
      roadDurationSeconds,
      roadDurationMinutes,
      roadGeometry: leafletGeometry,
      routingEngine: 'osrm',
    } as RoadRouteResult);
  } catch (err: any) {
    const isTimeout = err?.name === 'AbortError';
    const errorMsg = isTimeout
      ? 'OSRM request timed out after 10 seconds'
      : (err as Error)?.message || 'Unknown network error';

    console.warn(`[OSRM API] Routing query failed (${errorMsg}). Returning graceful unavailable fallback.`);

    return NextResponse.json({
      roadDistanceMeters: null,
      roadDistanceKm: null,
      roadDurationSeconds: null,
      roadDurationMinutes: null,
      roadGeometry: null,
      routingEngine: 'unavailable',
      error: errorMsg,
    } as RoadRouteResult);
  }
}
