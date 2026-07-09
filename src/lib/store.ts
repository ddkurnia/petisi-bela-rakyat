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
// UI components do NOT need to change.
// ============================================================

import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import {
  isFirebaseConfigured,
} from "@/lib/firebase/config";
import {
  onAuthChange, loginWithEmail, loginWithGoogle, logout as fbLogout,
  setCurrentRoleGetter,
  type AppUser, type Role,
} from "@/lib/firebase/auth";
import {
  blogService, newsService, campaignService,
  pengurusService, penasehatService, relawanService,
  supporterService, galleryService, workService,
  transparencyService, reportService, settingsService, messageService,
} from "@/services";

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
// Role permissions (kept identical to old store)
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
// State shape
// ============================================================
interface AppState {
  currentUser: AppUser | null;
  login: (email: string, password: string) => Promise<boolean>;
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
// Singleton store (module-level state)
// ============================================================
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const handleErr = (err: any, msg = "Operasi gagal") => {
  console.error("[store]", err);
  toast.error(msg);
};

let state: AppState = {
  currentUser: null,
  login: async (email, password) => {
    const res = await loginWithEmail(email, password);
    if (res.success && res.user) {
      storeSet({ currentUser: res.user });
      console.log('%c[PBR-STORE] login set currentUser', 'color:#16a34a;font-weight:bold', { role: res.user.role });
      // Register Firestore subscribers now that user is logged in
      initDataSubscribers();
      return true;
    }
    return false;
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
    const merged = { ...state.settings, ...s } as SiteSettings;
    storeSet({ settings: merged });
    settingsService.get().then((doc) => {
      const settingsDoc = doc as (SiteSettings & { id?: string }) | null;
      if (settingsDoc?.id) settingsService.update(settingsDoc.id, s).catch((e) => handleErr(e));
      else settingsService.create(merged).catch((e) => handleErr(e));
    });
  },
  updateHomepage: (s) => state.updateSettings({ homepage: { ...state.settings.homepage, ...s } as any }),
  updateAbout: (s) => state.updateSettings({ about: { ...state.settings.about, ...s } as any }),
  updateContact: (s) => state.updateSettings({ contact: { ...state.settings.contact, ...s } as any }),
  updateSocials: (s) => state.updateSettings({ socials: s }),
  updateFooter: (s) => state.updateSettings({ footer: { ...state.settings.footer, ...s } as any }),

  addPengurus: (m) => { pengurusService.create({ ...m, slug: m.slug || slugify(m.name) } as any).catch((e) => handleErr(e)); },
  updatePengurus: (id, m) => { pengurusService.update(id, m).catch((e) => handleErr(e)); },
  deletePengurus: (id) => { pengurusService.delete(id).catch((e) => handleErr(e)); },

  addPenasehat: (p) => { penasehatService.create(p as any).catch((e) => handleErr(e)); },
  updatePenasehat: (id, p) => { penasehatService.update(id, p).catch((e) => handleErr(e)); },
  deletePenasehat: (id) => { penasehatService.delete(id).catch((e) => handleErr(e)); },

  addRelawan: (r) => { relawanService.create(r as any).catch((e) => handleErr(e)); },
  updateRelawan: (id, r) => { relawanService.update(id, r).catch((e) => handleErr(e)); },
  deleteRelawan: (id) => { relawanService.delete(id).catch((e) => handleErr(e)); },

  addTeam: (m) => { /* legacy - route to pengurus */ pengurusService.create({ ...m, slug: m.slug || slugify(m.name), gelar: "", jabatan: m.position, parentId: null, whatsapp: "", email: "", status: "active" } as any).catch((e) => handleErr(e)); },
  updateTeam: (id, m) => { pengurusService.update(id, m as any).catch((e) => handleErr(e)); },
  deleteTeam: (id) => { pengurusService.delete(id).catch((e) => handleErr(e)); },

  addBlog: (p) => { blogService.create({ ...p, slug: p.slug || slugify(p.title), views: 0, shares: 0 } as any).catch((e) => handleErr(e)); },
  updateBlog: (id, p) => { blogService.update(id, p).catch((e) => handleErr(e)); },
  deleteBlog: (id) => { blogService.delete(id).catch((e) => handleErr(e)); },
  incrementBlogView: (id) => { blogService.incrementView(id).catch(() => {}); },
  incrementBlogShare: (id) => { blogService.incrementShare(id).catch(() => {}); },

  addNews: (p) => { newsService.create({ ...p, slug: p.slug || slugify(p.title), views: 0, shares: 0 } as any).catch((e) => handleErr(e)); },
  updateNews: (id, p) => { newsService.update(id, p).catch((e) => handleErr(e)); },
  deleteNews: (id) => { newsService.delete(id).catch((e) => handleErr(e)); },
  incrementNewsView: (id) => { newsService.incrementView(id).catch(() => {}); },
  incrementNewsShare: (id) => { newsService.incrementShare(id).catch(() => {}); },

  addCampaign: (c) => { campaignService.create({ ...c, slug: c.slug || slugify(c.title), shares: 0 } as any).catch((e) => handleErr(e)); },
  updateCampaign: (id, c) => { campaignService.update(id, c).catch((e) => handleErr(e)); },
  deleteCampaign: (id) => { campaignService.delete(id).catch((e) => handleErr(e)); },
  incrementCampaignShare: (id) => { campaignService.incrementShare(id).catch(() => {}); },

  addSupporter: (s) => { supporterService.create(s as any).catch((e) => handleErr(e)); },
  updateSupporter: (id, s) => { supporterService.update(id, s).catch((e) => handleErr(e)); },
  deleteSupporter: (id) => { supporterService.delete(id).catch((e) => handleErr(e)); },

  addGallery: (g) => { galleryService.create(g as any).catch((e) => handleErr(e)); },
  updateGallery: (id, g) => { galleryService.update(id, g).catch((e) => handleErr(e)); },
  deleteGallery: (id) => { galleryService.delete(id).catch((e) => handleErr(e)); },

  addTransparency: (t) => { transparencyService.create(t as any).catch((e) => handleErr(e)); },
  updateTransparency: (id, t) => { transparencyService.update(id, t).catch((e) => handleErr(e)); },
  deleteTransparency: (id) => { transparencyService.delete(id).catch((e) => handleErr(e)); },
  addReport: (r) => { reportService.create(r as any).catch((e) => handleErr(e)); },
  deleteReport: (id) => { reportService.delete(id).catch((e) => handleErr(e)); },

  addWork: (w) => { workService.create({ ...w, slug: w.slug || slugify(w.title) } as any).catch((e) => handleErr(e)); },
  updateWork: (id, w) => { workService.update(id, w).catch((e) => handleErr(e)); },
  deleteWork: (id) => { workService.delete(id).catch((e) => handleErr(e)); },

  addMessage: (m) => { messageService.create(m).catch((e) => handleErr(e, "Gagal mengirim pesan")); },
};

// ============================================================
// External store mechanics (useSyncExternalStore)
// ============================================================
const listeners = new Set<() => void>();
let initialized = false;

function storeSet(partial: Partial<AppState>) {
  // GUARD: never downgrade from super_admin/admin to editor
  // This prevents onAuthChange or any other source from overwriting
  // the correct role with editor fallback
  if (partial.currentUser !== undefined) {
    const before = state.currentUser?.role ?? null;
    const after = partial.currentUser?.role ?? null;
    const isDowngrade = (before === 'super_admin' || before === 'admin') && after === 'editor';

    console.log('%c[PBR-STORE storeSet]', 'color:#2563eb;font-weight:bold', 'currentUser', {
      before_role: before,
      after_role: after,
      isDowngrade,
    });

    // BLOCK downgrade — keep existing super_admin/admin
    if (isDowngrade) {
      console.log('%c[PBR-STORE storeSet BLOCKED downgrade]', 'color:#dc2626;font-weight:bold', {
        before, after,
      });
      // Keep existing currentUser, don't apply the downgrade
      // But still notify listeners in case other fields changed
      listeners.forEach((l) => l());
      return;
    }
  }
  state = { ...state, ...partial };
  listeners.forEach((l) => l());
}

function init() {
  if (initialized || !isFirebaseConfigured) return;
  initialized = true;
  console.log('%c[PBR-STORE init]', 'color:#2563eb;font-weight:bold', 'initializing store — auth listener ONLY');

  // Register role getter
  setCurrentRoleGetter(() => state.currentUser?.role ?? null);

  // ONLY register auth listener — NO Firestore subscribers yet.
  // Firestore subscribers are registered in initDataSubscribers()
  // AFTER login completes. This prevents 12+ onSnapshot listeners
  // from firing with permission-denied (user not logged in yet),
  // which overloads Firestore SDK and causes readUserRole to hang
  // for 21+ seconds during login.
  onAuthChange((user) => {
    console.log('%c[PBR-STORE onAuthChange callback]', 'color:#2563eb;font-weight:bold', {
      uid: user?.uid ?? 'null',
      role: user?.role ?? 'null',
    });
    storeSet({ currentUser: user });
    // After login, register Firestore subscribers
    if (user) {
      initDataSubscribers();
    }
  });
}

let dataSubscribersInitialized = false;
function initDataSubscribers() {
  if (dataSubscribersInitialized) return;
  dataSubscribersInitialized = true;
  console.log('%c[PBR-STORE initDataSubscribers]', 'color:#2563eb;font-weight:bold', 'registering Firestore listeners');

  // Settings (realtime)
  settingsService.subscribe((s) => storeSet({ settings: s || DEFAULT_SETTINGS }));

  // Collections (realtime)
  blogService.subscribe((items) => storeSet({ blog: items }));
  newsService.subscribe((items) => storeSet({ news: items }));
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
