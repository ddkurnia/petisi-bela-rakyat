// Firebase Authentication - Email/Password + Google
import {
  getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider,
  signOut, onAuthStateChanged, type User,
} from 'firebase/auth';
import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { app } from './firebase';
import { isFirebaseConfigured, COLLECTIONS } from './config';
import { getById, db } from './firestore';

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

// ============================================================
// mapUser — read user's Firestore document to get role.
// ============================================================
// ROOT CAUSE of the persistent 'editor' bug (after prior fixes):
//
//   The Firestore client SDK maintains an in-memory + IndexedDB
//   cache of documents it has read. When getDoc() is called, the
//   SDK FIRST checks the cache. If the document is in cache
//   (even with stale data from BEFORE the user was signed in —
//   e.g. a cached permission-denied or a cached "not found"),
//   getDoc() returns the CACHED result WITHOUT hitting the
//   server.
//
//   Before login, the /admin page mounts. init() registers the
//   onAuthChange listener, which fires immediately with null
//   (no user). At this point NO users/{uid} read happens (good).
//   BUT — the page may also trigger other Firestore reads (e.g.
//   settingsService.subscribe, blogService.subscribe). Those
//   reads do not touch users/{uid}, so they don't pollute the
//   user-doc cache.
//
//   However, after signInWithEmailAndPassword() + getIdToken(),
//   the FIRST mapUser() call (from loginWithEmail) does
//   getDoc(users/{uid}). This reads from SERVER (cache miss),
//   gets the correct role, returns super_admin. storeSet happens
//   via onAuthChange. So far so good.
//
//   BUT THEN onAuthStateChanged fires AGAIN (token refresh,
//   Firebase Auth fires multiple events during sign-in). The
//   second mapUser() call hits getDoc(users/{uid}) — this time
//   the doc IS in cache. The cache may contain a stale snapshot
//   from a PREVIOUS session (different user, or same user but
//   before role was set to super_admin). The stale snapshot has
//   role=undefined or role=editor. mapUser returns editor.
//   storeSet({ currentUser: editor }) overwrites super_admin.
//
//   Net effect: even though loginWithEmail's mapUser returned
//   super_admin, the SECOND onAuthChange fire (seconds later)
//   overwrites with editor. The user sees editor menu.
//
// FIX:
//   1. Use getDocFromServer() for user-role reads. This BYPASSES
//      the cache entirely and always fetches fresh from server.
//      This guarantees we read the CURRENT role value, not a
//      stale cached copy.
//   2. Guard against overwrite: onAuthChange's mapUser only sets
//      currentUser if the new role is at least as authoritative
//      as the current one. If we already have super_admin, do not
//      let a transient editor-fallback overwrite it.
//   3. Keep the retry loop as defense-in-depth (covers brief
//      network blips), but the primary fix is getDocFromServer.
// ============================================================
async function mapUser(fbUser: User): Promise<AppUser> {
  let role: Role = 'editor';
  let displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Admin';

  const MAX_ATTEMPTS = 3;
  const RETRY_DELAY_MS = 300;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // CRITICAL: use getDocFromServer() to bypass the Firestore
      // SDK's local cache. The cache may contain a stale snapshot
      // of users/{uid} from before the current sign-in (e.g. from
      // a previous session, or from a transient read that returned
      // permission-denied). getDoc() would return the cached value
      // without hitting the server, causing role to be undefined
      // or stale. getDocFromServer() forces a fresh server read.
      let userDoc: { role?: Role; displayName?: string } | null = null;
      if (db) {
        const ref = doc(db, COLLECTIONS.USERS, fbUser.uid);
        const snap = await getDocFromServer(ref);
        if (snap.exists()) {
          userDoc = snap.data() as { role?: Role; displayName?: string };
        }
      } else {
        // Fallback to getById if db not available (shouldn't happen)
        userDoc = await getById<{ role?: Role; displayName?: string }>(COLLECTIONS.USERS, fbUser.uid);
      }

      if (userDoc) {
        // Be strict: only accept role if it's a non-empty string.
        // If role field is missing/empty/undefined, fall back to
        // 'editor' but DO log so we can diagnose.
        const docRole = userDoc.role;
        if (typeof docRole === 'string' && docRole.length > 0) {
          role = docRole as Role;
        } else {
          console.warn('[auth] users/{uid} document exists but role field is missing or invalid. Got:', docRole, 'Full doc:', userDoc);
        }
        if (userDoc.displayName) displayName = userDoc.displayName;
      } else {
        // Document does not exist. This is a real problem — the
        // user is authenticated but has no Firestore user doc.
        console.warn('[auth] users/' + fbUser.uid + ' document does NOT exist. Run: bun run setup-admin ' + fbUser.email);
      }
      break; // success — exit retry loop
    } catch (err) {
      console.warn('[auth] mapUser attempt', attempt, 'failed:', err);
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
      } else {
        console.warn('[auth] role lookup failed after', MAX_ATTEMPTS, 'attempts');
      }
    }
  }

  return { uid: fbUser.uid, email: fbUser.email || '', displayName, role, photoURL: fbUser.photoURL || '' };
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!auth) return { success: false, error: 'Firebase Auth tidak terkonfigurasi' };
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // Force Firestore to pick up the new auth token. Without this,
    // the Firestore SDK's internal auth listener may still use a
    // stale token, causing the subsequent user-doc read to hang
    // for up to 60 seconds (Firestore default timeout).
    await cred.user.getIdToken();

    const user = await mapUser(cred.user);
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: translateError(err?.code || '') };
  }
}

export async function loginWithGoogle(): Promise<AuthResult> {
  if (!auth) return { success: false, error: 'Firebase Auth tidak terkonfigurasi' };
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    await cred.user.getIdToken();
    const user = await mapUser(cred.user);
    return { success: true, user };
  } catch (err: any) { return { success: false, error: translateError(err?.code || '') }; }
}

export async function logout(): Promise<void> { if (auth) await signOut(auth); }

// ============================================================
// onAuthChange — single source of truth for currentUser.
// ============================================================
// GUARD: if the new mapUser() result has a fallback role 'editor'
// but the current store already has a more authoritative role
// (super_admin or admin), DO NOT overwrite. This prevents a
// transient onAuthStateChanged fire (e.g. token refresh mid-
// sign-in) from clobbering the correct role with the editor
// fallback.
//
// The guard is implemented via an optional "currentRoleGetter"
// callback so onAuthChange can ask the store what role is
// currently set before deciding to overwrite.
// ============================================================
let currentRoleGetter: (() => Role | null) | null = null;

export function setCurrentRoleGetter(getter: () => Role | null) {
  currentRoleGetter = getter;
}

export function onAuthChange(cb: (user: AppUser | null) => void): () => void {
  if (!auth) { cb(null); return () => {}; }
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        const user = await mapUser(fbUser);

        // Guard against editor-fallback overwriting a real role.
        // If the store already has super_admin or admin, and the
        // new mapUser returned 'editor' (the fallback), skip the
        // callback — the existing role is more authoritative.
        if (user.role === 'editor' && currentRoleGetter) {
          const existing = currentRoleGetter();
          if (existing === 'super_admin' || existing === 'admin') {
            console.warn('[auth] onAuthChange: skipping overwrite of', existing, 'with editor fallback');
            return;
          }
        }

        cb(user);
      } catch (err) {
        console.warn('[auth] onAuthChange mapUser threw:', err);
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
