// ============================================================
// Kerja Kami Detail Page — Server Component with dynamic metadata
// ============================================================
import type { Metadata } from "next";
import { WorkPage } from "@/components/sections/work-page";
import { queryFirestore } from "@/lib/firebase/rest-api";
import { pickOgImage } from "@/lib/og-image";
import { whatsappMetaTags, withTimeout } from "@/lib/whatsapp-meta";

interface WorkData {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  icon: string;
}

async function getWork(slug: string): Promise<WorkData | null> {
  try {
    const items = await withTimeout(
      queryFirestore('work', [{ field: 'slug', op: 'EQUAL', value: slug }], 1),
      8000
    );
    if (items.length === 0) return null;
    return items[0] as WorkData;
  } catch (err) {
    console.error('[kerja-kami/[slug]] getWork error:', err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWork(slug);

  if (!work) {
    const ogImages = pickOgImage(undefined);
    return {
      title: "Kategori Tidak Ditemukan",
      description: "Kategori kerja yang Anda cari tidak tersedia.",
      openGraph: {
        title: "Kategori Tidak Ditemukan",
        description: "Kategori kerja yang Anda cari tidak tersedia.",
        images: ogImages,
      },
      twitter: {
        card: "summary_large_image",
        title: "Kategori Tidak Ditemukan",
        images: [ogImages[0].url],
      },
      other: whatsappMetaTags(undefined),
    };
  }

  const title = work.title;
  const description = work.description || `Bidang kerja Petisi Bela Rakyat`;
  const url = `https://belarakyat.org/kerja-kami/${slug}`;
  const ogImages = pickOgImage(work.coverImage, work.title);
  const imageUrl = ogImages[0].url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    other: whatsappMetaTags(imageUrl),
  };
}

export default function KerjaKamiDetailPage() {
  return <WorkPage />;
}
