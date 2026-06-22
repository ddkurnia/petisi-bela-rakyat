"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Eye, HandHeart, Shield, Flag, Heart, History, Target, Sparkles, Building2 } from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StrukturOrganisasiPage } from "./struktur-page";
import { PengurusPage } from "./pengurus-page";
import { PenasehatPage, RelawanPage } from "./penasehat-relawan-page";

const nilaiIcons: Record<string, React.ElementType> = {
  Eye, HandHeart, Shield, Flag, Heart, Sparkles, Building2, Target,
};

const submenu = [
  { id: "sejarah" as const, label: "Sejarah" },
  { id: "visi-misi" as const, label: "Visi & Misi" },
  { id: "struktur" as const, label: "Struktur" },
  { id: "pengurus" as const, label: "Pengurus" },
  { id: "penasehat" as const, label: "Dewan Penasehat" },
  { id: "relawan" as const, label: "Relawan" },
];

export function AboutPage() {
  const settings = useStore((s) => s.settings);
  const { navigate, aboutSection } = useNav();

  // Sub-pages
  if (aboutSection === "struktur") return <StrukturOrganisasiPage />;
  if (aboutSection === "pengurus") return <PengurusPage />;
  if (aboutSection === "penasehat") return <PenasehatPage />;
  if (aboutSection === "relawan") return <RelawanPage />;

  // Default: Sejarah & Visi-Misi (combined)
  return (
    <div className="pt-24 md:pt-32">
      {/* Hero with submenu */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container-x">
          <Reveal>
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-primary" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Tentang Kami
                </span>
              </div>
              <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Membela rakyat dengan cara yang berbeda
              </h1>
              <p className="mt-6 text-base md:text-xl text-muted-foreground leading-relaxed">
                {settings.about.motto}
              </p>
            </div>
          </Reveal>

          {/* Submenu tabs */}
          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3 overflow-x-auto">
              {submenu.map((item) => {
                const isActive =
                  (item.id === "sejarah" && (!aboutSection || aboutSection === "sejarah")) ||
                  (item.id === "visi-misi" && aboutSection === "visi-misi") ||
                  aboutSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate("about", { aboutSection: item.id })}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "bg-secondary text-foreground hover:bg-secondary/70"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Sejarah (default if no section or sejarah) */}
      {(!aboutSection || aboutSection === "sejarah") && (
        <>
          <section className="py-12 md:py-20 bg-background">
            <div className="container-x">
              <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
                <div className="lg:col-span-4">
                  <Reveal>
                    <div className="lg:sticky lg:top-28">
                      <div className="inline-flex items-center gap-2 mb-4">
                        <History className="h-5 w-5 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                          Sejarah
                        </span>
                      </div>
                      <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                        Bagaimana kami bermula
                      </h2>
                      <p className="mt-4 text-muted-foreground text-sm md:text-base">
                        Dari keprihatinan lokal, lahir gerakan nasional.
                      </p>
                    </div>
                  </Reveal>
                </div>
                <div className="lg:col-span-8">
                  <Reveal delay={0.1}>
                    <div className="prose-pbr max-w-none">
                      <p className="text-base md:text-lg text-foreground/80 leading-relaxed first-letter:text-6xl first-letter:font-heading first-letter:font-extrabold first-letter:text-primary first-letter:mr-3 first-letter:float-left first-letter:leading-none">
                        {settings.about.sejarah}
                      </p>
                    </div>
                  </Reveal>

                  {/* Timeline */}
                  <div className="mt-12 relative pl-8 border-l-2 border-primary/20">
                    {settings.about.sejarahTimeline.map((t, i) => (
                      <Reveal key={i} delay={i * 0.1}>
                        <div className="relative mb-8 last:mb-0">
                          <div className="absolute -left-[42px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                          <div className="font-heading text-xl font-bold text-primary">{t.year}</div>
                          <div className="font-heading text-base font-bold mt-0.5">{t.title}</div>
                          <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Visi & Misi */}
          <section className="py-12 md:py-20 bg-secondary/40">
            <div className="container-x">
              <SectionHeading
                eyebrow="Visi & Misi"
                title="Arah dan Langkah Kami"
                description="Visi adalah arah, misi adalah jalan. Keduanya kami pegang teguh sejak hari pertama."
              />
              <div className="mt-12 grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Visi */}
                <Reveal>
                  <Card className="p-6 md:p-8 h-full border-0 shadow-xl shadow-foreground/5 bg-card">
                    <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center mb-5">
                      <Eye className="h-7 w-7" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold mb-3">Visi</h3>
                    <p className="text-base md:text-lg text-foreground/80 leading-relaxed">
                      {settings.about.visi}
                    </p>
                  </Card>
                </Reveal>
                {/* Misi */}
                <Reveal delay={0.15}>
                  <Card className="p-6 md:p-8 h-full border-0 shadow-xl shadow-foreground/5 bg-card">
                    <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center mb-5">
                      <Target className="h-7 w-7" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold mb-4">Misi</h3>
                    <div className="space-y-3">
                      {settings.about.misi.map((m, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="h-7 w-7 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          <span className="text-sm md:text-base text-foreground/80">{m}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Reveal>
              </div>
            </div>
          </section>

          {/* Nilai */}
          <section className="py-12 md:py-20 bg-background">
            <div className="container-x">
              <SectionHeading
                eyebrow="Nilai Organisasi"
                title="Empat Pilar Perjuangan"
                description="Nilai-nilai ini memandu setiap keputusan, kampanye, dan tindakan kami."
              />
              <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {settings.about.nilai.map((n, i) => {
                  const Icon = nilaiIcons[n.icon] || Shield;
                  return (
                    <Reveal key={i} delay={i * 0.1}>
                      <Card className="p-6 md:p-7 h-full bg-card border-0 shadow-lg shadow-foreground/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                          <Icon className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="font-heading text-lg md:text-xl font-bold">{n.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          {n.description}
                        </p>
                      </Card>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-12 md:py-20 bg-background">
            <div className="container-x">
              <Reveal>
                <Card className="relative overflow-hidden bg-foreground text-background border-0 p-10 md:p-16">
                  <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/30 blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
                  <div className="relative grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <Heart className="h-10 w-10 text-primary mb-4" />
                      <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                        Bersama kami, suara Anda didengar.
                      </h2>
                      <p className="mt-3 text-white/70 text-base md:text-lg">
                        Mari berkontribusi pada perjuangan rakyat — dalam kapasitas apa pun.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-white rounded-full"
                        onClick={() => navigate("campaigns")}
                      >
                        Tandatangani Petisi
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 bg-transparent rounded-full"
                        onClick={() => navigate("contact")}
                      >
                        Hubungi Kami
                      </Button>
                    </div>
                  </div>
                </Card>
              </Reveal>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
