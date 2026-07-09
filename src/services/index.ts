// Service Layer - one service per Firestore collection
// ============================================================
// Each service exposes:
//   - getAll / getById / getBySlug  (one-off reads)
//   - create / update / delete      (writes via freshDb)
//   - subscribe                      (realtime, ALL docs — admin)
//   - subscribePublished             (realtime, only status=published — public)
// ============================================================
import {
  getAll, getById, getFirstByField, createItem, updateItem, deleteItem,
  incrementField, setItemMerged, subscribeToCollection, subscribeToFirstDoc,
  subscribeToDoc, where, limit,
} from '@/lib/firebase/firestore';
import { COLLECTIONS } from '@/lib/firebase/config';
import type {
  BlogPost, NewsArticle, Campaign, Pengurus, Penasehat, Relawan,
  Supporter, GalleryItem, WorkCategory, TransparencyRecord, TransparencyReport,
  SiteSettings, Message, User,
} from '@/types';

const now = () => new Date().toISOString();

// Settings singleton — uses fixed doc ID 'main' for consistency.
// Both save() and subscribe() target this specific doc by ID.
export const SETTINGS_DOC_ID = 'main';

// ============================================================
// Blog
// ============================================================
export const blogService = {
  getAll: () => getAll<BlogPost>(COLLECTIONS.BLOG),
  getById: (id: string) => getById<BlogPost>(COLLECTIONS.BLOG, id),
  getBySlug: (slug: string) => getFirstByField<BlogPost>(COLLECTIONS.BLOG, 'slug', slug),
  create: (data: Omit<BlogPost, 'id'>) => createItem(COLLECTIONS.BLOG, data as any),
  update: (id: string, data: Partial<BlogPost>) => updateItem(COLLECTIONS.BLOG, id, data),
  delete: (id: string) => deleteItem(COLLECTIONS.BLOG, id),
  incrementView: (id: string) => incrementField(COLLECTIONS.BLOG, id, 'views', 1),
  incrementShare: (id: string) => incrementField(COLLECTIONS.BLOG, id, 'shares', 1),
  // Admin sees all (including drafts)
  subscribe: (cb: (items: BlogPost[]) => void) => subscribeToCollection<BlogPost>(COLLECTIONS.BLOG, cb),
  // Public sees only published (Firestore rules require this filter)
  subscribePublished: (cb: (items: BlogPost[]) => void) =>
    subscribeToCollection<BlogPost>(COLLECTIONS.BLOG, cb, where('status', '==', 'published')),
};

// ============================================================
// News
// ============================================================
export const newsService = {
  getAll: () => getAll<NewsArticle>(COLLECTIONS.NEWS),
  getById: (id: string) => getById<NewsArticle>(COLLECTIONS.NEWS, id),
  getBySlug: (slug: string) => getFirstByField<NewsArticle>(COLLECTIONS.NEWS, 'slug', slug),
  create: (data: Omit<NewsArticle, 'id'>) => createItem(COLLECTIONS.NEWS, data as any),
  update: (id: string, data: Partial<NewsArticle>) => updateItem(COLLECTIONS.NEWS, id, data),
  delete: (id: string) => deleteItem(COLLECTIONS.NEWS, id),
  incrementView: (id: string) => incrementField(COLLECTIONS.NEWS, id, 'views', 1),
  incrementShare: (id: string) => incrementField(COLLECTIONS.NEWS, id, 'shares', 1),
  subscribe: (cb: (items: NewsArticle[]) => void) => subscribeToCollection<NewsArticle>(COLLECTIONS.NEWS, cb),
  subscribePublished: (cb: (items: NewsArticle[]) => void) =>
    subscribeToCollection<NewsArticle>(COLLECTIONS.NEWS, cb, where('status', '==', 'published')),
};

// ============================================================
// Campaigns
// ============================================================
export const campaignService = {
  getAll: () => getAll<Campaign>(COLLECTIONS.CAMPAIGNS),
  getById: (id: string) => getById<Campaign>(COLLECTIONS.CAMPAIGNS, id),
  getBySlug: (slug: string) => getFirstByField<Campaign>(COLLECTIONS.CAMPAIGNS, 'slug', slug),
  create: (data: Omit<Campaign, 'id'>) => createItem(COLLECTIONS.CAMPAIGNS, data as any),
  update: (id: string, data: Partial<Campaign>) => updateItem(COLLECTIONS.CAMPAIGNS, id, data),
  delete: (id: string) => deleteItem(COLLECTIONS.CAMPAIGNS, id),
  incrementShare: (id: string) => incrementField(COLLECTIONS.CAMPAIGNS, id, 'shares', 1),
  incrementSupporter: (id: string) => incrementField(COLLECTIONS.CAMPAIGNS, id, 'supporters', 1),
  subscribe: (cb: (items: Campaign[]) => void) => subscribeToCollection<Campaign>(COLLECTIONS.CAMPAIGNS, cb),
};

// ============================================================
// Pengurus
// ============================================================
export const pengurusService = {
  getAll: () => getAll<Pengurus>(COLLECTIONS.PENGURUS),
  getById: (id: string) => getById<Pengurus>(COLLECTIONS.PENGURUS, id),
  getBySlug: (slug: string) => getFirstByField<Pengurus>(COLLECTIONS.PENGURUS, 'slug', slug),
  create: (data: Omit<Pengurus, 'id'>) => createItem(COLLECTIONS.PENGURUS, data as any),
  update: (id: string, data: Partial<Pengurus>) => updateItem(COLLECTIONS.PENGURUS, id, data),
  delete: (id: string) => deleteItem(COLLECTIONS.PENGURUS, id),
  subscribe: (cb: (items: Pengurus[]) => void) => subscribeToCollection<Pengurus>(COLLECTIONS.PENGURUS, cb),
};

// ============================================================
// Penasehat
// ============================================================
export const penasehatService = {
  getAll: () => getAll<Penasehat>(COLLECTIONS.PENASEHAT),
  getById: (id: string) => getById<Penasehat>(COLLECTIONS.PENASEHAT, id),
  create: (data: Omit<Penasehat, 'id'>) => createItem(COLLECTIONS.PENASEHAT, data as any),
  update: (id: string, data: Partial<Penasehat>) => updateItem(COLLECTIONS.PENASEHAT, id, data),
  delete: (id: string) => deleteItem(COLLECTIONS.PENASEHAT, id),
  subscribe: (cb: (items: Penasehat[]) => void) => subscribeToCollection<Penasehat>(COLLECTIONS.PENASEHAT, cb),
};

// ============================================================
// Relawan
// ============================================================
export const relawanService = {
  getAll: () => getAll<Relawan>(COLLECTIONS.RELAWAN),
  getById: (id: string) => getById<Relawan>(COLLECTIONS.RELAWAN, id),
  create: (data: Omit<Relawan, 'id'>) => createItem(COLLECTIONS.RELAWAN, data as any),
  update: (id: string, data: Partial<Relawan>) => updateItem(COLLECTIONS.RELAWAN, id, data),
  delete: (id: string) => deleteItem(COLLECTIONS.RELAWAN, id),
  subscribe: (cb: (items: Relawan[]) => void) => subscribeToCollection<Relawan>(COLLECTIONS.RELAWAN, cb),
};

// ============================================================
// Supporters
// ============================================================
export const supporterService = {
  getAll: () => getAll<Supporter>(COLLECTIONS.SUPPORTERS),
  getById: (id: string) => getById<Supporter>(COLLECTIONS.SUPPORTERS, id),
  create: (data: Omit<Supporter, 'id'>) => createItem(COLLECTIONS.SUPPORTERS, data as any),
  update: (id: string, data: Partial<Supporter>) => updateItem(COLLECTIONS.SUPPORTERS, id, data),
  delete: (id: string) => deleteItem(COLLECTIONS.SUPPORTERS, id),
  subscribe: (cb: (items: Supporter[]) => void) => subscribeToCollection<Supporter>(COLLECTIONS.SUPPORTERS, cb),
};

// ============================================================
// Gallery
// ============================================================
export const galleryService = {
  getAll: () => getAll<GalleryItem>(COLLECTIONS.GALLERY),
  getById: (id: string) => getById<GalleryItem>(COLLECTIONS.GALLERY, id),
  create: (data: Omit<GalleryItem, 'id'>) => createItem(COLLECTIONS.GALLERY, data as any),
  update: (id: string, data: Partial<GalleryItem>) => updateItem(COLLECTIONS.GALLERY, id, data),
  delete: (id: string) => deleteItem(COLLECTIONS.GALLERY, id),
  subscribe: (cb: (items: GalleryItem[]) => void) => subscribeToCollection<GalleryItem>(COLLECTIONS.GALLERY, cb),
};

// ============================================================
// Work categories
// ============================================================
export const workService = {
  getAll: () => getAll<WorkCategory>(COLLECTIONS.WORK),
  getById: (id: string) => getById<WorkCategory>(COLLECTIONS.WORK, id),
  getBySlug: (slug: string) => getFirstByField<WorkCategory>(COLLECTIONS.WORK, 'slug', slug),
  create: (data: Omit<WorkCategory, 'id'>) => createItem(COLLECTIONS.WORK, data as any),
  update: (id: string, data: Partial<WorkCategory>) => updateItem(COLLECTIONS.WORK, id, data),
  delete: (id: string) => deleteItem(COLLECTIONS.WORK, id),
  subscribe: (cb: (items: WorkCategory[]) => void) => subscribeToCollection<WorkCategory>(COLLECTIONS.WORK, cb),
};

// ============================================================
// Transparency
// ============================================================
export const transparencyService = {
  getAll: () => getAll<TransparencyRecord>(COLLECTIONS.TRANSPARENCY),
  getById: (id: string) => getById<TransparencyRecord>(COLLECTIONS.TRANSPARENCY, id),
  create: (data: Omit<TransparencyRecord, 'id'>) => createItem(COLLECTIONS.TRANSPARENCY, data as any),
  update: (id: string, data: Partial<TransparencyRecord>) => updateItem(COLLECTIONS.TRANSPARENCY, id, data),
  delete: (id: string) => deleteItem(COLLECTIONS.TRANSPARENCY, id),
  subscribe: (cb: (items: TransparencyRecord[]) => void) => subscribeToCollection<TransparencyRecord>(COLLECTIONS.TRANSPARENCY, cb),
};

// ============================================================
// Reports
// ============================================================
export const reportService = {
  getAll: () => getAll<TransparencyReport>(COLLECTIONS.REPORTS),
  getById: (id: string) => getById<TransparencyReport>(COLLECTIONS.REPORTS, id),
  create: (data: Omit<TransparencyReport, 'id'>) => createItem(COLLECTIONS.REPORTS, data as any),
  update: (id: string, data: Partial<TransparencyReport>) => updateItem(COLLECTIONS.REPORTS, id, data),
  delete: (id: string) => deleteItem(COLLECTIONS.REPORTS, id),
  subscribe: (cb: (items: TransparencyReport[]) => void) => subscribeToCollection<TransparencyReport>(COLLECTIONS.REPORTS, cb),
};

// ============================================================
// Settings — singleton document with ID 'main'
// ============================================================
// CRITICAL: subscribe() targets the SPECIFIC doc 'settings/main',
// NOT the first doc in the collection. If we used subscribeToFirstDoc,
// and there were multiple settings docs (e.g. from old setup-admin.mjs
// that used .add() with random ID), the homepage might listen to
// the WRONG doc while admin saves to 'main'. This caused realtime
// updates to not appear on the public homepage.
// ============================================================
export const settingsService = {
  // One-off read
  get: async (): Promise<SiteSettings | null> => getById<SiteSettings>(COLLECTIONS.SETTINGS, SETTINGS_DOC_ID),
  // Write (creates or merges) — always to doc ID 'main'
  save: (data: Partial<SiteSettings>) => setItemMerged(COLLECTIONS.SETTINGS, SETTINGS_DOC_ID, data as any),
  // Realtime subscribe to the SPECIFIC 'main' doc
  subscribe: (cb: (s: SiteSettings | null) => void) =>
    subscribeToDoc<SiteSettings>(COLLECTIONS.SETTINGS, SETTINGS_DOC_ID, cb),
};

// ============================================================
// Messages (contact form submissions)
// ============================================================
export const messageService = {
  create: (data: Omit<Message, 'id'>) => createItem(COLLECTIONS.MESSAGES, { ...data, createdAt: now() } as any),
  getAll: () => getAll<Message>(COLLECTIONS.MESSAGES),
  subscribe: (cb: (items: Message[]) => void) => subscribeToCollection<Message>(COLLECTIONS.MESSAGES, cb),
};

// ============================================================
// Users (admin role management)
// ============================================================
export const userService = {
  getAll: () => getAll<User>(COLLECTIONS.USERS),
  getByUid: (uid: string) => getById<User>(COLLECTIONS.USERS, uid),
  create: (data: User) => createItem(COLLECTIONS.USERS, data as any),
  update: (id: string, data: Partial<User>) => updateItem(COLLECTIONS.USERS, id, data),
  delete: (id: string) => deleteItem(COLLECTIONS.USERS, id),
};

// Re-export `limit` for consumers that need pagination
export { limit };
