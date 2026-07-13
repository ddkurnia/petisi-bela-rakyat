import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/pwa/install-prompt";
import { LanguageProvider } from "@/lib/i18n/context";

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
// Default OG image — Cloudinary with transformation w_1200,h_630,c_fill
// This ensures: (1) correct dimensions match meta tags, (2) small file size (~300KB not 2.4MB)
// Direct URL (no proxy) to avoid WhatsApp crawler timeout
const defaultOgImage = "https://res.cloudinary.com/dnpdjhdgr/image/upload/w_1200,h_630,c_fill,q_auto,f_png/v1783688377/pbr/famboueolzkyfyaquznx.png";

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
        secureUrl: defaultOgImage,
        width: 1200,
        height: 630,
        alt: "Petisi Bela Rakyat",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Petisi Bela Rakyat",
    description:
      "Gerakan masyarakat sipil independen untuk memperjuangkan kepentingan rakyat.",
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: "Petisi Bela Rakyat",
      },
    ],
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
  // Additional meta tags for WhatsApp Business compatibility
  // WhatsApp sometimes needs these raw meta tags to be present
  other: {
    "og:image:secure_url": defaultOgImage,
    "og:image:type": "image/png",
    "og:image:width": "1200",
    "og:image:height": "630",
    "article:publisher": "https://belarakyat.org",
    "article:author": "Petisi Bela Rakyat",
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
  // Google Search Console verification — set GOOGLE_SITE_VERIFICATION
  // env var with the content value from Google Search Console.
  // Format: "google-site-verification=xxxxxxx"
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
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

// WebSite schema — helps Google show sitelinks search box
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Petisi Bela Rakyat",
  url: siteUrl,
  description: "Gerakan masyarakat sipil independen untuk memperjuangkan kepentingan rakyat.",
  inLanguage: "id-ID",
  publisher: {
    "@type": "NGO",
    name: "Petisi Bela Rakyat",
    url: siteUrl,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        {/* Google AdSense — publisher ID: ca-pub-6218465141589887 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6218465141589887"
          crossOrigin="anonymous"
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
          <LanguageProvider>
            {children}
          <ServiceWorkerRegister />
          <Toaster />
          <SonnerToaster position="top-right" richColors />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
