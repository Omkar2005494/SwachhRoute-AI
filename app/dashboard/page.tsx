'use client';

import React from 'react';
import { KPICards } from '@/components/dashboard/KPICards';
import { PriorityHotspots } from '@/components/dashboard/PriorityHotspots';
import { RecentReports } from '@/components/dashboard/RecentReports';
import { FleetStatusWidget } from '@/components/dashboard/FleetStatusWidget';
import { AIInsightsWidget } from '@/components/dashboard/AIInsightsWidget';
import { OptimizationStatusWidget } from '@/components/dashboard/OptimizationStatusWidget';
import { DriverManifestWidget } from '@/components/dashboard/DriverManifestWidget';
import { OfficerStatusWidget } from '@/components/dashboard/OfficerStatusWidget';
import { MapFoundation } from '@/components/map/MapContainer';
import { useReports } from '@/lib/reportsContext';
import { Activity, Radio, MapPin, RefreshCw, Cpu } from 'lucide-react';

export default function DashboardPage() {
  const {
    reports,
    kpis,
    hotspots,
    geospatialEngine,
    triggerClustering,
    isClustering,
    fleet,
    routes,
  } = useReports();

  return (
    <div className="space-y-6">
      {/* Dashboard Section Title & Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-command-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Municipal Operations Command Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time urban waste monitoring, DBSCAN hotspot telemetry, and Google OR-Tools CVRP fleet routing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-surface border border-command-border">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>SECTOR: BENGALURU METROPOLITAN (SYNTHETIC)</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-surface border border-command-border text-cyan-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>{geospatialEngine}</span>
          </div>

          <button
            onClick={() => triggerClustering()}
            disabled={isClustering}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-surface hover:bg-slate-800 border border-command-border text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
            title="Re-run DBSCAN spatial clustering"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isClustering ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">{isClustering ? 'Clustering...' : 'Re-Cluster'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards (Reflects live operational dataset) */}
      <KPICards kpis={kpis} />

      {/* Main Command Center Map Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-300">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold">Geospatial Situation Map</span>
            <span className="text-slate-500 font-normal">| Live Layer Synthesis</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            EPSG:4326 Display • EPSG:3857 Clustering & CVRP Engine Ready
          </span>
        </div>

        <MapFoundation
          reports={reports}
          hotspots={hotspots}
          fleet={fleet}
          routes={routes}
          heightClass="h-[520px]"
          activeClusterEngine={geospatialEngine}
        />
      </div>

      {/* Supporting Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* 1. Fleet Route Optimization Widget (Google OR-Tools CVRP) */}
        <OptimizationStatusWidget />

        {/* 2. Driver Shift Manifests Widget (Phase 6B) */}
        <DriverManifestWidget />

        {/* 3. Officer Human-in-the-Loop Operations (Phase 6C) */}
        <OfficerStatusWidget />

        {/* 4. Priority Hotspots */}
        <PriorityHotspots hotspots={hotspots} />

        {/* 3. Fleet Telemetry */}
        <FleetStatusWidget fleet={fleet} />

        {/* 4. Recent Incident Feed */}
        <RecentReports reports={reports} />

        {/* 5. Local AI Insights */}
        <div className="md:col-span-2 xl:col-span-2">
          <AIInsightsWidget />
        </div>
      </div>
    </div>
  );
}
