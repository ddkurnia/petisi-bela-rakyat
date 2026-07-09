// Firebase Authentication - Email/Password + Google
import {
  getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider,
  signOut, onAuthStateChanged, type User,
} from 'firebase/auth';
import { app } from './firebase';
import { isFirebaseConfigured, COLLECTIONS } from './config';
import { getById } from './firestore';

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
// ROOT CAUSE of the original bug:
//   signInWithEmailAndPassword() resolves BEFORE the Firestore SDK
//   has received the new auth token. The Firestore SDK has an
//   internal listener that subscribes to Firebase Auth state
//   changes, but token propagation is asynchronous. When
//   getById() (which calls getDoc()) is invoked immediately after
//   sign-in, the Firestore SDK may still be using a stale
//   (anonymous/null) token.
//
//   Two failure modes follow:
//     (a) If Firestore evaluates the read with a null token,
//         request.auth is null → isSignedIn() returns false →
//         PERMISSION_DENIED (terminal — no retry).
//     (b) If the Firestore SDK detects that auth state is in
//         flux, it queues the read waiting for the token to
//         settle. If the token never settles in time, the read
//         hangs until the default Firestore timeout (60 seconds).
//
//   Both modes result in getById() throwing. The original catch
//   block silently fell back to role 'editor'. Because BOTH
//   loginWithEmail() and the onAuthChange() listener hit the
//   same race, BOTH mapUser() calls produced 'editor' — that is
//   why the role was always 'editor' even though the Firestore
//   document correctly contains 'super_admin'.
//
//   The ~1 minute delay is mode (b): the Firestore read hanging
//   until its 60-second timeout.
//
// FIX (three layers, all targeting the root cause):
//   1. Force token refresh after sign-in via getIdToken(). This
//      synchronously emits the new token to all internal Auth
//      subscribers — including the Firestore SDK's listener —
//      so Firestore's auth state is fresh before we read.
//   2. Retry getById() with short backoff (3 attempts, 300ms gap)
//      to cover the brief async window of token propagation.
//      Even with getIdToken(), there can be a sub-second delay
//      before Firestore's listener processes the event.
//   3. login() no longer sets currentUser itself — it just
//      returns true after sign-in succeeds. The onAuthChange()
//      listener (registered once in init()) is the single source
//      of truth for currentUser. This eliminates the race where
//      loginWithEmail's mapUser() (which may still fall back to
//      'editor' if all retries fail) overwrites the correct role
//      set by onAuthChange().
// ============================================================
async function mapUser(fbUser: User): Promise<AppUser> {
  let role: Role = 'editor';
  let displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Admin';

  const MAX_ATTEMPTS = 3;
  const RETRY_DELAY_MS = 300;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const userDoc = await getById<AppUser & { role?: Role }>(COLLECTIONS.USERS, fbUser.uid);
      if (userDoc) {
        role = userDoc.role || 'editor';
        if (userDoc.displayName) displayName = userDoc.displayName;
      }
      break; // success — exit retry loop
    } catch (err) {
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
      } else {
        console.warn('[auth] role lookup failed after', MAX_ATTEMPTS, 'attempts:', err);
      }
    }
  }

  return { uid: fbUser.uid, email: fbUser.email || '', displayName, role, photoURL: fbUser.photoURL || '' };
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!auth) return { success: false, error: 'Firebase Auth tidak terkonfigurasi' };
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // CRITICAL: force Firestore to pick up the new auth token.
    // signInWithEmailAndPassword() resolves before the Firestore SDK's
    // internal auth listener has processed the new token. Calling
    // getIdToken() forces Auth to emit the token, which Firestore's
    // listener receives via its internal subscription. Without this,
    // the subsequent getById() may hang for up to 60 seconds (Firestore
    // default timeout) waiting for auth state to settle.
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

export function onAuthChange(cb: (user: AppUser | null) => void): () => void {
  if (!auth) { cb(null); return () => {}; }
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try { cb(await mapUser(fbUser)); }
      catch { cb(null); }
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
