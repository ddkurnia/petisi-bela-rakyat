// ============================================================
// test-read-role.mjs
// ============================================================
// This script EXACTLY replicates the readUserRole() logic from
// src/lib/firebase/auth.ts. It connects to YOUR Firebase project
// (real, not emulator), signs in, and tries to read the role.
//
// Run in Termux:
//   node scripts/test-read-role.mjs admin@belarakyat.org Kapal7890@
//
// This will show EXACTLY what readUserRole returns:
//   - If it returns 'super_admin' → app code should work, issue
//     is in UI/state update
//   - If it returns 'editor' (fallback) → readUserRole is failing
//     in production, and we can see WHY from the logs
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load .env.local
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    console.error('❌ .env.local tidak ditemukan');
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

const email = process.argv[2] || 'admin@belarakyat.org';
const password = process.argv[3] || 'Kapal7890@';

console.log('\n=== Test readUserRole (EXACT app logic) ===');
console.log('Project:', firebaseConfig.projectId);
console.log('Email:', email);

async function getDocWithTimeout(ref, timeoutMs = 3000) {
  return Promise.race([
    getDocFromServer(ref),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`timeout ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

async function readUserRole(fbUser) {
  console.log('\n--- readUserRole START ---');
  const t0 = Date.now();
  const MAX_ATTEMPTS = 3;
  const DOC_TIMEOUT_MS = 3000;
  const db = getFirestore();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`\n[Attempt ${attempt}/${MAX_ATTEMPTS}]`);

      if (attempt > 1) {
        console.log('  Force refreshing token...');
        await fbUser.getIdToken(true);
        console.log('  Waiting 300ms for Firestore SDK...');
        await new Promise((r) => setTimeout(r, 300));
      }

      console.log(`  Reading doc(db, 'users', '${fbUser.uid}')...`);
      const ref = doc(db, 'users', fbUser.uid);
      const snap = await getDocWithTimeout(ref, DOC_TIMEOUT_MS);
      const elapsed = Date.now() - t0;

      console.log(`  RESULT: exists=${snap.exists()}, elapsed=${elapsed}ms`);
      console.log(`  metadata: fromCache=${snap.metadata?.fromCache}`);

      if (snap.exists()) {
        const data = snap.data();
        console.log('  Document data:', JSON.stringify(data, null, 2));
        const docRole = data.role;
        if (typeof docRole === 'string' && docRole.length > 0) {
          console.log(`  ✅ Role ACCEPTED: ${docRole}`);
          return docRole;
        } else {
          console.log(`  ⚠️ Role field invalid: ${docRole}`);
          return 'editor';
        }
      } else {
        console.log('  ❌ Document NOT FOUND');
      }
    } catch (err) {
      console.log(`  ❌ FAILED: ${err.code || err.message}`);
      if (attempt < MAX_ATTEMPTS) {
        console.log('  Retrying in 400ms...');
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  console.log(`\n--- readUserRole FALLBACK: editor (${Date.now() - t0}ms) ---`);
  return 'editor';
}

async function main() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  console.log('\n=== STEP 1: Sign in ===');
  let cred;
  try {
    cred = await signInWithEmailAndPassword(auth, email, password);
    console.log('  ✅ Sign in SUCCESS');
    console.log('  UID:', cred.user.uid);
  } catch (err) {
    console.error('  ❌ Sign in FAILED:', err.code || err.message);
    process.exit(1);
  }

  console.log('\n=== STEP 2: Force token refresh ===');
  await cred.user.getIdToken(true);
  console.log('  ✅ Done');

  console.log('\n=== STEP 3: Wait 500ms (like app does) ===');
  await new Promise((r) => setTimeout(r, 500));

  console.log('\n=== STEP 4: Call readUserRole (EXACT app logic) ===');
  const role = await readUserRole(cred.user);

  console.log('\n========================================');
  console.log('FINAL ROLE:', role);
  console.log('========================================');

  if (role === 'super_admin') {
    console.log('\n🎉 readUserRole BERHASIL dapat super_admin!');
    console.log('   Artinya: app code seharusnya work.');
    console.log('   Jika di UI masih editor, masalah di state/UI update,');
    console.log('   bukan di Firestore read.');
  } else {
    console.log('\n❌ readUserRole gagal dapat super_admin.');
    console.log('   Penyebab: lihat log di atas (NOT FOUND / FAILED / timeout)');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
