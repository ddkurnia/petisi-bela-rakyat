"use client";

import { motion } from "framer-motion";
import { Crown, User, Briefcase, Scale, Megaphone, Camera, Building2, Users, BarChart3, Wallet, ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore, type OrgNode, type Pengurus } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const positionIcons: Record<string, React.ElementType> = {
  ketua: Crown,
  wakil_ketua: User,
  sekretaris: Briefcase,
  bidang_hukum: Scale,
  bidang_advokasi: Megaphone,
  bidang_media: Camera,
  bidang_hubungan_pemerintah: Building2,
  bidang_penggalangan_dukungan: Users,
  bidang_riset_data: BarChart3,
  bidang_keuangan: Wallet,
};

export function StrukturOrganisasiPage() {
  const { navigate } = useNav();
  const orgStructure = useStore((s) => s.orgStructure);
  const pengurus = useStore((s) => s.pengurus);

  const getPengurusByPosition = (key: string): Pengurus | undefined =>
    pengurus.find((p) => p.jabatanKey === key && p.status === "active");

  const levels = [...new Set(orgStructure.map((n) => n.level))].sort();
  const ketua = orgStructure.find((n) => n.level === 0);
  const level1 = orgStructure.filter((n) => n.level === 1);
  const level2 = orgStructure.filter((n) => n.level === 2);

  const renderNode = (node: OrgNode) => {
    const person = getPengurusByPosition(node.key);
    const Icon = positionIcons[node.key] || Briefcase;
    return (
      <button
        key={node.key}
        onClick={() => person && navigate("pengurus", { pengurusSlug: person.slug })}
        className="group relative flex flex-col items-center text-center"
      >
        <div className="relative">
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 group-hover:border-primary group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300 flex items-center justify-center overflow-hidden">
            {person?.photo ? (
              <img src={person.photo} alt={person.name} className="h-full w-full object-cover" />
            ) : (
              <Icon className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2 max-w-[160px]">
          <div className="font-heading text-xs font-bold uppercase tracking-wide text-primary">
            {node.label}
          </div>
          {person && (
            <>
              <div className="text-sm font-bold mt-1 line-clamp-1">{person.name}</div>
              <div className="text-[10px] text-muted-foreground line-clamp-1">{person.gelar}</div>
            </>
          )}
          {!person && (
            <div className="text-xs text-muted-foreground italic mt-1">Belum diisi</div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="pt-24 md:pt-32 pb-20">
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="Tentang Kami"
              title="Struktur Organisasi"
              description="Susunan kepengurusan Petisi Bela Rakyat yang menjalankan operasional organisasi dengan tanggung jawab masing-masing bidang."
            />
          </Reveal>
        </div>
      </section>

      {/* Org Chart */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <Card className="p-6 md:p-12 border-0 shadow-xl shadow-foreground/5 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[800px] flex flex-col items-center gap-10 md:gap-12">
                {/* Level 0: Ketua */}
                {ketua && (
                  <Reveal>
                    <div className="flex flex-col items-center">
                      {renderNode(ketua)}
                    </div>
                  </Reveal>
                )}

                {/* Connector */}
                {ketua && level1.length > 0 && (
                  <div className="h-12 w-px bg-border" />
                )}

                {/* Level 1: Wakil & Sekretaris */}
                {level1.length > 0 && (
                  <Reveal delay={0.1}>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                      {level1.sort((a, b) => a.order - b.order).map(renderNode)}
                    </div>
                  </Reveal>
                )}

                {/* Connector */}
                {level1.length > 0 && level2.length > 0 && (
                  <div className="h-12 w-px bg-border" />
                )}

                {/* Level 2: Bidang-bidang */}
                {level2.length > 0 && (
                  <Reveal delay={0.2}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10">
                      {level2.sort((a, b) => a.order - b.order).map(renderNode)}
                    </div>
                  </Reveal>
                )}
              </div>
            </div>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Klik pada setiap posisi untuk melihat detail profil pengurus.
          </p>
        </div>
      </section>

      {/* Job descriptions */}
      <section className="py-12 md:py-20 bg-secondary/40">
        <div className="container-x">
          <SectionHeading
            eyebrow="Tugas & Fungsi"
            title="Tanggung Jawab Setiap Bidang"
            description="Setiap bidang memiliki peran spesifik dalam menjalankan misi organisasi."
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {orgStructure.map((node, i) => {
              const Icon = positionIcons[node.key] || Briefcase;
              const person = getPengurusByPosition(node.key);
              return (
                <Reveal key={node.key} delay={i * 0.05}>
                  <Card className="p-6 h-full bg-card border-0 shadow-lg shadow-foreground/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-sm">{node.label}</h3>
                        {person && (
                          <p className="text-xs text-muted-foreground">{person.name}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {getJobDescription(node.key)}
                    </p>
                    {person && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 -ml-2 text-primary"
                        onClick={() => navigate("pengurus", { pengurusSlug: person.slug })}
                      >
                        Lihat Profil →
                      </Button>
                    )}
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function getJobDescription(key: string): string {
  const map: Record<string, string> = {
    ketua: "Memimpin organisasi secara keseluruhan, mengarahkan strategi, dan menjadi representasi organisasi di hadapan publik dan stakeholder.",
    wakil_ketua: "Mendampingi ketua dalam pengambilan keputusan strategis dan menggantikan ketua saat berhalangan.",
    sekretaris: "Mengelola administrasi, dokumentasi, dan koordinasi antar bidang untuk memastikan operasional berjalan lancar.",
    bidang_hukum: "Memberikan pendampingan hukum gratis, mengawal kasus advokasi, dan memastikan setiap aksi organisasi selaras dengan hukum.",
    bidang_advokasi: "Merancang dan mengeksekusi kampanye advokasi, mengelola relawan lapangan, dan menjembatani suara rakyat dengan pemerintah.",
    bidang_media: "Mengelola strategi komunikasi, konten digital, press release, dan hubungan dengan media massa.",
    bidang_hubungan_pemerintah: "Membangun komunikasi strategis dengan institusi pemerintah, DPRD, dan lembaga negara lain.",
    bidang_penggalangan_dukungan: "Mengelola rekrutmen relawan, kampanye crowdfunding, dan kemitraan dengan donatur.",
    bidang_riset_data: "Melakukan riset lapangan, analisis data, dan menyusun policy brief sebagai dasar advokasi berbasis bukti.",
    bidang_keuangan: "Mengelola keuangan organisasi, memastikan transparansi, dan menyusun laporan keuangan berkala.",
  };
  return map[key] || "Menjalankan tugas dan fungsi sesuai bidang masing-masing untuk mencapai misi organisasi.";
}
