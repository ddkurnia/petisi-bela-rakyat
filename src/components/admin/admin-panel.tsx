"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FileText, Newspaper, Megaphone, ImageIcon,
  Wallet, Settings, LogOut, Menu, X, Shield, Lock, Mail, ChevronRight,
  Plus, Pencil, Trash2, Eye, Save, Upload, ArrowUp, ArrowDown, BarChart3,
  HeartHandshake, Building2, ExternalLink
} from "lucide-react";
import { useStore, type TeamMember, type BlogPost, type NewsArticle, type Campaign, type Supporter, type GalleryItem, type TransparencyRecord } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type AdminSection =
  | "dashboard" | "homepage" | "team" | "blog" | "news" | "campaigns"
  | "supporters" | "media" | "transparency" | "settings";

const menuItems: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "homepage", label: "Kelola Homepage", icon: Settings },
  { id: "team", label: "Kelola Tim", icon: Users },
  { id: "blog", label: "Kelola Blog", icon: FileText },
  { id: "news", label: "Kelola News", icon: Newspaper },
  { id: "campaigns", label: "Kelola Kampanye", icon: Megaphone },
  { id: "supporters", label: "Dukungan Tokoh", icon: HeartHandshake },
  { id: "media", label: "Kelola Media", icon: ImageIcon },
  { id: "transparency", label: "Kelola Transparansi", icon: Wallet },
];

export function AdminPanel() {
  const { navigate } = useNav();
  const { currentUser, login, logout } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              onSubmit={(e) => {
                e.preventDefault();
                if (login(email, password)) {
                  toast.success("Login berhasil");
                } else {
                  toast.error("Email atau password salah");
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
                    placeholder="admin@petisibelarakyat.id"
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
              <p className="text-xs font-semibold mb-2">Akun Demo (password: <code className="bg-background px-1 rounded">pbr2026</code>):</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• superadmin@petisibelarakyat.id</li>
                <li>• admin@petisibelarakyat.id</li>
                <li>• editor@petisibelarakyat.id</li>
              </ul>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => navigate("home")}
            >
              ← Kembali ke Website
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

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
          {menuItems.map((item) => {
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
              <div className="text-[10px] text-white/60 uppercase tracking-wider">{currentUser.role.replace("_", " ")}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full text-white/70 hover:bg-white/10 hover:text-white justify-start rounded-xl"
            onClick={() => { logout(); navigate("home"); toast.success("Logout berhasil"); }}
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
              onClick={() => navigate("home")}
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
              {section === "dashboard" && <DashboardView />}
              {section === "homepage" && <HomepageManager />}
              {section === "team" && <TeamManager />}
              {section === "blog" && <BlogManager />}
              {section === "news" && <NewsManager />}
              {section === "campaigns" && <CampaignManager />}
              {section === "supporters" && <SupporterManager />}
              {section === "media" && <MediaManager />}
              {section === "transparency" && <TransparencyManager />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ============ DASHBOARD VIEW ============
function DashboardView() {
  const blog = useStore((s) => s.blog);
  const news = useStore((s) => s.news);
  const campaigns = useStore((s) => s.campaigns);
  const team = useStore((s) => s.team);

  const stats = [
    { label: "Total Artikel Blog", value: blog.length, icon: FileText, color: "bg-blue-500/10 text-blue-600" },
    { label: "Total Berita", value: news.length, icon: Newspaper, color: "bg-purple-500/10 text-purple-600" },
    { label: "Total Kampanye", value: campaigns.length, icon: Megaphone, color: "bg-primary/10 text-primary" },
    { label: "Total Anggota Tim", value: team.length, icon: Users, color: "bg-green-500/10 text-green-600" },
  ];

  const totalViews = [...blog, ...news].reduce((sum, item) => sum + (item.views || 0), 0);
  const totalSupporters = campaigns.reduce((sum, c) => sum + c.supporters, 0);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-foreground to-foreground/90 text-background border-0 shadow-xl overflow-hidden relative">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold mb-3">
            <BarChart3 className="h-3 w-3" />
            Overview
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
            Selamat datang kembali! 👋
          </h2>
          <p className="mt-1 text-white/70">Berikut ringkasan aktivitas organisasi Anda hari ini.</p>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="p-5 border-0 shadow-lg shadow-foreground/5">
              <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-heading text-2xl md:text-3xl font-extrabold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Activity overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
          <h3 className="font-heading font-bold mb-4">Statistik Engagement</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Total Views (Blog + News)</span>
                <span className="font-bold">{totalViews.toLocaleString("id-ID")}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "75%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Total Pendukung Kampanye</span>
                <span className="font-bold">{totalSupporters.toLocaleString("id-ID")}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-green-600 rounded-full" style={{ width: "60%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Avg. Views per Article</span>
                <span className="font-bold">{Math.round(totalViews / Math.max(1, blog.length + news.length)).toLocaleString("id-ID")}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "45%" }} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
          <h3 className="font-heading font-bold mb-4">Kampanye Teratas</h3>
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                <img src={c.coverImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.supporters} pendukung</div>
                </div>
                <Badge className="bg-primary/10 text-primary border-0">Aktif</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent blog posts */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-4">Artikel Terbaru</h3>
        <div className="space-y-2">
          {blog.slice(0, 5).map((b) => (
            <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/40 transition-colors">
              <img src={b.coverImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{b.title}</div>
                <div className="text-xs text-muted-foreground">{b.category} • {b.views} views</div>
              </div>
              <Badge variant="outline" className={b.status === "published" ? "border-green-500/30 text-green-600" : ""}>
                {b.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============ HOMEPAGE MANAGER ============
function HomepageManager() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const [form, setForm] = useState(settings);

  const save = () => {
    updateSettings({
      hero: form.hero,
      stats: form.stats,
    });
    toast.success("Homepage berhasil diperbarui");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-1">Hero Section</h3>
        <p className="text-sm text-muted-foreground mb-5">Konten utama yang tampil di beranda.</p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>URL Gambar Hero</Label>
            <Input
              value={form.hero.image}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, image: e.target.value } })}
              className="rounded-xl"
            />
          </div>
          {form.hero.image && (
            <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
              <img src={form.hero.image} alt="preview" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Headline</Label>
            <Input
              value={form.hero.headline}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, headline: e.target.value } })}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Subheadline</Label>
            <Textarea
              value={form.hero.subheadline}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, subheadline: e.target.value } })}
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Primary CTA</Label>
              <Input
                value={form.hero.primaryCta}
                onChange={(e) => setForm({ ...form, hero: { ...form.hero, primaryCta: e.target.value } })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Secondary CTA</Label>
              <Input
                value={form.hero.secondaryCta}
                onChange={(e) => setForm({ ...form, hero: { ...form.hero, secondaryCta: e.target.value } })}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-1">Statistik</h3>
        <p className="text-sm text-muted-foreground mb-5">Angka yang ditampilkan dengan animasi counter.</p>
        <div className="space-y-3">
          {form.stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-end p-3 rounded-xl bg-secondary/40">
              <div className="col-span-12 sm:col-span-5 space-y-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={stat.label}
                  onChange={(e) => {
                    const stats = [...form.stats];
                    stats[i] = { ...stats[i], label: e.target.value };
                    setForm({ ...form, stats });
                  }}
                  className="rounded-xl"
                />
              </div>
              <div className="col-span-6 sm:col-span-3 space-y-1">
                <Label className="text-xs">Nilai</Label>
                <Input
                  type="number"
                  value={stat.value}
                  onChange={(e) => {
                    const stats = [...form.stats];
                    stats[i] = { ...stats[i], value: parseInt(e.target.value) || 0 };
                    setForm({ ...form, stats });
                  }}
                  className="rounded-xl"
                />
              </div>
              <div className="col-span-4 sm:col-span-2 space-y-1">
                <Label className="text-xs">Suffix</Label>
                <Input
                  value={stat.suffix}
                  onChange={(e) => {
                    const stats = [...form.stats];
                    stats[i] = { ...stats[i], suffix: e.target.value };
                    setForm({ ...form, stats });
                  }}
                  className="rounded-xl"
                />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-red-600 hover:bg-red-500/10"
                  onClick={() => {
                    const stats = form.stats.filter((_, idx) => idx !== i);
                    setForm({ ...form, stats });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setForm({ ...form, stats: [...form.stats, { label: "Stat Baru", value: 0, suffix: "+" }] })}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Statistik
          </Button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Save className="h-4 w-4 mr-2" />
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
}

// ============ TEAM MANAGER ============
function TeamManager() {
  const team = useStore((s) => s.team);
  const addTeam = useStore((s) => s.addTeam);
  const updateTeam = useStore((s) => s.updateTeam);
  const deleteTeam = useStore((s) => s.deleteTeam);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [open, setOpen] = useState(false);

  const blank: TeamMember = {
    id: "", slug: "", name: "", position: "", summary: "", bio: "",
    experience: "", responsibilities: "", photo: "", order: team.length + 1,
  };

  const openNew = () => { setEditing(blank); setOpen(true); };
  const openEdit = (m: TeamMember) => { setEditing(m); setOpen(true); };

  const save = () => {
    if (!editing) return;
    if (!editing.name) { toast.error("Nama wajib diisi"); return; }
    if (editing.id) {
      updateTeam(editing.id, editing);
      toast.success("Anggota tim diperbarui");
    } else {
      addTeam(editing);
      toast.success("Anggota tim ditambahkan");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{team.length} anggota tim</p>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1.5" />
          Tambah Anggota
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...team].sort((a,b) => a.order - b.order).map((m) => (
          <Card key={m.id} className="overflow-hidden border-0 shadow-lg shadow-foreground/5">
            <div className="aspect-square overflow-hidden">
              <img src={m.photo} alt={m.name} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-sm truncate">{m.name}</h3>
                  <p className="text-xs text-muted-foreground">{m.position}</p>
                </div>
                <Badge variant="outline">#{m.order}</Badge>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="rounded-full flex-1" onClick={() => openEdit(m)}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                  if (confirm(`Hapus ${m.name}?`)) { deleteTeam(m.id); toast.success("Anggota dihapus"); }
                }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Tambah"} Anggota Tim</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nama *</Label>
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Jabatan</Label>
                  <Input value={editing.position} onChange={(e) => setEditing({ ...editing, position: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>URL Foto</Label>
                <Input value={editing.photo} onChange={(e) => setEditing({ ...editing, photo: e.target.value })} className="rounded-xl" />
                {editing.photo && <img src={editing.photo} alt="" className="h-24 w-24 rounded-xl object-cover" />}
              </div>
              <div className="space-y-1.5">
                <Label>Ringkasan</Label>
                <Textarea value={editing.summary} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} rows={2} className="rounded-xl resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label>Biografi</Label>
                <Textarea value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} rows={3} className="rounded-xl resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label>Pengalaman (pisahkan dengan titik)</Label>
                <Textarea value={editing.experience} onChange={(e) => setEditing({ ...editing, experience: e.target.value })} rows={3} className="rounded-xl resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label>Bidang Tugas</Label>
                <Textarea value={editing.responsibilities} onChange={(e) => setEditing({ ...editing, responsibilities: e.target.value })} rows={2} className="rounded-xl resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label>Urutan Tampil</Label>
                <Input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 1 })} className="rounded-xl" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
            <Button onClick={save} className="bg-primary hover:bg-primary/90 text-white rounded-full">
              <Save className="h-4 w-4 mr-1.5" /> Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ BLOG MANAGER ============
function BlogManager() {
  const blog = useStore((s) => s.blog);
  const addBlog = useStore((s) => s.addBlog);
  const updateBlog = useStore((s) => s.updateBlog);
  const deleteBlog = useStore((s) => s.deleteBlog);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [open, setOpen] = useState(false);

  const blank: Omit<BlogPost, "id" | "views"> = {
    slug: "", title: "", excerpt: "", content: "", coverImage: "",
    category: "Infrastruktur", tags: [], author: "Admin", publishedAt: new Date().toISOString().split("T")[0],
    metaTitle: "", metaDescription: "", status: "draft",
  };

  const openNew = () => { setEditing(blank as BlogPost); setOpen(true); };
  const openEdit = (p: BlogPost) => { setEditing(p); setOpen(true); };

  const save = () => {
    if (!editing) return;
    if (!editing.title) { toast.error("Judul wajib diisi"); return; }
    if (editing.id) {
      updateBlog(editing.id, editing);
      toast.success("Artikel diperbarui");
    } else {
      addBlog(editing);
      toast.success("Artikel ditambahkan");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{blog.length} artikel</p>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1.5" />
          Tulis Artikel
        </Button>
      </div>

      <Card className="border-0 shadow-lg shadow-foreground/5 overflow-hidden">
        <div className="divide-y divide-border">
          {blog.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-secondary/40 transition-colors">
              <img src={p.coverImage} alt="" className="h-14 w-14 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{p.category}</Badge>
                  <Badge variant="outline" className={p.status === "published" ? "border-green-500/30 text-green-600 text-xs" : "text-xs"}>
                    {p.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm mt-1 truncate">{p.title}</h3>
                <p className="text-xs text-muted-foreground">{p.views} views • {p.publishedAt}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="rounded-full" onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                  if (confirm(`Hapus "${p.title}"?`)) { deleteBlog(p.id); toast.success("Artikel dihapus"); }
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Tulis"} Artikel Blog</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Judul *</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, metaTitle: e.target.value })} className="rounded-xl" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Infrastruktur", "Hukum", "Kebijakan Publik", "Aspirasi Rakyat", "Kepulauan Meranti"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={editing.status} onValueChange={(v: "published" | "draft") => setEditing({ ...editing, status: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>URL Cover Image</Label>
                <Input value={editing.coverImage} onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Excerpt</Label>
                <Textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value, metaDescription: e.target.value })} rows={2} className="rounded-xl resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label>Tags (pisahkan dengan koma)</Label>
                <Input
                  value={editing.tags.join(", ")}
                  onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Konten (Markdown: ## Heading, - list item)</Label>
                <Textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={10} className="rounded-xl resize-y font-mono text-sm" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Penulis</Label>
                  <Input value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tanggal Publish</Label>
                  <Input type="date" value={editing.publishedAt} onChange={(e) => setEditing({ ...editing, publishedAt: e.target.value })} className="rounded-xl" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
            <Button onClick={save} className="bg-primary hover:bg-primary/90 text-white rounded-full">
              <Save className="h-4 w-4 mr-1.5" /> Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ NEWS MANAGER ============
function NewsManager() {
  const news = useStore((s) => s.news);
  const addNews = useStore((s) => s.addNews);
  const updateNews = useStore((s) => s.updateNews);
  const deleteNews = useStore((s) => s.deleteNews);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [open, setOpen] = useState(false);

  const blank: Omit<NewsArticle, "id" | "views"> = {
    slug: "", title: "", excerpt: "", content: "", coverImage: "",
    category: "Kampanye", author: "Admin", publishedAt: new Date().toISOString().split("T")[0], status: "draft",
  };

  const openNew = () => { setEditing(blank as NewsArticle); setOpen(true); };
  const openEdit = (p: NewsArticle) => { setEditing(p); setOpen(true); };

  const save = () => {
    if (!editing) return;
    if (!editing.title) { toast.error("Judul wajib diisi"); return; }
    if (editing.id) { updateNews(editing.id, editing); toast.success("Berita diperbarui"); }
    else { addNews(editing); toast.success("Berita ditambahkan"); }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{news.length} berita</p>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1.5" /> Tulis Berita
        </Button>
      </div>

      <Card className="border-0 shadow-lg shadow-foreground/5 overflow-hidden">
        <div className="divide-y divide-border">
          {news.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-secondary/40 transition-colors">
              <img src={p.coverImage} alt="" className="h-14 w-14 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <Badge variant="outline" className="text-xs">{p.category}</Badge>
                <h3 className="font-semibold text-sm mt-1 truncate">{p.title}</h3>
                <p className="text-xs text-muted-foreground">{p.views} views • {p.publishedAt}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="rounded-full" onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                  if (confirm(`Hapus "${p.title}"?`)) { deleteNews(p.id); toast.success("Berita dihapus"); }
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Tulis"} Berita</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Judul *</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="rounded-xl" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Kampanye", "Advokasi", "Organisasi", "Aksi", "Audiensi"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={editing.status} onValueChange={(v: "published" | "draft") => setEditing({ ...editing, status: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>URL Cover Image</Label>
                <Input value={editing.coverImage} onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Excerpt</Label>
                <Textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={2} className="rounded-xl resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label>Konten (Markdown)</Label>
                <Textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={8} className="rounded-xl resize-y font-mono text-sm" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Penulis</Label>
                  <Input value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tanggal</Label>
                  <Input type="date" value={editing.publishedAt} onChange={(e) => setEditing({ ...editing, publishedAt: e.target.value })} className="rounded-xl" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
            <Button onClick={save} className="bg-primary hover:bg-primary/90 text-white rounded-full">
              <Save className="h-4 w-4 mr-1.5" /> Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ CAMPAIGN MANAGER ============
function CampaignManager() {
  const campaigns = useStore((s) => s.campaigns);
  const addCampaign = useStore((s) => s.addCampaign);
  const updateCampaign = useStore((s) => s.updateCampaign);
  const deleteCampaign = useStore((s) => s.deleteCampaign);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [open, setOpen] = useState(false);

  const blank: Omit<Campaign, "id"> = {
    slug: "", title: "", description: "", coverImage: "", petitionLink: "#",
    supporters: 0, goal: 1000, status: "active", location: "", startedAt: new Date().toISOString().split("T")[0],
  };

  const openNew = () => { setEditing(blank as Campaign); setOpen(true); };
  const openEdit = (c: Campaign) => { setEditing(c); setOpen(true); };

  const save = () => {
    if (!editing) return;
    if (!editing.title) { toast.error("Judul wajib diisi"); return; }
    if (editing.id) { updateCampaign(editing.id, editing); toast.success("Kampanye diperbarui"); }
    else { addCampaign(editing); toast.success("Kampanye ditambahkan"); }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{campaigns.length} kampanye</p>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1.5" /> Tambah Kampanye
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((c) => (
          <Card key={c.id} className="overflow-hidden border-0 shadow-lg shadow-foreground/5">
            <div className="aspect-video overflow-hidden">
              <img src={c.coverImage} alt={c.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <Badge className="bg-primary text-white border-0 mb-2">{c.status}</Badge>
              <h3 className="font-heading font-bold text-sm line-clamp-2">{c.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{c.supporters}/{c.goal} pendukung</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="rounded-full flex-1" onClick={() => openEdit(c)}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                  if (confirm(`Hapus "${c.title}"?`)) { deleteCampaign(c.id); toast.success("Kampanye dihapus"); }
                }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Tambah"} Kampanye</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Judul *</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Deskripsi</Label>
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="rounded-xl resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label>URL Cover Image</Label>
                <Input value={editing.coverImage} onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })} className="rounded-xl" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Lokasi</Label>
                  <Input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={editing.status} onValueChange={(v: Campaign["status"]) => setEditing({ ...editing, status: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="won">Berhasil</SelectItem>
                      <SelectItem value="lost">Belum Tercapai</SelectItem>
                      <SelectItem value="planned">Direncanakan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Jumlah Dukungan</Label>
                  <Input type="number" value={editing.supporters} onChange={(e) => setEditing({ ...editing, supporters: parseInt(e.target.value) || 0 })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Target</Label>
                  <Input type="number" value={editing.goal} onChange={(e) => setEditing({ ...editing, goal: parseInt(e.target.value) || 0 })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tanggal Mulai</Label>
                  <Input type="date" value={editing.startedAt} onChange={(e) => setEditing({ ...editing, startedAt: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Link Petisi</Label>
                <Input value={editing.petitionLink} onChange={(e) => setEditing({ ...editing, petitionLink: e.target.value })} className="rounded-xl" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
            <Button onClick={save} className="bg-primary hover:bg-primary/90 text-white rounded-full">
              <Save className="h-4 w-4 mr-1.5" /> Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ SUPPORTER MANAGER ============
function SupporterManager() {
  const supporters = useStore((s) => s.supporters);
  const addSupporter = useStore((s) => s.addSupporter);
  const updateSupporter = useStore((s) => s.updateSupporter);
  const deleteSupporter = useStore((s) => s.deleteSupporter);
  const [editing, setEditing] = useState<Supporter | null>(null);
  const [open, setOpen] = useState(false);

  const blank: Omit<Supporter, "id"> = { name: "", position: "", statement: "", photo: "" };

  const save = () => {
    if (!editing) return;
    if (!editing.name) { toast.error("Nama wajib diisi"); return; }
    if (editing.id) { updateSupporter(editing.id, editing); toast.success("Pendukung diperbarui"); }
    else { addSupporter(editing); toast.success("Pendukung ditambahkan"); }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{supporters.length} pendukung</p>
        <Button onClick={() => { setEditing(blank as Supporter); setOpen(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1.5" /> Tambah Pendukung
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {supporters.map((s) => (
          <Card key={s.id} className="p-5 border-0 shadow-lg shadow-foreground/5">
            <div className="flex items-start gap-3">
              <img src={s.photo} alt={s.name} className="h-14 w-14 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-sm">{s.name}</h3>
                <p className="text-xs text-muted-foreground">{s.position}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic line-clamp-3">"{s.statement}"</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="rounded-full flex-1" onClick={() => { setEditing(s); setOpen(true); }}>
                <Pencil className="h-3 w-3 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                if (confirm(`Hapus ${s.name}?`)) { deleteSupporter(s.id); toast.success("Pendukung dihapus"); }
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Tambah"} Pendukung</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nama *</Label>
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Jabatan</Label>
                  <Input value={editing.position} onChange={(e) => setEditing({ ...editing, position: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>URL Foto</Label>
                <Input value={editing.photo} onChange={(e) => setEditing({ ...editing, photo: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Pernyataan Dukungan</Label>
                <Textarea value={editing.statement} onChange={(e) => setEditing({ ...editing, statement: e.target.value })} rows={3} className="rounded-xl resize-none" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
            <Button onClick={save} className="bg-primary hover:bg-primary/90 text-white rounded-full">
              <Save className="h-4 w-4 mr-1.5" /> Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ MEDIA MANAGER ============
function MediaManager() {
  const gallery = useStore((s) => s.gallery);
  const addGallery = useStore((s) => s.addGallery);
  const deleteGallery = useStore((s) => s.deleteGallery);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [open, setOpen] = useState(false);

  const blank: Omit<GalleryItem, "id"> = {
    type: "photo", title: "", url: "", thumbnail: "", category: "Aksi",
    description: "", uploadedAt: new Date().toISOString().split("T")[0],
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title) { toast.error("Judul wajib diisi"); return; }
    const payload = { ...editing, thumbnail: editing.thumbnail || editing.url };
    addGallery(payload);
    toast.success("Media ditambahkan");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{gallery.length} item media</p>
        <Button onClick={() => { setEditing(blank as GalleryItem); setOpen(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Upload className="h-4 w-4 mr-1.5" /> Upload Media
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gallery.map((g) => (
          <Card key={g.id} className="overflow-hidden border-0 shadow-lg shadow-foreground/5">
            <div className="aspect-square overflow-hidden relative">
              <img src={g.thumbnail} alt={g.title} className="h-full w-full object-cover" />
              <Badge className="absolute top-2 left-2 bg-primary text-white border-0 capitalize text-xs">{g.type}</Badge>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm truncate">{g.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{g.category}</p>
              <Button size="sm" variant="ghost" className="w-full mt-2 rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                if (confirm(`Hapus "${g.title}"?`)) { deleteGallery(g.id); toast.success("Media dihapus"); }
              }}>
                <Trash2 className="h-3 w-3 mr-1" /> Hapus
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Media Baru</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Tipe Media</Label>
                <Select value={editing.type} onValueChange={(v: "photo" | "video" | "document") => setEditing({ ...editing, type: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo">Foto</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">Dokumen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Judul *</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>URL File</Label>
                <Input value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>URL Thumbnail</Label>
                <Input value={editing.thumbnail} onChange={(e) => setEditing({ ...editing, thumbnail: e.target.value })} className="rounded-xl" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tanggal</Label>
                  <Input type="date" value={editing.uploadedAt} onChange={(e) => setEditing({ ...editing, uploadedAt: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Deskripsi</Label>
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="rounded-xl resize-none" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
            <Button onClick={save} className="bg-primary hover:bg-primary/90 text-white rounded-full">
              <Save className="h-4 w-4 mr-1.5" /> Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ TRANSPARENCY MANAGER ============
function TransparencyManager() {
  const records = useStore((s) => s.transparency);
  const reports = useStore((s) => s.reports);
  const addTransparency = useStore((s) => s.addTransparency);
  const deleteTransparency = useStore((s) => s.deleteTransparency);
  const addReport = useStore((s) => s.addReport);
  const deleteReport = useStore((s) => s.deleteReport);
  const [editing, setEditing] = useState<TransparencyRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ title: "", year: new Date().getFullYear(), url: "#" });

  const blank: Omit<TransparencyRecord, "id"> = {
    date: new Date().toISOString().split("T")[0], type: "income",
    category: "", description: "", amount: 0, source: "",
  };

  const save = () => {
    if (!editing) return;
    if (!editing.category || !editing.description) { toast.error("Kategori dan deskripsi wajib diisi"); return; }
    addTransparency(editing);
    toast.success("Transaksi ditambahkan");
    setOpen(false);
  };

  const saveReport = () => {
    if (!reportForm.title) { toast.error("Judul laporan wajib diisi"); return; }
    addReport({ ...reportForm, uploadedAt: new Date().toISOString().split("T")[0] });
    toast.success("Laporan ditambahkan");
    setReportOpen(false);
    setReportForm({ title: "", year: new Date().getFullYear(), url: "#" });
  };

  return (
    <div className="space-y-6">
      {/* Reports section */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold">Laporan Resmi</h3>
          <Button size="sm" onClick={() => setReportOpen(true)} className="rounded-full bg-primary hover:bg-primary/90 text-white">
            <Plus className="h-4 w-4 mr-1" /> Tambah Laporan
          </Button>
        </div>
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.year}</div>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                if (confirm(`Hapus "${r.title}"?`)) { deleteReport(r.id); toast.success("Laporan dihapus"); }
              }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Transactions */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold">Riwayat Transaksi</h3>
          <Button size="sm" onClick={() => { setEditing(blank as TransparencyRecord); setOpen(true); }} className="rounded-full bg-primary hover:bg-primary/90 text-white">
            <Plus className="h-4 w-4 mr-1" /> Tambah Transaksi
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 text-sm font-semibold">Tanggal</th>
                <th className="p-3 text-sm font-semibold">Tipe</th>
                <th className="p-3 text-sm font-semibold">Kategori</th>
                <th className="p-3 text-sm font-semibold">Jumlah</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {[...records].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="p-3 text-sm">{r.date}</td>
                  <td className="p-3">
                    <Badge className={r.type === "income" ? "bg-green-500/10 text-green-600 border-0" : "bg-red-500/10 text-red-600 border-0"}>
                      {r.type === "income" ? "Masuk" : "Keluar"}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm">{r.category}</td>
                  <td className={`p-3 text-sm font-bold ${r.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {r.type === "income" ? "+" : "−"} Rp {r.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3">
                    <Button size="icon" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                      if (confirm("Hapus transaksi ini?")) { deleteTransparency(r.id); toast.success("Transaksi dihapus"); }
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Transaksi</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Tanggal</Label>
                  <Input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipe</Label>
                  <Select value={editing.type} onValueChange={(v: "income" | "expense") => setEditing({ ...editing, type: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Donasi, Operasional, Aksi..." className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Deskripsi</Label>
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="rounded-xl resize-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Jumlah (Rp)</Label>
                  <Input type="number" value={editing.amount} onChange={(e) => setEditing({ ...editing, amount: parseInt(e.target.value) || 0 })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Sumber (opsional)</Label>
                  <Input value={editing.source || ""} onChange={(e) => setEditing({ ...editing, source: e.target.value })} className="rounded-xl" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
            <Button onClick={save} className="bg-primary hover:bg-primary/90 text-white rounded-full">
              <Save className="h-4 w-4 mr-1.5" /> Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Laporan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Judul Laporan *</Label>
              <Input value={reportForm.title} onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Tahun</Label>
              <Input type="number" value={reportForm.year} onChange={(e) => setReportForm({ ...reportForm, year: parseInt(e.target.value) })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>URL File</Label>
              <Input value={reportForm.url} onChange={(e) => setReportForm({ ...reportForm, url: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)} className="rounded-full">Batal</Button>
            <Button onClick={saveReport} className="bg-primary hover:bg-primary/90 text-white rounded-full">
              <Save className="h-4 w-4 mr-1.5" /> Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
