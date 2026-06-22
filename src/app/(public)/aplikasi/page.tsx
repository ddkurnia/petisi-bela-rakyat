"use client";

import { DownloadAppSection } from "@/components/sections/download-app-section";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal } from "@/components/animation";
import { Smartphone, Wifi, Bell, Shield, Zap, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  { icon: Wifi, title: "Mode Offline", desc: "Akses konten utama tanpa koneksi internet. Service worker cache halaman penting." },
  { icon: Bell, title: "Notifikasi Real-time", desc: "Dapatkan update kampanye terbaru dan pengingat aksi langsung di HP Anda." },
  { icon: Zap, title: "Cepat & Ringan", desc: "PWA lebih ringan dari app native. Loading instan setelah install." },
  { icon: Shield, title: "Aman & Privat", desc: "Tidak perlu download dari sumber tidak dikenal. Langsung dari browser resmi." },
  { icon: Heart, title: "Pengalaman Native", desc: "Tampil seperti aplikasi native — fullscreen, ikon sendiri, tanpa address bar." },
  { icon: Smartphone, title: "Cross-Platform", desc: "Bekerja di Android, iOS, dan desktop. Satu kodebase, semua platform." },
];

export default function AppDownloadPage() {
  return (
    <div className="pt-24 md:pt-32">
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="Mobile App"
              title="Unduh Aplikasi Petisi Bela Rakyat"
              description="Akses gerakan kapan saja, di mana saja. Pasang sebagai aplikasi native di HP Anda — bekerja offline, notifikasi real-time, dan pengalaman tanpa browser."
            />
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container-x">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 0.08}>
                  <Card className="p-6 h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg font-bold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Download options */}
      <DownloadAppSection />
    </div>
  );
}
