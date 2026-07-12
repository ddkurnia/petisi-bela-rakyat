// API Route: /api/track-visit
// ============================================================
// Increment visitor counter in Firestore.
// Called from public layout on every page load (client-side).
//
// Strategy:
//   - Use Firestore REST API (no firebase-admin needed)
//   - Update a single document: stats/visitors
//   - Fields: totalVisitors, todayVisitors, lastVisitAt, lastVisitDate
//   - Use serverTimestamp for atomic increment via REST
//
// POST /api/track-visit
// Body: { referrer?: string, path?: string }
// Response: { ok: true, totalVisitors: N, todayVisitors: N }
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { getServiceAccount, getAccessTokenWithDiagnostics } from '@/lib/firebase/rest-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1';

// Get today's date in YYYY-MM-DD (server timezone)
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const referrer = (body as any)?.referrer || '';
    const path = (body as any)?.path || '/';

    const sa = getServiceAccount();
    const tokenResult = await getAccessTokenWithDiagnostics();
    if (!tokenResult.success || !tokenResult.token) {
      return NextResponse.json({ ok: false, error: 'Auth failed' }, { status: 500 });
    }

    const today = getTodayDate();

    // Step 1: Read current stats
    const readUrl = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/stats/visitors`;
    const readRes = await fetch(readUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenResult.token}` },
    });

    let currentTotal = 0;
    let currentToday = 0;
    let lastVisitDate = '';

    if (readRes.ok) {
      const data = await readRes.json() as any;
      if (data.fields) {
        currentTotal = Number(data.fields.totalVisitors?.integerValue || 0);
        currentToday = Number(data.fields.todayVisitors?.integerValue || 0);
        lastVisitDate = data.fields.lastVisitDate?.stringValue || '';
      }
    }

    // Step 2: Calculate new values
    // If date changed, reset today counter
    const isNewDay = lastVisitDate !== today;
    const newToday = isNewDay ? 1 : currentToday + 1;
    const newTotal = currentTotal + 1;

    // Step 3: Write back (using PATCH to merge)
    const patchUrl = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/stats/visitors?updateMask.fieldPaths=totalVisitors&updateMask.fieldPaths=todayVisitors&updateMask.fieldPaths=lastVisitDate&updateMask.fieldPaths=lastVisitAt&updateMask.fieldPaths=lastReferrer&updateMask.fieldPaths=lastPath`;
    const patchBody = {
      fields: {
        totalVisitors: { integerValue: String(newTotal) },
        todayVisitors: { integerValue: String(newToday) },
        lastVisitDate: { stringValue: today },
        lastVisitAt: { timestampValue: new Date().toISOString() },
        lastReferrer: { stringValue: referrer.substring(0, 200) },
        lastPath: { stringValue: path.substring(0, 200) },
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
      console.error('[api/track-visit] PATCH failed:', patchRes.status, errBody.substring(0, 200));
      // Still return OK to client (don't block page load)
    }

    return NextResponse.json({
      ok: true,
      totalVisitors: newTotal,
      todayVisitors: newToday,
    });
  } catch (err: any) {
    console.error('[api/track-visit] error:', err?.message);
    // Return OK to not block page load
    return NextResponse.json({ ok: false, error: 'track failed' }, { status: 200 });
  }
}

// GET endpoint for reading stats (used by admin dashboard)
export async function GET() {
  try {
    const sa = getServiceAccount();
    const tokenResult = await getAccessTokenWithDiagnostics();
    if (!tokenResult.success || !tokenResult.token) {
      return NextResponse.json({ ok: false, error: 'Auth failed' }, { status: 500 });
    }

    const url = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/stats/visitors`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenResult.token}` },
    });

    if (res.status === 404) {
      return NextResponse.json({
        ok: true,
        totalVisitors: 0,
        todayVisitors: 0,
        lastVisitDate: '',
        lastVisitAt: '',
      });
    }

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: 'Read failed' }, { status: 500 });
    }

    const data = await res.json() as any;
    const fields = data.fields || {};
    return NextResponse.json({
      ok: true,
      totalVisitors: Number(fields.totalVisitors?.integerValue || 0),
      todayVisitors: Number(fields.todayVisitors?.integerValue || 0),
      lastVisitDate: fields.lastVisitDate?.stringValue || '',
      lastVisitAt: fields.lastVisitAt?.timestampValue || '',
      lastReferrer: fields.lastReferrer?.stringValue || '',
      lastPath: fields.lastPath?.stringValue || '',
    });
  } catch (err: any) {
    console.error('[api/track-visit GET] error:', err?.message);
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
