// ============================================================
// OG/Twitter image helpers
// ============================================================
// STRATEGY:
// 1. Custom Cloudinary image → transform to 1200x630 via Cloudinary URL params
//    (direct HTTPS URL, no proxy, no query params in og:image)
// 2. No custom image → /og-default.png (same domain static file)
//
// WhatsApp accepts cross-domain HTTPS images IF:
// - Dimensions match meta tags (1200x630)
// - File size < 1MB
// - Content-Type is image/png or image/jpeg
// Cloudinary transformation w_1200,h_630,c_fill ensures all of these.
// ============================================================

export const DEFAULT_OG_IMAGE = "/og-default.png";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

const CLOUDINARY_TRANSFORM = "w_1200,h_630,c_fill,q_auto,f_png";

// Add Cloudinary transformation to URL
// Transforms: /image/upload/v123/photo.png → /image/upload/w_1200,h_630,c_fill,q_auto,f_png/v123/photo.png
function addCloudinaryTransform(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const marker = '/image/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const before = url.substring(0, idx + marker.length);
  const after = url.substring(idx + marker.length);

  // If already has transformation params, don't add again
  if (after.startsWith('w_') || after.startsWith('c_') || after.startsWith('h_')) {
    return url;
  }

  return `${before}${CLOUDINARY_TRANSFORM}/${after}`;
}

// Detect image type from URL
function getImageType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('.png') || lower.includes('f_png')) return 'image/png';
  if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('f_jpg')) return 'image/jpeg';
  if (lower.includes('.webp')) return 'image/webp';
  return 'image/png';
}

// Helper: pick image or fall back to default
// Custom Cloudinary images get transformation (1200x630, optimized)
// Non-Cloudinary or missing → default static image
export function pickOgImage(customImage: string | undefined | null, alt: string = "Petisi Bela Rakyat") {
  let url: string;
  let type: string;

  if (customImage && customImage.trim() && customImage.includes('res.cloudinary.com')) {
    // Cloudinary image — add transformation for 1200x630
    url = addCloudinaryTransform(customImage);
    type = getImageType(url);
  } else if (customImage && customImage.trim() && customImage.startsWith('http')) {
    // Other HTTPS image — use as-is (can't transform)
    url = customImage;
    type = getImageType(url);
  } else {
    // No image → default static file (same domain)
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
