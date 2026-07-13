// ============================================================
// WhatsApp-compatible metadata helpers
// ============================================================

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
  // If imageUrl is a Cloudinary URL (with transformation), use it directly
  // Otherwise use default static image
  const url = imageUrl && imageUrl.trim() ? imageUrl : "/og-default.png";
  return {
    "og:image:secure_url": url,
    "og:image:type": getImageType(url),
    "og:image:width": String(DEFAULT_OG_WIDTH),
    "og:image:height": String(DEFAULT_OG_HEIGHT),
    "article:publisher": "https://belarakyat.org",
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
