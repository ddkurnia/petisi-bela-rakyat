// ============================================================
// OG/Twitter image helpers
// ============================================================
// KEY FIX for WhatsApp preview:
// 1. Use Cloudinary transformation (w_1200,h_630,c_fill) to resize
//    images to exactly 1200x630 (WhatsApp recommended size)
// 2. Use direct Cloudinary URLs (not proxy) — proxy adds latency
//    that causes WhatsApp crawler timeout
// 3. Meta tag dimensions (1200x630) MUST match actual image dimensions
//    — mismatch causes WhatsApp to reject the preview
// 4. Transformation also reduces file size (2.4MB → ~300KB)
// ============================================================

const CLOUDINARY_DEFAULT = "https://res.cloudinary.com/dnpdjhdgr/image/upload/v1783688377/pbr/famboueolzkyfyaquznx.png";
const TRANSFORMATION = "w_1200,h_630,c_fill,q_auto,f_png";

export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

// Add Cloudinary transformation to URL
// Format: https://res.cloudinary.com/{cloud}/image/upload/{transform}/{version}/{path}
// We insert transformation after /image/upload/
function addCloudinaryTransform(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  // Check if URL already has transformations (e.g., /image/upload/c_limit,w_...)
  const uploadMarker = '/image/upload/';
  const idx = url.indexOf(uploadMarker);
  if (idx === -1) return url;

  const before = url.substring(0, idx + uploadMarker.length);
  const after = url.substring(idx + uploadMarker.length);

  // If 'after' starts with 'v' (version) or a file path, insert transformation
  // If 'after' already starts with transformation params (like c_, w_, h_, etc.), skip
  if (after.startsWith('v') || after.startsWith('pbr/') || !after.startsWith('c_') && !after.startsWith('w_') && !after.startsWith('h_')) {
    return `${before}${TRANSFORMATION}/${after}`;
  }
  return url;
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

// Default OG image with transformation (1200x630, optimized size)
export const DEFAULT_OG_IMAGE = addCloudinaryTransform(CLOUDINARY_DEFAULT);

// Helper: pick image or fall back to default
// Applies Cloudinary transformation to ensure 1200x630 dimensions
export function pickOgImage(customImage: string | undefined | null, alt: string = "Petisi Bela Rakyat") {
  let url: string;
  let type: string;

  if (customImage && customImage.trim()) {
    // Custom image (blog cover, pengurus photo, etc.)
    if (customImage.includes('res.cloudinary.com')) {
      // Cloudinary image — add transformation for 1200x630
      url = addCloudinaryTransform(customImage);
      type = getImageType(customImage);
    } else {
      // Non-Cloudinary image — use as-is (can't transform)
      url = customImage;
      type = getImageType(customImage);
    }
  } else {
    // Default image — already transformed
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
