"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, GraduationCap, TrendingUp, HeartHandshake, Scale } from "lucide-react";

const workIcons: Record<string, React.ElementType> = {
  Building2,
  GraduationCap,
  TrendingUp,
  HeartHandshake,
  Scale,
};

const workDetails: Record<string, { programs: string[]; outcomes: string[] }> = {
  "infrastruktur-publik": {
    programs: [
      "Petisi percepatan Jembatan Panglima Sampul",
      "Petisi percepatan Jembatan Perawang",
      "Audit partisipatif infrastruktur jalan",
    ],
    outcomes: [
      "327 tanda tangan terkumpul untuk Jembatan Panglima Sampul",
      "Audiensi dengan DPRD Meranti tercapai",
      "Pembentukan panitia khusus DPRD",
    ],
  },
  pendidikan: {
    programs: [
      " advokasi sekolah layang di pulau terpencil",
      "Beasiswa untuk anak nelayan",
      "Pelatihan guru volunteer",
    ],
    outcomes: [
      "15 anak mendapat beasiswa",
      "5 sekolah layang berdiri",
      "30 guru volunteer terlatih",
    ],
  },
  "ekonomi-rakyat": {
    programs: [
      "Advokasi subsidi BBM nelayan",
      "Pendampingan UMKM pesisir",
      "Koperasi masyarakat adat",
    ],
    outcomes: [
      "50 UMKM dibina",
      "Koperasi berdiri di 3 desa",
      "Penghapusan pajak tidak wajar",
    ],
  },
  "pelayanan-publik": {
    programs: [
      "Advokasi KTP gratis",
      "Pendampingan BPJS",
      "Audit layanan kesehatan",
    ],
    outcomes: [
      "500+ KTP diterbitkan",
      "Peningkatan layanan puskesmas",
      "Forum layanan publik rutin",
    ],
  },
  "advokasi-hukum": {
    programs: [
      "Pendampingan hukum gratis",
      "Advokasi sengketa lahan",
      "Advokasi hak pekerja",
    ],
    outcomes: [
      "20 kasus didampingi",
      "5 sengketa lahan diselesaikan",
      "Pengembalian kompensasi pekerja",
    ],
  },
};

export function WorkPage() {
  const { navigate, workSlug } = useNav();
  const work = useStore((s) => s.work);

  // Detail view
  if (workSlug) {
    const w = work.find((x) => x.slug === workSlug);
    if (!w) {
      return (
        <div className="pt-32 container-x">
          <p>Bidang kerja tidak ditemukan.</p>
          <Button onClick={() => navigate("work")} className="mt-4">Kembali</Button>
        </div>
      );
    }
    const Icon = workIcons[w.icon] || Building2;
    const detail = workDetails[w.slug] || { programs: [], outcomes: [] };

    return (
      <div className="pt-24 md:pt-32 pb-20">
        <div className="container-x">
          <Button
            variant="ghost"
            className="mb-6 -ml-2 rounded-full"
            onClick={() => navigate("work")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke Kerja Kami
          </Button>

          {/* Hero */}
          <div className="relative aspect-[16/8] md:aspect-[16/6] rounded-3xl overflow-hidden shadow-2xl mb-12">
            <img
              src={w.coverImage}
              alt={w.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-xl">
                <Icon className="h-7 w-7 text-white" />
              </div>
              <Badge className="bg-primary text-white border-0 mb-3">{w.title}</Badge>
              <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-white tracking-tight max-w-3xl">
                {w.title}
              </h1>
              <p className="mt-3 text-white/80 text-base md:text-lg max-w-2xl">
                {w.description}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
            <Reveal>
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-5">
                  Program Kami
                </h2>
                <div className="space-y-3">
                  {detail.programs.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-secondary/40 border border-border">
                      <div className="h-7 w-7 shrink-0 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </div>
                      <span className="text-sm md:text-base text-foreground/90">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-5">
                  Hasil yang Telah Dicapai
                </h2>
                <div className="space-y-3">
                  {detail.outcomes.map((o, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm md:text-base text-foreground/90">{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.25}>
            <div className="mt-12 p-8 md:p-12 rounded-3xl bg-foreground text-background text-center">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
                Ingin berkontribusi pada bidang ini?
              </h2>
              <p className="mt-2 text-white/70 max-w-xl mx-auto">
                Setiap kontribusi Anda membawa kami lebih dekat pada perubahan nyata.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white rounded-full"
                  onClick={() => navigate("campaigns")}
                >
                  Lihat Kampanye Aktif
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
          </Reveal>
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
              eyebrow="Kerja Kami"
              title="Lima Bidang Perjuangan Strategis"
              description="Kami memfokuskan energi pada isu-isu yang berdampak langsung pada kesejahteraan rakyat. Setiap bidang dirancang dengan program terukur dan target yang dapat dievaluasi."
            />
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {work.map((w, i) => {
              const Icon = workIcons[w.icon] || Building2;
              return (
                <Reveal key={w.id} delay={i * 0.08}>
                  <button
                    onClick={() => navigate("work", { workSlug: w.slug })}
                    className="group text-left w-full h-full"
                  >
                    <Card className="overflow-hidden h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={w.coverImage}
                          alt={w.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute top-4 left-4 h-12 w-12 rounded-xl bg-white/95 backdrop-blur flex items-center justify-center shadow-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="font-heading text-xl md:text-2xl font-bold text-white">
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
          </div>
        </div>
      </section>
    </div>
  );
}

