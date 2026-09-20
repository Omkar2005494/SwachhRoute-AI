import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { OptimizationResult } from '@/types';
import { solveCVRPFallback } from '@/services/optimization/tsCVRPFallback';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const { depot, hotspots, vehicles, maxTimeSeconds = 5 } = body;

  if (!depot || !depot.coordinates || !Array.isArray(depot.coordinates)) {
    return NextResponse.json({ error: 'Missing or invalid depot coordinates' }, { status: 400 });
  }

  if (!hotspots || !Array.isArray(hotspots)) {
    return NextResponse.json({ error: 'Missing or invalid hotspots array' }, { status: 400 });
  }

  if (!vehicles || !Array.isArray(vehicles)) {
    return NextResponse.json({ error: 'Missing or invalid vehicles array' }, { status: 400 });
  }

  // Format payload for Python OR-Tools microservice
  const pythonPayload = {
    depot: {
      id: depot.id || 'DEPOT-BLR-01',
      name: depot.name || 'Simulated Demonstration Depot',
      lat: depot.coordinates[0],
      lng: depot.coordinates[1],
    },
    hotspots: hotspots.map((h: any) => ({
      id: h.id,
      zoneName: h.zoneName,
      lat: h.centerCoordinates ? h.centerCoordinates[0] : h.latitude,
      lng: h.centerCoordinates ? h.centerCoordinates[1] : h.longitude,
      demandKg: h.totalEstimatedWasteKg ?? h.estimatedWasteKg ?? null,
      recommendedMachinery: h.recommendedMachinery || (h.recommendedMachineryType ? [h.recommendedMachineryType] : []),
    })),
    vehicles: vehicles.map((v: any) => ({
      id: v.id,
      registrationNumber: v.registrationNumber,
      vehicleType: v.vehicleType,
      capacityKg: v.capacityKg,
      status: v.status,
      availableForDispatch: v.availableForDispatch ?? true,
      driverName: v.driverName,
      fuelType: v.fuelType,
      depotId: v.depotId,
    })),
    maxTimeSeconds: Math.max(1, Math.min(Number(maxTimeSeconds) || 5, 10)),
  };

  const scriptPath = path.join(process.cwd(), 'python_services', 'cvrp_optimizer.py');

  try {
    const pythonResult = await new Promise<OptimizationResult>((resolve, reject) => {
      const proc = spawn('python3', [scriptPath], {
        cwd: process.cwd(),
        timeout: (pythonPayload.maxTimeSeconds + 5) * 1000,
      });

      let stdoutData = '';
      let stderrData = '';

      proc.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString();
      });

      proc.stderr.on('data', (chunk) => {
        stderrData += chunk.toString();
      });

      proc.on('error', (err) => {
        reject(new Error(`Failed to execute Python process: ${err.message}`));
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${stderrData}`));
          return;
        }

        try {
          const parsed = JSON.parse(stdoutData.trim());
          if (parsed.error) {
            reject(new Error(`Python solver error: ${parsed.error}`));
            return;
          }
          resolve(parsed as OptimizationResult);
        } catch (e) {
          reject(new Error(`Failed to parse Python JSON output: ${(e as Error).message}`));
        }
      });

      // Write payload to stdin
      proc.stdin.write(JSON.stringify(pythonPayload));
      proc.stdin.end();
    });

    // FLEET OVERLOAD PROTECTION: Validate that no route exceeds vehicle capacity
    for (const route of pythonResult.routes) {
      if (route.totalDemandKg > route.vehicleCapacityKg) {
        throw new Error(
          `Safety Violation: Route ${route.id} for vehicle ${route.vehicleId} exceeds capacity (${route.totalDemandKg} > ${route.vehicleCapacityKg} kg)`
        );
      }
    }

    return NextResponse.json(pythonResult);
  } catch (err) {
    console.warn('[Optimization API] Python OR-Tools solver unavailable or errored:', (err as Error).message);
    console.info('[Optimization API] Engaging deterministic in-process fallback engine...');

    // Fallback solver execution
    const fallbackResult = solveCVRPFallback(depot, hotspots, vehicles);
    return NextResponse.json(fallbackResult, {
      headers: {
        'X-Optimization-Engine': 'deterministic_fallback',
        'X-Fallback-Notice': 'Optimization Engine Offline - displaying fallback preview',
      },
    });
  }
}
