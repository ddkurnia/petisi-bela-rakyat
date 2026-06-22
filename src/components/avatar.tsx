"use client";

import { getInitials } from "@/lib/store";

interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  className?: string;
  shape?: "circle" | "rounded";
}

/**
 * Avatar component with initials fallback when photo is empty.
 * Used for pengurus, penasehat, relawan, supporters.
 */
export function Avatar({ src, name, size = 96, className = "", shape = "rounded" }: AvatarProps) {
  const initials = getInitials(name) || "?";
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";

  if (src && src.trim()) {
    return (
      <img
        src={src}
        alt={name}
        className={`${shapeClass} object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Initials placeholder with gradient background
  return (
    <div
      className={`${shapeClass} bg-gradient-to-br from-primary to-red-700 text-white flex items-center justify-center font-heading font-bold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      aria-label={`Avatar ${name}`}
    >
      {initials}
    </div>
  );
}
