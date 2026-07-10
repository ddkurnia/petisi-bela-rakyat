// API Route: /api/test-admin
// ============================================================
// Isolated test for firebase-admin initialization.
// GET /api/test-admin → { step, success, error? }
//
// Use this to diagnose why /api/get-role returns HTTP 500: unknown.
// This endpoint tests EACH step separately so we can see exactly
// where firebase-admin fails in Vercel production.
// ============================================================
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert, type App as AdminApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const steps: { step: string; success: boolean; error?: string; data?: any }[] = [];

  // Step 1: Check env vars
  try {
    const adminProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const adminClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const adminPrivateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
    const adminPrivateKey = adminPrivateKeyRaw.replace(/\\n/g, '\n');

    steps.push({
      step: '1. Check env vars',
      success: !!(adminProjectId && adminClientEmail && adminPrivateKey),
      data: {
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

  // Step 2: Test cert() creation
  try {
    const adminProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID!;
    const adminClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
    const adminPrivateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    const credential = cert({
      projectId: adminProjectId,
      clientEmail: adminClientEmail,
      privateKey: adminPrivateKey,
    });
    steps.push({
      step: '2. Create cert()',
      success: true,
      data: { credentialType: typeof credential },
    });
  } catch (err: any) {
    steps.push({
      step: '2. Create cert()',
      success: false,
      error: `${err?.name || 'Error'}: ${err?.message || String(err)}`,
    });
  }

  // Step 3: Initialize app
  let app: AdminApp;
  try {
    const adminProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID!;
    const adminClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
    const adminPrivateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    const existing = getApps().find((a) => a.name === 'admin');
    app = existing || initializeApp({
      credential: cert({
        projectId: adminProjectId,
        clientEmail: adminClientEmail,
        privateKey: adminPrivateKey,
      }),
    }, 'admin');
    steps.push({
      step: '3. Initialize app',
      success: true,
      data: { appName: app.name },
    });
  } catch (err: any) {
    steps.push({
      step: '3. Initialize app',
      success: false,
      error: `${err?.name || 'Error'}: ${err?.message || String(err)}`,
    });
    return NextResponse.json({ steps, error: 'Init failed at step 3' }, { status: 500 });
  }

  // Step 4: Test getAuth()
  try {
    const auth = getAuth(app);
    steps.push({
      step: '4. getAuth()',
      success: true,
      data: { authType: typeof auth },
    });
  } catch (err: any) {
    steps.push({
      step: '4. getAuth()',
      success: false,
      error: `${err?.name || 'Error'}: ${err?.message || String(err)}`,
    });
  }

  // Step 5: Test getFirestore()
  try {
    const db = getFirestore(app);
    steps.push({
      step: '5. getFirestore()',
      success: true,
      data: { dbType: typeof db },
    });
  } catch (err: any) {
    steps.push({
      step: '5. getFirestore()',
      success: false,
      error: `${err?.name || 'Error'}: ${err?.message || String(err)}`,
    });
  }

  // Step 6: Test actual Firestore read (users collection)
  try {
    const db = getFirestore(app);
    const snap = await db.collection('users').limit(1).get();
    steps.push({
      step: '6. Firestore read users',
      success: true,
      data: { docsCount: snap.size, isEmpty: snap.empty },
    });
  } catch (err: any) {
    steps.push({
      step: '6. Firestore read users',
      success: false,
      error: `${err?.code || err?.name || 'Error'}: ${err?.message || String(err)}`,
    });
  }

  const allSuccess = steps.every((s) => s.success);
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    allStepsSuccess: allSuccess,
    steps,
  }, { status: allSuccess ? 200 : 500 });
}
