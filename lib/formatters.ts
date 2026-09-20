/**
 * SwachhRoute AI — Domain Value Display Formatters
 *
 * Maps canonical domain enums to human-readable UI labels.
 * Domain values are stored strictly as enums; display labels are computed at render time.
 */

import { WasteCategory, HazardLevel, MachineryType } from '@/types';

/**
 * Formats a canonical WasteCategory enum into a human-readable display string.
 */
export function formatCategoryLabel(cat?: WasteCategory | string): string {
  if (!cat) return 'Household Waste';
  switch (cat) {
    case 'construction_debris':
      return 'Construction & Debris';
    case 'commercial':
      return 'Commercial Waste';
    case 'household':
      return 'Household Waste';
    case 'organic':
      return 'Organic/Green Waste';
    case 'plastic':
      return 'Plastic Dump';
    case 'hazardous':
      return 'Hazardous/Medical';
    case 'electronic':
      return 'Electronic Waste';
    case 'mixed':
      return 'Mixed Waste';
    default:
      return cat;
  }
}

/**
 * Formats a canonical HazardLevel enum into a human-readable display string.
 */
export function formatHazardLabel(h?: HazardLevel | string): string {
  if (!h) return 'None Identified';
  switch (h) {
    case 'sharp_objects':
      return 'Sharp Objects';
    case 'biomedical':
      return 'Biomedical';
    case 'fire_risk':
      return 'Fire Risk';
    case 'drain_flood_risk':
      return 'Drain Flood Risk';
    case 'severe_odor':
      return 'Severe Odor';
    case 'organic_decay':
      return 'Organic Decay';
    case 'construction_debris':
      return 'Construction Debris';
    case 'hazardous_material':
      return 'Hazardous Material';
    case 'mixed_waste':
      return 'Mixed Waste';
    case 'none_identified':
      return 'None Identified';
    default:
      return h.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

/**
 * Formats a canonical MachineryType enum into a human-readable display string.
 */
export function formatMachineryLabel(m?: MachineryType | string): string {
  if (!m) return 'Hydraulic Compactor';
  switch (m) {
    case 'hydraulic_compactor':
      return 'Hydraulic Compactor';
    case 'mini_tipper':
      return 'Mini Tipper';
    case 'backhoe':
      return 'Backhoe';
    default:
      return m.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
