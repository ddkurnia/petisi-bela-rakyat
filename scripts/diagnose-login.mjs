// ============================================================
// diagnose-login.mjs
// ============================================================
// Run this in Termux to diagnose why login returns wrong role
// or takes too long.
//
// Usage:
//   node scripts/diagnose-login.mjs admin@belarakyat.org Kapal7890@
//
// This script simulates EXACTLY what the app does during login:
//   1. Initialize Firebase (client SDK, same as browser)
//   2. signInWithEmailAndPassword
//   3. getIdToken(true)
//   4. getDoc(users/{uid})  ← the role read
//   5. Reports timing + result for each step
//
// If step 4 succeeds here but fails in the browser, the issue
// is in the browser code (auth.ts). If it fails here too, the
// issue is in Firestore rules or the document itself.
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
console.log('  PBR Login Diagnostics');
console.log('========================================\n');

console.log('=== Firebase Config ===');
console.log('  apiKey:', firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 20) + '...' : 'MISSING');
console.log('  projectId:', firebaseConfig.projectId || 'MISSING');
console.log('  appId:', firebaseConfig.appId ? firebaseConfig.appId.substring(0, 20) + '...' : 'MISSING');

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('\n❌ Firebase config tidak lengkap. Cek NEXT_PUBLIC_FIREBASE_* di .env.local');
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('\nUsage: node scripts/diagnose-login.mjs <email> <password>');
  console.error('   Example: node scripts/diagnose-login.mjs admin@belarakyat.org Kapal7890@');
  process.exit(1);
}

async function main() {
  console.log('\n=== STEP 1: Initialize Firebase (client SDK) ===');
  const t0 = Date.now();
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  console.log('  ✅ Firebase initialized in', Date.now() - t0, 'ms');

  console.log('\n=== STEP 2: signInWithEmailAndPassword ===');
  const t1 = Date.now();
  let cred;
  try {
    cred = await signInWithEmailAndPassword(auth, email, password);
    console.log('  ✅ Sign in SUCCESS in', Date.now() - t1, 'ms');
    console.log('  Auth UID:', cred.user.uid);
    console.log('  Email:', cred.user.email);
  } catch (err) {
    console.error('  ❌ Sign in FAILED in', Date.now() - t1, 'ms');
    console.error('  Error:', err?.code || err?.message);
    process.exit(1);
  }

  console.log('\n=== STEP 3: getIdToken(true) ===');
  const t2 = Date.now();
  try {
    await cred.user.getIdToken(true);
    console.log('  ✅ getIdToken DONE in', Date.now() - t2, 'ms');
  } catch (err) {
    console.error('  ❌ getIdToken FAILED in', Date.now() - t2, 'ms');
    console.error('  Error:', err?.code || err?.message);
  }

  console.log('\n=== STEP 4: getDoc(users/{uid}) — THE ROLE READ ===');
  console.log('  Path: users/' + cred.user.uid);
  const t3 = Date.now();
  try {
    const ref = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(ref);
    const elapsed = Date.now() - t3;
    console.log('  ✅ getDoc DONE in', elapsed, 'ms');
    console.log('  exists:', snap.exists());
    console.log('  fromCache:', snap.metadata?.fromCache);

    if (snap.exists()) {
      const data = snap.data();
      console.log('  role:', data.role);
      console.log('  email:', data.email);
      console.log('  displayName:', data.displayName);
      console.log('  all fields:', Object.keys(data));

      console.log('\n========================================');
      if (data.role === 'super_admin') {
        console.log('🎉 VERDICT: Login seharusnya mengembalikan role super_admin');
        console.log('   Jika di browser masih jadi editor, masalahnya di:');
        console.log('   1. Browser cache (Ctrl+Shift+R / hard refresh)');
        console.log('   2. Vercel belum deploy commit terbaru');
        console.log('   3. Dev server belum di-restart setelah git pull');
      } else if (data.role === 'admin' || data.role === 'editor') {
        console.log('⚠️  VERDICT: Document exists but role =', data.role);
        console.log('   Untuk super admin, jalankan:');
        console.log('   node scripts/setup-admin.mjs ' + email + ' "Administrator"');
      } else {
        console.log('⚠️  VERDICT: Document exists but role is invalid:', data.role);
        console.log('   Role harus salah satu: super_admin, admin, editor');
      }
      console.log('========================================\n');
    } else {
      console.log('\n========================================');
      console.log('❌ VERDICT: Document users/{uid} TIDAK ADA');
      console.log('   Auth UID:', cred.user.uid);
      console.log('');
      console.log('   PENYEBAB:');
      console.log('   Document ID di Firestore ≠ Auth UID.');
      console.log('   Kemungkinan dokumen dibuat manual via Firebase Console');
      console.log('   dengan auto-generated ID.');
      console.log('');
      console.log('   FIX:');
      console.log('   1. Firebase Console → Firestore → collection "users"');
      console.log('   2. Hapus dokumen yang ada (jika Document ID ≠ Auth UID)');
      console.log('   3. Jalankan: node scripts/setup-admin.mjs ' + email + ' "Administrator"');
      console.log('      Script ini membuat dokumen dengan Document ID = Auth UID');
      console.log('========================================\n');
    }
  } catch (err) {
    const elapsed = Date.now() - t3;
    console.error('  ❌ getDoc FAILED in', elapsed, 'ms');
    console.error('  Error:', err?.code || err?.message);
    console.error('');
    console.error('  PENYEBAB UMUM:');
    console.error('  - permission-denied: Firestore rules menolak read');
    console.error('    Fix: firebase deploy --only firestore:rules');
    console.error('  - unavailable: Network issue atau Firestore down');
    console.error('  - Jika timeout >8s: koneksi lambat atau firewall block');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
