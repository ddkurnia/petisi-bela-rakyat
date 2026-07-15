"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================
// SplashScreen — shown on first page load
// ============================================================
// Shows animated PBR logo for ~1.5 seconds while page loads,
// then fades out smoothly.
// ============================================================

const LOGO_URL = "https://res.cloudinary.com/dwmoqe4kj/image/upload/w_200,h_200,c_fit,q_auto,f_png/v1784097288/1000130803-Photoroom_o6wqrc.png";
const STORAGE_KEY = 'pbr-splash-shown';

export function SplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show splash on first visit per session
    try {
      const shown = sessionStorage.getItem(STORAGE_KEY);
      if (shown) return;
      sessionStorage.setItem(STORAGE_KEY, '1');
      setShow(true);
    } catch {
      setShow(true);
    }

    // Hide after 1.5 seconds
    const timer = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          {/* Pulsing logo */}
          <motion.div
            animate={{
              scale: [0.85, 1.1, 0.95, 1.05, 1],
              opacity: [0.6, 1, 0.8, 1, 1],
            }}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
            }}
          >
            <img
              src={LOGO_URL}
              alt="Petisi Bela Rakyat"
              className="h-24 w-24 md:h-36 md:w-36 object-contain"
            />
          </motion.div>

          {/* Brand name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-4 text-center"
          >
            <h1 className="font-heading text-lg md:text-2xl font-extrabold tracking-tight">
              Petisi Bela Rakyat
            </h1>
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-xs text-muted-foreground mt-1"
            >
              Menyatukan Suara Rakyat Menjadi Perubahan
            </motion.p>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-1.5 mt-6"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
                className="h-2 w-2 rounded-full bg-primary"
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
