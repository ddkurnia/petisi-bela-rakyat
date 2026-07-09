// Firebase Authentication - Email/Password + Google
// ============================================================
// INSTRUMENTED VERSION — logging stays in until root cause is
// proven and fixed. Every step logs with [PBR-AUTH] prefix so
// you can filter DevTools console.
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

// ----------------------------------------------------------
// Logging helper — all logs prefixed [PBR-AUTH] for easy filter
// ----------------------------------------------------------
let logSeq = 0;
function log(tag: string, ...args: any[]) {
  const seq = ++logSeq;
  const ts = new Date().toISOString().split('T')[1];
  console.log(`%c[PBR-AUTH #${seq} ${ts}]`, 'color:#d62828;font-weight:bold', tag, ...args);
  return seq;
}

// ----------------------------------------------------------
// mapUser — read user's Firestore document to get role.
// Uses getDocFromServer() to bypass Firestore SDK cache.
// ----------------------------------------------------------
async function mapUser(fbUser: User, source: string): Promise<AppUser> {
  const seq = log('mapUser START', { source, uid: fbUser.uid, email: fbUser.email });
  const t0 = Date.now();
  let role: Role = 'editor';
  let displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Admin';

  const MAX_ATTEMPTS = 3;
  const RETRY_DELAY_MS = 300;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      log('mapUser getDocFromServer', { attempt, path: `users/${fbUser.uid}` });

      if (!db) {
        log('mapUser ERROR', 'db is null — Firestore not initialized');
        break;
      }

      const ref = doc(db, COLLECTIONS.USERS, fbUser.uid);
      const snap = await getDocFromServer(ref);
      const elapsed = Date.now() - t0;

      log('mapUser getDocFromServer RESULT', {
        attempt,
        elapsed_ms: elapsed,
        exists: snap.exists(),
        id: snap.id,
        metadata: snap.metadata ? { fromCache: snap.metadata.fromCache, hasPendingWrites: snap.metadata.hasPendingWrites } : 'no metadata',
      });

      if (snap.exists()) {
        const data = snap.data();
        log('mapUser doc DATA', { role: data.role, displayName: data.displayName, allKeys: Object.keys(data), fullDoc: data });

        const docRole = data.role;
        if (typeof docRole === 'string' && docRole.length > 0) {
          role = docRole as Role;
          log('mapUser role ACCEPTED', { role });
        } else {
          log('mapUser role INVALID', { docRole, reason: 'not a non-empty string' });
        }
        if (data.displayName) displayName = data.displayName;
      } else {
        log('mapUser doc NOT FOUND', { path: `users/${fbUser.uid}`, uid: fbUser.uid });
        log('mapUser HINT', 'Document does not exist. Check: (1) doc ID must equal Auth UID, (2) collection name must be "users"');
      }
      break;
    } catch (err: any) {
      log('mapUser attempt FAILED', { attempt, error: err?.code || err?.message, fullError: err });
      if (attempt < MAX_ATTEMPTS) {
        log('mapUser retrying', { delay_ms: RETRY_DELAY_MS * attempt });
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
      } else {
        log('mapUser ALL RETRIES EXHAUSTED', { attempts: MAX_ATTEMPTS });
      }
    }
  }

  const result = { uid: fbUser.uid, email: fbUser.email || '', displayName, role, photoURL: fbUser.photoURL || '' };
  log('mapUser RETURN', { source, role, elapsed_ms: Date.now() - t0, result });
  return result;
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  log('loginWithEmail START', { email });
  if (!auth) {
    log('loginWithEmail ABORT', 'auth is null — Firebase not configured');
    return { success: false, error: 'Firebase Auth tidak terkonfigurasi' };
  }
  try {
    log('loginWithEmail calling signInWithEmailAndPassword');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    log('loginWithEmailAndPassword SUCCESS', { uid: cred.user.uid, email: cred.user.email });

    log('loginWithEmail calling getIdToken');
    await cred.user.getIdToken();
    log('loginWithEmail getIdToken DONE');

    const user = await mapUser(cred.user, 'loginWithEmail');
    log('loginWithEmail RETURN', { success: true, role: user.role });

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
    await cred.user.getIdToken();
    const user = await mapUser(cred.user, 'loginWithGoogle');
    return { success: true, user };
  } catch (err: any) { return { success: false, error: translateError(err?.code || '') }; }
}

export async function logout(): Promise<void> {
  log('logout');
  if (auth) await signOut(auth);
}

// ----------------------------------------------------------
// onAuthChange — single source of truth for currentUser.
// Guard: if new role is 'editor' (fallback) but store already
// has super_admin/admin, skip the callback.
// ----------------------------------------------------------
let currentRoleGetter: (() => Role | null) | null = null;

export function setCurrentRoleGetter(getter: () => Role | null) {
  currentRoleGetter = getter;
  log('setCurrentRoleGetter REGISTERED');
}

let onAuthChangeCallCount = 0;

export function onAuthChange(cb: (user: AppUser | null) => void): () => void {
  log('onAuthChange REGISTERING listener');
  if (!auth) {
    log('onAuthChange ABORT', 'auth is null — calling cb(null) immediately');
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (fbUser) => {
    onAuthChangeCallCount++;
    const fireNum = onAuthChangeCallCount;
    log('onAuthStateChanged FIRE', { fireNumber: fireNum, uid: fbUser?.uid ?? 'null', email: fbUser?.email ?? 'null' });

    if (fbUser) {
      try {
        const user = await mapUser(fbUser, `onAuthChange#${fireNum}`);

        // Guard: don't let editor fallback overwrite super_admin/admin
        if (user.role === 'editor' && currentRoleGetter) {
          const existing = currentRoleGetter();
          log('onAuthChange GUARD CHECK', { newRole: 'editor', existingRole: existing });
          if (existing === 'super_admin' || existing === 'admin') {
            log('onAuthChange GUARD SKIP', `Skipping overwrite of ${existing} with editor fallback`);
            return;
          }
        }

        log('onAuthChange CALLBACK', { fireNumber: fireNum, role: user.role, willSet: true });
        cb(user);
      } catch (err) {
        log('onAuthChange mapUser THREW', { fireNumber: fireNum, error: err });
        cb(null);
      }
    } else {
      log('onAuthChange CALLBACK', { fireNumber: fireNum, user: 'null', willSet: true });
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
