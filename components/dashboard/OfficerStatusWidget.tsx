'use client';

import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useReports } from '@/lib/reportsContext';
import { ShieldCheck, ArrowUpRight, AlertTriangle, PauseCircle, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function OfficerStatusWidget() {
  const { routes, hotspots, officerOverrides } = useReports();

  const optimizedCount = routes.filter((r) => !r.operationalStatus || r.operationalStatus === 'optimized').length;
  const reviewedCount = routes.filter((r) => r.operationalStatus === 'officer_reviewed').length;
  const onHoldCount = routes.filter((r) => r.operationalStatus === 'on_hold').length;
  const dispatchedCount = routes.filter((r) => r.operationalStatus === 'dispatched').length;

  const escalatedHotspotsCount = hotspots.filter((h) => Boolean(h.officerPriorityOverride)).length;

  return (
    <Card glow="purple" className="flex flex-col h-full justify-between">
      <div className="space-y-3">
        <CardHeader
          title="Officer Human-in-the-Loop"
          subtitle="Municipal Governance & Operational Control"
          icon={ShieldCheck}
          action={
            <Link
              href="/officer"
              className="flex items-center gap-1 text-xs font-mono text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span>Officer Console</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          }
        />

        {/* Operational Status Grid */}
        <div className="grid grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2 rounded-lg bg-command-surface/70 border border-command-border text-center">
            <span className="text-slate-400 text-[10px] block">PENDING REVIEW</span>
            <span className="text-base font-bold text-cyan-400">{optimizedCount}</span>
          </div>

          <div className="p-2 rounded-lg bg-command-surface/70 border border-command-border text-center">
            <span className="text-slate-400 text-[10px] block">REVIEWED</span>
            <span className="text-base font-bold text-amber-400">{reviewedCount}</span>
          </div>

          <div className="p-2 rounded-lg bg-command-surface/70 border border-command-border text-center">
            <span className="text-slate-400 text-[10px] block">ON HOLD</span>
            <span className={`text-base font-bold ${onHoldCount > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
              {onHoldCount}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-command-surface/70 border border-command-border text-center">
            <span className="text-slate-400 text-[10px] block">DISPATCHED</span>
            <span className="text-base font-bold text-emerald-400">{dispatchedCount}</span>
          </div>
        </div>

        {/* Officer Active Control Summary */}
        <div className="p-2.5 rounded-lg bg-command-dark/80 border border-command-border space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Officer Interventions:</span>
            <span className="font-bold text-purple-300">{officerOverrides.length} logged</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Manual Priority Escalations:</span>
            <span className="font-bold text-amber-400">{escalatedHotspotsCount} active</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-command-border/60">
        <Link
          href="/officer"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-purple-200 text-xs font-mono font-medium transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Review Routes & Approve Dispatches &rarr;</span>
        </Link>
      </div>
    </Card>
  );
}
