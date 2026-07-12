// ============================================================
// Blog Detail Page — Server Component with dynamic metadata
// ============================================================
// generateMetadata fetches blog post from Firestore REST API
// with 5s timeout (prevents WhatsApp crawler timeout).
// Includes WhatsApp-specific og:image:secure_url, og:image:type.
// ============================================================
import type { Metadata } from "next";
import { BlogPage } from "@/components/sections/blog-page";
import { queryFirestore } from "@/lib/firebase/rest-api";
import { pickOgImage } from "@/lib/og-image";
import { whatsappMetaTags, withTimeout } from "@/lib/whatsapp-meta";

interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  author: string;
  publishedAt: string;
  metaTitle?: string;
  metaDescription?: string;
  status: string;
}

async function getBlogPost(slug: string): Promise<BlogPostData | null> {
  try {
    // 5s timeout — fall back to default image if Firestore is slow
    const posts = await withTimeout(
      queryFirestore('blog', [{ field: 'slug', op: 'EQUAL', value: slug }], 1),
      5000
    );
    if (posts.length === 0) return null;
    const post = posts[0] as BlogPostData;
    if (post.status !== 'published') return null;
    return post;
  } catch (err) {
    console.error('[blog/[slug]] getBlogPost error:', err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Artikel Tidak Ditemukan",
      description: "Artikel yang Anda cari tidak tersedia.",
      openGraph: {
        title: "Artikel Tidak Ditemukan",
        description: "Artikel yang Anda cari tidak tersedia.",
        images: pickOgImage(undefined),
      },
      twitter: {
        card: "summary_large_image",
        title: "Artikel Tidak Ditemukan",
        images: [pickOgImage(undefined)[0].url],
      },
      other: whatsappMetaTags(undefined),
    };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || `Artikel oleh ${post.author}`;
  const url = `https://belarakyat.org/blog/${slug}`;
  const ogImages = pickOgImage(post.coverImage, post.title);
  const imageUrl = ogImages[0].url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: [post.category],
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

export default function BlogDetailPage() {
  return <BlogPage />;
}
