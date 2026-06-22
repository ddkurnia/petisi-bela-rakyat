"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Users, PenLine, Megaphone, Activity, Eye, HandHeart, Flag, Heart,
  Shield, Building2, GraduationCap, TrendingUp, HeartHandshake, Scale,
  ChevronLeft, ChevronRight, Quote, Crown, Briefcase, Camera, Wallet,
  Target, Sparkles,
} from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/store";

const nilaiIcons: Record<string, React.ElementType> = {
  Eye, HandHeart, Shield, Flag, Heart, Building2, TrendingUp, Scale,
};

const workIcons: Record<string, React.ElementType> = {
  Building2, GraduationCap, TrendingUp, HeartHandshake, Scale,
};

// Org structure position icons
const positionIcons: Record<string, React.ElementType> = {
  ketua: Crown,
  wakil_ketua: Users,
  sekretaris: Briefcase,
  bidang_hukum: Scale,
  bidang_advokasi: Megaphone,
  bidang_media: Camera,
  bidang_hubungan_pemerintah: Building2,
  bidang_penggalangan_dukungan: Users,
  bidang_riset_data: Target,
  bidang_keuangan: Wallet,
};

// ============ SUPPORTER CAROUSEL ============
function SupporterCarousel() {
  const supporters = useStore((s) => s.supporters);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || supporters.length === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % supporters.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused, supporters.length]);

  if (supporters.length === 0) return null;

  const current = supporters[index];

  return (
    <div
      className="relative max-w-4xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="p-8 md:p-12 border-0 shadow-2xl shadow-foreground/10 bg-card">
              <Quote className="h-12 w-12 text-primary/30 mb-4" />
              <p className="text-lg md:text-2xl font-heading font-medium leading-relaxed text-foreground/90">
                &ldquo;{current.statement}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-4">
                <img src={current.photo} alt={current.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20" />
                <div>
                  <div className="font-heading font-bold text-lg">{current.name}</div>
                  <div className="text-sm text-muted-foreground">{current.position}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {supporters.length > 1 && (
        <>
          <button
            onClick={() => setIndex((i) => (i - 1 + supporters.length) % supporters.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-1/2 h-11 w-11 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % supporters.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-11 w-11 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-6">
            {supporters.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function HomePage() {
  const { navigate } = useNav();
  const settings = useStore((s) => s.settings);
  const work = useStore((s) => s.work);
  const supporters = useStore((s) => s.supporters);
  const news = useStore((s) => s.news);
  const pengurus = useStore((s) => s.pengurus);
  const orgStructure = useStore((s) => s.orgStructure);

  // Top positions for org preview (Ketua + Wakil + Sekretaris + Bidang heads)
  const topPositions = orgStructure.slice(0, 4);
  const getPengurusByPosition = (key: string) =>
    pengurus.find((p) => p.jabatanKey === key && p.status === "active");

  return (
    <div>
      {/* ===== SECTION 1: TENTANG PETISI BELA RAKYAT (2-column) ===== */}
      <section className="py-16 md:py-28 bg-background">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Photo */}
            <Reveal>
              <div className="relative">
                <div className="relative aspect-[4/5] sm:aspect-[5/4] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={settings.homepage.about.image}
                    alt="Kegiatan Petisi Bela Rakyat"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-5 -right-5 md:-right-8 bg-primary text-white p-5 md:p-6 rounded-2xl shadow-2xl shadow-primary/30 max-w-[200px]">
                  <div className="font-heading text-3xl md:text-4xl font-extrabold">2016</div>
                  <div className="text-xs md:text-sm text-white/90 mt-1">Berdiri sejak, melayani rakyat</div>
                </div>
              </div>
            </Reveal>

            {/* Right: About + Visi + Misi */}
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="h-px w-8 bg-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Tentang Petisi Bela Rakyat
                  </span>
                </div>
                <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  {settings.homepage.about.title}
                </h2>
                <p className="mt-5 text-muted-foreground text-base md:text-lg leading-relaxed">
                  {settings.homepage.about.description}
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mt-8 p-5 md:p-6 rounded-2xl bg-secondary/40 border border-border">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Eye className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-heading text-base md:text-lg font-bold">Visi</h3>
                  </div>
                  <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                    {settings.about.visi}
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.25}>
                <div className="mt-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-heading text-base md:text-lg font-bold">Misi</h3>
                  </div>
                  <div className="space-y-2">
                    {settings.about.misi.slice(0, 3).map((m, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span className="text-sm md:text-base text-foreground/80">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.35}>
                <Button
                  className="mt-8 rounded-full bg-primary hover:bg-primary/90 text-white"
                  onClick={() => navigate("about", { aboutSection: "sejarah" })}
                >
                  Pelajari Lebih Lanjut
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: FOKUS PERJUANGAN KAMI (Work) ===== */}
      <section className="py-16 md:py-28 bg-secondary/40">
        <div className="container-x">
          <SectionHeading
            eyebrow="Fokus Perjuangan"
            title="Fokus Perjuangan Kami"
            description="Kami fokus pada isu-isu strategis yang berdampak langsung pada kehidupan rakyat — dari infrastruktur hingga advokasi hukum."
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {work.map((w, i) => {
              const Icon = workIcons[w.icon] || Building2;
              return (
                <Reveal key={w.id} delay={i * 0.08}>
                  <button
                    onClick={() => navigate("work", { workSlug: w.slug })}
                    className="group text-left w-full"
                  >
                    <Card className="overflow-hidden h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
                      <div className="relative h-48 overflow-hidden">
                        <img src={w.coverImage} alt={w.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-4 left-4 h-11 w-11 rounded-xl bg-white/95 backdrop-blur flex items-center justify-center shadow-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="font-heading text-lg md:text-xl font-bold text-white">{w.title}</h3>
                        </div>
                      </div>
                      <div className="p-5 md:p-6">
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{w.description}</p>
                        <div className="mt-4 inline-flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all gap-1">
                          Lihat Detail
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </Card>
                  </button>
                </Reveal>
              );
            })}
            <Reveal delay={0.4}>
              <button
                onClick={() => navigate("work")}
                className="group relative w-full h-full min-h-[280px] rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-heading text-lg font-bold">Lihat Semua Bidang</h3>
                <p className="mt-1 text-sm text-muted-foreground">Eksplorasi seluruh area kerja kami</p>
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: STRUKTUR PENGURUS ===== */}
      <section className="py-16 md:py-28 bg-background">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <SectionHeading
              eyebrow="Organisasi"
              title="Struktur Pengurus"
              description="Tim pengurus yang menjalankan operasional Petisi Bela Rakyat setiap hari."
              align="left"
            />
            <Button variant="outline" className="rounded-full self-start md:self-auto" onClick={() => navigate("about", { aboutSection: "struktur" })}>
              Lihat Struktur Lengkap
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Top positions preview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {topPositions.map((node, i) => {
              const person = getPengurusByPosition(node.key);
              const Icon = positionIcons[node.key] || Briefcase;
              return (
                <Reveal key={node.key} delay={i * 0.08}>
                  <button
                    onClick={() => person && navigate("pengurus", { pengurusSlug: person.slug })}
                    className="group text-left w-full"
                  >
                    <Card className="overflow-hidden h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden">
                        {person?.photo ? (
                          <img src={person.photo} alt={person.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="h-full w-full bg-secondary flex items-center justify-center">
                            <Icon className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-3 left-3 h-9 w-9 rounded-xl bg-primary/95 backdrop-blur flex items-center justify-center shadow-lg">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="text-[10px] font-bold uppercase tracking-wide text-primary/90 mb-0.5">
                            {node.label}
                          </div>
                          <h3 className="font-heading font-bold text-white text-sm line-clamp-1">
                            {person?.name || "Belum diisi"}
                          </h3>
                          {person?.gelar && (
                            <p className="text-white/70 text-[10px] line-clamp-1">{person.gelar}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </button>
                </Reveal>
              );
            })}
          </div>

          {/* Quick stats line */}
          <Reveal delay={0.4}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-center">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  <strong className="font-heading">{pengurus.filter((p) => p.status === "active").length} pengurus aktif</strong>
                </span>
              </div>
              <div className="hidden md:block h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  <strong className="font-heading">{orgStructure.length} posisi</strong> dalam struktur
                </span>
              </div>
              <div className="hidden md:block h-4 w-px bg-border" />
              <Button
                variant="link"
                className="text-primary p-0 h-auto"
                onClick={() => navigate("about", { aboutSection: "pengurus" })}
              >
                Lihat semua pengurus →
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== SECTION 4: DUKUNGAN TOKOH (Carousel) ===== */}
      <section className="py-16 md:py-28 bg-foreground text-background">
        <div className="container-x">
          <SectionHeading
            eyebrow="Dukungan Tokoh"
            title={<span className="text-white">{settings.homepage.supporters.title}</span>}
            description={<span className="text-white/70">{settings.homepage.supporters.description}</span>}
            dark
          />
          <div className="mt-12">
            <SupporterCarousel />
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: BERITA TERBARU (News) ===== */}
      <section className="py-16 md:py-28 bg-background">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <SectionHeading eyebrow="News" title="Berita Terbaru" align="left" />
            <Button variant="outline" className="rounded-full self-start md:self-auto" onClick={() => navigate("news")}>
              Lihat Semua
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {news.slice(0, 3).map((n, i) => (
              <Reveal key={n.id} delay={i * 0.1}>
                <button
                  onClick={() => navigate("news", { newsSlug: n.slug })}
                  className="group text-left w-full h-full"
                >
                  <Card className="overflow-hidden h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-52 overflow-hidden">
                      <img src={n.coverImage} alt={n.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <Badge className="absolute top-3 left-3 bg-primary text-white border-0">{n.category}</Badge>
                    </div>
                    <div className="p-5 md:p-6">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span>{formatDate(n.publishedAt)}</span>
                        <span className="opacity-50">•</span>
                        <span>{n.author}</span>
                      </div>
                      <h3 className="font-heading text-base md:text-lg font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{n.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{n.excerpt}</p>
                    </div>
                  </Card>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-16 md:py-28 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/40" />
        <div className="container-x relative">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-5">
                <Activity className="h-3.5 w-3.5" />
                Aksi Nyata Hari Ini
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Satu tanda tangan Anda bisa <span className="text-gradient-red">mengubah nasib ribuan rakyat</span>.
              </h2>
              <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Kami tidak akan berhenti sebelum suara rakyat didengar. Bergabunglah dengan gerakan ini — mulai dari satu tanda tangan Anda.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white rounded-full h-12 px-8 shadow-2xl shadow-primary/30"
                  onClick={() => navigate("campaigns")}
                >
                  <PenLine className="h-5 w-5 mr-2" />
                  Tandatangani Petisi
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-8"
                  onClick={() => navigate("contact")}
                >
                  Hubungi Kami
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
