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

async function mapUser(fbUser: User): Promise<AppUser> {
  let role: Role = 'editor';
  let displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Admin';
  try {
    // Read the user's own document by ID (= Firebase Auth UID).
    // This is permitted by Firestore rules because the self-read
    // branch (request.auth.uid == id) does not invoke isAdmin(),
    // avoiding the circular dependency that would occur if we
    // queried by 'uid' field (which would need a collection read
    // gated by isAdmin() → getUserRole() → read users/{uid}).
    const userDoc = await getById<AppUser & { role?: Role }>(COLLECTIONS.USERS, fbUser.uid);
    if (userDoc) {
      role = userDoc.role || 'editor';
      if (userDoc.displayName) displayName = userDoc.displayName;
    }
  } catch (err) { console.warn('[auth] role lookup failed:', err); }
  return { uid: fbUser.uid, email: fbUser.email || '', displayName, role, photoURL: fbUser.photoURL || '' };
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!auth) return { success: false, error: 'Firebase Auth tidak terkonfigurasi' };
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = await mapUser(cred.user);
    return { success: true, user };
  } catch (err: any) { return { success: false, error: translateError(err?.code || '') }; }
}

export async function loginWithGoogle(): Promise<AuthResult> {
  if (!auth) return { success: false, error: 'Firebase Auth tidak terkonfigurasi' };
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const user = await mapUser(cred.user);
    return { success: true, user };
  } catch (err: any) { return { success: false, error: translateError(err?.code || '') }; }
}

export async function logout(): Promise<void> { if (auth) await signOut(auth); }

export function onAuthChange(cb: (user: AppUser | null) => void): () => void {
  if (!auth) { cb(null); return () => {}; }
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) { try { cb(await mapUser(fbUser)); } catch { cb(null); } }
    else cb(null);
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
