'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { WardRecurrenceAnalytics } from '@/types';
import { formatCategoryLabel } from '@/lib/formatters';
import {
  Flame,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Building,
  Target,
  FileSpreadsheet,
} from 'lucide-react';

interface RecurrenceScoreCardProps {
  analytics: WardRecurrenceAnalytics | null;
  wardName: string;
}

export function RecurrenceScoreCard({ analytics, wardName }: RecurrenceScoreCardProps) {
  if (!analytics) {
    return null;
  }

  const chronicPct =
    analytics.totalHotspotsAnalyzed > 0
      ? Math.round((analytics.chronicHotspotsCount / analytics.totalHotspotsAnalyzed) * 100)
      : 0;

  const topCause =
    analytics.primaryRootCauses.length > 0
      ? analytics.primaryRootCauses[0]
      : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Chronic Hotspots Count */}
      <div className="p-4 rounded-xl bg-command-surface/80 border border-command-border space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Chronic Dumping Zones
          </span>
          <Flame className="w-4 h-4 text-rose-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-rose-400">
            {analytics.chronicHotspotsCount}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            / {analytics.totalHotspotsAnalyzed} Hotspots
          </span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-rose-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${chronicPct}%` }}
          />
        </div>
        <div className="text-[10px] text-slate-400 font-mono flex justify-between">
          <span>{chronicPct}% Persistent Repeat Rate</span>
          <Badge variant={analytics.chronicHotspotsCount > 0 ? 'rose' : 'emerald'} pulse={analytics.chronicHotspotsCount > 0}>
            {analytics.chronicHotspotsCount > 0 ? 'High Risk' : 'Controlled'}
          </Badge>
        </div>
      </div>

      {/* 2. Ward Recurrence Index */}
      <div className="p-4 rounded-xl bg-command-surface/80 border border-command-border space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Ward Recurrence Index
          </span>
          <TrendingUp className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-amber-400">
            {analytics.averageWardRecurrenceScore}
          </span>
          <span className="text-xs text-slate-400 font-mono">/ 100</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              analytics.averageWardRecurrenceScore >= 60
                ? 'bg-rose-500'
                : analytics.averageWardRecurrenceScore >= 40
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, analytics.averageWardRecurrenceScore)}%` }}
          />
        </div>
        <div className="text-[10px] text-slate-400 font-mono flex justify-between">
          <span>Weighted Multi-Factor Formula</span>
          <Badge
            variant={
              analytics.averageWardRecurrenceScore >= 60
                ? 'rose'
                : analytics.averageWardRecurrenceScore >= 40
                ? 'amber'
                : 'emerald'
            }
          >
            {analytics.averageWardRecurrenceScore >= 60
              ? 'Severe'
              : analytics.averageWardRecurrenceScore >= 40
              ? 'Moderate'
              : 'Low Velocity'}
          </Badge>
        </div>
      </div>

      {/* 3. Primary Root Cause Driver */}
      <div className="p-4 rounded-xl bg-command-surface/80 border border-command-border space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Primary Root Cause
          </span>
          <Target className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <span className="text-lg font-bold text-white capitalize">
            {topCause ? formatCategoryLabel(topCause.category) : 'Mixed Municipal'}
          </span>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            {topCause ? `${topCause.percentage}% of chronic clusters (${topCause.dumpCount} sites)` : 'Distributed waste'}
          </p>
        </div>
        <div className="pt-1 text-[10px] text-cyan-300 font-mono border-t border-command-border/40">
          Statutory SWM 2016 Preventive Actions
        </div>
      </div>

      {/* 4. Stabilized / Verified Sites */}
      <div className="p-4 rounded-xl bg-command-surface/80 border border-command-border space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Stabilized & Cleared Sites
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {analytics.stabilizedCount}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            / {analytics.totalHotspotsAnalyzed} Hotspots
          </span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{
              width: `${
                analytics.totalHotspotsAnalyzed > 0
                  ? Math.round((analytics.stabilizedCount / analytics.totalHotspotsAnalyzed) * 100)
                  : 0
              }%`,
            }}
          />
        </div>
        <div className="text-[10px] text-slate-400 font-mono flex justify-between">
          <span>Weighbridge Verified</span>
          <Badge variant="emerald">
            {analytics.emergingHotspotsCount} Emerging Watch
          </Badge>
        </div>
      </div>
    </div>
  );
}
