"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FileText, Newspaper, Megaphone, ImageIcon,
  Wallet, Settings, LogOut, Menu, X, Lock, Mail, Plus, Pencil, Trash2,
  Save, BarChart3, HeartHandshake, ExternalLink, Crown, Building2,
  ShieldCheck, Briefcase, UserCog, Smartphone,
} from "lucide-react";
import { useStore, canAccess, type Role } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ImageUpload, MultiImageUpload } from "./image-upload";
import { AdminDashboard } from "./sections/dashboard";
import { HomepageManager } from "./sections/homepage-manager";
import { PengurusManager } from "./sections/pengurus-manager";
import { PenasehatManager } from "./sections/penasehat-manager";
import { RelawanManager } from "./sections/relawan-manager";
import { BlogManager } from "./sections/blog-manager";
import { NewsManager } from "./sections/news-manager";
import { CampaignManager } from "./sections/campaign-manager";
import { SupporterManager } from "./sections/supporter-manager";
import { MediaManager } from "./sections/media-manager";
import { TransparencyManager } from "./sections/transparency-manager";
import { SettingsManager } from "./sections/settings-manager";
import { MobileAppManager } from "./sections/mobile-app-manager";

export type AdminSection =
  | "dashboard" | "homepage" | "pengurus" | "penasehat" | "relawan"
  | "blog" | "news" | "campaigns" | "supporters" | "media"
  | "transparency" | "settings" | "mobileapp";

const menuItems: { id: AdminSection; label: string; icon: React.ElementType; roles: Role[] }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "admin", "editor"] },
  { id: "homepage", label: "Kelola Homepage", icon: Settings, roles: ["super_admin", "admin"] },
  { id: "pengurus", label: "Kelola Tim", icon: Users, roles: ["super_admin", "admin"] },
  { id: "penasehat", label: "Penasihat", icon: Crown, roles: ["super_admin", "admin"] },
  { id: "relawan", label: "Kelola Relawan", icon: HeartHandshake, roles: ["super_admin", "admin"] },
  { id: "blog", label: "Kelola Blog", icon: FileText, roles: ["super_admin", "admin", "editor"] },
  { id: "news", label: "Kelola News", icon: Newspaper, roles: ["super_admin", "admin", "editor"] },
  { id: "campaigns", label: "Kelola Kampanye", icon: Megaphone, roles: ["super_admin", "admin"] },
  { id: "supporters", label: "Dukungan Tokoh", icon: UserCog, roles: ["super_admin", "admin"] },
  { id: "media", label: "Kelola Media", icon: ImageIcon, roles: ["super_admin", "admin"] },
  { id: "transparency", label: "Kelola Transparansi", icon: Wallet, roles: ["super_admin", "admin"] },
  { id: "mobileapp", label: "Mobile App", icon: Smartphone, roles: ["super_admin", "admin"] },
  { id: "settings", label: "Pengaturan Situs", icon: ShieldCheck, roles: ["super_admin"] },
];

export function AdminPanel() {
  const router = useRouter();
  const { currentUser, login, logout } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginDebug, setLoginDebug] = useState<string>("");

  // Debug log — shows what AdminPanel sees on every render
  console.log('%c[PBR-ADMIN AdminPanel render]', 'color:#16a34a;font-weight:bold', {
    hasCurrentUser: !!currentUser,
    uid: currentUser?.uid ?? 'null',
    role: currentUser?.role ?? 'null',
    email: currentUser?.email ?? 'null',
  });

  // Login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-foreground via-background to-secondary/40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 md:p-10 border-0 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-red-700 mb-4 shadow-xl shadow-primary/30">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h1 className="font-heading text-2xl font-extrabold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground mt-1">Petisi Bela Rakyat</p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoginDebug("⏳ Login in progress...");
                const t0 = Date.now();
                const result = await login(email, password);
                const elapsed = Date.now() - t0;
                if (result.ok) {
                  setTimeout(() => {
                    const storeState = (window as any).__pbr_storeState;
                    const role = storeState?.currentUser?.role || result.role || 'unknown';
                    if (role === 'editor') {
                      // Editor role — could be legitimate OR error fallback
                      const errorMsg = result.error || 'Tidak diketahui';
                      setLoginDebug(`⚠️ Role: editor (${elapsed}ms)\n\nKEMUNGKINAN ERROR:\n${errorMsg}\n\nCek:\n1. DevTools Console (F12) — filter PBR\n2. GET /api/ping — verifikasi dev server jalan kode baru\n3. node scripts/diagnose-login.mjs ${email} <password>`);
                      toast.error(`Role: editor (${elapsed}ms) — kemungkinan error`, {
                        description: result.error ? `Error: ${result.error.slice(0, 150)}` : 'Buka DevTools Console (F12) untuk detail',
                        duration: 20000,
                      });
                    } else {
                      setLoginDebug(`✅ Login OK (${elapsed}ms) — Role: ${role}`);
                      toast.success(`✅ Role: ${role} (${elapsed}ms)`, { duration: 4000 });
                    }
                  }, 200);
                } else {
                  setLoginDebug(`❌ Login failed (${elapsed}ms)\n${result.error || ''}`);
                  toast.error(`Login gagal (${elapsed}ms)`, {
                    description: result.error || 'Email atau password salah',
                    duration: 10000,
                  });
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    className="pl-10 rounded-xl"
                    placeholder="email@admin.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    className="pl-10 rounded-xl"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-11">
                Masuk ke Dashboard
              </Button>
            </form>
            <div className="mt-6 p-4 rounded-xl bg-secondary/60 border border-border">
              <p className="text-xs font-semibold mb-1.5">Akses Admin</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Login menggunakan akun yang sudah terdaftar di Firebase Authentication
                dan memiliki dokumen role di Firestore collection <code className="bg-background px-1 rounded">users</code>.
              </p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Belum punya akun admin? Hubungi Super Admin atau jalankan{" "}
                <code className="bg-background px-1 rounded">bun run setup-admin &lt;email&gt;</code>{" "}
                untuk mendaftarkan admin baru.
              </p>
            </div>
            {loginDebug && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono break-all dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200">
                {loginDebug}
              </div>
            )}
            <Button variant="ghost" className="w-full mt-4" onClick={() => router.push("/")}>
              ← Kembali ke Website
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Filter menu by role
  const visibleMenu = menuItems.filter((item) => canAccess(currentUser.role, item.id));

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-foreground text-background flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="bg-white/10 p-2 rounded-xl">
            <Logo />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/10 rounded-full"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleMenu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setSection(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  section === item.id
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
              {currentUser.displayName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{currentUser.displayName}</div>
              <div className="text-[10px] text-white/60 uppercase tracking-wider">
                {currentUser.role.replace("_", " ")}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full text-white/70 hover:bg-white/10 hover:text-white justify-start rounded-xl"
            onClick={() => { logout(); router.push("/"); toast.success("Logout berhasil"); }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 glass border-b border-border h-16 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-heading text-lg md:text-xl font-bold capitalize">
              {menuItems.find((m) => m.id === section)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => router.push("/")}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Lihat Website
            </Button>
          </div>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {section === "dashboard" && <AdminDashboard />}
              {section === "homepage" && <HomepageManager />}
              {section === "pengurus" && <PengurusManager />}
              {section === "penasehat" && <PenasehatManager />}
              {section === "relawan" && <RelawanManager />}
              {section === "blog" && <BlogManager />}
              {section === "news" && <NewsManager />}
              {section === "campaigns" && <CampaignManager />}
              {section === "supporters" && <SupporterManager />}
              {section === "media" && <MediaManager />}
              {section === "transparency" && <TransparencyManager />}
              {section === "mobileapp" && <MobileAppManager />}
              {section === "settings" && <SettingsManager />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Re-export icons used elsewhere
export { Plus, Pencil, Trash2, Save, Badge, Button, Card, Input, Textarea, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, ImageUpload, MultiImageUpload, toast };
