// Firebase Authentication - Email/Password + Google
// ============================================================
// SIMPLIFIED: set currentUser IMMEDIATELY after signIn (like admin
// dummy did). Read role from Firestore in BACKGROUND, update after.
// This eliminates delay + stuck issue.
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
async function getDocWithTimeout(ref: any, timeoutMs = 3000): Promise<any> {
  return Promise.race([
    getDocFromServer(ref),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`timeout ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

// ============================================================
// readUserRole — read role from Firestore (async, no throw)
// ============================================================
// Returns role string, or 'editor' as fallback if anything fails.
// Never throws — caller can use result safely.
// ============================================================
async function readUserRole(fbUser: User): Promise<Role> {
  log('readUserRole START', { uid: fbUser.uid });
  const t0 = Date.now();

  const MAX_ATTEMPTS = 3;
  const DOC_TIMEOUT_MS = 3000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      if (!db) { log('readUserRole ERROR', 'db null'); break; }

      if (attempt > 1) {
        log('readUserRole forceRefresh', { attempt });
        await fbUser.getIdToken(true);
        await new Promise((r) => setTimeout(r, 300));
      }

      const ref = doc(db, COLLECTIONS.USERS, fbUser.uid);
      const snap = await getDocWithTimeout(ref, DOC_TIMEOUT_MS);
      log('readUserRole RESULT', { attempt, elapsed_ms: Date.now() - t0, exists: snap.exists() });

      if (snap.exists()) {
        const data = snap.data();
        const docRole = data.role;
        if (typeof docRole === 'string' && docRole.length > 0) {
          log('readUserRole ACCEPTED', { role: docRole, attempt });
          return docRole as Role;
        }
      }
    } catch (err: any) {
      log('readUserRole FAILED', { attempt, error: err?.code || err?.message });
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  log('readUserRole FALLBACK editor', { elapsed_ms: Date.now() - t0 });
  return 'editor';
}

// ============================================================
// loginWithEmail — SIMPLIFIED: set currentUser immediately
// ============================================================
// Like admin dummy: signIn → set user → done. Fast.
// Role is read in BACKGROUND and updates currentUser via callback.
// ============================================================
export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  log('loginWithEmail START', { email });
  if (!auth) {
    return { success: false, error: 'Firebase Auth tidak terkonfigurasi' };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    log('signIn SUCCESS', { uid: cred.user.uid });

    // Force token refresh
    await cred.user.getIdToken(true);
    log('getIdToken DONE');

    // IMMEDIATELY return user with TEMPORARY role 'editor'.
    // The store will set this as currentUser and UI will update
    // (user enters dashboard). Role will be corrected in background.
    const tempUser: AppUser = {
      uid: cred.user.uid,
      email: cred.user.email || '',
      displayName: cred.user.displayName || email.split('@')[0],
      role: 'editor', // temporary — will be updated
      photoURL: cred.user.photoURL || '',
    };

    log('loginWithEmail RETURN tempUser', { role: tempUser.role });
    return { success: true, user: tempUser };
  } catch (err: any) {
    log('loginWithEmail FAILED', { code: err?.code, message: err?.message });
    return { success: false, error: translateError(err?.code || '') };
  }
}

// ============================================================
// fetchUserRoleAndUpdate — background role fetch
// ============================================================
// Called AFTER loginWithEmail returns. Reads role from Firestore
// and calls onRoleUpdate callback so store can update currentUser.
// ============================================================
export async function fetchUserRoleAndUpdate(
  fbUser: User,
  onRoleUpdate: (role: Role) => void
): Promise<void> {
  log('fetchUserRoleAndUpdate START');
  const role = await readUserRole(fbUser);
  log('fetchUserRoleAndUpdate DONE', { role });
  onRoleUpdate(role);
}

export async function loginWithGoogle(): Promise<AuthResult> {
  if (!auth) return { success: false, error: 'Firebase Auth tidak terkonfigurasi' };
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    await cred.user.getIdToken(true);
    const tempUser: AppUser = {
      uid: cred.user.uid,
      email: cred.user.email || '',
      displayName: cred.user.displayName || '',
      role: 'editor',
      photoURL: cred.user.photoURL || '',
    };
    return { success: true, user: tempUser };
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
// During login flow, onAuthChange is BLOCKED entirely via
// loginPhaseActive flag. Only fires for page reload (restore).
// ============================================================
let currentRoleGetter: (() => Role | null) | null = null;
let loginPhaseActive = false;

export function setCurrentRoleGetter(getter: () => Role | null) {
  currentRoleGetter = getter;
}

export function setLoginPhaseActive(active: boolean) {
  loginPhaseActive = active;
  log('setLoginPhaseActive', { active });
}

export function onAuthChange(cb: (user: AppUser | null) => void): () => void {
  log('onAuthChange REGISTER');
  if (!auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (fbUser) => {
    // CRITICAL: block entirely during login phase
    if (loginPhaseActive) {
      log('onAuthChange SKIP (loginPhaseActive)');
      return;
    }

    if (fbUser) {
      try {
        // Read role from Firestore
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
