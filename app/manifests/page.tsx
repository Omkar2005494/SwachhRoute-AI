'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useReports } from '@/lib/reportsContext';
import { formatCategoryLabel, formatHazardLabel, formatMachineryLabel, formatDateTime } from '@/lib/formatters';
import { MapFoundation } from '@/components/map/MapContainer';
import {
  ClipboardList,
  User,
  Truck,
  Calendar,
  Clock,
  Navigation,
  Scale,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Printer,
  Building,
  Wrench,
  Flame,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function ManifestsPage() {
  const {
    driverManifests,
    routes,
    hotspots,
    fleet,
    isGeneratingManifest,
    generateManifest,
    regenerateManifest,
  } = useReports();

  // If manifests exist, select first by default or allow switching
  const [selectedManifestId, setSelectedManifestId] = useState<string | null>(null);

  const activeManifest =
    driverManifests.find((m) => m.manifestId === selectedManifestId) ||
    driverManifests[0] ||
    null;

  const linkedRoute = activeManifest ? routes.find((r) => r.id === activeManifest.routeId) : null;

  // Active primary hauling route from OR-Tools
  const primaryRoute = routes.find((r) => r.stops && r.stops.length > 0) || routes[0];

  // Capacity Exception (HOT-01) for Specialized Remediation box
  const specializedRemediationHotspots = hotspots.filter(
    (h) => h.id === 'HOT-01' || h.recommendedMachinery.includes('backhoe') || h.totalEstimatedWasteKg > 4500
  );

  const handleGeneratePrimary = async () => {
    if (primaryRoute) {
      const result = await generateManifest(primaryRoute.id);
      if (result) {
        setSelectedManifestId(result.manifestId);
      }
    }
  };

  const handleRegenerate = async (manifestId: string) => {
    await regenerateManifest(manifestId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-command-border/60">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Driver Shift Manifests
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Phase 6B Operational Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard operating run sheets for field drivers, synthesized from Google OR-Tools CVRP routes and OSRM road networks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {routes.length > 0 && !activeManifest && (
            <button
              onClick={handleGeneratePrimary}
              disabled={isGeneratingManifest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 hover:text-emerald-100 font-mono text-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingManifest ? 'animate-spin' : ''}`} />
              <span>{isGeneratingManifest ? 'Generating Manifest...' : 'Generate Manifest'}</span>
            </button>
          )}

          {activeManifest && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-surface hover:bg-slate-800 border border-command-border text-slate-300 hover:text-white font-mono text-xs transition-colors"
              title="Print field run sheet"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print Run Sheet</span>
            </button>
          )}
        </div>
      </div>

      {/* Manifest Selection Tabs if multiple exist */}
      {driverManifests.length > 1 && (
        <div className="flex items-center gap-2 border-b border-command-border/40 pb-2">
          <span className="text-xs font-mono text-slate-400">MANIFESTS:</span>
          {driverManifests.map((m) => (
            <button
              key={m.manifestId}
              onClick={() => setSelectedManifestId(m.manifestId)}
              className={`px-3 py-1 rounded font-mono text-xs transition-colors ${
                (activeManifest?.manifestId === m.manifestId)
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-command-surface text-slate-400 hover:text-slate-200 border border-command-border'
              }`}
            >
              {m.manifestId} ({m.vehicleId})
              {m.isStale && <span className="ml-1 text-amber-400">• STALE</span>}
            </button>
          ))}
        </div>
      )}

      {/* Case 1: No manifest generated yet */}
      {!activeManifest && (
        <div className="p-8 rounded-xl bg-command-surface/60 border border-command-border text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Driver Manifest Generated</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Driver shift manifests are operational run sheets generated from valid, optimized fleet routes. The manifest synthesizes stop sequences, AI-estimated loads, vehicle capacities, and deterministic safety directives.
            </p>
          </div>

          {routes.length > 0 ? (
            <div className="pt-2">
              <button
                onClick={handleGeneratePrimary}
                disabled={isGeneratingManifest}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isGeneratingManifest ? 'animate-spin' : ''}`} />
                <span>{isGeneratingManifest ? 'Generating Manifest...' : `Generate Manifest for ${primaryRoute.id}`}</span>
              </button>
              <p className="text-[11px] font-mono text-slate-500 mt-2">
                Route: {primaryRoute.id} • Assigned: {primaryRoute.vehicleId} • {primaryRoute.stops.length} Stops
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <AlertTriangle className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              <span>Optimize fleet routes before generating driver manifests.</span>
            </div>
          )}
        </div>
      )}

      {/* Case 2: Active Manifest Display */}
      {activeManifest && (
        <div className="space-y-6">
          {/* Stale Manifest Protection Alert */}
          {activeManifest.isStale && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold font-mono uppercase tracking-wider text-amber-300">
                    STALE MANIFEST WARNING — ROUTE RE-OPTIMIZED
                  </p>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    The underlying route for <strong>{activeManifest.routeId}</strong> was re-optimized after this manifest was issued. To prevent dispatching an outdated stop sequence or mismatched payload, please regenerate this manifest.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleRegenerate(activeManifest.manifestId)}
                disabled={isGeneratingManifest}
                className="self-start sm:self-center shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs shadow-md transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingManifest ? 'animate-spin' : ''}`} />
                <span>Regenerate Manifest</span>
              </button>
            </div>
          )}

          {/* Manifest Header Document Block */}
          <Card glow="cyan" className="p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-command-border/60 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold block">
                  SWACHHROUTE AI • MUNICIPAL OPERATIONS
                </span>
                <h1 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <span>Driver Shift Manifest:</span>
                  <span className="font-mono text-cyan-300">{activeManifest.manifestId}</span>
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Linked Route: <strong className="text-slate-200">{activeManifest.routeId}</strong> • Generated:{' '}
                  <span suppressHydrationWarning>{formatDateTime(activeManifest.generatedAt)}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <Badge
                  variant={
                    activeManifest.isStale
                      ? 'amber'
                      : activeManifest.status === 'dispatched'
                      ? 'emerald'
                      : 'cyan'
                  }
                  pulse={!activeManifest.isStale && activeManifest.status !== 'dispatched'}
                >
                  STATUS:{' '}
                  {activeManifest.isStale
                    ? 'STALE'
                    : activeManifest.status === 'dispatched'
                    ? 'DISPATCHED BY OFFICER'
                    : activeManifest.status.toUpperCase()}
                </Badge>

                {linkedRoute?.operationalStatus && (
                  <Badge
                    variant={
                      linkedRoute.operationalStatus === 'dispatched'
                        ? 'emerald'
                        : linkedRoute.operationalStatus === 'on_hold'
                        ? 'rose'
                        : linkedRoute.operationalStatus === 'officer_reviewed'
                        ? 'amber'
                        : 'cyan'
                    }
                  >
                    ROUTE: {linkedRoute.operationalStatus.toUpperCase()}
                  </Badge>
                )}

                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                  Depot: {activeManifest.departureDepotId}
                </span>

                <Link
                  href="/officer"
                  className="px-2.5 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 hover:text-purple-100 text-[11px] flex items-center gap-1 transition-colors"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Officer Review</span>
                </Link>
              </div>
            </div>

            {/* Linked Route On Hold Warning Alert */}
            {linkedRoute?.operationalStatus === 'on_hold' && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>
                  <strong>ROUTE ON HOLD:</strong> &ldquo;{linkedRoute.heldReason || 'Suspended by Ward Officer'}&rdquo; — Dispatch is currently suspended.
                </span>
              </div>
            )}

            {/* Driver & Vehicle Profile Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 rounded-lg bg-command-dark/80 border border-command-border text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                  <User className="w-3 h-3 text-cyan-400" />
                  Assigned Driver:
                </span>
                <p className="text-sm font-bold text-white">{activeManifest.driverName}</p>
                <span className="text-[10px] text-cyan-400/90 font-mono block">
                  {activeManifest.driverPhone ? `${activeManifest.driverPhone} (Demo)` : 'Synthetic Demo Driver'}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                  <Truck className="w-3 h-3 text-purple-400" />
                  Vehicle Identifier:
                </span>
                <p className="text-sm font-bold text-purple-300">{activeManifest.vehicleId}</p>
                <span className="text-[10px] text-slate-400 block">{formatMachineryLabel(activeManifest.vehicleType)}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                  <Scale className="w-3 h-3 text-emerald-400" />
                  Vehicle Capacity:
                </span>
                <p className="text-sm font-bold text-emerald-400">{activeManifest.vehicleCapacityKg.toLocaleString()} kg</p>
                <span className="text-[10px] text-slate-400 block">
                  Headroom: {activeManifest.remainingCapacityKg.toLocaleString()} kg
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Estimated Window:
                </span>
                <p className="text-sm font-bold text-slate-200">
                  {activeManifest.estimatedDepartureTime} ⟷ {activeManifest.estimatedReturnTime}
                </p>
                <span className="text-[10px] text-slate-400 block">Single Shift Loop</span>
              </div>
            </div>

            {/* Route Telemetry Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-command-surface/70 border border-command-border space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Estimated Collection Load</span>
                <p className="text-lg font-bold text-emerald-400">
                  {activeManifest.estimatedLoadKg.toLocaleString()} kg
                </p>
                <span className="text-[10px] text-slate-500 block">
                  {(activeManifest.estimatedLoadKg / 1000).toFixed(2)} T AI Advisory Demand
                </span>
              </div>

              <div className="p-3 rounded-lg bg-command-surface/70 border border-command-border space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Capacity Utilization</span>
                <p className="text-lg font-bold text-cyan-300">
                  {activeManifest.capacityUtilizationPercent}%
                </p>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                    style={{ width: `${Math.min(activeManifest.capacityUtilizationPercent, 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-command-surface/70 border border-command-border space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Road Distance</span>
                <p className="text-lg font-bold text-white">
                  {activeManifest.roadDistanceKm !== null ? `${activeManifest.roadDistanceKm} km` : 'Road routing unavailable'}
                </p>
                <span className="text-[10px] text-slate-400 block">
                  Engine: {activeManifest.routingEngine === 'osrm' ? 'OSRM Road Network' : 'Geometric Fallback'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-command-surface/70 border border-command-border space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">OSRM Estimated Drive Time</span>
                <p className="text-lg font-bold text-cyan-400">
                  {activeManifest.roadDurationMinutes !== null ? `~${activeManifest.roadDurationMinutes} min` : '—'}
                </p>
                <span className="text-[10px] text-slate-500 block">
                  {activeManifest.totalStops} Collection Waypoints
                </span>
              </div>
            </div>

            {/* Operational Disclaimers Banner */}
            <div className="p-2.5 rounded bg-command-surface/50 border border-command-border/40 text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p>
                <strong>Operational Weight Note:</strong> All payload weights are AI-estimated / operational demands derived from citizen reporting. Actual collected weights are verified at the municipal weighbridge during final depot return.
              </p>
            </div>
          </Card>

          {/* Two-Column Layout: Directives & Sequence / Map */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Safety Directives & Required Machinery (1 col) */}
            <div className="space-y-6">
              {/* Safety Directives Summary Box */}
              <Card glow="rose" className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-command-border/60 pb-2">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold font-mono text-xs uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Safety Directives</span>
                  </div>
                  <Badge variant="rose">Deterministic</Badge>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Operational safety reminders deterministically aggregated from identified environmental hazards along this route:
                </p>

                <ul className="space-y-2 text-xs">
                  {activeManifest.safetyDirectives.map((directive, idx) => (
                    <li
                      key={idx}
                      className="p-2 rounded bg-rose-950/20 border border-rose-500/30 text-rose-200 flex items-start gap-2"
                    >
                      <span className="text-rose-400 font-bold font-mono text-xs shrink-0 mt-0.5">•</span>
                      <span className="leading-snug">{directive}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-[9px] text-slate-500 font-mono pt-1 border-t border-command-border/40">
                  Standard municipal operational safety reminders • Non-regulatory advisory
                </p>
              </Card>

              {/* Required Machinery Summary Box */}
              <Card glow="purple" className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-command-border/60 pb-2">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold font-mono text-xs uppercase tracking-wider">
                    <Wrench className="w-4 h-4" />
                    <span>Required Machinery</span>
                  </div>
                  <Badge variant="purple">Fleet Match</Badge>
                </div>

                <div className="space-y-2">
                  {activeManifest.machineryRequirements.map((machinery) => (
                    <div
                      key={machinery}
                      className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/30 flex items-center justify-between text-xs"
                    >
                      <span className="text-white font-medium">{formatMachineryLabel(machinery)}</span>
                      <span className="text-[10px] font-mono text-purple-300">
                        {machinery === activeManifest.vehicleType ? 'Assigned Asset' : 'Specialized Equipment'}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400">
                  Only canonical municipal machinery classes (<strong className="text-slate-300">Hydraulic Compactor, Mini Tipper, Backhoe</strong>) are deployed for active waste handling.
                </p>
              </Card>

              {/* Embedded Route Visualization Map */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Manifest Route Map</span>
                  </span>
                  <span>{activeManifest.routingEngine === 'osrm' ? 'OSRM Road-Snapped' : 'Geometric Fallback'}</span>
                </div>

                <MapFoundation
                  reports={[]}
                  hotspots={hotspots}
                  fleet={fleet}
                  routes={routes}
                  heightClass="h-[320px]"
                />
              </div>
            </div>

            {/* Right Column: Collection Sequence Timeline (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Authoritative Collection Sequence ({activeManifest.stops.length + 2} Nodes)</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  OR-Tools Stop Sequence Confirmed
                </span>
              </div>

              {/* Vertical Collection Sequence Timeline */}
              <div className="space-y-3">
                {/* 1. Origin Depot */}
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-900 border-2 border-blue-400 text-blue-200 flex items-center justify-center font-bold text-xs font-mono shadow-md">
                      00
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-blue-200">
                          {activeManifest.departureDepotId} (Departure)
                        </span>
                        <Badge variant="cyan">Origin</Badge>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{activeManifest.departureDepotName}</p>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        Departure Scheduled: {activeManifest.estimatedDepartureTime} • Initial Payload: 0 kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Collection Stops in exact OR-Tools order */}
                {activeManifest.stops.map((stop) => {
                  const isCritical = stop.urgencyLevel === 'critical';
                  const seqFormatted = String(stop.sequence).padStart(2, '0');

                  return (
                    <div
                      key={stop.hotspotId}
                      className="p-4 rounded-xl bg-command-card border border-command-border space-y-3 hover:border-cyan-500/40 transition-colors shadow-card"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-emerald-950 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center font-mono font-bold text-xs shadow-md">
                            {seqFormatted}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-white">
                                Stop {seqFormatted}: {stop.hotspotId}
                              </span>
                              <Badge variant={isCritical ? 'rose' : 'amber'}>
                                {stop.urgencyLevel.toUpperCase()} PRIORITY
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5 font-medium">{stop.zoneName}</p>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-xs text-slate-400 block">AI-Est. Demand</span>
                          <span className="text-sm font-bold text-emerald-400">{stop.estimatedDemandKg.toLocaleString()} kg</span>
                        </div>
                      </div>

                      {/* Payload & Headroom Bar */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-command-surface/70 border border-command-border text-xs font-mono">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Est. Demand:</span>
                          <span className="text-white font-bold">{stop.estimatedDemandKg.toLocaleString()} kg</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Cumulative Load:</span>
                          <span className="text-amber-300 font-bold">{stop.cumulativeLoadKg.toLocaleString()} kg</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Remaining Headroom:</span>
                          <span className="text-emerald-400 font-bold">{stop.remainingCapacityKg.toLocaleString()} kg</span>
                        </div>
                      </div>

                      {/* Hazard & Specific Directives */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex flex-wrap items-center gap-3 text-slate-300">
                          <div>
                            <span className="text-slate-400">Dominant Category: </span>
                            <span className="font-medium text-slate-200">{formatCategoryLabel(stop.dominantCategory)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Identified Hazard: </span>
                            <span className="font-bold text-rose-400 font-mono">
                              {formatHazardLabel(stop.dominantHazard)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Machinery: </span>
                            <span className="font-medium text-purple-300 font-mono">
                              {stop.requiredMachinery.map(formatMachineryLabel).join(', ')}
                            </span>
                          </div>
                        </div>

                        {/* Stop Safety Directive Box */}
                        <div className="p-2 rounded bg-command-dark/80 border border-command-border/80 flex items-start gap-2 text-slate-300">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div className="text-[11px] leading-relaxed">
                            <strong className="text-amber-300">Driver Safety Protocol: </strong>
                            {stop.safetyDirectives.join(' ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 3. Return Depot */}
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-900 border-2 border-blue-400 text-blue-200 flex items-center justify-center font-bold text-xs font-mono shadow-md">
                      {String(activeManifest.stops.length + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-blue-200">
                          {activeManifest.departureDepotId} (Return & Unload)
                        </span>
                        <Badge variant="cyan">Return</Badge>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{activeManifest.departureDepotName}</p>
                      <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                        Total Unload: {activeManifest.estimatedLoadKg.toLocaleString()} kg • Return Scheduled: {activeManifest.estimatedReturnTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Specialized Remediation Assignment Section (HOT-01 Preservation) */}
          {specializedRemediationHotspots.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-command-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-amber-300 font-mono uppercase tracking-wider">
                    Specialized Remediation Assignment (Excluded from Normal CVRP Manifest)
                  </h3>
                </div>
                <Badge variant="amber">Capacity Exception</Badge>
              </div>

              <p className="text-xs text-slate-400">
                The following active hotspots exceed standard hauling vehicle capacity (4,500 kg) or require specialized non-hauling remediation equipment (such as BACK-01 Backhoe). These sites are treated as specialized site clearance operations and are <strong>strictly excluded from standard hauling driver manifests</strong>.
              </p>

              <div className="grid grid-cols-1 gap-4">
                {specializedRemediationHotspots.map((exc) => (
                  <div
                    key={exc.id}
                    className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-amber-400">{exc.id}</span>
                        <span className="text-xs text-slate-200 font-medium">{exc.zoneName}</span>
                      </div>
                      <Badge variant="amber">Specialized Remediation Required</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono bg-command-dark/80 p-3 rounded-lg border border-amber-500/20">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Estimated Waste Demand:</span>
                        <span className="text-amber-300 font-bold text-sm">{exc.totalEstimatedWasteKg.toLocaleString()} kg</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Specialized Asset Assigned:</span>
                        <span className="text-cyan-300 font-bold text-sm flex items-center gap-1 mt-0.5">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>BACK-01 (Backhoe)</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Remediation Status:</span>
                        <span className="text-amber-400 font-bold text-sm">Specialized Remediation</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300">
                      <strong className="text-slate-200">Constraint Detail:</strong> Heavy debris requires mechanical excavation and secondary multi-lift hauling. Not eligible for single-vehicle standard compactor dispatch.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
