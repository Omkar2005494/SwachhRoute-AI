'use client';

import React, { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useReports } from '@/lib/reportsContext';
import {
  Sparkles,
  Terminal,
  ShieldAlert,
  Cpu,
  CheckCircle,
  Database,
  Flame,
  Gavel,
  RefreshCw,
  Building,
  Info,
} from 'lucide-react';
import {
  RecurrenceScoreCard,
  ChronicRankingTable,
  PolicyDirectivesPanel,
  HotspotRecurrenceModal,
} from '@/components/analytics';
import { HotspotRecurrenceProfile } from '@/types';
import { formatCategoryLabel } from '@/lib/formatters';

export default function InsightsPage() {
  const {
    wardAnalytics,
    recurrenceProfiles,
    activeDataset,
    activeDepot,
    reports,
    hotspots,
    fleet,
  } = useReports();

  const [selectedProfile, setSelectedProfile] = useState<HotspotRecurrenceProfile | null>(null);

  // Dynamic Ward Executive Synthesis
  const totalClusteredWasteTons = (
    hotspots.reduce((sum, h) => sum + (h.totalEstimatedWasteKg || 0), 0) / 1000
  ).toFixed(2);

  const chronicCount = wardAnalytics?.chronicHotspotsCount || 0;
  const topCause = wardAnalytics?.primaryRootCauses[0];
  const topZone = recurrenceProfiles.length > 0
    ? [...recurrenceProfiles].sort((a, b) => b.recurrenceIndex - a.recurrenceIndex)[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-command-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Municipal Recurrence & Policy Intelligence Console</span>
            </h2>
            <Badge variant="purple" className="font-mono">Phase 7</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chronic hotspot recurrence velocity, temporal pattern indexing, and statutory preventive directives under SWM Rules 2016.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="cyan" className="font-mono">
            <Building className="w-3 h-3 mr-1" />
            {activeDataset.name} ({reports.length} Reports)
          </Badge>
          <Badge variant="purple" className="font-mono">
            Ollama: Llama 3.2 3B NLU
          </Badge>
        </div>
      </div>

      {/* Ward Recurrence KPIs */}
      <RecurrenceScoreCard
        analytics={wardAnalytics}
        wardName={activeDataset.wardOrZone || activeDataset.name}
      />

      {/* Dynamic AI Executive Operational Briefing */}
      <Card glow="purple">
        <CardHeader
          title="Executive Operational & Strategic Briefing"
          subtitle={`Synthesized for ${activeDataset.name} (${activeDepot.name})`}
          icon={Terminal}
        />
        <div className="p-4 rounded-lg bg-command-surface/80 border border-command-border text-xs text-slate-300 space-y-3 font-sans leading-relaxed">
          <p>
            <strong>Sector Telemetry:</strong> In <strong>{activeDataset.name}</strong>, spatial DBSCAN clustering identified <strong>{hotspots.length} high-density waste clusters</strong> containing <strong>{totalClusteredWasteTons} metric tons</strong> of accumulated waste across {reports.length} citizen complaints. <strong>{chronicCount} cluster{chronicCount === 1 ? '' : 's'}</strong> qualify as <strong>Chronic Dumping Sites</strong> with a persistent repeat rate of {wardAnalytics ? Math.round((chronicCount / (hotspots.length || 1)) * 100) : 0}%.
          </p>
          <p>
            <strong>Primary Root Cause:</strong> The dominant recurrence driver is <strong>{topCause ? formatCategoryLabel(topCause.category) : 'Mixed Municipal Waste'}</strong> (accounting for {topCause?.percentage || 0}% of high-velocity clusters). {topZone ? `Zone ${topZone.zoneName} (${topZone.hotspotId}) exhibits the highest recurrence index of ${topZone.recurrenceIndex}/100 with ~${topZone.averageIntervalDays}d between repeat dumping incidents.` : ''}
          </p>
          <p>
            <strong>Statutory Directives:</strong> Deploy immediate dual-shift mechanical dumper placers and solar CCTV monitoring poles at top chronic sites. Transition collection from once-daily to split-schedule to eliminate vendor backlogs under Solid Waste Management Rules 2016.
          </p>
        </div>
      </Card>

      {/* Chronic Ranking Table */}
      <ChronicRankingTable
        profiles={recurrenceProfiles}
        onSelectProfile={(p) => setSelectedProfile(p)}
      />

      {/* Statutory Policy & Preventive Directives Panel */}
      <PolicyDirectivesPanel analytics={wardAnalytics} />

      {/* Architecture Separation of Concerns Card */}
      <Card glow="cyan">
        <CardHeader
          title="Strict Separation of Concerns Architecture"
          subtitle="Rule: Llama 3.2 3B handles Natural Language Understanding • Deterministic Algorithms handle Spatial & Math Operations"
          icon={Cpu}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* What Llama Handles */}
          <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <h4 className="font-bold text-emerald-300 uppercase font-mono flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Llama 3.2 3B Responsibilities (Permitted NLU)
            </h4>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              <li>Citizen complaint language parsing & multi-lingual Hinglish understanding</li>
              <li>Hazard extraction (biomedical, chemical, severe odor, drain blockage)</li>
              <li>Severity classification (low, medium, high, critical)</li>
              <li>Operational summary generation</li>
              <li>Executive briefing synthesis from verified metrics</li>
            </ul>
          </div>

          {/* What Deterministic Engines Handle */}
          <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-2">
            <h4 className="font-bold text-rose-300 uppercase font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Deterministic Algorithms (Strict Math & Safety)
            </h4>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              <li>EPSG:4326 to EPSG:3857 metric coordinate projection</li>
              <li>DBSCAN hotspot density clustering (Scikit-learn ε=180m, MinPts=3)</li>
              <li>Google OR-Tools CVRP capacity-constrained fleet route solving</li>
              <li>OSRM road network snapping & geometry generation</li>
              <li>Net weighbridge payload & weight variance calculation</li>
              <li>Multi-factor Recurrence Index calculation & statutory SWM 2016 mapping</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Individual Hotspot Recurrence Detail Modal */}
      <HotspotRecurrenceModal
        profile={selectedProfile}
        reports={reports}
        isOpen={Boolean(selectedProfile)}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  );
}
