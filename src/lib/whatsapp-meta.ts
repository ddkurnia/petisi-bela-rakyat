// ============================================================
// WhatsApp-compatible metadata helpers
// ============================================================
// ALWAYS use absolute URL for og:image:secure_url
// WhatsApp requires full https:// URL, not relative paths
// ============================================================

const SITE_URL = "https://belarakyat.org";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
const DEFAULT_OG_WIDTH = 1200;
const DEFAULT_OG_HEIGHT = 630;

export function whatsappMetaTags(_imageUrl?: string | null): Record<string, string> {
  return {
    "og:image:secure_url": DEFAULT_OG_IMAGE,
    "og:image:type": "image/png",
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
