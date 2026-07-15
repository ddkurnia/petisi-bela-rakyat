"use client";

import { motion } from "framer-motion";

// ============================================================
// LogoSpinner — loading animation with PBR animated logo
// ============================================================
// Uses the animated logo from Cloudinary (optimized 200x200)
// Responsive: smaller on mobile, larger on desktop
// ============================================================

const LOGO_URL = "https://res.cloudinary.com/dwmoqe4kj/image/upload/w_200,h_200,c_fit,q_auto,f_png/v1784097288/1000130803-Photoroom_o6wqrc.png";

export function LogoSpinner({ message = "Memuat..." }: { message?: string }) {
  return (
    <div className="pt-24 md:pt-32 pb-20 container-x">
      <div className="flex flex-col items-center justify-center py-20">
        {/* Pulsing logo */}
        <motion.div
          animate={{
            scale: [0.9, 1.05, 0.9],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-5"
        >
          <img
            src={LOGO_URL}
            alt="Petisi Bela Rakyat"
            className="h-20 w-20 md:h-28 md:w-28 object-contain"
          />
        </motion.div>

        {/* Pulsing text */}
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-sm text-muted-foreground"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}
