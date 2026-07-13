// API Route: /api/og-image
// ============================================================
// Proxy Cloudinary OG image through our own domain.
//
// WHY: WhatsApp crawlers sometimes reject cross-domain images
// (res.cloudinary.com ≠ belarakyat.org). By proxying the image
// through our domain, WhatsApp sees it as same-origin → more
// reliable preview.
//
// GET /api/og-image → redirects to or proxies the Cloudinary image
// Query: ?url=<cloudinary_url> (for custom images like blog covers)
//        (no query) → default OG image
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_IMAGE = 'https://res.cloudinary.com/dnpdjhdgr/image/upload/v1783688377/pbr/famboueolzkyfyaquznx.png';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customUrl = searchParams.get('url');

    // Validate: only allow Cloudinary URLs (prevent SSRF)
    let imageUrl = DEFAULT_IMAGE;
    if (customUrl && customUrl.startsWith('https://res.cloudinary.com/')) {
      imageUrl = customUrl;
    }

    // Fetch the image
    const res = await fetch(imageUrl, {
      headers: { 'Accept': 'image/*' },
    });

    if (!res.ok) {
      // Fallback: return 302 redirect to Cloudinary directly
      return NextResponse.redirect(imageUrl, { status: 302 });
    }

    const contentType = res.headers.get('content-type') || 'image/png';
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return image with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err: any) {
    console.error('[api/og-image] error:', err?.message);
    // Fallback: redirect to Cloudinary
    return NextResponse.redirect(DEFAULT_IMAGE, { status: 302 });
  }
}
