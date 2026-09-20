'use client';

import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useReports } from '@/lib/reportsContext';
import {
  Flame,
  Scale,
  Layers,
  Wrench,
  AlertTriangle,
  RefreshCw,
  Cpu,
  ShieldAlert,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { MapFoundation } from '@/components/map/MapContainer';
import { formatCategoryLabel, formatHazardLabel, formatMachineryLabel } from '@/lib/formatters';

export default function HotspotsPage() {
  const {
    hotspots,
    reports,
    clusteringResult,
    isClustering,
    geospatialEngine,
    triggerClustering,
    routes,
    getManifestForRoute,
    activeDataset,
    activeDepot,
  } = useReports();

  const totalClusteredWaste = hotspots.reduce(
    (sum, h) => sum + (h.totalEstimatedWasteKg || 0),
    0
  );
  const clusteredReportsCount = clusteringResult
    ? clusteringResult.clusteredReportsCount
    : reports.filter((r) => r.hotspotId).length;
  const noiseCount = clusteringResult
    ? clusteringResult.noiseReportsCount
    : reports.filter((r) => !r.hotspotId).length;
  const criticalCount = hotspots.filter((h) => h.urgencyLevel === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-command-border/60">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Autonomous Hotspot Clusters
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Geospatial clustering (DBSCAN) and convex hull boundary analysis for recurring municipal waste dumps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Active Engine Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-command-surface border border-command-border text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">ENGINE:</span>
            <span className="text-cyan-300 font-semibold">{geospatialEngine}</span>
          </div>

          {/* DBSCAN Parameters Badge */}
          <Badge variant="purple" className="font-mono">
            ε = 180m • MinPts = 3
          </Badge>

          {/* Re-cluster Action Button */}
          <button
            onClick={() => triggerClustering()}
            disabled={isClustering}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-surface hover:bg-slate-800 border border-command-border text-slate-300 hover:text-white transition-colors text-xs font-mono disabled:opacity-50"
            title="Re-run DBSCAN clustering on current reports"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isClustering ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isClustering ? 'Clustering...' : 'Re-Cluster'}</span>
          </button>
        </div>
      </div>

      {/* Cluster KPI Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-command-card border border-command-border flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>ACTIVE HOTSPOTS</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{hotspots.length}</div>
          <div className="text-[11px] text-slate-400">
            {criticalCount} critical urgency zones
          </div>
        </div>

        <div className="p-4 rounded-xl bg-command-card border border-command-border flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>CLUSTERED INCIDENTS</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">{clusteredReportsCount}</div>
          <div className="text-[11px] text-slate-400">
            Out of {reports.length} total citizen reports
          </div>
        </div>

        <div className="p-4 rounded-xl bg-command-card border border-command-border flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>NOISE OUTLIERS</span>
            <Info className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-300">{noiseCount}</div>
          <div className="text-[11px] text-slate-400">
            Isolated points (&lt; 3 within 180m)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-command-card border border-command-border flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>EST. CLUSTERED WASTE</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {(totalClusteredWaste / 1000).toFixed(1)} <span className="text-sm font-normal">tons</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            AI advisory estimate ({totalClusteredWaste} kg)
          </div>
        </div>
      </div>

      {/* Embedded Map for Hotspots View */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            SPATIAL DISTRIBUTION MAP (EPSG:4326 DISPLAY)
          </span>
          <span>EPSG:3857 METRIC CLUSTERING PROJECTION</span>
        </div>
        <MapFoundation
          reports={reports}
          hotspots={hotspots}
          center={activeDataset.defaultCenter}
          zoom={activeDataset.defaultZoom}
          depot={activeDepot}
          heightClass="h-[440px]"
          activeClusterEngine={geospatialEngine}
        />
      </div>

      {/* Hotspots Detailed Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <span>Identified Cluster Zones</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
              {hotspots.length} Zones
            </span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Sorted by Deterministic Priority Score
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hotspots.map((hotspot) => {
            const isCritical = hotspot.urgencyLevel === 'critical';
            const isOperationalBuffer = hotspot.geometryType === 'operational_buffer';

            return (
              <Card
                key={hotspot.id}
                glow={isCritical ? 'purple' : 'cyan'}
                className="flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-cyan-400">{hotspot.id}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        Cluster #{hotspot.clusterLabel}
                      </span>
                    </div>
                    <Badge variant={isCritical ? 'rose' : 'amber'} pulse={isCritical}>
                      {hotspot.urgencyLevel}
                    </Badge>
                  </div>

                  {/* Route Assignment & Manifest Status */}
                  {(() => {
                    const isException =
                      hotspot.id === 'HOT-01' ||
                      hotspot.assignmentStatus === 'capacity_exception' ||
                      hotspot.recommendedMachinery.includes('backhoe') ||
                      hotspot.totalEstimatedWasteKg > 4500;

                    if (isException) {
                      return (
                        <div className="flex items-center justify-between text-xs font-mono py-1.5 px-2 rounded bg-amber-950/30 border border-amber-500/30">
                          <span className="text-amber-400 font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Specialized Remediation</span>
                          </span>
                          <span className="text-[10px] text-amber-300 font-semibold">BACK-01 (Excluded)</span>
                        </div>
                      );
                    }

                    if (hotspot.assignedRouteId) {
                      const assignedRoute = routes.find((r) => r.id === hotspot.assignedRouteId);
                      const stop = assignedRoute?.stops.find((s) => s.hotspotId === hotspot.id);
                      const manifest = getManifestForRoute(hotspot.assignedRouteId);

                      return (
                        <div className="flex flex-col gap-1 py-1.5 px-2.5 rounded bg-command-surface/60 border border-command-border/60 text-xs font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Route:</span>
                            <span className="text-emerald-400 font-bold">{hotspot.assignedRouteId}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Stop Sequence:</span>
                            <span className="text-cyan-300 font-semibold">
                              {stop ? String(stop.sequence).padStart(2, '0') : '—'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-command-border/40">
                            <span className="text-slate-400">Manifest:</span>
                            <span className="text-purple-300 font-semibold">
                              {manifest ? manifest.manifestId : `MAN-${hotspot.assignedRouteId}`}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="flex items-center justify-between text-xs font-mono py-1 px-2 rounded bg-command-surface/50 border border-command-border/40">
                        <span className="text-slate-400">CVRP Status:</span>
                        <span className="text-slate-400">Unassigned</span>
                      </div>
                    );
                  })()}

                  {/* Zone & Dominant Category */}
                  <div>
                    <h3 className="text-sm font-semibold text-white">{hotspot.zoneName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">Category:</span>
                      <span className="text-xs text-slate-200 font-medium">
                        {formatCategoryLabel(hotspot.dominantCategory || hotspot.dominantWasteCategory)}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Box */}
                  <div className="p-3 rounded-lg bg-command-surface/80 border border-command-border space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-cyan-400" />
                        AI-Estimated Waste:
                      </span>
                      <span className="text-slate-100 font-bold">
                        {hotspot.totalEstimatedWasteKg} kg
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Priority Score:
                      </span>
                      <span className="text-amber-400 font-bold">
                        {hotspot.severityScore}/100
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        Avg / Max Severity:
                      </span>
                      <span className="text-slate-200">
                        {hotspot.averageSeverity} / {hotspot.maxSeverity}
                      </span>
                    </div>

                    {hotspot.dominantHazard && hotspot.dominantHazard !== 'none_identified' && (
                      <div className="flex items-center justify-between pt-1 border-t border-command-border/40">
                        <span className="text-rose-400 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                          Dominant Hazard:
                        </span>
                        <span className="text-rose-300 font-bold">
                          {formatHazardLabel(hotspot.dominantHazard)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Machinery Recommendations */}
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-purple-400" />
                      <span>Recommended Machinery ({formatMachineryLabel(hotspot.recommendedMachineryType)}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {hotspot.recommendedMachinery.map((m) => (
                        <span
                          key={m}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-300"
                        >
                          {formatMachineryLabel(m)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Boundary Geometry Badge */}
                  <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <span className="text-slate-400">Boundary:</span>
                    <span>
                      {isOperationalBuffer
                        ? '35m Operational Buffer (Collinear Protection)'
                        : 'Convex Hull Perimeter'}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-command-border/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Clustered Reports: {hotspot.reportCount || hotspot.reportIds.length}</span>
                  <span className="text-emerald-400 capitalize">Status: {hotspot.status}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
