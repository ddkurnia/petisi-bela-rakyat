// ============================================================
// WhatsApp-compatible metadata helpers
// ============================================================
// CRITICAL: og:image:secure_url MUST be absolute URL (https://...)
// WhatsApp rejects relative URLs like /og-default.png
//
// If imageUrl is a Cloudinary URL → use it (with transformation)
// If no imageUrl → use default absolute URL
// ============================================================

const SITE_URL = "https://belarakyat.org";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
const DEFAULT_OG_WIDTH = 1200;
const DEFAULT_OG_HEIGHT = 630;

function getImageType(url?: string | null): string {
  if (!url) return 'image/png';
  const lower = url.toLowerCase();
  if (lower.includes('.png') || lower.includes('f_png')) return 'image/png';
  if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('f_jpg')) return 'image/jpeg';
  if (lower.includes('.webp')) return 'image/webp';
  return 'image/png';
}

export function whatsappMetaTags(imageUrl?: string | null): Record<string, string> {
  // Use the actual image URL if provided (Cloudinary with transform = absolute HTTPS)
  // Otherwise use default absolute URL
  const url = imageUrl && imageUrl.trim() ? imageUrl : DEFAULT_OG_IMAGE;
  return {
    "og:image:secure_url": url,
    "og:image:type": getImageType(url),
    "og:image:width": String(DEFAULT_OG_WIDTH),
    "og:image:height": String(DEFAULT_OG_HEIGHT),
    "article:publisher": SITE_URL,
  };
}

// Timeout wrapper — 8s for metadata (WhatsApp waits ~10s)
export function withTimeout<T>(promise: Promise<T>, ms: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms);
    }),
  ]);
}
