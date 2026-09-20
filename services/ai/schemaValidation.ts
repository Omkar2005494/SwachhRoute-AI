/**
 * SwachhRoute AI — AI Output Schema Validation
 * 
 * Validates untrusted LLM generation strictly against the domain schema.
 * Rejects malformed JSON, invalid enums, out-of-bound severity, and hallucinations.
 */

import {
  ComplaintAnalysis,
  AICategory,
  AIHazardType,
  AIMachineryType,
} from '@/types';

const VALID_CATEGORIES: AICategory[] = [
  'household',
  'commercial',
  'construction_debris',
  'organic',
  'plastic',
  'hazardous',
  'electronic',
  'mixed',
];

const VALID_HAZARDS: AIHazardType[] = [
  'organic_decay',
  'severe_odor',
  'biomedical',
  'drain_flood_risk',
  'construction_debris',
  'sharp_objects',
  'fire_risk',
  'hazardous_material',
  'mixed_waste',
  'none_identified',
];

const VALID_MACHINERY: AIMachineryType[] = [
  'hydraulic_compactor',
  'mini_tipper',
  'backhoe',
];

export interface ValidationSuccess {
  isValid: true;
  data: ComplaintAnalysis;
}

export interface ValidationFailure {
  isValid: false;
  errors: string[];
  rawParsed?: unknown;
}

export type AISchemaValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Strips markdown code blocks if the model wrapped output in ```json ... ```
 */
export function cleanRawJSONString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Validates untrusted raw response from Llama 3.2 3B
 */
export function validateComplaintAnalysis(
  rawInput: string | Record<string, unknown>
): AISchemaValidationResult {
  const errors: string[] = [];
  let parsed: any;

  if (typeof rawInput === 'string') {
    try {
      const cleaned = cleanRawJSONString(rawInput);
      parsed = JSON.parse(cleaned);
    } catch (e: any) {
      return {
        isValid: false,
        errors: [`Malformed JSON syntax from model: ${e?.message || 'unknown parse error'}`],
      };
    }
  } else {
    parsed = rawInput;
  }

  if (!parsed || typeof parsed !== 'object') {
    return { isValid: false, errors: ['LLM output is not a JSON object'] };
  }

  // 1. Category validation
  const categoryStr = String(parsed.category || '').toLowerCase().trim() as AICategory;
  if (!VALID_CATEGORIES.includes(categoryStr)) {
    errors.push(`Invalid category '${parsed.category}'. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // 2. Severity validation (integer 1-10)
  const severityNum = typeof parsed.severity === 'number' ? parsed.severity : parseInt(parsed.severity, 10);
  if (!Number.isInteger(severityNum) || severityNum < 1 || severityNum > 10) {
    errors.push(`Severity must be an integer between 1 and 10, got: ${parsed.severity}`);
  }

  // 3. Hazard validation
  const hazardStr = String(parsed.hazard || '').toLowerCase().trim() as AIHazardType;
  if (!VALID_HAZARDS.includes(hazardStr)) {
    errors.push(`Invalid hazard '${parsed.hazard}'. Must be one of: ${VALID_HAZARDS.join(', ')}`);
  }

  // 4. Machinery validation (strictly hydraulic_compactor, mini_tipper, backhoe)
  const machineryStr = String(parsed.machineryRequired || '').toLowerCase().trim() as AIMachineryType;
  if (!VALID_MACHINERY.includes(machineryStr)) {
    errors.push(`Invalid machinery '${parsed.machineryRequired}'. Must be one of: ${VALID_MACHINERY.join(', ')}`);
  }

  // 5. Estimated waste validation (null or number >= 0)
  let estimatedKg: number | null = null;
  if (parsed.estimatedWasteKg !== null && parsed.estimatedWasteKg !== undefined) {
    const num = Number(parsed.estimatedWasteKg);
    if (!Number.isFinite(num) || num < 0 || num > 50000) {
      errors.push(`Invalid estimatedWasteKg '${parsed.estimatedWasteKg}'. Must be null or a number between 0 and 50000`);
    } else {
      estimatedKg = Math.round(num);
    }
  }

  // 6. Summary validation
  const summaryStr = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
  if (summaryStr.length < 3) {
    errors.push('Summary is required and must be at least 3 characters long');
  }

  // 7. Recommended action validation
  const actionStr = typeof parsed.recommendedAction === 'string' ? parsed.recommendedAction.trim() : '';
  if (actionStr.length < 3) {
    errors.push('Recommended action is required and must be at least 3 characters long');
  }

  // 8. Confidence validation (0 to 1)
  const confNum = Number(parsed.confidence);
  if (isNaN(confNum) || confNum < 0 || confNum > 1) {
    errors.push(`Confidence must be a number between 0.0 and 1.0, got: ${parsed.confidence}`);
  }

  if (errors.length > 0) {
    return { isValid: false, errors, rawParsed: parsed };
  }

  return {
    isValid: true,
    data: {
      category: categoryStr,
      severity: severityNum,
      hazard: hazardStr,
      machineryRequired: machineryStr,
      estimatedWasteKg: estimatedKg,
      summary: summaryStr,
      recommendedAction: actionStr,
      confidence: Math.round(confNum * 100) / 100,
      engine: 'llama3.2:3b',
      analyzedAt: new Date().toISOString(),
    },
  };
}
