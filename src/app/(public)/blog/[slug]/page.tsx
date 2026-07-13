// ============================================================
// Blog Detail Page — Server Component with dynamic metadata
// ============================================================
// generateMetadata fetches blog post from Firestore REST API
// with 8s timeout. Uses Cloudinary transformation for cover images
// to ensure 1200x630 dimensions (WhatsApp requirement).
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
    // 8s timeout — WhatsApp crawler waits ~10s, we leave 2s buffer
    const posts = await withTimeout(
      queryFirestore('blog', [{ field: 'slug', op: 'EQUAL', value: slug }], 1),
      8000
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
    // Fallback: use default image if Firestore timed out or post not found
    const ogImages = pickOgImage(undefined);
    return {
      title: "Artikel Tidak Ditemukan",
      description: "Artikel yang Anda cari tidak tersedia.",
      openGraph: {
        title: "Artikel Tidak Ditemukan",
        description: "Artikel yang Anda cari tidak tersedia.",
        images: ogImages,
      },
      twitter: {
        card: "summary_large_image",
        title: "Artikel Tidak Ditemukan",
        images: [ogImages[0].url],
      },
      other: whatsappMetaTags(undefined),
    };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || `Artikel oleh ${post.author}`;
  const url = `https://belarakyat.org/blog/${slug}`;
  // pickOgImage applies Cloudinary transformation (w_1200,h_630,c_fill)
  // if coverImage is from Cloudinary, otherwise uses /og-default.png
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
