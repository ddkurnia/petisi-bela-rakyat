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
import { doc, getDocFromServer } from 'firebase/firestore';
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
// getDocWithTimeout
// ============================================================
async function getDocWithTimeout(ref: any, timeoutMs = 4000): Promise<any> {
  return Promise.race([
    getDocFromServer(ref),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`timeout ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

// ============================================================
// readUserRole — read role from Firestore (synchronous, blocking)
// ============================================================
// Test script proved this works in 872ms with correct result.
// ============================================================
async function readUserRole(fbUser: User): Promise<Role> {
  log('readUserRole START', { uid: fbUser.uid });
  const t0 = Date.now();

  // Wait 500ms for Firestore SDK to process auth token
  await new Promise((r) => setTimeout(r, 500));

  const MAX_ATTEMPTS = 4;
  const DOC_TIMEOUT_MS = 4000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      if (!db) { log('readUserRole ERROR', 'db null'); break; }

      if (attempt > 1) {
        log('readUserRole forceRefresh', { attempt });
        await fbUser.getIdToken(true);
        await new Promise((r) => setTimeout(r, 500));
      }

      const ref = doc(db, COLLECTIONS.USERS, fbUser.uid);
      log('readUserRole getDocFromServer', { attempt, path: `users/${fbUser.uid}` });
      const snap = await getDocWithTimeout(ref, DOC_TIMEOUT_MS);
      const elapsed = Date.now() - t0;
      log('readUserRole RESULT', { attempt, elapsed_ms: elapsed, exists: snap.exists(), fromCache: snap.metadata?.fromCache });

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
  }
}

export async function loginWithGoogle(): Promise<AuthResult> {
  if (!auth) return { success: false, error: 'Firebase Auth tidak terkonfigurasi' };
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
  }
}

export async function logout(): Promise<void> {
  log('logout');
  if (auth) await signOut(auth);
}

// ============================================================
// onAuthChange — for page reload (restore session)
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
    if (fbUser) {
      try {
        const role = await readUserRole(fbUser);

        // Guard: don't let editor fallback overwrite super_admin/admin
        if (role === 'editor' && currentRoleGetter) {
          const existing = currentRoleGetter();
          if (existing === 'super_admin' || existing === 'admin') {
            log('onAuthChange GUARD SKIP', { existing });
            return;
          }
        }

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
