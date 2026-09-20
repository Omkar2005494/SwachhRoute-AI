'use client';

import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { HotspotRecurrenceProfile } from '@/types';
import { formatCategoryLabel, formatHazardLabel } from '@/lib/formatters';
import {
  Flame,
  AlertTriangle,
  ChevronRight,
  Clock,
  Scale,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface ChronicRankingTableProps {
  profiles: HotspotRecurrenceProfile[];
  onSelectProfile: (profile: HotspotRecurrenceProfile) => void;
}

export function ChronicRankingTable({ profiles, onSelectProfile }: ChronicRankingTableProps) {
  // Sort by recurrence index descending
  const sorted = [...profiles].sort((a, b) => b.recurrenceIndex - a.recurrenceIndex);

  return (
    <Card glow="purple" className="space-y-4">
      <CardHeader
        title="Chronic Waste Hotspot Recurrence Ranking"
        subtitle="Ranked by multi-factor recurrence velocity (complaint frequency, mass, severity, and temporal span)"
        icon={Flame}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-command-border/60 text-[11px] font-mono text-slate-400 bg-command-surface/50">
              <th className="py-2.5 px-3">RANK</th>
              <th className="py-2.5 px-3">ZONE & CLUSTER ID</th>
              <th className="py-2.5 px-3">LIFECYCLE CLASSIFICATION</th>
              <th className="py-2.5 px-3">RECURRENCE INDEX</th>
              <th className="py-2.5 px-3">PRIMARY ROOT CAUSE</th>
              <th className="py-2.5 px-3">REPORTS / INTERVAL</th>
              <th className="py-2.5 px-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-command-border/40 font-mono">
            {sorted.map((p, idx) => {
              const isChronic = p.classification === 'chronic_dumping';
              const isEmerging = p.classification === 'emerging_hotspot';
              const isStabilized = p.classification === 'stabilized_cleared';

              return (
                <tr
                  key={p.hotspotId}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectProfile(p)}
                >
                  {/* Rank */}
                  <td className="py-3 px-3">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        idx === 0
                          ? 'bg-rose-950 text-rose-300 border border-rose-600/60'
                          : idx === 1
                          ? 'bg-amber-950 text-amber-300 border border-amber-600/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </td>

                  {/* Zone & Hotspot ID */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-100 font-sans text-xs flex items-center gap-1.5">
                      {p.zoneName}
                    </div>
                    <div className="text-[10px] text-cyan-400 font-mono">
                      {p.hotspotId}
                    </div>
                  </td>

                  {/* Lifecycle Classification */}
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        isChronic
                          ? 'rose'
                          : isEmerging
                          ? 'amber'
                          : isStabilized
                          ? 'emerald'
                          : 'slate'
                      }
                      pulse={isChronic}
                    >
                      {p.classification.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </td>

                  {/* Recurrence Index */}
                  <td className="py-3 px-3 min-w-[140px]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span
                        className={`font-bold ${
                          p.recurrenceIndex >= 60
                            ? 'text-rose-400'
                            : p.recurrenceIndex >= 40
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {p.recurrenceIndex} / 100
                      </span>
                      <span className="text-[10px] text-slate-500 capitalize">
                        {p.chronicRisk}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          p.recurrenceIndex >= 60
                            ? 'bg-rose-500'
                            : p.recurrenceIndex >= 40
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, p.recurrenceIndex)}%` }}
                      />
                    </div>
                  </td>

                  {/* Primary Root Cause */}
                  <td className="py-3 px-3">
                    <div className="text-xs text-slate-200 capitalize font-sans">
                      {formatCategoryLabel(p.primaryDriver)}
                    </div>
                    <div className="text-[10px] text-rose-400 font-mono">
                      {formatHazardLabel(p.hazardLevel)}
                    </div>
                  </td>

                  {/* Reports & Temporal Velocity */}
                  <td className="py-3 px-3">
                    <div className="text-xs text-slate-200">
                      {p.complaintCount} Complaints ({p.totalAccumulatedWasteKg.toLocaleString()} kg)
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ~{p.averageIntervalDays}d interval over {p.temporalSpanDays}d span
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProfile(p);
                      }}
                      className="px-2.5 py-1 rounded bg-command-surface hover:bg-slate-700 text-cyan-300 hover:text-white border border-command-border text-xs flex items-center gap-1 ml-auto transition-colors"
                    >
                      <span>Policy Directives</span>
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
