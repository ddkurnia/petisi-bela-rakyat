"use client";

import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { PWAInstallPrompt } from "@/components/pwa/install-prompt";
import { FloatingActions } from "@/components/pwa/floating-actions";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <PWAInstallPrompt />
      <FloatingActions />
    </div>
  );
}
