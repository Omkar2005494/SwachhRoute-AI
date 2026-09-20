'use client';

import React, { useState } from 'react';
import { useReports } from '@/lib/reportsContext';
import { Badge } from '@/components/ui/Badge';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  MapPin,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { DatasetImportModal } from './DatasetImportModal';

export function DatasetSelector({ compact = false }: { compact?: boolean }) {
  const {
    activeDatasetId,
    activeDataset,
    availableDatasets,
    switchDataset,
    resetCurrentDataset,
    exportReports,
    totalReports,
  } = useReports();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitch = async (datasetId: string) => {
    if (datasetId === activeDatasetId || isSwitching) return;
    setIsSwitching(true);
    try {
      await switchDataset(datasetId);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleExport = (format: 'csv' | 'geojson') => {
    setIsExportMenuOpen(false);
    const content = exportReports(format);
    const blob = new Blob([content], {
      type: format === 'geojson' ? 'application/geo+json' : 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `swachhroute_${activeDatasetId}_${new Date().toISOString().slice(0, 10)}.${
      format === 'geojson' ? 'geojson' : 'csv'
    }`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-command-surface border border-command-border rounded-lg p-1 text-xs font-mono">
          <Database className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
          <select
            value={activeDatasetId}
            onChange={(e) => handleSwitch(e.target.value)}
            disabled={isSwitching}
            className="bg-transparent text-slate-200 text-xs px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer disabled:opacity-50 font-sans"
          >
            {availableDatasets.map((ds) => (
              <option key={ds.id} value={ds.id} className="bg-command-card text-slate-100">
                {ds.city}: {ds.name} ({ds.reportCount} reports)
              </option>
            ))}
            {activeDatasetId === 'custom_import' && (
              <option value="custom_import" className="bg-command-card text-slate-100">
                Custom Ingestion ({totalReports} reports)
              </option>
            )}
          </select>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-command-surface/90 border border-command-border rounded-xl p-4 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Active Dataset Overview */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-tight">
                    {activeDataset.name}
                  </span>
                  <Badge variant={activeDatasetId === 'demo_sample' ? 'amber' : 'emerald'}>
                    {activeDatasetId === 'demo_sample' ? 'Simulated Sample' : 'Authentic Dataset'}
                  </Badge>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                    {totalReports} Active Reports
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    {activeDataset.city}, {activeDataset.state} — {activeDataset.wardOrZone}
                  </span>
                  <span>•</span>
                  <span>Depot: {activeDataset.depot.name.split('(')[0]}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl pt-1">
              {activeDataset.description}
            </p>
          </div>

          {/* Right: Dataset Switcher Pills & Ingestion Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Switcher Buttons */}
            <div className="flex items-center bg-command-darkest/90 p-1 rounded-lg border border-command-border text-xs">
              {availableDatasets.map((ds) => {
                const isActive = ds.id === activeDatasetId;
                return (
                  <button
                    key={ds.id}
                    onClick={() => handleSwitch(ds.id)}
                    disabled={isSwitching}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {isActive && <CheckCircle2 className="w-3 h-3 text-cyan-200" />}
                    <span>{ds.city} ({ds.reportCount})</span>
                  </button>
                );
              })}
            </div>

            {/* Ingestion & Export Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-card hover:bg-slate-800 border border-command-border text-xs font-medium text-slate-200 transition-colors"
                title="Import custom CSV or GeoJSON dataset"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Import Data</span>
              </button>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-command-card hover:bg-slate-800 border border-command-border text-xs font-medium text-slate-200 transition-colors"
                  title="Export active reports"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-1 w-36 rounded-lg bg-command-card border border-command-border shadow-xl py-1 z-50 text-xs font-mono">
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={() => handleExport('geojson')}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      <span>Export GeoJSON</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => resetCurrentDataset()}
                disabled={isSwitching}
                className="p-1.5 rounded-lg bg-command-card hover:bg-slate-800 border border-command-border text-slate-400 hover:text-slate-200 transition-colors"
                title="Reset active dataset to canonical initial state"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isSwitching ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isImportModalOpen && (
        <DatasetImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      )}
    </>
  );
}
