// ============================================================
// Syarat & Ketentuan (Terms & Conditions) Page
// ============================================================
import type { Metadata } from "next";
import { TermsPage } from "@/components/sections/legal-page";
import { pickOgImage } from "@/lib/og-image";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Syarat dan ketentuan penggunaan website Petisi Bela Rakyat. Dengan mengakses website ini, Anda menyetujui ketentuan berikut.",
  openGraph: {
    title: "Syarat & Ketentuan — Petisi Bela Rakyat",
    description: "Syarat dan ketentuan penggunaan website Petisi Bela Rakyat.",
    url: "https://belarakyat.org/syarat-ketentuan",
    type: "article",
    images: pickOgImage(undefined, "Syarat & Ketentuan Petisi Bela Rakyat"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Syarat & Ketentuan — Petisi Bela Rakyat",
    description: "Syarat dan ketentuan penggunaan website Petisi Bela Rakyat.",
    images: [pickOgImage(undefined, "Syarat & Ketentuan Petisi Bela Rakyat")[0].url],
  },
};

export default function Page() {
  return <TermsPage />;
}
