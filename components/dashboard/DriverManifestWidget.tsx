'use client';

import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useReports } from '@/lib/reportsContext';
import { ClipboardList, ArrowUpRight, Truck, User, Scale, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function DriverManifestWidget() {
  const { driverManifests } = useReports();

  const readyCount = driverManifests.filter((m) => m.status === 'ready' && !m.isStale).length;
  const staleCount = driverManifests.filter((m) => m.isStale).length;
  const dispatchedCount = driverManifests.filter((m) => m.status === 'dispatched').length;
  const completedCount = driverManifests.filter((m) => m.status === 'completed').length;

  const latestManifest = driverManifests[0];

  return (
    <Card glow="cyan" className="flex flex-col h-full justify-between">
      <div className="space-y-3">
        <CardHeader
          title="Driver Shift Manifests"
          subtitle="Operational Field Run Sheets"
          icon={ClipboardList}
          action={
            <Link
              href="/manifests"
              className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>View Manifests</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          }
        />

        {/* Status Count Badges */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div className="p-2 rounded-lg bg-command-surface/70 border border-command-border text-center">
            <span className="text-slate-400 text-[10px] block">READY</span>
            <span className="text-base font-bold text-emerald-400">{readyCount}</span>
          </div>

          <div className="p-2 rounded-lg bg-command-surface/70 border border-command-border text-center">
            <span className="text-slate-400 text-[10px] block">DISPATCHED</span>
            <span className="text-base font-bold text-slate-400">{dispatchedCount}</span>
          </div>

          <div className="p-2 rounded-lg bg-command-surface/70 border border-command-border text-center">
            <span className="text-slate-400 text-[10px] block">COMPLETED</span>
            <span className="text-base font-bold text-slate-400">{completedCount}</span>
          </div>
        </div>

        {/* Active Manifest Summary or Unmanifested Alert */}
        {latestManifest ? (
          <div className="p-2.5 rounded-lg bg-command-dark/80 border border-command-border space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300">{latestManifest.manifestId}</span>
              {latestManifest.isStale ? (
                <Badge variant="amber">STALE</Badge>
              ) : (
                <Badge variant="emerald">READY</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3 h-3 text-purple-400" />
                <span className="truncate">{latestManifest.vehicleId}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-cyan-400" />
                <span className="truncate">{latestManifest.driverName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-command-border/40">
              <span>{latestManifest.totalStops} Stops • {latestManifest.capacityUtilizationPercent}% Load</span>
              <span className="text-emerald-400">{latestManifest.estimatedLoadKg.toLocaleString()} kg</span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-command-dark/60 border border-command-border/60 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>No Manifests Issued</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Manifests synthesize OR-Tools routes and OSRM roads into operational run sheets. Click below or visit Routes to generate.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-command-border/60">
        <Link
          href="/manifests"
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-cyan-100 text-xs font-mono transition-colors"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>{latestManifest ? 'Inspect Driver Manifest' : 'Open Manifest Console'}</span>
        </Link>
      </div>
    </Card>
  );
}
