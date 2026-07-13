// ============================================================
// WhatsApp-compatible metadata helpers
// ============================================================
// All OG images now served from belarakyat.org (same domain):
// - Default: /og-default.png (static file)
// - Custom: /api/og-image?url=... (proxy)
// ============================================================

const DEFAULT_OG_WIDTH = 1200;
const DEFAULT_OG_HEIGHT = 630;

function getImageType(url?: string | null): string {
  if (!url) return 'image/png';
  const lower = url.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'image/jpeg';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.gif')) return 'image/gif';
  return 'image/png';
}

function buildSameDomainUrl(imageUrl?: string | null): string {
  if (imageUrl && imageUrl.trim()) {
    return `/api/og-image?url=${encodeURIComponent(imageUrl)}`;
  }
  return "/og-default.png";
}

export function whatsappMetaTags(imageUrl?: string | null): Record<string, string> {
  const url = buildSameDomainUrl(imageUrl);
  return {
    "og:image:secure_url": url,
    "og:image:type": getImageType(imageUrl),
    "og:image:width": String(DEFAULT_OG_WIDTH),
    "og:image:height": String(DEFAULT_OG_HEIGHT),
    "article:publisher": "https://belarakyat.org",
  };
}

// Timeout wrapper for Firestore fetches
export function withTimeout<T>(promise: Promise<T>, ms: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms);
    }),
  ]);
}
