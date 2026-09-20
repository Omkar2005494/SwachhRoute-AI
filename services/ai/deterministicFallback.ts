/**
 * SwachhRoute AI — Deterministic Rule-Based Fallback Analyzer
 * 
 * Activated strictly when Local Ollama is offline or when LLM output fails schema validation.
 * Performs deterministic keyword/regex classification.
 * Output is visibly labeled: "Rule-Based Fallback" (never presented as AI or Llama).
 */

import {
  ComplaintAnalysis,
  AICategory,
  AIHazardType,
  AIMachineryType,
} from '@/types';

export function runDeterministicFallback(complaintText: string): ComplaintAnalysis {
  const lower = complaintText.toLowerCase();

  let category: AICategory = 'household';
  let severity = 4;
  let hazard: AIHazardType = 'none_identified';
  let machinery: AIMachineryType = 'hydraulic_compactor';
  let summary = 'General municipal waste accumulation reported.';
  let recommendedAction = 'Dispatch standard collection vehicle on scheduled sector run.';

  // Construction debris & heavy material
  if (
    lower.includes('construction') ||
    lower.includes('debris') ||
    lower.includes('malba') ||
    lower.includes('concrete') ||
    lower.includes('cement') ||
    lower.includes('rubble')
  ) {
    category = 'construction_debris';
    severity = 6;
    hazard = 'construction_debris';
    machinery = 'backhoe';
    summary = 'Construction and demolition rubble reported along thoroughfare.';
    recommendedAction = 'Dispatch backhoe loader to clear heavy physical obstruction.';
  }
  // Drain & flood risk
  else if (
    lower.includes('nullah') ||
    lower.includes('nala') ||
    lower.includes('drain') ||
    lower.includes('gutter') ||
    lower.includes('blockage') ||
    lower.includes('flood') ||
    lower.includes('baarish')
  ) {
    category = 'mixed';
    severity = 7;
    hazard = 'drain_flood_risk';
    machinery = 'hydraulic_compactor';
    summary = 'Waste dumped adjacent to drainage channel risking monsoon blockage.';
    recommendedAction = 'Deploy priority clearance crew to prevent municipal stormwater overflow.';
  }
  // Biomedical / Hospital waste
  else if (
    lower.includes('medical') ||
    lower.includes('hospital') ||
    lower.includes('syringe') ||
    lower.includes('needle') ||
    lower.includes('clinic') ||
    lower.includes('vial')
  ) {
    category = 'hazardous';
    severity = 9;
    hazard = 'biomedical';
    machinery = 'mini_tipper';
    summary = 'Suspected biomedical hazard or clinical waste observed.';
    recommendedAction = 'Escalate to Hazardous Materials Protocol; dispatch equipped crew.';
  }
  // Severe odor / organic decomposition
  else if (
    lower.includes('smell') ||
    lower.includes('bad smell') ||
    lower.includes('odor') ||
    lower.includes('gandh') ||
    lower.includes('rotting') ||
    lower.includes('sar raha') ||
    lower.includes('badbu')
  ) {
    category = 'organic';
    severity = 6;
    hazard = 'severe_odor';
    machinery = 'hydraulic_compactor';
    summary = 'Decomposing organic waste producing severe public odor nuisance.';
    recommendedAction = 'Schedule compactor pickup and apply municipal disinfectant neutralizer.';
  }
  // Plastic / Commercial packaging
  else if (
    lower.includes('plastic') ||
    lower.includes('bottle') ||
    lower.includes('polythene') ||
    lower.includes('wrapper') ||
    lower.includes('thermocol')
  ) {
    category = 'plastic';
    severity = 5;
    hazard = 'fire_risk';
    machinery = 'hydraulic_compactor';
    summary = 'High-density plastic accumulation posing combustible hazard.';
    recommendedAction = 'Schedule bulk dry-waste compaction collection.';
  }

  // Duration escalation: check if complaint mentions 3+ days
  if (lower.includes('3 din') || lower.includes('3 days') || lower.includes('week') || lower.includes('hafta')) {
    severity = Math.min(10, severity + 1);
  }

  return {
    category,
    severity,
    hazard,
    machineryRequired: machinery,
    estimatedWasteKg: null, // Conservative: do not guess quantity in rule fallback
    summary,
    recommendedAction,
    confidence: 0.65, // Explicitly modest advisory confidence for rule heuristics
    engine: 'rule_based_fallback',
    analyzedAt: new Date().toISOString(),
  };
}
