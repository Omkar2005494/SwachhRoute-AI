/**
 * SwachhRoute AI — Chronic Hotspot Recurrence & Strategic Policy Service (Phase 7)
 * 
 * Deterministic mathematical scoring for recurrence velocity, chronic dump classification,
 * and automated statutory municipal policy recommendations under Solid Waste Management Rules.
 */

import {
  Hotspot,
  WasteReport,
  PickupVerification,
  HotspotRecurrenceProfile,
  RecurrenceClassification,
  PolicyRecommendation,
  WardRecurrenceAnalytics,
  WasteCategory,
  HazardLevel,
} from '@/types';

/**
 * Computes deterministic hazard risk weighting (0-100)
 */
function getHazardWeight(hazard: HazardLevel): number {
  switch (hazard) {
    case 'biomedical':
      return 100;
    case 'hazardous_material':
      return 95;
    case 'fire_risk':
      return 85;
    case 'drain_flood_risk':
      return 80;
    case 'organic_decay':
    case 'severe_odor':
      return 70;
    case 'sharp_objects':
    case 'construction_debris':
      return 60;
    case 'mixed_waste':
      return 50;
    case 'none_identified':
    default:
      return 25;
  }
}

/**
 * Calculates a standardized 0-100 Recurrence Index
 * 
 * Formula:
 * Recurrence Score = 0.30 * S_freq + 0.25 * S_mass + 0.20 * S_sev + 0.15 * S_haz + 0.10 * S_span
 */
export function calculateRecurrenceScore(
  reportCount: number,
  totalWasteKg: number,
  severityScore: number,
  hazard: HazardLevel,
  temporalSpanDays: number
): number {
  const sFreq = Math.min(100, reportCount * 12);
  const sMass = Math.min(100, totalWasteKg / 40);
  const sSev = Math.min(100, Math.max(0, severityScore));
  const sHaz = getHazardWeight(hazard);
  const sSpan = Math.min(100, Math.max(1, temporalSpanDays) * 10);

  const rawScore =
    0.30 * sFreq +
    0.25 * sMass +
    0.20 * sSev +
    0.15 * sHaz +
    0.10 * sSpan;

  return Math.min(100, Math.max(0, Math.round(rawScore)));
}

/**
 * Classifies a hotspot into one of 4 operational lifecycle categories
 */
export function classifyRecurrence(
  score: number,
  reportCount: number,
  isFullyCleared: boolean
): RecurrenceClassification {
  if (isFullyCleared) {
    return 'stabilized_cleared';
  }
  if (score >= 60 || reportCount >= 6) {
    return 'chronic_dumping';
  }
  if (score >= 35 || reportCount >= 3) {
    return 'emerging_hotspot';
  }
  return 'transient_spill';
}

/**
 * Generates tailored statutory policy recommendations based on dominant municipal root cause
 */
export function generatePolicyRecommendations(
  hotspot: Hotspot,
  classification: RecurrenceClassification,
  primaryCategory: WasteCategory,
  hazard: HazardLevel
): PolicyRecommendation[] {
  const directives: PolicyRecommendation[] = [];
  const zoneName = hotspot.zoneName || `Cluster #${hotspot.clusterLabel}`;

  // 1. Infrastructure Interventions
  if (primaryCategory === 'organic') {
    directives.push({
      id: `POL-INFRA-${hotspot.id}-01`,
      type: 'infrastructure',
      title: 'Deploy Heavy-Duty 4.5m³ Covered Dumper Placer Bin',
      description: `Install dual covered mechanical dumper placers at ${zoneName} with hydraulic trunnions to prevent open decomposition and bird/stray scavenging.`,
      targetStakeholders: ['Market Traders Association', 'Ward Sanitary Inspector'],
      estimatedCostInr: 85000,
      priority: classification === 'chronic_dumping' ? 'immediate' : 'high',
      statutoryBacking: 'Solid Waste Management Rules 2016, Rule 15(g)',
    });
    directives.push({
      id: `POL-INFRA-${hotspot.id}-02`,
      type: 'infrastructure',
      title: 'Decentralized Organic Bio-Composting Facility',
      description: `Establish an aerobic biomethanation or microbial composting pit within 400m of ${zoneName} to treat wet vegetable waste at source.`,
      targetStakeholders: ['PMC Environment Dept', 'Local APMC Mandi Committee'],
      estimatedCostInr: 220000,
      priority: 'medium',
      statutoryBacking: 'SWM Rules 2016, Rule 15(v)',
    });
  } else if (primaryCategory === 'construction_debris') {
    directives.push({
      id: `POL-INFRA-${hotspot.id}-01`,
      type: 'infrastructure',
      title: 'Perimeter Jersey Barriers & C&D Drop-Off Enclosure',
      description: `Erect pre-cast concrete jersey barriers around the vacant plot at ${zoneName} and designate an official municipal C&D recycling intake chute.`,
      targetStakeholders: ['City Town Planning Dept', 'Ward Executive Engineer'],
      estimatedCostInr: 45000,
      priority: 'high',
      statutoryBacking: 'Construction & Demolition Waste Management Rules 2016, Rule 9',
    });
  } else if (primaryCategory === 'hazardous' || hazard === 'biomedical' || hazard === 'hazardous_material') {
    directives.push({
      id: `POL-INFRA-${hotspot.id}-01`,
      type: 'infrastructure',
      title: 'Barcoded Biomedical Containment Hub',
      description: `Install tamper-proof color-coded hazardous receptacles with biometric lockouts for authorized clinic staff in ${zoneName}.`,
      targetStakeholders: ['Maharashtra Pollution Control Board (MPCB)', 'Ward Health Officer'],
      estimatedCostInr: 60000,
      priority: 'immediate',
      statutoryBacking: 'Bio-Medical Waste Management Rules 2016, Rule 4',
    });
  } else if (hazard === 'drain_flood_risk') {
    directives.push({
      id: `POL-INFRA-${hotspot.id}-01`,
      type: 'infrastructure',
      title: 'Stormwater Nullah Silt Grates & Floating Trash Trap',
      description: `Install heavy-gauge galvanized steel trash grates and floating boom traps upstream of ${zoneName} to capture floating debris before channel choke.`,
      targetStakeholders: ['PMC Stormwater Drainage Division', 'Disaster Management Cell'],
      estimatedCostInr: 110000,
      priority: 'immediate',
      statutoryBacking: 'National Green Tribunal Guidelines on Stormwater Channels',
    });
  } else {
    directives.push({
      id: `POL-INFRA-${hotspot.id}-01`,
      type: 'infrastructure',
      title: 'Segregated Twin-Bin Street Furniture Array',
      description: `Place color-coded 240L twin wheeled bins (Blue for Dry / Green for Wet) at 50-meter intervals along ${zoneName}.`,
      targetStakeholders: ['Ward Sanitary Division', 'Commercial Vendors'],
      estimatedCostInr: 32000,
      priority: 'high',
      statutoryBacking: 'Solid Waste Management Rules 2016, Rule 15(h)',
    });
  }

  // 2. Enforcement Interventions for Chronic/Emerging Sites
  if (classification === 'chronic_dumping' || classification === 'emerging_hotspot') {
    directives.push({
      id: `POL-ENF-${hotspot.id}-01`,
      type: 'enforcement',
      title: 'Solar-Powered Mobile CCTV Surveillance Pole',
      description: `Deploy an autonomous 4G/solar PTZ surveillance camera with infrared night vision to log vehicle registrations of illegal fly-tippers at ${zoneName}.`,
      targetStakeholders: ['Smart City Command Center', 'Municipal Police Wing'],
      estimatedCostInr: 55000,
      priority: 'immediate',
      statutoryBacking: 'Municipal Solid Waste Bye-Laws & Environmental Protection Act',
    });
    directives.push({
      id: `POL-ENF-${hotspot.id}-02`,
      type: 'enforcement',
      title: 'Nocturnal Flying Squad Vigilance & Compounding Penalties',
      description: `Institute surprise patrols between 22:00 and 05:00 with on-the-spot compounding penalties (₹5,000 for commercial, ₹15,000 for C&D dumping).`,
      targetStakeholders: ['Ward Nuisance Detection Squad (NDS)', 'Zonal Health Inspector'],
      priority: 'high',
      statutoryBacking: 'PMC Solid Waste Bye-Laws 2019, Section 12',
    });
  }

  // 3. Collection Frequency Optimization
  directives.push({
    id: `POL-FREQ-${hotspot.id}-01`,
    type: 'collection_frequency',
    title: 'Dual-Shift Dedicated Route Dispatch',
    description: `Upgrade collection frequency for ${zoneName} from once-daily to split dual-cycle (06:30 AM morning sweep + 19:30 PM post-market sweep).`,
    targetStakeholders: ['Fleet Dispatch Operations', 'Driver Routing Superintendent'],
    priority: 'high',
    statutoryBacking: 'Service Level Benchmark (SLB) MoHUA Guidelines',
  });

  // 4. Civic Awareness & Community Co-Governance
  directives.push({
    id: `POL-AWARE-${hotspot.id}-01`,
    type: 'civic_awareness',
    title: 'Mohalla Sanitation Committee Co-Governance',
    description: `Form a localized vigilance committee with resident welfare associations (RWAs) and shopkeeper delegates to monitor ${zoneName}.`,
    targetStakeholders: ['Local RWAs', 'Trader Associations', 'Ward Councilor Office'],
    estimatedCostInr: 5000,
    priority: 'medium',
    statutoryBacking: 'Swachh Bharat Mission Urban 2.0 Citizen Engagement Framework',
  });

  return directives;
}

/**
 * Builds the full historical & predictive recurrence profile for a single hotspot
 */
export function buildHotspotRecurrenceProfile(
  hotspot: Hotspot,
  allReports: WasteReport[],
  isFullyCleared = false
): HotspotRecurrenceProfile {
  // Find linked reports
  const clusterReports = allReports.filter(
    (r) =>
      r.hotspotId === hotspot.id ||
      (hotspot.reportIds && hotspot.reportIds.includes(r.id))
  );

  const count = clusterReports.length > 0 ? clusterReports.length : hotspot.reportCount || 1;
  const totalKg = hotspot.totalEstimatedWasteKg || clusterReports.reduce((s, r) => s + (r.estimatedWasteKg || 0), 0);

  // Compute temporal span
  let spanDays = 3;
  let intervalDays = 1.0;
  if (clusterReports.length >= 2) {
    const dates = clusterReports
      .map((r) => new Date(r.timestamp).getTime())
      .filter((t) => !isNaN(t))
      .sort((a, b) => a - b);

    if (dates.length >= 2) {
      const diffMs = dates[dates.length - 1] - dates[0];
      spanDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      intervalDays = Math.max(0.1, Math.round((spanDays / (dates.length - 1)) * 10) / 10);
    }
  }

  const primaryCategory = hotspot.dominantCategory || hotspot.dominantWasteCategory || 'household';
  const hazard = hotspot.dominantHazard || 'none';

  const recurrenceIndex = calculateRecurrenceScore(
    count,
    totalKg,
    hotspot.severityScore || 50,
    hazard,
    spanDays
  );

  const classification = classifyRecurrence(recurrenceIndex, count, isFullyCleared);

  const chronicRisk: 'critical' | 'high' | 'moderate' | 'low' =
    recurrenceIndex >= 75
      ? 'critical'
      : recurrenceIndex >= 55
      ? 'high'
      : recurrenceIndex >= 35
      ? 'moderate'
      : 'low';

  const policyInterventions = generatePolicyRecommendations(
    hotspot,
    classification,
    primaryCategory,
    hazard
  );

  // Build daily timeline
  const dayBuckets = new Map<string, { count: number; wasteKg: number }>();
  for (const r of clusterReports) {
    const dateStr = r.timestamp ? r.timestamp.slice(0, 10) : '2026-09-20';
    const existing = dayBuckets.get(dateStr) || { count: 0, wasteKg: 0 };
    existing.count += 1;
    existing.wasteKg += r.estimatedWasteKg || 0;
    dayBuckets.set(dateStr, existing);
  }

  const timeline = Array.from(dayBuckets.entries())
    .map(([date, data]) => ({ date, count: data.count, wasteKg: data.wasteKg }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    hotspotId: hotspot.id,
    zoneName: hotspot.zoneName || `Cluster #${hotspot.clusterLabel}`,
    classification,
    recurrenceIndex,
    temporalSpanDays: spanDays,
    averageIntervalDays: intervalDays,
    complaintCount: count,
    totalAccumulatedWasteKg: totalKg,
    primaryDriver: primaryCategory,
    hazardLevel: hazard,
    chronicRisk,
    policyInterventions,
    timeline: timeline.length > 0 ? timeline : [{ date: '2026-09-20', count, wasteKg: totalKg }],
  };
}

/**
 * Analyzes ward-wide chronic recurrence patterns and synthesizes executive municipal intelligence
 */
export function analyzeWardRecurrence(
  wardName: string,
  hotspots: Hotspot[],
  reports: WasteReport[],
  pickupVerifications: Record<string, PickupVerification[]> = {}
): WardRecurrenceAnalytics {
  if (!hotspots || hotspots.length === 0) {
    return {
      wardName: wardName || 'Municipal Ward Operations',
      totalHotspotsAnalyzed: 0,
      chronicHotspotsCount: 0,
      emergingHotspotsCount: 0,
      transientSpillsCount: 0,
      stabilizedCount: 0,
      averageWardRecurrenceScore: 0,
      primaryRootCauses: [],
      actionableDirectives: [],
      synthesizedAt: new Date().toISOString(),
    };
  }

  // Check if any hotspot is verified cleared
  const profiles = hotspots.map((h) => {
    const isCleared =
      h.status === 'resolved' ||
      Object.values(pickupVerifications).some((verifs) =>
        verifs.some((v) => v.hotspotId === h.id && v.status === 'collected')
      );
    return buildHotspotRecurrenceProfile(h, reports, isCleared);
  });

  const chronicCount = profiles.filter((p) => p.classification === 'chronic_dumping').length;
  const emergingCount = profiles.filter((p) => p.classification === 'emerging_hotspot').length;
  const transientCount = profiles.filter((p) => p.classification === 'transient_spill').length;
  const stabilizedCount = profiles.filter((p) => p.classification === 'stabilized_cleared').length;

  const totalScore = profiles.reduce((s, p) => s + p.recurrenceIndex, 0);
  const avgScore = Math.round(totalScore / profiles.length);

  // Find highest risk hotspot
  const sortedByRisk = [...profiles].sort((a, b) => b.recurrenceIndex - a.recurrenceIndex);
  const highestRiskHotspotId = sortedByRisk.length > 0 ? sortedByRisk[0].hotspotId : undefined;

  // Root cause category distribution
  const categoryCounts = new Map<WasteCategory, number>();
  for (const p of profiles) {
    categoryCounts.set(p.primaryDriver, (categoryCounts.get(p.primaryDriver) || 0) + 1);
  }

  const primaryRootCauses = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({
      category,
      dumpCount: count,
      percentage: Math.round((count / profiles.length) * 100),
    }))
    .sort((a, b) => b.dumpCount - a.dumpCount);

  // Collect prioritized actionable directives (unique by title)
  const seenDirectives = new Set<string>();
  const actionableDirectives: PolicyRecommendation[] = [];

  for (const p of sortedByRisk) {
    for (const directive of p.policyInterventions) {
      if (!seenDirectives.has(directive.title)) {
        seenDirectives.add(directive.title);
        actionableDirectives.push(directive);
      }
    }
  }

  return {
    wardName: wardName || 'Municipal Ward Operations',
    totalHotspotsAnalyzed: hotspots.length,
    chronicHotspotsCount: chronicCount,
    emergingHotspotsCount: emergingCount,
    transientSpillsCount: transientCount,
    stabilizedCount: stabilizedCount,
    averageWardRecurrenceScore: avgScore,
    highestRiskHotspotId,
    primaryRootCauses,
    actionableDirectives: actionableDirectives.slice(0, 8),
    synthesizedAt: new Date().toISOString(),
  };
}
