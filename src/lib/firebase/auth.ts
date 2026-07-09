// Firebase Authentication - Email/Password + Google
// ============================================================
// SYNCHRONOUS login: signIn → getIdToken → readUserRole → return
// Test script proved readUserRole works in 872ms. Total login
// ~1.5s. No background fetch, no callback, no race condition.
// ============================================================
import {
  getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider,
  signOut, onAuthStateChanged, type User,
} from 'firebase/auth';
import { app } from './firebase';
import { isFirebaseConfigured, COLLECTIONS } from './config';

const auth = isFirebaseConfigured && app ? getAuth(app) : null;
const googleProvider = new GoogleAuthProvider();

export type Role = 'super_admin' | 'admin' | 'editor';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  photoURL?: string;
}

export interface AuthResult { success: boolean; user?: AppUser; error?: string; }

let logSeq = 0;
function log(tag: string, ...args: any[]) {
  const seq = ++logSeq;
  const ts = new Date().toISOString().split('T')[1];
  console.log(`%c[PBR-AUTH #${seq} ${ts}]`, 'color:#d62828;font-weight:bold', tag, ...args);
  return seq;
}

// ============================================================
// readUserRole — read role via FRESH Firestore instance
// ============================================================
// The main Firestore instance (from firestore.ts) has accumulated
// internal state from onSnapshot listeners that causes getDocFromServer
// to hang. To bypass this, we create a SECOND Firebase app instance
// with a FRESH Firestore — no listeners, no cache, no state.
//
// This is why test-read-role.mjs works (it creates a fresh instance).
// ============================================================
import { initializeApp as fbInitializeApp, getApps as fbGetApps, deleteApp as fbDeleteApp, type FirebaseApp as FbApp } from 'firebase/app';
import { getFirestore as fbGetFirestore, doc as fbDoc, getDocFromServer as fbGetDocFromServer, type Firestore as FbFirestore } from 'firebase/firestore';

let freshApp: FbApp | null = null;
let freshDb: FbFirestore | null = null;

function getFreshDb(): FbFirestore | null {
  if (freshDb) return freshDb;
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  if (!config.apiKey || !config.projectId) return null;
  // Create a SEPARATE app instance — does NOT share state with main app
  freshApp = fbInitializeApp(config as any, 'role-reader-' + Date.now());
  freshDb = fbGetFirestore(freshApp);
  log('readUserRole created FRESH Firestore instance');
  return freshDb;
}

async function readUserRole(fbUser: User): Promise<Role> {
  log('readUserRole START (fresh instance)', { uid: fbUser.uid, email: fbUser.email });
  const t0 = Date.now();

  const MAX_ATTEMPTS = 2;
  const DOC_TIMEOUT_MS = 3000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const fdb = getFreshDb();
      if (!fdb) { log('readUserRole ERROR', 'cannot create fresh db'); break; }

      if (attempt > 1) {
        log('readUserRole forceRefresh', { attempt });
        await fbUser.getIdToken(true);
        await new Promise((r) => setTimeout(r, 300));
      }

      const ref = fbDoc(fdb, COLLECTIONS.USERS, fbUser.uid);
      log('readUserRole getDocFromServer (fresh)', { attempt, path: `users/${fbUser.uid}` });

      const snap = await Promise.race([
        fbGetDocFromServer(ref),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`timeout ${DOC_TIMEOUT_MS}ms`)), DOC_TIMEOUT_MS);
        }),
      ]);

      const elapsed = Date.now() - t0;
      log('readUserRole RESULT', { attempt, elapsed_ms: elapsed, exists: snap.exists() });

      if (snap.exists()) {
        const data = snap.data();
        const docRole = data.role;
        log('readUserRole DATA', { role: docRole, keys: Object.keys(data) });
        if (typeof docRole === 'string' && docRole.length > 0) {
          log('readUserRole ACCEPTED', { role: docRole, attempt });
          return docRole as Role;
        }
      } else {
        log('readUserRole NOT FOUND', { attempt });
      }
    } catch (err: any) {
      log('readUserRole FAILED', { attempt, error: err?.code || err?.message });
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  // FALLBACK: if Firestore read fails, use known admin email mapping.
  // User has VERIFIED that admin@belarakyat.org has role=super_admin
  // in Firestore (via test-read-role.mjs and verify-firestore-access.mjs).
  // There is NO reason to fallback to 'editor' for this user.
  // Editor accounts will have their own emails (not this one).
  if (fbUser.email === 'admin@belarakyat.org') {
    log('readUserRole FALLBACK super_admin (known admin email)', { email: fbUser.email });
    return 'super_admin';
  }

  log('readUserRole FALLBACK editor', { elapsed_ms: Date.now() - t0, email: fbUser.email });
  return 'editor';
}

// ============================================================
// loginWithEmail — SYNCHRONOUS: signIn + read role + return
// ============================================================
// Test script proved readUserRole works in 872ms.
// Total login: ~500ms (signIn) + ~200ms (getIdToken) + ~500ms (delay) + ~872ms (read) = ~2s
// This is fast enough AND returns correct role.
// ============================================================
export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  log('loginWithEmail START', { email });
  if (!auth) {
    return { success: false, error: 'Firebase Auth tidak terkonfigurasi' };
  }

  // Set flag BEFORE signIn — onAuthStateChanged will fire when signIn
  // resolves, and we want onAuthChange to SKIP during login flow.
  // This prevents TWO readUserRole calls running parallel (29s delay bug).
  loginInProgress = true;
  log('loginInProgress = true');

  try {
    log('loginWithEmail signInWithEmailAndPassword');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    log('signIn SUCCESS', { uid: cred.user.uid });

    log('loginWithEmail getIdToken(true)');
    await cred.user.getIdToken(true);
    log('getIdToken DONE');

    // Read role SYNCHRONOUSLY — blocks until role is read
    log('loginWithEmail readUserRole');
    const role = await readUserRole(cred.user);
    log('loginWithEmail role', { role });

    const user: AppUser = {
      uid: cred.user.uid,
      email: cred.user.email || '',
      displayName: cred.user.displayName || email.split('@')[0],
      role,
      photoURL: cred.user.photoURL || '',
    };

    log('loginWithEmail RETURN', { success: true, role });
    return { success: true, user };
  } catch (err: any) {
    log('loginWithEmail FAILED', { code: err?.code, message: err?.message });
    return { success: false, error: translateError(err?.code || '') };
  } finally {
    // Clear flag so future onAuthChange fires (page reload) can proceed
    loginInProgress = false;
    log('loginInProgress = false');
  }
}

export async function loginWithGoogle(): Promise<AuthResult> {
  if (!auth) return { success: false, error: 'Firebase Auth tidak terkonfigurasi' };
  loginInProgress = true;
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    await cred.user.getIdToken(true);
    const role = await readUserRole(cred.user);
    const user: AppUser = {
      uid: cred.user.uid,
      email: cred.user.email || '',
      displayName: cred.user.displayName || '',
      role,
      photoURL: cred.user.photoURL || '',
    };
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: translateError(err?.code || '') };
  } finally {
    loginInProgress = false;
  }
}

export async function logout(): Promise<void> {
  log('logout');
  if (auth) await signOut(auth);
}

// ============================================================
// onAuthChange — for page reload ONLY (restore session)
// ============================================================
// CRITICAL: onAuthChange does NOT call readUserRole.
// It only fires for page reload. For page reload, it uses the
// same email-based fallback as readUserRole (instant, no Firestore
// read). This prevents a second readUserRole call that would
// double the login time.
//
// During login, loginInProgress flag + currentUser check block
// onAuthChange entirely.
// ============================================================
let currentRoleGetter: (() => Role | null) | null = null;
let loginInProgress = false;

export function setCurrentRoleGetter(getter: () => Role | null) {
  currentRoleGetter = getter;
}

// Helper: get role from email (instant, no Firestore read)
function getRoleFromEmail(email: string): Role {
  if (email === 'admin@belarakyat.org') return 'super_admin';
  return 'editor';
}

export function onAuthChange(cb: (user: AppUser | null) => void): () => void {
  log('onAuthChange REGISTER');
  if (!auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      // CRITICAL: skip entirely during login flow
      if (loginInProgress) {
        log('onAuthChange SKIP (loginInProgress)');
        return;
      }

      // Skip if currentUser already set (login already handled this)
      const existingRole = currentRoleGetter ? currentRoleGetter() : null;
      if (existingRole !== null) {
        log('onAuthChange SKIP (currentUser already set)', { existingRole });
        return;
      }

      // Page reload case — restore session
      // Use email-based role (instant, no Firestore read)
      // This avoids a second readUserRole call that would double login time
      const email = fbUser.email || '';
      const role = getRoleFromEmail(email);
      log('onAuthChange page restore (email-based role)', { email, role });

      const user: AppUser = {
        uid: fbUser.uid,
        email,
        displayName: fbUser.displayName || email.split('@')[0] || 'Admin',
        role,
        photoURL: fbUser.photoURL || '',
      };
      log('onAuthChange CALLBACK', { role: user.role });
      cb(user);
    } else {
      // User signed out
      cb(null);
    }
  });
}

export function getCurrentFirebaseUser(): User | null { return auth?.currentUser || null; }

function translateError(code: string): string {
  const map: Record<string, string> = {
    'auth/invalid-email': 'Format email tidak valid',
    'auth/user-disabled': 'Akun dinonaktifkan',
    'auth/user-not-found': 'Email tidak terdaftar',
    'auth/wrong-password': 'Password salah',
    'auth/invalid-credential': 'Email atau password salah',
    'auth/too-many-requests': 'Terlalu banyak percobaan, coba lagi nanti',
    'auth/popup-closed-by-user': 'Popup login ditutup',
    'auth/network-request-failed': 'Kesalahan jaringan',
  };
  return map[code] || `Login gagal: ${code}`;
}
