// API Route: /api/official-letters
// CRUD for official letters + auto letter number generation
import { NextRequest, NextResponse } from 'next/server';
import { getServiceAccount, getAccessTokenWithDiagnostics } from '@/lib/firebase/rest-api';
import { verifyIdToken } from '@/lib/firebase/rest-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1';
const ROMAN_MONTHS = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

function generateLetterNumber(seq: number): string {
  const now = new Date();
  const month = ROMAN_MONTHS[now.getMonth()];
  const year = now.getFullYear();
  return `${String(seq).padStart(3, '0')}/PBR/${month}/${year}`;
}

function wrapValue(v: any): any {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(wrapValue) } };
  if (typeof v === 'object') {
    const fields: any = {};
    for (const [k, val] of Object.entries(v)) fields[k] = wrapValue(val);
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

function unwrapValue(v: any): any {
  if (!v || typeof v !== 'object') return v;
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.arrayValue?.values) return v.arrayValue.values.map(unwrapValue);
  if (v.mapValue?.fields) {
    const obj: any = {};
    for (const [k, val] of Object.entries(v.mapValue.fields)) obj[k] = unwrapValue(val);
    return obj;
  }
  if (v.nullValue !== undefined) return null;
  return v;
}

async function getAuth(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try { return await verifyIdToken(token); } catch { return null; }
}

async function firestoreQuery(sa: any, token: string, collection: string, filters: any[] = [], limitN = 100) {
  const url = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents:runQuery`;
  const body: any = { structuredQuery: { from: [{ collectionId: collection }], limit: limitN } };
  if (filters.length > 0) {
    body.structuredQuery.where = {
      compositeFilter: { op: 'AND', filters: filters.map((f) => ({
        fieldFilter: { field: { fieldPath: f.field }, op: f.op, value: f.value }
      })) }
    };
  }
  const res = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) return [];
  const data = await res.json() as any[];
  return data.filter((i) => i.document).map((i) => {
    const fields = i.document.fields || {};
    const result: any = { id: i.document.name.split('/').pop() };
    for (const [k, v] of Object.entries(fields)) result[k] = unwrapValue(v);
    return result;
  });
}

// GET — list letters (with pagination, search, filter)
export async function GET(req: NextRequest) {
  try {
    const user = await getAuth(req);
    if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const sa = getServiceAccount();
    const tokenResult = await getAccessTokenWithDiagnostics();
    if (!tokenResult.success || !tokenResult.token) return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limitN = Math.min(Number(searchParams.get('limit') || 50), 200);

    const filters: any[] = [];
    if (status && status !== 'all') {
      filters.push({ field: 'status', op: 'EQUAL', value: { stringValue: status } });
    }

    let letters = await firestoreQuery(sa, tokenResult.token, 'official_letters', filters, limitN);

    // Sort by createdAt desc
    letters.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    // Search filter (client-side since Firestore doesn't support full-text)
    if (search) {
      const q = search.toLowerCase();
      letters = letters.filter((l) =>
        l.letterNumber?.toLowerCase().includes(q) ||
        l.institution?.toLowerCase().includes(q) ||
        l.recipientName?.toLowerCase().includes(q) ||
        l.subject?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ ok: true, letters, count: letters.length });
  } catch (err: any) {
    console.error('[api/official-letters GET] error:', err?.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// POST — create letter (draft or send)
export async function POST(req: NextRequest) {
  try {
    const user = await getAuth(req);
    if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const sa = getServiceAccount();
    const tokenResult = await getAccessTokenWithDiagnostics();
    if (!tokenResult.success || !tokenResult.token) return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });

    const body = await req.json();
    const { action, letterData } = body;

    // Generate letter number
    const existing = await firestoreQuery(sa, tokenResult.token, 'official_letters', [], 9999);
    const seq = existing.length + 1;
    const letterNumber = generateLetterNumber(seq);

    const now = new Date().toISOString();
    const newLetter = {
      letterNumber,
      institution: letterData.institution || '',
      recipientName: letterData.recipientName || '',
      recipientEmail: letterData.recipientEmail || '',
      cc: letterData.cc || [],
      bcc: letterData.bcc || [],
      subject: letterData.subject || '',
      content: letterData.content || '',
      attachments: letterData.attachments || [],
      priority: letterData.priority || 'normal',
      templateType: letterData.templateType || 'lainnya',
      status: action === 'send' ? 'sent' : 'draft',
      opened: false,
      replied: false,
      createdAt: now,
      sentAt: action === 'send' ? now : '',
      createdBy: user.uid,
    };

    // Save to Firestore
    const createUrl = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/official_letters`;
    const fields: any = {};
    for (const [k, v] of Object.entries(newLetter)) fields[k] = wrapValue(v);

    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenResult.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });

    if (!createRes.ok) {
      const errBody = await createRes.text();
      console.error('[api/official-letters POST] create failed:', createRes.status, errBody.substring(0, 200));
      return NextResponse.json({ ok: false, error: 'Gagal menyimpan surat' }, { status: 500 });
    }

    const result = await createRes.json() as any;
    const letterId = result.name?.split('/').pop();

    // If action is 'send', trigger email via Brevo
    if (action === 'send') {
      try {
        const emailRes = await fetch(new URL('/api/mail/send', req.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': req.headers.get('authorization') || '' },
          body: JSON.stringify({
            to: letterData.recipientEmail,
            cc: letterData.cc,
            bcc: letterData.bcc,
            subject: `${letterNumber} — ${letterData.subject}`,
            htmlContent: letterData.content,
            attachments: letterData.attachments,
            letterId,
          }),
        });
        const emailData = await emailRes.json();
        if (!emailData.ok) {
          // Update status to failed
          const patchUrl = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/official_letters/${letterId}?updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`;
          await fetch(patchUrl, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${tokenResult.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: { status: { stringValue: 'failed' }, updatedAt: { timestampValue: now } } }),
          });
          return NextResponse.json({ ok: false, error: 'Surat tersimpan tapi gagal dikirim: ' + (emailData.error || 'Email error'), letterId }, { status: 500 });
        }
      } catch (emailErr: any) {
        console.error('[api/official-letters POST] email send error:', emailErr?.message);
      }
    }

    return NextResponse.json({ ok: true, letterId, letterNumber, status: newLetter.status });
  } catch (err: any) {
    console.error('[api/official-letters POST] error:', err?.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// PATCH — update letter (edit draft, mark as replied, etc.)
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuth(req);
    if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const sa = getServiceAccount();
    const tokenResult = await getAccessTokenWithDiagnostics();
    if (!tokenResult.success || !tokenResult.token) return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });

    const body = await req.json();
    const { letterId, updates } = body;
    if (!letterId) return NextResponse.json({ ok: false, error: 'letterId required' }, { status: 400 });

    const fields: any = {};
    for (const [k, v] of Object.entries(updates)) fields[k] = wrapValue(v);
    fields.updatedAt = { timestampValue: new Date().toISOString() };

    const masks = Object.keys(fields).map((k) => `updateMask.fieldPaths=${k}`).join('&');
    const patchUrl = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/official_letters/${letterId}?${masks}`;

    const patchRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${tokenResult.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });

    if (!patchRes.ok) return NextResponse.json({ ok: false, error: 'Gagal update' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// DELETE — delete letter
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuth(req);
    if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const sa = getServiceAccount();
    const tokenResult = await getAccessTokenWithDiagnostics();
    if (!tokenResult.success || !tokenResult.token) return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const letterId = searchParams.get('id');
    if (!letterId) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });

    const delUrl = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/official_letters/${letterId}`;
    const delRes = await fetch(delUrl, { method: 'DELETE', headers: { 'Authorization': `Bearer ${tokenResult.token}` } });
    if (!delRes.ok) return NextResponse.json({ ok: false, error: 'Gagal hapus' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
