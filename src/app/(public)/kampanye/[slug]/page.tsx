// ============================================================
// Campaign Detail Page — Server Component with dynamic metadata
// ============================================================
import type { Metadata } from "next";
import { CampaignsPage } from "@/components/sections/campaigns-page";
import { queryFirestore } from "@/lib/firebase/rest-api";
import { pickOgImage } from "@/lib/og-image";

interface CampaignData {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  location: string;
  status: string;
}

async function getCampaign(slug: string): Promise<CampaignData | null> {
  try {
    const campaigns = await queryFirestore('campaigns', [
      { field: 'slug', op: 'EQUAL', value: slug },
    ], 1);
    if (campaigns.length === 0) return null;
    return campaigns[0] as CampaignData;
  } catch (err) {
    console.error('[kampanye/[slug]] getCampaign error:', err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaign(slug);

  if (!campaign) {
    return {
      title: "Kampanye Tidak Ditemukan",
      description: "Kampanye yang Anda cari tidak tersedia.",
      openGraph: {
        title: "Kampanye Tidak Ditemukan",
        description: "Kampanye yang Anda cari tidak tersedia.",
        images: pickOgImage(undefined),
      },
      twitter: {
        card: "summary_large_image",
        title: "Kampanye Tidak Ditemukan",
        images: [pickOgImage(undefined)[0].url],
      },
    };
  }

  const title = campaign.title;
  const description = campaign.description || `Kampanye di ${campaign.location}`;
  const url = `https://belarakyat.org/kampanye/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: pickOgImage(campaign.coverImage, campaign.title),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [pickOgImage(campaign.coverImage, campaign.title)[0].url],
    },
  };
}

export default function KampanyeDetailPage() {
  return <CampaignsPage />;
}
