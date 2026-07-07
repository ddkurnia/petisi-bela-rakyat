// All application types - single source of truth
export type Role = 'super_admin' | 'admin' | 'editor';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  photoURL?: string;
}

export interface TeamMember {
  id: string;
  slug: string;
  name: string;
  position: string;
  summary: string;
  bio: string;
  experience: string;
  responsibilities: string;
  photo: string;
  order: number;
}

export interface Pengurus {
  id: string;
  slug: string;
  name: string;
  gelar: string;
  jabatan: string;
  parentId: string | null;
  bio: string;
  experience: string;
  whatsapp: string;
  email: string;
  photo: string;
  order: number;
  status: 'active' | 'inactive';
}

export interface Penasehat {
  id: string;
  name: string;
  gelar: string;
  jabatan: string;
  bio: string;
  photo: string;
  order: number;
}

export interface Relawan {
  id: string;
  name: string;
  area: string;
  joinedAt: string;
  photo: string;
  active: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  images: string[];
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  scheduledAt?: string | null;
  metaTitle: string;
  metaDescription: string;
  status: 'published' | 'draft' | 'scheduled';
  views: number;
  shares: number;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  author: string;
  publishedAt: string;
  status: 'published' | 'draft';
  views: number;
  shares: number;
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  petitionLink: string;
  supporters: number;
  goal: number;
  status: 'active' | 'won' | 'lost' | 'planned';
  location: string;
  startedAt: string;
  shares: number;
}

export interface Supporter {
  id: string;
  name: string;
  position: string;
  statement: string;
  photo: string;
}

export interface GalleryItem {
  id: string;
  type: 'photo' | 'video' | 'document';
  title: string;
  url: string;
  thumbnail: string;
  category: string;
  description: string;
  uploadedAt: string;
}

export interface TransparencyRecord {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  source?: string;
}

export interface TransparencyReport {
  id: string;
  title: string;
  year: number;
  url: string;
  uploadedAt: string;
}

export interface WorkCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  coverImage: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  handle: string;
}

export interface ContactInfo {
  address: string;
  whatsapp: string;
  email: string;
  phone: string;
  mapEmbed: string;
  mapLink: string;
  operationHours: string;
}

export interface AboutSection {
  visi: string;
  misi: string[];
  nilai: { title: string; description: string; icon: string }[];
  sejarah: string;
  sejarahTimeline: { year: string; title: string; description: string; icon?: string }[];
  motto: string;
}

export interface FooterSettings {
  description: string;
  copyrightText: string;
  legalLinks: { label: string; url: string }[];
}

export interface HomepageSettings {
  hero: { image: string; headline: string; subheadline: string; primaryCta: string; secondaryCta: string; };
  about: { image: string; title: string; description: string; };
  work: { title: string; description: string; };
  campaigns: { title: string; description: string; };
  supporters: { title: string; description: string; };
  stats: { label: string; value: number; suffix: string }[];
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  homepage: HomepageSettings;
  about: AboutSection;
  contact: ContactInfo;
  socials: SocialLink[];
  footer: FooterSettings;
}

export interface Message {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt?: string;
}
