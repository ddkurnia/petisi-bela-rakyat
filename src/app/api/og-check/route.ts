// API Route: /api/og-check
// ============================================================
// Diagnostic endpoint — fetch a URL and extract all OG/meta tags.
// Use to verify WhatsApp will see correct preview data.
//
// GET /api/og-check?url=https://belarakyat.org/blog/some-slug
// Response: { ok, url, title, description, images, rawTags }
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json({
        ok: false,
        error: 'Parameter "url" wajib. Contoh: /api/og-check?url=https://belarakyat.org/blog/slug',
      }, { status: 400 });
    }

    // Fetch the target URL
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'WhatsApp/2.23.20.0 A',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        error: `HTTP ${res.status} — ${res.statusText}`,
        url: targetUrl,
      }, { status: 500 });
    }

    const html = await res.text();

    // Extract all <meta> tags
    const metaTags: Record<string, string> = {};
    const metaRegex = /<meta\s+(?:property|name)=["']([^"']+)["']\s+content=["']([^"']*)["']/gi;
    let match;
    while ((match = metaRegex.exec(html)) !== null) {
      metaTags[match[1]] = match[2];
    }

    // Extract <title>
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Check critical WhatsApp tags
    const checks = {
      hasOgImage: !!metaTags['og:image'],
      hasOgImageSecureUrl: !!metaTags['og:image:secure_url'],
      hasOgImageType: !!metaTags['og:image:type'],
      hasOgImageWidth: !!metaTags['og:image:width'],
      hasOgImageHeight: !!metaTags['og:image:height'],
      hasOgTitle: !!metaTags['og:title'],
      hasOgDescription: !!metaTags['og:description'],
      hasOgUrl: !!metaTags['og:url'],
      hasTwitterCard: !!metaTags['twitter:card'],
      hasTwitterImage: !!metaTags['twitter:image'],
    };

    // Check if og:image URL is same-domain or cross-domain
    const ogImageUrl = metaTags['og:image'] || '';
    let imageAnalysis = 'none';
    if (ogImageUrl) {
      try {
        const imgUrl = new URL(ogImageUrl);
        const targetUrlObj = new URL(targetUrl);
        imageAnalysis = imgUrl.hostname === targetUrlObj.hostname ? 'same-domain' : 'cross-domain';
      } catch {
        imageAnalysis = 'invalid-url';
      }
    }

    return NextResponse.json({
      ok: true,
      url: targetUrl,
      httpStatus: res.status,
      title,
      metaTags,
      checks,
      imageAnalysis,
      ogImageUrl,
      whatsappReady: checks.hasOgImage && checks.hasOgImageSecureUrl && checks.hasOgImageType,
      recommendation: !checks.hasOgImage
        ? 'og:image missing — WhatsApp tidak akan show preview'
        : imageAnalysis === 'cross-domain'
          ? 'Image cross-domain — WhatsApp mungkin reject. Gunakan /api/og-image proxy.'
          : !checks.hasOgImageSecureUrl
            ? 'og:image:secure_url missing — WhatsApp butuh ini'
            : !checks.hasOgImageType
              ? 'og:image:type missing — WhatsApp butuh ini'
              : '✅ Semua tags OK — WhatsApp harus muncul preview. Kalau belum, cache WhatsApp (30 hari). Coba ?v=test untuk bypass.',
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || 'Server error',
    }, { status: 500 });
  }
}
