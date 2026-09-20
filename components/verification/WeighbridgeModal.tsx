'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Printer,
  ShieldAlert,
  Building2,
  FileSpreadsheet,
  Truck,
} from 'lucide-react';
import { DriverManifest, FleetVehicle, WeighbridgeTicket } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatWeight } from '@/lib/formatters';

interface WeighbridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifest: DriverManifest | null;
  vehicle?: FleetVehicle;
  onRecordTicket: (entry: {
    routeId: string;
    manifestId: string;
    vehicleId: string;
    driverName: string;
    operatorName: string;
    grossWeightKg: number;
    tareWeightKg: number;
    disposalFacility?: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string; ticket?: WeighbridgeTicket }>;
}

export function WeighbridgeModal({
  isOpen,
  onClose,
  manifest,
  vehicle,
  onRecordTicket,
}: WeighbridgeModalProps) {
  // Pre-fill typical tare weight based on vehicle capacity/type
  const defaultTare = useMemo(() => {
    if (!vehicle) return 5500;
    switch (vehicle.vehicleType) {
      case 'mini_tipper':
        return 2200;
      case 'hydraulic_compactor':
        return 7200;
      case 'backhoe':
        return 8000;
      default:
        return 6000;
    }
  }, [vehicle]);

  const estimatedDemand = manifest?.estimatedLoadKg || 0;
  const initialGross = defaultTare + (estimatedDemand > 0 ? estimatedDemand : 3000);

  const [grossInput, setGrossInput] = useState<string>(String(initialGross));
  const [tareInput, setTareInput] = useState<string>(String(defaultTare));
  const [operatorName, setOperatorName] = useState('D. K. Patil (Weighbridge Incharge)');
  const [disposalFacility, setDisposalFacility] = useState(
    'Kothrud Ward 12 Material Recovery Facility & Processing Plant'
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordedTicket, setRecordedTicket] = useState<WeighbridgeTicket | null>(null);

  if (!isOpen || !manifest) return null;

  const grossKg = parseFloat(grossInput) || 0;
  const tareKg = parseFloat(tareInput) || 0;
  const netPayloadKg = Math.max(0, Math.round(grossKg - tareKg));
  const varianceKg = netPayloadKg - estimatedDemand;
  const variancePct = estimatedDemand > 0 ? ((varianceKg / estimatedDemand) * 100) : 0;
  const vehicleCapacity = vehicle?.capacityKg || manifest.vehicleCapacityKg || 8000;

  const isOverloaded = netPayloadKg > vehicleCapacity;
  const isHighDiscrepancy = Math.abs(variancePct) > 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (grossKg <= tareKg) {
      setError('Gross scale weight must be greater than empty unladen tare weight.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await onRecordTicket({
        routeId: manifest.routeId,
        manifestId: manifest.manifestId,
        vehicleId: manifest.vehicleId,
        driverName: manifest.driverName,
        operatorName,
        grossWeightKg: grossKg,
        tareWeightKg: tareKg,
        disposalFacility,
        notes: notes.trim(),
      });

      if (!res.success || !res.ticket) {
        setError(res.error || 'Failed to record weighbridge entry.');
        setIsSubmitting(false);
        return;
      }

      setRecordedTicket(res.ticket);
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err?.message || 'Error occurred while saving weighbridge record.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-command-card border border-command-border rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-command-border flex items-center justify-between bg-command-dark/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Municipal Weighbridge Terminal
                <Badge variant="cyan">Official Telemetry Scale</Badge>
              </h2>
              <p className="text-xs text-slate-400">
                Depot check-in, net payload verification & anomaly detection
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

        {recordedTicket ? (
          /* Receipt View after ticket recorded */
          <div className="p-6 space-y-4">
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold text-sm">Weighbridge Scale Ticket Certified</span>
                </div>
                <Badge variant="emerald">{recordedTicket.ticketId}</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Gross Weight:</span>
                  <span className="text-slate-200 font-mono font-medium">
                    {formatWeight(recordedTicket.grossWeightKg)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tare Weight:</span>
                  <span className="text-slate-200 font-mono font-medium">
                    {formatWeight(recordedTicket.tareWeightKg)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Net Payload:</span>
                  <span className="text-emerald-300 font-mono font-bold text-sm">
                    {formatWeight(recordedTicket.netPayloadKg)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">AI Variance:</span>
                  <span
                    className={`font-mono font-medium ${
                      Math.abs(recordedTicket.variancePercentage) > 20 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {recordedTicket.variancePercentage > 0 ? '+' : ''}
                    {recordedTicket.variancePercentage}%
                  </span>
                </div>
              </div>

              <div className="text-xs pt-2 border-t border-emerald-500/20 text-slate-400 flex items-center justify-between">
                <span>Vehicle: <strong className="text-slate-200">{recordedTicket.vehicleId}</strong></span>
                <span>Scale Operator: <strong className="text-slate-200">{recordedTicket.operatorName}</strong></span>
              </div>
            </div>

            <div className="p-3 bg-command-dark/40 border border-command-border/60 rounded-lg text-xs text-slate-400 flex items-center justify-between">
              <span>Route has been marked <strong>COMPLETED</strong> and vehicle capacity reset to 0 kg.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 border border-command-border hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print Scale Ticket
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Operational Meta Strip */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-command-dark/40 border border-command-border rounded-lg text-xs">
              <div>
                <span className="text-slate-500 block">Assigned Vehicle:</span>
                <span className="text-slate-200 font-mono font-medium flex items-center gap-1 mt-0.5">
                  <Truck className="w-3.5 h-3.5 text-cyan-400" />
                  {manifest.vehicleId}
                </span>
                <span className="text-[10px] text-slate-400">Max: {formatWeight(vehicleCapacity)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Driver:</span>
                <span className="text-slate-200 font-medium block mt-0.5 truncate">
                  {manifest.driverName}
                </span>
                <span className="text-[10px] text-slate-400">{manifest.totalStops} Stops Serviced</span>
              </div>
              <div>
                <span className="text-slate-500 block">AI Estimated Demand:</span>
                <span className="text-amber-400 font-mono font-medium block mt-0.5">
                  {formatWeight(estimatedDemand)}
                </span>
                <span className="text-[10px] text-slate-400">Predicted payload</span>
              </div>
            </div>

            {/* Scale Weight Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Gross Scale Weight (kg) <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={grossInput}
                  onChange={(e) => setGrossInput(e.target.value)}
                  placeholder="e.g. 12500"
                  className="w-full bg-command-dark/60 border border-command-border rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Laden vehicle weight at scale
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tare Scale Weight (kg) <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={tareInput}
                  onChange={(e) => setTareInput(e.target.value)}
                  placeholder="e.g. 7000"
                  className="w-full bg-command-dark/60 border border-command-border rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Empty vehicle unladen weight
                </span>
              </div>
            </div>

            {/* Live Computed Metrics & Alerts */}
            <div className="p-4 rounded-xl bg-command-dark/60 border border-command-border space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Computed Net Waste Payload:</span>
                <span className="font-mono text-base font-bold text-cyan-300">
                  {formatWeight(netPayloadKg)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-command-border/50">
                <span className="text-slate-400">Variance against AI Estimate:</span>
                <span
                  className={`font-mono font-semibold ${
                    isOverloaded
                      ? 'text-rose-400'
                      : isHighDiscrepancy
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {varianceKg >= 0 ? '+' : ''}{formatWeight(varianceKg)} ({variancePct >= 0 ? '+' : ''}{variancePct.toFixed(1)}%)
                </span>
              </div>

              {/* Real-time Alert Banner */}
              {isOverloaded ? (
                <div className="p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>
                    <strong>Vehicle Safety Overload!</strong> Net payload ({netPayloadKg} kg) exceeds vehicle rating ({vehicleCapacity} kg).
                  </span>
                </div>
              ) : isHighDiscrepancy ? (
                <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-lg text-xs text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    <strong>High Variance Discrepancy:</strong> Actual weight differs from AI prediction by {Math.abs(variancePct).toFixed(1)}%. Marked for audit review.
                  </span>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>Within Tolerance:</strong> Payload weight corresponds with AI predictions (variance &le; 20%).
                  </span>
                </div>
              )}
            </div>

            {/* Operator & Facility */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Scale Operator Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-command-dark/60 border border-command-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Disposal / Processing Yard
                </label>
                <input
                  type="text"
                  value={disposalFacility}
                  onChange={(e) => setDisposalFacility(e.target.value)}
                  className="w-full bg-command-dark/60 border border-command-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Scale Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Weighbridge Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Wet waste density elevated due to overnight rain..."
                className="w-full bg-command-dark/60 border border-command-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Modal Actions */}
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
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors shadow-lg shadow-cyan-950/50 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Scale className="w-4 h-4" />
                {isSubmitting ? 'Recording Ticket...' : 'Certify Weighbridge Ticket'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
