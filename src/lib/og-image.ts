// ============================================================
// OG/Twitter image helpers
// ============================================================
// STRATEGY: ALWAYS use /og-default.png for OG preview.
// This is the most reliable approach for WhatsApp:
// 1. Same domain (belarakyat.org) — WhatsApp accepts same-domain
// 2. No query parameters — WhatsApp rejects ?url=...
// 3. Static file — instant fetch, no proxy
// 4. Correct dimensions (1200x630, 353KB)
// 5. Absolute URL — WhatsApp needs full https:// URL
// ============================================================

const SITE_URL = "https://belarakyat.org";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
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
