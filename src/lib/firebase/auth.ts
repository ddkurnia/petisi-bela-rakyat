// Firebase Authentication - Email/Password + Google
// ============================================================
// DEFINITIVE FIX: eliminate race between loginWithEmail and
// onAuthStateChanged by blocking onAuthChange during login.
// ============================================================
import {
  getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider,
  signOut, onAuthStateChanged, type User,
} from 'firebase/auth';
import { doc, getDocFromServer, collection, addDoc } from 'firebase/firestore';
import { app } from './firebase';
import { isFirebaseConfigured, COLLECTIONS } from './config';
import { db } from './firestore';

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
// CRITICAL: loginInProgress flag
// ============================================================
// When true, onAuthChange listener SKIPS entirely. This eliminates
// the race condition where onAuthChange's mapUser (which may get
// editor fallback due to stale token) overwrites the correct role
// from loginWithEmail.
//
// Flow:
//   1. loginWithEmail sets loginInProgress = true
//   2. onAuthStateChanged fires → onAuthChange checks flag → SKIPS
//   3. loginWithEmail's mapUser reads correct role
//   4. login() in store.ts sets currentUser with correct role
//   5. loginInProgress = false
//   6. Future onAuthChange fires can proceed (but guard also protects)
// ============================================================
let loginInProgress = false;

// ============================================================
// flushTelemetry — write summary to Firestore messages collection
// ============================================================
export async function flushTelemetry(sessionUid: string, finalRole: string) {
  if (!db) {
    console.error('[TELEMETRY] db is null');
    return;
  }
  try {
    await addDoc(collection(db, 'messages'), {
      type: 'debug_telemetry',
      uid: sessionUid,
      finalRole,
      timestamp: new Date().toISOString(),
      loginInProgress,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'unknown',
    });
    log('telemetry FLUSHED', { finalRole });
  } catch (err: any) {
    console.error('[TELEMETRY] FAILED:', err?.code || err?.message);
  }
}

// ============================================================
// getDocWithTimeout — prevent hang
// ============================================================
async function getDocWithTimeout(ref: any, timeoutMs = 5000): Promise<any> {
  return Promise.race([
    getDocFromServer(ref),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`timeout ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

// ============================================================
// mapUser — read user's Firestore document to get role
// ============================================================
async function mapUser(fbUser: User, source: string): Promise<AppUser> {
  log('mapUser START', { source, uid: fbUser.uid });
  const t0 = Date.now();
  let role: Role = 'editor';
  let displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Admin';

  const MAX_ATTEMPTS = 4;
  const DOC_TIMEOUT_MS = 3000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      if (!db) { log('mapUser ERROR', 'db null'); break; }

      // Force refresh token on attempts > 1
      if (attempt > 1) {
        log('mapUser forceRefresh', { attempt });
        await fbUser.getIdToken(true);
        await new Promise((r) => setTimeout(r, 300));
      }

      const ref = doc(db, COLLECTIONS.USERS, fbUser.uid);
      const snap = await getDocWithTimeout(ref, DOC_TIMEOUT_MS);
      log('mapUser RESULT', { attempt, elapsed_ms: Date.now() - t0, exists: snap.exists() });

      if (snap.exists()) {
        const data = snap.data();
        log('mapUser DATA', { role: data.role, keys: Object.keys(data) });
        const docRole = data.role;
        if (typeof docRole === 'string' && docRole.length > 0) {
          role = docRole as Role;
          log('mapUser role ACCEPTED', { role, attempt });
          break;
        } else {
          log('mapUser role INVALID', { docRole });
          break;
        }
      } else {
        log('mapUser NOT FOUND', { attempt });
      }
      if (role !== 'editor') break;
    } catch (err: any) {
      log('mapUser FAILED', { attempt, error: err?.code || err?.message });
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  log('mapUser RETURN', { source, role, elapsed_ms: Date.now() - t0 });
  return { uid: fbUser.uid, email: fbUser.email || '', displayName, role, photoURL: fbUser.photoURL || '' };
}

// ============================================================
// loginWithEmail — production login flow
// ============================================================
export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  log('loginWithEmail START', { email });
  if (!auth) {
    return { success: false, error: 'Firebase Auth tidak terkonfigurasi' };
  }

  // Set flag to BLOCK onAuthChange from firing during login
  loginInProgress = true;
  log('loginInProgress = true');

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    log('signIn SUCCESS', { uid: cred.user.uid });

    // Force token refresh
    await cred.user.getIdToken(true);
    log('getIdToken DONE');

    // Delay to let Firestore SDK process token
    await new Promise((r) => setTimeout(r, 500));

    // Read role from Firestore
    const user = await mapUser(cred.user, 'loginWithEmail');
    log('loginWithEmail RESULT', { role: user.role });

    // Flush telemetry
    await flushTelemetry(cred.user.uid, user.role);

    return { success: true, user };
  } catch (err: any) {
    log('loginWithEmail FAILED', { code: err?.code, message: err?.message });
    try { await flushTelemetry('unknown', 'error'); } catch {}
    return { success: false, error: translateError(err?.code || '') };
  } finally {
    // Clear flag so future onAuthChange fires can proceed
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
    await new Promise((r) => setTimeout(r, 500));
    const user = await mapUser(cred.user, 'loginWithGoogle');
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
// onAuthChange — SKIPS entirely when loginInProgress is true
// ============================================================
let currentRoleGetter: (() => Role | null) | null = null;

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
    // CRITICAL: skip entirely during login flow
    if (loginInProgress) {
      log('onAuthChange SKIP (loginInProgress)');
      return;
    }

    if (fbUser) {
      try {
        const user = await mapUser(fbUser, 'onAuthChange');

        // Guard: don't let editor fallback overwrite super_admin/admin
        if (user.role === 'editor' && currentRoleGetter) {
          const existing = currentRoleGetter();
          if (existing === 'super_admin' || existing === 'admin') {
            log('onAuthChange GUARD SKIP', { existing });
            return;
          }
        }

        log('onAuthChange CALLBACK', { role: user.role });
        cb(user);
      } catch (err) {
        log('onAuthChange ERROR', err);
        cb(null);
      }
    } else {
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
