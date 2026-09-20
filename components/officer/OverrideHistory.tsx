'use client';

import React from 'react';
import { OfficerOverride, OfficerOverrideAction } from '@/types';
import { Badge } from '@/components/ui/Badge';
import {
  History,
  ShieldCheck,
  AlertTriangle,
  Truck,
  ArrowRightLeft,
  PauseCircle,
  Send,
  XCircle,
  UserCheck,
  Clock,
} from 'lucide-react';

interface OverrideHistoryProps {
  overrides: OfficerOverride[];
}

function getActionMeta(action: OfficerOverrideAction) {
  switch (action) {
    case 'priority_escalation':
      return {
        label: 'Priority Escalation',
        color: 'warning' as const,
        icon: AlertTriangle,
      };
    case 'vehicle_reassignment':
      return {
        label: 'Vehicle Reassignment',
        color: 'primary' as const,
        icon: Truck,
      };
    case 'stop_reorder':
      return {
        label: 'Stop Reorder',
        color: 'secondary' as const,
        icon: ArrowRightLeft,
      };
    case 'route_hold':
      return {
        label: 'Route On Hold',
        color: 'danger' as const,
        icon: PauseCircle,
      };
    case 'dispatch_approval':
      return {
        label: 'Dispatch Approved',
        color: 'success' as const,
        icon: Send,
      };
    case 'dispatch_rejection':
      return {
        label: 'Dispatch Rejected',
        color: 'danger' as const,
        icon: XCircle,
      };
    default:
      return {
        label: action,
        color: 'neutral' as const,
        icon: ShieldCheck,
      };
  }
}

export function OverrideHistory({ overrides }: OverrideHistoryProps) {
  if (!overrides || overrides.length === 0) {
    return (
      <div className="rounded-xl border border-command-border bg-command-surface/50 p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
          No Officer Interventions Logged
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Every human-in-the-loop manual override (priority escalation, vehicle reassignment, stop reordering,
          route holds, and dispatch approvals) is immutably timestamped and recorded here for municipal audit compliance.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-command-border bg-command-surface/80 overflow-hidden shadow-lg">
      <div className="p-4 border-b border-command-border flex items-center justify-between bg-command-surface/90">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Immutable Municipal Override Audit Log ({overrides.length})
          </h3>
        </div>
        <Badge variant="emerald" pulse>
          Audit System Active
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-command-dark/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-command-border">
            <tr>
              <th className="py-3 px-4">Timestamp & ID</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target / Route</th>
              <th className="py-3 px-4">Original $\rightarrow$ New State</th>
              <th className="py-3 px-4">Mandatory Justification</th>
              <th className="py-3 px-4">Officer</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-command-border/60">
            {overrides.map((ovr) => {
              const meta = getActionMeta(ovr.action);
              const Icon = meta.icon;
              const formattedDate = new Date(ovr.createdAt).toLocaleString('en-IN', {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              });

              return (
                <tr key={ovr.overrideId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="text-slate-200 font-bold" suppressHydrationWarning>{formattedDate}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{ovr.overrideId}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-command-border bg-command-dark/60 text-slate-200">
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[11px]">{meta.label}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="text-cyan-400 font-bold">{ovr.routeId}</div>
                    {ovr.targetId && (
                      <div className="text-[10px] text-slate-400">Target: {ovr.targetId}</div>
                    )}
                    {ovr.manifestId && (
                      <div className="text-[10px] text-slate-400">Manifest: {ovr.manifestId}</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {ovr.action === 'vehicle_reassignment' && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span className="line-through text-slate-500">{ovr.originalVehicleId}</span>
                        <span className="text-cyan-400 font-bold">&rarr;</span>
                        <span className="text-emerald-400 font-bold">{ovr.newVehicleId}</span>
                      </div>
                    )}
                    {ovr.action === 'priority_escalation' && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span className="capitalize text-slate-400">{ovr.originalPriority}</span>
                        <span className="text-amber-400 font-bold">&rarr;</span>
                        <span className="capitalize font-bold text-rose-400">{ovr.newPriority}</span>
                      </div>
                    )}
                    {ovr.action === 'stop_reorder' && (
                      <div className="space-y-0.5 text-[10px]">
                        <div className="text-slate-500">Orig: {ovr.originalStopOrder?.join(' \u2192 ')}</div>
                        <div className="text-emerald-400 font-bold">New: {ovr.newStopOrder?.join(' \u2192 ')}</div>
                      </div>
                    )}
                    {ovr.action === 'route_hold' && (
                      <span className="text-rose-400 font-semibold">Route Placed On Hold</span>
                    )}
                    {ovr.action === 'dispatch_approval' && (
                      <span className="text-emerald-400 font-semibold">Validated & Dispatched</span>
                    )}
                    {ovr.action === 'dispatch_rejection' && (
                      <span className="text-rose-400 font-semibold">Dispatch Rejected</span>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="text-slate-300 font-mono text-[11px] leading-snug line-clamp-2" title={ovr.reason}>
                      &ldquo;{ovr.reason}&rdquo;
                    </p>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-slate-300 text-[11px]">
                      <UserCheck className="w-3 h-3 text-cyan-400" />
                      <span>{ovr.officerName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <Badge
                      variant={ovr.status === 'applied' ? 'emerald' : ovr.status === 'cancelled' ? 'rose' : 'amber'}
                    >
                      {ovr.status.toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
