// ============================================================
// setup-admin.mjs
// ============================================================
// Run this in Termux to create the first super_admin user.
// Uses node (NOT bun — bun doesn't work on Termux/Android).
//
// Usage:
//   node scripts/setup-admin.mjs admin@belarakyat.org "Administrator"
//
// Prerequisites:
//   1. User must already exist in Firebase Authentication
//      (create via Firebase Console → Authentication → Add user)
//   2. .env.local must contain FIREBASE_ADMIN_* vars
//   3. node installed: pkg install nodejs
//
// This script:
//   1. Looks up the user by email via Firebase Admin Auth
//   2. Creates a `users` document in Firestore with role super_admin
//      IMPORTANT: Document ID = Auth UID (so app can read by UID)
//   3. Seeds initial settings if empty
// ============================================================

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
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
  console.error('   Butuh:');
  console.error('   - FIREBASE_ADMIN_PROJECT_ID');
  console.error('   - FIREBASE_ADMIN_CLIENT_EMAIL');
  console.error('   - FIREBASE_ADMIN_PRIVATE_KEY');
  console.error('');
  console.error('   Cara dapatkan:');
  console.error('   1. Firebase Console → Project Settings → Service Accounts');
  console.error('   2. Click "Generate new private key"');
  console.error('   3. Copy project_id, client_email, private_key ke .env.local');
  process.exit(1);
}

const adminApp = getApps().find((a) => a.name === 'admin') || initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
}, 'admin');

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

async function main() {
  const email = process.argv[2];
  const displayName = process.argv[3] || 'Administrator';

  if (!email) {
    console.error('Usage: node scripts/setup-admin.mjs <email> [displayName]');
    console.error('   Example: node scripts/setup-admin.mjs admin@belarakyat.org "Administrator"');
    process.exit(1);
  }

  console.log(`\n🚀 Setup Admin: ${email}\n`);

  // 1. Look up user in Firebase Auth
  let uid;
  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    uid = userRecord.uid;
    console.log(`✅ User ditemukan di Firebase Auth (UID: ${uid})`);
  } catch (err) {
    console.error(`❌ User dengan email ${email} tidak ditemukan di Firebase Auth.`);
    console.error('   Buat user dulu di Firebase Console → Authentication → Add user.');
    console.error('   Error:', err?.message);
    process.exit(1);
  }

  // 2. Create users document in Firestore with Document ID = UID
  //    CRITICAL: Document ID must equal Auth UID so the app can
  //    read it via getDocFromServer(doc(db, 'users', authUid))
  const userRef = adminDb.collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    console.log('⚠️  Document users/{uid} sudah ada. Memperbarui role ke super_admin...');
    await userRef.update({
      role: 'super_admin',
      status: 'active',
      displayName,
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ Role diupdate ke super_admin');
  } else {
    await userRef.set({
      uid,
      email,
      displayName,
      role: 'super_admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ Document users/{uid} dibuat dengan Document ID = Auth UID');
    console.log('   Document ID:', uid);
    console.log('   role: super_admin');
  }

  // 3. Seed settings if empty (use fixed doc ID 'main' for singleton)
  const settingsRef = adminDb.collection('settings').doc('main');
  const settingsDoc = await settingsRef.get();
  if (!settingsDoc.exists) {
    console.log('📝 Seeding settings to settings/main...');
    await settingsRef.set({
      siteName: 'Petisi Bela Rakyat',
      tagline: 'Menyatukan Suara Rakyat Menjadi Perubahan',
      logoUrl: '/pbr.png',
      homepage: {
        hero: { image: '', headline: 'Menyatukan Suara Rakyat Menjadi Perubahan', subheadline: 'Gerakan masyarakat sipil independen untuk memperjuangkan kepentingan rakyat.', primaryCta: 'Pelajari Lebih Lanjut', secondaryCta: 'Lihat Kampanye' },
        about: { image: '', title: 'Tentang Kami', description: 'Organisasi non-pemerintah independen yang berjuang untuk keadilan sosial.' },
        work: { title: 'Kerja Kami', description: 'Advokasi, partisipasi publik, dan aksi nyata.' },
        campaigns: { title: 'Kampanye Aktif', description: 'Bergabung dengan kampanye yang sedang berjalan.' },
        supporters: { title: 'Dukungan Tokoh', description: 'Para tokoh yang mendukung gerakan kami.' },
        stats: [
          { label: 'Pendukung', value: 0, suffix: '+' },
          { label: 'Kampanye', value: 0, suffix: '' },
          { label: 'Relawan', value: 0, suffix: '+' },
        ],
      },
      about: { visi: '', misi: [], nilai: [], sejarah: '', sejarahTimeline: [], motto: '' },
      contact: { address: '', whatsapp: '', email: '', phone: '', mapEmbed: '', mapLink: '', operationHours: '' },
      socials: [],
      footer: { description: '', copyrightText: '© 2026 Petisi Bela Rakyat', legalLinks: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ Settings di-seed ke settings/main');
  } else {
    console.log('⚠️  settings/main sudah ada, skip seeding');
  }

  console.log(`\n🎉 Selesai!`);
  console.log(`\n   Login di /admin dengan:`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: (yang Anda set di Firebase Auth)`);
  console.log(`\n   Verifikasi: node scripts/verify-firestore-access.mjs ${email} <password>`);
  console.log('');
}

main().catch((err) => {
  console.error('❌ Setup gagal:', err?.message || err);
  process.exit(1);
});
