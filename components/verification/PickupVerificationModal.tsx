'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  MapPin,
  Scale,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { ManifestStop, PickupVerificationStatus, WasteCategory } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatWeight } from '@/lib/formatters';

interface PickupVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifestId: string;
  stop: ManifestStop | null;
  driverName?: string;
  onVerify: (
    manifestId: string,
    hotspotId: string,
    data: {
      status: PickupVerificationStatus;
      actualWasteCategory?: WasteCategory;
      actualEstimatedKg?: number;
      driverNotes?: string;
      driverName?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
}

const CATEGORIES: { value: WasteCategory; label: string }[] = [
  { value: 'household', label: 'Household Waste' },
  { value: 'commercial', label: 'Commercial Waste' },
  { value: 'organic', label: 'Wet / Organic Bio-waste' },
  { value: 'plastic', label: 'Dry / Plastic Waste' },
  { value: 'construction_debris', label: 'Construction & Demolition (C&D)' },
  { value: 'hazardous', label: 'Hazardous / Biomedical' },
  { value: 'electronic', label: 'E-Waste' },
  { value: 'mixed', label: 'Mixed Unsegregated' },
];

export function PickupVerificationModal({
  isOpen,
  onClose,
  manifestId,
  stop,
  driverName = 'Field Driver',
  onVerify,
}: PickupVerificationModalProps) {
  const [status, setStatus] = useState<PickupVerificationStatus>('collected');
  const [category, setCategory] = useState<WasteCategory>(stop?.dominantCategory || 'household');
  const [notes, setNotes] = useState('');
  const [signerName, setSignerName] = useState(driverName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !stop) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await onVerify(manifestId, stop.hotspotId, {
        status,
        actualWasteCategory: category,
        driverNotes: notes.trim(),
        driverName: signerName.trim() || driverName,
      });

      if (!res.success) {
        setError(res.error || 'Failed to submit digital pickup verification.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during verification.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-command-card border border-command-border rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-command-border flex items-center justify-between bg-command-dark/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Digital Pickup Sign-Off
                <Badge variant="emerald">Stop #{stop.sequence}</Badge>
              </h2>
              <p className="text-xs text-slate-400">
                Driver verification & chain-of-custody confirmation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stop Summary Card */}
        <div className="p-4 mx-6 mt-4 rounded-lg bg-command-dark/40 border border-command-border/70 space-y-2.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-sm font-medium text-slate-200">{stop.zoneName}</span>
            </div>
            <span className="text-xs font-mono text-slate-400">{stop.hotspotId}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-command-border/40 text-xs">
            <div>
              <span className="text-slate-500 block">AI Estimated Demand:</span>
              <span className="text-slate-200 font-mono font-medium flex items-center gap-1 mt-0.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                {formatWeight(stop.estimatedDemandKg)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Expected Waste Category:</span>
              <span className="text-slate-200 capitalize font-medium block mt-0.5">
                {stop.dominantCategory.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Collection Status */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Field Collection Status <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'collected', label: 'Fully Collected', icon: CheckCircle2, color: 'text-emerald-400' },
                { id: 'partially_collected', label: 'Partially Cleared', icon: Clock, color: 'text-amber-400' },
                { id: 'inaccessible', label: 'Site Inaccessible', icon: AlertTriangle, color: 'text-rose-400' },
                { id: 'already_cleared', label: 'Already Cleared', icon: ShieldCheck, color: 'text-cyan-400' },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = status === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setStatus(opt.id as PickupVerificationStatus)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-command-hover border-cyan-500/50 text-slate-100 ring-1 ring-cyan-500/30'
                        : 'bg-command-dark/40 border-command-border text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${opt.color}`} />
                    <span className="font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verified Waste Category */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Confirmed Waste Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as WasteCategory)}
              className="w-full bg-command-dark/60 border border-command-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Driver Field Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Field Notes / Access Conditions (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared 100% of roadside heap, gate unlocked by shopkeeper..."
              className="w-full bg-command-dark/60 border border-command-border rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Signer Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Driver / Supervisor Sign-Off Name
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full bg-command-dark/60 border border-command-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-command-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 disabled:opacity-50"
            >
              <FileCheck2 className="w-4 h-4" />
              {isSubmitting ? 'Recording Sign-Off...' : 'Submit Pickup Sign-Off'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
