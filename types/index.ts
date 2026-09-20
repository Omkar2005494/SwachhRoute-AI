/**
 * SwachhRoute AI — Core TypeScript Domain Models
 * Autonomous Waste Hotspot Clustering & Dynamic Fleet Route Optimiser
 * NeuraMorphix HackForge 2026 | Problem Statement CS11
 */

/**
 * Canonical Waste Categories in SwachhRoute AI
 */
export type WasteCategory =
  | 'household'
  | 'commercial'
  | 'construction_debris'
  | 'organic'
  | 'plastic'
  | 'hazardous'
  | 'electronic'
  | 'mixed';

export type AICategory = WasteCategory;

export type WasteSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Canonical Hazard Types in SwachhRoute AI
 */
export type HazardLevel =
  | 'organic_decay'
  | 'severe_odor'
  | 'biomedical'
  | 'drain_flood_risk'
  | 'construction_debris'
  | 'sharp_objects'
  | 'fire_risk'
  | 'hazardous_material'
  | 'mixed_waste'
  | 'none_identified';

export type WasteHazard = HazardLevel;
export type AIHazardType = HazardLevel;
export type HotspotUrgency = 'low' | 'medium' | 'high' | 'critical';

/**
 * Canonical Machinery Types in SwachhRoute AI
 */
export type MachineryType =
  | 'hydraulic_compactor'
  | 'mini_tipper'
  | 'backhoe';

export type AIMachineryType = MachineryType;

export type ReportStatus =
  | 'reported'
  | 'validated'
  | 'clustered'
  | 'scheduled'
  | 'in_progress'
  | 'collected'
  | 'verified';

export type ReportSource =
  | 'citizen_app'
  | 'citizen_web'
  | 'field_officer'
  | 'audio_ivr'
  | 'automated_sensor';

export type VehicleStatus =
  | 'available'
  | 'assigned'
  | 'collecting'
  | 'maintenance'
  | 'offline'
  | 'en_route'
  | 'off_duty';

export type RouteStatus = 'draft' | 'dispatched' | 'active' | 'completed' | 'cancelled';

export type AIStatus =
  | 'pending'
  | 'analyzing'
  | 'complete'
  | 'offline_fallback'
  | 'failed';

/**
 * Strict Structured AI Result from Meta Llama 3.2 3B / Fallback
 */
export interface ComplaintAnalysis {
  category: AICategory;
  /** Severity score integer between 1 and 10 */
  severity: number;
  hazard: AIHazardType;
  machineryRequired: AIMachineryType;
  /** Estimated waste quantity in kg, or null if insufficient text evidence */
  estimatedWasteKg: number | null;
  summary: string;
  recommendedAction: string;
  /** Advisory model-reported confidence between 0 and 1 */
  confidence: number;
  engine: 'llama3.2:3b' | 'rule_based_fallback';
  analyzedAt: string;
}

/**
 * 1. WasteReport
 * Multi-modal citizen and field officer waste complaint
 */
export interface WasteReport {
  id: string;
  description: string;
  /** Latitude in WGS 84 (EPSG:4326) */
  latitude: number;
  /** Longitude in WGS 84 (EPSG:4326) */
  longitude: number;
  timestamp: string;
  category: WasteCategory;
  severity: WasteSeverity;
  hazard: HazardLevel;
  machineryRequired: MachineryType[];
  estimatedWasteKg: number;
  status: ReportStatus;
  source: ReportSource;
  photo?: string;
  audio?: string;
  aiAnalyzed: boolean;
  aiStatus?: AIStatus;
  aiAnalysis?: ComplaintAnalysis;
  hotspotId?: string;
  wardName?: string;
  citizenName?: string;
}

export type HotspotGeometryType = 'convex_hull' | 'operational_buffer';

/**
 * 2. Hotspot
 * Geographically clustered waste concentration zone identified via DBSCAN
 */
export interface Hotspot {
  id: string;
  clusterLabel: number;
  /** [latitude, longitude] in EPSG:4326 */
  centerCoordinates: [number, number];
  /** Perimeter boundary coordinates for polygon rendering in EPSG:4326 */
  boundingPolygon?: [number, number][];
  geometryType?: HotspotGeometryType;
  reportIds: string[];
  reportCount: number;
  totalEstimatedWasteKg: number;
  severityScore: number; // 0 to 100
  averageSeverity: number;
  maxSeverity: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  dominantCategory: WasteCategory;
  dominantWasteCategory: WasteCategory;
  dominantHazard: HazardLevel;
  recommendedMachinery: MachineryType[];
  recommendedMachineryType: MachineryType;
  status: 'active' | 'scheduled' | 'clearing' | 'resolved';
  createdAt: string;
  lastUpdatedAt: string;
  zoneName: string;
  assignedRouteId?: string;
  assignmentStatus?: 'unassigned' | 'assigned' | 'capacity_exception';
  /** Phase 6C: Officer Priority Override */
  officerPriorityOverride?: HotspotUrgency;
  officerOverrideReason?: string;
}

/**
 * Geospatial DBSCAN Clustering Execution Result
 */
export interface ClusteringResult {
  hotspots: Hotspot[];
  clusteredReportsCount: number;
  noiseReportsCount: number;
  totalReportsCount: number;
  clusterAssignments: Record<string, string>; // reportId -> clusterId | 'noise'
  engine: 'python_scikit_learn' | 'deterministic_fallback';
  executionTimeMs: number;
  parameters: {
    epsilonMeters: number;
    minSamples: number;
  };
}

/**
 * Municipal Demonstration Depot
 */
export interface MunicipalDepot {
  id: string;
  name: string;
  address: string;
  /** [latitude, longitude] in EPSG:4326 */
  coordinates: [number, number];
  label: string;
}

/**
 * 3. FleetVehicle
 * Municipal waste collection vehicle asset
 */
export interface FleetVehicle {
  id: string;
  registrationNumber: string;
  vehicleType: MachineryType;
  capacityKg: number;
  currentLoadKg: number;
  status: VehicleStatus;
  /** [latitude, longitude] in EPSG:4326 */
  currentLocation: [number, number];
  fuelType: 'diesel' | 'electric' | 'cng';
  depotId: string;
  availableForDispatch: boolean;
  assignedRouteId?: string;
  driverName: string;
  driverPhone: string;
}

/**
 * 4. RouteStop
 * A designated pickup location along an optimized route
 */
export interface RouteStop {
  stopId: string;
  sequence: number;
  stopSequence: number;
  hotspotId?: string;
  reportId?: string;
  /** Latitude in WGS 84 (EPSG:4326) */
  latitude: number;
  /** Longitude in WGS 84 (EPSG:4326) */
  longitude: number;
  /** [latitude, longitude] in EPSG:4326 */
  location: [number, number];
  addressName: string;
  estimatedDemandKg: number;
  estimatedWasteKg: number;
  cumulativeLoadKg: number;
  remainingVehicleCapacityKg: number;
  requiredMachinery: MachineryType;
  plannedArrivalTime?: string;
  completedArrivalTime?: string;
  status: 'pending' | 'arrived' | 'collected' | 'bypassed';
}

/**
 * Infeasible Hotspot Demand / Specialized Remediation Exception
 */
export interface CapacityException {
  hotspotId: string;
  zoneName: string;
  demandedKg: number;
  maxVehicleCapacityKg: number;
  recommendedMachinery: MachineryType[];
  reason: string;
  remediationAction: string;
}

/**
 * 5. OptimizedRoute
 * Multi-stop collection route solved via Google OR-Tools CVRP
 */
export interface OptimizedRoute {
  id: string;
  routeId: string;
  vehicleId: string;
  vehicleType: MachineryType;
  depotId: string;
  /** Central Municipal Depot [lat, lng] */
  depotLocation: [number, number];
  stopIds: string[];
  stopOrder: number[];
  stops: RouteStop[];
  totalDistanceMeters: number;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  totalDemandKg: number;
  totalWasteCollectedKg: number;
  vehicleCapacityKg: number;
  remainingCapacityKg: number;
  /** Polyline coordinates for preview (straight geometric segments in Phase 5) */
  polylineCoordinates?: [number, number][];
  
  /** Phase 6A: OSRM Road-Aware Routing Fields */
  roadDistanceMeters: number | null;
  roadDistanceKm: number | null;
  roadDurationSeconds: number | null;
  roadDurationMinutes: number | null;
  /** Road-snapped Leaflet coordinates [latitude, longitude][] */
  roadGeometry: [number, number][] | null;
  routingEngine: 'osrm' | 'unavailable' | 'fallback';

  optimizationEngine: 'google_ortools' | 'deterministic_fallback';
  optimizationAlgorithm: string;
  solverStatus: string;
  status: RouteStatus;
  generatedAt: string;
  optimizedAt: string;

  /** Phase 6C: Officer Operational Override State (Original OR-Tools fields remain untouched) */
  operationalStatus?: OperationalRouteStatus;
  effectiveVehicleId?: string;
  effectiveStops?: RouteStop[];
  heldReason?: string;
}

/**
 * Strict OSRM Routing GeoJSON Geometry
 */
export interface OSRMGeometry {
  coordinates: [number, number][]; // [longitude, latitude] in GeoJSON
  type: 'LineString';
}

/**
 * Strict OSRM Step Structure
 */
export interface OSRMStep {
  distance: number;
  duration: number;
  geometry: OSRMGeometry;
  name: string;
}

/**
 * Strict OSRM Route Leg Structure
 */
export interface OSRMLeg {
  distance: number;
  duration: number;
  steps?: OSRMStep[];
  summary: string;
}

/**
 * Strict OSRM Route Object
 */
export interface OSRMRoute {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: OSRMGeometry;
  legs: OSRMLeg[];
  weight: number;
  weight_name: string;
}

/**
 * Strict OSRM Snapped Waypoint
 */
export interface OSRMWaypoint {
  distance: number;
  hint: string;
  location: [number, number]; // [longitude, latitude]
  name: string;
}

/**
 * Strict OSRM Route Service Response
 */
export interface OSRMRouteResponse {
  code: string;
  routes: OSRMRoute[];
  waypoints: OSRMWaypoint[];
  message?: string;
}

/**
 * Strict OSRM Table / Distance Matrix Response
 */
export interface OSRMTableResponse {
  code: string;
  distances?: number[][]; // in meters
  durations?: number[][]; // in seconds
  destinations?: OSRMWaypoint[];
  sources?: OSRMWaypoint[];
  message?: string;
}

/**
 * Internal Road Route Result Contract
 */
export interface RoadRouteResult {
  roadDistanceMeters: number | null;
  roadDistanceKm: number | null;
  roadDurationSeconds: number | null;
  roadDurationMinutes: number | null;
  roadGeometry: [number, number][] | null; // [latitude, longitude][] for Leaflet
  routingEngine: 'osrm' | 'unavailable' | 'fallback';
  cached?: boolean;
  error?: string;
}

/**
 * Comprehensive CVRP Fleet Optimization Result
 */
export interface OptimizationResult {
  routes: OptimizedRoute[];
  totalDistanceMeters: number;
  totalDistanceKm: number;
  totalDemandKg: number;
  totalServedDemandKg: number;
  totalExceptionDemandKg: number;
  vehiclesUsedCount: number;
  vehiclesTotalCount: number;
  stopsCount: number;
  capacityExceptions: CapacityException[];
  solverStatus: string;
  optimizationEngine: 'google_ortools' | 'deterministic_fallback';
  executionTimeMs: number;
  optimizedAt: string;
}

export type ManifestStatus = 'draft' | 'ready' | 'dispatched' | 'completed' | 'cancelled';

/**
 * Stop details specifically formatted for the operational Driver Shift Manifest
 */
export interface ManifestStop {
  sequence: number;
  hotspotId: string;
  zoneName: string;
  latitude: number;
  longitude: number;
  location: [number, number];
  estimatedDemandKg: number;
  cumulativeLoadKg: number;
  remainingCapacityKg: number;
  dominantHazard: WasteHazard;
  dominantCategory: WasteCategory;
  requiredMachinery: MachineryType[];
  urgencyLevel: HotspotUrgency;
  recommendedAction: string;
  safetyDirectives: string[];
  /** Phase 6D: Driver Pickup Verification Fields */
  verificationStatus?: PickupVerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  actualWasteCategory?: WasteCategory;
  driverNotes?: string;
}

/**
 * 6. DriverManifest
 * Operational run sheet for municipal field drivers (Phase 6B)
 */
export interface DriverManifest {
  manifestId: string;
  routeId: string;
  vehicleId: string;
  driverName: string;
  driverPhone?: string;
  vehicleType: MachineryType;
  vehicleCapacityKg: number;
  estimatedLoadKg: number;
  remainingCapacityKg: number;
  capacityUtilizationPercent: number;
  stopIds: string[];
  totalStops: number;
  roadDistanceMeters: number | null;
  roadDistanceKm: number | null;
  roadDurationSeconds: number | null;
  roadDurationMinutes: number | null;
  routingEngine: 'osrm' | 'unavailable' | 'fallback';
  departureDepotId: string;
  departureDepotName: string;
  departureDepotLocation: [number, number];
  estimatedDepartureTime: string;
  estimatedReturnTime: string;
  safetyDirectives: string[];
  hazardSummary: WasteHazard[];
  machineryRequirements: MachineryType[];
  generatedAt: string;
  status: ManifestStatus;
  isStale?: boolean;
  sourceRouteOptimizedAt?: string;
  stops: ManifestStop[];
  /** Phase 6D: Weighbridge Scale Integration */
  weighbridgeTicketId?: string;
}

/**
 * Dashboard Overview KPI Model
 */
export interface DashboardKPIs {
  totalReports: number;
  activeHotspots: number;
  highPriorityHotspots: number;
  pendingCollectionTons: number;
  availableFleetCount: number;
  totalFleetCount: number;
}

/**
 * Phase 6C: Officer Operations & Human-in-the-Loop Override Types
 */
export type OfficerOverrideAction =
  | 'priority_escalation'
  | 'vehicle_reassignment'
  | 'stop_reorder'
  | 'route_hold'
  | 'dispatch_approval'
  | 'dispatch_rejection';

export type OfficerOverrideStatus = 'pending' | 'applied' | 'cancelled';

export type OperationalRouteStatus =
  | 'optimized'
  | 'officer_reviewed'
  | 'on_hold'
  | 'dispatch_ready'
  | 'dispatched'
  | 'awaiting_weighbridge'
  | 'completed';

export interface OfficerOverride {
  overrideId: string;
  routeId: string;
  manifestId?: string;
  targetId?: string; // e.g. hotspotId, vehicleId
  officerName: string;
  action: OfficerOverrideAction;
  reason: string;
  originalVehicleId?: string;
  newVehicleId?: string;
  originalStopOrder?: string[];
  newStopOrder?: string[];
  originalPriority?: HotspotUrgency;
  newPriority?: HotspotUrgency;
  createdAt: string;
  status: OfficerOverrideStatus;
}

/**
 * Phase 6D: Driver Pickup Verification & Weighbridge Integration Types
 */
export type PickupVerificationStatus =
  | 'pending'
  | 'collected'
  | 'partially_collected'
  | 'inaccessible'
  | 'already_cleared';

export interface PickupVerification {
  verificationId: string;
  manifestId: string;
  routeId: string;
  hotspotId: string;
  stopIndex: number;
  verifiedByDriverName: string;
  timestamp: string;
  status: PickupVerificationStatus;
  actualWasteCategory: WasteCategory;
  actualEstimatedKg?: number;
  driverNotes?: string;
  resolvedReportIds: string[];
}

export type WeighbridgeAlertLevel =
  | 'normal'
  | 'underweight_flag'
  | 'overweight_flag'
  | 'severe_overload';

export interface WeighbridgeTicket {
  ticketId: string;
  vehicleId: string;
  routeId: string;
  manifestId: string;
  depotId: string;
  depotName: string;
  driverName: string;
  operatorName: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netPayloadKg: number;
  estimatedDemandKg: number;
  varianceKg: number;
  variancePercentage: number;
  alertLevel: WeighbridgeAlertLevel;
  disposalFacility: string;
  weighedAt: string;
  status: 'completed' | 'flagged_for_audit';
  notes?: string;
}

