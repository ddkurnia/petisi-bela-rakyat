"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

// ============================================================
// TypographyApplier — apply typography settings via CSS variables
// ============================================================
// Reads typography settings from store and applies them as CSS
// custom properties on :root. This makes ALL components update
// instantly when admin changes typography settings.
//
// CSS variables:
//   --pbr-body-font-size
//   --pbr-body-font-weight
//   --pbr-body-line-height
//   --pbr-heading-scale
//   --pbr-heading-font-weight
//   --pbr-article-font-size
//   --pbr-article-font-weight
//   --pbr-article-line-height
//   --pbr-card-title-weight
//   --pbr-card-text-size
// ============================================================
export function TypographyApplier() {
  const typography = useStore((s) => s.settings?.typography);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (!typography) {
      // Reset to defaults
      root.style.removeProperty('--pbr-body-font-size');
      root.style.removeProperty('--pbr-body-font-weight');
      root.style.removeProperty('--pbr-body-line-height');
      root.style.removeProperty('--pbr-heading-scale');
      root.style.removeProperty('--pbr-heading-font-weight');
      root.style.removeProperty('--pbr-article-font-size');
      root.style.removeProperty('--pbr-article-font-weight');
      root.style.removeProperty('--pbr-article-line-height');
      root.style.removeProperty('--pbr-card-title-weight');
      root.style.removeProperty('--pbr-card-text-size');
      return;
    }

    root.style.setProperty('--pbr-body-font-size', `${typography.bodyFontSize}px`);
    root.style.setProperty('--pbr-body-font-weight', String(typography.bodyFontWeight));
    root.style.setProperty('--pbr-body-line-height', String(typography.bodyLineHeight));
    root.style.setProperty('--pbr-heading-scale', String(typography.headingFontSize));
    root.style.setProperty('--pbr-heading-font-weight', String(typography.headingFontWeight));
    root.style.setProperty('--pbr-article-font-size', `${typography.articleFontSize}px`);
    root.style.setProperty('--pbr-article-font-weight', String(typography.articleFontWeight));
    root.style.setProperty('--pbr-article-line-height', String(typography.articleLineHeight));
    root.style.setProperty('--pbr-card-title-weight', String(typography.cardTitleWeight));
    root.style.setProperty('--pbr-card-text-size', `${typography.cardTextSize}px`);
  }, [typography]);

  return null;
}
