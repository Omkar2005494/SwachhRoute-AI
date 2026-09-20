'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useReports } from '@/lib/reportsContext';
import { clearRoadRoutingCache } from '@/services/routing';
import { formatMachineryLabel } from '@/lib/formatters';
import {
  Route as RouteIcon,
  Navigation,
  RefreshCw,
  Cpu,
  Truck,
  Scale,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Building,
  Info,
  Wrench,
  Compass,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';
import { MapFoundation } from '@/components/map/MapContainer';

export default function RoutesPage() {
  const {
    routes,
    optimizationResult,
    isOptimizingRoutes,
    isRoadRouting,
    routeOptimizationEngine,
    triggerRouteOptimization,
    recalculateRoadRoutes,
    fleet,
    hotspots,
    driverManifests,
    isGeneratingManifest,
    generateManifest,
    regenerateManifest,
    getManifestForRoute,
    activeDataset,
    activeDepot,
  } = useReports();

  const [isRecalculatingRoad, setIsRecalculatingRoad] = useState(false);

  // Geometric optimization metrics (from Google OR-Tools CVRP solver)
  const totalDistanceMeters = optimizationResult
    ? optimizationResult.totalDistanceMeters
    : routes.reduce((sum, r) => sum + (r.totalDistanceMeters || 0), 0);
  const totalDistanceKm = optimizationResult
    ? optimizationResult.totalDistanceKm
    : Math.round((totalDistanceMeters / 1000.0) * 10) / 10;
  const totalServedDemandKg = optimizationResult
    ? optimizationResult.totalServedDemandKg
    : routes.reduce((sum, r) => sum + r.totalDemandKg, 0);
  const totalStopsCount = optimizationResult
    ? optimizationResult.stopsCount
    : routes.reduce((sum, r) => sum + r.stops.length, 0);
  const vehiclesUsedCount = optimizationResult
    ? optimizationResult.vehiclesUsedCount
    : routes.length;
  const totalDispatchableVehicles = fleet.filter(
    (v) => v.availableForDispatch && v.status !== 'maintenance'
  ).length;

  // Road routing metrics (from OSRM OpenStreetMap road network)
  const hasRoadRouting = routes.some(
    (r) => r.routingEngine === 'osrm' && r.roadDistanceKm !== null && (r.roadGeometry?.length || 0) > 0
  );
  const totalRoadDistanceKm = Math.round(
    routes.reduce((sum, r) => sum + (r.roadDistanceKm || 0), 0) * 10
  ) / 10;
  const totalRoadDistanceMeters = routes.reduce(
    (sum, r) => sum + (r.roadDistanceMeters || 0),
    0
  );
  const totalRoadDurationMins = routes.reduce(
    (sum, r) => sum + (r.roadDurationMinutes || 0),
    0
  );

  const networkDiffKm =
    hasRoadRouting && totalDistanceKm > 0
      ? Math.round((totalRoadDistanceKm - totalDistanceKm) * 10) / 10
      : null;
  const networkDiffPct =
    hasRoadRouting && totalDistanceKm > 0
      ? Math.round(((totalRoadDistanceKm / totalDistanceKm) - 1) * 100)
      : null;

  const capacityExceptions = optimizationResult
    ? optimizationResult.capacityExceptions
    : [
        {
          hotspotId: 'HOT-01',
          zoneName: 'Indiranagar Urban Sector (Ward 82)',
          demandedKg: 5000,
          maxVehicleCapacityKg: 4500,
          recommendedMachinery: ['backhoe'] as any,
          reason:
            'Demand (5,000 kg) exceeds standard 4,500 kg hauling compactor capacity. Site requires BACK-01 Backhoe specialized remediation equipment for heavy debris.',
          remediationAction:
            'Dispatch specialized heavy remediation machinery (BACK-01 Backhoe) and secondary multi-lift hauler.',
        },
      ];

  const totalExceptionDemandKg = capacityExceptions.reduce((sum, e) => sum + e.demandedKg, 0);

  const isGoogleOrTools =
    optimizationResult?.optimizationEngine === 'google_ortools' ||
    routeOptimizationEngine.includes('OR-Tools');

  const handleRecalculateRoad = async () => {
    setIsRecalculatingRoad(true);
    try {
      clearRoadRoutingCache();
      await recalculateRoadRoutes();
    } finally {
      setIsRecalculatingRoad(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header & Solver Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-command-border/60">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <RouteIcon className="w-5 h-5 text-emerald-400" />
            Capacitated Vehicle Fleet Routing (Google OR-Tools CVRP + OSRM)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative OR-Tools mathematical optimization paired with OSRM OpenStreetMap road-network geometry and travel durations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Badge
            variant={isGoogleOrTools ? 'emerald' : 'amber'}
            className="flex items-center gap-1.5 py-1 px-2.5"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{routeOptimizationEngine}</span>
          </Badge>

          <Badge
            variant={hasRoadRouting ? 'cyan' : 'slate'}
            className="flex items-center gap-1.5 py-1 px-2.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>
              {isRoadRouting || isRecalculatingRoad
                ? 'Routing via OSRM...'
                : hasRoadRouting
                ? 'OSRM Road Network'
                : 'OSRM Offline'}
            </span>
          </Badge>

          <button
            onClick={() => triggerRouteOptimization()}
            disabled={isOptimizingRoutes || isRoadRouting || isRecalculatingRoad}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 hover:text-emerald-100 transition-colors disabled:opacity-50"
            title="Re-execute Google OR-Tools CVRP solver"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isOptimizingRoutes ? 'animate-spin' : ''}`} />
            <span>{isOptimizingRoutes ? 'Solving CVRP...' : 'Re-Optimize CVRP'}</span>
          </button>

          <button
            onClick={handleRecalculateRoad}
            disabled={isOptimizingRoutes || isRoadRouting || isRecalculatingRoad}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-cyan-100 transition-colors disabled:opacity-50"
            title="Clear route cache and recalculate OSRM road geometry and duration"
          >
            <Navigation className={`w-3.5 h-3.5 ${isRoadRouting || isRecalculatingRoad ? 'animate-spin' : ''}`} />
            <span>{isRoadRouting || isRecalculatingRoad ? 'Calculating Roads...' : 'Recalculate Road Route'}</span>
          </button>
        </div>
      </div>

      {/* Primary Telemetry Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-command-surface/70 border border-command-border space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">CVRP-Served Demand</span>
          <p className="text-xl font-bold text-emerald-400 font-mono">
            {(totalServedDemandKg / 1000).toFixed(2)} T
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            {totalServedDemandKg.toLocaleString()} kg assigned to hauling fleet
          </p>
        </div>

        <div className="p-4 rounded-xl bg-command-surface/70 border border-command-border space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Specialized Remediation</span>
          <p className="text-xl font-bold text-amber-400 font-mono">
            {(totalExceptionDemandKg / 1000).toFixed(2)} T
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            {totalExceptionDemandKg.toLocaleString()} kg (BACK-01 site remediation)
          </p>
        </div>

        <div className="p-4 rounded-xl bg-command-surface/70 border border-command-border space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">
            {hasRoadRouting ? 'OSRM Road Distance' : 'Geometric Distance'}
          </span>
          <p className="text-xl font-bold text-white font-mono">
            {hasRoadRouting ? `${totalRoadDistanceKm} km` : `${totalDistanceKm} km`}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            {hasRoadRouting ? (
              <span className="text-emerald-400 font-semibold">
                +{networkDiffKm} km (+{networkDiffPct}%) vs {totalDistanceKm} km geom
              </span>
            ) : (
              `${totalDistanceMeters.toLocaleString()} m pairwise EPSG:3857 metric`
            )}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-command-surface/70 border border-command-border space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">
            {hasRoadRouting ? 'OSRM Est. Drive Time' : 'Vehicles & Stops'}
          </span>
          {hasRoadRouting ? (
            <>
              <p className="text-xl font-bold text-cyan-400 font-mono">
                ~{totalRoadDurationMins} mins
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {vehiclesUsedCount} veh • {totalStopsCount} stops • OpenStreetMap model
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-bold text-cyan-400 font-mono">
                {vehiclesUsedCount} / {totalDispatchableVehicles} <span className="text-xs text-slate-400 font-normal">Vehicles</span>
              </p>
              <p className="text-[10px] text-slate-500 font-mono">{totalStopsCount} collection waypoints served</p>
            </>
          )}
        </div>
      </div>

      {/* Geospatial Distance Semantics Banner */}
      {hasRoadRouting ? (
        <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 flex items-start gap-3 text-xs text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-emerald-300 font-mono">
                OSRM Road-Network Routing Active
              </span>
              <Badge variant="emerald">OpenStreetMap Driven</Badge>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Stop sequence and vehicle allocations are computed deterministically via <strong>Google OR-Tools CVRP</strong>. Route geometry, road-network distances, and travel durations are calculated via <strong>OSRM</strong> on OpenStreetMap road networks. The <strong>+{networkDiffKm} km (+{networkDiffPct}%)</strong> road-network distance difference reflects real road curvature over straight-line projected Euclidean distance (EPSG:3857). Drive time is an advisory routing estimate.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-lg bg-command-surface/80 border border-command-border flex items-start gap-3 text-xs text-slate-300">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 font-mono">
                Geometric Optimization Preview — Road Routing Fallback
              </span>
              <Badge variant="amber">EPSG:3857 Euclidean</Badge>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              OSRM road routing service is uninitialized or offline. Distances shown are deterministic Euclidean distances projected in <strong>EPSG:3857 Web Mercator meters</strong>. Google OR-Tools stop sequences and capacity constraints remain fully authoritative.
            </p>
          </div>
        </div>
      )}

      {/* Embedded Map for Routes with Depot Origin/Return */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Map Preview • Depot Loop: {activeDepot.name} ⟷ Collection Stops</span>
          </span>
          <span className="text-slate-500">Origin: {activeDepot.id} (EPSG:4326)</span>
        </div>

        <MapFoundation
          reports={[]}
          hotspots={hotspots}
          fleet={fleet}
          routes={routes}
          center={activeDataset.defaultCenter}
          zoom={activeDataset.defaultZoom}
          depot={activeDepot}
          heightClass="h-[420px]"
        />
      </div>

      {/* Route Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-400" />
          <span>Active Optimized Route Manifests ({routes.length})</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routes.map((route) => {
            const vehicle = fleet.find((v) => v.id === route.vehicleId);
            const utilizationPct = Math.round((route.totalDemandKg / route.vehicleCapacityKg) * 100);
            const isRouteRoadAware = route.routingEngine === 'osrm' && route.roadDistanceKm !== null;
            const routeNetworkDiffKm = isRouteRoadAware
              ? Math.round((route.roadDistanceKm! - route.totalDistanceKm) * 10) / 10
              : null;
            const routeNetworkDiffPct = isRouteRoadAware && route.totalDistanceKm > 0
              ? Math.round(((route.roadDistanceKm! / route.totalDistanceKm) - 1) * 100)
              : null;

            return (
              <Card key={route.id} glow="emerald" className="flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Route Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-emerald-400">{route.id}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        Vehicle: {route.effectiveVehicleId || route.vehicleId}
                      </span>
                      {route.effectiveVehicleId && (
                        <Badge variant="amber">
                          REASSIGNED
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isRouteRoadAware ? 'emerald' : 'amber'}>
                        {isRouteRoadAware ? 'OSRM Road Network' : 'Geometric Fallback'}
                      </Badge>
                      <Badge
                        variant={
                          route.operationalStatus === 'completed'
                            ? 'emerald'
                            : route.operationalStatus === 'awaiting_weighbridge'
                            ? 'purple'
                            : route.operationalStatus === 'dispatched'
                            ? 'emerald'
                            : route.operationalStatus === 'on_hold'
                            ? 'rose'
                            : route.operationalStatus === 'officer_reviewed'
                            ? 'amber'
                            : 'cyan'
                        }
                      >
                        {(route.operationalStatus || 'OPTIMIZED').replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Route On Hold Banner */}
                  {route.operationalStatus === 'on_hold' && (
                    <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span>On Hold: &ldquo;{route.heldReason || 'Suspended by officer'}&rdquo;</span>
                    </div>
                  )}

                  {/* Vehicle Spec & Driver */}
                  <div className="flex items-center justify-between text-xs text-slate-300 border-b border-command-border/40 pb-2">
                    <div>
                      <span className="text-slate-400">Assigned Asset:</span>{' '}
                      <strong className="text-white">{formatMachineryLabel(route.vehicleType)}</strong>
                    </div>
                    {vehicle && (
                      <div className="text-[11px] font-mono text-slate-400">
                        Driver: <span className="text-slate-200">{vehicle.driverName}</span>
                      </div>
                    )}
                  </div>

                  {/* Capacity & Load Bar */}
                  <div className="p-3.5 rounded-lg bg-command-surface/70 border border-command-border space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-cyan-400" />
                        Vehicle Capacity Utilization:
                      </span>
                      <span className="text-slate-200 font-bold">
                        {route.totalDemandKg.toLocaleString()} / {route.vehicleCapacityKg.toLocaleString()} kg ({utilizationPct}%)
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                        style={{ width: `${Math.min(utilizationPct, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-0.5">
                      <span>Remaining Headroom: <strong className="text-emerald-400">{route.remainingCapacityKg.toLocaleString()} kg</strong></span>
                      <span>Stops Served: <strong className="text-white">{route.stops.length} locations</strong></span>
                    </div>
                  </div>

                  {/* Distance & Duration Comparison Panel */}
                  {isRouteRoadAware ? (
                    <div className="p-3 rounded-lg bg-command-dark/80 border border-emerald-500/30 grid grid-cols-3 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase">OSRM Road Distance</span>
                        <p className="text-sm font-bold text-emerald-400 mt-0.5">
                          {route.roadDistanceKm} km
                        </p>
                        <span className="text-[10px] text-slate-500">
                          {route.roadDistanceMeters?.toLocaleString()} m
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] uppercase">Est. Drive Time</span>
                        <p className="text-sm font-bold text-cyan-300 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>~{route.roadDurationMinutes}m</span>
                        </p>
                        <span className="text-[10px] text-slate-500">OSRM Travel Model</span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] uppercase">Network Difference</span>
                        <p className="text-sm font-bold text-amber-300 mt-0.5">
                          +{routeNetworkDiffKm} km
                        </p>
                        <span className="text-[10px] text-slate-500">
                          +{routeNetworkDiffPct}% vs {route.totalDistanceKm}km
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-command-dark/80 border border-command-border flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase">Geometric Distance (EPSG:3857):</span>
                        <p className="text-sm font-bold text-white mt-0.5">{route.totalDistanceKm} km ({route.totalDistanceMeters.toLocaleString()} m)</p>
                      </div>
                      <Badge variant="amber">OSRM Fallback</Badge>
                    </div>
                  )}

                  {/* Waypoint Sequence (Depot -> Stops -> Depot) */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
                      <span>Waypoint Sequence ({route.stops.length + 2} nodes)</span>
                      <span className="text-[10px] text-slate-500 font-normal">Depot Loop Confirmed</span>
                    </h4>

                    {/* Origin: Depot */}
                    <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/30 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-blue-900 border border-blue-400 text-blue-300 flex items-center justify-center font-bold text-[10px]">
                          0
                        </div>
                        <div>
                          <p className="font-semibold text-blue-200">DEPOT-BLR-01 (Departure)</p>
                          <p className="text-[10px] text-slate-400">Corporation Square Operations Hub</p>
                        </div>
                      </div>
                      <Badge variant="cyan">Origin</Badge>
                    </div>

                    {/* Collection Stops */}
                    {route.stops.map((stop) => (
                      <div
                        key={stop.stopId}
                        className="p-2.5 rounded-lg bg-command-dark/80 border border-command-border flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px]">
                            {stop.sequence}
                          </div>
                          <div>
                            <p className="font-medium text-slate-200 flex items-center gap-1.5">
                              <span>{stop.addressName}</span>
                              <span className="text-[10px] text-cyan-400 font-mono">({stop.hotspotId})</span>
                            </p>
                            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 mt-0.5">
                              <span>AI-Est. Demand: <strong className="text-slate-200">{stop.estimatedDemandKg.toLocaleString()} kg</strong></span>
                              <span>Cumulative Load: <strong className="text-cyan-300">{stop.cumulativeLoadKg.toLocaleString()} kg</strong></span>
                              <span>Remaining: <strong className="text-emerald-400">{stop.remainingVehicleCapacityKg.toLocaleString()} kg</strong></span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="slate">{stop.status}</Badge>
                      </div>
                    ))}

                    {/* Return: Depot */}
                    <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/30 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-blue-900 border border-blue-400 text-blue-300 flex items-center justify-center font-bold text-[10px]">
                          {route.stops.length + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-blue-200">DEPOT-BLR-01 (Return & Unload)</p>
                          <p className="text-[10px] text-slate-400">Total Unload: {route.totalDemandKg.toLocaleString()} kg</p>
                        </div>
                      </div>
                      <Badge variant="cyan">Return</Badge>
                    </div>
                  </div>

                  {/* Driver Shift Manifest Integration (Phase 6B) */}
                  {(() => {
                    const manifest = getManifestForRoute(route.id);
                    return (
                      <div className="p-3 rounded-lg bg-command-dark/80 border border-command-border flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <ClipboardList className="w-4 h-4 text-cyan-400" />
                          <div>
                            <span className="text-xs font-bold text-white font-mono block">
                              Driver Shift Manifest
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {manifest ? (
                                manifest.isStale ? (
                                  <span className="text-amber-400 font-semibold">• STALE (Route re-optimized)</span>
                                ) : (
                                  <span className="text-emerald-400 font-semibold">• {manifest.manifestId} (READY)</span>
                                )
                              ) : (
                                '• Not yet generated'
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {manifest ? (
                            <>
                              {manifest.isStale && (
                                <button
                                  onClick={() => regenerateManifest(manifest.manifestId)}
                                  disabled={isGeneratingManifest}
                                  className="px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 font-mono text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                                >
                                  <RefreshCw className={`w-3 h-3 ${isGeneratingManifest ? 'animate-spin' : ''}`} />
                                  <span>Regenerate</span>
                                </button>
                              )}
                              <Link
                                href="/manifests"
                                className="px-3 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-cyan-100 font-mono text-xs transition-colors flex items-center gap-1"
                              >
                                <span>View Manifest</span>
                              </Link>
                            </>
                          ) : (
                            <button
                              onClick={() => generateManifest(route.id)}
                              disabled={isGeneratingManifest}
                              className="px-3 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 hover:text-emerald-100 font-mono text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3 h-3 ${isGeneratingManifest ? 'animate-spin' : ''}`} />
                              <span>{isGeneratingManifest ? 'Generating...' : 'Generate Manifest'}</span>
                            </button>
                          )}

                          <Link
                            href="/officer"
                            className="px-3 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 hover:text-purple-100 font-mono text-xs transition-colors flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Officer Review</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-4 pt-3 border-t border-command-border/60 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>CVRP Engine: {route.optimizationAlgorithm}</span>
                  <span className="text-emerald-400 font-bold">
                    {isRouteRoadAware ? 'OSRM Road-Snapped' : route.solverStatus}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Infeasible Demand & Capacity Exceptions Section */}
      {capacityExceptions.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-command-border/60">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-300 font-mono uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Specialized Remediation & Capacity Exceptions ({capacityExceptions.length})</span>
            </h3>
            <span className="text-xs font-mono text-amber-400/90">
              Excluded from Standard Hauling CVRP Fleet
            </span>
          </div>

          <p className="text-xs text-slate-400">
            The following active hotspots exceed standard hauling compactor capacity (4,500 kg) or require non-hauling heavy equipment (such as BACK-01 Backhoe). In accordance with municipal protocol, these sites are flagged for specialized remediation rather than being assigned to standard CVRP vehicles.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {capacityExceptions.map((exc) => (
              <div
                key={exc.hotspotId}
                className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-amber-400">{exc.hotspotId}</span>
                    <span className="text-xs text-slate-300 font-medium">{exc.zoneName}</span>
                  </div>
                  <Badge variant="amber">Capacity Exception</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono bg-command-dark/60 p-3 rounded-lg border border-amber-500/20">
                  <div>
                    <span className="text-slate-400">Estimated Waste Demand:</span>
                    <p className="text-amber-300 font-bold mt-0.5">{exc.demandedKg.toLocaleString()} kg</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Standard Compactor Limit:</span>
                    <p className="text-slate-200 font-bold mt-0.5">{exc.maxVehicleCapacityKg.toLocaleString()} kg</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Specialized Asset Req:</span>
                    <p className="text-cyan-300 font-bold mt-0.5 flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      <span>{exc.recommendedMachinery.map(formatMachineryLabel).join(', ')}</span>
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong className="text-slate-200">Constraint Detail:</strong> {exc.reason}</p>
                  <p className="text-amber-300/90 font-mono text-[11px]"><strong className="text-slate-200">Action:</strong> {exc.remediationAction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
