"use client";

import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { PWAInstallPrompt } from "@/components/pwa/install-prompt";
import { FloatingActions } from "@/components/pwa/floating-actions";
import { NavProvider } from "@/lib/nav";
import { useVisitorTracker } from "@/hooks/use-visitor-tracker";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Track visitor on first page load (once per session)
  useVisitorTracker();

  return (
    <NavProvider>
      <div className="min-h-screen flex flex-col bg-background pbr-public">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <PWAInstallPrompt />
        <FloatingActions />
      </div>
    </NavProvider>
  );
}
