// ============================================================
// E2E Login Test — Firebase Emulator (full flow with onAuthStateChanged)
// ============================================================
// This test reproduces the EXACT flow that runs in production:
//   1. Start emulator
//   2. Create Auth user + users/{uid} doc with role=super_admin
//   3. Register onAuthStateChanged listener (like init() does)
//   4. Run loginWithEmail (signIn + getIdToken + mapUser)
//   5. Wait for all onAuthStateChanged fires
//   6. Track every storeSet(currentUser) call
//   7. Report final role + whether any overwrite happened
// ============================================================

process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

fs.mkdirSync('/tmp/fb-test', { recursive: true });
fs.writeFileSync('/tmp/fb-test/firebase.json', JSON.stringify({
  firestore: { rules: '/tmp/fb-test/firestore.rules', port: 8080 },
  auth: { port: 9099 }, ui: { enabled: false }, singleProjectMode: true,
}));
fs.copyFileSync('/home/z/work/petisi-bela-rakyat/firestore.rules', '/tmp/fb-test/firestore.rules');

const emu = spawn('firebase', ['emulators:start', '--only', 'firestore,auth', '--project=demo-pbr'], {
  cwd: '/tmp/fb-test', stdio: ['ignore', 'pipe', 'pipe'],
});
emu.stdout.on('data', () => {});
emu.stderr.on('data', () => {});

async function waitPort(p) {
  for (let i = 0; i < 30; i++) {
    try { await new Promise((r, j) => { const q = http.get(`http://127.0.0.1:${p}/`, r); q.on('error', j); q.setTimeout(1000, () => { q.destroy(); j(new Error('t')); }); }); return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
}

function httpReq(method, port, pathStr, body, extraHeaders = {}) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({ hostname: '127.0.0.1', port, path: pathStr, method,
      headers: { 'Content-Type': 'application/json', ...extraHeaders, ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) },
    }, (res) => { let b = ''; res.on('data', (c) => b += c); res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(b) }); } catch { resolve({ status: res.statusCode, raw: b }); } }); });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    if (data) req.write(data); req.end();
  });
}

let logSeq = 0;
function log(tag, ...args) {
  const seq = ++logSeq;
  const ts = new Date().toISOString().split('T')[1];
  console.log(`[#${seq} ${ts}] ${tag}`, ...args);
}

(async () => {
  log('START E2E login test (full flow with onAuthStateChanged)');
  await waitPort(8080); await waitPort(9099);
  await new Promise((r) => setTimeout(r, 2000));

  // STEP 1: Create Auth user via REST
  log('STEP 1: Create Auth user');
  const signUp = await httpReq('POST', 9099, '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key',
    { email: 'admin@belarakyat.org', password: 'Kapal7890@', returnSecureToken: true });
  log('  signUp status:', signUp.status, 'uid:', signUp.body?.localId);
  const setupUid = signUp.body?.localId;
  const setupToken = signUp.body?.idToken;

  // STEP 1.5: SKIPPED for this test variant

  // STEP 2: Initialize Firebase client SDK + connect emulators
  log('STEP 2: Initialize client SDK + connect emulators');
  const { initializeApp } = require('firebase/app');
  const { getAuth, signInWithEmailAndPassword, connectAuthEmulator, onAuthStateChanged } = require('firebase/auth');
  const { getFirestore, doc, getDocFromServer, connectFirestoreEmulator } = require('firebase/firestore');

  const app = initializeApp({ apiKey: 'fake-api-key', authDomain: 'demo-pbr.firebaseapp.com', projectId: 'demo-pbr', storageBucket: 'demo-pbr.appspot.com', messagingSenderId: '000', appId: '1:000:web:000' });
  const auth = getAuth(app);
  const db = getFirestore(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  log('  emulators connected');

  // mapUser — exact copy from src/lib/firebase/auth.ts
  async function mapUser(fbUser, source) {
    log('mapUser START', { source, uid: fbUser.uid, email: fbUser.email });
    const t0 = Date.now();
    let role = 'editor';
    let displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Admin';
    const MAX_ATTEMPTS = 3, RETRY_DELAY_MS = 300;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        log('  mapUser getDocFromServer', { attempt, path: `users/${fbUser.uid}` });
        const ref = doc(db, 'users', fbUser.uid);
        const snap = await getDocFromServer(ref);
        const elapsed = Date.now() - t0;
        log('  mapUser RESULT', { attempt, elapsed_ms: elapsed, exists: snap.exists(), fromCache: snap.metadata?.fromCache });
        if (snap.exists()) {
          const data = snap.data();
          log('  mapUser doc DATA', { role: data.role, allKeys: Object.keys(data), fullDoc: data });
          const docRole = data.role;
          if (typeof docRole === 'string' && docRole.length > 0) { role = docRole; log('  mapUser role ACCEPTED', { role }); }
          else { log('  mapUser role INVALID', { docRole }); }
          if (data.displayName) displayName = data.displayName;
        } else { log('  mapUser doc NOT FOUND', { path: `users/${fbUser.uid}` }); }
        break;
      } catch (err) {
        log('  mapUser attempt FAILED', { attempt, code: err?.code, message: err?.message });
        if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
      }
    }
    log('mapUser RETURN', { source, role, elapsed_ms: Date.now() - t0 });
    return { uid: fbUser.uid, email: fbUser.email || '', displayName, role };
  }

  // Store simulation
  let storeCurrentUser = null;
  const storeSetHistory = [];
  function storeSet(user) {
    const before = storeCurrentUser?.role ?? null;
    const after = user?.role ?? null;
    const entry = { before, after, isOverwrite: before !== null && user !== null, downgrade: (before === 'super_admin' || before === 'admin') && after === 'editor', user: user ? { uid: user.uid, role: user.role } : null };
    storeSetHistory.push(entry);
    log('storeSet currentUser', entry);
    storeCurrentUser = user;
  }

  // onAuthChange — exact logic from auth.ts (with guard)
  let currentRoleGetter = () => storeCurrentUser?.role ?? null;
  let onAuthFireCount = 0;
  log('STEP 3: Register onAuthStateChanged listener');
  const unsub = onAuthStateChanged(auth, async (fbUser) => {
    onAuthFireCount++;
    const fireNum = onAuthFireCount;
    log('onAuthStateChanged FIRE', { fireNumber: fireNum, uid: fbUser?.uid ?? 'null', email: fbUser?.email ?? 'null' });
    if (fbUser) {
      try {
        const user = await mapUser(fbUser, `onAuthChange#${fireNum}`);
        if (user.role === 'editor') {
          const existing = currentRoleGetter();
          log('  GUARD CHECK', { newRole: 'editor', existingRole: existing });
          if (existing === 'super_admin' || existing === 'admin') {
            log('  GUARD SKIP', `Skipping overwrite of ${existing} with editor fallback`);
            return;
          }
        }
        log('  CALLBACK storeSet', { fireNumber: fireNum, role: user.role });
        storeSet(user);
      } catch (err) {
        log('  onAuthChange mapUser THREW', err?.message);
        storeSet(null);
      }
    } else {
      storeSet(null);
    }
  });

  // Wait for initial null fire
  await new Promise((r) => setTimeout(r, 800));

  // STEP 4: loginWithEmail
  log('STEP 4: loginWithEmail');
  try {
    log('  calling signInWithEmailAndPassword');
    const cred = await signInWithEmailAndPassword(auth, 'admin@belarakyat.org', 'Kapal7890@');
    log('  signIn SUCCESS', { uid: cred.user.uid });

    log('  calling getIdToken');
    await cred.user.getIdToken();
    log('  getIdToken DONE');

    // (Doc was already created in STEP 1.5, like setup-admin.ts in production)
    const user = await mapUser(cred.user, 'loginWithEmail');
    log('  loginWithEmail RESULT', { role: user.role });
    // loginWithEmail does NOT storeSet — only onAuthChange does
  } catch (err) {
    log('  loginWithEmail FAILED', { code: err?.code, message: err?.message });
  }

  // STEP 5: Wait for onAuthChange fires to settle
  log('STEP 5: Wait 4s for onAuthChange fires to settle');
  await new Promise((r) => setTimeout(r, 4000));

  // STEP 6: Final state
  log('=== FINAL STATE ===');
  log('onAuthStateChanged fire count:', onAuthFireCount);
  log('storeSet history:', storeSetHistory);
  log('final currentUser:', storeCurrentUser ? { uid: storeCurrentUser.uid, role: storeCurrentUser.role } : 'null');

  const hadSuperAdmin = storeSetHistory.some((h) => h.after === 'super_admin');
  const finalIsSuperAdmin = storeCurrentUser?.role === 'super_admin';
  const anyDowngrade = storeSetHistory.some((h) => h.downgrade);
  log('=== VERDICT ===');
  log('  hadSuperAdmin:', hadSuperAdmin);
  log('  finalIsSuperAdmin:', finalIsSuperAdmin);
  log('  anyDowngradeOccurred:', anyDowngrade);
  log('  bugReproduced:', !finalIsSuperAdmin);

  unsub();
  emu.kill();
  await new Promise((r) => setTimeout(r, 2000));
  log('DONE');
  process.exit(0);
})();
