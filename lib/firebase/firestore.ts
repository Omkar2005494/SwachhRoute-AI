/**
 * SwachhRoute AI — Firestore Persistence Service
 *
 * Provides read/write helpers for persisting application state to
 * Cloud Firestore.  Every function gracefully falls back to a no-op
 * when Firebase is not configured (e.g. missing API key) so the app
 * continues to work in pure demo / offline mode.
 *
 * Collections:
 *   reports          — citizen waste reports
 *   hotspots         — DBSCAN-clustered hotspots
 *   fleet            — municipal fleet vehicles
 *   routes           — OR-Tools optimised routes
 *   manifests        — driver shift manifests
 *   officerOverrides — human-in-the-loop audit log
 *   metadata         — singleton docs (kpis, engineStatus, etc.)
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
  query,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { getFirestoreDb } from './config';
import type { WasteReport } from '@/types';
import type { Hotspot } from '@/types';
import type { FleetVehicle } from '@/types';
import type { OptimizedRoute } from '@/types';
import type { DriverManifest } from '@/types';
import type { OfficerOverride } from '@/types';

// ─── Collection names ───────────────────────────────────────────
const COLL_REPORTS = 'reports';
const COLL_HOTSPOTS = 'hotspots';
const COLL_FLEET = 'fleet';
const COLL_ROUTES = 'routes';
const COLL_MANIFESTS = 'manifests';
const COLL_OVERRIDES = 'officerOverrides';

// ─── Generic helpers ────────────────────────────────────────────

function isAvailable(): boolean {
  return getFirestoreDb() !== null;
}

/**
 * Batch-write an array of documents to a collection.
 * Each item must have an `id` field used as the Firestore document ID.
 */
async function batchSet<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  const db = getFirestoreDb();
  if (!db || items.length === 0) return;

  // Firestore batch limit is 500 writes
  const BATCH_LIMIT = 500;
  for (let i = 0; i < items.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    const slice = items.slice(i, i + BATCH_LIMIT);
    for (const item of slice) {
      const ref = doc(db, collectionName, item.id);
      batch.set(ref, sanitise(item) as DocumentData);
    }
    await batch.commit();
  }
}

/**
 * Read all documents from a Firestore collection.
 */
async function readAll<T>(
  collectionName: string,
  orderField?: string,
  maxDocs: number = 1000
): Promise<T[]> {
  const db = getFirestoreDb();
  if (!db) return [];

  const colRef = collection(db, collectionName);
  const q = orderField
    ? query(colRef, orderBy(orderField, 'desc'), limit(maxDocs))
    : query(colRef, limit(maxDocs));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

/**
 * Sanitise an object for Firestore by stripping `undefined` values
 * (Firestore rejects explicit `undefined`).
 */
function sanitise(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      result[key] = value.map((v) =>
        v && typeof v === 'object' && !Array.isArray(v)
          ? sanitise(v as Record<string, unknown>)
          : v
      );
    } else if (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof Timestamp)) {
      result[key] = sanitise(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ─── Public API ─────────────────────────────────────────────────

export { isAvailable as isFirestoreAvailable };

// ── Reports ─────────────────────────────────────────────────────

export async function persistReports(reports: WasteReport[]): Promise<void> {
  try {
    await batchSet(COLL_REPORTS, reports);
  } catch (err) {
    console.warn('[Firestore] Failed to persist reports:', err);
  }
}

export async function loadReports(): Promise<WasteReport[]> {
  try {
    return await readAll<WasteReport>(COLL_REPORTS, 'timestamp');
  } catch (err) {
    console.warn('[Firestore] Failed to load reports:', err);
    return [];
  }
}

// ── Hotspots ────────────────────────────────────────────────────

export async function persistHotspots(hotspots: Hotspot[]): Promise<void> {
  try {
    await batchSet(COLL_HOTSPOTS, hotspots);
  } catch (err) {
    console.warn('[Firestore] Failed to persist hotspots:', err);
  }
}

export async function loadHotspots(): Promise<Hotspot[]> {
  try {
    return await readAll<Hotspot>(COLL_HOTSPOTS);
  } catch (err) {
    console.warn('[Firestore] Failed to load hotspots:', err);
    return [];
  }
}

// ── Fleet ───────────────────────────────────────────────────────

export async function persistFleet(fleet: FleetVehicle[]): Promise<void> {
  try {
    await batchSet(COLL_FLEET, fleet);
  } catch (err) {
    console.warn('[Firestore] Failed to persist fleet:', err);
  }
}

export async function loadFleet(): Promise<FleetVehicle[]> {
  try {
    return await readAll<FleetVehicle>(COLL_FLEET);
  } catch (err) {
    console.warn('[Firestore] Failed to load fleet:', err);
    return [];
  }
}

// ── Routes ──────────────────────────────────────────────────────

export async function persistRoutes(routes: OptimizedRoute[]): Promise<void> {
  try {
    await batchSet(COLL_ROUTES, routes);
  } catch (err) {
    console.warn('[Firestore] Failed to persist routes:', err);
  }
}

export async function loadRoutes(): Promise<OptimizedRoute[]> {
  try {
    return await readAll<OptimizedRoute>(COLL_ROUTES);
  } catch (err) {
    console.warn('[Firestore] Failed to load routes:', err);
    return [];
  }
}

// ── Driver Manifests ────────────────────────────────────────────

export async function persistManifests(manifests: DriverManifest[]): Promise<void> {
  try {
    // manifests use manifestId as their ID
    const withId = manifests.map((m) => ({ ...m, id: m.manifestId }));
    await batchSet(COLL_MANIFESTS, withId);
  } catch (err) {
    console.warn('[Firestore] Failed to persist manifests:', err);
  }
}

export async function loadManifests(): Promise<DriverManifest[]> {
  try {
    return await readAll<DriverManifest>(COLL_MANIFESTS);
  } catch (err) {
    console.warn('[Firestore] Failed to load manifests:', err);
    return [];
  }
}

// ── Officer Overrides ───────────────────────────────────────────

export async function persistOverrides(overrides: OfficerOverride[]): Promise<void> {
  try {
    const withId = overrides.map((o) => ({ ...o, id: o.overrideId }));
    await batchSet(COLL_OVERRIDES, withId);
  } catch (err) {
    console.warn('[Firestore] Failed to persist overrides:', err);
  }
}

export async function loadOverrides(): Promise<OfficerOverride[]> {
  try {
    return await readAll<OfficerOverride>(COLL_OVERRIDES, 'createdAt');
  } catch (err) {
    console.warn('[Firestore] Failed to load overrides:', err);
    return [];
  }
}
