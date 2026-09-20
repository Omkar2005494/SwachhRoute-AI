'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useReports } from '@/lib/reportsContext';
import { WasteCategory, WasteReport } from '@/types';
import { formatCategoryLabel, formatDateTime } from '@/lib/formatters';
import { CreateReportModal } from '@/components/reports/CreateReportModal';
import { AIIntelligenceModal } from '@/components/reports/AIIntelligenceModal';
import { DatasetSelector } from '@/components/datasets';
import {
  FileText,
  Plus,
  Clock,
  MapPin,
  Camera,
  Mic,
  Search,
  Sparkles,
  ShieldCheck,
  Eye,
  X,
  Terminal,
  Activity,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function ReportsPage() {
  const { reports, totalReports, aiEngineStatus, triggerAIAnalysis } = useReports();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [selectedReportIdForAI, setSelectedReportIdForAI] = useState<string | null>(null);
  const selectedReportForAI = selectedReportIdForAI
    ? reports.find((r) => r.id === selectedReportIdForAI) || null
    : null;

  const filteredReports = reports.filter((report) => {
    const matchesCategory =
      selectedCategory === 'all' || report.category === selectedCategory;
    const matchesSearch =
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.wardName && report.wardName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenAIModal = (report: WasteReport) => {
    setSelectedReportIdForAI(report.id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Live AI Engine Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-command-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Citizen & Field Incident Reports
            </h2>
            <Badge variant="cyan" className="font-mono">
              {totalReports} Total Reports
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multi-modal data collection layer with Local Meta Llama 3.2 3B Natural Language Understanding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Ollama Engine Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-command-surface border border-command-border text-xs font-mono">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400">AI Engine:</span>
            {aiEngineStatus.connected ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Ollama ({aiEngineStatus.model})
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="inline-flex rounded-full h-2 w-2 bg-slate-600" />
                Ollama Offline
              </span>
            )}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-glow-cyan transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>File New Waste Report</span>
          </button>
        </div>
      </div>

      {/* Municipal Dataset Ingestion & Switcher Toolbar */}
      <DatasetSelector />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-command-card/80 border border-command-border">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search report ID, description, or ward..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-command-surface border border-command-border text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-mono text-slate-400 shrink-0">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-command-surface border border-command-border text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">All Categories</option>
            <option value="household">Household Waste</option>
            <option value="commercial">Commercial Waste</option>
            <option value="construction_debris">Construction & Debris</option>
            <option value="organic">Organic/Green Waste</option>
            <option value="plastic">Plastic Dump</option>
            <option value="hazardous">Hazardous/Medical</option>
            <option value="electronic">Electronic Waste</option>
            <option value="mixed">Mixed Waste</option>
          </select>
        </div>
      </div>

      {/* Reports Table / Card View */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-command-surface/90 text-slate-300 uppercase font-mono text-[11px] border-b border-command-border">
              <tr>
                <th className="px-4 py-3">Report ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Coordinates (EPSG:4326)</th>
                <th className="px-4 py-3">Media</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Local AI Understanding</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-command-border/50 font-mono text-slate-300">
              {filteredReports.map((report) => {
                const isAnalyzing = report.aiStatus === 'analyzing';
                const isComplete = report.aiStatus === 'complete';
                const isFallback = report.aiStatus === 'offline_fallback';
                const isFailed = report.aiStatus === 'failed';

                return (
                  <tr key={report.id} className="hover:bg-command-surface/40 transition-colors">
                    {/* Report ID */}
                    <td className="px-4 py-3.5 font-bold text-cyan-400 whitespace-nowrap">
                      {report.id}
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3.5 text-slate-400 font-sans whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                        <span suppressHydrationWarning>
                          {formatDateTime(report.timestamp)}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 font-sans whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                        {formatCategoryLabel(report.category)}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3.5 font-sans text-slate-200 max-w-xs">
                      <p className="line-clamp-2">{report.description}</p>
                    </td>

                    {/* Coordinates EPSG:4326 */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-cyan-300 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span>
                          {report.latitude.toFixed(4)}°, {report.longitude.toFixed(4)}°
                        </span>
                      </div>
                    </td>

                    {/* Media Indicators */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {report.photo ? (
                          <button
                            type="button"
                            onClick={() => setPreviewPhoto(report.photo || null)}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] hover:bg-cyan-900 transition-colors"
                            title="View photo preview"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Photo</span>
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[10px]">&mdash;</span>
                        )}

                        {report.audio && (
                          <span
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px]"
                            title="Voice complaint recorded"
                          >
                            <Mic className="w-3 h-3" />
                            <span>Audio</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3.5 text-slate-400 text-[11px] capitalize whitespace-nowrap">
                      {report.source.replace('_', ' ')}
                    </td>

                    {/* Local AI Understanding Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {isAnalyzing ? (
                        <button
                          type="button"
                          onClick={() => handleOpenAIModal(report)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 animate-pulse hover:bg-cyan-900/60 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Analyzing locally...</span>
                        </button>
                      ) : isComplete ? (
                        <button
                          type="button"
                          onClick={() => handleOpenAIModal(report)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-purple-950/80 border border-purple-500/40 text-purple-300 hover:bg-purple-900 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>Llama 3.2 3B Complete</span>
                          {report.aiAnalysis && (
                            <span className="ml-1 px-1.5 py-0.2 rounded bg-purple-900 text-[10px] font-bold">
                              Sev {report.aiAnalysis.severity}/10
                            </span>
                          )}
                        </button>
                      ) : isFallback ? (
                        <button
                          type="button"
                          onClick={() => handleOpenAIModal(report)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-amber-950/80 border border-amber-500/40 text-amber-300 hover:bg-amber-900 transition-colors cursor-pointer"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>Rule-Based Fallback</span>
                        </button>
                      ) : isFailed ? (
                        <button
                          type="button"
                          onClick={() => handleOpenAIModal(report)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-rose-950/80 border border-rose-500/40 text-rose-300 hover:bg-rose-900 transition-colors cursor-pointer"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>Analysis Failed (Retry)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => triggerAIAnalysis(report.id, report.description)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-slate-400" />
                          <span>Run Local AI</span>
                        </button>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenAIModal(report)}
                        className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Photo Preview Lightbox Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-lg w-full bg-command-darkest border border-command-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Incident Photo Evidence</span>
              </h4>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative rounded-lg overflow-hidden border border-command-border max-h-96">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto}
                alt="Incident evidence full preview"
                className="w-full h-full object-contain bg-black"
              />
            </div>
            <div className="text-[11px] text-slate-400 text-center font-mono">
              Client session preview &bull; Simulated Demonstration Data
            </div>
          </div>
        </div>
      )}

      {/* AI Complaint Intelligence Modal */}
      {selectedReportForAI && (
        <AIIntelligenceModal
          report={selectedReportForAI}
          onClose={() => setSelectedReportIdForAI(null)}
          onReanalyze={(id, desc) => triggerAIAnalysis(id, desc)}
        />
      )}

      {/* Create Report Modal */}
      <CreateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
