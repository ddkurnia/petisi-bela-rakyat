// API Route: /api/debug-env
// ============================================================
// Debug endpoint — shows what env vars the server actually sees.
// All values are REDACTED (only show presence + length).
//
// GET /api/debug-env → { vars: { ... }, allSet: bool, missing: [...] }
//
// Use this to diagnose why /api/get-role returns 500 even though
// .env.local looks correct. Common causes:
//   1. Dev server not restarted after editing .env.local
//   2. Typo in var name (e.g., FIREBASE_ADMIN_EMAIL vs _CLIENT_EMAIL)
//   3. Private key not wrapped in quotes (breaks parsing)
//   4. Private key has actual newlines instead of \n escape sequences
// ============================================================
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  // Read env vars FRESH on every request
  const adminProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const adminClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const adminPrivateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';

  const fbApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const fbProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const cloudinaryKey = process.env.CLOUDINARY_API_KEY;
  const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;

  const vars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: {
      set: !!fbApiKey,
      length: fbApiKey?.length || 0,
      preview: fbApiKey ? fbApiKey.substring(0, 15) + '...' : null,
    },
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: {
      set: !!fbProjectId,
      value: fbProjectId || null,
    },
    FIREBASE_ADMIN_PROJECT_ID: {
      set: !!adminProjectId,
      value: adminProjectId || null,
    },
    FIREBASE_ADMIN_CLIENT_EMAIL: {
      set: !!adminClientEmail,
      length: adminClientEmail?.length || 0,
      preview: adminClientEmail ? adminClientEmail.substring(0, 40) + '...' : null,
    },
    FIREBASE_ADMIN_PRIVATE_KEY: {
      set: !!adminPrivateKeyRaw,
      length: adminPrivateKeyRaw.length,
      startsWithBegin: adminPrivateKeyRaw.startsWith('-----BEGIN PRIVATE KEY-----') ||
                       adminPrivateKeyRaw.startsWith('"-----BEGIN PRIVATE KEY-----'),
      hasNewlineEscape: adminPrivateKeyRaw.includes('\\n'),
      hasActualNewline: adminPrivateKeyRaw.includes('\n'),
      preview: adminPrivateKeyRaw ? adminPrivateKeyRaw.substring(0, 40) + '...' : null,
    },
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: {
      set: !!cloudName,
      value: cloudName || null,
    },
    CLOUDINARY_API_KEY: {
      set: !!cloudinaryKey,
      length: cloudinaryKey?.length || 0,
    },
    CLOUDINARY_API_SECRET: {
      set: !!cloudinarySecret,
      length: cloudinarySecret?.length || 0,
    },
  };

  const missing = Object.entries(vars)
    .filter(([_, v]) => !v.set)
    .map(([k]) => k);

  // For admin SDK specifically
  const adminMissing: string[] = [];
  if (!adminProjectId) adminMissing.push('FIREBASE_ADMIN_PROJECT_ID');
  if (!adminClientEmail) adminMissing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
  if (!adminPrivateKeyRaw) adminMissing.push('FIREBASE_ADMIN_PRIVATE_KEY');

  // Check private key format issues
  const keyIssues: string[] = [];
  if (adminPrivateKeyRaw && !adminPrivateKeyRaw.includes('BEGIN PRIVATE KEY')) {
    keyIssues.push('Private key tidak berisi "-----BEGIN PRIVATE KEY-----" — format salah');
  }
  if (adminPrivateKeyRaw && !adminPrivateKeyRaw.includes('\\n') && !adminPrivateKeyRaw.includes('\n')) {
    keyIssues.push('Private key tidak punya newlines — mungkin tidak di-escape dengan \\n');
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    vars,
    summary: {
      allFirebaseAdminSet: adminMissing.length === 0,
      adminMissing,
      keyIssues,
      nextAction: adminMissing.length > 0
        ? `Set env vars: ${adminMissing.join(', ')}. Lalu RESTART dev server (Ctrl+C, npm run dev).`
        : keyIssues.length > 0
          ? `Fix private key format: ${keyIssues.join('; ')}`
          : 'All set! /api/get-role should work. If still fails, check server logs.',
    },
  });
}
