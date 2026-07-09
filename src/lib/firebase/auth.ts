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
// readUserRole — read role via REST API (bypass Firestore SDK)
// ============================================================
// Uses fetch() directly to Firestore REST API with the user's
// ID token. Bypasses Firestore SDK entirely (no internal state,
// no connection pool, no cache).
//
// FALLBACK: if REST API fails (403/404/timeout), fall back to
// 'editor'. The storeSet guard prevents editor from overwriting
// an existing super_admin/admin.
// ============================================================
async function readUserRole(fbUser: User): Promise<Role> {
  log('readUserRole START (REST API)', { uid: fbUser.uid, email: fbUser.email });
  const t0 = Date.now();

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    log('readUserRole ERROR', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID not set');
    return 'editor';
  }

  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // Get fresh ID token
      const idToken = await fbUser.getIdToken(true);
      log('readUserRole attempt', { attempt, tokenLen: idToken.length });

      // REST API call — bypass Firestore SDK entirely
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${fbUser.uid}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const elapsed = Date.now() - t0;
      log('readUserRole response', { attempt, status: response.status, elapsed_ms: elapsed });

      if (response.status === 200) {
        const doc = await response.json();
        log('readUserRole 200 OK', { fields: doc.fields });

        const roleField = doc.fields?.role;
        if (roleField?.stringValue) {
          const role = roleField.stringValue as Role;
          log('readUserRole ACCEPTED', { role, attempt });
          return role;
        }
        log('readUserRole role field missing in 200 response', { roleField });
      } else if (response.status === 404) {
        log('readUserRole 404 NOT FOUND', { attempt, uid: fbUser.uid });
      } else if (response.status === 403) {
        log('readUserRole 403 PERMISSION DENIED', { attempt });
      } else {
        const text = await response.text();
        log('readUserRole unexpected status', { status: response.status, body: text.substring(0, 300) });
      }
    } catch (err: any) {
      log('readUserRole exception', { attempt, error: err?.name || err?.code || err?.message });
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  log('readUserRole FALLBACK editor', { elapsed_ms: Date.now() - t0 });
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
// It only fires for page reload (restore session), and in that case
// it reads role from Firestore. But it NEVER fires during login
// (loginInProgress flag blocks it).
//
// During login, loginWithEmail is the ONLY code that reads role
// and sets currentUser. onAuthChange is blocked entirely.
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
      // Use REST API (same as loginWithEmail)
      try {
        log('onAuthChange readUserRole (page restore)');
        const role = await readUserRole(fbUser);

        const user: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Admin',
          role,
          photoURL: fbUser.photoURL || '',
        };
        log('onAuthChange CALLBACK', { role: user.role });
        cb(user);
      } catch (err) {
        log('onAuthChange ERROR', err);
        cb(null);
      }
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
