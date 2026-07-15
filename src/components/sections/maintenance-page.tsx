"use client";

import { motion } from "framer-motion";
import { Wrench, Clock } from "lucide-react";

const LOGO_URL = "https://res.cloudinary.com/dwmoqe4kj/image/upload/w_200,h_200,c_fit,q_auto,f_png/v1784097288/1000130803-Photoroom_o6wqrc.png";

export function MaintenancePage({
  title,
  message,
  estimatedTime,
}: {
  title: string;
  message: string;
  estimatedTime?: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-foreground via-foreground/95 to-primary/20 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      {/* Animated logo */}
      <motion.div
        animate={{
          scale: [0.85, 1.1, 0.95, 1.05, 1],
          opacity: [0.6, 1, 0.8, 1, 1],
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="relative z-10 mb-8"
      >
        <img src={LOGO_URL} alt="Petisi Bela Rakyat" className="h-24 w-24 md:h-36 md:w-36 object-contain" />
      </motion.div>

      {/* Wrench animation */}
      <motion.div
        animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 mb-6"
      >
        <Wrench className="h-10 w-10 md:h-12 md:w-12 text-primary" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 font-heading text-2xl md:text-4xl font-extrabold text-white text-center mb-4 px-4"
      >
        {title || "Sedang Pemeliharaan"}
      </motion.h1>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 text-sm md:text-base text-white/70 max-w-lg text-center leading-relaxed mb-6 px-4"
      >
        {message || "Website sedang dalam pemeliharaan."}
      </motion.p>

      {/* Estimated time */}
      {estimatedTime && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-sm mb-8"
        >
          <Clock className="h-4 w-4 text-primary" />
          Estimasi selesai: <strong className="font-heading">{estimatedTime}</strong>
        </motion.div>
      )}

      {/* Brand name */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="relative z-10 mt-4"
      >
        <p className="text-xs text-white/50 font-medium tracking-wider">
          PETISI BELA RAKYAT
        </p>
        <p className="text-[10px] text-white/30 mt-1">
          Menyatukan Suara Rakyat Menjadi Perubahan
        </p>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 flex gap-2 mt-8"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            className="h-2.5 w-2.5 rounded-full bg-primary"
          />
        ))}
      </motion.div>
    </div>
  );
}
