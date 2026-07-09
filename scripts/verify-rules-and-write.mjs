// verify-rules-and-write.mjs
// Test: sign in, get token, try REST API write to settings collection
// This will show EXACTLY what HTTP status and error we get
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) { console.error('❌ .env.local not found'); process.exit(1); }
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('='); if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    process.env[key] = val;
  }
}
loadEnv();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const email = process.argv[2] || 'admin@belarakyat.org';
const password = process.argv[3] || 'Kapal7890@';

console.log('\n=== Verify Rules + Write Test ===');
console.log('Project:', firebaseConfig.projectId);

async function main() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // Step 1: Sign in
  console.log('\n1. Sign in...');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  console.log('   UID:', cred.user.uid);
  const token = await cred.user.getIdToken(true);
  console.log('   Token length:', token.length);

  // Step 2: Read users/{uid} via REST — verify rules allow this
  console.log('\n2. Read users/{uid} via REST...');
  const readRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${cred.user.uid}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  console.log('   Status:', readRes.status);
  if (readRes.ok) {
    const doc = await readRes.json();
    console.log('   role:', doc.fields?.role?.stringValue);
    console.log('   ✅ users/{uid} read OK');
  } else {
    const err = await readRes.text();
    console.log('   ❌ FAILED:', err.substring(0, 300));
  }

  // Step 3: Try WRITE to settings via REST
  console.log('\n3. Write test to settings via REST...');
  const writeRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/settings`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          siteName: { stringValue: 'Test Settings' },
          testField: { stringValue: 'write test ' + new Date().toISOString() },
        },
      }),
    }
  );
  console.log('   Status:', writeRes.status);
  if (writeRes.ok) {
    const doc = await writeRes.json();
    console.log('   ✅ Write SUCCESS! Document ID:', doc.name?.split('/').pop());
    console.log('   Check Firestore Console → settings collection');
  } else {
    const err = await writeRes.text();
    console.log('   ❌ Write FAILED:', err.substring(0, 500));
    console.log('\n   If 403: Firestore rules are NOT deployed or isAdmin() fails');
    console.log('   Fix: firebase deploy --only firestore:rules');
  }

  // Step 4: Try WRITE to pengurus via REST
  console.log('\n4. Write test to pengurus via REST...');
  const writeRes2 = await fetch(
    `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/pengurus`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          name: { stringValue: 'Test Pengurus' },
          jabatan: { stringValue: 'Test' },
          slug: { stringValue: 'test-pengurus' },
        },
      }),
    }
  );
  console.log('   Status:', writeRes2.status);
  if (writeRes2.ok) {
    console.log('   ✅ Pengurus write SUCCESS!');
  } else {
    const err = await writeRes2.text();
    console.log('   ❌ FAILED:', err.substring(0, 500));
  }

  process.exit(0);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
