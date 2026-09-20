'use client';

import React, { useEffect, useRef } from 'react';
import { CitizenReport, HotspotCluster, VehicleRoute } from '@/types';

interface MapViewProps {
  reports: CitizenReport[];
  clusters: HotspotCluster[];
  routes: VehicleRoute[];
  selectedCluster: HotspotCluster | null;
  onMapClick: (lat: number, lng: number) => void;
}

const DEPOT = { lat: 18.5035, lng: 73.8115, name: 'Kothrud Central Solid Waste Depot' };
const LANDFILL = { lat: 18.5135, lng: 73.7920, name: 'Paud Road Transfer Station & MRF' };

export const MapView: React.FC<MapViewProps> = ({
  reports,
  clusters,
  routes,
  selectedCluster,
  onMapClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<{
    reports: any;
    clusters: any;
    routes: any;
    facilities: any;
  }>({
    reports: null,
    clusters: null,
    routes: null,
    facilities: null,
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [18.5074, 73.8077],
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topleft' }).addTo(map);

      // CartoDB Dark Matter Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      layersRef.current.clusters = L.layerGroup().addTo(map);
      layersRef.current.routes = L.layerGroup().addTo(map);
      layersRef.current.reports = L.layerGroup().addTo(map);
      layersRef.current.facilities = L.layerGroup().addTo(map);

      // Plot Facilities
      const depotIcon = L.divIcon({
        className: 'custom-facility-marker',
        html: '<i class="fa-solid fa-square" style="color: #3b82f6; font-size: 22px; filter: drop-shadow(0 0 8px rgba(59,130,246,0.6));"></i>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([DEPOT.lat, DEPOT.lng], { icon: depotIcon })
        .bindPopup(`<b>🏢 ${DEPOT.name}</b><br><span style="color:#64748b; font-size:11px;">Fleet Departure & Maintenance Center</span>`)
        .addTo(layersRef.current.facilities);

      const landfillIcon = L.divIcon({
        className: 'custom-facility-marker',
        html: '<i class="fa-solid fa-triangle" style="color: #a855f7; font-size: 22px; filter: drop-shadow(0 0 8px rgba(168,85,247,0.6));"></i>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([LANDFILL.lat, LANDFILL.lng], { icon: landfillIcon })
        .bindPopup(`<b>🏭 ${LANDFILL.name}</b><br><span style="color:#64748b; font-size:11px;">Scientific Material Recovery Facility</span>`)
        .addTo(layersRef.current.facilities);

      // Map Click to select coordinates
      map.on('click', (e: any) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
    }
  }, [onMapClick]);

  // Update Reports Layer
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !layersRef.current.reports) return;

    layersRef.current.reports.clearLayers();

    reports.forEach((r) => {
      const circle = L.circleMarker([r.lat, r.lng], {
        radius: 5,
        fillColor: r.severity_score >= 8 ? '#ef4444' : r.severity_score >= 6 ? '#f59e0b' : '#fbbf24',
        color: '#ffffff',
        weight: 1,
        opacity: 0.85,
        fillOpacity: 0.85,
      });

      circle.bindPopup(`
        <div style="font-family:'Inter', sans-serif; font-size:12px; color:#1e293b; max-width:220px;">
          <b>${r.id}</b> <span style="font-size:10px; font-weight:700; color:#dc2626;">(Sev: ${r.severity_score}/10)</span><br/>
          <div style="font-size:11px; color:#475569; margin:3px 0;">"${r.text}"</div>
          <div style="font-size:10px; color:#64748b;">Hazard: <b>${r.hazard_class}</b></div>
        </div>
      `);
      circle.addTo(layersRef.current.reports);
    });
  }, [reports]);

  // Update Hotspot Clusters Layer
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !layersRef.current.clusters) return;

    layersRef.current.clusters.clearLayers();

    clusters.forEach((c) => {
      const isHigh = c.severity_score >= 7.0;
      const strokeColor = isHigh ? '#ef4444' : '#f59e0b';
      const fillColor = isHigh ? 'rgba(239, 68, 68, 0.28)' : 'rgba(245, 158, 11, 0.22)';

      const polygon = L.polygon(c.polygon, {
        color: strokeColor,
        weight: 2,
        dashArray: '5, 5',
        fillColor,
        fillOpacity: 0.4,
      });

      polygon.bindPopup(`
        <div style="font-family:'Inter', sans-serif; font-size:12px; color:#1e293b;">
          <b>${c.name}</b><br/>
          <span style="font-size:11px;">Severity: <b>${c.severity_score}/10</b> | Est: <b>${c.estimated_tonnage_kg} kg</b></span><br/>
          <span style="font-size:10px; color:#64748b;">${c.report_count} citizen complaints grouped via DBSCAN</span>
        </div>
      `);
      polygon.addTo(layersRef.current.clusters);

      const centerIcon = L.divIcon({
        className: 'custom-centroid-marker',
        html: `<div style="background:${strokeColor}; color:white; font-weight:800; font-size:11px; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px ${strokeColor}; border:2px solid #fff;">${c.cluster_id}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([c.centroid_lat, c.centroid_lng], { icon: centerIcon }).addTo(layersRef.current.clusters);
    });
  }, [clusters]);

  // Update Vehicle Routes Layer
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !layersRef.current.routes) return;

    layersRef.current.routes.clearLayers();

    const colors = ['#10b981', '#06b6d4', '#f59e0b'];

    routes.forEach((route, idx) => {
      if (route.stops.length === 0) return;

      const routeColor = colors[idx % colors.length];

      const polyline = L.polyline(route.path_coordinates, {
        color: routeColor,
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      });

      polyline.bindPopup(`
        <div style="font-family:'Inter', sans-serif; font-size:12px; color:#1e293b;">
          <b>🚚 ${route.vehicle_name}</b> (${route.vehicle_type})<br/>
          <b>Stops:</b> ${route.stops.length} | <b>Load:</b> ${route.total_tonnage_kg} / ${route.capacity_kg} kg<br/>
          <b>Distance:</b> ${route.total_distance_km} km | <b>Duration:</b> ~${route.estimated_duration_mins}m
        </div>
      `);
      polyline.addTo(layersRef.current.routes);

      route.stops.forEach((stop) => {
        const stopIcon = L.divIcon({
          className: 'custom-stop-marker',
          html: `<div style="background:#090d16; color:${routeColor}; border:2px solid ${routeColor}; font-weight:800; font-size:11px; width:24px; height:24px; border-radius:6px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 8px rgba(0,0,0,0.8);">${stop.stop_index}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(layersRef.current.routes);
      });
    });
  }, [routes]);

  // Fly to selected cluster
  useEffect(() => {
    if (selectedCluster && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedCluster.centroid_lat, selectedCluster.centroid_lng], 16, { duration: 1.2 });
    }
  }, [selectedCluster]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full bg-[#07090e]" />
      
      {/* Floating Layer Legend */}
      <div className="absolute top-4 right-4 bg-[#0e131f]/90 backdrop-blur-md border border-[#212d45] rounded-xl p-3 shadow-xl z-20 text-xs w-52 space-y-2">
        <h4 className="font-heading font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
          Layer Visibility
        </h4>
        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
          <span>Citizen Reports ({reports.length})</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
          <span>DBSCAN Hotspots ({clusters.length})</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
          <span>OR-Tools Routes ({routes.length})</span>
        </div>
      </div>
    </div>
  );
};
