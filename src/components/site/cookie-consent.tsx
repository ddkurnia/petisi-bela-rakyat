"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const STORAGE_KEY = 'pbr-cookie-consent';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        setTimeout(() => setShow(true), 2000);
      }
    } catch {
      setShow(true);
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, 'accepted'); } catch {}
    setShow(false);
  };

  const reject = () => {
    try { localStorage.setItem(STORAGE_KEY, 'rejected'); } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4">
      <div className="container-x max-w-4xl mx-auto">
        <div className="bg-foreground text-background rounded-2xl shadow-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start gap-4 border border-white/10">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Cookie className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed text-background/85">
              Kami menggunakan cookie untuk meningkatkan pengalaman Anda. Dengan melanjutkan, Anda menyetujui{" "}
              <Link href="/kebijakan-privasi" className="text-primary underline hover:no-underline">Kebijakan Privasi</Link> kami.
            </p>
          </div>
          <div className="flex gap-2 shrink-0 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="rounded-full border-white/20 text-background hover:bg-white/10 w-full sm:w-auto" onClick={reject}>
              Tolak
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-full w-full sm:w-auto" onClick={accept}>
              Setuju
            </Button>
          </div>
          <button onClick={reject} className="absolute top-3 right-3 text-background/50 hover:text-background sm:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
