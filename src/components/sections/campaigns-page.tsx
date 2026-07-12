"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin, Calendar, Share2, CheckCircle2, Megaphone, Users } from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore } from "@/lib/store";
import { PetitionSignForm } from "./petition-sign-form";
import { T } from "@/lib/i18n/use-translated-text";
import { LoadingState } from "./loading-state";
import { useNav } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShareButtons } from "@/components/share-buttons";
import { formatDate } from "@/lib/store";

const statusMap = {
  active: { label: "Aktif", variant: "bg-primary text-white" },
  won: { label: "Berhasil", variant: "bg-green-600 text-white" },
  lost: { label: "Belum Tercapai", variant: "bg-orange-600 text-white" },
  planned: { label: "Direncanakan", variant: "bg-blue-600 text-white" },
};

export function CampaignsPage() {
  const { navigate, campaignSlug } = useNav();
  const campaigns = useStore((s) => s.campaigns);
  const campaignsLoaded = useStore((s) => s.loaded.campaigns);
  const incrementCampaignShare = useStore((s) => s.incrementCampaignShare);
  const [filter, setFilter] = useState<string>("all");

  // Detail view
  if (campaignSlug) {
    const c = campaigns.find((x) => x.slug === campaignSlug);
    // Show loading while Firestore data hasn't arrived yet
    if (!c && !campaignsLoaded) {
      return <LoadingState />;
    }
    // Data loaded but campaign not found → genuinely not found
    if (!c) {
      return (
        <div className="pt-32 container-x">
          <p>Kampanye tidak ditemukan.</p>
          <Button onClick={() => navigate("campaigns")} className="mt-4">Kembali</Button>
        </div>
      );
    }
    const status = statusMap[c.status];
    const related = campaigns.filter((x) => x.slug !== campaignSlug).slice(0, 2);

    return (
      <div className="pt-24 md:pt-32 pb-20">
        <div className="container-x">
          <Button
            variant="ghost"
            className="mb-6 -ml-2 rounded-full"
            onClick={() => navigate("campaigns")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke Kampanye
          </Button>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <Reveal>
                <Badge className={`${status.variant} border-0 mb-4`}>{status.label}</Badge>
                <h1 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  <T>{c.title}</T>
                </h1>
                <p className="mt-3 text-sm md:text-base text-muted-foreground flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {c.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Dimulai {formatDate(c.startedAt)}
                  </span>
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mt-6 relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={c.coverImage}
                    alt={c.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Reveal>

              {/* Petition signature form — DI BAWAH FOTO, full width, paling terlihat */}
              <Reveal delay={0.15}>
                <div className="mt-8">
                  <PetitionSignForm
                    campaignId={c.id}
                    campaignTitle={c.title}
                    goal={c.goal}
                  />
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="mt-8">
                  <h2 className="font-heading text-2xl font-bold mb-3">Tentang Kampanye</h2>
                  <div className="prose-pbr max-w-none">
                    <p className="text-base md:text-lg text-foreground/80 leading-relaxed">
                      <T>{c.description}</T>
                    </p>
                    <h3>Mengapa Ini Penting</h3>
                    <p>
                      Kampanye ini lahir dari aspirasi nyata masyarakat yang terdampak langsung. Setiap tanda tangan yang terkumpul memperkuat posisi tawar rakyat dalam negosiasi dengan pihak berwenang.
                    </p>
                    <h3>Tuntutan Kami</h3>
                    <ul>
                      <li>Percepatan pelaksanaan pembangunan</li>
                      <li>Transparansi anggaran publik</li>
                      <li>Keterlibatan masyarakat dalam pengawasan</li>
                      <li>Timeline yang jelas dan dapat diukur</li>
                    </ul>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Sidebar — info + share (sticky di desktop) */}
            <div className="lg:col-span-1">
              <Reveal delay={0.15}>
                <div className="lg:sticky lg:top-28 space-y-4">
                  <Card className="p-6 md:p-7 border-0 shadow-xl shadow-foreground/5">
                    {/* Big share button - Sebarkan Petisi */}
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                      <p className="text-xs font-bold text-center mb-3 text-primary uppercase tracking-wide">
                        📢 Sebarkan Petisi Ini
                      </p>
                      <ShareButtons
                        title={c.title}
                        description={c.description}
                        variant="full"
                        onShare={() => incrementCampaignShare(c.id)}
                      />
                    </div>
                    <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-semibold">{status.label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Lokasi</span>
                        <span className="font-semibold text-right">{c.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Dimulai</span>
                        <span className="font-semibold">{formatDate(c.startedAt)}</span>
                      </div>
                    </div>
                  </Card>

                  <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-foreground/80">
                      <strong className="block mb-0.5">Transparan & Aman</strong>
                      Identitas Anda dilindungi. Setiap tanda tangan diverifikasi.
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-20 pt-12 border-t border-border">
              <SectionHeading eyebrow="Lanjutkan" title="Kampanye Lainnya" align="left" />
              <div className="mt-8 grid md:grid-cols-2 gap-6">
                {related.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => navigate("campaigns", { campaignSlug: r.slug })}
                    className="group text-left"
                  >
                    <Card className="overflow-hidden h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-xl hover:-translate-y-1 transition-all">
                      <div className="grid sm:grid-cols-2">
                        <div className="aspect-video sm:aspect-auto overflow-hidden">
                          <img src={r.coverImage} alt={r.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="p-5">
                          <Badge className="bg-primary/10 text-primary border-0 mb-2">{r.status}</Badge>
                          <h3 className="font-heading font-bold leading-tight line-clamp-2"><T>{r.title}</T></h3>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2"><T>{r.description}</T></p>
                        </div>
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

  // List
  const filtered = filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter);

  return (
    <div className="pt-24 md:pt-32 pb-20">
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="Kampanye"
              title="Bergabung dalam Perjuangan"
              description="Setiap petisi adalah kesempatan untuk menjadi bagian dari perubahan. Pilih kampanye yang berarti untuk Anda."
            />
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-x">
          {/* Filter */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {["all", "active", "won", "planned"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-primary text-white"
                    : "bg-secondary text-foreground hover:bg-secondary/70"
                }`}
              >
                {f === "all" ? "Semua" : statusMap[f as keyof typeof statusMap]?.label || f}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((c, i) => {
              const pct = Math.min(100, Math.round((c.supporters / c.goal) * 100));
              const status = statusMap[c.status];
              return (
                <Reveal key={c.id} delay={i * 0.08}>
                  <button
                    onClick={() => navigate("campaigns", { campaignSlug: c.slug })}
                    className="group text-left w-full h-full"
                  >
                    <Card className="overflow-hidden h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={c.coverImage}
                          alt={c.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <Badge className={`absolute top-4 left-4 ${status.variant} border-0`}>
                          {status.label}
                        </Badge>
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center gap-2 text-white/80 text-xs mb-2">
                            <MapPin className="h-3.5 w-3.5" />
                            {c.location}
                          </div>
                          <h3 className="font-heading text-xl md:text-2xl font-bold text-white leading-tight">
                            <T>{c.title}</T>
                          </h3>
                        </div>
                      </div>
                      <div className="p-5 md:p-6">
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          <T>{c.description}</T>
                        </p>
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {c.supporters.toLocaleString("id-ID")} pendukung
                            </span>
                            <span>Target: {c.goal.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${pct}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-primary to-red-400 rounded-full"
                            />
                          </div>
                        </div>
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
