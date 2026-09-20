'use client';

import React from 'react';
import { ShieldAlert, Activity, Terminal, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { DEMO_DATA_NOTICE } from '@/data/demo';
import { useReports } from '@/lib/reportsContext';

export function Header() {
  const { aiEngineStatus } = useReports();

  return (
    <header className="sticky top-0 z-30 h-16 bg-command-darkest/95 backdrop-blur-md border-b border-command-border px-4 lg:px-6 flex items-center justify-between">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-glow-cyan">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">
                SwachhRoute <span className="text-cyan-400">AI</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300">
                CS11 HackForge 2026
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-400 font-medium">
              From Waste Reports to Smarter Routes.
            </p>
          </div>
        </div>
      </div>

      {/* Center/Right Status Indicators */}
      <div className="flex items-center gap-3">
        {/* MANDATORY SIMULATED DEMONSTRATION DATA BADGE */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline font-semibold">{DEMO_DATA_NOTICE}</span>
          <span className="sm:hidden font-semibold">Simulated Data</span>
        </div>

        {/* Live Municipal Telemetry Indicator */}
        <Badge variant="cyan" pulse className="hidden lg:inline-flex font-mono text-[11px]">
          Live Telemetry (Simulated)
        </Badge>

        {/* Local AI Engine Status Badge */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-md bg-command-surface border border-command-border text-xs font-mono">
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400">AI:</span>
          {aiEngineStatus.connected ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Ollama Connected
            </span>
          ) : (
            <span className="text-slate-500 flex items-center gap-1.5">
              <span className="inline-flex rounded-full h-2 w-2 bg-slate-600" />
              Ollama Offline
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            aria-label="Operational Notifications"
            className="p-2 rounded-lg hover:bg-command-surface hover:text-slate-200 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
