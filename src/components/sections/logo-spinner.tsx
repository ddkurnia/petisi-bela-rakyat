"use client";

import { motion } from "framer-motion";

// ============================================================
// LogoSpinner — loading animation with PBR logo
// ============================================================
// Used for all loading states (detail pages, etc.)
// Size: responsive (smaller on mobile, larger on desktop)
// ============================================================

export function LogoSpinner({ message = "Memuat..." }: { message?: string }) {
  return (
    <div className="pt-24 md:pt-32 pb-20 container-x">
      <div className="flex flex-col items-center justify-center py-20">
        {/* Spinning ring with logo in center */}
        <div className="relative h-20 w-20 md:h-28 md:w-28 mb-5">
          {/* Rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
          />
          {/* PBR Logo in center (static, not rotating) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/pbr.png"
              alt="Petisi Bela Rakyat"
              className="h-10 w-10 md:h-14 md:w-14 object-contain"
            />
          </div>
        </div>
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
