'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2, MapPin } from 'lucide-react';
import { WasteReport, Hotspot, FleetVehicle, OptimizedRoute, MunicipalDepot } from '@/types';

interface MapWrapperProps {
  reports?: WasteReport[];
  hotspots?: Hotspot[];
  fleet?: FleetVehicle[];
  routes?: OptimizedRoute[];
  center?: [number, number];
  zoom?: number;
  heightClass?: string;
  activeClusterEngine?: string;
  depot?: MunicipalDepot;
}

// Dynamically import Leaflet map with SSR disabled
const DynamicWasteMap = dynamic(() => import('./WasteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-xl border border-command-border bg-command-card/80 flex flex-col items-center justify-center gap-3">
      <div className="relative flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <MapPin className="w-4 h-4 text-cyan-200 absolute" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-slate-200">Initializing Municipal Geospatial Engine...</p>
        <p className="text-xs text-slate-400 font-mono">Loading OpenStreetMap & Telemetry Layers (EPSG:4326)</p>
      </div>
    </div>
  ),
});

export function MapFoundation(props: MapWrapperProps) {
  return <DynamicWasteMap {...props} />;
}
