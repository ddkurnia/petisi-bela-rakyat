// ============================================================
// WhatsApp-compatible metadata helpers
// ============================================================
// WhatsApp & WhatsApp Business need extra og: tags that Next.js
// doesn't generate by default:
//   - og:image:secure_url (duplicate of og:image, but as raw meta)
//   - og:image:type (image/png, image/jpeg)
//   - og:image:width
//   - og:image:height
//
// This helper generates the `other` field for Next.js metadata
// to include these tags.
// ============================================================
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_WIDTH, DEFAULT_OG_IMAGE_HEIGHT } from "./og-image";

function getImageType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'image/jpeg';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.gif')) return 'image/gif';
  return 'image/png';
}

export function whatsappMetaTags(imageUrl?: string | null): Record<string, string> {
  const img = imageUrl && imageUrl.trim() ? imageUrl : DEFAULT_OG_IMAGE;
  return {
    "og:image:secure_url": img,
    "og:image:type": getImageType(img),
    "og:image:width": String(DEFAULT_OG_IMAGE_WIDTH),
    "og:image:height": String(DEFAULT_OG_IMAGE_HEIGHT),
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
