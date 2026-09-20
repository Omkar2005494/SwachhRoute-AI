/**
 * Coordinate Normalization & Projection Service
 * 
 * Requirements:
 * - Accept/store original latitude/longitude as EPSG:4326 (WGS 84).
 * - Project to EPSG:3857 (Web Mercator) where required for spatial/metric operations.
 * - Preserve EPSG:4326 for map display and API interchange.
 */

const EARTH_RADIUS_METERS = 6378137.0;

export interface Coordinates4326 {
  latitude: number;
  longitude: number;
}

export interface ProjectedCoordinates3857 {
  x: number; // Easting in meters
  y: number; // Northing in meters
}

/**
 * Validates if coordinates are within standard WGS 84 bounds
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Normalizes latitude and longitude to standard 6 decimal places (~0.11m precision)
 */
export function normalizeCoordinates(coords: Coordinates4326): Coordinates4326 {
  if (!isValidCoordinate(coords.latitude, coords.longitude)) {
    throw new Error(`Invalid coordinate bounds: lat=${coords.latitude}, lng=${coords.longitude}`);
  }
  return {
    latitude: Math.round(coords.latitude * 1e6) / 1e6,
    longitude: Math.round(coords.longitude * 1e6) / 1e6,
  };
}

/**
 * Project EPSG:4326 (lat/lng degrees) to EPSG:3857 (Web Mercator meters)
 * Used for accurate Euclidean distance calculations in DBSCAN and metric geometric processing.
 */
export function projectToEPSG3857(coords: Coordinates4326): ProjectedCoordinates3857 {
  const norm = normalizeCoordinates(coords);
  const x = norm.longitude * (Math.PI / 180) * EARTH_RADIUS_METERS;
  
  // Clamp latitude to avoid infinity at poles
  const clampedLat = Math.max(-85.05112878, Math.min(85.05112878, norm.latitude));
  const latRad = clampedLat * (Math.PI / 180);
  const y = Math.log(Math.tan(Math.PI / 4 + latRad / 2)) * EARTH_RADIUS_METERS;

  return { x, y };
}

/**
 * Unproject EPSG:3857 (meters) back to EPSG:4326 (lat/lng degrees)
 * Preserves EPSG:4326 for Leaflet map display and API responses.
 */
export function unprojectFromEPSG3857(projected: ProjectedCoordinates3857): Coordinates4326 {
  const longitude = (projected.x / EARTH_RADIUS_METERS) * (180 / Math.PI);
  const latRad = 2 * Math.atan(Math.exp(projected.y / EARTH_RADIUS_METERS)) - Math.PI / 2;
  const latitude = latRad * (180 / Math.PI);

  return normalizeCoordinates({ latitude, longitude });
}

/**
 * Calculate Euclidean distance in meters between two projected points (EPSG:3857)
 */
export function calculateMetricDistance(p1: ProjectedCoordinates3857, p2: ProjectedCoordinates3857): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}
