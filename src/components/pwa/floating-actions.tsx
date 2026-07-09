"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, PenLine, Share2, Smartphone, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { usePWAInstall } from "./install-prompt";
import { toast } from "sonner";

const FAB_OPEN_KEY = "pbr-fab-opened"; // not used, just for analytics

export function FloatingActions() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const settings = useStore((s) => s.settings);
  const { install, isInstalled } = usePWAInstall();

  // Close FAB on route change
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Hide on admin page
  if (pathname.startsWith("/admin")) return null;

  const handleShare = async () => {
    const shareData = {
      title: "Petisi Bela Rakyat",
      text: "Bersama membela rakyat, tanpa kompromi. Tandatangani petisi sekarang!",
      url: typeof window !== "undefined" ? window.location.href : (process.env.NEXT_PUBLIC_SITE_URL || "https://belarakyat.org"),
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link disalin ke clipboard");
      } catch {
        toast.info("Bagikan secara manual", {
          description: shareData.url,
        });
      }
    }
    setOpen(false);
  };

  const handleWhatsApp = () => {
    const whatsapp = settings?.contact?.whatsapp || "";
    const phone = whatsapp.replace(/[^0-9]/g, "");
    if (!phone) {
      toast.warning("Nomor WhatsApp belum di-set di pengaturan");
      return;
    }
    window.open(`https://wa.me/${phone}`, "_blank");
    setOpen(false);
  };

  const handleInstall = () => {
    install();
    setOpen(false);
  };

  const actions = [
    {
      label: "Tanda Tangani Petisi",
      icon: PenLine,
      href: "/kampanye",
      onClick: undefined,
      color: "bg-primary text-white",
    },
    {
      label: "Bagikan",
      icon: Share2,
      onClick: handleShare,
      color: "bg-blue-600 text-white",
    },
    {
      label: isInstalled ? "Buka Aplikasi" : "Pasang Aplikasi",
      icon: Smartphone,
      onClick: handleInstall,
      color: "bg-green-600 text-white",
    },
    {
      label: "Hubungi Kami",
      icon: Phone,
      onClick: handleWhatsApp,
      color: "bg-foreground text-background",
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2.5">
      <AnimatePresence>
        {open && (
          <>
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0, y: 20 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <span className="glass px-3 py-1.5 rounded-full text-xs font-medium shadow-md border border-border/60 bg-background/90 backdrop-blur">
                    {action.label}
                  </span>
                  {action.href ? (
                    <Link href={action.href}>
                      <button
                        aria-label={action.label}
                        className={`h-11 w-11 rounded-full ${action.color} shadow-lg flex items-center justify-center hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    </Link>
                  ) : (
                    <button
                      onClick={action.onClick}
                      aria-label={action.label}
                      className={`h-11 w-11 rounded-full ${action.color} shadow-lg flex items-center justify-center hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        aria-label={open ? "Tutup menu" : "Buka menu aksi cepat"}
        className="h-14 w-14 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-105 transition-transform relative"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full ring-2 ring-background animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
