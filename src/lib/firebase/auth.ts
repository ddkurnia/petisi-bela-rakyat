// Firebase Authentication - Email/Password + Google
// ============================================================
// Two flows:
//   1. LOGIN (user types email+password):
//      signInWithEmailAndPassword → getIdToken → readUserRole → return
//      Uses the MAIN Firestore instance (already authenticated).
//
//   2. PAGE RELOAD (user already signed in via Firebase session):
//      onAuthStateChanged fires → readUserRole → cb(user)
//      Same main instance, same auth context.
//
// CRITICAL: We use the MAIN Firestore instance (from firebase.ts),
// NOT a separate "fresh" instance. Previous code created a fresh
// Firebase app for writes/reads, but that app was NOT authenticated
// (Firebase Auth is per-app-instance), so all reads/writes were
// silently denied by Firestore rules → fell back to 'editor'.
// ============================================================
import {
  getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider,
  signOut, onAuthStateChanged, type User,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, type Firestore } from 'firebase/firestore';
import { app } from './firebase';
import { isFirebaseConfigured, COLLECTIONS } from './config';

const auth = isFirebaseConfigured && app ? getAuth(app) : null;
const googleProvider = new GoogleAuthProvider();

// Main Firestore instance — authenticated via the main app's Auth.
// All reads and writes go through this instance.
const mainDb: Firestore | null = isFirebaseConfigured && app ? getFirestore(app) : null;

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
// readUserRole — read role from users/{uid} via MAIN Firestore
// ============================================================
// The user is signed in on the main app, so the main Firestore
// instance is authenticated. Firestore rules allow self-read:
//   allow read: if isSignedIn() && (request.auth.uid == id || isAdmin());
//
// We use getDoc (cache-first) instead of getDocFromServer because:
//   - For a freshly logged-in user, cache is empty → goes to server
//   - For page reload, cache may have the doc → instant read
//
// Timeout: 8s (single attempt). If it fails, return 'editor' as
// safe default — admin operations will be denied by Firestore rules.
// ============================================================
async function readUserRole(fbUser: User): Promise<Role> {
  log('readUserRole START', { uid: fbUser.uid, email: fbUser.email });
  const t0 = Date.now();

  if (!mainDb) {
    log('readUserRole ERROR', 'mainDb is null — Firebase not configured');
    return 'editor';
  }

  const ref = doc(mainDb, COLLECTIONS.USERS, fbUser.uid);
  log('readUserRole getDoc', { path: `users/${fbUser.uid}` });

  try {
    const snap = await Promise.race([
      getDoc(ref),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('getDoc timeout 8s')), 8000);
      }),
    ]);

    const elapsed = Date.now() - t0;
    log('readUserRole RESULT', { elapsed_ms: elapsed, exists: snap.exists(), fromCache: snap.metadata?.fromCache });

    if (snap.exists()) {
      const data = snap.data();
      const docRole = data.role;
      log('readUserRole DATA', { role: docRole, keys: Object.keys(data) });
      if (docRole === 'super_admin' || docRole === 'admin' || docRole === 'editor') {
        log('readUserRole ACCEPTED', { role: docRole });
        return docRole;
      }
      log('readUserRole INVALID_ROLE', { role: docRole, expected: 'super_admin|admin|editor' });
    } else {
      log('readUserRole NOT_FOUND', { path: `users/${fbUser.uid}` });
      // Document doesn't exist at users/{uid}. Common cause:
      // the document was created via Firebase Console with an
      // auto-generated ID instead of the Auth UID.
      // Run: node scripts/verify-firestore-access.mjs <email> <password>
    }
    return 'editor';
  } catch (err: any) {
    const elapsed = Date.now() - t0;
    log('readUserRole FAILED', { elapsed_ms: elapsed, error: err?.code || err?.message });
    return 'editor';
  }
}

// ============================================================
// loginWithEmail — SYNCHRONOUS: signIn + read role + return
// ============================================================
export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  log('loginWithEmail START', { email });
  if (!auth) {
    return { success: false, error: 'Firebase Auth tidak terkonfigurasi. Set NEXT_PUBLIC_FIREBASE_* di .env.local' };
  }

  // Set flag BEFORE signIn — onAuthStateChanged will fire when signIn
  // resolves, and we want onAuthChange to SKIP during login flow.
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
// onAuthChange — fires on page reload AND login
// ============================================================
// CRITICAL: We DO call readUserRole here. This is needed because:
//   - On page reload, Firebase session is restored but role is not.
//   - We MUST read role from Firestore to know if user is admin.
//
// The loginInProgress flag prevents double-calling during the
// login flow (loginWithEmail already reads role synchronously).
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
      // Skip during login flow — loginWithEmail handles role reading
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

      // Page reload case — read role from Firestore
      log('onAuthChange page restore — reading role from Firestore', { email: fbUser.email });
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
      // User signed out
      log('onAuthChange signed out');
      cb(null);
    }
  });
}

export function getCurrentFirebaseUser(): User | null { return auth?.currentUser || null; }

// Expose mainDb for firestore.ts to use for writes (same authenticated instance)
export function getMainDb(): Firestore | null { return mainDb; }

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
