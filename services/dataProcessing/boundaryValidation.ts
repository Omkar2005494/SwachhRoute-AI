/**
 * Boundary Validation Service
 * Validates whether coordinates fall inside the municipal operational envelope
 * (Configured for synthetic Bengaluru metropolitan bounds)
 */

export interface BoundaryEnvelope {
  name: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Synthetic Municipal Metropolitan Boundary Box (Bengaluru region)
 */
export const SYNTHETIC_BENGALURU_BOUNDS: BoundaryEnvelope = {
  name: 'Synthetic Bengaluru Metropolitan Service Area',
  minLat: 12.8000,
  maxLat: 13.1500,
  minLng: 77.4500,
  maxLng: 77.7800,
};

export interface BoundaryValidationResult {
  isWithinBounds: boolean;
  zone: string;
  errorMessage?: string;
}

/**
 * Validates whether a coordinate pair is within the designated operational zone
 */
export function validateWithinMunicipalBounds(
  latitude: number,
  longitude: number,
  boundary = SYNTHETIC_BENGALURU_BOUNDS
): BoundaryValidationResult {
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
