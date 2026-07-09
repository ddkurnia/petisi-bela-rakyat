// API Route: /api/ping
// ============================================================
// Health check — verifies dev server is running NEW code.
// GET /api/ping → { ok: true, version: "...", time: "...", adminConfigured: bool }
//
// Use this to verify the dev server has picked up the latest
// commit. If version is old, you need to restart dev server.
// ============================================================
import { NextResponse } from 'next/server';
import { isFirebaseAdminConfigured, isCloudinaryConfigured } from '@/lib/firebase/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const APP_VERSION = '2025-07-09-v4-apirole';

export function GET() {
  return NextResponse.json({
    ok: true,
    version: APP_VERSION,
    time: new Date().toISOString(),
    adminConfigured: isFirebaseAdminConfigured,
    cloudinaryConfigured: isCloudinaryConfigured,
    endpoints: ['/api/ping', '/api/get-role', '/api/cloudinary-upload'],
  });
}
