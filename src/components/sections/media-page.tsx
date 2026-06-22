"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Video, FileText, Play, Download, Filter } from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/store";

const typeFilters = [
  { id: "all", label: "Semua", icon: Filter },
  { id: "photo", label: "Foto", icon: ImageIcon },
  { id: "video", label: "Video", icon: Video },
  { id: "document", label: "Dokumen", icon: FileText },
];

export function MediaPage() {
  const { navigate } = useNav();
  const gallery = useStore((s) => s.gallery);
  const supporters = useStore((s) => s.supporters);
  const [type, setType] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (type === "all") return gallery;
    return gallery.filter((g) => g.type === type);
  }, [gallery, type]);

  const selectedItem = gallery.find((g) => g.id === selected);

  return (
    <div className="pt-24 md:pt-32 pb-20">
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="Media Center"
              title="Galeri & Dokumentasi"
              description="Foto, video, dan dokumen resmi dari setiap aktivitas dan kampanye kami."
            />
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-x">
          {/* Filter */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {typeFilters.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setType(f.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    type === f.id
                      ? "bg-primary text-white"
                      : "bg-secondary text-foreground hover:bg-secondary/70"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((g, i) => (
              <Reveal key={g.id} delay={i * 0.05}>
                <button
                  onClick={() => g.type === "document" ? window.open(g.url, "_blank") : setSelected(g.id)}
                  className="group text-left w-full"
                >
                  <Card className="overflow-hidden border-0 shadow-lg shadow-foreground/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={g.thumbnail} alt={g.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {g.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                            <Play className="h-6 w-6 text-primary ml-1" fill="currentColor" />
                          </div>
                        </div>
                      )}
                      {g.type === "document" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/40">
                          <FileText className="h-12 w-12 text-white" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-primary text-white border-0 capitalize">
                        {g.type === "photo" ? "Foto" : g.type === "video" ? "Video" : "Dokumen"}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading font-bold text-sm line-clamp-1">{g.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{g.description}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(g.uploadedAt)}</span>
                        {g.type === "document" && (
                          <span className="inline-flex items-center gap-1 text-primary font-semibold">
                            <Download className="h-3 w-3" /> Unduh
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Dukungan Tokoh */}
      <section className="py-16 md:py-24 bg-secondary/40">
        <div className="container-x">
          <SectionHeading
            eyebrow="Dukungan Tokoh"
            title="Suara yang Mempercayai Kami"
            description="Para tokoh dari berbagai latar belakang memberikan dukungan mereka pada perjuangan ini."
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {supporters.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.08}>
                <Card className="p-6 md:p-7 h-full bg-card border-0 shadow-lg shadow-foreground/5 hover:shadow-xl hover:-translate-y-1 transition-all">
                  <svg className="h-8 w-8 text-primary/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.17 7C5.42 7 4 8.42 4 10.17v2.66C4 14.58 5.42 16 7.17 16h.83v-7H7.17zM16 7c-1.75 0-3.17 1.42-3.17 3.17v2.66c0 1.75 1.42 3.17 3.17 3.17h.83V7H16zM10 10v6h4v-6h-4z" />
                  </svg>
                  <p className="text-sm md:text-base text-foreground/80 italic leading-relaxed">
                    &ldquo;{s.statement}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center gap-3 pt-5 border-t border-border">
                    <img src={s.photo} alt={s.name} className="h-11 w-11 rounded-full object-cover" />
                    <div>
                      <div className="font-heading font-bold text-sm">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.position}</div>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-5 right-5 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
            onClick={() => setSelected(null)}
          >
            ✕
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {selectedItem.type === "video" ? (
              <div className="aspect-video">
                <iframe src={selectedItem.url} className="w-full h-full rounded-2xl" allowFullScreen />
              </div>
            ) : (
              <img src={selectedItem.url} alt={selectedItem.title} className="w-full h-auto rounded-2xl" />
            )}
            <div className="mt-4 text-white">
              <h3 className="font-heading text-xl font-bold">{selectedItem.title}</h3>
              <p className="text-white/70 text-sm mt-1">{selectedItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
