"use client";

import { FileText, Newspaper, Megaphone, Users, Image as ImageIcon, HeartHandshake, Eye, Crown, BarChart3 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";

export function AdminDashboard() {
  const blog = useStore((s) => s.blog);
  const news = useStore((s) => s.news);
  const campaigns = useStore((s) => s.campaigns);
  const pengurus = useStore((s) => s.pengurus);
  const supporters = useStore((s) => s.supporters);
  const gallery = useStore((s) => s.gallery);
  const penasehat = useStore((s) => s.penasehat);
  const relawan = useStore((s) => s.relawan);

  const stats = [
    { label: "Pengurus Aktif", value: pengurus.filter((p) => p.status === "active").length, total: pengurus.length, icon: Users, color: "bg-blue-500/10 text-blue-600" },
    { label: "Artikel Blog", value: blog.filter((b) => b.status === "published").length, total: blog.length, icon: FileText, color: "bg-purple-500/10 text-purple-600" },
    { label: "Berita", value: news.filter((n) => n.status === "published").length, total: news.length, icon: Newspaper, color: "bg-indigo-500/10 text-indigo-600" },
    { label: "Kampanye", value: campaigns.filter((c) => c.status === "active").length, total: campaigns.length, icon: Megaphone, color: "bg-primary/10 text-primary" },
    { label: "Dukungan Tokoh", value: supporters.length, total: supporters.length, icon: HeartHandshake, color: "bg-pink-500/10 text-pink-600" },
    { label: "Foto Media", value: gallery.filter((g) => g.type === "photo").length, total: gallery.length, icon: ImageIcon, color: "bg-green-500/10 text-green-600" },
    { label: "Dewan Penasehat", value: penasehat.length, total: penasehat.length, icon: Crown, color: "bg-amber-500/10 text-amber-600" },
    { label: "Relawan Aktif", value: relawan.filter((r) => r.active).length, total: relawan.length, icon: Users, color: "bg-teal-500/10 text-teal-600" },
  ];

  const totalViews = [...blog, ...news].reduce((sum, item) => sum + (item.views || 0), 0);
  const totalSupporters = campaigns.reduce((sum, c) => sum + c.supporters, 0);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-foreground to-foreground/90 text-background border-0 shadow-xl overflow-hidden relative">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold mb-3">
            <BarChart3 className="h-3 w-3" />
            Overview
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
            Selamat datang kembali! 👋
          </h2>
          <p className="mt-1 text-white/70">Berikut ringkasan aktivitas organisasi Anda hari ini.</p>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="p-5 border-0 shadow-lg shadow-foreground/5">
              <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-heading text-2xl md:text-3xl font-extrabold">
                {s.value}
                {s.total !== s.value && (
                  <span className="text-sm text-muted-foreground font-medium ml-1">/ {s.total}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Activity overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
          <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Statistik Engagement
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Total Views (Blog + News)</span>
                <span className="font-bold">{totalViews.toLocaleString("id-ID")}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "75%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Total Pendukung Kampanye</span>
                <span className="font-bold">{totalSupporters.toLocaleString("id-ID")}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-green-600 rounded-full" style={{ width: "60%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Avg. Views per Article</span>
                <span className="font-bold">{Math.round(totalViews / Math.max(1, blog.length + news.length)).toLocaleString("id-ID")}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "45%" }} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
          <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            Kampanye Teratas
          </h3>
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                <img src={c.coverImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.supporters} pendukung</div>
                </div>
                <span className="text-xs font-bold text-primary">{Math.round((c.supporters / c.goal) * 100)}%</span>
              </div>
            ))}
            {campaigns.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada kampanye</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent blog posts */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-4">Artikel & Berita Terbaru</h3>
        <div className="space-y-2">
          {[...blog.slice(0, 3), ...news.slice(0, 2)].map((b: any) => (
            <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/40 transition-colors">
              <img src={b.coverImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{b.title}</div>
                <div className="text-xs text-muted-foreground">
                  {b.category} • {b.views || 0} views
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                b.status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : b.status === "scheduled" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              }`}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

