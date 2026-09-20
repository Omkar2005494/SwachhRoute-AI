'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WasteReport, Hotspot, FleetVehicle, OptimizedRoute, MunicipalDepot } from '@/types';
import { DEMONSTRATION_DEPOT } from '@/data/demo';
import { formatCategoryLabel, formatHazardLabel, formatMachineryLabel } from '@/lib/formatters';
import { Layers, Eye, EyeOff, MapPin, Truck, Flame, Navigation, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

// Helper to create glowing DivIcons for command-center aesthetic
function createCustomIcon(colorClass: string, symbol: string, label?: string) {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background: ${colorClass};
        min-width: 28px;
        height: 28px;
        padding: 0 6px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 11px;
        font-family: monospace;
        border: 2px solid white;
        box-shadow: 0 0 14px ${colorClass};
        white-space: nowrap;
        gap: 3px;
      ">
        <span>${symbol}</span>
        ${label ? `<span>${label}</span>` : ''}
      </div>
    `,
    iconSize: [32, 28],
    iconAnchor: [16, 14],
    popupAnchor: [0, -14],
  });
}

const depotIcon = L.divIcon({
  className: 'depot-div-icon',
  html: `
    <div style="
      background: #0ea5e9;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 11px;
      border: 2px solid #ffffff;
      box-shadow: 0 0 16px #0ea5e9;
    ">
      DEPOT
    </div>
  `,
  iconSize: [36, 32],
  iconAnchor: [18, 16],
  popupAnchor: [0, -16],
});

function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center[0], center[1], zoom, map]);
  return null;
}

interface WasteMapProps {
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

export default function WasteMap({
  reports = [],
  hotspots = [],
  fleet = [],
  routes = [],
  center,
  zoom = 12,
  heightClass = 'h-[520px]',
  activeClusterEngine = 'Python / Scikit-learn DBSCAN',
  depot,
}: WasteMapProps) {
  const effectiveDepot = depot || DEMONSTRATION_DEPOT;
  const effectiveCenter: [number, number] = center || effectiveDepot.coordinates;

  const [showReports, setShowReports] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showFleet, setShowFleet] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  return (
    <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-command-border shadow-card`}>
      {/* Map Layer Control Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-command-darkest/95 backdrop-blur-md border border-command-border rounded-lg p-2.5 shadow-lg flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-300 pb-1 border-b border-command-border">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>LAYER CONTROLS</span>
        </div>

        <div className="flex flex-col gap-1 text-xs">
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`flex items-center justify-between gap-3 px-2 py-1 rounded transition-colors ${
              showHotspots ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-amber-400" />
              Hotspots ({hotspots.length})
            </span>
            {showHotspots ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>

          <button
            onClick={() => setShowReports(!showReports)}
            className={`flex items-center justify-between gap-3 px-2 py-1 rounded transition-colors ${
              showReports ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-cyan-400" />
              Reports ({reports.length})
            </span>
            {showReports ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>

          <button
            onClick={() => setShowFleet(!showFleet)}
            className={`flex items-center justify-between gap-3 px-2 py-1 rounded transition-colors ${
              showFleet ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Truck className="w-3 h-3 text-purple-400" />
              Fleet ({fleet.length})
            </span>
            {showFleet ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>

          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`flex items-center justify-between gap-3 px-2 py-1 rounded transition-colors ${
              showRoutes ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3 h-3 text-emerald-400" />
              Routes ({routes.length})
            </span>
            {showRoutes ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Geospatial Coordinate & Engine Attribution Banner */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-command-darkest/95 backdrop-blur-md border border-command-border rounded px-3 py-1.5 text-[10px] font-mono text-slate-300 flex flex-col gap-0.5 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold">VIEW: EPSG:4326</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-semibold">DBSCAN: ε=180m, MinPts=3</span>
          <span className="text-slate-600">|</span>
          <span className={routes.some((r) => r.routingEngine === 'osrm' && r.roadGeometry) ? 'text-emerald-300 font-semibold' : 'text-purple-300 font-medium'}>
            {routes.some((r) => r.routingEngine === 'osrm' && r.roadGeometry)
              ? 'OSRM Road-Aware Route'
              : 'Geometric Optimization Preview'}
          </span>
        </div>
        <div className="text-[9px] text-slate-400">
          {routes.some((r) => r.routingEngine === 'osrm' && r.roadGeometry)
            ? 'Road-network geometry from OpenStreetMap/OSRM'
            : 'Road routing unavailable — geometric optimization preview'}
        </div>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={effectiveCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapViewController center={effectiveCenter} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-tile-filter"
        />

        {/* Central Municipal Depot */}
        <Marker position={effectiveDepot.coordinates} icon={depotIcon}>
          <Popup className="custom-popup">
            <div className="p-1.5 space-y-1 min-w-[210px]">
              <div className="flex items-center justify-between pb-1 border-b border-command-border">
                <span className="font-bold text-xs text-blue-400 font-mono">{effectiveDepot.id}</span>
                <Badge variant="cyan">Central Hub</Badge>
              </div>
              <div className="text-xs font-semibold text-slate-100">{effectiveDepot.name}</div>
              <div className="text-[10px] text-slate-400">{effectiveDepot.address}</div>
              <div className="text-[9px] text-amber-400/90 pt-1 border-t border-command-border/40 font-mono">
                {effectiveDepot.label}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Hotspot Clusters & Convex Hulls */}
        {showHotspots &&
          hotspots.map((hotspot) => {
            const isCritical = hotspot.urgencyLevel === 'critical';
            const color = isCritical ? '#f43f5e' : '#f59e0b';
            const isOperationalBuffer = hotspot.geometryType === 'operational_buffer';

            return (
              <React.Fragment key={hotspot.id}>
                {/* Convex Hull Bounding Polygon */}
                {hotspot.boundingPolygon && hotspot.boundingPolygon.length >= 3 && (
                  <Polygon
                    positions={hotspot.boundingPolygon}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: isOperationalBuffer ? 0.18 : 0.28,
                      weight: isOperationalBuffer ? 1.8 : 2.2,
                      dashArray: isOperationalBuffer ? '6, 6' : '4, 4',
                    }}
                  />
                )}

                {/* Hotspot Center Marker */}
                <Marker
                  position={hotspot.centerCoordinates}
                  icon={createCustomIcon(color, '🔥', hotspot.id)}
                >
                  <Popup className="custom-popup">
                    <div className="p-1.5 space-y-2 min-w-[220px]">
                      <div className="flex items-center justify-between pb-1 border-b border-command-border">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-white">{hotspot.id}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 rounded text-slate-300">
                            Cluster #{hotspot.clusterLabel}
                          </span>
                        </div>
                        <Badge variant={isCritical ? 'rose' : 'amber'} pulse={isCritical}>
                          {hotspot.urgencyLevel}
                        </Badge>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-slate-100">{hotspot.zoneName}</div>
                        <div className="text-[10px] text-slate-400">
                          Clustered Reports: <span className="text-cyan-400 font-bold font-mono">{hotspot.reportCount || hotspot.reportIds.length}</span>
                        </div>
                      </div>

                      <div className="p-2 rounded bg-command-surface/90 border border-command-border space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Estimated Clustered Waste:</span>
                          <span className="text-cyan-400 font-bold">{hotspot.totalEstimatedWasteKg} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Severity Score:</span>
                          <span className="text-amber-400 font-bold">{hotspot.severityScore}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Average Severity:</span>
                          <span className="text-slate-200">{hotspot.averageSeverity}/10</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-[10px]">
                        <div>
                          <span className="text-slate-400">Category: </span>
                          <span className="text-slate-200 font-medium">
                            {formatCategoryLabel(hotspot.dominantCategory || hotspot.dominantWasteCategory)}
                          </span>
                        </div>
                        {hotspot.dominantHazard && hotspot.dominantHazard !== 'none_identified' && (
                          <div>
                            <span className="text-slate-400">Hazard: </span>
                            <span className="text-rose-400 font-bold">
                              {formatHazardLabel(hotspot.dominantHazard)}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-400">Recommended Fleet: </span>
                          <span className="text-purple-300 font-medium">
                            {hotspot.recommendedMachinery.map(formatMachineryLabel).join(', ')}
                          </span>
                        </div>
                        <div className="pt-1 text-[9px] text-slate-500 font-mono">
                          Boundary: {isOperationalBuffer ? '35m Operational Buffer (Collinear Protection)' : 'Convex Hull Envelope'}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

        {/* Individual Citizen Reports */}
        {showReports &&
          reports.map((report) => {
            const isClustered = Boolean(report.hotspotId);
            const circleColor = isClustered ? '#06b6d4' : '#64748b';
            const fillColor = isClustered ? '#22d3ee' : '#94a3b8';

            return (
              <CircleMarker
                key={report.id}
                center={[report.latitude, report.longitude]}
                radius={isClustered ? 6 : 5}
                pathOptions={{
                  color: circleColor,
                  fillColor: fillColor,
                  fillOpacity: isClustered ? 0.9 : 0.6,
                  weight: 2,
                  dashArray: isClustered ? undefined : '2, 3',
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-1 space-y-1 min-w-[190px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-cyan-400 font-bold">{report.id}</span>
                      <Badge variant={isClustered ? 'cyan' : 'slate'}>
                        {isClustered ? report.hotspotId : 'Noise Outlier'}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-200 line-clamp-2">{report.description}</div>
                    <div className="text-[10px] text-slate-400">
                      AI-Est. Waste: <span className="text-slate-200 font-mono font-semibold">{report.estimatedWasteKg} kg</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Category: <span className="text-slate-300">{formatCategoryLabel(report.category)}</span>
                    </div>
                    {report.wardName && (
                      <div className="text-[10px] text-slate-500 font-mono">{report.wardName}</div>
                    )}
                    <div className="text-[9px] text-slate-500 pt-0.5 border-t border-command-border/40 font-mono">
                      {isClustered ? `Clustered into ${report.hotspotId} (DBSCAN)` : 'Isolated report (< 3 within 180m)'}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* Fleet Vehicle Telemetry */}
        {showFleet &&
          fleet.map((vehicle) => (
            <Marker
              key={vehicle.id}
              position={vehicle.currentLocation}
              icon={createCustomIcon('#8b5cf6', '🚛', vehicle.registrationNumber.slice(-4))}
            >
              <Popup className="custom-popup">
                <div className="p-1 space-y-1 min-w-[190px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-purple-400">{vehicle.registrationNumber}</span>
                    <Badge variant="purple">{vehicle.status}</Badge>
                  </div>
                  <div className="text-xs text-slate-200">{formatMachineryLabel(vehicle.vehicleType)}</div>
                  <div className="text-[11px] text-slate-300">
                    Driver: {vehicle.driverName} ({vehicle.driverPhone})
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Payload: {vehicle.currentLoadKg.toLocaleString()} / {vehicle.capacityKg.toLocaleString()} kg
                  </div>
                  <div className="text-[9px] text-cyan-400 font-mono">
                    {vehicle.availableForDispatch ? '• Available for Dispatch' : '• Reserved / Offline'}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Optimized Routes (OSRM Road-Aware or OR-Tools Geometric Preview) */}
        {showRoutes &&
          routes.map((route, rIdx) => {
            const routeColors = ['#10b981', '#06b6d4', '#a855f7', '#f59e0b'];
            const strokeColor = routeColors[rIdx % routeColors.length];
            const isRoadRouting = route.routingEngine === 'osrm' && Boolean(route.roadGeometry && route.roadGeometry.length > 0);
            const polylinePositions = isRoadRouting ? route.roadGeometry! : (route.polylineCoordinates || []);

            return (
              <React.Fragment key={route.id}>
                {polylinePositions.length > 0 && (
                  <Polyline
                    positions={polylinePositions}
                    pathOptions={{
                      color: strokeColor,
                      weight: isRoadRouting ? 4.5 : 3.5,
                      opacity: isRoadRouting ? 0.9 : 0.85,
                      dashArray: isRoadRouting ? undefined : '8, 8',
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-1 space-y-1 min-w-[230px]">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-emerald-400">{route.id}</span>
                          <Badge variant={isRoadRouting ? 'emerald' : 'amber'}>
                            {isRoadRouting ? 'OSRM Road-Network' : 'Geometric Fallback'}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-200">
                          Vehicle: <span className="font-mono font-bold text-cyan-300">{route.vehicleId}</span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Total Load: <span className="font-mono text-slate-100 font-semibold">{route.totalDemandKg.toLocaleString()} kg</span> ({route.stops.length} stops)
                        </div>
                        {isRoadRouting ? (
                          <>
                            <div className="text-[11px] text-emerald-300">
                              OSRM Road Distance: <span className="font-mono text-white font-bold">{route.roadDistanceKm} km</span> ({route.roadDistanceMeters?.toLocaleString()} m)
                            </div>
                            <div className="text-[11px] text-cyan-300">
                              OSRM Est. Travel Duration: <span className="font-mono text-white font-bold">~{route.roadDurationMinutes} mins</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Geometric Optimization Distance: {route.totalDistanceKm} km
                            </div>
                          </>
                        ) : (
                          <div className="text-[11px] text-slate-300">
                            Geometric Distance: <span className="font-mono text-slate-100 font-semibold">{route.totalDistanceKm} km</span> ({route.totalDistanceMeters.toLocaleString()} m)
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          Remaining Capacity: {route.remainingCapacityKg.toLocaleString()} kg
                        </div>
                        <div className="text-[9px] text-slate-400 pt-1 border-t border-command-border/40 font-mono">
                          {isRoadRouting
                            ? 'Road-network geometry via OSRM & OpenStreetMap'
                            : 'Geometric Optimization Preview — Road Routing Fallback/Unavailable'}
                        </div>
                      </div>
                    </Popup>
                  </Polyline>
                )}

                {/* Numbered Stop Markers along the Route */}
                {route.stops.map((stop) => (
                  <Marker
                    key={`${route.id}-stop-${stop.sequence}`}
                    position={stop.location}
                    icon={L.divIcon({
                      className: 'stop-seq-icon',
                      html: `
                        <div style="
                          background: #10b981;
                          width: 22px;
                          height: 22px;
                          border-radius: 50%;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: #022c22;
                          font-weight: 800;
                          font-size: 11px;
                          font-family: monospace;
                          border: 2px solid #ffffff;
                          box-shadow: 0 0 10px rgba(16, 185, 129, 0.9);
                        ">
                          ${stop.sequence}
                        </div>
                      `,
                      iconSize: [22, 22],
                      iconAnchor: [11, 11],
                      popupAnchor: [0, -11],
                    })}
                  >
                    <Popup className="custom-popup">
                      <div className="p-1 space-y-1 min-w-[200px]">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            Stop #{stop.sequence}
                          </span>
                          <Badge variant="cyan">{stop.hotspotId}</Badge>
                        </div>
                        <div className="text-xs text-slate-200">
                          {stop.addressName}
                        </div>
                        <div className="text-xs text-slate-300">
                          Vehicle: <span className="font-mono font-bold text-cyan-300">{route.vehicleId}</span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Collection Demand: <span className="font-mono text-white font-bold">{stop.estimatedDemandKg.toLocaleString()} kg</span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Cumulative Route Load: <span className="font-mono text-amber-300 font-semibold">{stop.cumulativeLoadKg.toLocaleString()} kg</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Remaining Capacity: {stop.remainingVehicleCapacityKg.toLocaleString()} kg
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </React.Fragment>
            );
          })}
      </MapContainer>
    </div>
  );
}
