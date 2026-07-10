// Cloudinary Upload API Route — server-side signed upload
// POST /api/cloudinary-upload
// Body: FormData { file: File, folder?: string }
// Auth: Bearer <Firebase ID Token> (must be admin/editor)
// Uses REST API for Firebase (no firebase-admin import).
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, readFirestoreDoc } from '@/lib/firebase/rest-api';
import { uploadToCloudinaryServer } from '@/lib/firebase/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 1. Check Cloudinary config
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const cloudApiKey = process.env.CLOUDINARY_API_KEY;
  const cloudApiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !cloudApiKey || !cloudApiSecret) {
    return NextResponse.json({ error: 'Cloudinary belum dikonfigurasi. Set CLOUDINARY_* env vars.' }, { status: 500 });
  }

  // 2. Check auth token
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized: token tidak ditemukan' }, { status: 401 });

  try {
    // 3. Verify token & check role via REST API
    const { uid } = await verifyIdToken(token);
    const userData = await readFirestoreDoc('users', uid);

    if (!userData) {
      return NextResponse.json({ error: 'User belum terdaftar di Firestore' }, { status: 403 });
    }
    if (!['super_admin', 'admin', 'editor'].includes(userData.role)) {
      return NextResponse.json({ error: 'Anda tidak memiliki izin upload' }, { status: 403 });
    }

    // 4. Process upload
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'pbr';
    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await uploadToCloudinaryServer(buffer, {
      folder,
      resourceType: file.type.startsWith('video/') ? 'video' : 'image',
    });

    if (result.error || !result.url) return NextResponse.json({ error: result.error || 'Upload gagal' }, { status: 500 });

    return NextResponse.json({
      url: result.url, publicId: result.publicId, width: result.width, height: result.height, bytes: result.bytes, format: result.format,
    });
  } catch (err: any) {
    console.error('[api/cloudinary-upload]', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
