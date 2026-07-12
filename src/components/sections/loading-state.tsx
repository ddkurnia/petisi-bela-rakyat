"use client";

import { Loader2 } from "lucide-react";

// ============================================================
// LoadingState — reusable loading skeleton for detail pages
// ============================================================
// Shows a clean loading spinner instead of "not found" message
// while Firestore data is being fetched via onSnapshot.
// ============================================================
export function LoadingState({ message = "Memuat..." }: { message?: string }) {
  return (
    <div className="pt-32 pb-20 container-x">
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
