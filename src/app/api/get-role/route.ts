// API Route: /api/get-role
// ============================================================
// Server-side role lookup using firebase-admin.
// Bulletproof — doesn't depend on client Firestore SDK state.
//
// CRITICAL: Use STATIC imports for firebase-admin (not dynamic
// `await import()`). Dynamic imports fail in Vercel production
// builds with "ERR_REQUIRE_ESM: require() of ES Module" error.
// Static imports work in both dev and production.
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert, type App as AdminApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Lazy-initialized admin app (singleton per server instance)
let adminApp: AdminApp | null = null;

function getAdminApp(): AdminApp {
  if (adminApp) return adminApp;

  // Read env vars FRESH (not at module load — avoids dev cache issues)
  const adminProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const adminClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const adminPrivateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
  const adminPrivateKey = adminPrivateKeyRaw.replace(/\\n/g, '\n');

  console.log('[api/get-role] init admin app:', {
    hasProjectId: !!adminProjectId,
    hasClientEmail: !!adminClientEmail,
    hasPrivateKey: !!adminPrivateKey,
    privateKeyLen: adminPrivateKey.length,
  });

  const missing: string[] = [];
  if (!adminProjectId) missing.push('FIREBASE_ADMIN_PROJECT_ID');
  if (!adminClientEmail) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
  if (!adminPrivateKey) missing.push('FIREBASE_ADMIN_PRIVATE_KEY');

  if (missing.length > 0) {
    throw new Error(`Firebase Admin SDK belum dikonfigurasi. Missing: ${missing.join(', ')}`);
  }

  if (!adminPrivateKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('FIREBASE_ADMIN_PRIVATE_KEY format tidak valid');
  }

  // Reuse existing app if already initialized (avoid duplicate init error)
  const existing = getApps().find((a) => a.name === 'admin');
  if (existing) {
    adminApp = existing;
    return adminApp;
  }

  adminApp = initializeApp({
    credential: cert({
      projectId: adminProjectId,
      clientEmail: adminClientEmail,
      privateKey: adminPrivateKey,
    }),
  }, 'admin');
  return adminApp;
}

export async function POST(req: NextRequest) {
  try {
    const app = getAdminApp();

    const body = await req.json().catch(() => ({}));
    const idToken = body?.idToken;
    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken required' }, { status: 400 });
    }

    // 1. Verify ID token
    const decoded = await getAuth(app).verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email || '';

    // 2. Read users/{uid} via admin SDK
    const adminDb = getFirestore(app);
    const userSnap = await adminDb.collection('users').doc(uid).get();

    if (!userSnap.exists) {
      return NextResponse.json({
        role: 'editor',
        warning: `Document users/${uid} does not exist. Run: node scripts/setup-admin.mjs ${email} "Administrator"`,
        uid,
        email,
      }, { status: 200 });
    }

    const data = userSnap.data() as any;
    const role = data.role;

    if (role !== 'super_admin' && role !== 'admin' && role !== 'editor') {
      return NextResponse.json({
        role: 'editor',
        warning: `Invalid role value: "${role}". Expected: super_admin | admin | editor`,
        uid,
        email,
      }, { status: 200 });
    }

    return NextResponse.json({
      role,
      uid,
      email,
      displayName: data.displayName || '',
    }, { status: 200 });
  } catch (err: any) {
    console.error('[api/get-role] error:', err?.code || err?.message);
    const code = err?.code || '';
    let status = 500;
    let message = err?.message || 'Server error';

    if (code === 'auth/id-token-expired') {
      status = 401;
      message = 'ID token expired — login again';
    } else if (code === 'auth/argument-error') {
      status = 401;
      message = 'Invalid ID token';
    }

    return NextResponse.json({ error: message, code }, { status });
  }
}
