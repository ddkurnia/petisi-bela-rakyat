// ============================================================
// WhatsApp-compatible metadata helpers
// ============================================================
// WhatsApp & WhatsApp Business need extra og: tags that Next.js
// doesn't generate by default. Also, WhatsApp sometimes rejects
// cross-domain images — we now proxy all images through /api/og-image
// to serve them from our own domain.
// ============================================================

// Default OG image proxy URL (same-domain)
const DEFAULT_OG_PROXY = "/api/og-image";
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

// Build same-domain proxy URL
function buildProxyUrl(imageUrl?: string | null): string {
  if (imageUrl && imageUrl.trim()) {
    return `/api/og-image?url=${encodeURIComponent(imageUrl)}`;
  }
  return DEFAULT_OG_PROXY;
}

export function whatsappMetaTags(imageUrl?: string | null): Record<string, string> {
  const proxyUrl = buildProxyUrl(imageUrl);
  return {
    "og:image:secure_url": proxyUrl,
    "og:image:type": getImageType(imageUrl),
    "og:image:width": String(DEFAULT_OG_WIDTH),
    "og:image:height": String(DEFAULT_OG_HEIGHT),
    "article:publisher": "https://belarakyat.org",
  };
}

// Timeout wrapper for Firestore fetches — prevents WhatsApp crawler
// timeout if Firestore API is slow (cold start on Vercel)
export function withTimeout<T>(promise: Promise<T>, ms: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms);
    }),
  ]);
}
