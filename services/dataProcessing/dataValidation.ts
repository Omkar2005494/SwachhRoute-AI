/**
 * Data Validation Service
 * Validates and normalizes incoming citizen / field reports
 */

import { WasteReport, ReportSource, WasteCategory } from '@/types';
import { cleanComplaintText } from './textCleaning';
import { validateWithinMunicipalBounds } from './boundaryValidation';
import { normalizeCoordinates } from './coordinateNormalization';

export interface RawReportInput {
  description: string;
  latitude: number;
  longitude: number;
  source?: ReportSource;
  photo?: string;
  audio?: string;
  category?: WasteCategory;
}

export interface ValidationSuccess {
  isValid: true;
  normalizedData: Omit<WasteReport, 'id' | 'timestamp' | 'status' | 'aiAnalyzed' | 'severity' | 'hazard' | 'machineryRequired' | 'estimatedWasteKg'>;
}

export interface ValidationFailure {
  isValid: false;
  errors: string[];
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Validates and pre-processes raw user report input before passing to AI / Geospatial engines
 */
export function validateReportInput(raw: RawReportInput): ValidationResult {
  const errors: string[] = [];

  // Description validation
  if (!raw.description || typeof raw.description !== 'string' || raw.description.trim().length < 5) {
    errors.push('Description must be at least 5 characters long.');
  }

  // Coordinate check
  if (typeof raw.latitude !== 'number' || typeof raw.longitude !== 'number') {
    errors.push('Latitude and longitude coordinates are required and must be numeric.');
  } else {
    const boundaryCheck = validateWithinMunicipalBounds(raw.latitude, raw.longitude);
    if (!boundaryCheck.isWithinBounds) {
      errors.push(boundaryCheck.errorMessage || 'Coordinates out of municipal bounds.');
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const cleanedText = cleanComplaintText(raw.description).cleanedText;
  const normalizedCoords = normalizeCoordinates({
    latitude: raw.latitude,
    longitude: raw.longitude,
  });

  return {
    isValid: true,
    normalizedData: {
      description: cleanedText,
      latitude: normalizedCoords.latitude,
      longitude: normalizedCoords.longitude,
      source: raw.source || 'citizen_web',
      photo: raw.photo,
      audio: raw.audio,
      category: raw.category || 'household',
    },
  };
}
