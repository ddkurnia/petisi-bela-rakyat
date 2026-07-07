// Firebase Client App Init
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { firebaseConfig, isFirebaseConfigured } from './config';

let app: FirebaseApp | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig as any);
} else if (typeof console !== 'undefined') {
  console.warn('[PBR] Firebase env vars missing. Set them in .env.local. See .env.example.');
}

export { app };
export default app;
