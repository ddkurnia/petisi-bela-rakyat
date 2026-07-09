// ============================================================
// setup-admin-sdk.mjs
// ============================================================
// Interactive helper to set up Firebase Admin SDK env vars.
//
// This script:
//   1. Checks if FIREBASE_ADMIN_* vars are already in .env.local
//   2. If not, guides user through generating service account key
//   3. Helps write the vars to .env.local
//
// Usage:
//   node scripts/setup-admin-sdk.mjs
// ============================================================

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { createInterface } from 'readline';

const envPath = resolve(process.cwd(), '.env.local');
const envExamplePath = resolve(process.cwd(), '.env.example');

const rl = createInterface({ input: process.stdin, output: process.stdout });
const question = (q) => new Promise((resolve) => rl.question(q, resolve));

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const vars = {};
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    vars[key] = val;
  }
  return vars;
}

function writeEnvFile(path, vars) {
  const lines = [];
  for (const [key, val] of Object.entries(vars)) {
    // Wrap values containing spaces, #, or special chars in quotes
    if (key === 'FIREBASE_ADMIN_PRIVATE_KEY' || /[\s#"]/.test(val)) {
      lines.push(`${key}="${val.replace(/"/g, '\\"')}"`);
    } else {
      lines.push(`${key}=${val}`);
    }
  }
  writeFileSync(path, lines.join('\n') + '\n');
}

async function main() {
  console.log('\n========================================');
  console.log('  Firebase Admin SDK Setup Helper');
  console.log('========================================\n');

  // 1. Check current state
  const currentEnv = loadEnvFile(envPath);
  const hasProjectId = !!currentEnv.FIREBASE_ADMIN_PROJECT_ID;
  const hasClientEmail = !!currentEnv.FIREBASE_ADMIN_CLIENT_EMAIL;
  const hasPrivateKey = !!currentEnv.FIREBASE_ADMIN_PRIVATE_KEY;

  console.log('=== Current .env.local state ===');
  console.log('  FIREBASE_ADMIN_PROJECT_ID:', hasProjectId ? '✅ set' : '❌ missing');
  console.log('  FIREBASE_ADMIN_CLIENT_EMAIL:', hasClientEmail ? '✅ set' : '❌ missing');
  console.log('  FIREBASE_ADMIN_PRIVATE_KEY:', hasPrivateKey ? '✅ set' : '❌ missing');
  console.log('');

  if (hasProjectId && hasClientEmail && hasPrivateKey) {
    console.log('✅ All FIREBASE_ADMIN_* vars already set!');
    console.log('   If /api/get-role still returns 500, the values may be invalid.');
    console.log('   Verify by running:');
    console.log('   node scripts/diagnose-login.mjs admin@belarakyat.org Kapal7890@');
    rl.close();
    return;
  }

  // 2. Guide user through generating service account key
  console.log('=== How to get FIREBASE_ADMIN_* credentials ===\n');
  console.log('1. Buka https://console.firebase.google.com');
  console.log('2. Pilih project: belarakyat-546ed');
  console.log('3. Klik gear icon (Project Settings) di sidebar');
  console.log('4. Tab "Service Accounts"');
  console.log('5. Klik "Generate new private key"');
  console.log('6. Download file JSON (contoh: belarakyat-546ed-firebase-adminsdk-xxxx.json)');
  console.log('7. Buka file tersebut di text editor (di Termux: nano /storage/emulated/0/Download/namafile.json)');
  console.log('');

  const proceed = await question('Sudah download file JSON? (y/n): ');
  if (proceed.toLowerCase() !== 'y') {
    console.log('\nSilakan download dulu, lalu jalankan script ini lagi.');
    rl.close();
    return;
  }

  // 3. Get values from user
  console.log('\n=== Input credentials ===');
  console.log('(Copy dari file JSON yang didownload)\n');

  const projectId = await question('project_id (contoh: belarakyat-546ed): ');
  if (!projectId) { console.log('project_id wajib!'); rl.close(); return; }

  const clientEmail = await question('client_email (contoh: firebase-adminsdk-xxx@belarakyat-546ed.iam.gserviceaccount.com): ');
  if (!clientEmail) { console.log('client_email wajib!'); rl.close(); return; }

  console.log('\nprivate_key: (paste semua, termasuk -----BEGIN/END PRIVATE KEY-----)');
  console.log('   Paste lalu tekan Enter, lalu tekan Ctrl+D (atau ketik END di line baru):');
  let privateKey = '';
  const keyLines = [];
  while (true) {
    const line = await new Promise((r) => {
      rl.question('', (ans) => r(ans));
    });
    if (line === 'END' || line === null) break;
    keyLines.push(line);
  }
  privateKey = keyLines.join('\n').trim();
  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    console.log('⚠️  private_key tidak valid. Pastikan copy dari file JSON dengan benar.');
    rl.close();
    return;
  }

  // 4. Confirm
  console.log('\n=== Konfirmasi ===');
  console.log('  FIREBASE_ADMIN_PROJECT_ID:', projectId);
  console.log('  FIREBASE_ADMIN_CLIENT_EMAIL:', clientEmail);
  console.log('  FIREBASE_ADMIN_PRIVATE_KEY: [REDACTED:' + privateKey.length + ' chars]');

  const confirm = await question('\nSimpan ke .env.local? (y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('Dibatalkan.');
    rl.close();
    return;
  }

  // 5. Update .env.local
  currentEnv.FIREBASE_ADMIN_PROJECT_ID = projectId;
  currentEnv.FIREBASE_ADMIN_CLIENT_EMAIL = clientEmail;
  currentEnv.FIREBASE_ADMIN_PRIVATE_KEY = privateKey.replace(/\n/g, '\\n');
  writeEnvFile(envPath, currentEnv);

  console.log('\n✅ .env.local berhasil diupdate!');
  console.log('\n=== Langkah selanjutnya ===');
  console.log('1. STOP dev server (Ctrl+C)');
  console.log('2. Restart: npm run dev');
  console.log('3. Login di /admin — sekarang harus masuk super_admin');
  console.log('4. Verifikasi: node scripts/diagnose-login.mjs admin@belarakyat.org Kapal7890@');
  console.log('');

  rl.close();
}

main().catch((err) => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});
