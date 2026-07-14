// API Route: /api/subscribe
// POST { email } → save to Firestore newsletter_subatures collection
// Anti-spam: 1 email per device (localStorage flag)
import { NextRequest, NextResponse } from 'next/server';
import { getServiceAccount, getAccessTokenWithDiagnostics } from '@/lib/firebase/rest-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Email tidak valid' }, { status: 400 });
    }

    const sa = getServiceAccount();
    const tokenResult = await getAccessTokenWithDiagnostics();
    if (!tokenResult.success || !tokenResult.token) {
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    // Check if already subscribed
    const queryUrl = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents:runQuery`;
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'newsletter_subscribers' }],
        limit: 1,
        where: {
          fieldFilter: { field: { fieldPath: 'email' }, op: 'EQUAL', value: { stringValue: email.toLowerCase() } },
        },
      },
    };
    const queryRes = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenResult.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody),
    });
    const queryData = await queryRes.json() as any[];
    if (queryData.some((item) => item.document)) {
      return NextResponse.json({ ok: false, error: 'Email sudah berlangganan' }, { status: 409 });
    }

    // Create new subscriber
    const createUrl = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/newsletter_subscribers`;
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenResult.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          email: { stringValue: email.toLowerCase() },
          subscribedAt: { timestampValue: new Date().toISOString() },
          active: { booleanValue: true },
        },
      }),
    });

    if (!createRes.ok) {
      return NextResponse.json({ ok: false, error: 'Gagal menyimpan' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Berhasil berlangganan!' });
  } catch (err: any) {
    console.error('[api/subscribe] error:', err?.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
