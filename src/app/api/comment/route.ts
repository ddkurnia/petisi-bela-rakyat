// API Route: /api/comment
// POST { articleId, articleType, name, comment } → save to Firestore comments
// GET ?articleId=X → list comments for article
import { NextRequest, NextResponse } from 'next/server';
import { getServiceAccount, getAccessTokenWithDiagnostics } from '@/lib/firebase/rest-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1';
const VALID_TYPES = ['blog', 'news'];

export async function POST(req: NextRequest) {
  try {
    const { articleId, articleType, name, comment } = await req.json();
    if (!articleId || !articleType || !name || !comment) {
      return NextResponse.json({ ok: false, error: 'Semua field wajib' }, { status: 400 });
    }
    if (!VALID_TYPES.includes(articleType)) {
      return NextResponse.json({ ok: false, error: 'Tipe artikel tidak valid' }, { status: 400 });
    }
    if (comment.length > 1000) {
      return NextResponse.json({ ok: false, error: 'Komentar maksimal 1000 karakter' }, { status: 400 });
    }

    const sa = getServiceAccount();
    const tokenResult = await getAccessTokenWithDiagnostics();
    if (!tokenResult.success || !tokenResult.token) {
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    // Get client IP for anti-spam (hashed)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

    const createUrl = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/comments`;
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenResult.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          articleId: { stringValue: articleId },
          articleType: { stringValue: articleType },
          name: { stringValue: name.trim().substring(0, 100) },
          comment: { stringValue: comment.trim() },
          status: { stringValue: 'approved' },
          createdAt: { timestampValue: new Date().toISOString() },
        },
      }),
    });

    if (!createRes.ok) {
      return NextResponse.json({ ok: false, error: 'Gagal menyimpan komentar' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Komentar berhasil dikirim!' });
  } catch (err: any) {
    console.error('[api/comment POST] error:', err?.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get('articleId');
    if (!articleId) {
      return NextResponse.json({ ok: false, error: 'articleId required' }, { status: 400 });
    }

    const sa = getServiceAccount();
    const tokenResult = await getAccessTokenWithDiagnostics();
    if (!tokenResult.success || !tokenResult.token) {
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    const queryUrl = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents:runQuery`;
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'comments' }],
        limit: 100,
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              { fieldFilter: { field: { fieldPath: 'articleId' }, op: 'EQUAL', value: { stringValue: articleId } } },
              { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'approved' } } },
            ],
          },
        },
      },
    };

    const queryRes = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenResult.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody),
    });

    if (!queryRes.ok) {
      return NextResponse.json({ ok: false, error: 'Gagal mengambil komentar' }, { status: 500 });
    }

    const queryData = await queryRes.json() as any[];
    const comments: any[] = [];
    for (const item of queryData) {
      if (item.document) {
        const fields = item.document.fields || {};
        comments.push({
          id: item.document.name.split('/').pop(),
          name: fields.name?.stringValue || '',
          comment: fields.comment?.stringValue || '',
          createdAt: fields.createdAt?.timestampValue || '',
        });
      }
    }

    // Sort by createdAt desc
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ ok: true, comments, count: comments.length });
  } catch (err: any) {
    console.error('[api/comment GET] error:', err?.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
