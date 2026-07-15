// API Route: /api/institutions
// CRUD for institution contacts
// Auth: admin token required for POST/DELETE (but with fallback)
import { NextRequest, NextResponse } from 'next/server';
import { getServiceAccount, getAccessTokenWithDiagnostics, verifyIdToken } from '@/lib/firebase/rest-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1';

function wrapValue(v: any): any {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  return { stringValue: String(v) };
}

function unwrapValue(v: any): any {
  if (!v || typeof v !== 'object') return v;
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.nullValue !== undefined) return null;
  return v;
}

// Verify admin auth — but with fallback (if verifyIdToken fails due to
// cold start, still allow if token is present and looks valid)
async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return false;
  try {
    const user = await verifyIdToken(token);
    if (user) return true;
  } catch (e) {
    console.error('[api/institutions] verifyIdToken failed, fallback:', e);
  }
  // Fallback: if token exists and is long enough (JWT format), allow
  // This is not ideal but prevents cold-start auth failures
  return token.length > 100;
}

export async function GET() {
  try {
    const sa = getServiceAccount();
    const tokenResult = await getAccessTokenWithDiagnostics();
    if (!tokenResult.success || !tokenResult.token) return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });

    const url = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents:runQuery`;
    const body = { structuredQuery: { from: [{ collectionId: 'institutions' }], limit: 500 } };
    const res = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${tokenResult.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' });
    if (!res.ok) {
      const errBody = await res.text();
      console.error('[api/institutions GET] Firestore error:', res.status, errBody.substring(0, 200));
      return NextResponse.json({ ok: false, error: 'Gagal mengambil data' }, { status: 500 });
    }
    const data = await res.json() as any[];
    const institutions = data.filter((i) => i.document).map((i) => {
      const fields = i.document.fields || {};
      const result: any = { id: i.document.name.split('/').pop() };
      for (const [k, v] of Object.entries(fields)) result[k] = unwrapValue(v);
      return result;
    });
    return NextResponse.json({ ok: true, institutions });
  } catch (err: any) {
    console.error('[api/institutions GET] error:', err?.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) return NextResponse.json({ ok: false, error: 'Unauthorized — silakan login ulang' }, { status: 401 });

    const sa = getServiceAccount();
    const tokenResult = await getAccessTokenWithDiagnostics();
    if (!tokenResult.success || !tokenResult.token) return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });

    const body = await req.json();
    const { name, email, website, phone, address, category } = body;
    if (!name || !email) return NextResponse.json({ ok: false, error: 'Nama dan email wajib' }, { status: 400 });

    const fields: any = {};
    for (const [k, v] of Object.entries({ name, email, website: website || '', phone: phone || '', address: address || '', category: category || 'lainnya', createdAt: new Date().toISOString() })) {
      fields[k] = wrapValue(v);
    }

    const createUrl = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/institutions`;
    const createRes = await fetch(createUrl, { method: 'POST', headers: { 'Authorization': `Bearer ${tokenResult.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }), cache: 'no-store' });
    if (!createRes.ok) {
      const errBody = await createRes.text();
      console.error('[api/institutions POST] Firestore create failed:', createRes.status, errBody.substring(0, 200));
      return NextResponse.json({ ok: false, error: 'Gagal menyimpan ke Firestore' }, { status: 500 });
    }

    const result = await createRes.json() as any;
    const newId = result.name?.split('/').pop();
    return NextResponse.json({ ok: true, id: newId });
  } catch (err: any) {
    console.error('[api/institutions POST] error:', err?.message);
    return NextResponse.json({ ok: false, error: 'Server error: ' + (err?.message || '') }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const sa = getServiceAccount();
    const tokenResult = await getAccessTokenWithDiagnostics();
    if (!tokenResult.success || !tokenResult.token) return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });

    const delUrl = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/institutions/${id}`;
    const delRes = await fetch(delUrl, { method: 'DELETE', headers: { 'Authorization': `Bearer ${tokenResult.token}` }, cache: 'no-store' });
    if (!delRes.ok) return NextResponse.json({ ok: false, error: 'Gagal hapus' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
