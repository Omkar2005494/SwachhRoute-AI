'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  WasteReport,
  Hotspot,
  ClusteringResult,
  DashboardKPIs,
  ComplaintAnalysis,
  AIStatus,
  WasteCategory,
  WasteSeverity,
  MachineryType,
  FleetVehicle,
  RouteStop,
  OptimizedRoute,
  OptimizationResult,
  MunicipalDepot,
  DriverManifest,
  OfficerOverride,
  OfficerOverrideAction,
  OfficerOverrideStatus,
  OperationalRouteStatus,
  HotspotUrgency,
} from '@/types';
import { DEMO_REPORTS, DEMO_HOTSPOTS, DEMO_FLEET, DEMO_ROUTES, DEMONSTRATION_DEPOT } from '@/data/demo';
import { validateReportInput, RawReportInput } from '@/services/dataProcessing';
import { clusterWasteReports } from '@/services/geospatial';
import { optimizeFleetRoutes } from '@/services/optimization';
import { getRoadRoute, clearRoadRoutingCache } from '@/services/routing';
import { generateDriverManifest } from '@/services/manifests';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import {
  isFirestoreAvailable,
  persistReports,
  persistHotspots,
  persistFleet,
  persistRoutes,
  persistManifests,
  persistOverrides,
  loadReports,
  loadHotspots,
  loadFleet,
  loadRoutes,
  loadManifests,
  loadOverrides,
} from '@/lib/firebase/firestore';

export interface AIEngineStatus {
  connected: boolean;
  model: string;
  hasModelInstalled: boolean;
  latencyMs?: number;
  checking: boolean;
}

interface ReportsContextType {
  reports: WasteReport[];
  totalReports: number;
  hotspots: Hotspot[];
  clusteringResult: ClusteringResult | null;
  isClustering: boolean;
  geospatialEngine: string;
  fleet: FleetVehicle[];
  routes: OptimizedRoute[];
  optimizationResult: OptimizationResult | null;
  isOptimizingRoutes: boolean;
  isRoadRouting: boolean;
  routeOptimizationEngine: string;
  kpis: DashboardKPIs;
  aiEngineStatus: AIEngineStatus;
  driverManifests: DriverManifest[];
  isGeneratingManifest: boolean;
  officerOverrides: OfficerOverride[];
  addReport: (input: RawReportInput) => { success: boolean; report?: WasteReport; errors?: string[] };
  triggerAIAnalysis: (reportId: string) => Promise<void>;
  triggerClustering: () => Promise<void>;
  triggerRouteOptimization: () => Promise<void>;
  recalculateRoadRoutes: () => Promise<void>;
  generateManifest: (routeId: string) => Promise<DriverManifest | undefined>;
  regenerateManifest: (manifestId: string) => Promise<DriverManifest | undefined>;
  getManifestForRoute: (routeId: string) => DriverManifest | undefined;
  applyPriorityOverride: (hotspotId: string, newPriority: HotspotUrgency, reason: string) => Promise<{ success: boolean; error?: string }>;
  reassignVehicle: (routeId: string, newVehicleId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  reorderStops: (routeId: string, newStopIds: string[], reason: string) => Promise<{ success: boolean; error?: string }>;
  holdRoute: (routeId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  resumeRoute: (routeId: string) => Promise<{ success: boolean; error?: string }>;
  approveDispatch: (routeId: string, manifestId: string) => Promise<{ success: boolean; error?: string }>;
  rejectDispatch: (routeId: string, manifestId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  checkAIHealth: () => Promise<void>;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

const LOCAL_STORAGE_METADATA_KEY = 'swachhroute_reports_meta_v1';

// Category mapping helper
function mapAICategoryToWasteCategory(aiCat: string): WasteCategory {
  const valid: WasteCategory[] = [
    'household',
    'commercial',
    'construction_debris',
    'organic',
    'plastic',
    'hazardous',
    'electronic',
    'mixed',
  ];
  if (valid.includes(aiCat as WasteCategory)) {
    return aiCat as WasteCategory;
  }
  return 'household';
}

// Severity mapping helper
function mapAISeverityToEnum(score: number): WasteSeverity {
  if (score >= 8) return 'critical';
  if (score >= 6) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

// Machinery mapping helper
function mapAIMachineryToDomain(machinery: string): MachineryType[] {
  switch (machinery) {
    case 'backhoe':
      return ['backhoe'];
    case 'mini_tipper':
      return ['mini_tipper'];
    case 'hydraulic_compactor':
    default:
      return ['hydraulic_compactor'];
  }
}

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<WasteReport[]>(() => {
    return DEMO_REPORTS.map((r) => ({
      ...r,
      aiStatus: r.aiAnalyzed ? ('complete' as AIStatus) : ('pending' as AIStatus),
    }));
  });

  const [hotspots, setHotspots] = useState<Hotspot[]>(DEMO_HOTSPOTS);
  const [clusteringResult, setClusteringResult] = useState<ClusteringResult | null>(null);
  const [isClustering, setIsClustering] = useState(false);
  const [geospatialEngine, setGeospatialEngine] = useState<string>('Python / Scikit-learn DBSCAN');

  // Fleet & CVRP Route Optimization State
  const [fleet, setFleet] = useState<FleetVehicle[]>(DEMO_FLEET);
  const [routes, setRoutes] = useState<OptimizedRoute[]>(DEMO_ROUTES);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizingRoutes, setIsOptimizingRoutes] = useState<boolean>(false);
  const [isRoadRouting, setIsRoadRouting] = useState<boolean>(false);
  const [routeOptimizationEngine, setRouteOptimizationEngine] = useState<string>('Google OR-Tools CVRP');

  // Phase 6B: Driver Shift Manifests State (empty until user explicitly generates)
  const [driverManifests, setDriverManifests] = useState<DriverManifest[]>([]);
  const [isGeneratingManifest, setIsGeneratingManifest] = useState<boolean>(false);

  // Phase 6C: Officer Operations & Human-in-the-Loop Override State
  const [officerOverrides, setOfficerOverrides] = useState<OfficerOverride[]>([]);

  const [aiEngineStatus, setAiEngineStatus] = useState<AIEngineStatus>({
    connected: false,
    model: 'llama3.2:3b',
    hasModelInstalled: false,
    checking: true,
  });

  const activeInferences = useRef<Set<string>>(new Set());
  const lastClusteredSignature = useRef<string>('');
  const clusteringInProgress = useRef<boolean>(false);
  const firestoreHydrated = useRef<boolean>(false);
  const [firestoreReady, setFirestoreReady] = useState<boolean>(false);

  // Check Ollama health
  const checkAIHealth = useCallback(async () => {
    setAiEngineStatus((prev) => ({ ...prev, checking: true }));
    try {
      const res = await fetch('/api/ai/health');
      if (res.ok) {
        const data = await res.json();
        setAiEngineStatus({
          connected: Boolean(data.connected),
          model: data.model || 'llama3.2:3b',
          hasModelInstalled: Boolean(data.hasModelInstalled),
          latencyMs: data.latencyMs,
          checking: false,
        });
      } else {
        setAiEngineStatus({
          connected: false,
          model: 'llama3.2:3b',
          hasModelInstalled: false,
          checking: false,
        });
      }
    } catch {
      setAiEngineStatus({
        connected: false,
        model: 'llama3.2:3b',
        hasModelInstalled: false,
        checking: false,
      });
    }
  }, []);

  // Trigger AI analysis for a specific report
  const triggerAIAnalysis = useCallback(async (reportId: string) => {
    if (activeInferences.current.has(reportId)) return;

    const targetReport = reports.find((r) => r.id === reportId);
    if (!targetReport) return;

    activeInferences.current.add(reportId);

    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, aiStatus: 'analyzing' as AIStatus } : r))
    );

    try {
      const res = await fetch('/api/ai/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: targetReport.description,
          reportId: targetReport.id,
        }),
      });

      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const analysis: ComplaintAnalysis = data.analysis;
      const isFallback = Boolean(data.usedFallback);

      setReports((prev) =>
        prev.map((r) => {
          if (r.id !== reportId) return r;

          const updated: WasteReport = {
            ...r,
            aiAnalyzed: true,
            aiStatus: isFallback ? 'offline_fallback' : 'complete',
            aiAnalysis: analysis,
            category: mapAICategoryToWasteCategory(analysis.category),
            severity: mapAISeverityToEnum(analysis.severity),
            hazard: analysis.hazard,
            machineryRequired: mapAIMachineryToDomain(analysis.machineryRequired),
            estimatedWasteKg:
              analysis.estimatedWasteKg !== null ? analysis.estimatedWasteKg : r.estimatedWasteKg,
          };
          return updated;
        })
      );
    } catch (err) {
      console.warn(`[ReportsContext] AI analysis failed for report ${reportId}:`, err);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, aiStatus: 'failed' as AIStatus } : r))
      );
    } finally {
      activeInferences.current.delete(reportId);
    }
  }, [reports]);

  // Execute Geospatial DBSCAN Clustering
  const executeClustering = useCallback(async (currentReports: WasteReport[]) => {
    if (clusteringInProgress.current) return;
    clusteringInProgress.current = true;
    setIsClustering(true);

    try {
      const result = await clusterWasteReports(currentReports, { epsMeters: 180, minSamples: 3 });

      setHotspots(result.hotspots);
      setClusteringResult(result);
      setGeospatialEngine(
        result.engine === 'python_scikit_learn'
          ? 'Python / Scikit-learn DBSCAN'
          : 'Deterministic TypeScript Fallback'
      );

      // Update report status and hotspotId assignments
      setReports((prev) =>
        prev.map((r) => {
          const assignedCluster = result.clusterAssignments[r.id];
          if (assignedCluster && assignedCluster !== 'noise') {
            return {
              ...r,
              status: 'clustered',
              hotspotId: assignedCluster,
            };
          } else if (assignedCluster === 'noise') {
            return {
              ...r,
              status: r.status === 'clustered' ? 'validated' : r.status,
              hotspotId: undefined,
            };
          }
          return r;
        })
      );
    } catch (err) {
      console.error('[ReportsContext] Clustering execution failed:', err);
    } finally {
      setIsClustering(false);
      clusteringInProgress.current = false;
    }
  }, []);

  const triggerClustering = useCallback(async () => {
    await executeClustering(reports);
  }, [executeClustering, reports]);

  // Effect: Run clustering when report spatial features change
  useEffect(() => {
    const signature = reports
      .map((r) => `${r.id}:${r.latitude}:${r.longitude}:${r.estimatedWasteKg}:${r.category}:${r.severity}`)
      .join('|');

    if (signature !== lastClusteredSignature.current) {
      lastClusteredSignature.current = signature;
      executeClustering(reports);
    }
  }, [reports, executeClustering]);

  // Check Ollama health on mount
  useEffect(() => {
    checkAIHealth();
  }, [checkAIHealth]);

  // Hydrate custom reports from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_METADATA_KEY);
      if (stored) {
        const parsedMetadata: WasteReport[] = JSON.parse(stored);
        if (Array.isArray(parsedMetadata) && parsedMetadata.length > 0) {
          const demoIds = new Set(DEMO_REPORTS.map((r) => r.id));
          const customReports = parsedMetadata.filter((r) => !demoIds.has(r.id));
          if (customReports.length > 0) {
            setReports((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const novel = customReports.filter((c) => !existingIds.has(c.id));
              return [...novel, ...prev];
            });
          }
        }
      }
    } catch (e) {
      console.warn('Could not read local report metadata from storage:', e);
    }
  }, []);

  // Firestore hydration on mount — load persisted state if Firebase is configured
  useEffect(() => {
    if (firestoreHydrated.current) return;
    if (!isFirebaseConfigured() || !isFirestoreAvailable()) {
      console.info('[Firestore] Firebase not configured — running in demo/offline mode.');
      setFirestoreReady(false);
      return;
    }
    firestoreHydrated.current = true;

    (async () => {
      try {
        console.info('[Firestore] Hydrating state from Cloud Firestore...');
        const [
          fsReports,
          fsHotspots,
          fsFleet,
          fsRoutes,
          fsManifests,
          fsOverrides,
        ] = await Promise.all([
          loadReports(),
          loadHotspots(),
          loadFleet(),
          loadRoutes(),
          loadManifests(),
          loadOverrides(),
        ]);

        if (fsReports.length > 0) {
          setReports((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const novel = fsReports.filter((r) => !existingIds.has(r.id));
            return novel.length > 0 ? [...novel, ...prev] : prev;
          });
        }
        if (fsHotspots.length > 0) setHotspots(fsHotspots);
        if (fsFleet.length > 0) setFleet(fsFleet);
        if (fsRoutes.length > 0) setRoutes(fsRoutes);
        if (fsManifests.length > 0) setDriverManifests(fsManifests);
        if (fsOverrides.length > 0) setOfficerOverrides(fsOverrides);

        setFirestoreReady(true);
        console.info('[Firestore] Hydration complete — Firestore persistence active.');
      } catch (err) {
        console.warn('[Firestore] Hydration failed — falling back to demo data:', err);
        setFirestoreReady(false);
      }
    })();
  }, []);

  const addReport = (
    input: RawReportInput
  ): { success: boolean; report?: WasteReport; errors?: string[] } => {
    const validation = validateReportInput(input);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const { normalizedData } = validation;

    const newReport: WasteReport = {
      id: `REP-BLR-${Math.floor(1000 + Math.random() * 9000)}`,
      description: normalizedData.description,
      latitude: normalizedData.latitude,
      longitude: normalizedData.longitude,
      timestamp: new Date().toISOString(),
      category: normalizedData.category || 'household',
      severity: 'medium',
      hazard: 'none_identified',
      machineryRequired: [],
      estimatedWasteKg: 0,
      status: 'reported',
      source: normalizedData.source || 'citizen_web',
      photo: normalizedData.photo,
      audio: normalizedData.audio,
      aiAnalyzed: false,
      aiStatus: 'analyzing',
      wardName: 'Synthetic Bengaluru Urban Sector',
    };

    setReports((prev) => {
      const updated = [newReport, ...prev];
      try {
        const metadataOnly = updated.map((r) => {
          const { photo: _photo, ...rest } = r;
          return rest;
        });
        localStorage.setItem(LOCAL_STORAGE_METADATA_KEY, JSON.stringify(metadataOnly));
      } catch (e) {
        console.warn('Could not persist report metadata to localStorage:', e);
      }
      return updated;
    });

    // Automatically trigger local Llama 3.2 3B analysis asynchronously
    setTimeout(() => {
      triggerAIAnalysis(newReport.id);
    }, 100);

    return { success: true, report: newReport };
  };

  // Phase 6A: OSRM Road Routing Calculation
  const recalculateRoadRoutes = useCallback(async (routesToProcess?: OptimizedRoute[]) => {
    setIsRoadRouting(true);
    let targetRoutes = routesToProcess;
    if (!targetRoutes) {
      setRoutes((curr) => {
        targetRoutes = curr;
        return curr;
      });
    }

    if (!targetRoutes || targetRoutes.length === 0) {
      setIsRoadRouting(false);
      return;
    }

    try {
      const enrichedRoutes: OptimizedRoute[] = await Promise.all(
        targetRoutes.map(async (route) => {
          // Topology: Depot -> Stop 1 -> Stop 2 -> ... -> Depot
          const waypoints: [number, number][] = [
            route.depotLocation,
            ...route.stops.map((s) => s.location),
            route.depotLocation,
          ];

          const roadResult = await getRoadRoute(waypoints, route.id, route.vehicleId);

          if (roadResult.routingEngine === 'osrm' && roadResult.roadGeometry) {
            return {
              ...route,
              roadDistanceMeters: roadResult.roadDistanceMeters,
              roadDistanceKm: roadResult.roadDistanceKm,
              roadDurationSeconds: roadResult.roadDurationSeconds,
              roadDurationMinutes: roadResult.roadDurationMinutes,
              roadGeometry: roadResult.roadGeometry,
              routingEngine: 'osrm' as const,
            };
          } else {
            return {
              ...route,
              roadDistanceMeters: null,
              roadDistanceKm: null,
              roadDurationSeconds: null,
              roadDurationMinutes: null,
              roadGeometry: null,
              routingEngine: 'unavailable' as const,
            };
          }
        })
      );

      setRoutes(enrichedRoutes);
    } catch (err) {
      console.warn('[ReportsContext] Road route enrichment error:', err);
    } finally {
      setIsRoadRouting(false);
    }
  }, []);

  // Fleet CVRP Route Optimization Trigger
  const triggerRouteOptimization = useCallback(async () => {
    if (isOptimizingRoutes) return;
    setIsOptimizingRoutes(true);

    try {
      const result = await optimizeFleetRoutes({
        depot: DEMONSTRATION_DEPOT,
        hotspots,
        vehicles: fleet,
        maxTimeSeconds: 5,
      });

      setOptimizationResult(result);
      setRoutes(result.routes);
      setRouteOptimizationEngine(
        result.optimizationEngine === 'google_ortools'
          ? 'Google OR-Tools CVRP (Guided Local Search)'
          : 'Deterministic Fallback Preview'
      );

      // Update Hotspot assignment statuses
      const assignedRouteByHotspot = new Map<string, string>();
      for (const r of result.routes) {
        for (const stop of r.stops) {
          if (stop.hotspotId) {
            assignedRouteByHotspot.set(stop.hotspotId, r.id);
          }
        }
      }

      const exceptionHotspotSet = new Set(result.capacityExceptions.map((e) => e.hotspotId));

      setHotspots((prev) =>
        prev.map((h) => {
          if (assignedRouteByHotspot.has(h.id)) {
            return {
              ...h,
              assignedRouteId: assignedRouteByHotspot.get(h.id),
              assignmentStatus: 'assigned' as const,
            };
          }
          if (exceptionHotspotSet.has(h.id)) {
            return {
              ...h,
              assignedRouteId: undefined,
              assignmentStatus: 'capacity_exception' as const,
            };
          }
          return {
            ...h,
            assignedRouteId: undefined,
            assignmentStatus: 'unassigned' as const,
          };
        })
      );

      // Update Fleet vehicle assignment statuses and loads
      const routeByVehicle = new Map<string, OptimizedRoute>();
      for (const r of result.routes) {
        routeByVehicle.set(r.vehicleId, r);
      }

      setFleet((prev) =>
        prev.map((v) => {
          const assignedRoute = routeByVehicle.get(v.id);
          if (assignedRoute) {
            return {
              ...v,
              status: 'assigned' as const,
              assignedRouteId: assignedRoute.id,
              currentLoadKg: assignedRoute.totalDemandKg,
            };
          }
          if (v.availableForDispatch && v.status !== 'maintenance') {
            return {
              ...v,
              status: 'available' as const,
              assignedRouteId: undefined,
              currentLoadKg: 0,
            };
          }
          return v;
        })
      );

      // Phase 6B Stale Manifest Protection:
      // If a route was re-optimized after its manifest was generated, mark manifest STALE
      setDriverManifests((prev) =>
        prev.map((manifest) => {
          const updatedRoute = result.routes.find((r) => r.id === manifest.routeId);
          if (!updatedRoute || updatedRoute.optimizedAt !== manifest.sourceRouteOptimizedAt) {
            return { ...manifest, isStale: true };
          }
          return manifest;
        })
      );

      // Automatically trigger road-aware routing for newly generated routes
      recalculateRoadRoutes(result.routes);
    } catch (err) {
      console.error('[ReportsContext] Route optimization execution failed:', err);
    } finally {
      setIsOptimizingRoutes(false);
    }
  }, [isOptimizingRoutes, hotspots, fleet, recalculateRoadRoutes]);

  // Phase 6B: Driver Shift Manifest Actions
  const generateManifest = useCallback(
    async (routeId: string): Promise<DriverManifest | undefined> => {
      setIsGeneratingManifest(true);
      try {
        const route = routes.find((r) => r.id === routeId);
        if (!route) {
          console.warn(`[ReportsContext] Route ${routeId} not found for manifest generation.`);
          return undefined;
        }
        const manifest = generateDriverManifest(route, hotspots, fleet, DEMONSTRATION_DEPOT);
        setDriverManifests((prev) => {
          const filtered = prev.filter((m) => m.routeId !== routeId);
          return [...filtered, manifest];
        });
        return manifest;
      } catch (err) {
        console.error('[ReportsContext] Failed to generate manifest:', err);
        return undefined;
      } finally {
        setIsGeneratingManifest(false);
      }
    },
    [routes, hotspots, fleet]
  );

  const regenerateManifest = useCallback(
    async (manifestId: string): Promise<DriverManifest | undefined> => {
      setIsGeneratingManifest(true);
      try {
        const existing = driverManifests.find((m) => m.manifestId === manifestId);
        if (!existing) {
          console.warn(`[ReportsContext] Manifest ${manifestId} not found for regeneration.`);
          return undefined;
        }
        const route = routes.find((r) => r.id === existing.routeId);
        if (!route) {
          console.warn(`[ReportsContext] Route ${existing.routeId} not found for manifest regeneration.`);
          return undefined;
        }
        const updatedManifest = generateDriverManifest(route, hotspots, fleet, DEMONSTRATION_DEPOT);
        setDriverManifests((prev) =>
          prev.map((m) => (m.manifestId === manifestId ? updatedManifest : m))
        );
        return updatedManifest;
      } catch (err) {
        console.error('[ReportsContext] Failed to regenerate manifest:', err);
        return undefined;
      } finally {
        setIsGeneratingManifest(false);
      }
    },
    [driverManifests, routes, hotspots, fleet]
  );

  const getManifestForRoute = useCallback(
    (routeId: string): DriverManifest | undefined => {
      return driverManifests.find((m) => m.routeId === routeId);
    },
    [driverManifests]
  );

  // Phase 6C: Human-in-the-Loop Officer Operations & Override Methods

  const applyPriorityOverride = useCallback(
    async (
      hotspotId: string,
      newPriority: HotspotUrgency,
      reason: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!reason || !reason.trim()) {
        return { success: false, error: 'A valid reason is required for priority override.' };
      }
      const hotspot = hotspots.find((h) => h.id === hotspotId);
      if (!hotspot) {
        return { success: false, error: 'Hotspot not found.' };
      }

      const override: OfficerOverride = {
        overrideId: `OVR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        routeId: hotspot.assignedRouteId || 'unassigned',
        targetId: hotspotId,
        officerName: 'Ward Officer (Human-in-the-Loop)',
        action: 'priority_escalation',
        reason: reason.trim(),
        originalPriority: hotspot.officerPriorityOverride || hotspot.urgencyLevel,
        newPriority,
        createdAt: new Date().toISOString(),
        status: 'applied',
      };

      setHotspots((prev) =>
        prev.map((h) =>
          h.id === hotspotId
            ? {
                ...h,
                officerPriorityOverride: newPriority,
                officerOverrideReason: reason.trim(),
              }
            : h
        )
      );

      // Invalidate manifest if this hotspot belongs to an assigned route
      if (hotspot.assignedRouteId) {
        setDriverManifests((prev) =>
          prev.map((m) =>
            m.routeId === hotspot.assignedRouteId ? { ...m, isStale: true } : m
          )
        );
      }

      setOfficerOverrides((prev) => [override, ...prev]);
      return { success: true };
    },
    [hotspots]
  );

  const reassignVehicle = useCallback(
    async (
      routeId: string,
      newVehicleId: string,
      reason: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!reason || !reason.trim()) {
        return { success: false, error: 'A valid reason is required for vehicle reassignment.' };
      }
      const route = routes.find((r) => r.id === routeId);
      if (!route) {
        return { success: false, error: 'Route not found.' };
      }
      const newVehicle = fleet.find((v) => v.id === newVehicleId);
      if (!newVehicle) {
        return { success: false, error: 'Vehicle not found in municipal fleet.' };
      }
      if (newVehicle.id === 'BACK-01' || newVehicle.vehicleType === 'backhoe') {
        return {
          success: false,
          error: 'BACK-01 is specialized remediation equipment and cannot be assigned to hauling routes.',
        };
      }
      if (
        newVehicle.status === 'maintenance' ||
        newVehicle.status === 'offline' ||
        !newVehicle.availableForDispatch
      ) {
        return {
          success: false,
          error: 'Selected vehicle is under maintenance or unavailable for dispatch.',
        };
      }
      if (newVehicle.capacityKg < route.totalDemandKg) {
        return { success: false, error: 'Vehicle capacity insufficient for this route.' };
      }

      const originalVehicleId = route.effectiveVehicleId || route.vehicleId;
      const override: OfficerOverride = {
        overrideId: `OVR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        routeId,
        targetId: newVehicleId,
        officerName: 'Ward Officer (Human-in-the-Loop)',
        action: 'vehicle_reassignment',
        reason: reason.trim(),
        originalVehicleId,
        newVehicleId,
        createdAt: new Date().toISOString(),
        status: 'applied',
      };

      setRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId
            ? {
                ...r,
                effectiveVehicleId: newVehicleId,
                operationalStatus: 'officer_reviewed' as const,
              }
            : r
        )
      );

      // Invalidate existing manifest so it must be regenerated with new vehicle info
      setDriverManifests((prev) =>
        prev.map((m) => (m.routeId === routeId ? { ...m, isStale: true } : m))
      );

      setOfficerOverrides((prev) => [override, ...prev]);
      return { success: true };
    },
    [routes, fleet]
  );

  const reorderStops = useCallback(
    async (
      routeId: string,
      newStopIds: string[],
      reason: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!reason || !reason.trim()) {
        return { success: false, error: 'A valid reason is required for stop reordering.' };
      }
      const route = routes.find((r) => r.id === routeId);
      if (!route) {
        return { success: false, error: 'Route not found.' };
      }
      const baseStops = route.stops;
      const getStopId = (s: RouteStop) => s.hotspotId || s.stopId;
      if (newStopIds.length !== baseStops.length) {
        return { success: false, error: 'Invalid stop order: stop count mismatch.' };
      }
      const allFound = newStopIds.every((id) => baseStops.some((s) => getStopId(s) === id));
      if (!allFound) {
        return { success: false, error: 'Invalid stop order: all stops must be included.' };
      }

      const activeVehicleId = route.effectiveVehicleId || route.vehicleId;
      const vehicle = fleet.find((v) => v.id === activeVehicleId);
      const vehicleCapacity = vehicle?.capacityKg || route.vehicleCapacityKg || 7000;

      let cumulative = 0;
      const updatedStops: RouteStop[] = newStopIds.map((id, index) => {
        const found = baseStops.find((s) => getStopId(s) === id)!;
        cumulative += found.estimatedDemandKg;
        return {
          ...found,
          sequence: index + 1,
          stopSequence: index + 1,
          cumulativeLoadKg: cumulative,
          remainingVehicleCapacityKg: Math.max(0, vehicleCapacity - cumulative),
        };
      });

      const originalOrder = (route.effectiveStops || route.stops).map(getStopId);
      const override: OfficerOverride = {
        overrideId: `OVR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        routeId,
        officerName: 'Ward Officer (Human-in-the-Loop)',
        action: 'stop_reorder',
        reason: reason.trim(),
        originalStopOrder: originalOrder,
        newStopOrder: newStopIds,
        createdAt: new Date().toISOString(),
        status: 'applied',
      };

      setRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId
            ? {
                ...r,
                effectiveStops: updatedStops,
                operationalStatus: 'officer_reviewed' as const,
              }
            : r
        )
      );

      // Invalidate existing manifest so it must be regenerated with reordered stops
      setDriverManifests((prev) =>
        prev.map((m) => (m.routeId === routeId ? { ...m, isStale: true } : m))
      );

      setOfficerOverrides((prev) => [override, ...prev]);
      return { success: true };
    },
    [routes, fleet]
  );

  const holdRoute = useCallback(
    async (routeId: string, reason: string): Promise<{ success: boolean; error?: string }> => {
      if (!reason || !reason.trim()) {
        return { success: false, error: 'A valid reason is required to hold route.' };
      }
      const route = routes.find((r) => r.id === routeId);
      if (!route) {
        return { success: false, error: 'Route not found.' };
      }

      const override: OfficerOverride = {
        overrideId: `OVR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        routeId,
        officerName: 'Ward Officer (Human-in-the-Loop)',
        action: 'route_hold',
        reason: reason.trim(),
        createdAt: new Date().toISOString(),
        status: 'applied',
      };

      setRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId
            ? {
                ...r,
                operationalStatus: 'on_hold' as const,
                heldReason: reason.trim(),
              }
            : r
        )
      );

      setOfficerOverrides((prev) => [override, ...prev]);
      return { success: true };
    },
    [routes]
  );

  const resumeRoute = useCallback(
    async (routeId: string): Promise<{ success: boolean; error?: string }> => {
      const route = routes.find((r) => r.id === routeId);
      if (!route) {
        return { success: false, error: 'Route not found.' };
      }

      setRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId
            ? {
                ...r,
                operationalStatus:
                  r.effectiveVehicleId || r.effectiveStops ? ('officer_reviewed' as const) : ('optimized' as const),
                heldReason: undefined,
              }
            : r
        )
      );

      return { success: true };
    },
    [routes]
  );

  const approveDispatch = useCallback(
    async (routeId: string, manifestId: string): Promise<{ success: boolean; error?: string }> => {
      const route = routes.find((r) => r.id === routeId);
      if (!route) {
        return { success: false, error: 'Route not found.' };
      }

      if (route.operationalStatus === 'on_hold') {
        return { success: false, error: 'Cannot dispatch route: Route is currently placed on hold.' };
      }

      const manifest = driverManifests.find((m) => m.manifestId === manifestId);
      if (!manifest) {
        return { success: false, error: 'Driver manifest not found. Generate manifest before dispatch.' };
      }

      if (manifest.isStale) {
        return { success: false, error: 'Manifest is stale. Regenerate before dispatch.' };
      }

      const activeStops = route.effectiveStops || route.stops;
      if (!activeStops || activeStops.length === 0) {
        return { success: false, error: 'Cannot dispatch route: Route has zero collection stops.' };
      }

      const activeVehicleId = route.effectiveVehicleId || route.vehicleId;
      const vehicle = fleet.find((v) => v.id === activeVehicleId);
      if (!vehicle) {
        return { success: false, error: 'Assigned vehicle not found in municipal fleet.' };
      }
      if (vehicle.id === 'BACK-01' || vehicle.vehicleType === 'backhoe') {
        return { success: false, error: 'Cannot dispatch: BACK-01 is specialized remediation machinery.' };
      }
      if (vehicle.status === 'maintenance' || vehicle.status === 'offline') {
        return { success: false, error: 'Cannot dispatch: Vehicle is under maintenance or offline.' };
      }
      if (vehicle.capacityKg < route.totalDemandKg) {
        return { success: false, error: 'Cannot dispatch: Vehicle capacity is less than total route demand.' };
      }

      const override: OfficerOverride = {
        overrideId: `OVR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        routeId,
        manifestId,
        officerName: 'Ward Officer (Human-in-the-Loop)',
        action: 'dispatch_approval',
        reason: 'Municipal officer approved route for immediate field dispatch.',
        createdAt: new Date().toISOString(),
        status: 'applied',
      };

      setRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId
            ? {
                ...r,
                operationalStatus: 'dispatched' as const,
                status: 'dispatched' as const,
              }
            : r
        )
      );

      setDriverManifests((prev) =>
        prev.map((m) =>
          m.manifestId === manifestId ? { ...m, status: 'dispatched' as const } : m
        )
      );

      setFleet((prev) =>
        prev.map((v) =>
          v.id === activeVehicleId ? { ...v, status: 'assigned' as const } : v
        )
      );

      setOfficerOverrides((prev) => [override, ...prev]);
      return { success: true };
    },
    [routes, driverManifests, fleet]
  );

  const rejectDispatch = useCallback(
    async (
      routeId: string,
      manifestId: string,
      reason: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!reason || !reason.trim()) {
        return { success: false, error: 'A valid rejection reason is required.' };
      }
      const route = routes.find((r) => r.id === routeId);
      if (!route) {
        return { success: false, error: 'Route not found.' };
      }

      const override: OfficerOverride = {
        overrideId: `OVR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        routeId,
        manifestId,
        officerName: 'Ward Officer (Human-in-the-Loop)',
        action: 'dispatch_rejection',
        reason: reason.trim(),
        createdAt: new Date().toISOString(),
        status: 'applied',
      };

      setRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId
            ? {
                ...r,
                operationalStatus: 'on_hold' as const,
                heldReason: `Dispatch rejected: ${reason.trim()}`,
              }
            : r
        )
      );

      setDriverManifests((prev) =>
        prev.map((m) =>
          m.manifestId === manifestId ? { ...m, status: 'cancelled' as const } : m
        )
      );

      setOfficerOverrides((prev) => [override, ...prev]);
      return { success: true };
    },
    [routes]
  );

  // Initial road route calculation on client mount
  const initialRoadRoutingAttempted = useRef(false);
  useEffect(() => {
    if (!initialRoadRoutingAttempted.current && routes.length > 0) {
      initialRoadRoutingAttempted.current = true;
      recalculateRoadRoutes();
    }
  }, [recalculateRoadRoutes, routes]);

  // ─── Firestore Persistence Effects (debounced write-back) ──────
  // Only persist after hydration is complete to avoid overwriting Firestore
  // with initial demo state before the real data has been loaded.

  useEffect(() => {
    if (!firestoreReady) return;
    const timer = setTimeout(() => { persistReports(reports); }, 2000);
    return () => clearTimeout(timer);
  }, [reports, firestoreReady]);

  useEffect(() => {
    if (!firestoreReady) return;
    const timer = setTimeout(() => { persistHotspots(hotspots); }, 2000);
    return () => clearTimeout(timer);
  }, [hotspots, firestoreReady]);

  useEffect(() => {
    if (!firestoreReady) return;
    const timer = setTimeout(() => { persistFleet(fleet); }, 2000);
    return () => clearTimeout(timer);
  }, [fleet, firestoreReady]);

  useEffect(() => {
    if (!firestoreReady) return;
    const timer = setTimeout(() => { persistRoutes(routes); }, 2000);
    return () => clearTimeout(timer);
  }, [routes, firestoreReady]);

  useEffect(() => {
    if (!firestoreReady) return;
    const timer = setTimeout(() => { persistManifests(driverManifests); }, 2000);
    return () => clearTimeout(timer);
  }, [driverManifests, firestoreReady]);

  useEffect(() => {
    if (!firestoreReady) return;
    const timer = setTimeout(() => { persistOverrides(officerOverrides); }, 2000);
    return () => clearTimeout(timer);
  }, [officerOverrides, firestoreReady]);

  const totalReports = reports.length;
  const activeHotspots = hotspots.filter((h) => h.status === 'active').length;
  const highPriorityHotspots = hotspots.filter(
    (h) => h.urgencyLevel === 'high' || h.urgencyLevel === 'critical'
  ).length;
  const totalClusteredWasteKg = hotspots
    .filter((h) => h.status === 'active')
    .reduce((sum, h) => sum + h.totalEstimatedWasteKg, 0);
  const availableFleetCount = fleet.filter((v) => v.status === 'available').length;
  const totalFleetCount = fleet.length;

  const kpis: DashboardKPIs = {
    totalReports,
    activeHotspots,
    highPriorityHotspots,
    pendingCollectionTons: Math.round((totalClusteredWasteKg / 1000) * 10) / 10,
    availableFleetCount,
    totalFleetCount,
  };

  return (
    <ReportsContext.Provider
      value={{
        reports,
        totalReports,
        hotspots,
        clusteringResult,
        isClustering,
        geospatialEngine,
        fleet,
        routes,
        optimizationResult,
        isOptimizingRoutes,
        isRoadRouting,
        routeOptimizationEngine,
        kpis,
        aiEngineStatus,
        driverManifests,
        isGeneratingManifest,
        officerOverrides,
        addReport,
        triggerAIAnalysis,
        triggerClustering,
        triggerRouteOptimization,
        recalculateRoadRoutes,
        generateManifest,
        regenerateManifest,
        getManifestForRoute,
        applyPriorityOverride,
        reassignVehicle,
        reorderStops,
        holdRoute,
        resumeRoute,
        approveDispatch,
        rejectDispatch,
        checkAIHealth,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}
