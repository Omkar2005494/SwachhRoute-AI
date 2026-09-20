'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Crosshair, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { validateWithinMunicipalBounds } from '@/services/dataProcessing';

export interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
}

// Preset demonstration locations within the synthetic Bengaluru demonstration boundary
const DEMO_PRESET_LOCATIONS = [
  { name: 'Indiranagar 100ft Road', lat: 12.9784, lng: 77.6408 },
  { name: 'Koramangala 4th Block', lat: 12.9352, lng: 77.6245 },
  { name: 'Whitefield Main Road', lat: 12.9698, lng: 77.7499 },
  { name: 'Jayanagar 4th T Block', lat: 12.9250, lng: 77.5938 },
  { name: 'Malleshwaram Circle', lat: 13.0031, lng: 77.5643 },
];

// Inner Leaflet component (client-only)
const DynamicLeafletPicker = dynamic(
  () => import('./InnerLocationPickerMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 rounded-xl border border-command-border bg-command-card/90 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        <span className="text-xs text-slate-400 font-mono">Loading Interactive Location Picker...</span>
      </div>
    ),
  }
);

export function LocationPickerMap({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerProps) {
  const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number';

  // Validate within synthetic demonstration boundary
  const boundaryCheck = hasCoordinates
    ? validateWithinMunicipalBounds(latitude, longitude)
    : null;

  return (
    <div className="space-y-3">
      {/* Action Header: Preset Demo Locations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">
            Geographic Incident Location (EPSG:4326)
          </span>
        </div>

        {/* Demo Preset Dropdown / Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Use Demo Location:
          </span>
          <div className="flex flex-wrap gap-1">
            {DEMO_PRESET_LOCATIONS.map((preset) => {
              const isSelected =
                latitude !== undefined &&
                Math.abs(latitude - preset.lat) < 0.0001 &&
                longitude !== undefined &&
                Math.abs(longitude - preset.lng) < 0.0001;

              return (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => onLocationChange(preset.lat, preset.lng)}
                  className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                    isSelected
                      ? 'bg-cyan-600 text-white font-bold border border-cyan-400'
                      : 'bg-command-surface hover:bg-slate-800 text-slate-300 border border-command-border'
                  }`}
                >
                  {preset.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-command-border">
        <DynamicLeafletPicker
          latitude={latitude}
          longitude={longitude}
          onLocationChange={onLocationChange}
        />
      </div>

      {/* Coordinate & Boundary Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-command-surface/70 border border-command-border text-xs font-mono">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          {hasCoordinates ? (
            <span className="text-slate-200">
              Selected: <strong className="text-cyan-300 font-bold">{latitude?.toFixed(6)}° N</strong>,{' '}
              <strong className="text-cyan-300 font-bold">{longitude?.toFixed(6)}° E</strong>
            </span>
          ) : (
            <span className="text-slate-400 italic">
              Click anywhere on the map above to select incident coordinates.
            </span>
          )}
        </div>

        {boundaryCheck && (
          <div className="flex items-center gap-1.5">
            {boundaryCheck.isWithinBounds ? (
              <Badge variant="emerald" className="text-[10px]">
                <Check className="w-3 h-3 inline mr-1" />
                Valid Service Envelope
              </Badge>
            ) : (
              <Badge variant="rose" className="text-[10px]">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                Outside Service Envelope
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
