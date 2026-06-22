"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Smartphone, QrCode, Apple, Chrome } from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { usePWAInstall } from "@/components/pwa/install-prompt";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/**
 * Simple inline QR code placeholder (visual only).
 * In production, replace with real QR code library or generated image.
 */
function QRCodePlaceholder() {
  return (
    <div className="relative aspect-square w-32 h-32 bg-white p-2 rounded-xl border-2 border-border">
      <div className="grid grid-cols-8 grid-rows-8 gap-0.5 h-full w-full">
        {Array.from({ length: 64 }).map((_, i) => {
          // Pseudo-random pattern for visual QR effect
          const filled = (i * 7 + 13) % 3 === 0 || (i % 9 === 0);
          const corner = (i < 3 || i % 8 < 3 || i >= 56 || i % 8 >= 5) && (i % 8 < 3 || i % 8 >= 5 || i < 24 || i >= 40);
          return (
            <div
              key={i}
              className={filled || corner ? "bg-foreground" : "bg-transparent"}
            />
          );
        })}
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white p-1 rounded">
          <img src="/pbr.png" alt="PBR" className="h-8 w-8 object-contain" />
        </div>
      </div>
    </div>
  );
}

export function DownloadAppSection() {
  const { install, isInstalled, canInstall } = usePWAInstall();
  const [showQRTooltip, setShowQRTooltip] = useState(false);

  const handleInstallPWA = () => install();

  const handleDownloadAPK = () => {
    // In production, link to real APK file or build pipeline
    toast.info("APK sedang disiapkan", {
      description: "Hubungi admin untuk mendapatkan file APK terbaru.",
    });
  };

  return (
    <section className="py-16 md:py-28 bg-foreground text-background relative overflow-hidden">
      <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="container-x relative">
        <SectionHeading
          eyebrow="Mobile App"
          title={<span className="text-white">Unduh Aplikasi Petisi Bela Rakyat</span>}
          description={
            <span className="text-white/70">
              Akses gerakan kapan saja, di mana saja. Pasang sebagai aplikasi native di HP Anda — bekerja offline, notifikasi real-time, dan pengalaman tanpa browser.
            </span>
          }
          dark
        />

        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Install PWA */}
          <Reveal delay={0}>
            <Card className="p-6 md:p-7 h-full bg-white/5 border-white/10 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
              <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mb-5">
                <Smartphone className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-heading text-lg md:text-xl font-bold text-white">
                Install PWA
              </h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                Pasang langsung dari browser. Tanpa download, tanpa install file. Bekerja seperti aplikasi native.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-white/60">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Offline support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> No app store needed
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Auto-update
                </li>
              </ul>
              <Button
                onClick={handleInstallPWA}
                disabled={isInstalled}
                className="mt-5 w-full bg-primary hover:bg-primary/90 text-white rounded-full"
              >
                {isInstalled ? (
                  <>
                    <Smartphone className="h-4 w-4 mr-2" />
                    Aplikasi Terpasang
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Pasang Sekarang
                  </>
                )}
              </Button>
              {!canInstall && !isInstalled && (
                <p className="text-[10px] text-white/40 mt-2 text-center">
                  Browser tidak mendukung install otomatis. Gunakan menu browser → Add to Home Screen.
                </p>
              )}
            </Card>
          </Reveal>

          {/* Download APK */}
          <Reveal delay={0.1}>
            <Card className="p-6 md:p-7 h-full bg-white/5 border-white/10 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
              <div className="h-14 w-14 rounded-2xl bg-green-600 flex items-center justify-center mb-5">
                <Download className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-heading text-lg md:text-xl font-bold text-white">
                Download APK
              </h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                File APK Android native. Install langsung di HP Android Anda tanpa Play Store.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-white/60">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Android 7+ (API 24)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> ~5 MB file size
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> TWA-based (lightweight)
                </li>
              </ul>
              <Button
                onClick={handleDownloadAPK}
                variant="outline"
                className="mt-5 w-full border-white/30 text-white hover:bg-white/10 bg-transparent rounded-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download APK
              </Button>
            </Card>
          </Reveal>

          {/* QR Code Install */}
          <Reveal delay={0.2}>
            <Card className="p-6 md:p-7 h-full bg-white/5 border-white/10 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
              <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center mb-5">
                <QrCode className="h-7 w-7 text-foreground" />
              </div>
              <h3 className="font-heading text-lg md:text-xl font-bold text-white">
                Scan QR Code
              </h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                Scan dengan kamera HP Anda untuk langsung membuka website dan install.
              </p>
              <div className="mt-5 flex flex-col items-center">
                <QRCodePlaceholder />
                <p className="text-[10px] text-white/50 mt-3 text-center">
                  Scan dengan kamera HP → buka link → Add to Home Screen
                </p>
              </div>
            </Card>
          </Reveal>
        </div>

        {/* Platform badges */}
        <Reveal delay={0.3}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Badge className="bg-white/10 text-white border-0 px-4 py-2">
              <Apple className="h-3.5 w-3.5 mr-1.5" />
              iOS Safari supported
            </Badge>
            <Badge className="bg-white/10 text-white border-0 px-4 py-2">
              <Chrome className="h-3.5 w-3.5 mr-1.5" />
              Chrome Android supported
            </Badge>
            <Badge className="bg-white/10 text-white border-0 px-4 py-2">
              <Smartphone className="h-3.5 w-3.5 mr-1.5" />
              Android 7+ (API 24)
            </Badge>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
