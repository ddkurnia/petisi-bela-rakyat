// ============================================================
// E2E Test — Document ID mismatch simulation
// ============================================================
// User reported Firestore users/{uid} document contains:
//   active: true (boolean)        ← NOT created by setup-admin.ts
//   createdAt: "..."
//   displayName: "Administrator"
//   email: "admin@belarakyat.org"
//   name: "Super Admin"            ← NOT created by setup-admin.ts
//   role: "super_admin"
//   status: "active"
//   uid: "MRhnJrlASWhECpysSubYHLuAL9S2"
//   updatedAt: "..."
//
// The fields `active` and `name` are NOT produced by setup-admin.ts.
// This strongly suggests the document was created MANUALLY via
// Firebase Console, where the Document ID is auto-generated
// (e.g. "xYz123aBc") — NOT equal to the Auth UID.
//
// getDocFromServer(doc(db, 'users', authUid)) reads by DOCUMENT ID.
// If Document ID ≠ authUid, exists() returns false → role = 'editor'.
//
// This test reproduces that exact scenario and proves it.
// ============================================================

process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

fs.mkdirSync('/tmp/fb-test', { recursive: true });
// NOTE: No rules file → emulator allows ALL reads/writes (permissive).
// This is intentional for test setup: we need to create a doc with
// arbitrary Document ID (not = authUid) which the rules would block.
fs.writeFileSync('/tmp/fb-test/firebase.json', JSON.stringify({
  firestore: { port: 8080 },
  auth: { port: 9099 }, ui: { enabled: false }, singleProjectMode: true,
}));

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
  log('START: Document ID mismatch test');
  log('Simulating user Firestore data: doc created with AUTO-ID, field uid = Auth UID');
  await waitPort(8080); await waitPort(9099);
  await new Promise((r) => setTimeout(r, 2000));

  // STEP 1: Create Auth user
  log('STEP 1: Create Auth user');
  const signUp = await httpReq('POST', 9099, '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key',
    { email: 'admin@belarakyat.org', password: 'Kapal7890@', returnSecureToken: true });
  const authUid = signUp.body?.localId;
  const setupToken = signUp.body?.idToken;
  log('  Auth UID:', authUid);

  // STEP 2: Create users/ doc with Document ID = some other value (NOT = authUid)
  // This simulates creating a doc manually via Firebase Console where
  // the user typed a custom Document ID (or auto-generated) that differs
  // from the Auth UID.
  const fakeDocId = 'manual-doc-id-001';  // Different from authUid
  log('STEP 2: Create users doc with Document ID = "' + fakeDocId + '" (NOT = Auth UID)');
  log('  This simulates manual creation in Firebase Console with custom/auto ID');
  log('  Field uid inside doc = Auth UID, but Document ID = "' + fakeDocId + '"');

  // Use Firestore REST API with explicit documentId (emulator has no rules)
  const createRes = await httpReq('POST', 8080,
    `/v1/projects/demo-pbr/databases/(default)/documents/users?documentId=${fakeDocId}`,
    { fields: {
      uid: { stringValue: authUid },
      email: { stringValue: 'admin@belarakyat.org' },
      displayName: { stringValue: 'Administrator' },
      name: { stringValue: 'Super Admin' },
      role: { stringValue: 'super_admin' },
      status: { stringValue: 'active' },
      active: { booleanValue: true },
      createdAt: { stringValue: '2026-07-08T20:15:31.655Z' },
      updatedAt: { stringValue: '2026-07-08T20:15:31.655Z' },
    } });
  log('  createDoc status:', createRes.status, createRes.status === 200 ? '✓ created' : createRes.raw);
  log('  Document ID in Firestore:', fakeDocId);
  log('  Field uid inside doc:', authUid);
  log('  Document ID === field uid?', fakeDocId === authUid);

  // STEP 3: Initialize client SDK + connect emulators
  log('STEP 3: Init client SDK');
  const { initializeApp } = require('firebase/app');
  const { getAuth, signInWithEmailAndPassword, connectAuthEmulator } = require('firebase/auth');
  const { getFirestore, doc, getDocFromServer, connectFirestoreEmulator } = require('firebase/firestore');
  const app = initializeApp({ apiKey: 'fake-api-key', authDomain: 'demo-pbr.firebaseapp.com', projectId: 'demo-pbr', storageBucket: 'demo-pbr.appspot.com', messagingSenderId: '000', appId: '1:000:web:000' });
  const auth = getAuth(app);
  const db = getFirestore(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);

  // STEP 4: Sign in
  log('STEP 4: Sign in');
  const cred = await signInWithEmailAndPassword(auth, 'admin@belarakyat.org', 'Kapal7890@');
  log('  Sign in success, UID:', cred.user.uid);
  await cred.user.getIdToken();

  // STEP 5: mapUser — read doc by AUTH UID (this is what auth.ts does)
  log('STEP 5: mapUser reads doc by AUTH UID');
  log('  Calling: getDocFromServer(doc(db, "users", "' + cred.user.uid + '"))');
  log('  This reads by DOCUMENT ID = Auth UID');
  log('  But actual Document ID in Firestore = "' + fakeDocId + '"');
  log('  → MISMATCH → exists() should return FALSE');

  const ref = doc(db, 'users', cred.user.uid);
  const snap = await getDocFromServer(ref);
  log('  RESULT:');
  log('    exists:', snap.exists());
  log('    id (what we queried):', snap.id);
  if (snap.exists()) {
    log('    role:', snap.data().role);
  } else {
    log('    role: (doc not found → fallback to "editor")');
  }

  // STEP 6: Verify — also try reading by ACTUAL Document ID (the wrong one)
  log('STEP 6: Verify by reading ACTUAL Document ID ("' + fakeDocId + '")');
  const ref2 = doc(db, 'users', fakeDocId);
  const snap2 = await getDocFromServer(ref2);
  log('  exists:', snap2.exists());
  if (snap2.exists()) {
    log('  role:', snap2.data().role);
    log('  → Doc IS there, just at different Document ID');
  }

  // STEP 7: Verdict
  log('=== VERDICT ===');
  log('  Auth UID:', authUid);
  log('  Firestore Document ID:', fakeDocId);
  log('  Match?', authUid === fakeDocId);
  log('  Read by Auth UID succeeded?', snap.exists());
  log('  Read by fake Doc ID succeeded?', snap2.exists());
  log('  Role from Auth UID read:', snap.exists() ? snap.data().role : 'NOT FOUND → editor fallback');
  log('  Role from fake Doc ID read:', snap2.exists() ? snap2.data().role : 'NOT FOUND');
  log('');
  log('  CONCLUSION:');
  if (!snap.exists() && snap2.exists()) {
    log('  ✅ BUG REPRODUCED: Document ID mismatch is the root cause.');
    log('  ✅ Doc exists in Firestore, but at a different Document ID than Auth UID.');
    log('  ✅ getDocFromServer(doc(db, "users", authUid)) returns exists:false.');
    log('  ✅ mapUser falls back to role="editor".');
    log('');
    log('  FIX: Delete the wrong-ID doc, run `bun run setup-admin admin@belarakyat.org`');
    log('  setup-admin.ts creates doc with doc(uid) → Document ID = Auth UID');
  }

  emu.kill();
  await new Promise((r) => setTimeout(r, 2000));
  log('DONE');
  process.exit(0);
})();
