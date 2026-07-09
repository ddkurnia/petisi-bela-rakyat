// ============================================================
// diagnose-login.mjs
// ============================================================
// Run this in Termux to diagnose why login returns wrong role.
//
// Usage:
//   node scripts/diagnose-login.mjs admin@belarakyat.org Kapal7890@
//
// This script does THREE checks:
//   1. Client-side: signIn → getIdToken → getDoc(users/{uid})
//      (simulates what the browser does as fallback)
//   2. Server-side: same flow but via firebase-admin
//      (simulates what /api/get-role does — bulletproof)
//   3. Direct Admin SDK: read users/{uid} by email
//      (verifies document exists with correct ID = Auth UID)
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    console.error('❌ .env.local tidak ditemukan di', envPath);
    process.exit(1);
  }
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}
loadEnv();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('\n========================================');
console.log('  PBR Login Diagnostics (Full)');
console.log('========================================\n');

console.log('=== Firebase Config ===');
console.log('  apiKey:', firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 20) + '...' : 'MISSING');
console.log('  projectId:', firebaseConfig.projectId || 'MISSING');

const adminProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID || firebaseConfig.projectId;
const adminClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const adminPrivateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n');

console.log('  admin.projectId:', adminProjectId || 'MISSING');
console.log('  admin.clientEmail:', adminClientEmail || 'MISSING');
console.log('  admin.privateKey:', adminPrivateKey ? '[REDACTED:' + adminPrivateKey.length + ' chars]' : 'MISSING');

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('\n❌ Firebase client config tidak lengkap.');
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('\nUsage: node scripts/diagnose-login.mjs <email> <password>');
  process.exit(1);
}

async function main() {
  // ============================================================
  // STEP 1: Client-side sign in
  // ============================================================
  console.log('\n=== STEP 1: signInWithEmailAndPassword (client SDK) ===');
  const t0 = Date.now();
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  let cred;
  try {
    cred = await signInWithEmailAndPassword(auth, email, password);
    console.log('  ✅ Sign in SUCCESS in', Date.now() - t0, 'ms');
    console.log('  Auth UID:', cred.user.uid);
  } catch (err) {
    console.error('  ❌ Sign in FAILED in', Date.now() - t0, 'ms');
    console.error('  Error:', err?.code || err?.message);
    process.exit(1);
  }

  const idToken = await cred.user.getIdToken(false);
  console.log('  ID token length:', idToken.length);

  // ============================================================
  // STEP 2: Client-side getDoc (what the browser fallback does)
  // ============================================================
  console.log('\n=== STEP 2: Client getDoc(users/{uid}) ===');
  console.log('  Path: users/' + cred.user.uid);
  const t1 = Date.now();
  try {
    const ref = doc(db, 'users', cred.user.uid);
    const snap = await Promise.race([
      getDoc(ref),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout 8s')), 8000)),
    ]);
    console.log('  ✅ getDoc DONE in', Date.now() - t1, 'ms');
    console.log('  exists:', snap.exists());
    console.log('  fromCache:', snap.metadata?.fromCache);
    if (snap.exists()) {
      console.log('  role:', snap.data().role);
    }
  } catch (err) {
    console.error('  ❌ getDoc FAILED in', Date.now() - t1, 'ms');
    console.error('  Error:', err?.code || err?.message);
    console.error('  → Ini penyebab fallback ke editor di client SDK.');
  }

  // ============================================================
  // STEP 3: Server-side (firebase-admin) — simulates /api/get-role
  // ============================================================
  if (adminProjectId && adminClientEmail && adminPrivateKey) {
    console.log('\n=== STEP 3: Admin SDK getDoc(users/{uid}) — /api/get-role flow ===');
    const t2 = Date.now();
    try {
      const { initializeApp: adminInit, cert } = await import('firebase-admin/app');
      const { getAuth: adminGetAuth } = await import('firebase-admin/auth');
      const { getFirestore: adminGetFirestore } = await import('firebase-admin/firestore');

      const adminApp = adminInit({ credential: cert({ projectId: adminProjectId, clientEmail: adminClientEmail, privateKey: adminPrivateKey }) }, 'diagnose-' + Date.now());
      const adminAuth = adminGetAuth(adminApp);
      const adminDb = adminGetFirestore(adminApp);

      // Verify ID token (same as /api/get-role does)
      const decoded = await adminAuth.verifyIdToken(idToken);
      console.log('  ✅ Token verified. UID:', decoded.uid);

      const userSnap = await adminDb.collection('users').doc(decoded.uid).get();
      console.log('  ✅ Admin getDoc DONE in', Date.now() - t2, 'ms');
      console.log('  exists:', userSnap.exists);

      if (userSnap.exists) {
        const data = userSnap.data();
        console.log('  role:', data.role);
        console.log('  email:', data.email);
        console.log('  displayName:', data.displayName);
        console.log('  all fields:', Object.keys(data));

        console.log('\n========================================');
        if (data.role === 'super_admin') {
          console.log('🎉 VERDICT: Document OK with role=super_admin');
          console.log('   /api/get-role akan return: super_admin');
          console.log('   Jika di browser masih editor:');
          console.log('   1. Stop dev server: Ctrl+C');
          console.log('   2. Hapus cache: rm -rf .next');
          console.log('   3. git pull origin main');
          console.log('   4. npm run dev');
          console.log('   5. Hard refresh browser (Ctrl+Shift+R)');
        } else {
          console.log('⚠️  VERDICT: role =', data.role, '(bukan super_admin)');
          console.log('   Fix: node scripts/setup-admin.mjs ' + email + ' "Administrator"');
        }
        console.log('========================================\n');
      } else {
        console.log('\n========================================');
        console.log('❌ VERDICT: Document users/{uid} TIDAK ADA');
        console.log('   Auth UID:', decoded.uid);
        console.log('   Fix: node scripts/setup-admin.mjs ' + email + ' "Administrator"');
        console.log('========================================\n');
      }

      try { await adminApp.delete(); } catch {}
    } catch (err) {
      console.error('  ❌ Admin SDK FAILED in', Date.now() - t2, 'ms');
      console.error('  Error:', err?.code || err?.message);
    }
  } else {
    console.log('\n=== STEP 3: SKIPPED (FIREBASE_ADMIN_* env vars not set) ===');
    console.log('  /api/get-role TIDAK AKAN BEKERJA tanpa admin SDK!');
    console.log('  Set these in .env.local:');
    console.log('    FIREBASE_ADMIN_PROJECT_ID=');
    console.log('    FIREBASE_ADMIN_CLIENT_EMAIL=');
    console.log('    FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..."');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
