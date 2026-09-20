/**
 * Firebase Architecture Boundary
 * Integrates Firebase Auth, Cloud Firestore, and Firebase Storage.
 *
 * This module initialises the Firebase client SDK exactly once
 * and exports the shared app, Firestore, and helper utilities.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export const firebaseConfig: FirebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Returns true when all required Firebase config values are present.
 * The client SDK will not be initialised without at least projectId and apiKey.
 */
export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);
};

/**
 * Singleton Firebase app instance.
 * Safe to call multiple times — will reuse the existing app if already initialised.
 */
let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (_app) return _app;

  _app = getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig as Record<string, string>);
  return _app;
}

/**
 * Returns the shared Firestore instance, or null if Firebase is not configured.
 */
export function getFirestoreDb(): Firestore | null {
  if (_db) return _db;
  const app = getFirebaseApp();
  if (!app) return null;
  _db = getFirestore(app);
  return _db;
}
