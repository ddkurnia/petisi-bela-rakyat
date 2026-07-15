"use client";

import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { PWAInstallPrompt } from "@/components/pwa/install-prompt";
import { FloatingActions } from "@/components/pwa/floating-actions";
import { CookieConsent } from "@/components/site/cookie-consent";
import { MaintenancePage } from "@/components/sections/maintenance-page";
import { NavProvider } from "@/lib/nav";
import { useVisitorTracker } from "@/hooks/use-visitor-tracker";
import { useStore } from "@/lib/store";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Track visitor on first page load (once per session)
  useVisitorTracker();

  const settings = useStore((s) => s.settings);
  const currentUser = useStore((s) => s.currentUser);
  const maintenance = settings?.maintenance;

  // Check if maintenance mode is active
  const isMaintenance = maintenance?.enabled === true;
  // If allowAdminAccess is true and user is logged in admin, bypass maintenance
  const bypassMaintenance = maintenance?.allowAdminAccess && currentUser !== null;

  if (isMaintenance && !bypassMaintenance) {
    return (
      <MaintenancePage
        title={maintenance?.title || "Sedang Pemeliharaan"}
        message={maintenance?.message || "Website sedang dalam pemeliharaan."}
        estimatedTime={maintenance?.estimatedTime}
      />
    );
  }

  return (
    <NavProvider>
      <div className="min-h-screen flex flex-col bg-background pbr-public">
        {/* Show maintenance banner if admin is viewing during maintenance */}
        {isMaintenance && bypassMaintenance && (
          <div className="bg-amber-500 text-white text-center py-2 px-4 text-xs font-medium sticky top-0 z-50">
            🔧 Mode Pemeliharaan AKTIF — Anda melihat preview sebagai admin. Publik melihat halaman maintenance.
          </div>
        )}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <PWAInstallPrompt />
        <FloatingActions />
        <CookieConsent />
      </div>
    </NavProvider>
  );
}
