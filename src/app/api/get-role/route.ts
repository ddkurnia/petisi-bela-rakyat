// API Route: /api/get-role
// ============================================================
// Server-side role lookup using firebase-admin.
// Bulletproof error handling — catches ALL error types.
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert, type App as AdminApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let adminApp: AdminApp | null = null;

function getAdminApp(): AdminApp {
  if (adminApp) return adminApp;

  const adminProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const adminClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const adminPrivateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
  const adminPrivateKey = adminPrivateKeyRaw.replace(/\\n/g, '\n');

  const missing: string[] = [];
  if (!adminProjectId) missing.push('FIREBASE_ADMIN_PROJECT_ID');
  if (!adminClientEmail) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
  if (!adminPrivateKey) missing.push('FIREBASE_ADMIN_PRIVATE_KEY');

  if (missing.length > 0) {
    throw new Error(`Firebase Admin SDK belum dikonfigurasi. Missing: ${missing.join(', ')}`);
  }

  if (!adminPrivateKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('FIREBASE_ADMIN_PRIVATE_KEY format tidak valid (missing BEGIN PRIVATE KEY marker)');
  }

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

// Helper: extract useful error info from any error type
function extractError(err: any): { message: string; code?: string; name?: string } {
  if (!err) return { message: 'Unknown error (null)' };
  if (typeof err === 'string') return { message: err };
  return {
    message: err.message || String(err) || 'Unknown error',
    code: err.code,
    name: err.name,
  };
}

export async function POST(req: NextRequest) {
  console.log('[api/get-role] POST request received');

  try {
    // Step 1: Get admin app (init if needed)
    console.log('[api/get-role] step 1: getAdminApp');
    const app = getAdminApp();
    console.log('[api/get-role] step 1 OK:', { appName: app.name });

    // Step 2: Parse body
    console.log('[api/get-role] step 2: parse body');
    const body = await req.json().catch(() => ({}));
    const idToken = body?.idToken;
    if (!idToken || typeof idToken !== 'string') {
      console.log('[api/get-role] step 2 FAIL: idToken missing');
      return NextResponse.json({ error: 'idToken required' }, { status: 400 });
    }
    console.log('[api/get-role] step 2 OK:', { tokenLen: idToken.length });

    // Step 3: Verify ID token
    console.log('[api/get-role] step 3: verifyIdToken');
    const decoded = await getAuth(app).verifyIdToken(idToken);
    console.log('[api/get-role] step 3 OK:', { uid: decoded.uid, email: decoded.email });
    const uid = decoded.uid;
    const email = decoded.email || '';

    // Step 4: Read users/{uid}
    console.log('[api/get-role] step 4: getDoc users/' + uid);
    const adminDb = getFirestore(app);
    const userSnap = await adminDb.collection('users').doc(uid).get();
    console.log('[api/get-role] step 4 OK:', { exists: userSnap.exists });

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

    console.log('[api/get-role] SUCCESS:', { role, uid });
    return NextResponse.json({
      role,
      uid,
      email,
      displayName: data.displayName || '',
    }, { status: 200 });

  } catch (err: any) {
    const errInfo = extractError(err);
    console.error('[api/get-role] CATCH error:', {
      message: errInfo.message,
      code: errInfo.code,
      name: errInfo.name,
      stack: err?.stack?.split('\n').slice(0, 5).join('\n'),
    });

    let status = 500;
    let message = errInfo.message;

    if (errInfo.code === 'auth/id-token-expired') {
      status = 401;
      message = 'ID token expired — login again';
    } else if (errInfo.code === 'auth/argument-error') {
      status = 401;
      message = 'Invalid ID token';
    } else if (errInfo.code === 'app/invalid-credential') {
      status = 500;
      message = 'Firebase Admin credential invalid. Cek FIREBASE_ADMIN_PRIVATE_KEY format.';
    }

    return NextResponse.json({
      error: message,
      code: errInfo.code,
      name: errInfo.name,
      // Include step info so we know where it failed
      hint: 'Jalankan: curl https://belarakyat.org/api/test-admin untuk diagnose lengkap',
    }, { status });
  }
}
