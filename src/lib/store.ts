"use client";

// ============================================================
// STORE — Firestore-backed drop-in replacement for Zustand
// ============================================================
// Same public API as the old Zustand store:
//   useStore()              → full state
//   useStore((s) => s.blog) → selected slice
//
// All data comes from Firestore via onSnapshot (realtime).
// All mutations call Firestore services (async, fire-and-forget
// with error toast).
//
// CRITICAL: Public subscribers run for ALL visitors (logged-in
// or not). Public sees published content realtime. When admin
// logs in, blog/news listeners are swapped to admin mode (sees
// drafts too).
// ============================================================

import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import {
  isFirebaseConfigured, COLLECTIONS,
} from "@/lib/firebase/config";
import {
  onAuthChange, loginWithEmail, loginWithGoogle, logout as fbLogout,
  setCurrentRoleGetter, getCurrentFirebaseUser,
  type AppUser, type Role,
} from "@/lib/firebase/auth";
import {
  blogService, newsService, campaignService,
  pengurusService, penasehatService, relawanService,
  supporterService, galleryService, workService,
  transparencyService, reportService, settingsService, messageService,
} from "@/services";
import type { Unsubscribe } from "firebase/firestore";

// Re-export all types (backward compat with old imports)
export type { Role } from "@/lib/firebase/auth";
export type {
  User, TeamMember, Pengurus, Penasehat, Relawan,
  BlogPost, NewsArticle, Campaign, Supporter, GalleryItem,
  TransparencyRecord, TransparencyReport, WorkCategory,
  SocialLink, ContactInfo, AboutSection, FooterSettings,
  HomepageSettings, SiteSettings, Message,
} from "@/types";

import type {
  User, TeamMember, Pengurus, Penasehat, Relawan,
  BlogPost, NewsArticle, Campaign, Supporter, GalleryItem,
  TransparencyRecord, TransparencyReport, WorkCategory,
  SiteSettings, Message,
} from "@/types";

// ============================================================
// Role permissions
// ============================================================
export const rolePermissions: Record<Role, string[]> = {
  super_admin: ["*"],
  admin: [
    "dashboard", "homepage", "team", "pengurus", "orgstructure", "penasehat", "relawan",
    "blog", "news", "campaigns", "supporters", "media", "transparency", "settings",
  ],
  editor: ["dashboard", "blog", "news"],
};

export function canAccess(role: Role, section: string): boolean {
  const perms = rolePermissions[role];
  return perms.includes("*") || perms.includes(section);
}

// ============================================================
// Default settings (used before Firestore loads)
// ============================================================
const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Petisi Bela Rakyat",
  tagline: "Menyatukan Suara Rakyat Menjadi Perubahan",
  logoUrl: "/pbr.png",
  homepage: {
    hero: { image: "", headline: "Menyatukan Suara Rakyat Menjadi Perubahan", subheadline: "", primaryCta: "Pelajari Lebih Lanjut", secondaryCta: "Lihat Kampanye" },
    about: { image: "", title: "Tentang Kami", description: "" },
    work: { title: "Kerja Kami", description: "" },
    campaigns: { title: "Kampanye Aktif", description: "" },
    supporters: { title: "Dukungan Tokoh", description: "" },
    stats: [{ label: "Pendukung", value: 0, suffix: "+" }],
  },
  about: { visi: "", misi: [], nilai: [], sejarah: "", sejarahTimeline: [], motto: "" },
  contact: { address: "", whatsapp: "", email: "", phone: "", mapEmbed: "", mapLink: "", operationHours: "" },
  socials: [],
  footer: { description: "", copyrightText: "© 2026 Petisi Bela Rakyat", legalLinks: [] },
};

// ============================================================
// Deep merge — Firestore settings doc may be partial
// ============================================================
// Recursively merges user's Firestore settings over DEFAULT_SETTINGS.
// Arrays are REPLACED (not concatenated) — user's array wins.
// Objects are merged recursively so missing nested fields fall back
// to defaults.
// ============================================================
function deepMerge<T>(base: T, override: any): T {
  if (override === null || override === undefined) return base;
  if (typeof base !== 'object' || base === null) return (override as T);
  if (Array.isArray(base)) {
    return (Array.isArray(override) ? override : base) as T;
  }
  const result: any = { ...base };
  for (const key of Object.keys(override)) {
    const baseVal = (base as any)[key];
    const overrideVal = override[key];
    if (
      typeof baseVal === 'object' && baseVal !== null && !Array.isArray(baseVal) &&
      typeof overrideVal === 'object' && overrideVal !== null && !Array.isArray(overrideVal)
    ) {
      result[key] = deepMerge(baseVal, overrideVal);
    } else if (overrideVal !== undefined) {
      result[key] = overrideVal;
    }
  }
  return result as T;
}

function mergeSettings(base: SiteSettings, override: Partial<SiteSettings>): SiteSettings {
  return deepMerge(base, override);
}

// ============================================================
// State shape
// ============================================================
interface AppState {
  currentUser: AppUser | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; role?: string }>;
  logout: () => void;

  settings: SiteSettings;
  team: TeamMember[];
  pengurus: Pengurus[];
  penasehat: Penasehat[];
  relawan: Relawan[];
  blog: BlogPost[];
  news: NewsArticle[];
  campaigns: Campaign[];
  supporters: Supporter[];
  gallery: GalleryItem[];
  work: WorkCategory[];
  transparency: TransparencyRecord[];
  reports: TransparencyReport[];

  updateSettings: (s: Partial<SiteSettings>) => void;
  updateHomepage: (s: Partial<SiteSettings["homepage"]>) => void;
  updateAbout: (s: Partial<SiteSettings["about"]>) => void;
  updateContact: (s: Partial<SiteSettings["contact"]>) => void;
  updateSocials: (s: SiteSettings["socials"]) => void;
  updateFooter: (s: Partial<SiteSettings["footer"]>) => void;

  addPengurus: (m: Omit<Pengurus, "id">) => void;
  updatePengurus: (id: string, m: Partial<Pengurus>) => void;
  deletePengurus: (id: string) => void;

  addPenasehat: (p: Omit<Penasehat, "id">) => void;
  updatePenasehat: (id: string, p: Partial<Penasehat>) => void;
  deletePenasehat: (id: string) => void;

  addRelawan: (r: Omit<Relawan, "id">) => void;
  updateRelawan: (id: string, r: Partial<Relawan>) => void;
  deleteRelawan: (id: string) => void;

  addTeam: (m: Omit<TeamMember, "id">) => void;
  updateTeam: (id: string, m: Partial<TeamMember>) => void;
  deleteTeam: (id: string) => void;

  addBlog: (p: Omit<BlogPost, "id" | "views" | "shares">) => void;
  updateBlog: (id: string, p: Partial<BlogPost>) => void;
  deleteBlog: (id: string) => void;
  incrementBlogView: (id: string) => void;
  incrementBlogShare: (id: string) => void;

  addNews: (p: Omit<NewsArticle, "id" | "views" | "shares">) => void;
  updateNews: (id: string, p: Partial<NewsArticle>) => void;
  deleteNews: (id: string) => void;
  incrementNewsView: (id: string) => void;
  incrementNewsShare: (id: string) => void;

  addCampaign: (c: Omit<Campaign, "id" | "shares">) => void;
  updateCampaign: (id: string, c: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  incrementCampaignShare: (id: string) => void;

  addSupporter: (s: Omit<Supporter, "id">) => void;
  updateSupporter: (id: string, s: Partial<Supporter>) => void;
  deleteSupporter: (id: string) => void;

  addGallery: (g: Omit<GalleryItem, "id">) => void;
  updateGallery: (id: string, g: Partial<GalleryItem>) => void;
  deleteGallery: (id: string) => void;

  addTransparency: (t: Omit<TransparencyRecord, "id">) => void;
  updateTransparency: (id: string, t: Partial<TransparencyRecord>) => void;
  deleteTransparency: (id: string) => void;
  addReport: (r: Omit<TransparencyReport, "id">) => void;
  deleteReport: (id: string) => void;

  addWork: (w: Omit<WorkCategory, "id">) => void;
  updateWork: (id: string, w: Partial<WorkCategory>) => void;
  deleteWork: (id: string) => void;

  addMessage: (m: Omit<Message, "id">) => void;
}

// ============================================================
// Helpers
// ============================================================
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const handleErr = (err: any, msg = "Operasi gagal") => {
  console.error("[store]", err);
  const code = err?.code || '';
  let detail = msg;
  if (code === 'permission-denied') {
    detail = msg + " (Permission denied — cek Firestore rules atau login ulang)";
  } else if (code === 'unavailable') {
    detail = msg + " (Firestore tidak tersedia — cek koneksi)";
  } else if (code === 'not-found') {
    detail = msg + " (Dokumen tidak ditemukan)";
  } else if (err?.message) {
    detail = msg + ": " + err.message;
  }
  toast.error(detail, { duration: 8000 });
};

// ============================================================
// Singleton store (module-level state)
// ============================================================
let state: AppState = {
  currentUser: null,
  login: async (email, password) => {
    const res = await loginWithEmail(email, password);
    if (res.success && res.user) {
      storeSet({ currentUser: res.user });
      console.log('%c[PBR-STORE] login set currentUser', 'color:#16a34a;font-weight:bold', { role: res.user.role });
      return { ok: true, role: res.user.role, error: res.error };
    }
    return { ok: false, error: res.error };
  },
  logout: () => { fbLogout(); storeSet({ currentUser: null }); },

  settings: DEFAULT_SETTINGS,
  team: [],
  pengurus: [],
  penasehat: [],
  relawan: [],
  blog: [],
  news: [],
  campaigns: [],
  supporters: [],
  gallery: [],
  work: [],
  transparency: [],
  reports: [],

  updateSettings: (s) => {
    // Deep merge — partial update shouldn't wipe existing fields
    const merged = mergeSettings(state.settings, s);
    // Optimistic update — UI updates immediately
    storeSet({ settings: merged });
    console.log('%c[PBR-STORE] updateSettings', 'color:#16a34a;font-weight:bold', s);

    // Persist to Firestore (settings/main doc with merge=true)
    (async () => {
      try {
        const fbUser = getCurrentFirebaseUser();
        if (fbUser) await fbUser.getIdToken(true);
        await settingsService.save(s as SiteSettings);  // save only the patch
        toast.success("Pengaturan tersimpan ke Firestore");
        console.log('%c[PBR-STORE] settings SAVED', 'color:#16a34a;font-weight:bold');
      } catch (e: any) {
        console.error('[PBR-STORE] settings save FAILED:', e);
        handleErr(e, "Gagal menyimpan pengaturan");
      }
    })();
  },
  updateHomepage: (s) => state.updateSettings({ homepage: { ...state.settings.homepage, ...s } as any }),
  updateAbout: (s) => state.updateSettings({ about: { ...state.settings.about, ...s } as any }),
  updateContact: (s) => state.updateSettings({ contact: { ...state.settings.contact, ...s } as any }),
  updateSocials: (s) => state.updateSettings({ socials: s }),
  updateFooter: (s) => state.updateSettings({ footer: { ...state.settings.footer, ...s } as any }),

  addPengurus: (m) => { pengurusService.create({ ...m, slug: m.slug || slugify(m.name) } as any).then(() => toast.success("Pengurus ditambahkan")).catch((e) => handleErr(e, "Gagal tambah pengurus")); },
  updatePengurus: (id, m) => { pengurusService.update(id, m).then(() => toast.success("Pengurus diperbarui")).catch((e) => handleErr(e, "Gagal update pengurus")); },
  deletePengurus: (id) => { pengurusService.delete(id).then(() => toast.success("Pengurus dihapus")).catch((e) => handleErr(e, "Gagal hapus pengurus")); },

  addPenasehat: (p) => { penasehatService.create(p as any).then(() => toast.success("Penasehat ditambahkan")).catch((e) => handleErr(e, "Gagal tambah penasehat")); },
  updatePenasehat: (id, p) => { penasehatService.update(id, p).then(() => toast.success("Penasehat diperbarui")).catch((e) => handleErr(e, "Gagal update penasehat")); },
  deletePenasehat: (id) => { penasehatService.delete(id).then(() => toast.success("Penasehat dihapus")).catch((e) => handleErr(e, "Gagal hapus penasehat")); },

  addRelawan: (r) => { relawanService.create(r as any).then(() => toast.success("Relawan ditambahkan")).catch((e) => handleErr(e, "Gagal tambah relawan")); },
  updateRelawan: (id, r) => { relawanService.update(id, r).then(() => toast.success("Relawan diperbarui")).catch((e) => handleErr(e, "Gagal update relawan")); },
  deleteRelawan: (id) => { relawanService.delete(id).then(() => toast.success("Relawan dihapus")).catch((e) => handleErr(e, "Gagal hapus relawan")); },

  addTeam: (m) => { pengurusService.create({ ...m, slug: m.slug || slugify(m.name), gelar: "", jabatan: m.position, parentId: null, whatsapp: "", email: "", status: "active" } as any).then(() => toast.success("Tim ditambahkan")).catch((e) => handleErr(e, "Gagal tambah tim")); },
  updateTeam: (id, m) => { pengurusService.update(id, m as any).then(() => toast.success("Tim diperbarui")).catch((e) => handleErr(e, "Gagal update tim")); },
  deleteTeam: (id) => { pengurusService.delete(id).then(() => toast.success("Tim dihapus")).catch((e) => handleErr(e, "Gagal hapus tim")); },

  addBlog: (p) => { blogService.create({ ...p, slug: p.slug || slugify(p.title), views: 0, shares: 0 } as any).then(() => toast.success("Blog ditambahkan")).catch((e) => handleErr(e, "Gagal tambah blog")); },
  updateBlog: (id, p) => { blogService.update(id, p).then(() => toast.success("Blog diperbarui")).catch((e) => handleErr(e, "Gagal update blog")); },
  deleteBlog: (id) => { blogService.delete(id).then(() => toast.success("Blog dihapus")).catch((e) => handleErr(e, "Gagal hapus blog")); },
  incrementBlogView: (id) => { blogService.incrementView(id).catch((e) => console.error('[incrementBlogView]', e)); },
  incrementBlogShare: (id) => { blogService.incrementShare(id).then(() => toast.success("Tersebar!")).catch((e) => handleErr(e, "Gagal update share counter")); },

  addNews: (p) => { newsService.create({ ...p, slug: p.slug || slugify(p.title), views: 0, shares: 0 } as any).then(() => toast.success("Berita ditambahkan")).catch((e) => handleErr(e, "Gagal tambah berita")); },
  updateNews: (id, p) => { newsService.update(id, p).then(() => toast.success("Berita diperbarui")).catch((e) => handleErr(e, "Gagal update berita")); },
  deleteNews: (id) => { newsService.delete(id).then(() => toast.success("Berita dihapus")).catch((e) => handleErr(e, "Gagal hapus berita")); },
  incrementNewsView: (id) => { newsService.incrementView(id).catch((e) => console.error('[incrementNewsView]', e)); },
  incrementNewsShare: (id) => { newsService.incrementShare(id).then(() => toast.success("Tersebar!")).catch((e) => handleErr(e, "Gagal update share counter")); },

  addCampaign: (c) => { campaignService.create({ ...c, slug: c.slug || slugify(c.title), shares: 0 } as any).then(() => toast.success("Kampanye ditambahkan")).catch((e) => handleErr(e, "Gagal tambah kampanye")); },
  updateCampaign: (id, c) => { campaignService.update(id, c).then(() => toast.success("Kampanye diperbarui")).catch((e) => handleErr(e, "Gagal update kampanye")); },
  deleteCampaign: (id) => { campaignService.delete(id).then(() => toast.success("Kampanye dihapus")).catch((e) => handleErr(e, "Gagal hapus kampanye")); },
  incrementCampaignShare: (id) => { campaignService.incrementShare(id).then(() => toast.success("Tersebar!")).catch((e) => handleErr(e, "Gagal update share counter")); },

  addSupporter: (s) => { supporterService.create(s as any).then(() => toast.success("Tokoh ditambahkan")).catch((e) => handleErr(e, "Gagal tambah tokoh")); },
  updateSupporter: (id, s) => { supporterService.update(id, s).then(() => toast.success("Tokoh diperbarui")).catch((e) => handleErr(e, "Gagal update tokoh")); },
  deleteSupporter: (id) => { supporterService.delete(id).then(() => toast.success("Tokoh dihapus")).catch((e) => handleErr(e, "Gagal hapus tokoh")); },

  addGallery: (g) => { galleryService.create(g as any).then(() => toast.success("Media ditambahkan")).catch((e) => handleErr(e, "Gagal tambah media")); },
  updateGallery: (id, g) => { galleryService.update(id, g).then(() => toast.success("Media diperbarui")).catch((e) => handleErr(e, "Gagal update media")); },
  deleteGallery: (id) => { galleryService.delete(id).then(() => toast.success("Media dihapus")).catch((e) => handleErr(e, "Gagal hapus media")); },

  addTransparency: (t) => { transparencyService.create(t as any).then(() => toast.success("Transparansi ditambahkan")).catch((e) => handleErr(e, "Gagal tambah transparansi")); },
  updateTransparency: (id, t) => { transparencyService.update(id, t).then(() => toast.success("Transparansi diperbarui")).catch((e) => handleErr(e, "Gagal update transparansi")); },
  deleteTransparency: (id) => { transparencyService.delete(id).then(() => toast.success("Transparansi dihapus")).catch((e) => handleErr(e, "Gagal hapus transparansi")); },
  addReport: (r) => { reportService.create(r as any).then(() => toast.success("Laporan ditambahkan")).catch((e) => handleErr(e, "Gagal tambah laporan")); },
  deleteReport: (id) => { reportService.delete(id).then(() => toast.success("Laporan dihapus")).catch((e) => handleErr(e, "Gagal hapus laporan")); },

  addWork: (w) => { workService.create({ ...w, slug: w.slug || slugify(w.title) } as any).then(() => toast.success("Kategori kerja ditambahkan")).catch((e) => handleErr(e, "Gagal tambah kategori")); },
  updateWork: (id, w) => { workService.update(id, w).then(() => toast.success("Kategori kerja diperbarui")).catch((e) => handleErr(e, "Gagal update kategori")); },
  deleteWork: (id) => { workService.delete(id).then(() => toast.success("Kategori kerja dihapus")).catch((e) => handleErr(e, "Gagal hapus kategori")); },

  addMessage: (m) => { messageService.create(m as any).then(() => toast.success("Pesan terkirim")).catch((e) => handleErr(e, "Gagal mengirim pesan")); },
};

// ============================================================
// External store mechanics (useSyncExternalStore)
// ============================================================
const listeners = new Set<() => void>();
let initialized = false;

function storeSet(partial: Partial<AppState>) {
  // GUARD: never downgrade from super_admin/admin to editor
  if (partial.currentUser !== undefined) {
    const before = state.currentUser?.role ?? null;
    const after = partial.currentUser?.role ?? null;
    const isDowngrade = (before === 'super_admin' || before === 'admin') && after === 'editor';

    if (isDowngrade) {
      console.log('%c[PBR-STORE storeSet BLOCKED downgrade]', 'color:#dc2626;font-weight:bold', { before, after });
      listeners.forEach((l) => l());
      return;
    }
  }
  state = { ...state, ...partial };
  if (typeof window !== 'undefined') {
    (window as any).__pbr_storeState = state;
  }
  listeners.forEach((l) => l());
}

// ============================================================
// Public subscribers — run for ALL visitors (logged-in or not)
// ============================================================
// Public users see only PUBLISHED blog/news (Firestore rules
// require the where('status','==','published') filter).
// All other collections are fully public read.
// ============================================================
let publicBlogUnsub: Unsubscribe | null = null;
let publicNewsUnsub: Unsubscribe | null = null;
let publicSubscribersInitialized = false;

function initPublicSubscribers() {
  if (publicSubscribersInitialized) return;
  publicSubscribersInitialized = true;
  console.log('%c[PBR-STORE initPublicSubscribers]', 'color:#2563eb;font-weight:bold', 'registering Firestore listeners (public)');

  // Settings — realtime singleton
  // DEEP MERGE: Firestore doc may be partial (missing fields like
  // `homepage`, `about`, etc.). We merge with DEFAULT_SETTINGS so
  // the UI always has complete structure to render.
  settingsService.subscribe((s) => {
    if (!s) {
      storeSet({ settings: DEFAULT_SETTINGS });
      return;
    }
    const merged = mergeSettings(DEFAULT_SETTINGS, s);
    storeSet({ settings: merged });
  });

  // Blog & News — published only (Firestore rules require this filter for public)
  publicBlogUnsub = blogService.subscribePublished((items) => storeSet({ blog: items }));
  publicNewsUnsub = newsService.subscribePublished((items) => storeSet({ news: items }));

  // Other collections — fully public
  campaignService.subscribe((items) => storeSet({ campaigns: items }));
  pengurusService.subscribe((items) => storeSet({ pengurus: items }));
  penasehatService.subscribe((items) => storeSet({ penasehat: items }));
  relawanService.subscribe((items) => storeSet({ relawan: items }));
  supporterService.subscribe((items) => storeSet({ supporters: items }));
  galleryService.subscribe((items) => storeSet({ gallery: items }));
  workService.subscribe((items) => storeSet({ work: items }));
  transparencyService.subscribe((items) => storeSet({ transparency: items }));
  reportService.subscribe((items) => storeSet({ reports: items }));
}

// ============================================================
// upgradeToAdminSubscribers — when admin logs in, swap blog/news
// to admin mode (no status filter → sees drafts too)
// ============================================================
let adminSubscribersInitialized = false;
function upgradeToAdminSubscribers() {
  if (adminSubscribersInitialized) return;
  adminSubscribersInitialized = true;
  console.log('%c[PBR-STORE upgradeToAdminSubscribers]', 'color:#16a34a;font-weight:bold', 'swapping blog/news to admin mode (all statuses)');

  // Unsubscribe public (published-only) listeners
  if (publicBlogUnsub) { publicBlogUnsub(); publicBlogUnsub = null; }
  if (publicNewsUnsub) { publicNewsUnsub(); publicNewsUnsub = null; }

  // Subscribe admin (all-statuses) listeners — these satisfy Firestore
  // rules because isAdmin() returns true for the logged-in admin.
  blogService.subscribe((items) => storeSet({ blog: items }));
  newsService.subscribe((items) => storeSet({ news: items }));
}

// ============================================================
// init — runs once on first store access
// ============================================================
function init() {
  if (initialized || !isFirebaseConfigured) return;
  initialized = true;
  console.log('%c[PBR-STORE init]', 'color:#2563eb;font-weight:bold', 'init — public subscribers + auth listener');

  // Register role getter (used by onAuthChange to skip redundant reads)
  setCurrentRoleGetter(() => state.currentUser?.role ?? null);

  // CRITICAL: Register ALL public subscribers immediately.
  // This ensures public visitors see content without logging in.
  initPublicSubscribers();

  // Register auth listener — handles login state + page reload
  onAuthChange((user) => {
    console.log('%c[PBR-STORE onAuthChange callback]', 'color:#2563eb;font-weight:bold', {
      uid: user?.uid ?? 'null',
      role: user?.role ?? 'null',
    });
    storeSet({ currentUser: user });
    // When admin logs in, upgrade blog/news listeners to see drafts
    if (user && (user.role === 'super_admin' || user.role === 'admin' || user.role === 'editor')) {
      upgradeToAdminSubscribers();
    }
  });
}

function subscribe(listener: () => void): () => void {
  init();
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSnapshot(): AppState { return state; }
function getServerSnapshot(): AppState { return state; }

// Hook — supports both useStore() and useStore(selector)
export function useStore(): AppState;
export function useStore<T>(selector: (s: AppState) => T): T;
export function useStore<T>(selector?: (s: AppState) => T): T | AppState {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return selector ? selector(snap) : snap;
}

// ============================================================
// Helpers (kept identical to old store)
// ============================================================
export const formatCurrency = (n: number) => "Rp " + n.toLocaleString("id-ID");

export const formatDate = (s: string) => {
  try {
    return new Date(s).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  } catch { return s; }
};

// Org tree helpers
export interface PengurusTreeNode extends Pengurus {
  children: PengurusTreeNode[];
  level: number;
}

export function getRootPengurus(all: Pengurus[]): Pengurus[] {
  return all.filter((p) => !p.parentId).sort((a, b) => a.order - b.order);
}

export function getChildrenPengurus(all: Pengurus[], parentId: string): Pengurus[] {
  return all.filter((p) => p.parentId === parentId).sort((a, b) => a.order - b.order);
}

export function buildPengurusTree(all: Pengurus[], options: { onlyActive?: boolean } = {}): PengurusTreeNode[] {
  const { onlyActive = true } = options;
  const filtered = onlyActive ? all.filter((p) => p.status === "active") : all;
  const buildNode = (p: Pengurus, level: number): PengurusTreeNode => {
    const children = filtered.filter((c) => c.parentId === p.id).sort((a, b) => a.order - b.order).map((c) => buildNode(c, level + 1));
    return { ...p, children, level };
  };
  return filtered.filter((p) => !p.parentId).sort((a, b) => a.order - b.order).map((p) => buildNode(p, 0));
}

export function getAncestors(all: Pengurus[], id: string): Pengurus[] {
  const ancestors: Pengurus[] = [];
  let current = all.find((p) => p.id === id);
  while (current?.parentId) {
    const parent = all.find((p) => p.id === current!.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }
  return ancestors;
}

export function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}
