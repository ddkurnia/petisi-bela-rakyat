// Firebase Authentication - Email/Password + Google
// ============================================================
// INSTRUMENTED VERSION with TELEMETRY — logs to Firestore
// debug_logs collection so user can see in Firebase Console
// without opening DevTools.
// ============================================================
import {
  getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider,
  signOut, onAuthStateChanged, onIdTokenChanged, type User,
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
const telemetryLogs: any[] = [];
let telemetrySessionId = '';

function log(tag: string, ...args: any[]) {
  const seq = ++logSeq;
  const ts = new Date().toISOString().split('T')[1];
  const entry = { seq, ts, tag, args };
  telemetryLogs.push(entry);
  // Keep only last 100 entries to avoid memory bloat
  if (telemetryLogs.length > 100) telemetryLogs.shift();
  console.log(`%c[PBR-AUTH #${seq} ${ts}]`, 'color:#d62828;font-weight:bold', tag, ...args);
  return seq;
}

// ============================================================
// flushTelemetry — write all collected logs to Firestore
// messages collection (type='debug_telemetry').
// Uses 'messages' because its rules already allow public create
// (allow create: if true) — no rules deployment needed.
// ============================================================
export async function flushTelemetry(sessionUid: string, finalRole: string) {
  if (!db) return;
  try {
    telemetrySessionId = `session-${Date.now()}`;
    // Write to 'messages' collection which already has:
    //   allow create: if true;
    // This avoids needing to deploy new Firestore rules.
    // We use type='debug_telemetry' to distinguish from real messages.
    await addDoc(collection(db, 'messages'), {
      type: 'debug_telemetry',
      sessionId: telemetrySessionId,
      uid: sessionUid,
      finalRole,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      logs: telemetryLogs.map(l => ({
        seq: l.seq,
        ts: l.ts,
        tag: l.tag,
        args: JSON.stringify(l.args, (key, val) => {
          if (typeof val === 'function') return '[Function]';
          if (val instanceof Error) return { name: val.name, message: val.message, code: (val as any).code };
          return val;
        }),
      })),
    });
    log('telemetry FLUSHED to messages', { sessionId: telemetrySessionId, logCount: telemetryLogs.length });
    // Show visible alert so user knows telemetry was written
    if (typeof window !== 'undefined') {
      console.log('%c[TELEMETRY WRITTEN] Check Firebase Console → Firestore → messages collection (type=debug_telemetry)', 'color:#16a34a;font-size:14px;font-weight:bold');
    }
  } catch (err: any) {
    log('telemetry FLUSH FAILED', err?.code || err?.message);
    // Last resort: try debug_logs collection too
    try {
      await addDoc(collection(db, 'debug_logs'), {
        type: 'debug_telemetry',
        uid: sessionUid,
        finalRole,
        timestamp: new Date().toISOString(),
        error: err?.code || err?.message,
        logs: telemetryLogs.map(l => ({ seq: l.seq, ts: l.ts, tag: l.tag })),
      });
    } catch {}
  }
}

// ============================================================
// getDocWithTimeout — prevent hang on getDocFromServer
// ============================================================
async function getDocWithTimeout(ref: any, timeoutMs = 5000): Promise<any> {
  return Promise.race([
    getDocFromServer(ref),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`getDocFromServer timeout after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

// ============================================================
// mapUser — read user's Firestore document to get role.
// ============================================================
// ROOT CAUSE of persistent delay + editor in production:
//
// In production with network latency:
//   1. signInWithEmailAndPassword resolves
//   2. getIdToken(true) resolves
//   3. waitForFirestoreAuthReady waits for onIdTokenChanged — but
//      this event may be DELAYED in production (network latency,
//      Firestore SDK internal processing). Falls back to timeout.
//   4. getDocFromServer called, but Firestore SDK still has stale
//      token → either PERMISSION_DENIED or hangs until timeout
//   5. After 3 retries × 5s timeout = 15s total delay
//   6. All retries fail → role falls back to 'editor'
//
// FIX: instead of waiting for an unreliable event, RETRY
// getDocFromServer aggressively with forceRefresh token between
// attempts. If we get a non-editor role, accept immediately.
// If we get editor fallback (doc not found / permission denied),
// force refresh token and retry. This is more reliable than
// waiting for onIdTokenChanged which may never fire in time.
// ============================================================
async function mapUser(fbUser: User, source: string): Promise<AppUser> {
  log('mapUser START', { source, uid: fbUser.uid, email: fbUser.email });
  const t0 = Date.now();
  let role: Role = 'editor';
  let displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Admin';

  const MAX_ATTEMPTS = 6;
  const RETRY_DELAY_MS = 500;
  const DOC_TIMEOUT_MS = 4000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      log('mapUser getDocFromServer', { attempt, path: `users/${fbUser.uid}`, timeout: DOC_TIMEOUT_MS });

      if (!db) {
        log('mapUser ERROR', 'db is null — Firestore not initialized');
        break;
      }

      // Force refresh token on every attempt after the first.
      // This is the KEY fix: instead of waiting for onIdTokenChanged
      // (unreliable in production), we proactively refresh the token
      // before each read. This forces Firestore SDK to pick up the
      // new token via its internal listener.
      if (attempt > 1) {
        log('mapUser forceRefresh token before attempt', { attempt });
        await fbUser.getIdToken(true);
        // Small delay to let Firestore SDK process the new token
        await new Promise((r) => setTimeout(r, 200));
      }

      const ref = doc(db, COLLECTIONS.USERS, fbUser.uid);
      const snap = await getDocWithTimeout(ref, DOC_TIMEOUT_MS);
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
          log('mapUser role ACCEPTED', { role, attempt });

          // If we got a non-editor role, we're confident it's correct.
          // If we got 'editor', it MIGHT be the real role OR a fallback.
          // To distinguish: if the document exists AND has role field,
          // it's the real role (not a fallback). Accept it.
          break;
        } else {
          log('mapUser role INVALID', { docRole, reason: 'not a non-empty string' });
          // Doc exists but role missing — real problem, don't retry
          break;
        }
        if (data.displayName) displayName = data.displayName;
      } else {
        log('mapUser doc NOT FOUND', { path: `users/${fbUser.uid}`, uid: fbUser.uid, attempt });
        // Doc not found — could be transient (token issue) or real.
        // Retry with fresh token.
      }
      // Don't break here — continue retrying if role is still 'editor' fallback
      if (role !== 'editor') break;
    } catch (err: any) {
      log('mapUser attempt FAILED', { attempt, error: err?.code || err?.message });
      if (attempt < MAX_ATTEMPTS) {
        log('mapUser retrying', { delay_ms: RETRY_DELAY_MS });
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      } else {
        log('mapUser ALL RETRIES EXHAUSTED', { attempts: MAX_ATTEMPTS });
      }
    }
  }

  const result = { uid: fbUser.uid, email: fbUser.email || '', displayName, role, photoURL: fbUser.photoURL || '' };
  log('mapUser RETURN', { source, role, elapsed_ms: Date.now() - t0, result });
  return result;
}

// ============================================================
// loginWithEmail — production login flow
// ============================================================
export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  log('loginWithEmail START', { email });
  if (!auth) {
    log('loginWithEmail ABORT', 'auth is null — Firebase not configured');
    return { success: false, error: 'Firebase Auth tidak terkonfigurasi' };
  }
  try {
    log('loginWithEmail calling signInWithEmailAndPassword');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    log('signInWithEmailAndPassword SUCCESS', { uid: cred.user.uid, email: cred.user.email });

    // Force token refresh to emit event to Firestore SDK
    log('loginWithEmail calling getIdToken (force refresh)');
    await cred.user.getIdToken(true);
    log('loginWithEmail getIdToken DONE');

    // Small delay to let Firestore SDK process the token event.
    // This is more reliable than waiting for onIdTokenChanged which
    // may be delayed in production.
    await new Promise((r) => setTimeout(r, 300));

    // mapUser will retry with forceRefresh if needed
    const user = await mapUser(cred.user, 'loginWithEmail');
    log('loginWithEmail RETURN', { success: true, role: user.role });

    // Flush telemetry to Firestore debug_logs so user can see in
    // Firebase Console what happened during login (without DevTools)
    await flushTelemetry(cred.user.uid, user.role);

    return { success: true, user };
  } catch (err: any) {
    log('loginWithEmail FAILED', { code: err?.code, message: err?.message });
    // Also flush on failure
    try { await flushTelemetry('unknown', 'error'); } catch {}
    return { success: false, error: translateError(err?.code || '') };
  }
}

export async function loginWithGoogle(): Promise<AuthResult> {
  if (!auth) return { success: false, error: 'Firebase Auth tidak terkonfigurasi' };
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    await cred.user.getIdToken(true);
    await new Promise((r) => setTimeout(r, 300));
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
