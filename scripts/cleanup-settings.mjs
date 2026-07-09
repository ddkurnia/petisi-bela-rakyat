// ============================================================
// cleanup-settings.mjs
// ============================================================
// Run this in Termux to clean up duplicate settings docs.
//
// The old setup-admin.mjs (before fix) created settings docs via
// .add() with random IDs. The app now uses settings/main exclusively.
// This script:
//   1. Lists all docs in 'settings' collection
//   2. Keeps 'main' (or merges all into 'main' if multiple exist)
//   3. Deletes all other settings docs
//
// Usage:
//   node scripts/cleanup-settings.mjs
// ============================================================

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ FIREBASE_ADMIN_* env vars belum diset di .env.local');
  process.exit(1);
}

const adminApp = getApps().find((a) => a.name === 'admin') || initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
}, 'admin');

const adminDb = getFirestore(adminApp);

async function main() {
  console.log('\n=== Settings Cleanup ===\n');

  // 1. Get all settings docs
  const snap = await adminDb.collection('settings').get();
  console.log(`Found ${snap.size} doc(s) in 'settings' collection:\n`);

  const docs = snap.docs;
  for (const doc of docs) {
    const data = doc.data();
    console.log(`  - ID: ${doc.id}`);
    console.log(`    fields: ${Object.keys(data).join(', ')}`);
    console.log(`    siteName: ${data.siteName || '(missing)'}`);
    console.log(`    has homepage: ${!!data.homepage}`);
    console.log(`    has about: ${!!data.about}`);
    console.log(`    has contact: ${!!data.contact}`);
    console.log('');
  }

  if (snap.size === 0) {
    console.log('⚠️  No settings docs found. Run: node scripts/setup-admin.mjs admin@belarakyat.org "Administrator"');
    process.exit(0);
  }

  if (snap.size === 1 && docs[0].id === 'main') {
    console.log('✅ Only 1 settings doc with ID "main". No cleanup needed.');
    process.exit(0);
  }

  // 2. Find the best doc to use as 'main'
  // Priority: existing 'main' doc > doc with most fields > first doc
  let mainDoc = docs.find((d) => d.id === 'main');
  if (!mainDoc) {
    mainDoc = docs.reduce((best, d) =>
      Object.keys(d.data()).length > Object.keys(best.data()).length ? d : best
    );
  }

  console.log(`\n=== Merging into 'main' ===`);
  console.log(`Source: ${mainDoc.id} (${Object.keys(mainDoc.data()).length} fields)\n`);

  // 3. Merge all docs into 'main' (later docs override earlier ones)
  const mergedData: any = {};
  for (const doc of docs) {
    Object.assign(mergedData, doc.data());
  }
  // Ensure required fields exist
  if (!mergedData.siteName) mergedData.siteName = 'Petisi Bela Rakyat';
  if (!mergedData.tagline) mergedData.tagline = 'Menyatukan Suara Rakyat Menjadi Perubahan';
  if (!mergedData.logoUrl) mergedData.logoUrl = '/pbr.png';
  mergedData.updatedAt = new Date().toISOString();

  // 4. Write merged data to 'main'
  await adminDb.collection('settings').doc('main').set(mergedData, { merge: true });
  console.log('✅ Merged data written to settings/main');

  // 5. Delete all OTHER settings docs
  for (const doc of docs) {
    if (doc.id !== 'main') {
      await adminDb.collection('settings').doc(doc.id).delete();
      console.log(`🗑️  Deleted settings/${doc.id}`);
    }
  }

  console.log('\n🎉 Cleanup selesai!');
  console.log('   Sekarang hanya ada 1 doc: settings/main');
  console.log('   Realtime updates akan bekerja dengan benar.\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Cleanup gagal:', err?.message || err);
  process.exit(1);
});
