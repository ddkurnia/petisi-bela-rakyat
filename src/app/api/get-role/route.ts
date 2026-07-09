// API Route: /api/get-role
// ============================================================
// Server-side role lookup using firebase-admin.
// Bulletproof — doesn't depend on client Firestore SDK state.
//
// CRITICAL: All env vars are read INSIDE the handler, not at
// module load. Next.js dev mode caches module-level reads, so
// if .env.local is edited after dev server starts, module-level
// reads return stale values. Reading inside handler ensures
// we always get the latest env vars.
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // ============================================================
  // Read env vars FRESH on every request (not cached at module load)
  // ============================================================
  const adminProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const adminClientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const adminPrivateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
  // Convert literal \n to actual newlines (needed because .env files
  // store multi-line values with \n escaped)
  const adminPrivateKey = adminPrivateKeyRaw.replace(/\\n/g, '\n');

  // Debug log (server-side only, not exposed to client)
  console.log('[api/get-role] env check:', {
    hasProjectId: !!adminProjectId,
    hasClientEmail: !!adminClientEmail,
    hasPrivateKey: !!adminPrivateKey,
    privateKeyLen: adminPrivateKey.length,
    privateKeyStartsWithBegin: adminPrivateKey.startsWith('-----BEGIN PRIVATE KEY-----'),
    projectId: adminProjectId || '(missing)',
    clientEmail: adminClientEmail ? adminClientEmail.substring(0, 30) + '...' : '(missing)',
  });

  // Validate all 3 vars are present
  const missing: string[] = [];
  if (!adminProjectId) missing.push('FIREBASE_ADMIN_PROJECT_ID');
  if (!adminClientEmail) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
  if (!adminPrivateKey) missing.push('FIREBASE_ADMIN_PRIVATE_KEY');

  if (missing.length > 0) {
    return NextResponse.json({
      error: `Firebase Admin SDK belum dikonfigurasi. Missing env vars: ${missing.join(', ')}`,
      hint: 'Cek .env.local. RESTART dev server setelah edit (Ctrl+C lalu npm run dev). Jika masih gagal, cek /api/debug-env untuk lihat apa yang server baca.',
      missing,
    }, { status: 500 });
  }

  // Validate private key format
  if (!adminPrivateKey.includes('BEGIN PRIVATE KEY')) {
    return NextResponse.json({
      error: 'FIREBASE_ADMIN_PRIVATE_KEY format tidak valid. Harus berisi "-----BEGIN PRIVATE KEY-----"',
      hint: 'Pastikan copy seluruh private key dari file JSON, termasuk header/footer. Wrap dengan tanda kutip di .env.local.',
      privateKeyLen: adminPrivateKey.length,
      privateKeyStart: adminPrivateKey.substring(0, 50),
    }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const idToken = body?.idToken;
    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken required' }, { status: 400 });
    }

    // Lazy import firebase-admin (only when this route is hit)
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');
    const { getFirestore } = await import('firebase-admin/firestore');

    const adminApp = getApps().find((a) => a.name === 'admin') || initializeApp({
      credential: cert({
        projectId: adminProjectId,
        clientEmail: adminClientEmail,
        privateKey: adminPrivateKey,
      }),
    }, 'admin');

    // 1. Verify ID token
    const decoded = await getAuth(adminApp).verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email || '';

    // 2. Read users/{uid} via admin SDK
    const adminDb = getFirestore(adminApp);
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
