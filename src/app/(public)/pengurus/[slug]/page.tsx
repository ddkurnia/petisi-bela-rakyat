"use client";

import { PengurusPage } from "@/components/sections/pengurus-page";

export default function PengurusDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Slug is read by useNav() from pathname, so we just render the page
  return <PengurusPage />;
}
