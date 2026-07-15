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

export interface TypographySettings {
  bodyFontSize: number;       // px, default 16
  bodyFontWeight: number;     // 300-800, default 400
  bodyLineHeight: number;     // 1.2-2.0, default 1.6
  headingFontSize: number;    // multiplier, default 1.0 (relative to base)
  headingFontWeight: number;  // 400-900, default 700
  articleFontSize: number;    // px, default 16 (khusus konten artikel blog/news)
  articleFontWeight: number;  // 300-700, default 400
  articleLineHeight: number;  // 1.4-2.2, default 1.8
  cardTitleWeight: number;    // 400-900, default 700
  cardTextSize: number;       // px, default 14
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
  typography?: TypographySettings;
  maintenance?: MaintenanceSettings;
}

export interface MaintenanceSettings {
  enabled: boolean;
  title: string;
  message: string;
  estimatedTime: string;
  allowAdminAccess: boolean;
  updatedAt?: string;
}

// ============================================================
// Surat Resmi (Official Letters)
// ============================================================
export type LetterStatus = 'draft' | 'sent' | 'failed' | 'opened' | 'replied';
export type LetterPriority = 'normal' | 'important' | 'urgent';
export type LetterTemplateType = 'permohonan' | 'pengaduan' | 'audiensi' | 'petisi' | 'keberatan' | 'klarifikasi' | 'permintaan_informasi' | 'lainnya';

export interface OfficialLetter {
  id?: string;
  letterNumber: string;
  institution: string;
  recipientName: string;
  recipientEmail: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  content: string;          // HTML from Rich Text Editor
  attachments: LetterAttachment[];
  priority: LetterPriority;
  templateType: LetterTemplateType;
  status: LetterStatus;
  opened: boolean;
  replied: boolean;
  createdAt?: string;
  sentAt?: string;
  openedAt?: string;
  replyAt?: string;
  createdBy?: string;
}

export interface LetterAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Institution {
  id?: string;
  name: string;
  email: string;
  website?: string;
  phone?: string;
  address?: string;
  category: string;  // dpr, presiden, kementerian, gubernur, bupati, ombudsman, komnas, lainnya
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

// ============================================================
// Proposal — proposal bantuan kegiatan + estimasi anggaran
// ============================================================
export interface BudgetItem {
  id: string;
  category: string;          // e.g. "Transportasi", "Konsumsi", "Honor", "Perlengkapan"
  description: string;
  quantity: number;
  unit: string;              // e.g. "orang", "pack", "hari"
  unitPrice: number;
}

export interface BankAccount {
  id: string;
  bankName: string;          // e.g. "BCA", "Mandiri", "BRI", "BSI"
  accountNumber: string;
  accountHolder: string;
  logoUrl?: string;          // optional bank logo
}

export interface Proposal {
  id: string;
  title: string;
  subtitle: string;
  description: string;        // ringkasan proposal (markdown supported)
  organizer: string;          // nama penyelenggara / penanggung jawab
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;

  // Kegiatan details
  activityName: string;
  activityDate: string;       // tanggal pelaksanaan
  activityLocation: string;
  activityDuration: string;   // e.g. "3 hari", "1 bulan"
  targetBeneficiaries: string; // siapa penerima manfaat
  expectedOutcome: string;    // hasil yang diharapkan

  // Anggaran
  budgetItems: BudgetItem[];
  currency: string;           // "IDR"

  // Donasi
  bankAccounts: BankAccount[];
  qrisUrl?: string;           // URL gambar QRIS (opsional)
  donationDeadline?: string;  // batas waktu donasi

  // Status
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// PetitionSignature — tanda tangan petisi (change.org style)
// ============================================================
export interface PetitionSignature {
  id?: string;
  campaignId: string;          // ID kampanye yang ditandatangani
  name: string;
  email: string;
  address: string;             // alamat lengkap
  city: string;                // kota/kabupaten
  province: string;            // provinsi
  // Geolocation (opsional, dari browser API)
  latitude?: number | null;
  longitude?: number | null;
  locationLabel?: string;      // reverse-geocoded label (mis. "Jakarta, ID")
  // Anti-spam
  deviceFingerprint: string;   // unique per device (localStorage + IP hash)
  ipAddress?: string;          // hashed IP (privacy-friendly)
  userAgent?: string;          // browser info
  // Metadata
  comment?: string;            // pesan dukungan (opsional)
  isVerified: boolean;         // email verification status
  createdAt?: string;
}
