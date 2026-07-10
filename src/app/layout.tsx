import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/pwa/install-prompt";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://belarakyat.org";
const siteName = "Petisi Bela Rakyat";
// Default OG/Twitter image — used for homepage and any page without a custom image.
// Hosted on Cloudinary for fast CDN delivery to WhatsApp/FB/Twitter crawlers.
const defaultOgImage = "https://res.cloudinary.com/dnpdjhdgr/image/upload/v1783688377/pbr/famboueolzkyfyaquznx.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Petisi Bela Rakyat — Menyatukan Suara Rakyat Menjadi Perubahan",
    template: "%s | Petisi Bela Rakyat",
  },
  description:
    "Gerakan masyarakat sipil independen untuk memperjuangkan kepentingan rakyat melalui advokasi, partisipasi publik, dan aksi nyata.",
  keywords: [
    "Petisi Bela Rakyat",
    "NGO Indonesia",
    "advokasi rakyat",
    "hak warga negara",
    "transparansi",
    "kampanye sosial",
    "masyarakat sipil",
    "Kepulauan Meranti",
  ],
  authors: [{ name: "Petisi Bela Rakyat" }],
  creator: "Petisi Bela Rakyat",
  publisher: "Petisi Bela Rakyat",
  applicationName: siteName,
  category: "Civil Society Organization",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName,
    title: "Petisi Bela Rakyat — Menyatukan Suara Rakyat Menjadi Perubahan",
    description:
      "Gerakan masyarakat sipil independen untuk memperjuangkan kepentingan rakyat melalui advokasi, partisipasi publik, dan aksi nyata.",
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: "Petisi Bela Rakyat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Petisi Bela Rakyat",
    description:
      "Gerakan masyarakat sipil independen untuk memperjuangkan kepentingan rakyat.",
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#D62828" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Petisi Bela Rakyat",
  alternateName: "PBR",
  url: siteUrl,
  logo: `${siteUrl}/pbr.png`,
  description:
    "Gerakan masyarakat sipil independen untuk memperjuangkan kepentingan rakyat melalui advokasi, partisipasi publik, dan aksi nyata.",
  foundingDate: "2016",
  areaServed: "ID",
  sameAs: [
    "https://facebook.com/petisibelarakyat",
    "https://instagram.com/petisibelarakyat",
    "https://twitter.com/petisibelarakyat",
    "https://youtube.com/@petisibelarakyat",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "halo@belarakyat.org",
    telephone: "+62-812-0000-0000",
    availableLanguage: ["Indonesian"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <ServiceWorkerRegister />
          <Toaster />
          <SonnerToaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
