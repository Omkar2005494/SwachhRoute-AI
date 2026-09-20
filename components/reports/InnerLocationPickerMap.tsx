'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface InnerPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
}

// Glowing cyan location pin for citizen reporting
const pickerIcon = L.divIcon({
  className: 'location-picker-icon',
  html: `
    <div style="
      background: #06b6d4;
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid #ffffff;
      box-shadow: 0 0 16px rgba(6, 182, 212, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: #ffffff;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function MapClickHandler({
  onLocationChange,
}: {
  onLocationChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function CenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export default function InnerLocationPickerMap({
  latitude,
  longitude,
  onLocationChange,
}: InnerPickerProps) {
  const defaultCenter: [number, number] = [12.9716, 77.5946];
  const activePosition: [number, number] | null =
    typeof latitude === 'number' && typeof longitude === 'number'
      ? [latitude, longitude]
      : null;

  return (
    <div className="w-full h-64">
      <MapContainer
        center={activePosition || defaultCenter}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full cursor-crosshair"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-tile-filter"
        />

        <MapClickHandler onLocationChange={onLocationChange} />

        {activePosition && (
          <>
            <Marker position={activePosition} icon={pickerIcon} />
            <CenterUpdater center={activePosition} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
