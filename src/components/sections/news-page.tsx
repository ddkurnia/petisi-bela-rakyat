"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Search, Calendar, User, Eye, Tag, Share2 } from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore, formatDate } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { T } from "@/lib/i18n/use-translated-text";
import { LoadingState } from "./loading-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShareButtons } from "@/components/share-buttons";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PER_PAGE = 6;

export function NewsPage() {
  const { navigate, newsSlug } = useNav();
  const news = useStore((s) => s.news);
  const newsLoaded = useStore((s) => s.loaded.news);
  const incrementNewsView = useStore((s) => s.incrementNewsView);
  const incrementNewsShare = useStore((s) => s.incrementNewsShare);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  // Hooks called unconditionally before any early return
  const categories = useMemo(() => {
    const set = new Set(news.map((n) => n.category));
    return ["all", ...Array.from(set)];
  }, [news]);

  const filtered = useMemo(() => {
    return news.filter((n) => {
      if (category !== "all" && n.category !== category) return false;
      if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.excerpt.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [news, category, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // Increment view counter when viewing news detail (once per slug per session)
  const viewedNewsSlugs = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!newsSlug) return;
    if (viewedNewsSlugs.current.has(newsSlug)) return;
    const article = news.find((n) => n.slug === newsSlug);
    if (article) {
      viewedNewsSlugs.current.add(newsSlug);
      incrementNewsView(article.id);
    }
  }, [newsSlug, news, incrementNewsView]);

  // Detail
  if (newsSlug) {
    const article = news.find((n) => n.slug === newsSlug);
    // Show loading while Firestore data hasn't arrived yet
    if (!article && !newsLoaded) {
      return <LoadingState />;
    }
    // Data loaded but article not found → genuinely not found
    if (!article) {
      return (
        <div className="pt-32 container-x">
          <p>Berita tidak ditemukan.</p>
          <Button onClick={() => navigate("news")} className="mt-4">Kembali</Button>
        </div>
      );
    }
    const related = news.filter((n) => n.slug !== newsSlug).slice(0, 3);
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: article.title,
      description: article.excerpt,
      image: article.coverImage,
      datePublished: article.publishedAt,
      author: { "@type": "Person", name: article.author },
    };

    return (
      <div className="pt-24 md:pt-32 pb-20">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        <div className="container-x max-w-4xl">
          <Button
            variant="ghost"
            className="mb-6 -ml-2 rounded-full"
            onClick={() => navigate("news")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke News
          </Button>

          <Reveal>
            <Badge className="bg-primary text-white border-0 mb-4">{article.category}</Badge>
            <h1 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              <T>{article.title}</T>
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4" /> {article.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> {formatDate(article.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> {article.views} views
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-6 relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl">
              <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover" />
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 prose-pbr max-w-none">
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed font-medium">
                <T>{article.excerpt}</T>
              </p>
              {article.content.split("\n").map((line, i) => {
                if (line.startsWith("## ")) {
                  return <h2 key={i}><T>{line.replace("## ", "")}</T></h2>;
                }
                if (line.startsWith("### ")) {
                  return <h3 key={i}><T>{line.replace("### ", "")}</T></h3>;
                }
                if (line.startsWith("- ")) {
                  return <li key={i}><T>{line.replace("- ", "")}</T></li>;
                }
                if (line.trim()) {
                  return <p key={i}><T>{line}</T></p>;
                }
                return null;
              })}
            </div>
          </Reveal>

          {/* Share buttons at end of news article */}
          <div className="mt-8 p-6 rounded-2xl bg-secondary/40 border border-border">
            <p className="text-sm font-semibold mb-3 text-center">
              📢 Bagikan berita ini kepada masyarakat
            </p>
            <ShareButtons
              title={article.title}
              description={article.excerpt}
              variant="full"
              onShare={() => incrementNewsShare(article.id)}
            />
          </div>

          {/* Related */}
          <div className="mt-16 pt-10 border-t border-border">
            <h2 className="font-heading text-2xl font-bold mb-6">Berita Lainnya</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {related.map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate("news", { newsSlug: r.slug })}
                  className="group text-left"
                >
                  <Card className="overflow-hidden h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="aspect-video overflow-hidden">
                      <img src={r.coverImage} alt={r.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-4">
                      <Badge className="bg-primary/10 text-primary border-0 text-xs mb-2">{r.category}</Badge>
                      <h3 className="font-heading text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{r.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(r.publishedAt)}</p>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="pt-24 md:pt-32 pb-20">
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="News"
              title="Kabar Terbaru Organisasi"
              description="Berita resmi, audiensi, kampanye, dan aktivitas organisasi yang dapat Anda ikuti."
            />
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-x">
          {/* Search & filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berita..."
                className="pl-10 rounded-full"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); setPage(1); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    category === c
                      ? "bg-primary text-white"
                      : "bg-secondary text-foreground hover:bg-secondary/70"
                  }`}
                >
                  {c === "all" ? "Semua" : c}
                </button>
              ))}
            </div>
          </div>

          {paginated.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Tidak ada berita yang cocok.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((n, i) => (
                <Reveal key={n.id} delay={i * 0.05}>
                  <button
                    onClick={() => {
                      navigate("news", { newsSlug: n.slug });
                    }}
                    className="group text-left w-full h-full"
                  >
                    <Card className="overflow-hidden h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                      <div className="relative h-52 overflow-hidden">
                        <img src={n.coverImage} alt={n.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <Badge className="absolute top-3 left-3 bg-primary text-white border-0">{n.category}</Badge>
                      </div>
                      <div className="p-5 md:p-6">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(n.publishedAt)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {n.author}
                          </span>
                        </div>
                        <h3 className="font-heading text-base md:text-lg font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          <T>{n.title}</T>
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          <T>{n.excerpt}</T>
                        </p>
                      </div>
                    </Card>
                  </button>
                </Reveal>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPage(Math.max(1, currentPage - 1)); }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === currentPage}
                        onClick={(e) => { e.preventDefault(); setPage(p); }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPage(Math.min(totalPages, currentPage + 1)); }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
