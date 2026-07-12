// ============================================================
// Proposal Page — Public route for proposal bantuan kegiatan
// ============================================================
import type { Metadata } from "next";
import { ProposalPage } from "@/components/sections/proposal-page";
import { pickOgImage } from "@/lib/og-image";
import { whatsappMetaTags } from "@/lib/whatsapp-meta";

export const metadata: Metadata = {
  title: "Proposal Bantuan & Anggaran",
  description: "Proposal kegiatan dan estimasi anggaran Petisi Bela Rakyat. Dukung kegiatan kami melalui donasi via transfer bank atau QRIS.",
  openGraph: {
    title: "Proposal Bantuan & Anggaran — Petisi Bela Rakyat",
    description: "Proposal kegiatan dan estimasi anggaran. Dukung kami via transfer bank atau QRIS.",
    url: "https://belarakyat.org/proposal",
    type: "website",
    images: pickOgImage(undefined, "Proposal Bantuan Petisi Bela Rakyat"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Proposal Bantuan & Anggaran — Petisi Bela Rakyat",
    description: "Dukung kegiatan kami melalui donasi via transfer bank atau QRIS.",
    images: [pickOgImage(undefined, "Proposal Bantuan Petisi Bela Rakyat")[0].url],
  },
  other: whatsappMetaTags(undefined),
};

export default function Page() {
  return <ProposalPage />;
}
