'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { HotspotRecurrenceProfile, WasteReport } from '@/types';
import { formatCategoryLabel, formatHazardLabel } from '@/lib/formatters';
import {
  X,
  Flame,
  Clock,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Gavel,
  FileText,
  Calendar,
  Layers,
  MapPin,
} from 'lucide-react';

interface HotspotRecurrenceModalProps {
  profile: HotspotRecurrenceProfile | null;
  reports: WasteReport[];
  isOpen: boolean;
  onClose: () => void;
}

export function HotspotRecurrenceModal({
  profile,
  reports,
  isOpen,
  onClose,
}: HotspotRecurrenceModalProps) {
  if (!isOpen || !profile) return null;

  const clusterReports = reports.filter(
    (r) =>
      r.hotspotId === profile.hotspotId ||
      (profile.timeline && profile.timeline.some((t) => t.date === r.timestamp?.slice(0, 10)))
  );

  const isChronic = profile.classification === 'chronic_dumping';
  const isEmerging = profile.classification === 'emerging_hotspot';

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-command-card border border-command-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-command-border bg-command-darkest">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isChronic
                  ? 'bg-rose-950/80 border border-rose-600/60 text-rose-400'
                  : 'bg-amber-950/80 border border-amber-600/60 text-amber-400'
              }`}
            >
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{profile.zoneName}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                  {profile.hotspotId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed Recurrence Velocity & Root-Cause Remediation Plan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={isChronic ? 'rose' : isEmerging ? 'amber' : 'emerald'}
              pulse={isChronic}
            >
              {profile.classification.replace(/_/g, ' ').toUpperCase()}
            </Badge>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Recurrence Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 rounded-lg bg-command-surface border border-command-border">
              <span className="text-[10px] text-slate-400 uppercase">Recurrence Index</span>
              <p className="text-xl font-bold text-rose-400 mt-0.5">
                {profile.recurrenceIndex} / 100
              </p>
              <span className="text-[10px] text-slate-500 capitalize">{profile.chronicRisk} Risk</span>
            </div>

            <div className="p-3 rounded-lg bg-command-surface border border-command-border">
              <span className="text-[10px] text-slate-400 uppercase">Total Complaints</span>
              <p className="text-xl font-bold text-white mt-0.5">{profile.complaintCount}</p>
              <span className="text-[10px] text-slate-500">
                {profile.totalAccumulatedWasteKg.toLocaleString()} kg est.
              </span>
            </div>

            <div className="p-3 rounded-lg bg-command-surface border border-command-border">
              <span className="text-[10px] text-slate-400 uppercase">Average Interval</span>
              <p className="text-xl font-bold text-cyan-400 mt-0.5">
                ~{profile.averageIntervalDays}d
              </p>
              <span className="text-[10px] text-slate-500">{profile.temporalSpanDays}d total span</span>
            </div>

            <div className="p-3 rounded-lg bg-command-surface border border-command-border">
              <span className="text-[10px] text-slate-400 uppercase">Primary Driver</span>
              <p className="text-sm font-bold text-amber-300 mt-1 capitalize truncate font-sans">
                {formatCategoryLabel(profile.primaryDriver)}
              </p>
              <span className="text-[10px] text-rose-400 truncate block">
                {formatHazardLabel(profile.hazardLevel)}
              </span>
            </div>
          </div>

          {/* Temporal Complaint Timeline */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Chronological Complaint Frequency Timeline</span>
            </h4>

            <div className="p-3.5 rounded-xl bg-command-surface/80 border border-command-border space-y-2">
              <div className="grid grid-cols-3 text-[10px] font-mono text-slate-400 pb-1 border-b border-command-border/40">
                <span>DATE</span>
                <span className="text-center">REPORTS LOGGED</span>
                <span className="text-right">ESTIMATED MASS (KG)</span>
              </div>
              <div className="space-y-1 font-mono text-xs max-h-32 overflow-y-auto divide-y divide-command-border/20">
                {profile.timeline.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1">
                    <span className="text-slate-300">{item.date}</span>
                    <span className="text-center text-cyan-400 font-bold">{item.count} citizen complaints</span>
                    <span className="text-right text-amber-400 font-bold">{item.wasteKg.toLocaleString()} kg</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Site-Specific Policy Directives */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <Gavel className="w-4 h-4 text-amber-400" />
              <span>Recommended Municipal Interventions ({profile.policyInterventions.length})</span>
            </h4>

            <div className="space-y-2.5">
              {profile.policyInterventions.map((directive) => (
                <div
                  key={directive.id}
                  className="p-3 rounded-xl bg-command-surface border border-command-border space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{directive.title}</span>
                    <Badge variant={directive.priority === 'immediate' ? 'rose' : 'amber'}>
                      {directive.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {directive.description}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-command-border/30 text-[10px] font-mono text-slate-400">
                    <span className="text-amber-300/90">{directive.statutoryBacking}</span>
                    {directive.estimatedCostInr && (
                      <span className="text-emerald-400 font-bold">
                        Est. ₹{directive.estimatedCostInr.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Underlying Citizen Reports */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Underlying Clustered Reports ({clusterReports.length})</span>
            </h4>

            <div className="space-y-1.5 max-h-44 overflow-y-auto">
              {clusterReports.map((r) => (
                <div
                  key={r.id}
                  className="p-2 rounded bg-command-surface border border-command-border/60 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400 text-[11px]">{r.id}</span>
                      <span className="text-slate-400 text-[10px] font-mono">
                        {r.timestamp ? r.timestamp.slice(0, 10) : ''}
                      </span>
                    </div>
                    <p className="text-slate-200 text-[11px] line-clamp-1">{r.description}</p>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <span className="text-amber-300 font-bold">{r.estimatedWasteKg} kg</span>
                    <span className="text-slate-400 block text-[10px]">
                      {formatCategoryLabel(r.category)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-command-border bg-command-darkest flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            Solid Waste Management Rules 2016 Compliant Policy Synthesis
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
