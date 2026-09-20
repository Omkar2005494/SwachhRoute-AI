'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import {
  fetchReports,
  submitCitizenReport,
  triggerDBSCANClustering,
  triggerCVRPOptimization,
  fetchDriverManifest,
  fetchPolicyInsights,
  resetDemoDatabase,
} from '@/lib/api';
import { CitizenReport, HotspotCluster, OptimizationResponse, DriverManifest } from '@/types';

// Dynamically import MapView to prevent Leaflet SSR window errors
const MapView = dynamic(() => import('@/components/MapView').then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#07090e] flex items-center justify-center text-slate-500 font-mono text-xs">
      Loading SwachhRoute AI GIS Engine...
    </div>
  ),
});

export default function Home() {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [clusters, setClusters] = useState<HotspotCluster[]>([]);
  const [optimization, setOptimization] = useState<OptimizationResponse | null>(null);
  const [driverManifest, setDriverManifest] = useState<DriverManifest | null>(null);
  const [policyInsights, setPolicyInsights] = useState<any[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<HotspotCluster | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Initialize Data
  const loadData = useCallback(async () => {
    try {
      const repData = await fetchReports();
      setReports(repData);

      const clusData = await triggerDBSCANClustering();
      setClusters(clusData);

      const optData = await triggerCVRPOptimization();
      setOptimization(optData);

      const policyData = await fetchPolicyInsights();
      setPolicyInsights(policyData);

      const manifestData = await fetchDriverManifest('TRUCK_01');
      setDriverManifest(manifestData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler: Detect Hotspots (DBSCAN)
  const handleDetectHotspots = async () => {
    try {
      const clusData = await triggerDBSCANClustering();
      setClusters(clusData);
    } catch (err) {
      console.error('Clustering error:', err);
    }
  };

  // Handler: Solve Routes (Google OR-Tools CVRP)
  const handleSolveRoutes = async () => {
    try {
      const optData = await triggerCVRPOptimization();
      setOptimization(optData);
    } catch (err) {
      console.error('Optimization error:', err);
    }
  };

  // Handler: Reset Data
  const handleResetData = async () => {
    if (confirm('Reset database to initial Pune Ward 12 state?')) {
      await resetDemoDatabase();
      await loadData();
    }
  };

  // Handler: Submit Report
  const handleSubmitReport = async (payload: {
    text: string;
    lat: number;
    lng: number;
    citizen_name: string;
    ward: string;
  }) => {
    const newRep = await submitCitizenReport(payload);
    // Refresh state
    const repData = await fetchReports();
    setReports(repData);
    const clusData = await triggerDBSCANClustering();
    setClusters(clusData);
    return newRep;
  };

  // Handler: Select Truck Manifest
  const handleSelectTruck = async (truckId: string) => {
    try {
      const data = await fetchDriverManifest(truckId);
      setDriverManifest(data);
    } catch (err) {
      console.error('Manifest error:', err);
    }
  };

  // Handler: Map Click (Set coords)
  const handleMapClick = (lat: number, lng: number) => {
    // Coords handled via callback if needed
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07090e]">
      {/* Top Header */}
      <Header
        onDetectHotspots={handleDetectHotspots}
        onSolveRoutes={handleSolveRoutes}
        onResetData={handleResetData}
        onSimulateFleet={() => setIsSimulating(!isSimulating)}
        isSimulating={isSimulating}
      />

      {/* Main Split Screen */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          reports={reports}
          clusters={clusters}
          optimization={optimization}
          driverManifest={driverManifest}
          policyInsights={policyInsights}
          onSelectCluster={(c) => setSelectedCluster(c)}
          onSubmitReport={handleSubmitReport}
          onSelectTruck={handleSelectTruck}
        />

        {/* Right Fullscreen Map */}
        <main className="flex-1 relative h-full">
          <MapView
            reports={reports}
            clusters={clusters}
            routes={optimization ? optimization.routes : []}
            selectedCluster={selectedCluster}
            onMapClick={handleMapClick}
          />
        </main>
      </div>
    </div>
  );
}
