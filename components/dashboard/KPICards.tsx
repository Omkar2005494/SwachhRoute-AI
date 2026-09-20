import React from 'react';
import { Card } from '@/components/ui/Card';
import { DashboardKPIs } from '@/types';
import { FileText, Flame, AlertTriangle, Scale, Truck, TrendingUp } from 'lucide-react';

interface KPICardsProps {
  kpis: DashboardKPIs;
}

export function KPICards({ kpis }: KPICardsProps) {
  const cards = [
    {
      title: 'Total Reports',
      value: kpis.totalReports.toString(),
      subtext: 'Citizen & field submissions',
      icon: FileText,
      glow: 'cyan' as const,
      color: 'text-cyan-400',
      bgIcon: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-400',
    },
    {
      title: 'Active Hotspots',
      value: kpis.activeHotspots.toString(),
      subtext: 'DBSCAN spatial clusters',
      icon: Flame,
      glow: 'purple' as const,
      color: 'text-purple-400',
      bgIcon: 'bg-purple-950/60 border-purple-500/30 text-purple-400',
    },
    {
      title: 'High Priority Hotspots',
      value: kpis.highPriorityHotspots.toString(),
      subtext: 'Critical urgency dispatch',
      icon: AlertTriangle,
      glow: 'purple' as const,
      color: 'text-rose-400',
      bgIcon: 'bg-rose-950/60 border-rose-500/30 text-rose-400',
    },
    {
      title: 'Est. Clustered Waste',
      value: `${kpis.pendingCollectionTons} T`,
      subtext: 'AI advisory estimate (uncollected)',
      icon: Scale,
      glow: 'cyan' as const,
      color: 'text-amber-400',
      bgIcon: 'bg-amber-950/60 border-amber-500/30 text-amber-400',
    },
    {
      title: 'Available Fleet',
      value: `${kpis.availableFleetCount} / ${kpis.totalFleetCount}`,
      subtext: 'Operational collection units',
      icon: Truck,
      glow: 'cyan' as const,
      color: 'text-emerald-400',
      bgIcon: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} glow={card.glow} className="p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.title}</p>
                <h3 className={`text-2xl font-bold mt-1 font-mono ${card.color}`}>
                  {card.value}
                </h3>
              </div>
              <div className={`p-2 rounded-lg border ${card.bgIcon}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <TrendingUp className="w-3 h-3 text-cyan-400" />
              <span>{card.subtext}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
