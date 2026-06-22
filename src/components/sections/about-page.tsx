"use client";

import { motion } from "framer-motion";
import { Eye, Target, Flag, History, ArrowRight, Check, Heart, HandHeart, Shield } from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const nilaiIcons = [Eye, HandHeart, Shield, Flag];

export function AboutPage() {
  const settings = useStore((s) => s.settings);
  const { navigate } = useNav();

  return (
    <div className="pt-24 md:pt-32">
      {/* Hero */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-primary/5 via-background to-background">
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
                Kami bukan sekadar NGO — kami adalah perpanjangan tangan masyarakat yang selama ini tidak didengar. Setiap kampanye, setiap petisi, dan setiap advokasi lahir dari aspirasi nyata di lapangan.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Visi */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <Eye className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Visi
                  </span>
                </div>
                <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  Visi Kami
                </h2>
                <p className="mt-6 text-base md:text-lg text-foreground/80 leading-relaxed">
                  {settings.about.visi}
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Masyarakat bersuara"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Misi */}
      <section className="py-16 md:py-24 bg-secondary/40">
        <div className="container-x">
          <SectionHeading
            eyebrow="Misi"
            title="Lima Misi Strategis"
            description="Untuk mewujudkan visi, kami menjalankan misi yang terukur dan dapat dievaluasi."
          />
          <div className="mt-12 grid md:grid-cols-2 gap-5">
            {settings.about.misi.map((m, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <Card className="p-6 md:p-8 h-full bg-card border-0 shadow-lg shadow-foreground/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-start gap-5">
                  <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary text-white flex items-center justify-center font-heading font-extrabold text-lg">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-heading text-base md:text-lg font-bold mb-1.5">
                      Misi {i + 1}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {m}
                    </p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Nilai */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-x">
          <SectionHeading
            eyebrow="Nilai Organisasi"
            title="Empat Pilar Perjuangan"
            description="Nilai-nilai ini memandu setiap keputusan, kampanye, dan tindakan kami."
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {settings.about.nilai.map((n, i) => {
              const Icon = nilaiIcons[i % nilaiIcons.length];
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

      {/* Sejarah */}
      <section className="py-16 md:py-24 bg-secondary/40">
        <div className="container-x">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <Reveal>
                <div className="sticky top-28">
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
                {[
                  { year: "2024", title: "Awal Mula", desc: "Berdiri sebagai forum keprihatinan masyarakat Meranti" },
                  { year: "2025", title: "Kampanye Jembatan", desc: "Meluncurkan petisi Jembatan Panglima Sampul dan Perawang" },
                  { year: "2025", title: "Aliansi Luas", desc: "Membangun jaringan dengan 50+ organisasi mitra" },
                  { year: "2026", title: "Skala Nasional", desc: "Memperluas advokasi ke 5 bidang kerja strategis" },
                ].map((t, i) => (
                  <Reveal key={i} delay={i * 0.1}>
                    <div className="relative mb-8 last:mb-0">
                      <div className="absolute -left-[42px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                      <div className="font-heading text-xl font-bold text-primary">{t.year}</div>
                      <div className="font-heading text-base font-bold mt-0.5">{t.title}</div>
                      <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-background">
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
    </div>
  );
}
