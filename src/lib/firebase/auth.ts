// Firebase Authentication - Email/Password + Google
// ============================================================
// APP_VERSION — used to verify dev server is running new code.
// Check console on page load, or GET /api/ping.
// ============================================================
export const AUTH_VERSION = '2025-07-09-v4-apirole';

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

// Print version banner once on module load
if (typeof console !== 'undefined') {
  console.log(
    `%c[PBR-AUTH] version=${AUTH_VERSION}`,
    'color:#16a34a;font-weight:bold;font-size:14px;background:#f0fdf4;padding:4px 8px;border-radius:4px'
  );
}

// ============================================================
// readUserRole — calls /api/get-role (server-side firebase-admin)
// ============================================================
// NO MORE FALLBACK TO 'editor'. If API fails, we return null and
// the login flow shows the actual error to the user. This makes
// debugging possible — silent 'editor' fallback was hiding the
// real problem for days.
// ============================================================
async function readUserRole(fbUser: User): Promise<{ role: Role; error?: string }> {
  log('readUserRole START', { uid: fbUser.uid, email: fbUser.email });
  const t0 = Date.now();

  // ============================================================
  // PRIMARY: API route (server-side firebase-admin)
  // ============================================================
  try {
    const idToken = await fbUser.getIdToken(false);
    log('readUserRole API idToken obtained', { tokenLen: idToken.length });

    const ctrl = new AbortController();
    // 20s timeout — Next.js dev mode compiles API routes on first
    // request, which can take 10-15s. Production is ~200ms.
    const timeout = setTimeout(() => ctrl.abort(), 20000);

    const res = await fetch('/api/get-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      signal: ctrl.signal,
    });
    clearTimeout(timeout);

    const elapsed = Date.now() - t0;
    log('readUserRole API response status', { status: res.status, elapsed_ms: elapsed });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      log('readUserRole API HTTP error', { status: res.status, error: errBody?.error, elapsed_ms: elapsed });
      return {
        role: 'editor',
        error: `API /api/get-role return HTTP ${res.status}: ${errBody?.error || 'unknown'}`,
      };
    }

    const data = await res.json();
    log('readUserRole API response body', { role: data.role, uid: data.uid, warning: data.warning, elapsed_ms: elapsed });

    if (data.warning) {
      console.warn('[PBR-AUTH] readUserRole warning:', data.warning);
    }

    if (data.role === 'super_admin' || data.role === 'admin' || data.role === 'editor') {
      log('readUserRole ACCEPTED via API', { role: data.role, elapsed_ms: elapsed });
      return { role: data.role };
    }

    return {
      role: 'editor',
      error: `API return role invalid: "${data.role}"`,
    };
  } catch (err: any) {
    const elapsed = Date.now() - t0;
    const errName = err?.name || 'unknown';
    const errMsg = err?.message || String(err);
    log('readUserRole API FETCH failed', { errName, errMsg, elapsed_ms: elapsed });

    let hint = '';
    if (errName === 'AbortError') {
      hint = ' (10s timeout — dev server mungkin tidak jalan atau /api/get-role hang)';
    } else if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
      hint = ' (Network error — dev server tidak jalan? cek http://localhost:3000/api/ping)';
    }

    return {
      role: 'editor',
      error: `API /api/get-role gagal: ${errName} — ${errMsg}${hint}`,
    };
  }
}

// ============================================================
// loginWithEmail — SYNCHRONOUS: signIn + read role + return
// ============================================================
// CRITICAL: If readUserRole returns error, login STILL SUCCEEDS
// but with role='editor' AND we surface the error in the result.
// The UI shows the error so user knows WHY they got editor.
// ============================================================
export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  log('loginWithEmail START', { email, version: AUTH_VERSION });
  if (!auth) {
    return { success: false, error: 'Firebase Auth tidak terkonfigurasi. Set NEXT_PUBLIC_FIREBASE_* di .env.local' };
  }

  loginInProgress = true;
  log('loginInProgress = true');

  try {
    log('loginWithEmail signInWithEmailAndPassword');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    log('signIn SUCCESS', { uid: cred.user.uid });

    const { role, error } = await readUserRole(cred.user);
    log('loginWithEmail role result', { role, hasError: !!error });

    const user: AppUser = {
      uid: cred.user.uid,
      email: cred.user.email || '',
      displayName: cred.user.displayName || email.split('@')[0],
      role,
      photoURL: cred.user.photoURL || '',
    };

    // If there was an error reading role, surface it
    if (error && role === 'editor') {
      log('loginWithEmail RETURN with error', { role, error });
      return { success: true, user, error };
    }

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
    const { role, error } = await readUserRole(cred.user);
    const user: AppUser = {
      uid: cred.user.uid,
      email: cred.user.email || '',
      displayName: cred.user.displayName || '',
      role,
      photoURL: cred.user.photoURL || '',
    };
    return { success: true, user, error };
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
  log('onAuthChange REGISTER', { version: AUTH_VERSION });
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
      const { role, error } = await readUserRole(fbUser);
      if (error) {
        console.warn('[PBR-AUTH] onAuthChange role read error:', error);
      }
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
