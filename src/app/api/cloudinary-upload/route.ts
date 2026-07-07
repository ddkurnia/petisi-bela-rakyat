// Cloudinary Upload API Route — server-side signed upload
// POST /api/cloudinary-upload
// Body: FormData { file: File, folder?: string }
// Auth: Bearer <Firebase ID Token> (must be admin/editor)
import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinaryServer } from '@/lib/firebase/cloudinary';
import { isCloudinaryConfigured, isFirebaseAdminConfigured, firebaseAdminConfig } from '@/lib/firebase/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isCloudinaryConfigured) {
    return NextResponse.json({ error: 'Cloudinary belum dikonfigurasi. Set CLOUDINARY_* env vars.' }, { status: 500 });
  }

  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized: token tidak ditemukan' }, { status: 401 });

  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');
    const { getFirestore } = await import('firebase-admin/firestore');

    if (!isFirebaseAdminConfigured) {
      return NextResponse.json({ error: 'Firebase Admin SDK belum dikonfigurasi. Set FIREBASE_ADMIN_* env vars.' }, { status: 500 });
    }

    const adminApp = getApps().find((a) => a.name === 'admin') || initializeApp({
      credential: cert({
        projectId: firebaseAdminConfig.projectId,
        clientEmail: firebaseAdminConfig.clientEmail,
        privateKey: firebaseAdminConfig.privateKey,
      }),
    }, 'admin');

    const decoded = await getAuth(adminApp).verifyIdToken(token);
    const uid = decoded.uid;

    const adminDb = getFirestore(adminApp);
    const usersSnap = await adminDb.collection('users').where('uid', '==', uid).limit(1).get();
    if (usersSnap.empty) return NextResponse.json({ error: 'User belum terdaftar' }, { status: 403 });
    const userData = usersSnap.docs[0].data() as any;
    if (!['super_admin', 'admin', 'editor'].includes(userData.role)) {
      return NextResponse.json({ error: 'Anda tidak memiliki izin upload' }, { status: 403 });
    }

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
