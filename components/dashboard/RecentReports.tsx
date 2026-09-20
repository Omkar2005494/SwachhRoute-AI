import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { WasteReport } from '@/types';
import { formatCategoryLabel, formatTime } from '@/lib/formatters';
import { FileText, ArrowUpRight, Clock, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface RecentReportsProps {
  reports: WasteReport[];
}

export function RecentReports({ reports }: RecentReportsProps) {
  return (
    <Card glow="cyan" className="flex flex-col h-full">
      <CardHeader
        title="Live Incident Reports Feed"
        subtitle="Multi-modal citizen & officer stream"
        icon={FileText}
        action={
          <Link
            href="/reports"
            className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <div className="space-y-2.5 flex-1 overflow-y-auto">
        {reports.slice(0, 5).map((report) => (
          <div
            key={report.id}
            className="p-3 rounded-lg bg-command-surface/60 border border-command-border hover:border-cyan-500/30 transition-all flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {report.id}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  {formatCategoryLabel(report.category)}
                </span>
              </div>

              {!report.aiAnalyzed ? (
                <Badge variant="purple" pulse className="text-[10px]">
                  <Sparkles className="w-2.5 h-2.5 inline mr-1" />
                  Pending AI
                </Badge>
              ) : (
                <Badge
                  variant={
                    report.severity === 'critical'
                      ? 'rose'
                      : report.severity === 'high'
                      ? 'amber'
                      : 'cyan'
                  }
                >
                  {report.severity}
                </Badge>
              )}
            </div>

            <p className="text-xs text-slate-300 line-clamp-1">{report.description}</p>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-command-border/40">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span className="truncate">{report.wardName || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span suppressHydrationWarning>{formatTime(report.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
