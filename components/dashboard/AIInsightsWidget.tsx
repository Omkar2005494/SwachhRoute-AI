'use client';

import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Sparkles, Terminal, ShieldCheck, ArrowRight, Activity, Wrench, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useReports } from '@/lib/reportsContext';
import { Badge } from '@/components/ui/Badge';

export function AIInsightsWidget() {
  const { reports, aiEngineStatus } = useReports();

  // Find the most recent report with completed AI analysis
  const recentAIReport = reports.find(
    (r) => r.aiAnalysis && (r.aiStatus === 'complete' || r.aiStatus === 'offline_fallback')
  );

  return (
    <Card glow="cyan" className="flex flex-col h-full bg-gradient-to-br from-command-card via-command-surface/80 to-purple-950/20">
      <CardHeader
        title="Local AI Intelligence"
        subtitle="Meta Llama 3.2 3B via Ollama (NLU Engine)"
        icon={Sparkles}
        action={
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-[10px] font-mono text-purple-300">
            <Terminal className="w-3 h-3" />
            <span>
              {aiEngineStatus.connected ? 'OLLAMA CONNECTED' : 'OLLAMA OFFLINE'}
            </span>
          </div>
        }
      />

      <div className="space-y-3 flex-1 text-xs">
        {/* Architectural Guardrail Alert */}
        <div className="p-2.5 rounded-lg bg-command-dark/80 border border-cyan-500/30 flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-300">
            <p className="font-semibold text-cyan-300">NLU Boundary Guardrail</p>
            <p className="text-slate-400 text-[10px]">
              Llama 3.2 3B evaluates complaints & machinery directives. All clustering (DBSCAN) & routing (CVRP) are deterministic.
            </p>
          </div>
        </div>

        {/* Latest AI Complaint Analysis Card */}
        {recentAIReport?.aiAnalysis ? (
          <div className="p-3 rounded-lg bg-command-surface/80 border border-command-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-cyan-400 font-bold">
                {recentAIReport.id}
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${
                  recentAIReport.aiAnalysis.severity >= 8
                    ? 'bg-rose-950 text-rose-300 border-rose-500'
                    : recentAIReport.aiAnalysis.severity >= 6
                    ? 'bg-amber-950 text-amber-300 border-amber-500'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500'
                }`}
              >
                Sev {recentAIReport.aiAnalysis.severity}/10
              </span>
            </div>

            <p className="text-slate-300 text-[11px] line-clamp-2">
              &ldquo;{recentAIReport.aiAnalysis.summary}&rdquo;
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-command-border/40 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Wrench className="w-3 h-3 text-cyan-400" />
                {recentAIReport.aiAnalysis.machineryRequired.replace('_', ' ')}
              </span>
              <span className="text-purple-300">
                AI Conf: {Math.round(recentAIReport.aiAnalysis.confidence * 100)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-command-surface/70 border border-command-border space-y-1.5 text-slate-400 text-[11px]">
            <p className="text-slate-300 font-medium">Local Engine Ready</p>
            <p className="text-[10px]">
              Submit a new report at <Link href="/reports" className="text-cyan-400 underline">/reports</Link> to trigger automated Meta Llama 3.2 3B natural language inference.
            </p>
          </div>
        )}

        {/* Link to Full Insights page */}
        <div className="pt-1">
          <Link
            href="/insights"
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-command-surface hover:bg-slate-800 border border-command-border text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Open AI Intelligence Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
