"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, Phone, MessageCircle, Award, Briefcase, User } from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PengurusPage() {
  const { navigate, pengurusSlug } = useNav();
  const pengurus = useStore((s) => s.pengurus);
  const settings = useStore((s) => s.settings);
  const activePengurus = pengurus.filter((p) => p.status === "active");
  const sorted = [...activePengurus].sort((a, b) => a.order - b.order);

  // Detail view
  if (pengurusSlug) {
    const member = pengurus.find((p) => p.slug === pengurusSlug);
    if (!member) {
      return (
        <div className="pt-32 container-x">
          <p>Pengurus tidak ditemukan.</p>
          <Button onClick={() => navigate("pengurus")} className="mt-4">Kembali</Button>
        </div>
      );
    }
    const related = sorted.filter((m) => m.slug !== pengurusSlug).slice(0, 4);

    return (
      <div className="pt-24 md:pt-32 pb-20">
        <div className="container-x">
          <Button
            variant="ghost"
            className="mb-6 -ml-2 rounded-full"
            onClick={() => navigate("pengurus")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke Pengurus
          </Button>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Photo */}
            <Reveal className="lg:col-span-2">
              <div className="lg:sticky lg:top-28">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                  <img src={member.photo} alt={member.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-primary text-white border-0">
                    {member.jabatan}
                  </Badge>
                </div>

                {/* Contact card */}
                <Card className="mt-4 p-5 border-0 shadow-lg shadow-foreground/5">
                  <h3 className="font-heading text-sm font-bold mb-3">Kontak</h3>
                  <div className="space-y-2.5">
                    <a
                      href={`https://wa.me/${member.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary transition-colors text-sm"
                    >
                      <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">WhatsApp</div>
                        <div className="font-medium">{member.whatsapp}</div>
                      </div>
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary transition-colors text-sm"
                    >
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Email</div>
                        <div className="font-medium truncate">{member.email}</div>
                      </div>
                    </a>
                  </div>
                </Card>
              </div>
            </Reveal>

            {/* Detail */}
            <div className="lg:col-span-3">
              <Reveal>
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="h-px w-8 bg-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Profil Pengurus
                  </span>
                </div>
                <h1 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight">
                  {member.name}
                </h1>
                <p className="mt-1 text-base md:text-lg text-muted-foreground">
                  {member.gelar}
                </p>
                <Badge className="mt-3 bg-primary/10 text-primary border-0">
                  {member.jabatan}
                </Badge>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mt-8 p-6 md:p-7 rounded-2xl bg-secondary/50 border border-border">
                  <h2 className="font-heading text-lg font-bold mb-2 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Bidang Tugas
                  </h2>
                  <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.25}>
                <div className="mt-6">
                  <h2 className="font-heading text-2xl font-bold mb-3 flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    Pengalaman
                  </h2>
                  <div className="space-y-2">
                    {(member.experience || "")
                      .split(".")
                      .filter(Boolean)
                      .map((line, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span className="text-sm md:text-base text-foreground/80">{line.trim()}.</span>
                        </div>
                      ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.35}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="rounded-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <a href={`https://wa.me/${member.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Hubungi via WhatsApp
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full"
                  >
                    <a href={`mailto:${member.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Kirim Email
                    </a>
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Other members */}
          <div className="mt-20 pt-12 border-t border-border">
            <SectionHeading eyebrow="Tim Kami" title="Pengurus Lainnya" align="left" />
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((m) => (
                <button
                  key={m.id}
                  onClick={() => navigate("pengurus", { pengurusSlug: m.slug })}
                  className="group text-left"
                >
                  <Card className="overflow-hidden border-0 shadow-lg shadow-foreground/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-square overflow-hidden">
                      <img src={m.photo} alt={m.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading font-bold text-sm">{m.name}</h3>
                      <p className="text-xs text-muted-foreground">{m.jabatan}</p>
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
              eyebrow="Tentang Kami"
              title="Pengurus Organisasi"
              description="Tim pengurus yang menjalankan operasional Petisi Bela Rakyat setiap hari, dengan komitmen yang sama: membela rakyat."
            />
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {sorted.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.08}>
                <button
                  onClick={() => navigate("pengurus", { pengurusSlug: m.slug })}
                  className="group text-left w-full"
                >
                  <Card className="overflow-hidden h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img src={m.photo} alt={m.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <Badge className="absolute top-3 left-3 bg-primary text-white border-0">
                        {m.jabatan}
                      </Badge>
                      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                        <h3 className="font-heading text-xl md:text-2xl font-bold text-white">
                          {m.name}
                        </h3>
                        <p className="text-white/70 text-xs">{m.gelar}</p>
                      </div>
                    </div>
                    <div className="p-5 md:p-6">
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {m.bio}
                      </p>
                      <div className="mt-4 inline-flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all gap-1">
                        Lihat Profil
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Card>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
