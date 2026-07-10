// ============================================================
// News Detail Page — Server Component with dynamic metadata
// ============================================================
import type { Metadata } from "next";
import { NewsPage } from "@/components/sections/news-page";
import { queryFirestore } from "@/lib/firebase/rest-api";
import { pickOgImage } from "@/lib/og-image";

interface NewsData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  author: string;
  publishedAt: string;
  status: string;
}

async function getNewsArticle(slug: string): Promise<NewsData | null> {
  try {
    const articles = await queryFirestore('news', [
      { field: 'slug', op: 'EQUAL', value: slug },
    ], 1);
    if (articles.length === 0) return null;
    const article = articles[0] as NewsData;
    if (article.status !== 'published') return null;
    return article;
  } catch (err) {
    console.error('[news/[slug]] getNewsArticle error:', err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticle(slug);

  if (!article) {
    return {
      title: "Berita Tidak Ditemukan",
      description: "Berita yang Anda cari tidak tersedia.",
      openGraph: {
        title: "Berita Tidak Ditemukan",
        description: "Berita yang Anda cari tidak tersedia.",
        images: pickOgImage(undefined),
      },
      twitter: {
        card: "summary_large_image",
        title: "Berita Tidak Ditemukan",
        images: [pickOgImage(undefined)[0].url],
      },
    };
  }

  const title = article.title;
  const description = article.excerpt || `Berita oleh ${article.author}`;
  const url = `https://belarakyat.org/news/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: [article.category],
      images: pickOgImage(article.coverImage, article.title),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [pickOgImage(article.coverImage, article.title)[0].url],
    },
  };
}

export default function NewsDetailPage() {
  return <NewsPage />;
}
