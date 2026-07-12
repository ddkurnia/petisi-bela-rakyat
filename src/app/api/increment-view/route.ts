// API Route: /api/increment-view
// ============================================================
// Increment views counter for blog, news, or campaign.
// Server-side — uses Firebase REST API with service account
// credentials, bypassing Firestore security rules.
//
// This is REQUIRED because public visitors (not logged in) cannot
// update Firestore docs directly (rules: allow update: if isAdmin()).
// The API route uses the service account which has full access.
//
// POST /api/increment-view
// Body: { collection: "blog"|"news"|"campaigns", id: "..." }
// Response: { ok: true, views: N }
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { getServiceAccount, getAccessTokenWithDiagnostics } from '@/lib/firebase/rest-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1';
const VALID_COLLECTIONS = ['blog', 'news', 'campaigns', 'pengurus', 'kerja-kami'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const collection = (body as any)?.collection;
    const id = (body as any)?.id;

    if (!collection || !id) {
      return NextResponse.json({ ok: false, error: 'collection and id required' }, { status: 400 });
    }
    if (!VALID_COLLECTIONS.includes(collection)) {
      return NextResponse.json({ ok: false, error: 'invalid collection' }, { status: 400 });
    }

    const sa = getServiceAccount();
    const tokenResult = await getAccessTokenWithDiagnostics();
    if (!tokenResult.success || !tokenResult.token) {
      return NextResponse.json({ ok: false, error: 'Auth failed' }, { status: 500 });
    }

    // Step 1: Read current views
    const readUrl = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/${collection}/${id}?mask.fieldPaths=views`;
    const readRes = await fetch(readUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenResult.token}` },
    });

    let currentViews = 0;
    if (readRes.ok) {
      const data = await readRes.json() as any;
      if (data.fields?.views) {
        currentViews = Number(data.fields.views.integerValue || 0);
      }
    }

    // Step 2: Increment and write back
    const newViews = currentViews + 1;
    const patchUrl = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/${collection}/${id}?updateMask.fieldPaths=views&updateMask.fieldPaths=updatedAt`;
    const patchBody = {
      fields: {
        views: { integerValue: String(newViews) },
        updatedAt: { timestampValue: new Date().toISOString() },
      },
    };

    const patchRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patchBody),
    });

    if (!patchRes.ok) {
      const errBody = await patchRes.text();
      console.error('[api/increment-view] PATCH failed:', patchRes.status, errBody.substring(0, 200));
      return NextResponse.json({ ok: false, error: 'Increment failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, views: newViews });
  } catch (err: any) {
    console.error('[api/increment-view] error:', err?.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
