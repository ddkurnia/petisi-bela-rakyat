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
import {
  initializeApp as fbInitApp, type FirebaseApp,
} from "firebase/app";
import {
  getFirestore as fbGetFirestore, doc as fbDoc, collection as fbCollection,
  addDoc as fbAddDoc, setDoc as fbSetDoc, updateDoc as fbUpdateDoc,
  deleteDoc as fbDeleteDoc, getDocs as fbGetDocs,
  type Firestore as FbFirestore,
} from "firebase/firestore";

// ============================================================
// FRESH Firestore instance for WRITES — bypass main instance
// ============================================================
// The main Firestore instance (from firestore.ts) has accumulated
// bad state from onSnapshot listeners. Writes via services hang.
// This fresh instance has NO listeners, NO cache, NO bad state.
// Same approach as readUserRole (which works in 872ms).
// ============================================================
let writeApp: FirebaseApp | null = null;
let writeDb: FbFirestore | null = null;

function getWriteDb(): FbFirestore {
  if (writeDb) return writeDb;
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  writeApp = fbInitApp(config as any, 'writer-' + Date.now());
  writeDb = fbGetFirestore(writeApp);
  console.log('%c[PBR-STORE] created FRESH Firestore instance for writes', 'color:#9333ea;font-weight:bold');
  return writeDb;
}

// Helper: write to Firestore using fresh instance
async function freshCreate(collectionName: string, data: any): Promise<string> {
  const wdb = getWriteDb();
  const { id, ...rest } = data;
  const ref = await fbAddDoc(fbCollection(wdb, collectionName), {
    ...rest,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
}

async function freshUpdate(collectionName: string, id: string, data: any): Promise<void> {
  const wdb = getWriteDb();
  await fbUpdateDoc(fbDoc(wdb, collectionName, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  } as any);
}

async function freshDelete(collectionName: string, id: string): Promise<void> {
  const wdb = getWriteDb();
  await fbDeleteDoc(fbDoc(wdb, collectionName, id));
}

async function freshGetAll(collectionName: string): Promise<any[]> {
  const wdb = getWriteDb();
  const snap = await fbGetDocs(fbCollection(wdb, collectionName));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

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

let state: AppState = {
  currentUser: null,
  login: async (email, password) => {
    const res = await loginWithEmail(email, password);
    if (res.success && res.user) {
      storeSet({ currentUser: res.user });
      console.log('%c[PBR-STORE] login set currentUser', 'color:#16a34a;font-weight:bold', { role: res.user.role });
      // initDataSubscribers() already called in init() — no need to call again
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
    console.log('%c[PBR-STORE] updateSettings', 'color:#16a34a;font-weight:bold', s);

    // Use FRESH Firestore instance — main instance hangs
    (async () => {
      try {
        const fbUser = getCurrentFirebaseUser();
        if (fbUser) await fbUser.getIdToken(true);

        // Read existing settings using fresh instance
        const all = await freshGetAll(COLLECTIONS.SETTINGS);
        const existing = all[0] as (SiteSettings & { id?: string }) | null;

        if (existing?.id) {
          await freshUpdate(COLLECTIONS.SETTINGS, existing.id, s);
        } else {
          await freshCreate(COLLECTIONS.SETTINGS, merged);
        }

        toast.success("Pengaturan tersimpan ke Firestore");
        console.log('%c[PBR-STORE] settings SAVED to Firestore', 'color:#16a34a;font-weight:bold');
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

  addPengurus: (m) => { freshCreate(COLLECTIONS.PENGURUS, { ...m, slug: m.slug || slugify(m.name) }).then(() => toast.success("Pengurus ditambahkan")).catch((e) => handleErr(e, "Gagal tambah pengurus")); },
  updatePengurus: (id, m) => { freshUpdate(COLLECTIONS.PENGURUS, id, m).then(() => toast.success("Pengurus diperbarui")).catch((e) => handleErr(e, "Gagal update pengurus")); },
  deletePengurus: (id) => { freshDelete(COLLECTIONS.PENGURUS, id).then(() => toast.success("Pengurus dihapus")).catch((e) => handleErr(e, "Gagal hapus pengurus")); },

  addPenasehat: (p) => { freshCreate(COLLECTIONS.PENASEHAT, p).then(() => toast.success("Penasehat ditambahkan")).catch((e) => handleErr(e, "Gagal tambah penasehat")); },
  updatePenasehat: (id, p) => { freshUpdate(COLLECTIONS.PENASEHAT, id, p).then(() => toast.success("Penasehat diperbarui")).catch((e) => handleErr(e, "Gagal update penasehat")); },
  deletePenasehat: (id) => { freshDelete(COLLECTIONS.PENASEHAT, id).then(() => toast.success("Penasehat dihapus")).catch((e) => handleErr(e, "Gagal hapus penasehat")); },

  addRelawan: (r) => { freshCreate(COLLECTIONS.RELAWAN, r).then(() => toast.success("Relawan ditambahkan")).catch((e) => handleErr(e, "Gagal tambah relawan")); },
  updateRelawan: (id, r) => { freshUpdate(COLLECTIONS.RELAWAN, id, r).then(() => toast.success("Relawan diperbarui")).catch((e) => handleErr(e, "Gagal update relawan")); },
  deleteRelawan: (id) => { freshDelete(COLLECTIONS.RELAWAN, id).then(() => toast.success("Relawan dihapus")).catch((e) => handleErr(e, "Gagal hapus relawan")); },

  addTeam: (m) => { freshCreate(COLLECTIONS.PENGURUS, { ...m, slug: m.slug || slugify(m.name), gelar: "", jabatan: m.position, parentId: null, whatsapp: "", email: "", status: "active" }).then(() => toast.success("Tim ditambahkan")).catch((e) => handleErr(e, "Gagal tambah tim")); },
  updateTeam: (id, m) => { freshUpdate(COLLECTIONS.PENGURUS, id, m as any).then(() => toast.success("Tim diperbarui")).catch((e) => handleErr(e, "Gagal update tim")); },
  deleteTeam: (id) => { freshDelete(COLLECTIONS.PENGURUS, id).then(() => toast.success("Tim dihapus")).catch((e) => handleErr(e, "Gagal hapus tim")); },

  addBlog: (p) => { freshCreate(COLLECTIONS.BLOG, { ...p, slug: p.slug || slugify(p.title), views: 0, shares: 0 }).then(() => toast.success("Blog ditambahkan")).catch((e) => handleErr(e, "Gagal tambah blog")); },
  updateBlog: (id, p) => { freshUpdate(COLLECTIONS.BLOG, id, p).then(() => toast.success("Blog diperbarui")).catch((e) => handleErr(e, "Gagal update blog")); },
  deleteBlog: (id) => { freshDelete(COLLECTIONS.BLOG, id).then(() => toast.success("Blog dihapus")).catch((e) => handleErr(e, "Gagal hapus blog")); },
  incrementBlogView: (id) => { /* TODO: fresh increment */ },
  incrementBlogShare: (id) => { /* TODO: fresh increment */ },

  addNews: (p) => { freshCreate(COLLECTIONS.NEWS, { ...p, slug: p.slug || slugify(p.title), views: 0, shares: 0 }).then(() => toast.success("Berita ditambahkan")).catch((e) => handleErr(e, "Gagal tambah berita")); },
  updateNews: (id, p) => { freshUpdate(COLLECTIONS.NEWS, id, p).then(() => toast.success("Berita diperbarui")).catch((e) => handleErr(e, "Gagal update berita")); },
  deleteNews: (id) => { freshDelete(COLLECTIONS.NEWS, id).then(() => toast.success("Berita dihapus")).catch((e) => handleErr(e, "Gagal hapus berita")); },
  incrementNewsView: (id) => { /* TODO: fresh increment */ },
  incrementNewsShare: (id) => { /* TODO: fresh increment */ },

  addCampaign: (c) => { freshCreate(COLLECTIONS.CAMPAIGNS, { ...c, slug: c.slug || slugify(c.title), shares: 0 }).then(() => toast.success("Kampanye ditambahkan")).catch((e) => handleErr(e, "Gagal tambah kampanye")); },
  updateCampaign: (id, c) => { freshUpdate(COLLECTIONS.CAMPAIGNS, id, c).then(() => toast.success("Kampanye diperbarui")).catch((e) => handleErr(e, "Gagal update kampanye")); },
  deleteCampaign: (id) => { freshDelete(COLLECTIONS.CAMPAIGNS, id).then(() => toast.success("Kampanye dihapus")).catch((e) => handleErr(e, "Gagal hapus kampanye")); },
  incrementCampaignShare: (id) => { /* TODO: fresh increment */ },

  addSupporter: (s) => { freshCreate(COLLECTIONS.SUPPORTERS, s).then(() => toast.success("Tokoh ditambahkan")).catch((e) => handleErr(e, "Gagal tambah tokoh")); },
  updateSupporter: (id, s) => { freshUpdate(COLLECTIONS.SUPPORTERS, id, s).then(() => toast.success("Tokoh diperbarui")).catch((e) => handleErr(e, "Gagal update tokoh")); },
  deleteSupporter: (id) => { freshDelete(COLLECTIONS.SUPPORTERS, id).then(() => toast.success("Tokoh dihapus")).catch((e) => handleErr(e, "Gagal hapus tokoh")); },

  addGallery: (g) => { freshCreate(COLLECTIONS.GALLERY, g).then(() => toast.success("Media ditambahkan")).catch((e) => handleErr(e, "Gagal tambah media")); },
  updateGallery: (id, g) => { freshUpdate(COLLECTIONS.GALLERY, id, g).then(() => toast.success("Media diperbarui")).catch((e) => handleErr(e, "Gagal update media")); },
  deleteGallery: (id) => { freshDelete(COLLECTIONS.GALLERY, id).then(() => toast.success("Media dihapus")).catch((e) => handleErr(e, "Gagal hapus media")); },

  addTransparency: (t) => { freshCreate(COLLECTIONS.TRANSPARENCY, t).then(() => toast.success("Transparansi ditambahkan")).catch((e) => handleErr(e, "Gagal tambah transparansi")); },
  updateTransparency: (id, t) => { freshUpdate(COLLECTIONS.TRANSPARENCY, id, t).then(() => toast.success("Transparansi diperbarui")).catch((e) => handleErr(e, "Gagal update transparansi")); },
  deleteTransparency: (id) => { freshDelete(COLLECTIONS.TRANSPARENCY, id).then(() => toast.success("Transparansi dihapus")).catch((e) => handleErr(e, "Gagal hapus transparansi")); },
  addReport: (r) => { freshCreate(COLLECTIONS.REPORTS, r).then(() => toast.success("Laporan ditambahkan")).catch((e) => handleErr(e, "Gagal tambah laporan")); },
  deleteReport: (id) => { freshDelete(COLLECTIONS.REPORTS, id).then(() => toast.success("Laporan dihapus")).catch((e) => handleErr(e, "Gagal hapus laporan")); },

  addWork: (w) => { freshCreate(COLLECTIONS.WORK, { ...w, slug: w.slug || slugify(w.title) }).then(() => toast.success("Kategori kerja ditambahkan")).catch((e) => handleErr(e, "Gagal tambah kategori")); },
  updateWork: (id, w) => { freshUpdate(COLLECTIONS.WORK, id, w).then(() => toast.success("Kategori kerja diperbarui")).catch((e) => handleErr(e, "Gagal update kategori")); },
  deleteWork: (id) => { freshDelete(COLLECTIONS.WORK, id).then(() => toast.success("Kategori kerja dihapus")).catch((e) => handleErr(e, "Gagal hapus kategori")); },

  addMessage: (m) => { freshCreate(COLLECTIONS.MESSAGES, m).then(() => toast.success("Pesan terkirim")).catch((e) => handleErr(e, "Gagal mengirim pesan")); },
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

    console.log('%c[PBR-STORE storeSet]', 'color:#2563eb;font-weight:bold', 'currentUser', {
      before_role: before,
      after_role: after,
      isDowngrade,
    });

    if (isDowngrade) {
      console.log('%c[PBR-STORE storeSet BLOCKED downgrade]', 'color:#dc2626;font-weight:bold', {
        before, after,
      });
      listeners.forEach((l) => l());
      return;
    }
  }
  state = { ...state, ...partial };
  // Expose state to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).__pbr_storeState = state;
  }
  listeners.forEach((l) => l());
}

function init() {
  if (initialized || !isFirebaseConfigured) return;
  initialized = true;
  console.log('%c[PBR-STORE init]', 'color:#2563eb;font-weight:bold', 'initializing store');

  // Register role getter
  setCurrentRoleGetter(() => state.currentUser?.role ?? null);

  // Register Firestore subscribers IMMEDIATELY for ALL pages.
  // Firestore rules allow public read for:
  //   - settings, campaigns, pengurus, penasehat, relawan,
  //     supporters, gallery, work, transparency, reports
  //   - blog, news: only published items (status == 'published')
  // So onSnapshot will NOT get permission-denied for public content.
  // Admin-only content (drafts, etc.) will be visible only after login
  // because rules require isAdmin() for those.
  initDataSubscribers();

  // Register auth listener (for login state + page reload)
  onAuthChange((user) => {
    console.log('%c[PBR-STORE onAuthChange callback]', 'color:#2563eb;font-weight:bold', {
      uid: user?.uid ?? 'null',
      role: user?.role ?? 'null',
    });
    storeSet({ currentUser: user });
    // After login, re-subscribe to get admin-only data (drafts, etc.)
    if (user) {
      // Re-subscribe to blog/news to get ALL items (including drafts)
      // now that user is authenticated as admin
      blogService.subscribe((items) => storeSet({ blog: items }));
      newsService.subscribe((items) => storeSet({ news: items }));
    }
  });
}

let dataSubscribersInitialized = false;
function initDataSubscribers() {
  if (dataSubscribersInitialized) return;
  dataSubscribersInitialized = true;
  console.log('%c[PBR-STORE initDataSubscribers]', 'color:#2563eb;font-weight:bold', 'registering Firestore listeners');

  // Settings (realtime — public read allowed)
  settingsService.subscribe((s) => storeSet({ settings: s || DEFAULT_SETTINGS }));

  // Collections (realtime — public read allowed for all except
  // blog/news which only show published items to non-authenticated users)
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
