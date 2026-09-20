'use client';

import React from 'react';
import { Route, Sparkles, Shapes, Truck, ShieldCheck, RotateCcw, Play } from 'lucide-react';

interface HeaderProps {
  onDetectHotspots: () => void;
  onSolveRoutes: () => void;
  onResetData: () => void;
  onSimulateFleet: () => void;
  isSimulating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onDetectHotspots,
  onSolveRoutes,
  onResetData,
  onSimulateFleet,
  isSimulating,
}) => {
  return (
    <header className="h-16 bg-[#0e131f] border-b border-[#212d45] px-5 flex items-center justify-between z-30 shadow-md">
      {/* Brand Cluster */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg pulse-emerald">
          <Route className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-xl tracking-tight text-white">
              SwachhRoute <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gradient-to-r from-pink-500 to-purple-600 text-white">AI</span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Autonomous Waste Hotspot Clustering & Dynamic Fleet Route Optimiser • Ward 12 (Pune)
          </p>
        </div>
      </div>

      {/* Technology Pills */}
      <div className="hidden lg:flex items-center gap-2">
        <div className="text-xs bg-[#141c2e] border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local Llama 3.2 3B (Ollama)</span>
        </div>
        <div className="text-xs bg-[#141c2e] border border-[#212d45] text-slate-300 px-3 py-1 rounded-full flex items-center gap-1.5">
          <Shapes className="w-3.5 h-3.5 text-cyan-400" />
          <span>DBSCAN (ε=180m)</span>
        </div>
        <div className="text-xs bg-[#141c2e] border border-[#212d45] text-slate-300 px-3 py-1 rounded-full flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google OR-Tools CVRP</span>
        </div>
        <div className="text-xs bg-[#141c2e] border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>DPDP Act 2023 Compliant</span>
        </div>
      </div>

      {/* Top Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onSimulateFleet}
          className="text-xs font-heading font-semibold px-3 py-2 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/50 text-sky-300 flex items-center gap-1.5 transition-all"
        >
          <Play className={`w-3.5 h-3.5 ${isSimulating ? 'text-amber-400' : 'text-sky-300'}`} />
          <span>{isSimulating ? 'Stop Sim' : 'Simulate Fleet'}</span>
        </button>

        <button
          onClick={onDetectHotspots}
          className="text-xs font-heading font-semibold px-3 py-2 rounded-lg bg-[#141c2e] hover:bg-[#1c2740] border border-[#2e3e5f] text-slate-200 flex items-center gap-1.5 transition-all"
        >
          <Shapes className="w-3.5 h-3.5 text-cyan-400" />
          <span>Detect Hotspots</span>
        </button>

        <button
          onClick={onSolveRoutes}
          className="text-xs font-heading font-semibold px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md flex items-center gap-1.5 transition-all"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Solve Routes</span>
        </button>

        <button
          onClick={onResetData}
          title="Reset Seed Data"
          className="p-2 rounded-lg bg-[#141c2e] hover:bg-[#1c2740] border border-[#212d45] text-slate-400 hover:text-white transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
