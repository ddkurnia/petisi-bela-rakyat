// API Route: /api/get-role
// ============================================================
// Server-side role lookup using firebase-admin.
// Bulletproof — doesn't depend on client Firestore SDK state.
//
// POST /api/get-role
// Body: { idToken: "<Firebase ID Token>" }
// Response: { role: "super_admin" | "admin" | "editor" } or { error }
//
// Flow:
//   1. Client (browser) signs in with Firebase Auth → gets ID token
//   2. Client POSTs ID token to this endpoint
//   3. Server verifies token via firebase-admin
//   4. Server reads users/{uid} via firebase-admin Firestore
//      (admin SDK bypasses security rules — server is trusted)
//   5. Returns role
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseAdminConfigured, firebaseAdminConfig } from '@/lib/firebase/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const idToken = body?.idToken;
    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken required' }, { status: 400 });
    }

    if (!isFirebaseAdminConfigured) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK belum dikonfigurasi. Set FIREBASE_ADMIN_* env vars.' },
        { status: 500 }
      );
    }

    // Lazy import firebase-admin (only when this route is hit)
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');
    const { getFirestore } = await import('firebase-admin/firestore');

    const adminApp = getApps().find((a) => a.name === 'admin') || initializeApp({
      credential: cert({
        projectId: firebaseAdminConfig.projectId,
        clientEmail: firebaseAdminConfig.clientEmail,
        privateKey: firebaseAdminConfig.privateKey,
      }),
    }, 'admin');

    // 1. Verify ID token — this confirms the user is authenticated
    const decoded = await getAuth(adminApp).verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email || '';

    // 2. Read users/{uid} via admin SDK (bypasses security rules)
    const adminDb = getFirestore(adminApp);
    const userSnap = await adminDb.collection('users').doc(uid).get();

    if (!userSnap.exists) {
      // Document doesn't exist at users/{uid}.
      // Common cause: document was created via Firebase Console
      // with auto-generated ID instead of Auth UID.
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
