// API Route: /api/get-role
// ============================================================
// Server-side role lookup using Firebase REST API.
// NO firebase-admin import — uses Node.js crypto + fetch only.
// Bulletproof in Vercel production (no native modules).
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, readFirestoreDoc } from '@/lib/firebase/rest-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('[api/get-role] POST request received');

  try {
    const body = await req.json().catch(() => ({}));
    const idToken = body?.idToken;
    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken required' }, { status: 400 });
    }
    console.log('[api/get-role] step 1 OK: token received, len:', idToken.length);

    // Step 2: Verify ID token via REST API
    console.log('[api/get-role] step 2: verifyIdToken');
    const { uid, email } = await verifyIdToken(idToken);
    console.log('[api/get-role] step 2 OK:', { uid, email });

    // Step 3: Read users/{uid} via REST API
    console.log('[api/get-role] step 3: readFirestoreDoc users/' + uid);
    const userData = await readFirestoreDoc('users', uid);
    console.log('[api/get-role] step 3 OK:', { exists: !!userData, role: userData?.role });

    if (!userData) {
      return NextResponse.json({
        role: 'editor',
        warning: `Document users/${uid} does not exist. Run: node scripts/setup-admin.mjs ${email} "Administrator"`,
        uid,
        email,
      }, { status: 200 });
    }

    const role = userData.role;
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
      displayName: userData.displayName || '',
    }, { status: 200 });

  } catch (err: any) {
    console.error('[api/get-role] CATCH error:', {
      message: err?.message,
      code: err?.code,
      name: err?.name,
    });

    let status = 500;
    let message = err?.message || 'Unknown error';

    // Handle specific error patterns
    if (message.includes('TOKEN_EXPIRED') || message.includes('expired')) {
      status = 401;
      message = 'ID token expired — login again';
    } else if (message.includes('Token verification failed')) {
      status = 401;
    } else if (message.includes('not configured') || message.includes('Missing')) {
      status = 500;
    }

    return NextResponse.json({
      error: message,
      code: err?.code,
      name: err?.name,
    }, { status });
  }
}
