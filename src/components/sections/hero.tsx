"use client";

import { motion } from "framer-motion";
import { ArrowRight, PenLine, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useNav } from "@/lib/nav";

export function Hero() {
  const settings = useStore((s) => s.settings);
  const { navigate } = useNav();
  const hero = settings.homepage.hero;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={hero.image}
          alt="Petisi Bela Rakyat — Suara Rakyat"
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Animated accent shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.2 }}
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-red-900/40 blur-3xl"
        />
      </div>

      <div className="container-x relative z-10 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/90 text-xs md:text-sm font-medium mb-6"
          >
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Gerakan Masyarakat Sipil Independen
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight"
          >
            {hero.headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl"
          >
            {hero.subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-2xl shadow-primary/40 h-12 px-7"
              onClick={() => navigate("campaigns")}
            >
              <PenLine className="h-5 w-5 mr-2" />
              {hero.primaryCta}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/5 border-white/30 text-white hover:bg-white/15 backdrop-blur rounded-full h-12 px-7"
              onClick={() => navigate("about", { aboutSection: "sejarah" })}
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              {hero.secondaryCta}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>

          {/* Quick stats inline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl"
          >
            {settings.homepage.stats.map((stat, i) => (
              <div key={i} className="border-l-2 border-primary/60 pl-3">
                <div className="font-heading text-2xl md:text-3xl font-bold text-white">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-white/70 text-xs md:text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/60"
      >
        <span className="text-[10px] uppercase tracking-widest mb-2">Scroll</span>
        <div className="h-10 w-6 rounded-full border border-white/30 flex items-start justify-center p-1">
          <motion.span
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="h-1.5 w-1.5 rounded-full bg-white"
          />
        </div>
      </motion.div>
    </section>
  );
}

