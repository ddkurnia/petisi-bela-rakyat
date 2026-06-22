"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pbr-pwa-install-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true) {
        setIsInstalled(true);
      }
    };
    checkInstalled();

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      try {
        const dismissed = localStorage.getItem(DISMISS_KEY);
        if (dismissed) {
          const dismissedTime = parseInt(dismissed, 10);
          if (Date.now() - dismissedTime < DISMISS_DURATION) return;
        }
      } catch {}

      const id = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(id);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      toast.success("Aplikasi berhasil dipasang!", {
        description: "Cari ikon Petisi Bela Rakyat di home screen Anda.",
      });
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      toast.info("Browser tidak mendukung install PWA otomatis", {
        description: "Gunakan menu browser → 'Add to Home Screen' / 'Pasang Aplikasi'.",
      });
      return;
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  }, []);

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {showBanner && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
          className="fixed bottom-20 right-4 left-4 sm:left-auto sm:right-4 sm:w-96 z-40"
        >
          <div className="glass border border-border/60 rounded-2xl shadow-2xl shadow-foreground/20 p-4 md:p-5 bg-background/90 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-sm">Pasang Aplikasi PBR</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Akses lebih cepat. Bekerja offline. Notifikasi kampanye terbaru.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={handleInstall} className="bg-primary hover:bg-primary/90 text-white rounded-full h-8 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Pasang Sekarang
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDismiss} className="rounded-full h-8 text-xs">
                    Nanti saja
                  </Button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                aria-label="Tutup"
                className="shrink-0 h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true) {
        setIsInstalled(true);
      }
    };
    checkInstalled();

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = useCallback(async () => {
    if (isInstalled) {
      toast.info("Aplikasi sudah terpasang", {
        description: "Cari ikon PBR di home screen Anda.",
      });
      return;
    }
    if (!deferredPrompt) {
      toast.info("Browser tidak mendukung install otomatis", {
        description: "Gunakan menu browser → 'Add to Home Screen' / 'Pasang Aplikasi'.",
        duration: 6000,
      });
      return;
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
      toast.success("Aplikasi berhasil dipasang!");
    }
    setDeferredPrompt(null);
  }, [deferredPrompt, isInstalled]);

  return { install, isInstalled, canInstall: !!deferredPrompt };
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        console.log("[PWA] Service Worker registered:", reg.scope);
      } catch (err) {
        console.warn("[PWA] SW registration failed:", err);
      }
    };
    register();
  }, []);
  return null;
}
