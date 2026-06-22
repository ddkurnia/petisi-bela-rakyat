import type { MetadataRoute } from "next";

const BASE_URL = "https://petisibelarakyat.id";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/tentang-kami", priority: 0.8, changeFrequency: "monthly" },
    { path: "/sejarah", priority: 0.8, changeFrequency: "monthly" },
    { path: "/visi-misi", priority: 0.8, changeFrequency: "monthly" },
    { path: "/struktur-organisasi", priority: 0.8, changeFrequency: "monthly" },
    { path: "/pengurus", priority: 0.8, changeFrequency: "monthly" },
    { path: "/dewan-penasehat", priority: 0.8, changeFrequency: "monthly" },
    { path: "/relawan", priority: 0.8, changeFrequency: "monthly" },
    { path: "/kerja-kami", priority: 0.8, changeFrequency: "monthly" },
    { path: "/kampanye", priority: 0.9, changeFrequency: "weekly" },
    { path: "/news", priority: 0.8, changeFrequency: "daily" },
    { path: "/blog", priority: 0.8, changeFrequency: "daily" },
    { path: "/galeri", priority: 0.7, changeFrequency: "weekly" },
    { path: "/transparansi", priority: 0.7, changeFrequency: "monthly" },
    { path: "/kontak", priority: 0.6, changeFrequency: "monthly" },
    { path: "/aplikasi", priority: 0.7, changeFrequency: "monthly" },
  ];

  return staticPages.map((p) => ({
    url: `${BASE_URL}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
