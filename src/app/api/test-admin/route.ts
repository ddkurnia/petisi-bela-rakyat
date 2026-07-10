// API Route: /api/test-admin
// ============================================================
// Isolated test for Firebase REST API auth (no firebase-admin SDK).
// Tests each sub-step separately so we can see exactly where it fails.
// ============================================================
import { NextResponse } from 'next/server';
import { getServiceAccount, createSignedJwt, getAccessTokenWithDiagnostics, queryFirestore } from '@/lib/firebase/rest-api';

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
        privateKeyFirst30: sa.privateKey.substring(0, 30),
        privateKeyLast30: sa.privateKey.substring(sa.privateKey.length - 30),
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
        headerLen: parts[0]?.length || 0,
        payloadLen: parts[1]?.length || 0,
        signatureLen: parts[2]?.length || 0,
        // Decode payload to verify contents
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
        jwtLen: result.jwtLen,
        oauthResponseStatus: result.oauthResponseStatus,
        oauthResponseBody: result.oauthResponseBody,
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

  // Step 4: Test Firestore query with the token
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

  const allSuccess = steps.every((s) => s.success);
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    approach: 'REST API with detailed diagnostics',
    allStepsSuccess: allSuccess,
    steps,
  }, { status: allSuccess ? 200 : 500 });
}
