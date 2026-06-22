"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  dark = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  dark?: boolean;
}) {
  return (
    <div
      className={`max-w-3xl ${
        align === "center" ? "mx-auto text-center" : "text-left"
      }`}
    >
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`inline-flex items-center gap-2 mb-3 ${
            align === "center" ? "justify-center" : ""
          }`}
        >
          <span className="h-px w-8 bg-primary" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </span>
          <span className="h-px w-8 bg-primary" />
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight ${
          dark ? "text-white" : "text-foreground"
        }`}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`mt-4 text-base md:text-lg leading-relaxed ${
            dark ? "text-white/75" : "text-muted-foreground"
          }`}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
