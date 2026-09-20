'use client';

import React, { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PolicyRecommendation, WardRecurrenceAnalytics } from '@/types';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Building,
  ShieldCheck,
  Clock,
  ExternalLink,
  DollarSign,
  Gavel,
} from 'lucide-react';

interface PolicyDirectivesPanelProps {
  analytics: WardRecurrenceAnalytics | null;
}

export function PolicyDirectivesPanel({ analytics }: PolicyDirectivesPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!analytics || analytics.actionableDirectives.length === 0) {
    return null;
  }

  const exportPolicyDirectivesJSON = () => {
    const dataStr = JSON.stringify(
      {
        municipalWard: analytics.wardName,
        exportTimestamp: new Date().toISOString(),
        summary: {
          totalHotspotsAnalyzed: analytics.totalHotspotsAnalyzed,
          chronicHotspotsCount: analytics.chronicHotspotsCount,
          averageWardRecurrenceScore: analytics.averageWardRecurrenceScore,
        },
        directives: analytics.actionableDirectives,
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swachhroute-policy-directives-${analytics.wardName.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPolicyDirectivesCSV = () => {
    const headers = [
      'ID',
      'Type',
      'Priority',
      'Title',
      'Description',
      'Statutory Backing',
      'Estimated Cost (INR)',
      'Target Stakeholders',
    ];
    const rows = analytics.actionableDirectives.map((d) => [
      d.id,
      d.type,
      d.priority,
      `"${d.title.replace(/"/g, '""')}"`,
      `"${d.description.replace(/"/g, '""')}"`,
      `"${(d.statutoryBacking || 'SWM Rules 2016').replace(/"/g, '""')}"`,
      d.estimatedCostInr || 0,
      `"${d.targetStakeholders.join(', ')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swachhroute-policy-directives-${analytics.wardName.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card glow="cyan" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-command-border/60">
        <div>
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Gavel className="w-4 h-4 text-cyan-400" />
            <span>Statutory Municipal Policy & Preventive Directives</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Root-cause remediation under Solid Waste Management Rules 2016 & Municipal Corporation Bye-laws.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportPolicyDirectivesCSV}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-command-surface hover:bg-slate-700 border border-command-border text-xs text-slate-200 transition-colors"
            title="Download Policy Directives CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportPolicyDirectivesJSON}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-xs text-cyan-300 transition-colors"
            title="Download Policy Directives JSON"
          >
            <Download className="w-3.5 h-3.5 text-cyan-300" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analytics.actionableDirectives.map((d) => {
          const isImmediate = d.priority === 'immediate';
          const isHigh = d.priority === 'high';

          return (
            <div
              key={d.id}
              className="p-3.5 rounded-xl bg-command-surface/70 border border-command-border hover:border-slate-600 transition-colors space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-100 line-clamp-1">
                    {d.title}
                  </span>
                  <Badge
                    variant={isImmediate ? 'rose' : isHigh ? 'amber' : 'cyan'}
                    pulse={isImmediate}
                  >
                    {d.priority.toUpperCase()}
                  </Badge>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {d.description}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-command-border/40 text-[11px] font-mono">
                {d.statutoryBacking && (
                  <div className="flex items-center gap-1.5 text-amber-300/90">
                    <Gavel className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="line-clamp-1">{d.statutoryBacking}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Stakeholders: {d.targetStakeholders.join(', ')}</span>
                  {d.estimatedCostInr && (
                    <span className="text-emerald-400 font-bold">
                      Est. ₹{d.estimatedCostInr.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
