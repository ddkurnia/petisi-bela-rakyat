// ============================================================
// OG/Twitter image helpers
// ============================================================
// STRATEGY: Always use /og-default.png (same domain, static file)
// for ALL og:image tags. This guarantees WhatsApp preview works
// because:
// 1. Same domain (belarakyat.org ≠ res.cloudinary.com)
// 2. No query parameters (WhatsApp rejects ?url=... in og:image)
// 3. Static file (instant fetch, no proxy latency)
// 4. Correct dimensions (1200x630, matches meta tags)
// 5. Small file size (353KB, not 2.4MB)
//
// Custom per-article images are shown on the page itself, not in
// OG preview. This is the most reliable approach for WhatsApp.
// ============================================================

export const DEFAULT_OG_IMAGE = "/og-default.png";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

// Always return same-domain static image for OG tags
export function pickOgImage(_customImage?: string | undefined | null, alt: string = "Petisi Bela Rakyat") {
  return [{
    url: DEFAULT_OG_IMAGE,
    secureUrl: DEFAULT_OG_IMAGE,
    width: DEFAULT_OG_IMAGE_WIDTH,
    height: DEFAULT_OG_IMAGE_HEIGHT,
    alt,
    type: 'image/png',
  }];
}
