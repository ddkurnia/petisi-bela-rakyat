"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, Linkedin, Award, Briefcase } from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TeamPage() {
  const { navigate, teamSlug } = useNav();
  const team = useStore((s) => s.team);
  const sorted = [...team].sort((a, b) => a.order - b.order);

  // Detail view
  if (teamSlug) {
    const member = team.find((m) => m.slug === teamSlug);
    if (!member) {
      return (
        <div className="pt-32 container-x">
          <p>Anggota tidak ditemukan.</p>
          <Button onClick={() => navigate("team")} className="mt-4">Kembali</Button>
        </div>
      );
    }
    return (
      <div className="pt-24 md:pt-32 pb-20">
        <div className="container-x">
          <Button
            variant="ghost"
            className="mb-6 -ml-2 rounded-full"
            onClick={() => navigate("team")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke Tim
          </Button>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Photo */}
            <Reveal className="lg:col-span-2">
              <div className="lg:sticky lg:top-28">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-primary text-white border-0">
                    {member.position}
                  </Badge>
                </div>
              </div>
            </Reveal>

            {/* Detail */}
            <div className="lg:col-span-3">
              <Reveal>
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="h-px w-8 bg-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Profil Anggota
                  </span>
                </div>
                <h1 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight">
                  {member.name}
                </h1>
                <p className="mt-2 text-lg md:text-xl text-primary font-semibold">
                  {member.position}
                </p>
                <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
                  {member.summary}
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mt-8 p-6 md:p-7 rounded-2xl bg-secondary/50 border border-border">
                  <h2 className="font-heading text-lg font-bold mb-2 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Bidang Tugas
                  </h2>
                  <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                    {member.responsibilities || member.summary}
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.25}>
                <div className="mt-6">
                  <h2 className="font-heading text-2xl font-bold mb-3">Biografi</h2>
                  <div className="prose-pbr max-w-none">
                    <p className="text-base md:text-lg text-foreground/80 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.35}>
                <div className="mt-8">
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
                          <span className="text-sm md:text-base text-foreground/80">
                            {line.trim()}.
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.45}>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Button className="rounded-full bg-primary hover:bg-primary/90 text-white">
                    <Mail className="h-4 w-4 mr-2" />
                    Hubungi
                  </Button>
                  <Button variant="outline" className="rounded-full">
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Other members */}
          <div className="mt-20 pt-12 border-t border-border">
            <SectionHeading
              eyebrow="Tim Kami"
              title="Anggota Lainnya"
              align="left"
            />
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {sorted.filter((m) => m.slug !== teamSlug).slice(0, 4).map((m) => (
                <button
                  key={m.id}
                  onClick={() => navigate("team", { teamSlug: m.slug })}
                  className="group text-left"
                >
                  <Card className="overflow-hidden border-0 shadow-lg shadow-foreground/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={m.photo}
                        alt={m.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading font-bold text-sm">{m.name}</h3>
                      <p className="text-xs text-muted-foreground">{m.position}</p>
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
              eyebrow="Tim Kami"
              title="Wajah di Balik Perjuangan"
              description="Tim yang terdiri dari aktivis, akademisi, dan profesional dengan satu tekad: membela rakyat."
            />
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {sorted.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.1}>
                <button
                  onClick={() => navigate("team", { teamSlug: m.slug })}
                  className="group text-left w-full"
                >
                  <Card className="overflow-hidden h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={m.photo}
                        alt={m.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                        <Badge className="mb-2 bg-primary text-white border-0">
                          {m.position}
                        </Badge>
                        <h3 className="font-heading text-xl md:text-2xl font-bold text-white">
                          {m.name}
                        </h3>
                      </div>
                    </div>
                    <div className="p-5 md:p-6">
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {m.summary}
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
