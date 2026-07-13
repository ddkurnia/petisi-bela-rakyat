// ============================================================
// OG/Twitter image helpers
// ============================================================
// STRATEGY for WhatsApp compatibility:
// 1. Default image: /og-default.png (static file, same domain, instant)
// 2. Custom images (blog covers, etc.): /api/og-image?url=... (proxy, same domain)
//
// WhatsApp rejects cross-domain images (Cloudinary ≠ belarakyat.org).
// By serving ALL images from our own domain, WhatsApp always shows preview.
// ============================================================

export const DEFAULT_OG_IMAGE = "/og-default.png";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

// Detect image type from URL
function getImageType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'image/jpeg';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.gif')) return 'image/gif';
  return 'image/png';
}

// Helper: pick image or fall back to default
// Default image → /og-default.png (same domain, static file)
// Custom image → /api/og-image?url=... (same domain, proxy)
export function pickOgImage(customImage: string | undefined | null, alt: string = "Petisi Bela Rakyat") {
  let url: string;
  let type: string;

  if (customImage && customImage.trim()) {
    // Custom image — proxy through our domain
    url = `/api/og-image?url=${encodeURIComponent(customImage)}`;
    type = getImageType(customImage);
  } else {
    // Default image — static file on our domain
    url = DEFAULT_OG_IMAGE;
    type = 'image/png';
  }

  return [{
    url,
    secureUrl: url,
    width: DEFAULT_OG_IMAGE_WIDTH,
    height: DEFAULT_OG_IMAGE_HEIGHT,
    alt,
    type,
  }];
}
