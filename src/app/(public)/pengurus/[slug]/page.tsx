// ============================================================
// Pengurus Detail Page — Server Component with dynamic metadata
// ============================================================
import type { Metadata } from "next";
import { PengurusPage } from "@/components/sections/pengurus-page";
import { queryFirestore } from "@/lib/firebase/rest-api";
import { pickOgImage } from "@/lib/og-image";
import { whatsappMetaTags, withTimeout } from "@/lib/whatsapp-meta";

interface PengurusData {
  id: string;
  slug: string;
  name: string;
  gelar: string;
  jabatan: string;
  bio: string;
  photo: string;
}

async function getPengurus(slug: string): Promise<PengurusData | null> {
  try {
    const items = await withTimeout(
      queryFirestore('pengurus', [{ field: 'slug', op: 'EQUAL', value: slug }], 1),
      8000
    );
    if (items.length === 0) return null;
    return items[0] as PengurusData;
  } catch (err) {
    console.error('[pengurus/[slug]] getPengurus error:', err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const person = await getPengurus(slug);

  if (!person) {
    const ogImages = pickOgImage(undefined);
    return {
      title: "Profil Tidak Ditemukan",
      description: "Profil yang Anda cari tidak tersedia.",
      openGraph: {
        title: "Profil Tidak Ditemukan",
        description: "Profil yang Anda cari tidak tersedia.",
        images: ogImages,
      },
      twitter: {
        card: "summary_large_image",
        title: "Profil Tidak Ditemukan",
        images: [ogImages[0].url],
      },
      other: whatsappMetaTags(undefined),
    };
  }

  const title = `${person.name}${person.gelar ? ', ' + person.gelar : ''} — ${person.jabatan}`;
  const description = person.bio || `Profil ${person.name}, ${person.jabatan} Petisi Bela Rakyat`;
  const url = `https://belarakyat.org/pengurus/${slug}`;
  const ogImages = pickOgImage(person.photo, person.name);
  const imageUrl = ogImages[0].url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "profile",
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

export default function PengurusDetailPage() {
  return <PengurusPage />;
}
