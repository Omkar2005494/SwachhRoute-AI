'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useReports } from '@/lib/reportsContext';
import { formatMachineryLabel } from '@/lib/formatters';
import {
  Truck,
  BatteryCharging,
  User,
  Phone,
  MapPin,
  Gauge,
  CheckCircle2,
  AlertCircle,
  Wrench,
  ShieldAlert,
  Building,
} from 'lucide-react';
import Link from 'next/link';

export default function FleetPage() {
  const { fleet, routes } = useReports();
  const [filter, setFilter] = useState<'all' | 'dispatchable' | 'assigned' | 'unavailable'>('all');

  const dispatchableCount = fleet.filter((v) => v.status === 'available' && v.availableForDispatch).length;
  const assignedCount = fleet.filter((v) => v.status === 'assigned').length;
  const totalCapacityKg = fleet.reduce((sum, v) => sum + v.capacityKg, 0);
  const totalCurrentLoadKg = fleet.reduce((sum, v) => sum + v.currentLoadKg, 0);
  const totalAvailableCapacityKg = Math.max(0, totalCapacityKg - totalCurrentLoadKg);

  const filteredFleet = fleet.filter((vehicle) => {
    if (filter === 'dispatchable') return vehicle.availableForDispatch && vehicle.status === 'available';
    if (filter === 'assigned') return vehicle.status === 'assigned';
    if (filter === 'unavailable') return !vehicle.availableForDispatch || vehicle.status === 'maintenance' || vehicle.status === 'offline';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-command-border/60">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-400" />
            Municipal Fleet Command & Capacity Overview
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time payload capacity, dispatch availability, and OR-Tools CVRP assignment telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="emerald" pulse>
            {dispatchableCount} / {fleet.length} Available for Dispatch
          </Badge>
          <span className="text-xs font-mono text-slate-400 px-2.5 py-1 bg-command-surface rounded border border-command-border">
            Depot: DEPOT-BLR-01
          </span>
        </div>
      </div>

      {/* Fleet Capacity Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-command-surface/70 border border-command-border space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Total Hauling Capacity</span>
          <p className="text-xl font-bold text-white font-mono">{(totalCapacityKg / 1000).toFixed(1)} T</p>
          <p className="text-[10px] text-slate-500 font-mono">{totalCapacityKg.toLocaleString()} kg fleet maximum</p>
        </div>

        <div className="p-4 rounded-xl bg-command-surface/70 border border-command-border space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Current Allocated Payload</span>
          <p className="text-xl font-bold text-cyan-400 font-mono">{(totalCurrentLoadKg / 1000).toFixed(2)} T</p>
          <p className="text-[10px] text-slate-500 font-mono">{totalCurrentLoadKg.toLocaleString()} kg in active transit</p>
        </div>

        <div className="p-4 rounded-xl bg-command-surface/70 border border-command-border space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Remaining Fleet Capacity</span>
          <p className="text-xl font-bold text-emerald-400 font-mono">{(totalAvailableCapacityKg / 1000).toFixed(2)} T</p>
          <p className="text-[10px] text-slate-500 font-mono">{totalAvailableCapacityKg.toLocaleString()} kg reserve headroom</p>
        </div>

        <div className="p-4 rounded-xl bg-command-surface/70 border border-command-border space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Active Dispatched Routes</span>
          <p className="text-xl font-bold text-purple-400 font-mono">{assignedCount} / {fleet.length}</p>
          <p className="text-[10px] text-slate-500 font-mono">{routes.length} total CVRP routes solved</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-command-border/40 pb-2 text-xs font-mono">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-purple-950/70 text-purple-300 border border-purple-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Fleet ({fleet.length})
        </button>
        <button
          onClick={() => setFilter('dispatchable')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'dispatchable'
              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dispatchable ({fleet.filter((v) => v.availableForDispatch && v.status === 'available').length})
        </button>
        <button
          onClick={() => setFilter('assigned')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'assigned'
              ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Assigned Routes ({assignedCount})
        </button>
        <button
          onClick={() => setFilter('unavailable')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'unavailable'
              ? 'bg-rose-950/70 text-rose-300 border border-rose-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Support / Maintenance ({fleet.filter((v) => !v.availableForDispatch || v.status === 'maintenance' || v.status === 'offline').length})
        </button>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredFleet.map((vehicle) => {
          const loadPercentage =
            vehicle.capacityKg > 0 ? Math.round((vehicle.currentLoadKg / vehicle.capacityKg) * 100) : 0;
          const availableCapacityKg = Math.max(0, vehicle.capacityKg - vehicle.currentLoadKg);

          return (
            <Card key={vehicle.id} glow="purple" className="flex flex-col justify-between">
              <div className="space-y-4">
                {/* Vehicle Header & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-purple-400 font-bold">{vehicle.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {vehicle.registrationNumber}
                    </span>
                  </div>

                  <Badge
                    variant={
                      vehicle.status === 'available'
                        ? 'emerald'
                        : vehicle.status === 'assigned'
                        ? 'cyan'
                        : vehicle.status === 'collecting'
                        ? 'amber'
                        : 'rose'
                    }
                  >
                    {vehicle.status}
                  </Badge>
                </div>

                {/* Machinery Type & Role */}
                <div>
                  <h3 className="text-base font-bold text-white">
                    {formatMachineryLabel(vehicle.vehicleType)}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Building className="w-3 h-3 text-slate-500" />
                    <span>Depot: {vehicle.depotId}</span>
                  </p>
                </div>

                {/* Dispatch Availability Badge */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  {vehicle.availableForDispatch ? (
                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Available for Dispatch
                    </span>
                  ) : vehicle.vehicleType === 'backhoe' ? (
                    <span className="flex items-center gap-1 text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded text-[11px]">
                      <Wrench className="w-3 h-3" />
                      Operational Remediation Asset (No CVRP Hauling)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-400 bg-rose-950/40 border border-rose-500/30 px-2 py-0.5 rounded text-[11px]">
                      <ShieldAlert className="w-3 h-3" />
                      Maintenance / Offline
                    </span>
                  )}
                </div>

                {/* Visual Capacity Meter */}
                {vehicle.capacityKg > 0 ? (
                  <div className="p-3.5 rounded-lg bg-command-surface/70 border border-command-border space-y-2.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                        Payload Capacity:
                      </span>
                      <span className="text-slate-200 font-bold">
                        {vehicle.currentLoadKg.toLocaleString()} / {vehicle.capacityKg.toLocaleString()} kg ({loadPercentage}%)
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          loadPercentage > 90
                            ? 'bg-rose-500'
                            : loadPercentage > 60
                            ? 'bg-amber-500'
                            : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                        }`}
                        style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-0.5 border-t border-command-border/40">
                      <span>Available: <strong className="text-emerald-400">{availableCapacityKg.toLocaleString()} kg</strong></span>
                      <span>Max: {vehicle.capacityKg.toLocaleString()} kg</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-command-border text-xs text-slate-400 font-mono">
                    Non-hauling specialized machinery. Surfaced for heavy debris remediation at hotspots.
                  </div>
                )}

                {/* Assigned Route Link */}
                {vehicle.assignedRouteId && (
                  <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs">
                    <span className="text-slate-300">Assigned Route:</span>
                    <Link
                      href="/routes"
                      className="font-mono font-bold text-cyan-400 hover:text-cyan-300 underline transition-colors"
                    >
                      {vehicle.assignedRouteId}
                    </Link>
                  </div>
                )}

                {/* Driver & Telemetry Details */}
                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Driver: <strong className="text-slate-200">{vehicle.driverName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-slate-400 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{vehicle.driverPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-slate-400 text-[11px]">
                    <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="uppercase">Fuel: {vehicle.fuelType}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-command-border/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  {vehicle.currentLocation[0]}, {vehicle.currentLocation[1]}
                </span>
                <span className="text-slate-500">EPSG:4326</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
