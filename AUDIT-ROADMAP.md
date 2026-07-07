# Audit & Roadmap Perbaikan — Petisi Bela Rakyat

> Hasil audit menyeluruh terhadap codebase `ddkurnia/petisi-bela-rakyat` pada commit `d988c0d`.
> Dokumen ini adalah single source of truth untuk semua perbaikan mendatang.
> Setiap perubahan = refactor atau penambahan pada project yang sudah ada.
> Tidak ada project baru. Tidak ada hapus fitur yang jalan. Tidak ada redesign UI.

---

## 1. Ringkasan Eksekutif

Codebase saat ini adalah **Next.js 16 + TypeScript + Tailwind + shadcn/ui** dengan UI yang sudah production-ready (homepage, 13 halaman publik, admin panel dengan 13 modul CRUD, PWA, share buttons, sitemap).

**Masalah fundamental tunggal:** Seluruh data layer menggunakan **Zustand + `persist` middleware → localStorage** (`src/lib/store.ts`, 1170 baris). Ini berarti:

- Semua "data" sebenarnya hanya ada di browser pengunjung yang sedang melihat.
- Admin mengisi konten → hanya tersimpan di localStorage admin → pengunjung lain tidak pernah melihatnya.
- Tidak ada backend. Tidak ada Firebase. Tidak ada Firestore.
- Login admin adalah hardcoded plaintext di `src/lib/store.ts` baris ~798.
- Upload gambar di-encode sebagai base64 data URL → disimpan di localStorage → **quota 5-10MB cepat penuh**, gambar hilang setelah clear cache.
- `src/lib/db.ts` + `prisma/schema.prisma` adalah scaffold Prisma SQLite yang **tidak terpakai** oleh kode aplikasi manapun.

**Prioritas #1:** Ganti seluruh data layer dari Zustand-localStorage → Firebase Firestore (realtime via `onSnapshot`), Firebase Authentication, dan Cloudinary untuk media. **Tanpa mengubah UI/UX sedikit pun.**

---

## 2. Inventory Codebase (yang sudah ada)

### 2.1 Struktur Direktori (existing — JANGAN diubah)

```
src/
├── app/
│   ├── (public)/              # 16 halaman publik + layout
│   │   ├── layout.tsx         # 'use client' — Header/Footer/PWA
│   │   ├── page.tsx           # Home (Hero + HomePage)
│   │   ├── tentang-kami/
│   │   ├── sejarah/
│   │   ├── visi-misi/
│   │   ├── struktur-organisasi/
│   │   ├── pengurus/ + [slug]/
│   │   ├── dewan-penasehat/
│   │   ├── relawan/
│   │   ├── kerja-kami/ + [slug]/
│   │   ├── kampanye/ + [slug]/
│   │   ├── news/ + [slug]/
│   │   ├── blog/ + [slug]/
│   │   ├── galeri/
│   │   ├── transparansi/
│   │   ├── kontak/
│   │   └── aplikasi/
│   ├── admin/page.tsx         # AdminPanel (client)
│   ├── layout.tsx             # Root: metadata, fonts, ThemeProvider
│   ├── sitemap.ts             # Statis (hanya static routes)
│   ├── robots.ts
│   └── api/route.ts           # Dummy "Hello world"
├── components/
│   ├── sections/              # 13 page-section components (client)
│   ├── admin/
│   │   ├── admin-panel.tsx    # Shell + login screen
│   │   ├── image-upload.tsx   # base64 → localStorage (!!)
│   │   └── sections/          # 13 manager components
│   ├── site/                  # header, footer
│   ├── pwa/                   # install-prompt, floating-actions, SW
│   ├── ui/                    # shadcn/ui (62 files)
│   ├── share-buttons.tsx
│   ├── logo.tsx, avatar.tsx, animation.tsx, theme-provider.tsx
├── lib/
│   ├── store.ts               # ⚠️ Zustand+persist (mock data source)
│   ├── db.ts                  # ⚠️ Prisma client (TIDAK terpakai)
│   ├── nav.tsx                # NavProvider (URL ↔ state)
│   └── utils.ts               # cn() helper
├── hooks/                     # use-toast, use-mobile
└── public/
    ├── pbr.png, favicon.png, icon-*.png
    ├── manifest.webmanifest, sw.js, offline.html
    ├── sitemap.xml (stale — masih pakai #/ hash routes)
    └── robots.txt
```

### 2.2 Entitas Data (didefinisikan di `src/lib/store.ts`)

| Entitas | Field Utama | Collection Firestore (proposal) |
|---|---|---|
| `User` | uid, email, displayName, role | `users` |
| `Pengurus` | id, slug, name, gelar, jabatan, parentId, bio, photo, order, status | `pengurus` |
| `Penasehat` | id, name, gelar, jabatan, bio, photo, order | `penasehat` |
| `Relawan` | id, name, area, joinedAt, photo, active | `relawan` |
| `BlogPost` | id, slug, title, excerpt, content, coverImage, images[], category, tags[], author, publishedAt, scheduledAt, metaTitle, metaDescription, status, views, shares | `blog` |
| `NewsArticle` | id, slug, title, excerpt, content, coverImage, category, author, publishedAt, status, views, shares | `news` |
| `Campaign` | id, slug, title, description, coverImage, petitionLink, supporters, goal, status, location, startedAt, shares | `campaigns` |
| `Supporter` | id, name, position, statement, photo | `supporters` |
| `GalleryItem` | id, type, title, url, thumbnail, category, description, uploadedAt | `gallery` |
| `WorkCategory` | id, slug, title, description, icon, coverImage | `work` |
| `TransparencyRecord` | id, date, type, category, description, amount, source | `transparency` |
| `TransparencyReport` | id, title, year, url, uploadedAt | `reports` |
| `SiteSettings` | siteName, tagline, logoUrl, homepage{}, about{}, contact{}, socials[], footer{} | `settings` (single doc) |

### 2.3 Admin Modul (13 manager di `src/components/admin/sections/`)

dashboard, homepage-manager, pengurus-manager, penasehat-manager, relawan-manager, blog-manager, news-manager, campaign-manager, supporter-manager, media-manager, transparency-manager, settings-manager, mobile-app-manager.

---

## 3. Temuan Audit — Dikategorikan

### 3.1 🔴 BUG & RISiko Keamanan

#### B-1. Login admin hardcoded plaintext
**File:** `src/lib/store.ts` baris ~798
```ts
const adminAccounts = [
  { email: "superadmin@petisibelarakyat.id", password: "pbr2026", role: "super_admin" ... },
  { email: "admin@petisibelarakyat.id", password: "pbr2026", ... },
  { email: "editor@petisibelarakyat.id", password: "pbr2026", ... },
];
```
**Risk:** Siapa pun yang baca source code (public repo!) punya kredensial admin. Tidak ada verifikasi server-side.
**Fix:** Ganti dengan Firebase Authentication. Role dibaca dari Firestore `users/{uid}`.

#### B-2. Upload gambar → base64 → localStorage
**File:** `src/components/admin/image-upload.tsx` baris 39-54
```ts
// Convert to base64 — in production, this would upload to Firebase Storage
const reader = new FileReader();
reader.onloadend = () => {
  setTimeout(() => { onChange(reader.result as string); ... }, 600);
};
reader.readAsDataURL(file);
```
**Risk:**
- localStorage quota ~5-10MB. Satu foto 2MB → 3 foto sudah bisa crash.
- base64 string 33% lebih besar dari binary.
- Tidak ada dedup, tidak ada CDN, tidak ada transformasi.
- Data hilang saat clear browser cache / ganti device.
**Fix:** Upload ke Cloudinary via API route. Simpan URL di Firestore.

#### B-3. `next.config.ts` ignore TypeScript errors
```ts
typescript: { ignoreBuildErrors: true }
```
**Risk:** Build production bisa ship bug yang tidak terdeteksi. Sudah ada comment di repo bahwa ini sengaja untuk skip error Prisma/unused.
**Fix:** Setelah audit, set `ignoreBuildErrors: false` dan fix semua error.

#### B-4. `reactStrictMode: false`
**Risk:** Bug side-effect tidak terdeteksi di dev mode.
**Fix:** Set `true` setelah migrasi (perlu verifikasi tidak ada double-fire issue dengan Firestore listeners).

#### B-5. Sitemap statis tidak include dynamic content
**File:** `src/app/sitemap.ts`
Hanya 16 static routes. Blog/news/campaign/pengurus detail pages dengan `[slug]` tidak tercantum.
**Fix:** Generate dari Firestore (atau minimal dari list slug).

#### B-6. `public/sitemap.xml` sudah usang (masih pakai `#/` hash routing)
**File:** `public/sitemap.xml` baris 10-13
```xml
<loc>https://petisibelarakyat.id/#/about</loc>
```
App sekarang pakai real URL routing (`/tentang-kami`, dll). File ini konflik dengan `src/app/sitemap.ts` yang benar.
**Fix:** Hapus `public/sitemap.xml` (Next.js akan serve `/sitemap.xml` dari `src/app/sitemap.ts`).

#### B-7. Seluruh page components = `'use client'`
**File:** Semua `src/app/(public)/*/page.tsx`
Tidak ada Server Component. Semua rendering happens di browser. Buruk untuk SEO & first paint.
**Risk:** Mesin pencari mungkin tidak index konten dinamis (karena harus JS-execute dulu).
**Fix (fase lanjutan):** Konversi halaman publik ke Server Components yang fetch data dari Firestore server-side, dengan client islands untuk interaktivitas (search, share, carousel).

#### B-8. Contact form tidak mengirim data ke mana pun
**File:** `src/components/sections/contact-page.tsx` baris 21-28
```ts
const handleSubmit = (e) => {
  e.preventDefault();
  setSubmitting(true);
  setTimeout(() => {
    setSubmitting(false);
    toast.success("Pesan terkirim!", { ... });
  }, 1500);
};
```
Form cuma show toast sukses palsu. Pesan tidak disimpan / tidak dikirim email.
**Fix:** Simpan ke Firestore `messages` collection + kirim notifikasi email (opsional).

#### B-9. Mobile App Manager generate APK palsu
**File:** `src/components/admin/sections/mobile-app-manager.tsx` baris 36-58
Membuat blob text file dengan extension `.apk` lalu download. Bukan APK asli.
**Fix:** Hapus fungsi generate, ganti dengan field URL input ke APK/Play Store yang diupload manual via CI/CD. Atau dokumentasikan bahwa ini hanya placeholder dan sembunyikan dari menu jika tidak digunakan.

#### B-10. Auto-publish scheduled blog hanya jalan di tab yang terbuka
**File:** `src/components/admin/sections/blog-manager.tsx` baris 32-47
`useEffect` + `setInterval` hanya berjalan saat admin panel terbuka di browser. Jika semua admin menutup tab, scheduled post tidak pernah publish.
**Fix:** Gunakan Firestore Cloud Function `onSchedule` atau cron job eksternal.

---

### 3.2 🟡 MOCK DATA & FALLBACK

#### M-1. Seluruh `src/lib/store.ts` adalah mock data store
- 1170 baris: type definitions + seed data + Zustand store dengan `persist`.
- Storage key: `pbr-storage-v5` (localStorage).
- Seed data hardcoded: 11 pengurus, dewan penasehat, relawan, blog posts, news, campaigns, supporters, gallery, transparency records, settings.
- CRUD operations hanya mutate local state.
**Fix:** Ganti dengan Firebase Firestore service layer. Seed data → migration script (one-time import ke Firestore).

#### M-2. Prisma schema tidak terpakai
**File:** `prisma/schema.prisma`
Hanya berisi `User` + `Post` default scaffold. Tidak ada model yang match dengan entitas aplikasi.
`src/lib/db.ts` meng-export `PrismaClient` tapi **tidak di-import oleh file manapun** di `src/`.
**Fix:** Hapus Prisma dependencies, schema, dan `db.ts`. Atau jika tetap dipertahankan untuk future use, dokumentasikan bahwa tidak aktif. (Saran: hapus saja, karena Firebase menggantikan perannya.)

#### M-3. Hardcoded social URLs di `layout.tsx`
**File:** `src/app/layout.tsx` baris 129-134
```ts
sameAs: [
  "https://facebook.com/petisibelarakyat",
  "https://instagram.com/petisibelarakyat",
  ...
]
```
Ini duplikat dengan `settings.socials` di store. Schema.org harusnya baca dari settings.
**Fix:** Setelah settings di-Firestore-kan, baca socials dari Firestore untuk generate schema.

#### M-4. Hardcoded site URL `petisibelarakyat.id`
Muncul di `layout.tsx`, `sitemap.ts`, `robots.ts`, `public/robots.txt`, `public/sitemap.xml`, `public/sw.js`, `public/manifest.webmanifest`.
**Fix:** Konsolidasi ke satu `siteConfig.url` env var. Tapi ini low-priority karena domain memang fixed.

---

### 3.3 🔵 BAGIAN YANG BELUM TERHUBUNG FIREBASE

#### F-1. Tidak ada file `src/lib/firebase/*` sama sekali
Repository tidak berisi:
- `firebase.ts` (app init)
- `config.ts` (env reading)
- `auth.ts` (auth service)
- `firestore.ts` (CRUD + onSnapshot)
- `cloudinary.ts` (media upload)
**Fix:** Buat semua file ini (lihat Roadmap Fase 1).

#### F-2. Tidak ada `firebase` / `firebase-admin` / `cloudinary` di `package.json`
Dependency belum diinstall.
**Fix:** `bun add firebase firebase-admin cloudinary`.

#### F-3. Tidak ada environment variables untuk Firebase/Cloudinary
Tidak ada `.env.example`, tidak ada `.env.local`, `.gitignore` tidak list `.env.local` (sebenarnya `.env.local` di-ignore default oleh Next.js, tapi tidak eksplisit).
**Fix:** Buat `.env.example` lengkap, tambahkan ke `.gitignore` eksplisit.

#### F-4. Tidak ada `firestore.rules` / `firestore.indexes.json`
**Fix:** Buat keduanya (lihat Roadmap Fase 1).

#### F-5. Tidak ada API route untuk upload media
`src/app/api/route.ts` hanya dummy. Tidak ada `/api/cloudinary-upload`.
**Fix:** Buat API route server-side untuk signed upload ke Cloudinary (menyembunyikan API secret).

#### F-6. Auth context tidak ada
Tidak ada `AuthContext` / `AuthProvider`. Auth logic embedded di Zustand store.
**Fix:** Buat `src/contexts/auth-context.tsx` yang wrap Firebase `onAuthStateChanged`.

#### F-7. Tidak ada service layer / repository pattern
Semua akses data langsung `useStore((s) => s.xxx)`.
**Fix:** Buat `src/services/` dengan satu service per collection, semua memanggil Firestore.

#### F-8. Realtime updates tidak ada
Tidak ada `onSnapshot` di codebase. "Realtime" yang sekarang hanya cross-tab sync via localStorage event (Zustand persist).
**Fix:** Public pages subscribe via `onSnapshot` untuk live updates (hero, stats, news list, campaign progress).

---

### 3.4 🟢 KODE YANG BISA DIPERBAIKI (Code Quality)

#### Q-1. `src/lib/store.ts` terlalu besar (1170 baris)
Mixing concerns: types + seed data + store + helpers + tree-builder.
**Fix:** Setelah migrasi, pecah ke:
- `src/types/index.ts` — semua interface
- `src/services/*.ts` — satu service per collection
- Hapus `store.ts` (atau sisa helper tree-builder → `src/utils/pengurus-tree.ts`)

#### Q-2. Duplikasi `formatDate` / `formatCurrency`
Di `store.ts` baris 1090-1103. Seharusnya di `src/lib/utils.ts` atau `src/utils/format.ts`.
**Fix:** Pindah ke utils, update semua import.

#### Q-3. `src/app/api/route.ts` dummy
**Fix:** Hapus atau ganti dengan health-check endpoint yang berguna (mis. `/api/health` cek koneksi Firestore).

#### Q-4. `scripts/generate-icons.ts` ada tapi tidak di-package.json scripts
**Fix:** Tambahkan `"generate-icons": "bun run scripts/generate-icons.ts"` ke package.json.

#### Q-5. `tsconfig.json` — verifikasi paths
Pastikan `@/*` alias benar dan strict mode aktif.

#### Q-6. Tidak ada loading skeleton / error boundary untuk async data
Karena semua data dari Zustand (synchronous), tidak ada loading state. Setelah migrasi ke Firestore (async), perlu skeleton.
**Fix:** Tambah Suspense + skeleton di setiap page section.

#### Q-7. Tidak ada `generateStaticParams` untuk `[slug]` routes
Blog/news/campaign/pengurus/kerja-kami detail pages tidak pre-render.
**Fix:** Tambah `generateStaticParams` yang fetch slug list dari Firestore (dengan ISR `revalidate`).

#### Q-8. Tidak ada `generateMetadata` untuk detail pages
Blog/news/campaign `[slug]` tidak punya per-page metadata dinamis (OG image, title).
**Fix:** Tambah `generateMetadata` di setiap `[slug]/page.tsx`.

---

### 3.5 ⚪ FITUR YANG BELUM SELESAI

#### U-1. Search di blog/news hanya client-side filter
`blog-page.tsx` & `news-page.tsx` filter array yang sudah ada di memory. Setelah Firestore, perlu query server-side atau pagination.
**Fix:** Untuk MVP, load semua published posts sekali lalu filter client-side. Untuk skala besar, pakai Firestore `where` + pagination.

#### U-2. Pagination tidak ada
Blog/news/campaign list menampilkan semua sekaligus.
**Fix:** Tambah pagination (limit 12 per page, cursor-based via Firestore `startAfter`).

#### U-3. Comment system tidak ada
Campaign detail menyebut "komentar" tapi tidak ada implementasi.
**Fix:** Tambah `comments` collection (petitionId/blogId, author, content, createdAt) + UI.

#### U-4. Newsletter subscription tidak ada
Footer menyebut "subscribe" tapi form tidak ada / dummy.
**Fix:** Tambah `subscribers` collection + double opt-in email.

#### U-5. Multi-language (i18n) tidak ada
`next-intl` ada di dependencies tapi tidak digunakan.
**Fix:** Low priority. Skip untuk sekarang.

#### U-6. Analytics dashboard minim
Dashboard hanya show counts. Tidak ada chart trend, tidak ada timeframe filter.
**Fix:** Tambah `recharts` line/bar chart untuk views/shares overtime (aggregate per day dari collection `analytics_events`).

#### U-7. Donasi / crowdfunding tidak ada
Sesuai spec awal user, harus ada modul donasi (QRIS, transfer, dll). Belum diimplementasi sama sekali.
**Fix:** Tambah collection `donations` + `donation_transactions` + UI publik + admin manager. (Ini fitur besar — roadmap terpisah.)

#### U-8. Petisi signing tidak ada
Campaign punya `supporters` count tapi tidak ada form tanda tangan publik.
**Fix:** Tambah `petition_signatures` collection + form di campaign detail + counter realtime.

---

## 4. ROADMAP PERBAIKAN

> Filosofi: **setiap fase = satu PR / satu set commit yang self-contained**.
> Tidak ada "big bang" rewrite. UI tidak berubah. User tidak sadar ada migrasi kecuali data mulai persist cross-device.

---

### FASE 0 — Persiapan (commit 1)
**Tujuan:** Siapkan infrastructure tanpa menyentuh kode aplikasi.

| # | Aksi | File |
|---|---|---|
| 0.1 | Install dependencies: `firebase`, `firebase-admin`, `cloudinary` | `package.json` |
| 0.2 | Buat `.env.example` lengkap (Firebase client + admin + Cloudinary) | `.env.example` |
| 0.3 | Tambah `.env.local` ke `.gitignore` eksplisit | `.gitignore` |
| 0.4 | Buat `firestore.rules` (public read published, admin write) | `firestore.rules` |
| 0.5 | Buat `firestore.indexes.json` (composite indexes untuk status+createdAt, dll) | `firestore.indexes.json` |
| 0.6 | Buat `firebase.json` (CLI config) | `firebase.json` |
| 0.7 | Tambah script `setup-admin`, `deploy-rules`, `deploy-indexes` ke package.json | `package.json` |

**Tidak ada perubahan kode aplikasi. Build tetap jalan dengan Zustand.**

---

### FASE 1 — Firebase Foundation (commit 2)
**Tujuan:** Tambah layer Firebase tanpa mengganggu Zustand. Kode aplikasi masih pakai Zustand.

| # | Aksi | File Baru |
|---|---|---|
| 1.1 | `src/lib/firebase/config.ts` — baca env, export `isFirebaseConfigured`, `COLLECTIONS`, `assertFirebaseConfigured` | baru |
| 1.2 | `src/lib/firebase/firebase.ts` — `initializeApp` (client SDK) | baru |
| 1.3 | `src/lib/firebase/firestore.ts` — generic CRUD + `subscribeToCollection` (`onSnapshot`) + `getBySlug` + `incrementField` | baru |
| 1.4 | `src/lib/firebase/auth.ts` — `loginWithEmail`, `loginWithGoogle`, `onAuthChange`, role lookup dari `users/{uid}` | baru |
| 1.5 | `src/lib/firebase/cloudinary.ts` — `uploadToCloudinaryServer` (server), `uploadToCloudinary` (client unsigned), `getCloudinaryUrl` | baru |
| 1.6 | `src/services/index.ts` — 14 service objects (newsService, blogService, campaignService, pengurusService, penasehatService, relawanService, supporterService, galleryService, workService, transparencyService, reportService, settingsService, userService, messageService) — semua panggil Firestore | baru |
| 1.7 | `src/types/index.ts` — pindahkan semua interface dari `store.ts` (Pengurus, Penasehat, Relawan, BlogPost, NewsArticle, Campaign, Supporter, GalleryItem, WorkCategory, TransparencyRecord, TransparencyReport, SiteSettings, User, Message) | baru |
| 1.8 | `src/contexts/auth-context.tsx` — `AuthProvider` + `useAuth` hook (wrap Firebase onAuthChange) | baru |
| 1.9 | `src/app/api/cloudinary-upload/route.ts` — server-side signed upload (verify Firebase ID token + role admin/editor) | baru |
| 1.10 | `scripts/setup-admin.ts` — create first super_admin in Firestore `users/{uid}` + seed settings/stats/categories | baru |

**Acceptance criteria:**
- `bun run lint` pass.
- `bunx tsc --noEmit` pass (allow existing chart.tsx error).
- Aplikasi masih jalan 100% seperti sebelumnya (Zustand masih aktif).
- Firebase files ada tapi belum dipanggil oleh UI.

---

### FASE 2 — Migration Bridge (commit 3)
**Tujuan:** Buat "bridge" agar Zustand store bisa baca dari Firestore sebagai fallback. UI tidak berubah.

| # | Aksi | File |
|---|---|---|
| 2.1 | Tambah `src/lib/store-hybrid.ts` — wrapper yang baca dari Firestore jika `isFirebaseConfigured`, fallback ke Zustand jika tidak | baru |
| 2.2 | Atau: tambah field `useFirebase` di Zustand store; saat `true`, setiap getter memanggil service layer | `store.ts` (edit) |
| 2.3 | Tambah `useFirebaseData` hook di setiap section component untuk prefetch dari Firestore (parallel dengan Zustand) | edit per section |

**Pendekatan yang disarankan:** **JANGAN** buat bridge. Bridge = complexity ganda. Lebih baik langsung Fase 3 (swap penuh).

**→ Skip Fase 2, langsung ke Fase 3.**

---

### FASE 3 — Full Swap: Firestore replaces Zustand (commit 4-6)
**Tujuan:** Ganti semua `useStore((s) => s.xxx)` → panggilan service layer Firestore. Hapus Zustand.

Dipecah per domain agar reviewable:

#### Commit 4 — Settings + Auth swap
| # | Aksi | File |
|---|---|---|
| 3.1 | `src/contexts/settings-context.tsx` — `SettingsProvider` subscribe Firestore `settings` via `onSnapshot` | baru |
| 3.2 | Wrap root layout dengan `AuthProvider` + `SettingsProvider` | `layout.tsx` edit |
| 3.3 | `admin-panel.tsx` — ganti login Zustand → `useAuth().login()`. Hapus hardcoded `adminAccounts`. | edit |
| 3.4 | `settings-manager.tsx` — ganti `updateSettings` → `settingsService.update()` | edit |
| 3.5 | `homepage-manager.tsx` — ganti `updateHomepage` → `settingsService.update({ homepage: {...} })` | edit |
| 3.6 | `src/components/site/header.tsx` & `footer.tsx` — baca settings dari `useSettings()` context | edit |
| 3.7 | `src/app/layout.tsx` — generate `organizationSchema` dari settings (socials, contact) | edit |

#### Commit 5 — Content collections swap (blog, news, campaigns, supporters, work, gallery)
| # | Aksi | File |
|---|---|---|
| 3.8 | `blog-manager.tsx` → `blogService.getAll/create/update/delete` + `subscribe` | edit |
| 3.9 | `news-manager.tsx` → `newsService.*` | edit |
| 3.10 | `campaign-manager.tsx` → `campaignService.*` + `incrementCampaignShare` via `incrementField` | edit |
| 3.11 | `supporter-manager.tsx` → `supporterService.*` | edit |
| 3.12 | `media-manager.tsx` → `galleryService.*` | edit |
| 3.13 | `blog-page.tsx`, `news-page.tsx`, `campaigns-page.tsx`, `media-page.tsx`, `work-page.tsx` — ganti `useStore` → service subscribe | edit |
| 3.14 | `share-buttons.tsx` — `onShare` callback panggil `incrementBlogShare` / `incrementNewsShare` / `incrementCampaignShare` | edit |
| 3.15 | `dashboard.tsx` — baca counts dari Firestore subscribe | edit |

#### Commit 6 — Org collections swap (pengurus, penasehat, relawan, transparency, reports)
| # | Aksi | File |
|---|---|---|
| 3.16 | `pengurus-manager.tsx` → `pengurusService.*` | edit |
| 3.17 | `penasehat-manager.tsx` → `penasehatService.*` | edit |
| 3.18 | `relawan-manager.tsx` → `relawanService.*` | edit |
| 3.19 | `transparency-manager.tsx` → `transparencyService.*` + `reportService.*` | edit |
| 3.20 | `pengurus-page.tsx`, `penasehat-relawan-page.tsx`, `struktur-page.tsx`, `transparency-page.tsx`, `home-page.tsx` (org sections) — ganti `useStore` → service | edit |
| 3.21 | Pindah `buildPengurusTree`, `getInitials`, `getRootPengurus`, `getChildrenPengurus`, `getAncestors` ke `src/utils/pengurus-tree.ts` | baru + edit imports |
| 3.22 | Pindah `formatDate`, `formatCurrency` ke `src/utils/format.ts` | baru + edit imports |
| 3.23 | **Hapus `src/lib/store.ts`** (setelah semua import bersih) | delete |
| 3.24 | Hapus `src/lib/db.ts` + `prisma/` + Prisma dependencies | delete + package.json edit |

**Acceptance criteria Fase 3:**
- Semua data berasal dari Firestore.
- Admin di device A create blog post → pengunjung di device B langsung lihat (realtime).
- localStorage tidak lagi menyimpan data aplikasi (hanya UI state seperti theme).
- `bun run lint` + `tsc --noEmit` pass.

---

### FASE 4 — Cloudinary Integration (commit 7)
**Tujuan:** Upload gambar ke Cloudinary, bukan base64.

| # | Aksi | File |
|---|---|---|
| 4.1 | `src/components/admin/image-upload.tsx` — ganti `FileReader.readAsDataURL` → `fetch('/api/cloudinary-upload', { file })` dengan progress bar | edit |
| 4.2 | `MultiImageUpload` — sama, upload paralel ke Cloudinary | edit |
| 4.3 | Simpan hasil upload URL juga ke `media` collection (untuk Media Library) | edit `image-upload.tsx` |
| 4.4 | Tambah "Media Library" picker dialog (browse upload sebelumnya) | baru component |
| 4.5 | `media-manager.tsx` — integrate dengan Cloudinary delete (opsional: hapus dari Cloudinary saat hapus media) | edit |

**Acceptance criteria:**
- Upload gambar → tersimpan di Cloudinary (URL `res.cloudinary.com/...`).
- Tidak ada lagi base64 di state/Firestore.
- Quota localStorage tidak terbebani.

---

### FASE 5 — Server Components & SEO (commit 8-9)
**Tujuan:** Konversi halaman publik ke Server Components untuk SEO & performance.

| # | Aksi | File |
|---|---|---|
| 5.1 | `src/app/(public)/page.tsx` — hapus `'use client'`, jadi async Server Component yang fetch data via service | edit |
| 5.2 | Pisahkan `HomePage` component ke: Server wrapper (fetch) + Client islands (carousel, search, share) | refactor |
| 5.3 | Ulangi pola untuk semua `[slug]` pages: `generateStaticParams` + `generateMetadata` + ISR `revalidate: 60` | edit per page |
| 5.4 | `src/app/sitemap.ts` — generate dynamic URLs dari Firestore (blog, news, campaigns, pengurus, work slugs) | edit |
| 5.5 | Hapus `public/sitemap.xml` (stale) | delete |
| 5.6 | Tambah JSON-LD `NewsArticle` / `BlogPosting` / `Article` schema di detail pages | edit per `[slug]` |
| 5.7 | Tambah loading.tsx + error.tsx per route segment | baru |

**Acceptance criteria:**
- `view-source` halaman publik menampilkan konten HTML (bukan empty div).
- Lighthouse SEO score > 90.
- First Contentful Paint < 1.5s.

---

### FASE 6 — Bug Fixes & Polish (commit 10)
**Tujuan:** Fix bug-bug yang teridentifikasi di audit.

| # | Aksi | Bug ID |
|---|---|---|
| 6.1 | Contact form: simpan ke Firestore `messages` + toast sukses | B-8 |
| 6.2 | Hapus `MobileAppManager` generate APK palsu, ganti dengan field URL input | B-9 |
| 6.3 | Scheduled blog: dokumentasikan butuh Cloud Function (atau hapus fitur scheduling) | B-10 |
| 6.4 | Set `typescript.ignoreBuildErrors: false`, fix semua error | B-3 |
| 6.5 | Set `reactStrictMode: true`, fix double-fire issues | B-4 |
| 6.6 | Konsolidasi `siteConfig.url` env var, hapus hardcoded URL | M-4 |
| 6.7 | Hapus `src/app/api/route.ts` dummy atau ganti dengan `/api/health` | Q-3 |
| 6.8 | Tambah `generate-icons` script ke package.json | Q-4 |

---

### FASE 7 — Fitur Baru (commit 11+, terpisah)
**Tujuan:** Tambah fitur yang belum ada. Setiap fitur = PR terpisah.

| Fitur | Deskripsi | Bug/Item ID |
|---|---|---|
| 7.1 | **Petisi signing** — form tanda tangan publik di campaign detail + counter realtime | U-8 |
| 7.2 | **Donasi** — collection `donations` + multi-payment (QRIS/transfer/e-wallet) + progress + laporan | U-7 |
| 7.3 | **Comment system** — di blog/news/campaign detail | U-3 |
| 7.4 | **Newsletter** — subscribe form di footer + double opt-in | U-4 |
| 7.5 | **Pagination** — blog/news/campaign list | U-2 |
| 7.6 | **Analytics dashboard** — chart trends dengan recharts | U-6 |
| 7.7 | **Search server-side** — Firestore query + pagination | U-1 |

---

## 5. Urutan Eksekusi & Estimasi

| Fase | Commit | Estimasi | Dependency |
|---|---|---|---|
| 0 | 1 | 0.5 hari | — |
| 1 | 2 | 1.5 hari | Fase 0 |
| 3a | 3 (settings+auth) | 1 hari | Fase 1 |
| 3b | 4 (content) | 1.5 hari | Fase 3a |
| 3c | 5 (org) | 1 hari | Fase 3b |
| 3d | 6 (cleanup Zustand) | 0.5 hari | Fase 3c |
| 4 | 7 (Cloudinary) | 0.5 hari | Fase 3d |
| 5 | 8-9 (SSR+SEO) | 2 hari | Fase 4 |
| 6 | 10 (bugfix) | 1 hari | Fase 5 |
| **Total MVP** | | **~9.5 hari kerja** | |

Fase 7 (fitur baru) dilakukan setelah MVP stabil, masing-masing 0.5-2 hari per fitur.

---

## 6. Aturan Kontribusi

1. **Satu fase = satu PR.** Jangan campur perubahan antar fase.
2. **Jangan hapus UI.** Jangan redesign. Jika perlu refactor UI, pertahankan visual identik.
3. **Jangan commit `.env.local`.** Hanya `.env.example`.
4. **Setiap commit message:** `feat(fase-N): deskripsi` atau `fix(fase-N): deskripsi`.
5. **Sebelum commit:** `bun run lint` + `bunx tsc --noEmit` harus pass.
6. **Sebelum merge Fase 3:** test manual flow lengkap (login admin → CRUD semua modul → lihat di publik).
7. **Backup data Zustand:** sebelum hapus `store.ts`, jalankan script migrasi yang dump localStorage → Firestore (opsional, jika ada data penting).

---

## 7. File yang Akan Dihapus (setelah Fase 3 selesai)

- `src/lib/store.ts` (1170 baris) — diganti service layer
- `src/lib/db.ts` — Prisma client tidak terpakai
- `prisma/schema.prisma` — tidak terpakai
- `public/sitemap.xml` — stale, diganti `src/app/sitemap.ts`
- `src/app/api/route.ts` — dummy

## 8. File yang Akan Ditambahkan

- `src/lib/firebase/{config,firebase,auth,firestore,cloudinary}.ts` (5 file)
- `src/services/index.ts` (atau pecah per collection jika terlalu besar)
- `src/types/index.ts`
- `src/contexts/{auth-context,settings-context}.tsx`
- `src/utils/{format,pengurus-tree}.ts`
- `src/app/api/cloudinary-upload/route.ts`
- `src/app/api/health/route.ts` (opsional)
- `src/app/(public)/loading.tsx` + `error.tsx`
- `firestore.rules`, `firestore.indexes.json`, `firebase.json`
- `.env.example`
- `scripts/setup-admin.ts`
- `scripts/migrate-localstorage.ts` (opsional, untuk dump data lama)

---

_Dokumen ini hidup. Update setiap fase selesai. Tandai dengan ✅ di kolom kiri saat commit di-merge._
