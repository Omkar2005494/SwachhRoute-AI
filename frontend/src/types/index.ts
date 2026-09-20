/**
 * SwachhRoute AI - Core Domain Types
 * Problem Statement: CS11 - Geospatial Environment: Mapping Waste-Dumping Hotspots and Improving Collection Routes
 * Team: Stackverse-labs
 */

// 1. Citizen Report & Inputs (Capabilities 1, 2, 3)
export interface CitizenReport {
  id: string;
  text: string;
  lat: float;
  lng: float;
  image_url: string;
  audio_url?: string;
  citizen_name: string;
  ward: string;
  timestamp: string;
  // 4, 5, 6: AI Complaint Analysis, Hazard Severity, Machinery
  hazard_class: HazardCategory;
  severity_score: number; // 1 to 10
  machinery_needed: FleetType;
  urgency: 'Immediate' | 'Within 4h' | 'Scheduled';
  // 12, 13: Officer Override & Pickup Verification
  is_resolved: boolean;
  resolved_at?: string;
  officer_override?: OfficerOverride;
  pickup_verification?: PickupVerification;
  cluster_id?: number | null;
}

export type float = number;

export type HazardCategory =
  | 'Biomedical Hazardous'
  | 'Animal Carcass / Bio-Hazard'
  | 'Drain Blockage / Silt'
  | 'Organic Wet Waste'
  | 'Construction Debris'
  | 'Plastic / Dry Waste'
  | 'Mixed Municipal Waste';

// 6, 8: Required Machinery & Fleet Profiles
export type FleetType =
  | 'Hydraulic Compactor (Heavy)'
  | 'Mini Tipper (Light)'
  | 'Backhoe Loader'
  | 'Manual Rickshaw';

export interface VehicleProfile {
  id: string;
  name: string;
  type: FleetType;
  capacity_kg: number;
  fuel_economy_kmpl: number;
  max_speed_kmh: number;
  suitable_for_narrow_alleys: boolean;
  status: 'Available' | 'On Route' | 'Maintenance';
}

// 7, 14: DBSCAN Hotspot Detection & Recurrence Tracking
export interface HotspotCluster {
  cluster_id: number;
  name: string;
  centroid_lat: number;
  centroid_lng: number;
  polygon: [number, number][]; // Convex Hull boundary
  report_ids: string[];
  report_count: number;
  severity_score: number;
  estimated_tonnage_kg: number;
  // 14: Recurrence Tracking
  chronic_recurrence_count: number;
  recurrence_history?: { date: string; reports: number }[];
  primary_hazard: HazardCategory;
  recommended_machinery: FleetType;
  status: 'Active' | 'Dispatched' | 'Cleared';
}

// 9, 10: CVRP Optimization & Road-Snapped Routing
export interface RouteStop {
  stop_index: number;
  stop_id: string;
  stop_name: string;
  lat: number;
  lng: number;
  demand_kg: number;
  hazard_class: string;
  severity_score: number;
  eta_minutes_from_start: number;
  verified?: boolean;
}

export interface VehicleRoute {
  vehicle_id: string;
  vehicle_name: string;
  vehicle_type: string;
  capacity_kg: number;
  total_tonnage_kg: number;
  utilization_pct: number;
  total_distance_km: number;
  estimated_duration_mins: number;
  fuel_used_litres: number;
  stops: RouteStop[];
  path_coordinates: [number, number][]; // Road-snapped geometry
}

export interface OptimizationResponse {
  timestamp: string;
  ward_name: string;
  total_hotspots_targeted: number;
  total_tonnage_cleared_kg: number;
  total_distance_km: number;
  fuel_saved_litres: number;
  fuel_saved_pct: number;
  cost_saved_inr: number;
  co2_avoided_kg: number;
  routes: VehicleRoute[];
  unvisited_hotspots: string[];
}

// 11: Driver Shift Manifest
export interface DriverManifest {
  truck_id: string;
  truck_name: string;
  driver_name: string;
  shift_date: string;
  total_stops: number;
  total_load_kg: number;
  stops_summary: {
    stop_name: string;
    demand_kg: number;
    severity_score: number;
  }[];
  vernacular_instructions: string;
  safety_alerts: string[];
}

// 12: Officer Override
export interface OfficerOverride {
  officer_id: string;
  officer_name: string;
  timestamp: string;
  action: 'Priority Boost' | 'Reroute' | 'Manual Dispatch' | 'Dismiss Report';
  reason: string;
  adjusted_severity?: number;
}

// 13: Pickup Verification
export interface PickupVerification {
  verified_by_driver: string;
  verified_at: string;
  actual_weight_collected_kg: number;
  cleanliness_photo_url?: string;
  notes?: string;
}

// Municipal Facility
export interface MunicipalFacility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'depot' | 'landfill' | 'mrf';
}
