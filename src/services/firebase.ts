import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';

/**
 * Festora AI - Firebase Client Configuration
 * Public configuration keys populated from environment or sensible emulator defaults.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-festora-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'festora-ai-prod.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'festora-ai-prod',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'festora-ai-prod.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

// Initialize Firebase App singleton safely
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Connect to local emulators when specified in development or testing
if (typeof window !== 'undefined' && (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' || import.meta.env.DEV)) {
  const emulatorHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || '127.0.0.1';
  const authPort = Number(import.meta.env.VITE_FIREBASE_AUTH_PORT) || 9099;
  const firestorePort = Number(import.meta.env.VITE_FIREBASE_FIRESTORE_PORT) || 8080;

  // Prevent connecting multiple times during Vite Hot Module Reloading
  if (!(auth as unknown as { _emulatorConnected?: boolean })._emulatorConnected) {
    try {
      connectAuthEmulator(auth, `http://${emulatorHost}:${authPort}`, { disableWarnings: true });
      (auth as unknown as { _emulatorConnected?: boolean })._emulatorConnected = true;
    } catch {
      // Already connected
    }
  }

  if (!(db as unknown as { _emulatorConnected?: boolean })._emulatorConnected) {
    try {
      connectFirestoreEmulator(db, emulatorHost, firestorePort);
      (db as unknown as { _emulatorConnected?: boolean })._emulatorConnected = true;
    } catch {
      // Already connected
    }
  }
}
