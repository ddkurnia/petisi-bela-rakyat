// API Route: /api/test-admin
// ============================================================
// Isolated test for Firebase REST API auth (no firebase-admin SDK).
// GET /api/test-admin → { step, success, error? }
// ============================================================
import { NextResponse } from 'next/server';
import { verifyIdToken, readFirestoreDoc, queryFirestore } from '@/lib/firebase/rest-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const steps: { step: string; success: boolean; error?: string; data?: any }[] = [];

  // Step 1: Check env vars
  try {
    const adminProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const adminClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const adminPrivateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
    const adminPrivateKey = adminPrivateKeyRaw.replace(/\\n/g, '\n');
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    steps.push({
      step: '1. Check env vars',
      success: !!(adminProjectId && adminClientEmail && adminPrivateKey && apiKey),
      data: {
        hasApiKey: !!apiKey,
        apiKeyLen: apiKey?.length || 0,
        hasProjectId: !!adminProjectId,
        projectId: adminProjectId || null,
        hasClientEmail: !!adminClientEmail,
        clientEmailLen: adminClientEmail?.length || 0,
        hasPrivateKey: !!adminPrivateKey,
        privateKeyLen: adminPrivateKey.length,
        privateKeyStartsWithBegin: adminPrivateKey.startsWith('-----BEGIN PRIVATE KEY-----'),
        privateKeyHasNewlines: adminPrivateKey.includes('\n'),
      },
    });
  } catch (err: any) {
    steps.push({ step: '1. Check env vars', success: false, error: String(err) });
  }

  // Step 2: Test Firestore query (bypasses auth — uses service account)
  try {
    const users = await queryFirestore('users', [], 1);
    steps.push({
      step: '2. Firestore query users',
      success: true,
      data: { docsCount: users.length, firstUser: users[0] ? { uid: users[0].uid, role: users[0].role } : null },
    });
  } catch (err: any) {
    steps.push({
      step: '2. Firestore query users',
      success: false,
      error: `${err?.name || 'Error'}: ${err?.message || String(err)}`,
    });
  }

  // Step 3: Test read specific doc (admin@belarakyat.org's UID)
  try {
    // We'll just try to read any user doc — if step 2 returned one, use it
    const users = await queryFirestore('users', [], 1);
    if (users.length > 0) {
      const uid = users[0].uid || users[0].id;
      const doc = await readFirestoreDoc('users', uid);
      steps.push({
        step: '3. Read users/{uid} doc',
        success: !!doc,
        data: doc ? { uid, role: doc.role, email: doc.email } : null,
      });
    } else {
      steps.push({
        step: '3. Read users/{uid} doc',
        success: false,
        error: 'No users in collection to test with',
      });
    }
  } catch (err: any) {
    steps.push({
      step: '3. Read users/{uid} doc',
      success: false,
      error: `${err?.name || 'Error'}: ${err?.message || String(err)}`,
    });
  }

  const allSuccess = steps.every((s) => s.success);
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    approach: 'REST API (no firebase-admin SDK)',
    allStepsSuccess: allSuccess,
    steps,
  }, { status: allSuccess ? 200 : 500 });
}
