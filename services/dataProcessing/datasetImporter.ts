/**
 * Municipal Dataset Ingestion and Export Service
 * Supports importing custom CSV and GeoJSON municipal datasets,
 * validating schema conformance, and exporting active operational datasets.
 */

import { WasteReport, WasteCategory, WasteSeverity, HazardLevel, MachineryType } from '@/types';
import { validateWithinMunicipalBounds } from './boundaryValidation';
import { cleanComplaintText } from './textCleaning';

export interface IngestionResult {
  success: boolean;
  reports: WasteReport[];
  errors: string[];
  totalParsed: number;
}

/**
 * Normalizes input category string to valid WasteCategory
 */
function normalizeCategory(raw?: string): WasteCategory {
  if (!raw) return 'household';
  const clean = raw.toLowerCase().trim().replace(/[\s-]+/g, '_');
  const valid: WasteCategory[] = [
    'household',
    'commercial',
    'organic',
    'plastic',
    'hazardous',
    'electronic',
    'construction_debris',
  ];
  if (valid.includes(clean as WasteCategory)) return clean as WasteCategory;
  if (clean.includes('bio') || clean.includes('medic') || clean.includes('hazard')) return 'hazardous';
  if (clean.includes('malba') || clean.includes('debris') || clean.includes('construct') || clean.includes('cement')) return 'construction_debris';
  if (clean.includes('food') || clean.includes('veg') || clean.includes('sabzi') || clean.includes('wet')) return 'organic';
  if (clean.includes('bottle') || clean.includes('cup') || clean.includes('polythene')) return 'plastic';
  return 'household';
}

/**
 * Normalizes input severity string to valid WasteSeverity
 */
function normalizeSeverity(raw?: string): WasteSeverity {
  if (!raw) return 'medium';
  const clean = raw.toLowerCase().trim();
  if (clean === 'critical' || clean === 'urgent' || clean === 'high' || clean === 'medium' || clean === 'low') {
    return clean === 'urgent' ? 'critical' : (clean as WasteSeverity);
  }
  const num = parseInt(clean, 10);
  if (!isNaN(num)) {
    if (num >= 8) return 'critical';
    if (num >= 6) return 'high';
    if (num >= 4) return 'medium';
    return 'low';
  }
  return 'medium';
}

/**
 * Splits CSV lines safely respecting quotes
 */
function splitCSVRow(row: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

/**
 * Ingests and parses municipal complaint CSV data
 */
export function parseCSVReports(csvText: string, wardContext = 'Custom Ingestion Ward'): IngestionResult {
  const errors: string[] = [];
  const reports: WasteReport[] = [];

  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) {
    return {
      success: false,
      reports: [],
      errors: ['CSV file must contain at least a header row and one data row.'],
      totalParsed: 0,
    };
  }

  const headerTokens = splitCSVRow(lines[0]).map((h) => h.toLowerCase().replace(/[\s_-]+/g, ''));
  
  // Find column indices
  const descIdx = headerTokens.findIndex((h) => ['description', 'text', 'complaint', 'details', 'content'].includes(h));
  const latIdx = headerTokens.findIndex((h) => ['lat', 'latitude', 'y'].includes(h));
  const lngIdx = headerTokens.findIndex((h) => ['lng', 'lon', 'longitude', 'x'].includes(h));
  const catIdx = headerTokens.findIndex((h) => ['category', 'hazardclass', 'type', 'wastecategory'].includes(h));
  const sevIdx = headerTokens.findIndex((h) => ['severity', 'urgency', 'severityscore', 'priority'].includes(h));
  const weightIdx = headerTokens.findIndex((h) => ['wastekg', 'estimatedwastekg', 'weightkg', 'weight', 'kg'].includes(h));
  const citizenIdx = headerTokens.findIndex((h) => ['citizen', 'citizenname', 'name', 'reporter'].includes(h));
  const wardIdx = headerTokens.findIndex((h) => ['ward', 'wardname', 'zone', 'area'].includes(h));

  if (descIdx === -1 || latIdx === -1 || lngIdx === -1) {
    return {
      success: false,
      reports: [],
      errors: [
        'Required CSV headers missing. Ensure CSV includes "description" (or "text"), "latitude" (or "lat"), and "longitude" (or "lng").',
      ],
      totalParsed: 0,
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const row = splitCSVRow(lines[i]);
    if (row.length <= Math.max(descIdx, latIdx, lngIdx)) continue;

    const rawDesc = row[descIdx] || '';
    const rawLat = parseFloat(row[latIdx]);
    const rawLng = parseFloat(row[lngIdx]);

    if (!rawDesc || rawDesc.length < 4) {
      errors.push(`Row ${i + 1}: Description too short or empty.`);
      continue;
    }
    if (isNaN(rawLat) || isNaN(rawLng)) {
      errors.push(`Row ${i + 1}: Coordinates are not valid numbers.`);
      continue;
    }

    const boundCheck = validateWithinMunicipalBounds(rawLat, rawLng);
    if (!boundCheck.isWithinBounds) {
      errors.push(`Row ${i + 1}: Coordinates (${rawLat}, ${rawLng}) are out of operational bounds.`);
      continue;
    }

    const category = catIdx !== -1 ? normalizeCategory(row[catIdx]) : 'household';
    const severity = sevIdx !== -1 ? normalizeSeverity(row[sevIdx]) : 'medium';
    const wasteKg = weightIdx !== -1 && !isNaN(parseFloat(row[weightIdx])) ? Math.max(50, parseFloat(row[weightIdx])) : 650;
    const citizen = citizenIdx !== -1 && row[citizenIdx] ? row[citizenIdx] : 'Citizen Report';
    const wardName = wardIdx !== -1 && row[wardIdx] ? row[wardIdx] : wardContext;

    const cleanedDesc = cleanComplaintText(rawDesc).cleanedText;

    reports.push({
      id: `REP-IMP-${String(reports.length + 1).padStart(3, '0')}`,
      description: cleanedDesc,
      latitude: parseFloat(rawLat.toFixed(6)),
      longitude: parseFloat(rawLng.toFixed(6)),
      timestamp: new Date().toISOString(),
      category,
      severity,
      hazard: category === 'hazardous' ? 'biomedical' : category === 'construction_debris' ? 'sharp_objects' : 'none_identified',
      machineryRequired: category === 'construction_debris' ? ['backhoe'] : ['hydraulic_compactor'],
      estimatedWasteKg: Math.round(wasteKg),
      status: 'validated',
      source: 'citizen_web',
      aiAnalyzed: true,
      aiStatus: 'complete',
      wardName,
      citizenName: citizen,
    });
  }

  return {
    success: reports.length > 0,
    reports,
    errors,
    totalParsed: reports.length,
  };
}

/**
 * Ingests GeoJSON FeatureCollection of Point features
 */
export function parseGeoJSONReports(geoJsonText: string, wardContext = 'Custom Ingestion Zone'): IngestionResult {
  const errors: string[] = [];
  const reports: WasteReport[] = [];

  let geoJson: any;
  try {
    geoJson = JSON.parse(geoJsonText);
  } catch (err: any) {
    return {
      success: false,
      reports: [],
      errors: [`Invalid GeoJSON syntax: ${err.message}`],
      totalParsed: 0,
    };
  }

  const features = geoJson.features || (geoJson.type === 'Feature' ? [geoJson] : []);
  if (!Array.isArray(features) || features.length === 0) {
    return {
      success: false,
      reports: [],
      errors: ['No features found in GeoJSON FeatureCollection.'],
      totalParsed: 0,
    };
  }

  for (let i = 0; i < features.length; i++) {
    const f = features[i];
    if (!f.geometry || f.geometry.type !== 'Point' || !Array.isArray(f.geometry.coordinates)) {
      errors.push(`Feature ${i + 1}: Must be a Point geometry.`);
      continue;
    }

    const [lng, lat] = f.geometry.coordinates;
    const props = f.properties || {};

    const rawDesc = props.description || props.text || props.complaint || props.name || 'Municipal waste incident';
    const boundCheck = validateWithinMunicipalBounds(lat, lng);
    if (!boundCheck.isWithinBounds) {
      errors.push(`Feature ${i + 1}: Coordinates (${lat}, ${lng}) outside operational boundary.`);
      continue;
    }

    const category = normalizeCategory(props.category || props.hazard_class || props.type);
    const severity = normalizeSeverity(props.severity || props.urgency);
    const wasteKg = props.waste_kg || props.estimatedWasteKg || 600;

    reports.push({
      id: `REP-GEO-${String(reports.length + 1).padStart(3, '0')}`,
      description: cleanComplaintText(rawDesc).cleanedText,
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
      timestamp: props.timestamp || new Date().toISOString(),
      category,
      severity,
      hazard: props.hazard || (category === 'hazardous' ? 'biomedical' : 'none_identified'),
      machineryRequired: props.machineryRequired || (category === 'construction_debris' ? ['backhoe'] : ['hydraulic_compactor']),
      estimatedWasteKg: Math.round(wasteKg),
      status: 'validated',
      source: 'citizen_web',
      aiAnalyzed: true,
      aiStatus: 'complete',
      wardName: props.wardName || props.ward || wardContext,
      citizenName: props.citizen || props.citizenName || 'GeoJSON Ingestion',
    });
  }

  return {
    success: reports.length > 0,
    reports,
    errors,
    totalParsed: reports.length,
  };
}

/**
 * Converts WasteReport[] to downloadable CSV format
 */
export function exportReportsToCSV(reports: WasteReport[]): string {
  const headers = [
    'id',
    'description',
    'latitude',
    'longitude',
    'timestamp',
    'category',
    'severity',
    'hazard',
    'machineryRequired',
    'estimatedWasteKg',
    'status',
    'wardName',
    'citizenName',
  ];

  const rows = reports.map((r) => {
    return [
      `"${r.id}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      r.latitude,
      r.longitude,
      `"${r.timestamp}"`,
      `"${r.category}"`,
      `"${r.severity}"`,
      `"${r.hazard}"`,
      `"${(r.machineryRequired || []).join(';')}"`,
      r.estimatedWasteKg,
      `"${r.status}"`,
      `"${(r.wardName || '').replace(/"/g, '""')}"`,
      `"${(r.citizenName || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Converts WasteReport[] to standard GeoJSON FeatureCollection
 */
export function exportReportsToGeoJSON(reports: WasteReport[]): string {
  const features = reports.map((r) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [r.longitude, r.latitude],
    },
    properties: {
      id: r.id,
      description: r.description,
      timestamp: r.timestamp,
      category: r.category,
      severity: r.severity,
      hazard: r.hazard,
      machineryRequired: r.machineryRequired,
      estimatedWasteKg: r.estimatedWasteKg,
      status: r.status,
      wardName: r.wardName,
      citizenName: r.citizenName,
      hotspotId: r.hotspotId,
    },
  }));

  return JSON.stringify(
    {
      type: 'FeatureCollection',
      features,
    },
    null,
    2
  );
}

/**
 * Generates sample municipal CSV template for evaluators and testing
 */
export function generateSampleCSV(): string {
  return `description,latitude,longitude,category,severity,waste_kg,citizen_name,ward_name
"Rotten tomatoes and wet vegetable peelings overflowing behind market gate.",18.5062,73.8055,organic,high,850,"Sunil Shinde","Ward 12 (Kothrud)"
"Stormwater culvert blocked by plastic waste and domestic sludge.",18.5118,73.8012,household,critical,1200,"Swati Deshpande","Ward 12 (Kothrud)"
"Used pathology vials and clinical syringes dumped in open roadside bin.",18.4985,73.8182,hazardous,critical,350,"Dr. Pradeep Vaidya","Ward 12 (Kothrud)"
"Construction contractor dumped truckload of cement malba and bricks.",18.4960,73.8045,construction_debris,high,1800,"Hemant Oak","Ward 12 (Kothrud)"
"Late night food stalls dumped plastic cups, grease cans, and thermocol plates.",18.5095,73.8160,commercial,medium,600,"Radhika Paranjape","Ward 12 (Kothrud)"`;
}
