// API Route: /api/sign-petition
// ============================================================
// Submit petition signature (change.org style) with anti-spam.
//
// Anti-spam strategy:
//   1. Device fingerprint from client (localStorage random ID + browser data)
//   2. IP address (hashed for privacy) from request headers
//   3. Combination: campaignId + deviceFingerprint → unique check
//   4. Combination: campaignId + email → unique check (prevent multi-account)
//   5. Combination: campaignId + hashedIP → limit 1 per IP
//
// POST /api/sign-petition
// Body: {
//   campaignId, name, email, address, city, province,
//   latitude?, longitude?, locationLabel?, comment?,
//   deviceFingerprint
// }
// Response: { ok: true, signature: {...} } or { ok: false, error: "..." }
//
// GET /api/sign-petition?campaignId=X&limit=10
// Response: { ok: true, signatures: [...], count: N }
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getServiceAccount, getAccessTokenWithDiagnostics } from '@/lib/firebase/rest-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1';

// Hash IP for privacy (SHA-256, truncated)
function hashIp(ip: string): string {
  if (!ip) return '';
  return createHash('sha256').update(ip).digest('hex').substring(0, 32);
}

// Get real client IP from various headers (Vercel proxy, Cloudflare, etc.)
function getClientIp(req: NextRequest): string {
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-client-ip',
    'x-cluster-client-ip',
  ];
  for (const h of headers) {
    const val = req.headers.get(h);
    if (val) {
      // x-forwarded-for can be comma-separated, take first
      return val.split(',')[0].trim();
    }
  }
  return 'unknown';
}

// Firestore REST API helpers
async function firestoreQuery(collection: string, filters: any[], limitCount: number = 100): Promise<any[]> {
  const sa = getServiceAccount();
  const tokenResult = await getAccessTokenWithDiagnostics();
  if (!tokenResult.success || !tokenResult.token) throw new Error('Auth failed');

  const url = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents:runQuery`;
  const body: any = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      limit: limitCount,
      where: {
        compositeFilter: {
          op: 'AND',
          filters: filters.map((f) => ({
            fieldFilter: {
              field: { fieldPath: f.field },
              op: f.op,
              value: f.value,
            },
          })),
        },
      },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenResult.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Firestore query failed: ${res.status} ${errBody.substring(0, 200)}`);
  }

  const data = await res.json() as any[];
  const results: any[] = [];
  for (const item of data) {
    if (item.document) {
      const doc = item.document;
      const fields = doc.fields || {};
      const result: any = { id: doc.name.split('/').pop() };
      for (const [key, value] of Object.entries(fields)) {
        result[key] = unwrapValue(value as any);
      }
      results.push(result);
    }
  }
  return results;
}

async function firestoreCreate(collection: string, data: any): Promise<string> {
  const sa = getServiceAccount();
  const tokenResult = await getAccessTokenWithDiagnostics();
  if (!tokenResult.success || !tokenResult.token) throw new Error('Auth failed');

  const url = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/${collection}`;
  const fields: any = {};
  for (const [key, value] of Object.entries(data)) {
    fields[key] = wrapValue(value);
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenResult.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Firestore create failed: ${res.status} ${errBody.substring(0, 200)}`);
  }

  const result = await res.json() as any;
  return result.name?.split('/').pop() || '';
}

function wrapValue(value: any): any {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  return { stringValue: String(value) };
}

function unwrapValue(value: any): any {
  if (!value || typeof value !== 'object') return value;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.integerValue !== undefined) return Number(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.nullValue !== undefined) return null;
  return value;
}

// ============================================================
// POST — submit signature
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      campaignId, name, email, address, city, province,
      latitude, longitude, locationLabel, comment,
      deviceFingerprint,
    } = body as any;

    // Validate required fields
    if (!campaignId || !name || !email || !address || !city || !province) {
      return NextResponse.json({
        ok: false,
        error: 'Field wajib: campaignId, name, email, address, city, province',
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ ok: false, error: 'Format email tidak valid' }, { status: 400 });
    }

    // Get client IP (hashed for privacy)
    const clientIp = getClientIp(req);
    const hashedIp = hashIp(clientIp);
    const userAgent = req.headers.get('user-agent') || '';

    // Determine device fingerprint
    // If client provided one, use it; else fallback to hashed IP + UA
    const finalFingerprint = deviceFingerprint || `${hashedIp}_${createHash('sha256').update(userAgent).digest('hex').substring(0, 16)}`;

    // ============================================================
    // ANTI-SPAM CHECKS
    // ============================================================
    // 1. Check device fingerprint — 1 device = 1 signature per campaign
    const existingByDevice = await firestoreQuery('petition_signatures', [
      { field: 'campaignId', op: 'EQUAL', value: { stringValue: campaignId } },
      { field: 'deviceFingerprint', op: 'EQUAL', value: { stringValue: finalFingerprint } },
    ], 1);

    if (existingByDevice.length > 0) {
      return NextResponse.json({
        ok: false,
        error: 'Perangkat ini sudah menandatangani petisi ini',
        code: 'ALREADY_SIGNED_DEVICE',
      }, { status: 409 });
    }

    // 2. Check email — 1 email = 1 signature per campaign
    const existingByEmail = await firestoreQuery('petition_signatures', [
      { field: 'campaignId', op: 'EQUAL', value: { stringValue: campaignId } },
      { field: 'email', op: 'EQUAL', value: { stringValue: email.toLowerCase() } },
    ], 1);

    if (existingByEmail.length > 0) {
      return NextResponse.json({
        ok: false,
        error: 'Email ini sudah menandatangani petisi ini',
        code: 'ALREADY_SIGNED_EMAIL',
      }, { status: 409 });
    }

    // 3. Check IP — limit 1 per IP (with some tolerance for shared networks)
    // We allow up to 2 signatures per IP per campaign (for family/shared office)
    const existingByIp = await firestoreQuery('petition_signatures', [
      { field: 'campaignId', op: 'EQUAL', value: { stringValue: campaignId } },
      { field: 'ipAddress', op: 'EQUAL', value: { stringValue: hashedIp } },
    ], 10);

    if (existingByIp.length >= 3) {
      return NextResponse.json({
        ok: false,
        error: 'Batas tanda tangan dari jaringan ini tercapai. Hubungi admin jika ini kesalahan.',
        code: 'IP_LIMIT_REACHED',
      }, { status: 429 });
    }

    // ============================================================
    // SAVE SIGNATURE
    // ============================================================
    const signatureData = {
      campaignId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      address: address.trim(),
      city: city.trim(),
      province: province.trim(),
      latitude: latitude || null,
      longitude: longitude || null,
      locationLabel: locationLabel || '',
      deviceFingerprint: finalFingerprint,
      ipAddress: hashedIp,
      userAgent: userAgent.substring(0, 200),
      comment: (comment || '').trim(),
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    const signatureId = await firestoreCreate('petition_signatures', signatureData);

    return NextResponse.json({
      ok: true,
      signature: { id: signatureId, ...signatureData },
    }, { status: 201 });

  } catch (err: any) {
    console.error('[api/sign-petition POST] error:', err?.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// ============================================================
// GET — list signatures for a campaign
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');
    const limitCount = Math.min(Number(searchParams.get('limit') || 50), 200);

    if (!campaignId) {
      return NextResponse.json({ ok: false, error: 'campaignId required' }, { status: 400 });
    }

    const signatures = await firestoreQuery('petition_signatures', [
      { field: 'campaignId', op: 'EQUAL', value: { stringValue: campaignId } },
    ], limitCount);

    // Sort by createdAt desc (newest first)
    signatures.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    // Mask sensitive data for public view (hide email, hide full address)
    const publicSignatures = signatures.map((s) => ({
      id: s.id,
      name: s.name,
      city: s.city,
      province: s.province,
      locationLabel: s.locationLabel || '',
      comment: s.comment || '',
      createdAt: s.createdAt,
      // Mask email for privacy: j***@gmail.com
      emailMasked: s.email ? `${s.email.charAt(0)}***@${s.email.split('@')[1]}` : '',
    }));

    return NextResponse.json({
      ok: true,
      signatures: publicSignatures,
      count: signatures.length,
    });
  } catch (err: any) {
    console.error('[api/sign-petition GET] error:', err?.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
