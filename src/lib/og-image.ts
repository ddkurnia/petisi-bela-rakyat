// ============================================================
// Default OG/Twitter image
// ============================================================
// Used as fallback for any page that doesn't have its own image
// (e.g. blog post without coverImage, pengurus without photo).
// Hosted on Cloudinary CDN for fast delivery to social crawlers.
// ============================================================
export const DEFAULT_OG_IMAGE = "https://res.cloudinary.com/dnpdjhdgr/image/upload/v1783688377/pbr/famboueolzkyfyaquznx.png";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

// Detect image type from URL
function getImageType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'image/jpeg';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.gif')) return 'image/gif';
  return 'image/png'; // default
}

// Helper: pick image or fall back to default Cloudinary image
// Returns array with ALL fields WhatsApp/FB/Twitter crawlers need:
//   url, secureUrl, width, height, alt, type
export function pickOgImage(customImage: string | undefined | null, alt: string = "Petisi Bela Rakyat") {
  const url = customImage && customImage.trim() ? customImage : DEFAULT_OG_IMAGE;
  const type = getImageType(url);
  return [{
    url,
    secureUrl: url,        // og:image:secure_url — WhatsApp sometimes needs this
    width: DEFAULT_OG_IMAGE_WIDTH,
    height: DEFAULT_OG_IMAGE_HEIGHT,
    alt,
    type,                  // og:image:type — helps WhatsApp identify image format
  }];
}
