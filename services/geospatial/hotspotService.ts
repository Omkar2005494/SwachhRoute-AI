/**
 * SwachhRoute AI — Geospatial Hotspot Intelligence Service
 * Orchestrates DBSCAN clustering and convex hull boundary determination.
 *
 * NOTE ON PROJECTION:
 * EPSG:3857 provides meter-based projected coordinates suitable for this local
 * Bengaluru demonstration's distance-based clustering.
 * Storage and map display remain in EPSG:4326.
 */

import { WasteReport, ClusteringResult } from '@/types';
import { runTypeScriptDBSCAN, latLngToEPSG3857, epsg3857ToLatLng } from './tsDBSCAN';

export { latLngToEPSG3857, epsg3857ToLatLng, runTypeScriptDBSCAN };

export interface ClusteringOptions {
  epsMeters?: number;
  minSamples?: number;
}

/**
 * Executes DBSCAN clustering on validated waste reports.
 * Calls the Next.js API route which delegates to Python / Scikit-learn,
 * with automatic fallback to the deterministic TypeScript DBSCAN engine.
 */
export async function clusterWasteReports(
  reports: WasteReport[],
  options: ClusteringOptions = { epsMeters: 180, minSamples: 3 }
): Promise<ClusteringResult> {
  const epsMeters = options.epsMeters ?? 180;
  const minSamples = options.minSamples ?? 3;

  if (reports.length === 0) {
    return {
      hotspots: [],
      clusteredReportsCount: 0,
      noiseReportsCount: 0,
      totalReportsCount: 0,
      clusterAssignments: {},
      engine: 'python_scikit_learn',
      executionTimeMs: 0,
      parameters: {
        epsilonMeters: epsMeters,
        minSamples,
      },
    };
  }

  try {
    const res = await fetch('/api/geospatial/cluster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reports,
        epsMeters,
        minSamples,
      }),
    });

    if (!res.ok) {
      throw new Error(`API responded with HTTP ${res.status}`);
    }

    const data: ClusteringResult = await res.json();
    return data;
  } catch (error) {
    console.warn(
      '[HotspotService] API cluster request failed, executing client-side deterministic fallback:',
      error
    );
    return runTypeScriptDBSCAN(reports, epsMeters, minSamples);
  }
}
