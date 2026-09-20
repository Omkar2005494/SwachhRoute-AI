/**
 * SwachhRoute AI - API Client Bridge
 * Connects Next.js Frontend to Python FastAPI Core (DBSCAN + Google OR-Tools + Ollama)
 */

import {
  CitizenReport,
  HotspotCluster,
  OptimizationResponse,
  DriverManifest,
  VehicleProfile,
  OfficerOverride,
  PickupVerification
} from '@/types';

const API_BASE = '/api';

export async function fetchReports(): Promise<CitizenReport[]> {
  const res = await fetch(`${API_BASE}/reports`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function submitCitizenReport(payload: {
  text: string;
  lat: number;
  lng: number;
  citizen_name?: string;
  ward?: string;
  image_url?: string;
  audio_url?: string;
}): Promise<CitizenReport> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit citizen report');
  return res.json();
}

export async function triggerDBSCANClustering(): Promise<HotspotCluster[]> {
  const res = await fetch(`${API_BASE}/cluster`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to run DBSCAN clustering');
  return res.json();
}

export async function triggerCVRPOptimization(fleet?: VehicleProfile[]): Promise<OptimizationResponse> {
  const res = await fetch(`${API_BASE}/optimize-routes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: fleet ? JSON.stringify(fleet) : undefined,
  });
  if (!res.ok) throw new Error('Failed to optimize CVRP fleet routes');
  return res.json();
}

export async function fetchDriverManifest(truckId: string): Promise<DriverManifest> {
  const res = await fetch(`${API_BASE}/driver-manifest/${truckId}`);
  if (!res.ok) throw new Error(`Failed to fetch manifest for ${truckId}`);
  return res.json();
}

export async function fetchPolicyInsights() {
  const res = await fetch(`${API_BASE}/policy-insights`);
  if (!res.ok) throw new Error('Failed to fetch policy insights');
  return res.json();
}

export async function resetDemoDatabase() {
  const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset database');
  return res.json();
}
