// ============================================================
// Dynamic Sitemap — includes static + dynamic routes from Firestore
// ============================================================
// Fetches all published blog, news, campaigns, pengurus, and work
// categories from Firestore REST API and generates sitemap entries.
//
// Google crawls this sitemap to index all pages on belarakyat.org.
// ============================================================
import type { MetadataRoute } from "next";
import { queryFirestore } from "@/lib/firebase/rest-api";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://belarakyat.org";

interface SlugItem {
  slug?: string;
  status?: string;
  updatedAt?: string;
  publishedAt?: string;
}

async function fetchSlugs(collection: string, publishedOnly: boolean = false): Promise<SlugItem[]> {
  try {
    const items = await queryFirestore(collection, [], 500);
    if (publishedOnly) {
      return items.filter((item: any) => item.status === 'published' && item.slug);
    }
    return items.filter((item: any) => item.slug);
  } catch (err) {
    console.error(`[sitemap] fetchSlugs(${collection}) error:`, err);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/tentang-kami", priority: 0.8, changeFrequency: "monthly" },
    { path: "/sejarah", priority: 0.8, changeFrequency: "monthly" },
    { path: "/visi-misi", priority: 0.8, changeFrequency: "monthly" },
    { path: "/struktur-organisasi", priority: 0.8, changeFrequency: "monthly" },
    { path: "/pengurus", priority: 0.8, changeFrequency: "weekly" },
    { path: "/dewan-penasehat", priority: 0.8, changeFrequency: "monthly" },
    { path: "/relawan", priority: 0.8, changeFrequency: "monthly" },
    { path: "/kerja-kami", priority: 0.8, changeFrequency: "monthly" },
    { path: "/kampanye", priority: 0.9, changeFrequency: "weekly" },
    { path: "/news", priority: 0.8, changeFrequency: "daily" },
    { path: "/blog", priority: 0.8, changeFrequency: "daily" },
    { path: "/galeri", priority: 0.7, changeFrequency: "weekly" },
    { path: "/transparansi", priority: 0.7, changeFrequency: "monthly" },
    { path: "/proposal", priority: 0.9, changeFrequency: "weekly" },
    { path: "/kontak", priority: 0.6, changeFrequency: "monthly" },
    { path: "/aplikasi", priority: 0.7, changeFrequency: "monthly" },
    { path: "/kebijakan-privasi", priority: 0.5, changeFrequency: "monthly" },
    { path: "/syarat-ketentuan", priority: 0.5, changeFrequency: "monthly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: `${BASE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  // Dynamic routes — fetch from Firestore in parallel
  const [blogPosts, newsArticles, campaigns, pengurus, workCategories] = await Promise.all([
    fetchSlugs('blog', true),      // published only
    fetchSlugs('news', true),      // published only
    fetchSlugs('campaigns', false), // all campaigns
    fetchSlugs('pengurus', false),  // all (filter active in map)
    fetchSlugs('work', false),      // all work categories
  ]);

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const newsEntries: MetadataRoute.Sitemap = newsArticles.map((article) => ({
    url: `${BASE_URL}/news/${article.slug}`,
    lastModified: article.updatedAt ? new Date(article.updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const campaignEntries: MetadataRoute.Sitemap = campaigns.map((c) => ({
    url: `${BASE_URL}/kampanye/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const pengurusEntries: MetadataRoute.Sitemap = pengurus
    .filter((p: any) => p.status === 'active')
    .map((p) => ({
      url: `${BASE_URL}/pengurus/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const workEntries: MetadataRoute.Sitemap = workCategories.map((w) => ({
    url: `${BASE_URL}/kerja-kami/${w.slug}`,
    lastModified: w.updatedAt ? new Date(w.updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...blogEntries,
    ...newsEntries,
    ...campaignEntries,
    ...pengurusEntries,
    ...workEntries,
  ];
}
