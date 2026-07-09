// ============================================================
// verify-firestore-access.ts
// ============================================================
// Run this in Termux to verify that the admin user's Firestore
// document is accessible with the correct Document ID.
//
// Usage:
//   bun run scripts/verify-firestore-access.ts admin@belarakyat.org Kapal7890@
//
// This script:
//   1. Signs in to Firebase Auth (real project, not emulator)
//   2. Reads users/{authUid} via getDocFromServer
//   3. Reports: exists? role? Document ID matches Auth UID?
//   4. If fails, reports the exact error
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, connectFirestoreEmulator } from 'firebase/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load .env.local
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    console.error('❌ .env.local tidak ditemukan di', envPath);
    console.error('   Buat file .env.local dengan kredensial Firebase Anda.');
    console.error('   Lihat .env.example untuk template.');
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

console.log('\n=== Firebase Config ===');
console.log('  apiKey:', firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 20) + '...' : 'MISSING');
console.log('  authDomain:', firebaseConfig.authDomain || 'MISSING');
console.log('  projectId:', firebaseConfig.projectId || 'MISSING');
console.log('  appId:', firebaseConfig.appId ? firebaseConfig.appId.substring(0, 20) + '...' : 'MISSING');

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('\n❌ Firebase config tidak lengkap. Cek NEXT_PUBLIC_FIREBASE_* di .env.local');
  process.exit(1);
}

const email = process.argv[2] || 'admin@belarakyat.org';
const password = process.argv[3] || 'Kapal7890@';

console.log('\n=== Test Parameters ===');
console.log('  email:', email);
console.log('  password:', '*'.repeat(password.length));

async function main() {
  console.log('\n=== STEP 1: Initialize Firebase ===');
  const app = initializeApp(firebaseConfig as any);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('\n=== STEP 2: Sign in to Firebase Auth ===');
  let cred;
  try {
    cred = await signInWithEmailAndPassword(auth, email, password);
    console.log('  ✅ Sign in SUCCESS');
    console.log('  Auth UID:', cred.user.uid);
    console.log('  Email:', cred.user.email);
  } catch (err: any) {
    console.error('  ❌ Sign in FAILED:', err?.code || err?.message);
    process.exit(1);
  }

  console.log('\n=== STEP 3: Force token refresh ===');
  try {
    await cred.user.getIdToken(true);
    console.log('  ✅ getIdToken(true) DONE');
  } catch (err: any) {
    console.error('  ❌ getIdToken FAILED:', err?.code || err?.message);
  }

  console.log('\n=== STEP 4: Read users/{authUid} via getDocFromServer ===');
  console.log('  Path: users/' + cred.user.uid);
  try {
    const ref = doc(db, 'users', cred.user.uid);
    const snap = await getDocFromServer(ref);
    console.log('  exists:', snap.exists());
    console.log('  id (queried):', snap.id);
    console.log('  metadata.fromCache:', snap.metadata?.fromCache);

    if (snap.exists()) {
      const data = snap.data();
      console.log('  ✅ Document FOUND');
      console.log('  role:', data.role);
      console.log('  displayName:', data.displayName);
      console.log('  email:', data.email);
      console.log('  status:', data.status);
      console.log('  all fields:', Object.keys(data));

      if (data.role === 'super_admin') {
        console.log('\n🎉 VERDICT: Document exists with role=super_admin');
        console.log('   Login seharusnya mengembalikan role super_admin.');
        console.log('   Jika di UI masih jadi editor, masalahnya di:');
        console.log('   - Cache browser (hard refresh: Ctrl+Shift+R)');
        console.log('   - Vercel belum deploy commit terbaru');
        console.log('   - Env vars di Vercel tidak match dengan project ini');
      } else if (data.role === 'editor') {
        console.log('\n⚠️  VERDICT: Document exists but role=editor (bukan super_admin)');
        console.log('   Fix: update field role di Firestore Console ke "super_admin"');
      } else if (!data.role) {
        console.log('\n⚠️  VERDICT: Document exists but field role is MISSING');
        console.log('   Fix: tambah field role="super_admin" di Firestore Console');
      } else {
        console.log('\n⚠️  VERDICT: Document exists but role=' + data.role + ' (unexpected value)');
      }
    } else {
      console.log('\n❌ VERDICT: Document does NOT exist at users/' + cred.user.uid);
      console.log('   Ini penyebab bug "login jadi editor".');
      console.log('');
      console.log('   Document ID di Firestore ≠ Auth UID.');
      console.log('   Kemungkinan dokumen dibuat manual via Firebase Console dengan auto-ID.');
      console.log('');
      console.log('   FIX:');
      console.log('   1. Buka Firebase Console → Firestore → collection "users"');
      console.log('   2. Hapus dokumen yang ada (Document ID-nya kemungkinan auto-generated)');
      console.log('   3. Jalankan: bun run setup-admin ' + email + ' "Administrator"');
      console.log('      Script ini membuat dokumen dengan Document ID = Auth UID');
      console.log('   4. Jalankan lagi script ini untuk verifikasi');
    }
  } catch (err: any) {
    console.error('  ❌ getDocFromServer FAILED:', err?.code || err?.message);
    console.error('');
    console.error('  Kemungkinan penyebab:');
    console.error('  - Firestore rules menolak read (deploy: bun run deploy-rules)');
    console.error('  - Network issue');
    console.error('  - Project ID salah di config');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
