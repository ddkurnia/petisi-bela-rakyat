// ============================================================
// Kebijakan Privasi (Privacy Policy) Page
// ============================================================
import type { Metadata } from "next";
import { PrivacyPolicyPage } from "@/components/sections/legal-page";
import { pickOgImage } from "@/lib/og-image";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan privasi Petisi Bela Rakyat — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
  openGraph: {
    title: "Kebijakan Privasi — Petisi Bela Rakyat",
    description: "Bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
    url: "https://belarakyat.org/kebijakan-privasi",
    type: "article",
    images: pickOgImage(undefined, "Kebijakan Privasi Petisi Bela Rakyat"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Kebijakan Privasi — Petisi Bela Rakyat",
    description: "Bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
    images: [pickOgImage(undefined, "Kebijakan Privasi Petisi Bela Rakyat")[0].url],
  },
};

export default function Page() {
  return <PrivacyPolicyPage />;
}
