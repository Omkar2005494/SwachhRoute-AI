import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { runTypeScriptDBSCAN } from '@/services/geospatial/tsDBSCAN';
import { ClusteringResult, WasteReport } from '@/types';

export const dynamic = 'force-dynamic';

interface ClusterRequestBody {
  reports?: WasteReport[];
  epsMeters?: number;
  minSamples?: number;
}

function runPythonDBSCAN(
  reports: WasteReport[],
  epsMeters: number,
  minSamples: number
): Promise<ClusteringResult> {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(process.cwd(), 'python_services', 'dbscan_clustering.py');
    const pythonBin = process.env.PYTHON_BIN || 'python3';

    const child = spawn(pythonBin, [pythonScriptPath], {
      env: { ...process.env },
    });

    let stdoutData = '';
    let stderrData = '';

    const payload = JSON.stringify({
      reports,
      epsMeters,
      minSamples,
    });

    child.stdin.write(payload);
    child.stdin.end();

    child.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Python DBSCAN execution timed out after 8000ms'));
    }, 8000);

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        return reject(
          new Error(`Python process exited with code ${code}. stderr: ${stderrData.trim()}`)
        );
      }

      try {
        const parsed = JSON.parse(stdoutData.trim());
        if (parsed.error) {
          return reject(new Error(parsed.error));
        }
        resolve(parsed as ClusteringResult);
      } catch (err) {
        reject(new Error(`Failed to parse Python JSON output: ${(err as Error).message}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body: ClusterRequestBody = await req.json();
    const reports = Array.isArray(body.reports) ? body.reports : [];
    const epsMeters = typeof body.epsMeters === 'number' ? body.epsMeters : 180;
    const minSamples = typeof body.minSamples === 'number' ? body.minSamples : 3;

    if (reports.length === 0) {
      const emptyResult: ClusteringResult = {
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
      return NextResponse.json(emptyResult);
    }

    try {
      // Primary: Attempt Python / Scikit-learn DBSCAN execution
      const pythonResult = await runPythonDBSCAN(reports, epsMeters, minSamples);
      pythonResult.executionTimeMs = Date.now() - startTime;
      return NextResponse.json(pythonResult);
    } catch (pyErr) {
      console.warn(
        '[Geospatial API] Python DBSCAN failed or unavailable. Falling back to deterministic TypeScript engine:',
        (pyErr as Error).message
      );

      // Deterministic Fallback: TypeScript DBSCAN + Monotone Chain convex hull
      const fallbackResult = runTypeScriptDBSCAN(reports, epsMeters, minSamples);
      fallbackResult.executionTimeMs = Date.now() - startTime;
      return NextResponse.json(fallbackResult);
    }
  } catch (err) {
    console.error('[Geospatial API] Unexpected error in cluster route:', err);
    return NextResponse.json(
      { error: 'Internal Server Error during geospatial clustering' },
      { status: 500 }
    );
  }
}
