'use client';

import React, { useState } from 'react';
import { useReports } from '@/lib/reportsContext';
import {
  parseCSVReports,
  parseGeoJSONReports,
  generateSampleCSV,
} from '@/services/dataProcessing';
import { WasteReport } from '@/types';
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Download,
  Database,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface DatasetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DatasetImportModal({ isOpen, onClose }: DatasetImportModalProps) {
  const { importCustomDataset } = useReports();
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<'csv' | 'geojson'>('csv');
  const [customName, setCustomName] = useState<string>('Custom Municipal Telemetry');
  const [customCity, setCustomCity] = useState<string>('Operational Zone');
  const [parsedReports, setParsedReports] = useState<WasteReport[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const isJson = file.name.endsWith('.json') || file.name.endsWith('.geojson');
    setFileType(isJson ? 'geojson' : 'csv');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      processInput(text, isJson ? 'geojson' : 'csv');
    };
    reader.readAsText(file);
  };

  const processInput = (text: string, type: 'csv' | 'geojson') => {
    if (!text.trim()) {
      setParsedReports([]);
      setParseErrors([]);
      return;
    }

    const res =
      type === 'csv'
        ? parseCSVReports(text, customCity)
        : parseGeoJSONReports(text, customCity);

    setParsedReports(res.reports);
    setParseErrors(res.errors);
  };

  const handleDownloadSample = () => {
    const sample = generateSampleCSV();
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'swachhroute_sample_complaints.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApply = async () => {
    if (parsedReports.length === 0) return;
    setIsProcessing(true);
    try {
      await importCustomDataset(parsedReports, customName, customCity);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-command-card border border-command-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-command-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Import Municipal Waste Dataset
              </h3>
              <p className="text-xs text-slate-400">
                Upload custom CSV or GeoJSON incident records with automatic spatial validation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Metadata inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Dataset Title / Authority
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Hyderabad GHMC Central"
                className="w-full px-3 py-2 rounded-lg bg-command-surface border border-command-border text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                City / Municipal Zone
              </label>
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="e.g. Hyderabad (Ward 8)"
                className="w-full px-3 py-2 rounded-lg bg-command-surface border border-command-border text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* File Drag and Drop / Selector */}
          <div className="border-2 border-dashed border-command-border hover:border-cyan-500/50 rounded-xl p-6 text-center bg-command-surface/50 transition-colors">
            <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80" />
            <p className="text-slate-200 font-medium mb-1">
              {fileName ? fileName : 'Choose or drag & drop CSV / GeoJSON file'}
            </p>
            <p className="text-[11px] text-slate-400 mb-3 font-mono">
              Accepted formats: .csv, .json, .geojson
            </p>

            <div className="flex items-center justify-center gap-3">
              <label className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold cursor-pointer shadow-glow-cyan transition-all inline-flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Select File</span>
                <input
                  type="file"
                  accept=".csv,.json,.geojson"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleDownloadSample}
                className="px-3 py-2 rounded-lg bg-command-card hover:bg-slate-800 border border-command-border text-slate-300 font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download Sample CSV</span>
              </button>
            </div>
          </div>

          {/* Direct Text Paste Option */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 font-medium">Or paste raw text directly:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setFileType('csv');
                    processInput(fileContent, 'csv');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    fileType === 'csv'
                      ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  CSV Format
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFileType('geojson');
                    processInput(fileContent, 'geojson');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    fileType === 'geojson'
                      ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  GeoJSON
                </button>
              </div>
            </div>
            <textarea
              rows={4}
              value={fileContent}
              onChange={(e) => {
                setFileContent(e.target.value);
                processInput(e.target.value, fileType);
              }}
              placeholder='description,latitude,longitude,category,severity,waste_kg&#10;"Sabzi kachra overflowing",18.5062,73.8055,organic,high,800'
              className="w-full p-2.5 rounded-lg bg-command-surface border border-command-border font-mono text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Validation & Preview Summary */}
          {parsedReports.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-command-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">
                    {parsedReports.length} reports parsed successfully
                  </span>
                </div>
                {parseErrors.length > 0 && (
                  <span className="text-amber-400 font-mono text-[11px]">
                    {parseErrors.length} errors/skipped
                  </span>
                )}
              </div>

              {/* Preview Table of First 5 Reports */}
              <div className="max-h-40 overflow-y-auto rounded-lg border border-command-border bg-command-surface font-mono text-[10px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/80 sticky top-0 text-slate-400 border-b border-command-border">
                    <tr>
                      <th className="p-1.5">ID</th>
                      <th className="p-1.5">Description</th>
                      <th className="p-1.5">Category</th>
                      <th className="p-1.5">Severity</th>
                      <th className="p-1.5">Coordinates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-command-border/40">
                    {parsedReports.slice(0, 5).map((r) => (
                      <tr key={r.id} className="text-slate-300 hover:bg-slate-800/40">
                        <td className="p-1.5 text-cyan-400 font-bold">{r.id}</td>
                        <td className="p-1.5 truncate max-w-[200px]" title={r.description}>
                          {r.description}
                        </td>
                        <td className="p-1.5 capitalize">{r.category}</td>
                        <td className="p-1.5 capitalize">{r.severity}</td>
                        <td className="p-1.5 text-slate-400">
                          {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Parse Errors List */}
          {parseErrors.length > 0 && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Parsing Warnings / Exclusions ({parseErrors.length})</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] text-rose-300/80 max-h-20 overflow-y-auto font-mono">
                {parseErrors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {parseErrors.length > 5 && (
                  <li>...and {parseErrors.length - 5} more issues</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-command-border bg-command-surface/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-command-card hover:bg-slate-800 border border-command-border text-xs font-semibold text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={parsedReports.length === 0 || isProcessing}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-xs font-semibold text-white shadow-glow-cyan transition-all flex items-center gap-2"
          >
            {isProcessing ? 'Ingesting Dataset...' : `Import ${parsedReports.length} Reports`}
          </button>
        </div>
      </div>
    </div>
  );
}
