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

// Helper: update letter status in Firestore
async function updateLetterStatus(sa: any, token: string, letterId: string, status: string, now: string) {
  const patchUrl = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/official_letters/${letterId}?updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt`;
  await fetch(patchUrl, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { status: { stringValue: status }, updatedAt: { timestampValue: now } } }),
  });
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

    // If action is 'send', send email DIRECTLY via Brevo API (no internal fetch)
    if (action === 'send') {
      try {
        const apiKey = (process.env.BREVO_API_KEY || '').trim();
        const senderName = (process.env.BREVO_SENDER_NAME || 'Petisi Bela Rakyat').trim();
        const senderEmail = (process.env.BREVO_SENDER_EMAIL || 'official@belarakyat.org').trim();

        if (!apiKey) {
          // Update status to failed
          await updateLetterStatus(sa, tokenResult.token, letterId!, 'failed', now);
          return NextResponse.json({ ok: false, error: 'BREVO_API_KEY belum dikonfigurasi', letterId }, { status: 500 });
        }

        // Build Brevo email payload directly
        const emailPayload: any = {
          sender: { name: senderName, email: senderEmail },
          to: [{ email: letterData.recipientEmail }],
          subject: `${letterNumber} — ${letterData.subject}`,
          htmlContent: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;color:#111827;"><div style="border-bottom:3px solid #D62828;padding-bottom:15px;margin-bottom:20px;"><img src="https://belarakyat.org/pbr.png" alt="PBR" style="height:50px;"></div>${letterData.content || ''}<div style="border-top:2px solid #e5e7eb;margin-top:30px;padding-top:15px;font-size:12px;color:#6b7280;"><p><strong>Petisi Bela Rakyat</strong><br>Menyatukan Suara Rakyat Menjadi Perubahan<br>Email: ${senderEmail} | Web: https://belarakyat.org</p></div></body></html>`,
        };

        if (letterData.cc && letterData.cc.length > 0) {
          emailPayload.cc = letterData.cc.map((e: string) => ({ email: e }));
        }
        if (letterData.bcc && letterData.bcc.length > 0) {
          emailPayload.bcc = letterData.bcc.map((e: string) => ({ email: e }));
        }

        // Handle attachments
        if (letterData.attachments && letterData.attachments.length > 0) {
          const attachmentData: { name: string; content: string }[] = [];
          for (const att of letterData.attachments) {
            try {
              const attRes = await fetch(att.url);
              if (attRes.ok) {
                const buffer = Buffer.from(await attRes.arrayBuffer());
                attachmentData.push({ name: att.name, content: buffer.toString('base64') });
              }
            } catch (e) { console.error('[official-letters] attachment error:', e); }
          }
          if (attachmentData.length > 0) emailPayload.attachment = attachmentData as any;
        }

        // Send directly to Brevo API
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'api-key': apiKey,
          },
          body: JSON.stringify(emailPayload),
        });

        if (!brevoRes.ok) {
          const errBody = await brevoRes.text();
          console.error('[official-letters] Brevo error:', brevoRes.status, errBody.substring(0, 300));

          let errorMsg = `Brevo error ${brevoRes.status}`;
          try { const e = JSON.parse(errBody); if (e.message) errorMsg = e.message; } catch {}

          // Update status to failed
          await updateLetterStatus(sa, tokenResult.token, letterId!, 'failed', now);
          return NextResponse.json({ ok: false, error: `Gagal kirim email: ${errorMsg}`, letterId }, { status: 500 });
        }

        const brevoData = await brevoRes.json() as any;
        console.log('[official-letters] Email sent successfully:', brevoData.messageId);

      } catch (emailErr: any) {
        console.error('[official-letters] email send error:', emailErr?.message);
        await updateLetterStatus(sa, tokenResult.token, letterId!, 'failed', now);
        return NextResponse.json({ ok: false, error: 'Gagal kirim email: ' + emailErr?.message, letterId }, { status: 500 });
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
