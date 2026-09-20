'use client';

import React from 'react';
import {
  Sparkles,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  Scale,
  Activity,
  CheckCircle2,
  Clock,
  X,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { WasteReport, ComplaintAnalysis } from '@/types';
import { formatCategoryLabel, formatHazardLabel, formatMachineryLabel } from '@/lib/formatters';
import { Badge } from '@/components/ui/Badge';

interface AIIntelligenceModalProps {
  report: WasteReport | null;
  onClose: () => void;
  onReanalyze?: (reportId: string) => void;
}

export function AIIntelligenceModal({
  report,
  onClose,
  onReanalyze,
}: AIIntelligenceModalProps) {
  if (!report) return null;

  const analysis: ComplaintAnalysis | undefined = report.aiAnalysis;
  const isAnalyzing = report.aiStatus === 'analyzing';
  const isFallback = analysis?.engine === 'rule_based_fallback';

  // Severity color scale helper
  const getSeverityBadge = (score: number) => {
    if (score >= 9) return { bg: 'bg-rose-950 border-rose-500 text-rose-300', text: 'Critical Emergency', color: '#f43f5e' };
    if (score >= 7) return { bg: 'bg-amber-950 border-amber-500 text-amber-300', text: 'High Priority', color: '#f59e0b' };
    if (score >= 4) return { bg: 'bg-yellow-950 border-yellow-500 text-yellow-300', text: 'Moderate Concern', color: '#eab308' };
    return { bg: 'bg-emerald-950 border-emerald-500 text-emerald-300', text: 'Low Concern', color: '#10b981' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-command-darkest border border-command-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-command-dark border-b border-command-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  AI Complaint Intelligence
                </h3>
                <span className="font-mono text-xs text-cyan-400 font-semibold">
                  {report.id}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                <Terminal className="w-3 h-3 text-purple-400" />
                <span>Model: Meta Llama 3.2 3B</span>
                <span>&bull;</span>
                <span>Engine: Local Ollama</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-command-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Citizen Complaint Raw Context */}
          <div className="p-3.5 rounded-xl bg-command-surface/70 border border-command-border space-y-1">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Citizen Description (Raw Text Input)
            </div>
            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              &ldquo;{report.description}&rdquo;
            </p>
          </div>

          {/* Fallback Warning Callout if Rule Fallback was engaged */}
          {isFallback && (
            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/50 flex items-start gap-2.5 text-xs font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-amber-300 uppercase">
                  Analysis Source: Rule-Based Fallback
                </span>
                <p className="text-slate-300 text-[11px]">
                  Local Ollama daemon was offline or returned unvalidated syntax. This result was generated deterministically from keyword heuristics and must NOT be attributed to Llama 3.2 3B.
                </p>
              </div>
            </div>
          )}

          {/* Analyzing State */}
          {isAnalyzing && (
            <div className="p-8 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Analyzing Complaint Locally...</h4>
                <p className="text-xs text-slate-400 font-mono">
                  Executing Meta Llama 3.2 3B inference via Ollama grammar-constrained JSON mode.
                </p>
              </div>
            </div>
          )}

          {/* Validated Analysis Display */}
          {analysis && !isAnalyzing && (
            <div className="space-y-4">
              {/* Severity & AI Confidence Ribbon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Severity Meter */}
                <div className="p-4 rounded-xl bg-command-surface/90 border border-command-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase">
                      Severity Score
                    </span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                        getSeverityBadge(analysis.severity).bg
                      }`}
                    >
                      {getSeverityBadge(analysis.severity).text}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-white">
                      {analysis.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-400">/ 10</span>
                  </div>

                  {/* 10-point Bar Gauge */}
                  <div className="grid grid-cols-10 gap-1 pt-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-2 rounded-sm transition-all"
                        style={{
                          backgroundColor:
                            i < analysis.severity
                              ? getSeverityBadge(analysis.severity).color
                              : '#1e293b',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* AI Confidence & Status */}
                <div className="p-4 rounded-xl bg-command-surface/90 border border-command-border space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase">
                      AI Confidence (Advisory)
                    </span>
                    <div className="text-3xl font-bold font-mono text-cyan-400 mt-1">
                      {Math.round(analysis.confidence * 100)}%
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-command-border/50">
                    <span>Engine:</span>
                    <span className={isFallback ? 'text-amber-400' : 'text-purple-300'}>
                      {isFallback ? 'Rule-Based Fallback' : 'Llama 3.2 3B (Live)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Taxonomy & Hazard Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                {/* Primary Hazard */}
                <div className="p-3 rounded-lg bg-command-surface/60 border border-command-border space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Primary Hazard</span>
                  <Badge variant="rose" className="text-[11px]">
                    {formatHazardLabel(analysis.hazard)}
                  </Badge>
                </div>

                {/* Waste Category */}
                <div className="p-3 rounded-lg bg-command-surface/60 border border-command-border space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Detected Category</span>
                  <span className="text-slate-200 font-bold">
                    {formatCategoryLabel(analysis.category)}
                  </span>
                </div>

                {/* Machinery Directive */}
                <div className="p-3 rounded-lg bg-command-surface/60 border border-command-border space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Recommended Machinery</span>
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                    <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{formatMachineryLabel(analysis.machineryRequired)}</span>
                  </div>
                </div>
              </div>

              {/* Estimated Waste Quantity Separation */}
              <div className="p-3.5 rounded-lg bg-command-dark/80 border border-command-border flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">
                      AI Estimated Waste Quantity (Non-Weighbridge)
                    </span>
                    <span className="text-slate-200 font-bold">
                      {analysis.estimatedWasteKg !== null
                        ? `${analysis.estimatedWasteKg} kg (Inferred from text)`
                        : 'Not specified in complaint'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 max-w-[200px] text-right">
                  Advisory text inference only. Actual collected weight determined at weighbridge.
                </span>
              </div>

              {/* Incident Summary & Recommended Action */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-command-surface/80 border border-command-border space-y-1">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Incident Summary</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Recommended Municipal Action</span>
                  </div>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed">
                    {analysis.recommendedAction}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer Footer */}
          <div className="pt-3 border-t border-command-border text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>
              Analysis Time: {analysis?.analyzedAt ? new Date(analysis.analyzedAt).toLocaleTimeString() : 'N/A'}
            </span>

            {onReanalyze && report.id && (
              <button
                type="button"
                onClick={() => onReanalyze(report.id)}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>Re-analyze with Local AI</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
