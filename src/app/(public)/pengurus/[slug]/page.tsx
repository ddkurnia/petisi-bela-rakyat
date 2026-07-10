// ============================================================
// Pengurus Detail Page — Server Component with dynamic metadata
// ============================================================
import type { Metadata } from "next";
import { PengurusPage } from "@/components/sections/pengurus-page";
import { queryFirestore } from "@/lib/firebase/rest-api";
import { pickOgImage } from "@/lib/og-image";

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
    const items = await queryFirestore('pengurus', [
      { field: 'slug', op: 'EQUAL', value: slug },
    ], 1);
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
    return {
      title: "Profil Tidak Ditemukan",
      description: "Profil yang Anda cari tidak tersedia.",
      openGraph: {
        title: "Profil Tidak Ditemukan",
        description: "Profil yang Anda cari tidak tersedia.",
        images: pickOgImage(undefined),
      },
      twitter: {
        card: "summary_large_image",
        title: "Profil Tidak Ditemukan",
        images: [pickOgImage(undefined)[0].url],
      },
    };
  }

  const title = `${person.name}${person.gelar ? ', ' + person.gelar : ''} — ${person.jabatan}`;
  const description = person.bio || `Profil ${person.name}, ${person.jabatan} Petisi Bela Rakyat`;
  const url = `https://belarakyat.org/pengurus/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      images: pickOgImage(person.photo, person.name),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [pickOgImage(person.photo, person.name)[0].url],
    },
  };
}

export default function PengurusDetailPage() {
  return <PengurusPage />;
}
