'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useReports } from '@/lib/reportsContext';
import { OverrideHistory } from '@/components/officer/OverrideHistory';
import { formatMachineryLabel } from '@/lib/formatters';
import { HotspotUrgency } from '@/types';
import {
  ShieldCheck,
  Truck,
  ArrowRightLeft,
  PauseCircle,
  PlayCircle,
  Send,
  XCircle,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  RefreshCw,
  Scale,
  Clock,
  MapPin,
  Flame,
  Wrench,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
} from 'lucide-react';

export default function OfficerPage() {
  const {
    routes,
    fleet,
    hotspots,
    driverManifests,
    officerOverrides,
    applyPriorityOverride,
    reassignVehicle,
    reorderStops,
    holdRoute,
    resumeRoute,
    approveDispatch,
    rejectDispatch,
    generateManifest,
    regenerateManifest,
    isGeneratingManifest,
  } = useReports();

  // State for forms & modals
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || 'ROUTE-01');
  
  // Reassign vehicle state
  const [reassignVehicleId, setReassignVehicleId] = useState<string>('');
  const [reassignReason, setReassignReason] = useState<string>('');
  const [reassignError, setReassignError] = useState<string | null>(null);
  const [reassignSuccess, setReassignSuccess] = useState<string | null>(null);

  // Stop reorder state
  const [reorderedStopsMap, setReorderedStopsMap] = useState<Record<string, string[]>>({});
  const [reorderReason, setReorderReason] = useState<string>('');
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);

  // Hold / Resume state
  const [holdReason, setHoldReason] = useState<string>('');
  const [holdError, setHoldError] = useState<string | null>(null);

  // Dispatch approval/rejection state
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Priority Escalation state
  const [escalatingHotspotId, setEscalatingHotspotId] = useState<string>('HOT-03');
  const [newPriority, setNewPriority] = useState<HotspotUrgency>('critical');
  const [priorityReason, setPriorityReason] = useState<string>(
    'Dry industrial corridor with active chemical and tyre dump fire risk requiring immediate mechanical clearance'
  );
  const [priorityError, setPriorityError] = useState<string | null>(null);
  const [prioritySuccess, setPrioritySuccess] = useState<string | null>(null);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const manifest = selectedRoute ? driverManifests.find((m) => m.routeId === selectedRoute.id) : undefined;
  const activeVehicleId = selectedRoute?.effectiveVehicleId || selectedRoute?.vehicleId;
  const assignedVehicle = fleet.find((v) => v.id === activeVehicleId);
  const activeStops = selectedRoute?.effectiveStops && selectedRoute.effectiveStops.length > 0
    ? selectedRoute.effectiveStops
    : selectedRoute?.stops || [];

  // Reordering helpers
  const currentStopsOrder = reorderedStopsMap[selectedRoute?.id || ''] || activeStops.map((s) => s.hotspotId || s.stopId);

  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentStopsOrder.length) return;
    const updated = [...currentStopsOrder];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setReorderedStopsMap((prev) => ({ ...prev, [selectedRoute.id]: updated }));
  };

  // Handlers
  const handleReassignVehicle = async () => {
    setReassignError(null);
    setReassignSuccess(null);
    if (!reassignVehicleId) {
      setReassignError('Please select a target replacement vehicle from the municipal fleet.');
      return;
    }
    if (!reassignReason.trim()) {
      setReassignError('A mandatory reason is required for vehicle reassignment.');
      return;
    }
    const res = await reassignVehicle(selectedRoute.id, reassignVehicleId, reassignReason);
    if (!res.success) {
      setReassignError(res.error || 'Failed to reassign vehicle.');
    } else {
      setReassignSuccess(`Vehicle successfully reassigned to ${reassignVehicleId}. Existing manifest marked stale.`);
      setReassignReason('');
    }
  };

  const handleReorderStops = async () => {
    setReorderError(null);
    setReorderSuccess(null);
    if (!reorderReason.trim()) {
      setReorderError('A mandatory reason is required for stop sequence reordering.');
      return;
    }
    const res = await reorderStops(selectedRoute.id, currentStopsOrder, reorderReason);
    if (!res.success) {
      setReorderError(res.error || 'Failed to reorder stops.');
    } else {
      setReorderSuccess('Collection sequence successfully updated. Existing manifest marked stale.');
      setReorderReason('');
    }
  };

  const handleHoldRoute = async () => {
    setHoldError(null);
    if (!holdReason.trim()) {
      setHoldError('A mandatory reason is required to place route on hold.');
      return;
    }
    const res = await holdRoute(selectedRoute.id, holdReason);
    if (!res.success) {
      setHoldError(res.error || 'Failed to hold route.');
    } else {
      setHoldReason('');
    }
  };

  const handleResumeRoute = async () => {
    setHoldError(null);
    const res = await resumeRoute(selectedRoute.id);
    if (!res.success) {
      setHoldError(res.error || 'Failed to resume route.');
    }
  };

  const handleApproveDispatch = async () => {
    setDispatchError(null);
    setDispatchSuccess(null);
    if (!manifest) {
      setDispatchError('No driver manifest exists for this route. Generate manifest first.');
      return;
    }
    const res = await approveDispatch(selectedRoute.id, manifest.manifestId);
    if (!res.success) {
      setDispatchError(res.error || 'Failed to approve dispatch.');
    } else {
      setDispatchSuccess(`Route ${selectedRoute.id} and Manifest ${manifest.manifestId} approved and dispatched!`);
    }
  };

  const handleRejectDispatch = async () => {
    setDispatchError(null);
    setDispatchSuccess(null);
    if (!manifest) {
      setDispatchError('No driver manifest exists to reject.');
      return;
    }
    if (!rejectionReason.trim()) {
      setDispatchError('A mandatory rejection reason is required.');
      return;
    }
    const res = await rejectDispatch(selectedRoute.id, manifest.manifestId, rejectionReason);
    if (!res.success) {
      setDispatchError(res.error || 'Failed to reject dispatch.');
    } else {
      setDispatchSuccess(`Dispatch rejected for ${selectedRoute.id}. Route placed on hold.`);
      setRejectionReason('');
    }
  };

  const handlePriorityEscalation = async () => {
    setPriorityError(null);
    setPrioritySuccess(null);
    if (!priorityReason.trim()) {
      setPriorityError('A mandatory justification is required for priority override.');
      return;
    }
    const res = await applyPriorityOverride(escalatingHotspotId, newPriority, priorityReason);
    if (!res.success) {
      setPriorityError(res.error || 'Failed to apply priority override.');
    } else {
      setPrioritySuccess(`Hotspot ${escalatingHotspotId} priority escalated to ${newPriority.toUpperCase()}!`);
    }
  };

  // KPIs
  const totalRoutesCount = routes.length;
  const optimizedCount = routes.filter((r) => !r.operationalStatus || r.operationalStatus === 'optimized').length;
  const reviewedCount = routes.filter((r) => r.operationalStatus === 'officer_reviewed').length;
  const onHoldCount = routes.filter((r) => r.operationalStatus === 'on_hold').length;
  const dispatchedCount = routes.filter((r) => r.operationalStatus === 'dispatched').length;

  return (
    <div className="space-y-6">
      {/* Header & Discretionary Authority Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-command-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              Municipal Officer Operations Console
            </h1>
            <Badge variant="purple">
              Phase 6C • Human-in-the-Loop
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative municipal command layer. Review AI and OR-Tools optimization baseline, execute manual
            discretionary overrides, and authorize field dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-lg bg-command-surface border border-command-border text-purple-300">
            OFFICER: Ward Sanitation Officer (Active)
          </span>
        </div>
      </div>

      {/* Governance Advisory Banner */}
      <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-start gap-3 text-xs text-purple-200">
        <Info className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <strong className="text-purple-300 font-semibold block">
            Baseline Route Preservation Invariant:
          </strong>
          <p className="text-[11px] text-purple-300/80 leading-relaxed font-mono">
            Original OR-Tools CVRP routes and stop sequences remain immutable as the mathematical baseline. Officer
            overrides adjust operational state (<code>effectiveVehicleId</code>, <code>effectiveStops</code>,{' '}
            <code>operationalStatus</code>). All actions require mandatory justification and are permanently recorded in
            the municipal audit log.
          </p>
        </div>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
        <div className="p-3 rounded-xl bg-command-surface/80 border border-command-border">
          <span className="text-[10px] uppercase text-slate-400 block">Total Routes</span>
          <span className="text-xl font-bold text-white">{totalRoutesCount}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">OR-Tools Baseline</span>
        </div>

        <div className="p-3 rounded-xl bg-command-surface/80 border border-command-border">
          <span className="text-[10px] uppercase text-slate-400 block">Pending Review</span>
          <span className="text-xl font-bold text-cyan-400">{optimizedCount}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Awaiting Action</span>
        </div>

        <div className="p-3 rounded-xl bg-command-surface/80 border border-command-border">
          <span className="text-[10px] uppercase text-slate-400 block">Officer Reviewed</span>
          <span className="text-xl font-bold text-amber-400">{reviewedCount}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Modified / Approved</span>
        </div>

        <div className="p-3 rounded-xl bg-command-surface/80 border border-command-border">
          <span className="text-[10px] uppercase text-slate-400 block">Placed On Hold</span>
          <span className={`text-xl font-bold ${onHoldCount > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
            {onHoldCount}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Dispatch Blocked</span>
        </div>

        <div className="p-3 rounded-xl bg-command-surface/80 border border-command-border">
          <span className="text-[10px] uppercase text-slate-400 block">Dispatched</span>
          <span className="text-xl font-bold text-emerald-400">{dispatchedCount}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">En Route / Active</span>
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Route Review & Overrides */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Selector Tab Bar */}
          <div className="flex items-center gap-2 border-b border-command-border pb-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-semibold mr-2">Select Route:</span>
            {routes.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRouteId(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  selectedRouteId === r.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                    : 'bg-command-surface hover:bg-slate-800 text-slate-300 border border-command-border'
                }`}
              >
                <span>{r.id}</span>
                <span className="ml-2 text-[10px] opacity-75">
                  ({(r.operationalStatus || 'optimized').toUpperCase()})
                </span>
              </button>
            ))}
          </div>

          {selectedRoute && (
            <Card glow="purple" className="p-5 space-y-5">
              {/* Route Summary Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-command-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono text-white">{selectedRoute.id}</span>
                    <Badge
                      variant={
                        selectedRoute.operationalStatus === 'dispatched'
                          ? 'emerald'
                          : selectedRoute.operationalStatus === 'on_hold'
                          ? 'rose'
                          : selectedRoute.operationalStatus === 'officer_reviewed'
                          ? 'amber'
                          : 'cyan'
                      }
                    >
                      {(selectedRoute.operationalStatus || 'OPTIMIZED').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Depot: {selectedRoute.depotId} • Engine: {selectedRoute.optimizationEngine}
                  </p>
                </div>

                {/* Road distance & duration summary */}
                <div className="text-right text-xs font-mono">
                  <div className="text-slate-200 font-bold">
                    {selectedRoute.roadDistanceKm !== null ? `${selectedRoute.roadDistanceKm} km (Road)` : `${selectedRoute.totalDistanceKm} km`}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {selectedRoute.roadDurationMinutes !== null
                      ? `~${selectedRoute.roadDurationMinutes} min drive time`
                      : `~${selectedRoute.totalDurationMinutes} min`}
                  </div>
                </div>
              </div>

              {/* Route On Hold Warning Alert */}
              {selectedRoute.operationalStatus === 'on_hold' && (
                <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-start gap-3 text-xs text-rose-200">
                  <PauseCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-rose-300 font-semibold block">Route Is Placed On Hold:</strong>
                    <p className="text-rose-200/90 font-mono mt-0.5">
                      Reason: &ldquo;{selectedRoute.heldReason || 'Suspended by Ward Officer pending inspection.'}&rdquo;
                    </p>
                    <span className="text-[10px] text-rose-300/70 block mt-1">
                      Dispatch is strictly blocked until the route is resumed.
                    </span>
                  </div>
                </div>
              )}

              {/* Vehicle & Capacity Telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-command-dark/80 border border-command-border text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Assigned Vehicle</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm font-bold text-white">{activeVehicleId}</span>
                    {selectedRoute.effectiveVehicleId && (
                      <Badge variant="amber">
                        OVERRIDDEN
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Orig: {selectedRoute.vehicleId} ({formatMachineryLabel(selectedRoute.vehicleType)})
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Assigned Driver</span>
                  <span className="text-sm font-bold text-purple-300 block mt-0.5">
                    {assignedVehicle?.driverName || 'Synthetic Demo Driver'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {assignedVehicle?.driverPhone || 'Verified Staff'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Demand & Capacity</span>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {selectedRoute.totalDemandKg.toLocaleString()} / {(assignedVehicle?.capacityKg || selectedRoute.vehicleCapacityKg).toLocaleString()} kg
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Utilization:{' '}
                    {Math.round(
                      (selectedRoute.totalDemandKg / (assignedVehicle?.capacityKg || selectedRoute.vehicleCapacityKg)) * 100
                    )}%
                  </span>
                </div>
              </div>

              {/* Collection Stops Review & Reordering */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Collection Stops Sequence ({activeStops.length} stops)</span>
                  </h4>
                  {selectedRoute.effectiveStops && (
                    <Badge variant="amber">
                      Sequence Reordered by Officer
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {activeStops.map((stop, index) => {
                    const hotspot = hotspots.find((h) => h.id === stop.hotspotId);
                    const effectiveUrgency = hotspot?.officerPriorityOverride || hotspot?.urgencyLevel || 'medium';

                    return (
                      <div
                        key={stop.stopId || index}
                        className="p-3 rounded-lg bg-command-surface border border-command-border flex items-center justify-between text-xs font-mono hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-xs">
                            {stop.sequence}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-200">{stop.hotspotId || stop.stopId}</span>
                              <span className="text-slate-400 font-sans text-xs">• {stop.addressName}</span>
                              <Badge
                                variant={effectiveUrgency === 'critical' ? 'rose' : effectiveUrgency === 'high' ? 'amber' : 'slate'}
                              >
                                {effectiveUrgency.toUpperCase()}
                              </Badge>
                              {hotspot?.officerPriorityOverride && (
                                <span className="text-[10px] text-amber-400 font-bold">(Officer Override)</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                              <span>Demand: <strong className="text-slate-200">{stop.estimatedDemandKg.toLocaleString()} kg</strong></span>
                              <span>Cumulative: <strong className="text-slate-200">{stop.cumulativeLoadKg.toLocaleString()} kg</strong></span>
                              <span>Remaining Cap: <strong className="text-emerald-400">{stop.remainingVehicleCapacityKg.toLocaleString()} kg</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Sequence reorder buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveStop(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                            title="Move Stop Earlier"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveStop(index, 'down')}
                            disabled={index === activeStops.length - 1}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                            title="Move Stop Later"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Save Reordered Stops Form */}
                <div className="p-3 rounded-lg bg-command-dark/60 border border-command-border/60 space-y-2 text-xs font-mono">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Mandatory reason for stop sequence change (e.g. Traffic blockage on primary arterial)..."
                      value={reorderReason}
                      onChange={(e) => setReorderReason(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={handleReorderStops}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Apply Stop Order</span>
                    </button>
                  </div>
                  {reorderError && <p className="text-rose-400 text-[11px]">{reorderError}</p>}
                  {reorderSuccess && <p className="text-emerald-400 text-[11px]">{reorderSuccess}</p>}
                </div>
              </div>

              {/* Officer Overrides Control Panel */}
              <div className="border-t border-command-border pt-4 space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Manual Discretionary Actions</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Action 1: Vehicle Reassignment */}
                  <div className="p-3.5 rounded-lg bg-command-surface border border-command-border space-y-3">
                    <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Reassign Hauling Vehicle</span>
                    </span>

                    <div className="space-y-2 text-xs font-mono">
                      <label className="text-[10px] uppercase text-slate-400 block">Select Replacement Vehicle:</label>
                      <select
                        value={reassignVehicleId}
                        onChange={(e) => setReassignVehicleId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                      >
                        <option value="">-- Choose Candidate Vehicle --</option>
                        {fleet.map((v) => {
                          const isBackhoe = v.id === 'BACK-01' || v.vehicleType === 'backhoe';
                          const isUnderMaintenance = v.status === 'maintenance' || v.status === 'offline';
                          const isInsufficientCapacity = v.capacityKg < selectedRoute.totalDemandKg;
                          const disabled = isBackhoe || isUnderMaintenance || isInsufficientCapacity;

                          let note = '';
                          if (isBackhoe) note = ' [SPECIALIZED REMEDIATION ONLY]';
                          else if (isUnderMaintenance) note = ' [MAINTENANCE/OFFLINE]';
                          else if (isInsufficientCapacity) note = ` [CAPACITY LOW: ${v.capacityKg} < ${selectedRoute.totalDemandKg} kg]`;

                          return (
                            <option key={v.id} value={v.id} disabled={disabled}>
                              {v.id} - {v.registrationNumber} ({v.capacityKg} kg, {v.status}){note}
                            </option>
                          );
                        })}
                      </select>

                      <input
                        type="text"
                        placeholder="Mandatory justification (e.g. HYD-COMP-02 engine check)..."
                        value={reassignReason}
                        onChange={(e) => setReassignReason(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                      />

                      <button
                        onClick={handleReassignVehicle}
                        className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Confirm Vehicle Reassignment</span>
                      </button>

                      {reassignError && <p className="text-rose-400 text-[11px]">{reassignError}</p>}
                      {reassignSuccess && <p className="text-emerald-400 text-[11px]">{reassignSuccess}</p>}
                    </div>
                  </div>

                  {/* Action 2: Hold or Resume Route */}
                  <div className="p-3.5 rounded-lg bg-command-surface border border-command-border space-y-3">
                    <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                      <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Route Hold / Release Control</span>
                    </span>

                    <div className="space-y-2 text-xs font-mono">
                      {selectedRoute.operationalStatus === 'on_hold' ? (
                        <div className="space-y-2">
                          <p className="text-slate-300 text-xs">
                            This route is currently placed on hold. Resuming will return it to reviewed status and permit dispatch.
                          </p>
                          <button
                            onClick={handleResumeRoute}
                            className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span>Resume Route for Operations</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Mandatory reason for hold (e.g. VIP movement, water pipeline repair)..."
                            value={holdReason}
                            onChange={(e) => setHoldReason(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-rose-500"
                          />
                          <button
                            onClick={handleHoldRoute}
                            className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <PauseCircle className="w-4 h-4" />
                            <span>Place Route On Hold</span>
                          </button>
                        </div>
                      )}
                      {holdError && <p className="text-rose-400 text-[11px]">{holdError}</p>}
                    </div>
                  </div>
                </div>

                {/* Final Dispatch Approval & Rejection Section */}
                <div className="p-4 rounded-xl bg-command-dark/90 border border-command-border space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                        <Send className="w-4 h-4 text-emerald-400" />
                        <span>Dispatch Authorization (Final Human Gate)</span>
                      </span>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Requires valid non-stale manifest, eligible vehicle, and unheld operational status.
                      </p>
                    </div>

                    {manifest ? (
                      <Badge variant={manifest.isStale ? 'amber' : manifest.status === 'dispatched' ? 'emerald' : 'cyan'}>
                        MANIFEST: {manifest.isStale ? 'STALE' : manifest.status.toUpperCase()}
                      </Badge>
                    ) : (
                      <Badge variant="slate">NO MANIFEST GENERATED</Badge>
                    )}
                  </div>

                  {/* Stale Manifest Alert with inline regeneration */}
                  {manifest?.isStale && (
                    <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 flex items-center justify-between gap-3 text-xs text-amber-200 font-mono">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>Manifest is STALE due to route/vehicle modifications. Re-generate before dispatch.</span>
                      </div>
                      <button
                        onClick={() => regenerateManifest(manifest.manifestId)}
                        disabled={isGeneratingManifest}
                        className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors flex-shrink-0 flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${isGeneratingManifest ? 'animate-spin' : ''}`} />
                        <span>Regenerate Now</span>
                      </button>
                    </div>
                  )}

                  {!manifest && (
                    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-between gap-3 text-xs text-slate-300 font-mono">
                      <span>No manifest exists for this route yet. Manifest is required for dispatch.</span>
                      <button
                        onClick={() => generateManifest(selectedRoute.id)}
                        disabled={isGeneratingManifest}
                        className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center gap-1"
                      >
                        <FileCheck className="w-3 h-3" />
                        <span>Generate Manifest</span>
                      </button>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={handleApproveDispatch}
                      disabled={
                        !manifest ||
                        manifest.isStale ||
                        selectedRoute.operationalStatus === 'on_hold' ||
                        selectedRoute.operationalStatus === 'dispatched'
                      }
                      className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                    >
                      <Send className="w-4 h-4" />
                      <span>Approve & Authorize Dispatch</span>
                    </button>

                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Rejection justification..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        disabled={!manifest || selectedRoute.operationalStatus === 'dispatched'}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-rose-500 disabled:opacity-40"
                      />
                      <button
                        onClick={handleRejectDispatch}
                        disabled={!manifest || selectedRoute.operationalStatus === 'dispatched'}
                        className="py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-bold text-xs font-mono transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  {dispatchError && <p className="text-rose-400 text-xs font-mono">{dispatchError}</p>}
                  {dispatchSuccess && <p className="text-emerald-400 text-xs font-mono">{dispatchSuccess}</p>}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right 1 Col: Priority Escalation & Specialized Remediation */}
        <div className="space-y-6">
          {/* Priority Escalation Module */}
          <Card glow="amber" className="p-4 space-y-4">
            <CardHeader
              title="Hotspot Priority Escalation"
              subtitle="Officer Discretionary Urgency Adjustment"
              icon={Flame}
            />

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[10px] uppercase text-slate-400 block mb-1">Target Waste Hotspot:</label>
                <select
                  value={escalatingHotspotId}
                  onChange={(e) => {
                    setEscalatingHotspotId(e.target.value);
                    if (e.target.value === 'HOT-03') {
                      setPriorityReason(
                        'Dry industrial corridor with active chemical and tyre dump fire risk requiring immediate mechanical clearance'
                      );
                    } else if (e.target.value === 'HOT-02') {
                      setPriorityReason('Biomedical waste risk adjacent to public transit hubs');
                    } else {
                      setPriorityReason('High volume construction debris remediation');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                >
                  {hotspots.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.id} - {h.zoneName} ({h.officerPriorityOverride || h.urgencyLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-400 block mb-1">New Urgency Classification:</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as HotspotUrgency)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">CRITICAL (Immediate Evacuation)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-400 block mb-1">Mandatory Municipal Justification:</label>
                <textarea
                  rows={3}
                  value={priorityReason}
                  onChange={(e) => setPriorityReason(e.target.value)}
                  placeholder="Specific physical or public health justification..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                onClick={handlePriorityEscalation}
                className="w-full py-2.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30"
              >
                <Flame className="w-4 h-4" />
                <span>Apply Priority Escalation</span>
              </button>

              {priorityError && <p className="text-rose-400 text-xs">{priorityError}</p>}
              {prioritySuccess && <p className="text-emerald-400 text-xs">{prioritySuccess}</p>}
            </div>
          </Card>

          {/* Specialized Equipment Governance: BACK-01 */}
          <Card glow="purple" className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-mono font-bold uppercase text-white">Specialized Remediation Rule</h3>
            </div>

            <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-800/40 text-xs font-mono text-purple-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300">BACK-01 (Backhoe Loader)</span>
                <Badge variant="purple">Non-Hauling Asset</Badge>
              </div>
              <p className="text-[11px] text-purple-300/80 leading-relaxed font-sans">
                BACK-01 is dedicated earthmoving/demolition remediation equipment. It possesses no volumetric hauling
                capacity and is strictly barred from CVRP hauling route assignments.
              </p>
              <div className="text-[11px] text-slate-300 pt-1 border-t border-purple-800/40">
                <span>Associated Target: </span>
                <strong className="text-amber-400">HOT-01 (5,000 kg Construction Debris)</strong>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Municipal Audit Log Trail */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Immutable Human-in-the-Loop Audit Trail</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {officerOverrides.length} logged overrides this session
          </span>
        </div>

        <OverrideHistory overrides={officerOverrides} />
      </div>
    </div>
  );
}
