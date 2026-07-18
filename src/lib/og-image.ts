// ============================================================
// OG/Twitter image helpers
// ============================================================
// STRATEGY:
// 1. Custom Cloudinary image → transform to 1200x630 (absolute HTTPS URL)
// 2. Other HTTPS image → use as-is
// 3. No image → https://belarakyat.org/og-default.png (absolute)
//
// KEY: ALL URLs must be ABSOLUTE (https://...) — WhatsApp rejects
// relative URLs like /og-default.png
// ============================================================

const SITE_URL = "https://belarakyat.org";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

const CLOUDINARY_TRANSFORM = "w_1200,h_630,c_fill,q_auto,f_png";

// Add Cloudinary transformation to URL
function addCloudinaryTransform(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const marker = '/image/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const before = url.substring(0, idx + marker.length);
  const after = url.substring(idx + marker.length);
  if (after.startsWith('w_') || after.startsWith('c_') || after.startsWith('h_')) return url;
  return `${before}${CLOUDINARY_TRANSFORM}/${after}`;
}

function getImageType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('.png') || lower.includes('f_png')) return 'image/png';
  if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('f_jpg')) return 'image/jpeg';
  if (lower.includes('.webp')) return 'image/webp';
  return 'image/png';
}

// Pick image: use custom image if available, else default
export function pickOgImage(customImage: string | undefined | null, alt: string = "Petisi Bela Rakyat") {
  let url: string;
  let type: string;

  if (customImage && customImage.trim() && customImage.includes('res.cloudinary.com')) {
    // Cloudinary image — add transformation for 1200x630
    url = addCloudinaryTransform(customImage);
    type = getImageType(url);
  } else if (customImage && customImage.trim() && customImage.startsWith('http')) {
    // Other HTTPS image — use as-is
    url = customImage;
    type = getImageType(url);
  } else {
    // No image → default (absolute URL)
    url = DEFAULT_OG_IMAGE;
    type = 'image/png';
  }

  return [{
    url,
    secureUrl: url,  // same as url — both absolute HTTPS
    width: DEFAULT_OG_IMAGE_WIDTH,
    height: DEFAULT_OG_IMAGE_HEIGHT,
    alt,
    type,
  }];
}
