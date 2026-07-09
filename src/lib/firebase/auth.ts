// Firebase Authentication - Email/Password + Google
// ============================================================
// Two flows:
//   1. LOGIN (user types email+password):
//      signInWithEmailAndPassword → getIdToken → readUserRole → return
//      readUserRole calls /api/get-role (server-side, bulletproof)
//
//   2. PAGE RELOAD (user already signed in via Firebase session):
//      onAuthStateChanged fires → readUserRole → cb(user)
//
// CRITICAL: readUserRole uses /api/get-role API route (server-side
// firebase-admin) instead of client-side Firestore SDK. This avoids
// all issues with client Firestore state (listeners, cache, hang).
// The server uses firebase-admin which bypasses security rules and
// reads users/{uid} directly.
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
  if (typeof console !== 'undefined') {
    console.log(`%c[PBR-AUTH #${seq} ${ts}]`, 'color:#d62828;font-weight:bold', tag, ...args);
  }
  return seq;
}

// ============================================================
// readUserRole — calls /api/get-role (server-side firebase-admin)
// ============================================================
// PRIMARY: POST idToken to /api/get-role. Server verifies token
//          and reads users/{uid} via admin SDK (bypasses rules).
//          Fast (~200-500ms), no client SDK issues.
//
// FALLBACK: If API route fails (e.g. dev server not running, admin
//          SDK not configured), try direct Firestore getDoc on main
//          instance. Slow but works for development.
// ============================================================
async function readUserRoleViaApi(fbUser: User): Promise<Role | null> {
  try {
    const idToken = await fbUser.getIdToken(false); // false = allow cache
    log('readUserRole API idToken obtained', { tokenLen: idToken.length });

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 8000);

    const res = await fetch('/api/get-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      signal: ctrl.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      log('readUserRole API HTTP error', { status: res.status, error: errBody?.error });
      return null;
    }

    const data = await res.json();
    log('readUserRole API response', { role: data.role, uid: data.uid, warning: data.warning });

    if (data.warning) {
      // Server returned a warning (e.g. doc doesn't exist, invalid role)
      console.warn('[PBR-AUTH] readUserRole warning:', data.warning);
    }

    if (data.role === 'super_admin' || data.role === 'admin' || data.role === 'editor') {
      return data.role;
    }
    return null;
  } catch (err: any) {
    log('readUserRole API failed', { error: err?.name || err?.code || err?.message });
    return null;
  }
}

async function readUserRoleViaFirestore(fbUser: User): Promise<Role> {
  // Fallback: direct Firestore read on main instance
  log('readUserRole FALLBACK to direct Firestore');
  try {
    const { getFirestore, doc, getDoc } = await import('firebase/firestore');
    if (!app) return 'editor';
    const db = getFirestore(app);
    const ref = doc(db, COLLECTIONS.USERS, fbUser.uid);

    const snap = await Promise.race([
      getDoc(ref),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('getDoc timeout 8s')), 8000);
      }),
    ]);

    if (snap.exists()) {
      const role = snap.data().role;
      if (role === 'super_admin' || role === 'admin' || role === 'editor') {
        log('readUserRole FALLBACK success', { role });
        return role;
      }
    }
    log('readUserRole FALLBACK: doc missing or role invalid');
    return 'editor';
  } catch (err: any) {
    log('readUserRole FALLBACK failed', { error: err?.code || err?.message });
    return 'editor';
  }
}

async function readUserRole(fbUser: User): Promise<Role> {
  log('readUserRole START', { uid: fbUser.uid, email: fbUser.email });
  const t0 = Date.now();

  // PRIMARY: API route (server-side firebase-admin)
  const apiRole = await readUserRoleViaApi(fbUser);
  const apiElapsed = Date.now() - t0;
  log('readUserRole API done', { role: apiRole, elapsed_ms: apiElapsed });

  if (apiRole) {
    log('readUserRole ACCEPTED via API', { role: apiRole, elapsed_ms: apiElapsed });
    return apiRole;
  }

  // FALLBACK: direct Firestore (only if API failed)
  log('readUserRole falling back to Firestore', { apiElapsed_ms: apiElapsed });
  const fsRole = await readUserRoleViaFirestore(fbUser);
  log('readUserRole FALLBACK done', { role: fsRole, total_elapsed_ms: Date.now() - t0 });
  return fsRole;
}

// ============================================================
// loginWithEmail — SYNCHRONOUS: signIn + read role + return
// ============================================================
export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  log('loginWithEmail START', { email });
  if (!auth) {
    return { success: false, error: 'Firebase Auth tidak terkonfigurasi. Set NEXT_PUBLIC_FIREBASE_* di .env.local' };
  }

  loginInProgress = true;
  log('loginInProgress = true');

  try {
    log('loginWithEmail signInWithEmailAndPassword');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    log('signIn SUCCESS', { uid: cred.user.uid });

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
    loginInProgress = false;
    log('loginInProgress = false');
  }
}

export async function loginWithGoogle(): Promise<AuthResult> {
  if (!auth) return { success: false, error: 'Firebase Auth tidak terkonfigurasi' };
  loginInProgress = true;
  try {
    const cred = await signInWithPopup(auth, googleProvider);
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
// onAuthChange — fires on page reload AND login
// ============================================================
let currentRoleGetter: (() => Role | null) | null = null;
let loginInProgress = false;

export function setCurrentRoleGetter(getter: () => Role | null) {
  currentRoleGetter = getter;
}

export function onAuthChange(cb: (user: AppUser | null) => void): () => void {
  log('onAuthChange REGISTER');
  if (!auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      if (loginInProgress) {
        log('onAuthChange SKIP (loginInProgress)');
        return;
      }

      const existingRole = currentRoleGetter ? currentRoleGetter() : null;
      if (existingRole !== null) {
        log('onAuthChange SKIP (currentUser already set)', { existingRole });
        return;
      }

      log('onAuthChange page restore — reading role', { email: fbUser.email });
      const role = await readUserRole(fbUser);
      log('onAuthChange role resolved', { role });

      const user: AppUser = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Admin'),
        role,
        photoURL: fbUser.photoURL || '',
      };
      log('onAuthChange CALLBACK', { role: user.role });
      cb(user);
    } else {
      log('onAuthChange signed out');
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
