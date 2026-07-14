// ============================================================
// FAQ Page
// ============================================================
import type { Metadata } from "next";
import { FaqPage } from "@/components/sections/faq-page";
import { pickOgImage } from "@/lib/og-image";
import { whatsappMetaTags } from "@/lib/whatsapp-meta";

export const metadata: Metadata = {
  title: "FAQ — Pertanyaan yang Sering Diajukan",
  description: "Pertanyaan umum tentang Petisi Bela Rakyat, donasi, petisi, dan cara berkontribusi.",
  openGraph: {
    title: "FAQ — Petisi Bela Rakyat",
    description: "Pertanyaan umum tentang organisasi, donasi, dan petisi.",
    url: "https://belarakyat.org/faq",
    type: "website",
    images: pickOgImage(undefined, "FAQ Petisi Bela Rakyat"),
  },
  other: whatsappMetaTags(undefined),
};

export default function Page() {
  return <FaqPage />;
}
