'use client';

import React, { useState } from 'react';
import { X, Send, AlertTriangle, CheckCircle2, FileText, Tag, User, Sparkles, MapPin } from 'lucide-react';
import { WasteCategory, ReportSource, WasteReport } from '@/types';
import { LocationPickerMap } from './LocationPickerMap';
import { VoiceInputControl } from './VoiceInputControl';
import { PhotoUploadControl } from './PhotoUploadControl';
import { useReports } from '@/lib/reportsContext';
import { Badge } from '@/components/ui/Badge';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_COMPLAINTS = [
  'Ghar ke paas thode dry wrappers aur plastic bottles pade hain.',
  'Yaha 3 din se kachra pada hai aur bahut smell aa rahi hai.',
  'Nala kachre se poora block ho gaya hai, paani overflow hone ka khatra hai.',
  'Hospital ke peeche used syringes aur biomedical waste phenka hua hai.',
  'Road pe bohot bada construction concrete debris pada hai, rasta band hai.',
];

const CATEGORIES: WasteCategory[] = [
  'household',
  'commercial',
  'construction_debris',
  'organic',
  'plastic',
  'hazardous',
  'electronic',
  'mixed',
];

export function CreateReportModal({ isOpen, onClose }: CreateReportModalProps) {
  const { addReport } = useReports();

  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(12.9784); // Default to synthetic Indiranagar
  const [longitude, setLongitude] = useState<number | undefined>(77.6408);
  const [category, setCategory] = useState<WasteCategory>('household');
  const [source, setSource] = useState<ReportSource>('citizen_web');
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [hasAudio, setHasAudio] = useState<boolean>(false);

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submittedReport, setSubmittedReport] = useState<WasteReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleVoiceTranscript = (transcriptChunk: string) => {
    setDescription((prev) => (prev ? `${prev} ${transcriptChunk}` : transcriptChunk));
    setHasAudio(true);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setFormErrors([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setIsSubmitting(true);

    if (!latitude || !longitude) {
      setFormErrors(['Please select an incident location on the map.']);
      setIsSubmitting(false);
      return;
    }

    const result = addReport({
      description,
      latitude,
      longitude,
      category,
      source,
      photo,
      audio: hasAudio ? 'Audio recording transcript captured via Web Speech API' : undefined,
    });

    setIsSubmitting(false);

    if (result.success && result.report) {
      setSubmittedReport(result.report);
    } else if (result.errors) {
      setFormErrors(result.errors);
    }
  };

  const handleResetAndClose = () => {
    setDescription('');
    setLatitude(12.9784);
    setLongitude(77.6408);
    setCategory('household');
    setPhoto(undefined);
    setHasAudio(false);
    setFormErrors([]);
    setSubmittedReport(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-command-darkest border border-command-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-command-dark border-b border-command-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                File Municipal Waste Report
              </h3>
              <p className="text-xs text-slate-400">
                Phase 2: Multi-Modal Citizen & Field Officer Data Collection
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-command-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {submittedReport ? (
            /* Success View */
            <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">Report Successfully Filed</h4>
                <p className="text-xs text-slate-300 font-mono">
                  Report ID: <span className="text-cyan-400 font-bold">{submittedReport.id}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-command-dark/80 border border-command-border text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="text-slate-200">{submittedReport.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coordinates (EPSG:4326):</span>
                  <span className="text-cyan-300">{submittedReport.latitude.toFixed(6)}° N, {submittedReport.longitude.toFixed(6)}° E</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">AI Intelligence Status:</span>
                  <Badge variant="purple">Pending AI Analysis</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-bold uppercase">{submittedReport.status}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                The report has been added to the operational dataset with immediate client-side synchronization.
              </p>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedReport(null);
                    setDescription('');
                    setPhoto(undefined);
                  }}
                  className="px-4 py-2 rounded-lg bg-command-surface hover:bg-slate-800 text-xs font-mono text-slate-300 border border-command-border transition-colors"
                >
                  File Another Report
                </button>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-glow-cyan transition-all"
                >
                  View in Operational Feed
                </button>
              </div>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category and Source Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Initial Waste Category</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WasteCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-command-surface border border-command-border text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span>Reporting Source</span>
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as ReportSource)}
                    className="w-full px-3 py-2 rounded-lg bg-command-surface border border-command-border text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                  >
                    <option value="citizen_web">Citizen Web Portal</option>
                    <option value="citizen_app">Citizen Mobile Application</option>
                    <option value="field_officer">Municipal Field Inspector</option>
                  </select>
                </div>
              </div>

              {/* Complaint Description & Quick Fill */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Complaint Description</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    Min 5 characters &bull; Raw text preserved
                  </span>
                </div>

                {/* Quick-fill Hinglish/English urban complaints */}
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Quick Fill Sample Scenarios:
                  </span>
                  <div className="flex flex-col sm:flex-row gap-1.5">
                    {QUICK_COMPLAINTS.map((sample, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setDescription(sample)}
                        className="text-left text-[11px] p-2 rounded bg-command-surface/80 hover:bg-command-surface border border-command-border/60 text-slate-300 hover:text-cyan-200 transition-colors line-clamp-1"
                      >
                        &ldquo;{sample}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the waste situation, landmark details, odor, blockage risk, etc..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-command-surface/90 border border-command-border text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-sans"
                />

                {/* Voice Input Integration */}
                <VoiceInputControl onTranscriptChange={handleVoiceTranscript} />
              </div>

              {/* Interactive Location Picker Map */}
              <LocationPickerMap
                latitude={latitude}
                longitude={longitude}
                onLocationChange={handleLocationSelect}
              />

              {/* Photo Upload Preview Control */}
              <PhotoUploadControl photo={photo} onPhotoChange={setPhoto} />

              {/* Form Validation Errors Display */}
              {formErrors.length > 0 && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 space-y-1">
                  {formErrors.map((err, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-rose-300 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-command-border/60">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-lg bg-command-surface hover:bg-slate-800 text-xs font-mono text-slate-300 border border-command-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-glow-cyan transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Processing...' : 'Submit Waste Report'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
