// ============================================================
// Default OG/Twitter image
// ============================================================
// IMPORTANT: We proxy images through /api/og-image to serve them
// from our own domain (belarakyat.org). WhatsApp crawlers are
// stricter than Facebook/Telegram and sometimes reject cross-domain
// images (e.g. from res.cloudinary.com). By proxying, WhatsApp sees
// same-origin images → more reliable preview.
// ============================================================

// Default Cloudinary image (source)
const CLOUDINARY_DEFAULT = "https://res.cloudinary.com/dnpdjhdgr/image/upload/v1783688377/pbr/famboueolzkyfyaquznx.png";

// Same-domain proxy URL (what we use in meta tags)
// This is served by /api/og-image route which proxies Cloudinary
export const DEFAULT_OG_IMAGE = "/api/og-image";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

// Build absolute URL for same-domain proxy
function buildProxyUrl(customImage?: string | null): string {
  if (customImage && customImage.trim()) {
    // Custom image (blog cover, etc) — proxy through our domain
    return `/api/og-image?url=${encodeURIComponent(customImage)}`;
  }
  // Default image — no query param needed
  return DEFAULT_OG_IMAGE;
}

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
// Returns array with ALL fields WhatsApp/FB/Twitter crawlers need
export function pickOgImage(customImage: string | undefined | null, alt: string = "Petisi Bela Rakyat") {
  const url = buildProxyUrl(customImage);
  // Try to detect type from original URL, default to png
  const sourceUrl = customImage && customImage.trim() ? customImage : CLOUDINARY_DEFAULT;
  const type = getImageType(sourceUrl);
  return [{
    url,
    secureUrl: url,        // og:image:secure_url — same as url (now same-domain)
    width: DEFAULT_OG_IMAGE_WIDTH,
    height: DEFAULT_OG_IMAGE_HEIGHT,
    alt,
    type,
  }];
}
