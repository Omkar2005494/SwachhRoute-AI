import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Hotspot } from '@/types';
import { formatMachineryLabel } from '@/lib/formatters';
import { Flame, ArrowUpRight, Wrench, Scale } from 'lucide-react';
import Link from 'next/link';

interface PriorityHotspotsProps {
  hotspots: Hotspot[];
}

export function PriorityHotspots({ hotspots }: PriorityHotspotsProps) {
  return (
    <Card glow="purple" className="flex flex-col h-full">
      <CardHeader
        title="Priority Waste Hotspots"
        subtitle="DBSCAN high-density incident clusters"
        icon={Flame}
        action={
          <Link
            href="/hotspots"
            className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <div className="space-y-3 flex-1 overflow-y-auto">
        {hotspots.map((hotspot) => {
          const isCritical = hotspot.urgencyLevel === 'critical';

          return (
            <div
              key={hotspot.id}
              className="p-3.5 rounded-lg bg-command-surface/70 border border-command-border hover:border-slate-700 transition-all flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-200">
                    {hotspot.id}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {hotspot.zoneName}
                  </span>
                </div>
                <Badge
                  variant={isCritical ? 'rose' : 'amber'}
                  pulse={isCritical}
                >
                  {hotspot.urgencyLevel}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 pt-1 border-t border-command-border/40">
                <div className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Est: {hotspot.totalEstimatedWasteKg} kg</span>
                </div>
                <div className="flex items-center gap-1.5 text-right justify-end">
                  <span className="text-slate-400">Score:</span>
                  <span className="text-amber-400 font-bold">{hotspot.severityScore}/100</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Wrench className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="truncate">
                  Req: {hotspot.recommendedMachinery.map(formatMachineryLabel).join(', ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-command-border/40">
                <span>CVRP Dispatch:</span>
                {hotspot.assignedRouteId ? (
                  <span className="text-emerald-400 font-semibold">{hotspot.assignedRouteId}</span>
                ) : hotspot.assignmentStatus === 'capacity_exception' || hotspot.recommendedMachinery.includes('backhoe') || hotspot.totalEstimatedWasteKg > 4500 ? (
                  <span className="text-amber-400 font-semibold">Remediation Req.</span>
                ) : (
                  <span className="text-slate-500">Unassigned</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
