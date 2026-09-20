import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FleetVehicle } from '@/types';
import { formatMachineryLabel } from '@/lib/formatters';
import { Truck, ArrowUpRight, BatteryCharging, User } from 'lucide-react';
import Link from 'next/link';

interface FleetStatusWidgetProps {
  fleet: FleetVehicle[];
}

export function FleetStatusWidget({ fleet }: FleetStatusWidgetProps) {
  return (
    <Card glow="purple" className="flex flex-col h-full">
      <CardHeader
        title="Fleet Telemetry & Status"
        subtitle="Active collection assets"
        icon={Truck}
        action={
          <Link
            href="/fleet"
            className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Fleet View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <div className="space-y-3 flex-1 overflow-y-auto">
        {fleet.map((vehicle) => {
          const loadPercentage = Math.round((vehicle.currentLoadKg / vehicle.capacityKg) * 100);

          return (
            <div
              key={vehicle.id}
              className="p-3.5 rounded-lg bg-command-surface/70 border border-command-border flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-slate-100">
                    {vehicle.registrationNumber}
                  </div>
                  <div className="text-[11px] text-slate-400">{formatMachineryLabel(vehicle.vehicleType)}</div>
                </div>
                <Badge
                  variant={
                    vehicle.status === 'available'
                      ? 'emerald'
                      : vehicle.status === 'collecting'
                      ? 'amber'
                      : 'purple'
                  }
                  pulse={vehicle.status === 'collecting'}
                >
                  {vehicle.status}
                </Badge>
              </div>

              {/* Load Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Capacity Load</span>
                  <span className="text-slate-200">{vehicle.currentLoadKg} / {vehicle.capacityKg} kg ({loadPercentage}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Driver & Fuel */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-command-border/40">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-purple-400" />
                  <span>{vehicle.driverName}</span>
                </div>
                <div className="flex items-center gap-1 uppercase">
                  <BatteryCharging className="w-3 h-3 text-cyan-400" />
                  <span>{vehicle.fuelType}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
