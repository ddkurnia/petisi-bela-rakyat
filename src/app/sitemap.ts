import type { MetadataRoute } from "next";

const BASE_URL = "https://petisibelarakyat.id";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { route: "/", priority: 1.0, changeFrequency: "daily" as const },
    { route: "/#/about/sejarah", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/#/about/visi-misi", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/#/about/struktur", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/#/about/pengurus", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/#/about/penasehat", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/#/about/relawan", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/#/work", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/#/campaigns", priority: 0.9, changeFrequency: "weekly" as const },
    { route: "/#/news", priority: 0.8, changeFrequency: "daily" as const },
    { route: "/#/blog", priority: 0.8, changeFrequency: "daily" as const },
    { route: "/#/media", priority: 0.7, changeFrequency: "weekly" as const },
    { route: "/#/transparency", priority: 0.7, changeFrequency: "monthly" as const },
    { route: "/#/contact", priority: 0.6, changeFrequency: "monthly" as const },
  ];

  return staticPages.map((p) => ({
    url: `${BASE_URL}${p.route}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
