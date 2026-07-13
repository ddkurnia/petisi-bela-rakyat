// ============================================================
// WhatsApp-compatible metadata helpers
// ============================================================
// All OG images use /og-default.png (same domain, static file).
// No cross-domain, no query parameters, no proxy.
// ============================================================

const DEFAULT_OG_IMAGE = "/og-default.png";
const DEFAULT_OG_WIDTH = 1200;
const DEFAULT_OG_HEIGHT = 630;

export function whatsappMetaTags(_imageUrl?: string | null): Record<string, string> {
  return {
    "og:image:secure_url": DEFAULT_OG_IMAGE,
    "og:image:type": "image/png",
    "og:image:width": String(DEFAULT_OG_WIDTH),
    "og:image:height": String(DEFAULT_OG_HEIGHT),
    "article:publisher": "https://belarakyat.org",
  };
}

// Timeout wrapper for Firestore fetches — 8s for metadata generation
// (WhatsApp crawler waits ~10s, we leave 2s buffer)
export function withTimeout<T>(promise: Promise<T>, ms: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms);
    }),
  ]);
}
