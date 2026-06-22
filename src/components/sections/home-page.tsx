"use client";

import { motion } from "framer-motion";
import { ArrowRight, Users, PenLine, Megaphone, Activity } from "lucide-react";
import { AnimatedCounter, Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/store";
import {
  Building2,
  GraduationCap,
  TrendingUp,
  HeartHandshake,
  Scale,
  Shield,
  Eye,
  HandHeart,
  Flag,
} from "lucide-react";

const statIcons = [PenLine, Users, Shield, Megaphone];

export function HomePage() {
  const { navigate } = useNav();
  const settings = useStore((s) => s.settings);
  const work = useStore((s) => s.work);
  const campaigns = useStore((s) => s.campaigns);
  const supporters = useStore((s) => s.supporters);
  const news = useStore((s) => s.news);

  const workIcons: Record<string, React.ElementType> = {
    Building2,
    GraduationCap,
    TrendingUp,
    HeartHandshake,
    Scale,
  };

  const nilaiIcons = [Eye, HandHeart, Shield, Flag];

  return (
    <div>
      {/* Stats section */}
      <section className="py-16 md:py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-50" />
        <div className="container-x relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {settings.stats.map((stat, i) => {
              const Icon = statIcons[i % statIcons.length];
              return (
                <Reveal key={i} delay={i * 0.1}>
                  <Card className="p-6 md:p-8 text-center h-full border-0 shadow-xl shadow-foreground/5 bg-gradient-to-b from-card to-card/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className="h-12 w-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="font-heading text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="mt-1 text-sm md:text-base text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* About preview */}
      <section className="py-16 md:py-28 bg-secondary/40">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="h-px w-8 bg-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Tentang Kami
                  </span>
                </div>
                <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  Lahir dari Rakyat, untuk Rakyat
                </h2>
                <p className="mt-5 text-muted-foreground text-base md:text-lg leading-relaxed">
                  {settings.about.visi}
                </p>
                <div className="mt-6 space-y-3">
                  {settings.about.misi.slice(0, 3).map((m, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-sm md:text-base text-foreground/80">{m}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-8 rounded-full bg-primary hover:bg-primary/90 text-white"
                  onClick={() => navigate("about")}
                >
                  Pelajari Lebih Lanjut
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Reveal>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {settings.about.nilai.map((n, i) => {
                const Icon = nilaiIcons[i % nilaiIcons.length];
                return (
                  <Reveal key={i} delay={i * 0.1}>
                    <Card className="p-5 md:p-6 h-full bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg shadow-foreground/5">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-heading text-base md:text-lg font-bold">
                        {n.title}
                      </h3>
                      <p className="mt-1.5 text-xs md:text-sm text-muted-foreground leading-relaxed">
                        {n.description}
                      </p>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Work preview */}
      <section className="py-16 md:py-28 bg-background">
        <div className="container-x">
          <SectionHeading
            eyebrow="Kerja Kami"
            title="Lima Bidang Perjuangan"
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
                        <img
                          src={w.coverImage}
                          alt={w.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-4 left-4 h-11 w-11 rounded-xl bg-white/95 backdrop-blur flex items-center justify-center shadow-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="font-heading text-lg md:text-xl font-bold text-white">
                            {w.title}
                          </h3>
                        </div>
                      </div>
                      <div className="p-5 md:p-6">
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {w.description}
                        </p>
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
                <p className="mt-1 text-sm text-muted-foreground">
                  Eksplorasi seluruh area kerja kami
                </p>
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Campaigns preview */}
      <section className="py-16 md:py-28 bg-foreground text-background">
        <div className="container-x">
          <SectionHeading
            eyebrow="Kampanye Aktif"
            title={<span className="text-white">Bergabung dalam Perjuangan</span>}
            description={
              <span className="text-white/70">
                Setiap tanda tangan adalah suara yang membawa kami lebih dekat pada keadilan.
              </span>
            }
            dark
          />
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {campaigns.map((c, i) => {
              const pct = Math.min(100, Math.round((c.supporters / c.goal) * 100));
              return (
                <Reveal key={c.id} delay={i * 0.1}>
                  <button
                    onClick={() => navigate("campaigns", { campaignSlug: c.slug })}
                    className="group text-left w-full"
                  >
                    <Card className="overflow-hidden h-full bg-white/5 border-white/10 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
                      <div className="grid sm:grid-cols-2 gap-0">
                        <div className="relative h-56 sm:h-full min-h-[220px] overflow-hidden">
                          <img
                            src={c.coverImage}
                            alt={c.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <Badge className="absolute top-3 left-3 bg-primary text-white border-0">
                            {c.status === "active" ? "Aktif" : c.status}
                          </Badge>
                        </div>
                        <div className="p-5 md:p-6 flex flex-col">
                          <h3 className="font-heading text-lg md:text-xl font-bold text-white">
                            {c.title}
                          </h3>
                          <p className="mt-2 text-sm text-white/70 line-clamp-3 leading-relaxed">
                            {c.description}
                          </p>
                          <div className="mt-auto pt-5">
                            <div className="flex justify-between text-xs text-white/60 mb-2">
                              <span>{c.supporters} pendukung</span>
                              <span>Target {c.goal}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${pct}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-primary to-red-400 rounded-full"
                              />
                            </div>
                            <div className="mt-4 inline-flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all gap-1">
                              Lihat Detail
                              <ArrowRight className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </button>
                </Reveal>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/30 text-white hover:bg-white/10 bg-transparent"
              onClick={() => navigate("campaigns")}
            >
              Lihat Semua Kampanye
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* News preview */}
      <section className="py-16 md:py-28 bg-background">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <SectionHeading
              eyebrow="News"
              title="Kabar Terbaru"
              align="left"
            />
            <Button
              variant="outline"
              className="rounded-full self-start md:self-auto"
              onClick={() => navigate("news")}
            >
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
                      <img
                        src={n.coverImage}
                        alt={n.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <Badge className="absolute top-3 left-3 bg-primary text-white border-0">
                        {n.category}
                      </Badge>
                    </div>
                    <div className="p-5 md:p-6">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span>{formatDate(n.publishedAt)}</span>
                        <span className="opacity-50">•</span>
                        <span>{n.author}</span>
                      </div>
                      <h3 className="font-heading text-base md:text-lg font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {n.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {n.excerpt}
                      </p>
                    </div>
                  </Card>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Supporters marquee */}
      <section className="py-16 md:py-24 bg-secondary/40">
        <div className="container-x">
          <SectionHeading
            eyebrow="Dukungan Tokoh"
            title="Suara yang Mempercayai Kami"
            description="Tokoh-tokoh dari berbagai latar belakang memberikan dukungan mereka pada perjuangan ini."
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {supporters.slice(0, 3).map((s, i) => (
              <Reveal key={s.id} delay={i * 0.1}>
                <Card className="p-6 md:p-7 h-full bg-card border-0 shadow-lg shadow-foreground/5 hover:shadow-xl transition-all">
                  <svg className="h-8 w-8 text-primary/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.17 7C5.42 7 4 8.42 4 10.17v2.66C4 14.58 5.42 16 7.17 16h.83v-7H7.17zM16 7c-1.75 0-3.17 1.42-3.17 3.17v2.66c0 1.75 1.42 3.17 3.17 3.17h.83V7H16zM10 10v6h4v-6h-4z" />
                  </svg>
                  <p className="text-sm md:text-base text-foreground/80 italic leading-relaxed line-clamp-4">
                    &ldquo;{s.statement}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center gap-3 pt-5 border-t border-border">
                    <img
                      src={s.photo}
                      alt={s.name}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-heading font-bold text-sm">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.position}</div>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => navigate("media")}
            >
              Lihat Semua Pendukung
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
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
