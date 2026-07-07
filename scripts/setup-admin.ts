// Setup Script - Create first admin user & seed initial settings
// Usage: bun run scripts/setup-admin.ts <email> [displayName]
// Prerequisites: user must already exist in Firebase Authentication
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) { console.error('❌ .env.local tidak ditemukan'); process.exit(1); }
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

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n');
if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ FIREBASE_ADMIN_* env vars belum diset');
  process.exit(1);
}

const adminApp = getApps().find((a) => a.name === 'admin') || initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }, 'admin');
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

async function main() {
  const email = process.argv[2];
  const displayName = process.argv[3] || 'Administrator';
  if (!email) { console.error('Usage: bun run scripts/setup-admin.ts <email> [displayName]'); process.exit(1); }

  console.log(`\n🚀 Setup Admin: ${email}\n`);
  let uid: string;
  try { uid = (await adminAuth.getUserByEmail(email)).uid; console.log(`✅ User ditemukan (UID: ${uid})`); }
  catch { console.error(`❌ User ${email} tidak ada di Firebase Auth. Buat dulu di Firebase Console.`); process.exit(1); }

  const userRef = adminDb.collection('users').doc(uid);
  const userDoc = await userRef.get();
  if (userDoc.exists) {
    await userRef.update({ role: 'super_admin', status: 'active', displayName, updatedAt: new Date().toISOString() });
    console.log('✅ Role diupdate ke super_admin');
  } else {
    await userRef.set({ uid, email, displayName, role: 'super_admin', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    console.log('✅ Document users/{uid} dibuat dengan role super_admin');
  }

  // Seed settings if empty
  const settingsSnap = await adminDb.collection('settings').limit(1).get();
  if (settingsSnap.empty) {
    console.log('📝 Seeding settings...');
    await adminDb.collection('settings').add({
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
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    console.log('✅ Settings di-seed');
  } else { console.log('⚠️  Settings sudah ada, skip'); }

  console.log(`\n🎉 Selesai! Login di /admin dengan email ${email}\n`);
}
main().catch((err) => { console.error('❌ Gagal:', err); process.exit(1); });
