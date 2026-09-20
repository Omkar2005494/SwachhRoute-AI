/**
 * Boundary Validation Service
 * Validates whether coordinates fall inside the municipal operational envelope
 * Supports multi-city municipal boundaries (Pune PMC, Bengaluru BBMP, All-India Open Telemetry)
 */

export interface BoundaryEnvelope {
  name: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Pune Municipal Corporation (PMC) - Ward 12 & Metropolitan Boundary Box
 */
export const PUNE_PMC_BOUNDS: BoundaryEnvelope = {
  name: 'Pune Municipal Corporation (Ward 12 / Metropolitan)',
  minLat: 18.4000,
  maxLat: 18.6500,
  minLng: 73.7000,
  maxLng: 73.9800,
};

/**
 * Bengaluru Metropolitan Municipal Boundary Box (BBMP region)
 */
export const BENGALURU_BBMP_BOUNDS: BoundaryEnvelope = {
  name: 'Bruhat Bengaluru Mahanagara Palike (BBMP Metropolitan)',
  minLat: 12.8000,
  maxLat: 13.1500,
  minLng: 77.4500,
  maxLng: 77.7800,
};

/**
 * Backward compatibility alias for existing callers
 */
export const SYNTHETIC_BENGALURU_BOUNDS = BENGALURU_BBMP_BOUNDS;

/**
 * All-India Municipal Envelope (For Open Datasets & Custom Telemetry Ingestion)
 */
export const ALL_INDIA_BOUNDS: BoundaryEnvelope = {
  name: 'Pan-India Municipal Open Telemetry Envelope',
  minLat: 8.0000,
  maxLat: 37.5000,
  minLng: 68.0000,
  maxLng: 97.5000,
};

export const SUPPORTED_BOUNDARIES: Record<string, BoundaryEnvelope> = {
  pune: PUNE_PMC_BOUNDS,
  bengaluru: BENGALURU_BBMP_BOUNDS,
  india: ALL_INDIA_BOUNDS,
};

export interface BoundaryValidationResult {
  isWithinBounds: boolean;
  zone: string;
  errorMessage?: string;
}

/**
 * Validates whether a coordinate pair is within a designated operational zone or any supported municipal zone
 */
export function validateWithinMunicipalBounds(
  latitude: number,
  longitude: number,
  boundary?: BoundaryEnvelope
): BoundaryValidationResult {
  // If a specific boundary is supplied, validate against it
  if (boundary) {
    if (
      latitude < boundary.minLat ||
      latitude > boundary.maxLat ||
      longitude < boundary.minLng ||
      longitude > boundary.maxLng
    ) {
      return {
        isWithinBounds: false,
        zone: 'Out of Service Area',
        errorMessage: `Coordinates (${latitude}, ${longitude}) are outside ${boundary.name}.`,
      };
    }
    return {
      isWithinBounds: true,
      zone: boundary.name,
    };
  }

  // Check against known municipal operational zones (Pune, Bengaluru) or India general envelope
  for (const [key, b] of Object.entries(SUPPORTED_BOUNDARIES)) {
    if (
      latitude >= b.minLat &&
      latitude <= b.maxLat &&
      longitude >= b.minLng &&
      longitude <= b.maxLng
    ) {
      return {
        isWithinBounds: true,
        zone: b.name,
      };
    }
  }

  return {
    isWithinBounds: false,
    zone: 'Out of Service Area',
    errorMessage: `Coordinates (${latitude}, ${longitude}) are outside all supported municipal zones.`,
  };
}
