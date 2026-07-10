"use client";

import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore, getInitials } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, HeartHandshake, Calendar, MapPin } from "lucide-react";

export function PenasehatPage() {
  const penasehat = useStore((s) => s.penasehat);
  const sorted = [...penasehat].sort((a, b) => a.order - b.order);

  return (
    <div className="pt-24 md:pt-32 pb-20">
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="Tentang Kami"
              title="Penasihat Kami"
              description="Tokoh-tokoh berpengalaman yang memberi arahan strategis dan advis untuk gerakan ini."
            />
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {sorted.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1}>
                <Card className="overflow-hidden h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    {p.photo ? (
                      <img src={p.photo} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-red-700 text-white flex items-center justify-center font-heading font-bold text-3xl">
                        {getInitials(p.name)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-primary text-white border-0">
                      {p.jabatan}
                    </Badge>
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                      <h3 className="font-heading text-xl md:text-2xl font-bold text-white">
                        {p.name}
                      </h3>
                      <p className="text-white/70 text-xs">{p.gelar}</p>
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {p.bio}
                    </p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function RelawanPage() {
  const relawan = useStore((s) => s.relawan);
  const { navigate } = useNav();
  const active = relawan.filter((r) => r.active);

  return (
    <div className="pt-24 md:pt-32 pb-20">
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="Tentang Kami"
              title="Relawan Kami"
              description="Para relawan adalah jantung gerakan ini. Mereka yang berdiri di garis depan, mendengarkan, dan menyuarakan aspirasi rakyat."
            />
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-x">
          {/* Stats */}
          <Reveal>
            <div className="grid grid-cols-3 gap-4 mb-12">
              <Card className="p-5 text-center border-0 shadow-lg shadow-foreground/5">
                <div className="font-heading text-3xl md:text-4xl font-extrabold text-primary">
                  {relawan.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total Relawan</div>
              </Card>
              <Card className="p-5 text-center border-0 shadow-lg shadow-foreground/5">
                <div className="font-heading text-3xl md:text-4xl font-extrabold text-primary">
                  {active.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Aktif</div>
              </Card>
              <Card className="p-5 text-center border-0 shadow-lg shadow-foreground/5">
                <div className="font-heading text-3xl md:text-4xl font-extrabold text-primary">
                  {new Set(relawan.map((r) => r.area)).size}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Wilayah</div>
              </Card>
            </div>
          </Reveal>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {active.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.05}>
                <Card className="overflow-hidden h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    {r.photo ? (
                      <img src={r.photo} alt={r.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-red-700 text-white flex items-center justify-center font-heading font-bold text-xl">
                        {getInitials(r.name)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="font-heading font-bold text-sm text-white">{r.name}</h3>
                      <div className="flex items-center gap-1 text-white/70 text-[10px] mt-0.5">
                        <MapPin className="h-2.5 w-2.5" />
                        {r.area}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-2.5 w-2.5" />
                      Bergabung {new Date(r.joinedAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>

          {/* CTA */}
          <Reveal delay={0.2}>
            <div className="mt-16 p-8 md:p-12 rounded-3xl bg-foreground text-background text-center">
              <HeartHandshake className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
                Ingin menjadi relawan?
              </h2>
              <p className="mt-2 text-white/70 max-w-xl mx-auto">
                Bergabunglah dengan gerakan ini. Setiap tangan yang terlibat membawa kami lebih dekat pada perubahan.
              </p>
              <button
                onClick={() => navigate("contact")}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
              >
                <Users className="h-4 w-4" />
                Daftar Menjadi Relawan
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
