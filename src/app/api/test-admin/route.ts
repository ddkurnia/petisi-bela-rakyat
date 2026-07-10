// API Route: /api/test-admin
// ============================================================
// Isolated test for Firebase REST API auth (no firebase-admin SDK).
// Tests each sub-step separately so we can see exactly where it fails.
// ============================================================
import { NextResponse } from 'next/server';
import {
  getServiceAccount, createSignedJwt, getAccessTokenWithDiagnostics,
  queryFirestore, readFirestoreDoc,
} from '@/lib/firebase/rest-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const steps: { step: string; success: boolean; error?: string; data?: any }[] = [];

  // Step 1: Check env vars
  try {
    const sa = getServiceAccount();
    steps.push({
      step: '1. Check env vars',
      success: true,
      data: {
        projectId: sa.projectId,
        clientEmail: sa.clientEmail.substring(0, 40) + '...',
        clientEmailLen: sa.clientEmail.length,
        privateKeyLen: sa.privateKey.length,
        privateKeyStartsWithBegin: sa.privateKey.startsWith('-----BEGIN PRIVATE KEY-----'),
        privateKeyEndsWithEnd: sa.privateKey.includes('-----END PRIVATE KEY-----'),
        privateKeyHasNewlines: sa.privateKey.includes('\n'),
        privateKeyNewlineCount: (sa.privateKey.match(/\n/g) || []).length,
      },
    });
  } catch (err: any) {
    steps.push({ step: '1. Check env vars', success: false, error: String(err) });
  }

  // Step 2: Create signed JWT
  try {
    const sa = getServiceAccount();
    const jwt = createSignedJwt(sa);
    const parts = jwt.split('.');
    steps.push({
      step: '2. Create signed JWT',
      success: true,
      data: {
        jwtLen: jwt.length,
        signatureLen: parts[2]?.length || 0,
        payload: JSON.parse(Buffer.from(parts[1], 'base64').toString()),
      },
    });
  } catch (err: any) {
    steps.push({
      step: '2. Create signed JWT',
      success: false,
      error: `${err?.name || 'Error'}: ${err?.message || String(err)}`,
    });
  }

  // Step 3: Exchange JWT for OAuth2 access token
  try {
    const result = await getAccessTokenWithDiagnostics();
    steps.push({
      step: '3. OAuth2 token exchange',
      success: result.success,
      data: {
        tokenLen: result.tokenLen,
        tokenPreview: result.tokenPreview,
        oauthResponseStatus: result.oauthResponseStatus,
      },
      error: result.error,
    });
  } catch (err: any) {
    steps.push({
      step: '3. OAuth2 token exchange',
      success: false,
      error: `${err?.name || 'Error'}: ${err?.message || String(err)}`,
    });
  }

  // Step 4: Test Firestore query (list users)
  try {
    const users = await queryFirestore('users', [], 1);
    steps.push({
      step: '4. Firestore query users',
      success: true,
      data: {
        docsCount: users.length,
        firstUser: users[0] ? { uid: users[0].uid, role: users[0].role, email: users[0].email } : null,
      },
    });
  } catch (err: any) {
    steps.push({
      step: '4. Firestore query users',
      success: false,
      error: `${err?.name || 'Error'}: ${err?.message || String(err)}`,
    });
  }

  // Step 5: Test readFirestoreDoc (the function used by /api/get-role)
  try {
    const users = await queryFirestore('users', [], 1);
    if (users.length > 0) {
      const uid = users[0].uid || users[0].id;
      const doc = await readFirestoreDoc('users', uid);
      steps.push({
        step: '5. readFirestoreDoc users/{uid}',
        success: !!doc,
        data: doc ? { uid, role: doc.role, email: doc.email, displayName: doc.displayName } : null,
      });
    } else {
      steps.push({
        step: '5. readFirestoreDoc users/{uid}',
        success: false,
        error: 'No users in collection to test with',
      });
    }
  } catch (err: any) {
    steps.push({
      step: '5. readFirestoreDoc users/{uid}',
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
    nextAction: allSuccess
      ? '✅ All steps success! /api/get-role will work. Login at /admin should return super_admin.'
      : '❌ Some steps failed. Fix the failing step before testing login.',
  }, { status: allSuccess ? 200 : 500 });
}
