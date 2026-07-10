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

// Helper: pick image or fall back to default Cloudinary image
export function pickOgImage(customImage: string | undefined | null, alt: string = "Petisi Bela Rakyat") {
  const url = customImage && customImage.trim() ? customImage : DEFAULT_OG_IMAGE;
  return [{ url, width: DEFAULT_OG_IMAGE_WIDTH, height: DEFAULT_OG_IMAGE_HEIGHT, alt }];
}
