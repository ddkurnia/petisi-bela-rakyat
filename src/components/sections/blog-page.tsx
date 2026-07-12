"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Search, Calendar, User, Eye, Tag, Clock, Share2 } from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore, formatDate } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { T, useTranslatedText } from "@/lib/i18n/use-translated-text";
import { LoadingState } from "./loading-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShareButtons } from "@/components/share-buttons";

const blogCategories = [
  "all",
  "Infrastruktur",
  "Hukum",
  "Kebijakan Publik",
  "Aspirasi Rakyat",
  "Kepulauan Meranti",
];

export function BlogPage() {
  const { navigate, blogSlug } = useNav();
  const blog = useStore((s) => s.blog);
  const blogLoaded = useStore((s) => s.loaded.blog);
  const incrementBlogView = useStore((s) => s.incrementBlogView);
  const incrementBlogShare = useStore((s) => s.incrementBlogShare);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // Hooks must be called unconditionally before any early return
  const filtered = useMemo(() => {
    return blog.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.excerpt.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [blog, category, search]);

  const featured = blog[0];
  const rest = filtered.filter((p) => p.id !== featured?.id);

  // Increment view counter when viewing a blog detail (once per slug)
  const viewedSlugs = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!blogSlug) return;
    if (viewedSlugs.current.has(blogSlug)) return;
    const post = blog.find((p) => p.slug === blogSlug);
    if (post) {
      viewedSlugs.current.add(blogSlug);
      incrementBlogView(post.id);
    }
  }, [blogSlug, blog, incrementBlogView]);

  // Detail
  if (blogSlug) {
    const post = blog.find((p) => p.slug === blogSlug);
    // Show loading while Firestore data hasn't arrived yet
    if (!post && !blogLoaded) {
      return <LoadingState />;
    }
    // Data loaded but post not found → genuinely not found
    if (!post) {
      return (
        <div className="pt-32 container-x">
          <p>Artikel tidak ditemukan.</p>
          <Button onClick={() => navigate("blog")} className="mt-4">Kembali</Button>
        </div>
      );
    }
    const related = blog.filter((p) => p.slug !== blogSlug && p.category === post.category).slice(0, 3);
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.metaDescription || post.excerpt,
      image: post.coverImage,
      datePublished: post.publishedAt,
      author: { "@type": "Person", name: post.author },
      keywords: post.tags.join(", "),
    };

    return (
      <div className="pt-24 md:pt-32 pb-20">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        <div className="container-x max-w-4xl">
          <Button
            variant="ghost"
            className="mb-6 -ml-2 rounded-full"
            onClick={() => navigate("blog")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke Blog
          </Button>

          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-primary text-white border-0">{post.category}</Badge>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span key={t} className="inline-flex items-center text-xs text-muted-foreground">
                    <Tag className="h-3 w-3 mr-0.5" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              <T>{post.title}</T>
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4" /> {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> {formatDate(post.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> {post.views} views
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Share2 className="h-4 w-4" /> {post.shares || 0} shares
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> 5 menit baca
              </span>
            </div>
            {/* Share buttons under title */}
            <div className="mt-4">
              <ShareButtons
                title={post.title}
                description={post.excerpt}
                variant="inline"
                onShare={() => incrementBlogShare(post.id)}
              />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-6 relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl">
              <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 prose-pbr max-w-none">
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed font-medium">
                <T>{post.excerpt}</T>
              </p>
              {post.content.split("\n").map((line, i) => {
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

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">Tags:</span>
              {post.tags.map((t) => (
                <Badge key={t} variant="outline" className="rounded-full">{t}</Badge>
              ))}
            </div>
          </div>

          {/* Share buttons at end of article */}
          <div className="mt-8 p-6 rounded-2xl bg-secondary/40 border border-border">
            <ShareButtons
              title={post.title}
              description={post.excerpt}
              variant="full"
              onShare={() => incrementBlogShare(post.id)}
            />
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-16 pt-10 border-t border-border">
              <h2 className="font-heading text-2xl font-bold mb-6">Artikel Terkait</h2>
              <div className="grid sm:grid-cols-3 gap-5">
                {related.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => navigate("blog", { blogSlug: r.slug })}
                    className="group text-left"
                  >
                    <Card className="overflow-hidden h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-xl hover:-translate-y-1 transition-all">
                      <div className="aspect-video overflow-hidden">
                        <img src={r.coverImage} alt={r.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="p-4">
                        <Badge className="bg-primary/10 text-primary border-0 text-xs mb-2">{r.category}</Badge>
                        <h3 className="font-heading text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{r.title}</h3>
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            </div>
          )}
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
              eyebrow="Blog"
              title="Analisis, Cerita, dan Aspirasi"
              description="Tulisan mendalam dari tim dan kontributor kami — dari analisis kebijakan hingga cerita warga."
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
                placeholder="Cari artikel..."
                className="pl-10 rounded-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {blogCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
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

          {/* Featured */}
          {category === "all" && !search && featured && (
            <Reveal>
              <button
                onClick={() => navigate("blog", { blogSlug: featured.slug })}
                className="group text-left w-full mb-10"
              >
                <Card className="overflow-hidden border-0 shadow-2xl shadow-foreground/10 hover:shadow-foreground/20 transition-all hover:-translate-y-1">
                  <div className="grid md:grid-cols-2">
                    <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
                      <img src={featured.coverImage} alt={featured.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <Badge className="absolute top-4 left-4 bg-primary text-white border-0">Featured</Badge>
                    </div>
                    <div className="p-6 md:p-10 flex flex-col justify-center">
                      <Badge className="self-start bg-primary/10 text-primary border-0 mb-3">{featured.category}</Badge>
                      <h2 className="font-heading text-2xl md:text-3xl font-extrabold leading-tight tracking-tight group-hover:text-primary transition-colors">
                        <T>{featured.title}</T>
                      </h2>
                      <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
                        <T>{featured.excerpt}</T>
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {featured.author}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(featured.publishedAt)}
                        </span>
                      </div>
                      <div className="mt-5 inline-flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all gap-1">
                        Baca Selengkapnya
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </Card>
              </button>
            </Reveal>
          )}

          {rest.length === 0 && !featured ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Tidak ada artikel yang cocok.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filtered.length === 0 ? [] : (category === "all" && !search ? rest : filtered)).map((p, i) => (
                <Reveal key={p.id} delay={i * 0.05}>
                  <button
                    onClick={() => navigate("blog", { blogSlug: p.slug })}
                    className="group text-left w-full h-full"
                  >
                    <Card className="overflow-hidden h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                      <div className="relative h-52 overflow-hidden">
                        <img src={p.coverImage} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <Badge className="absolute top-3 left-3 bg-primary text-white border-0">{p.category}</Badge>
                      </div>
                      <div className="p-5 md:p-6">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(p.publishedAt)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            5 min
                          </span>
                        </div>
                        <h3 className="font-heading text-base md:text-lg font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          <T>{p.title}</T>
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          <T>{p.excerpt}</T>
                        </p>
                      </div>
                    </Card>
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
