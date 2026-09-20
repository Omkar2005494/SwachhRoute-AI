'use client';

import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useReports } from '@/lib/reportsContext';
import { Route as RouteIcon, ArrowUpRight, Cpu, Truck, Navigation, Scale, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export function OptimizationStatusWidget() {
  const {
    routes,
    optimizationResult,
    isOptimizingRoutes,
    routeOptimizationEngine,
    triggerRouteOptimization,
    fleet,
  } = useReports();

  const totalDistanceKm = optimizationResult
    ? optimizationResult.totalDistanceKm
    : routes.reduce((sum, r) => sum + (r.totalDistanceKm || 0), 0);

  const totalServedDemandKg = optimizationResult
    ? optimizationResult.totalServedDemandKg
    : routes.reduce((sum, r) => sum + r.totalDemandKg, 0);

  const totalStopsCount = optimizationResult
    ? optimizationResult.stopsCount
    : routes.reduce((sum, r) => sum + r.stops.length, 0);

  const vehiclesUsedCount = optimizationResult
    ? optimizationResult.vehiclesUsedCount
    : routes.length;

  const totalDispatchable = fleet.filter(
    (v) => v.availableForDispatch && v.status !== 'maintenance'
  ).length;

  const isGoogleOrTools =
    optimizationResult?.optimizationEngine === 'google_ortools' ||
    routeOptimizationEngine.includes('OR-Tools');

  const hasRoadRouting = routes.some(
    (r) => r.routingEngine === 'osrm' && r.roadDistanceKm !== null
  );
  const totalRoadDistanceKm = Math.round(
    routes.reduce((sum, r) => sum + (r.roadDistanceKm || 0), 0) * 10
  ) / 10;
  const totalRoadDurationMins = routes.reduce(
    (sum, r) => sum + (r.roadDurationMinutes || 0),
    0
  );

  return (
    <Card glow="emerald" className="flex flex-col h-full justify-between">
      <div className="space-y-3">
        <CardHeader
          title="Fleet Route Optimization"
          subtitle="Google OR-Tools CVRP + OSRM Roads"
          icon={RouteIcon}
          action={
            <Link
              href="/routes"
              className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>View Routes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          }
        />

        {/* Engine and Status Badges */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate">{isGoogleOrTools ? 'OR-Tools' : 'Fallback'} + {hasRoadRouting ? 'OSRM' : 'Geometric'}</span>
          </div>
          <Badge variant={hasRoadRouting ? 'emerald' : 'amber'}>
            {hasRoadRouting ? 'Road-Snapped' : routes.length > 0 ? 'Optimized' : 'Pending'}
          </Badge>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-command-surface/70 border border-command-border">
            <span className="text-slate-400 text-[10px] uppercase">Vehicles Dispatched:</span>
            <p className="text-sm font-bold text-slate-100 mt-0.5 flex items-center gap-1">
              <Truck className="w-3 h-3 text-purple-400" />
              <span>{vehiclesUsedCount} / {totalDispatchable}</span>
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-command-surface/70 border border-command-border">
            <span className="text-slate-400 text-[10px] uppercase">Waypoints Served:</span>
            <p className="text-sm font-bold text-slate-100 mt-0.5 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-emerald-400" />
              <span>{totalStopsCount} Stops</span>
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-command-surface/70 border border-command-border">
            <span className="text-slate-400 text-[10px] uppercase">CVRP Load Served:</span>
            <p className="text-sm font-bold text-cyan-400 mt-0.5 flex items-center gap-1">
              <Scale className="w-3 h-3 text-cyan-400" />
              <span>{(totalServedDemandKg / 1000).toFixed(2)} T</span>
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-command-surface/70 border border-command-border">
            <span className="text-slate-400 text-[10px] uppercase">
              {hasRoadRouting ? 'Road Distance (Est. Time):' : 'Geometric Distance:'}
            </span>
            <p className="text-sm font-bold text-slate-100 mt-0.5">
              {hasRoadRouting ? `${totalRoadDistanceKm} km (~${totalRoadDurationMins}m)` : `${totalDistanceKm} km`}
            </p>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-command-border/40">
          <span>Depot: DEPOT-BLR-01</span>
          <span className={hasRoadRouting ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
            {hasRoadRouting ? 'OSRM Road Network' : 'Pairwise EPSG:3857 Metric'}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-command-border/60 flex items-center justify-between">
        <button
          onClick={() => triggerRouteOptimization()}
          disabled={isOptimizingRoutes}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 hover:text-emerald-100 text-xs font-mono transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isOptimizingRoutes ? 'animate-spin' : ''}`} />
          <span>{isOptimizingRoutes ? 'Solving CVRP...' : 'Re-Solve Fleet Routes'}</span>
        </button>
      </div>
    </Card>
  );
}
