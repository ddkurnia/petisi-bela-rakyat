# Petisi Bela Rakyat

> Gerakan masyarakat sipil independen untuk memperjuangkan kepentingan rakyat melalui advokasi, partisipasi publik, dan aksi nyata.

Website NGO modern setara standar internasional 2026 (Amnesty International, Human Rights Watch, Transparency International, Change.org) dengan desain premium, mobile-first, dan admin panel non-teknis.

## ✨ Fitur Utama

### Public Website
- **Hero Fullscreen** dengan dynamic content editable dari admin
- **Statistik** dengan counter animation
- **Tentang Kami** — Visi, Misi, Nilai, Sejarah + Timeline
- **Tim Kami** — Grid modern + halaman detail profil per anggota
- **Kerja Kami** — 5 bidang perjuangan dengan detail page
- **Kampanye** — Cards dengan progress bar + detail page + petition signing
- **News** — Berita dengan search, filter kategori, pagination
- **Blog** — Artikel SEO-friendly dengan structured data, tags, related articles
- **Media Center** — Galeri foto/video/PDF + lightbox
- **Dukungan Tokoh** — Testimonial pendukung
- **Transparansi** — Tabel transaksi keuangan + export + laporan resmi
- **Kontak** — Form, WhatsApp, Email, Google Maps embed

### Admin Panel
- **Login** dengan 3 role: Super Admin, Admin, Editor
- **Dashboard** — Statistik engagement, kampanye teratas, artikel terbaru
- **Kelola Homepage** — Edit hero, statistik tanpa coding
- **Kelola Tim** — CRUD anggota + foto + urutan tampil
- **Kelola Blog** — Rich editor, SEO meta, tags, draft/publish
- **Kelola News** — CRUD berita lengkap
- **Kelola Kampanye** — CRUD + counter dukungan + status
- **Kelola Dukungan Tokoh** — CRUD pendukung
- **Kelola Media** — Upload foto/video/PDF
- **Kelola Transparansi** — Input transaksi + laporan + auto-summary

### Tech & UX
- ✅ Next.js 16 App Router + TypeScript
- ✅ Tailwind CSS 4 + shadcn/ui
- ✅ Framer Motion animations
- ✅ Dark Mode support
- ✅ Mobile-first responsive
- ✅ PWA Ready (manifest + theme color)
- ✅ SEO Optimized (Schema.org, Open Graph, Twitter Card, sitemap.xml, robots.txt)
- ✅ Sticky header dengan glass effect
- ✅ Counter animation
- ✅ Smooth page transitions

## 🎨 Brand Identity

| Token | Warna |
|-------|-------|
| Primary | `#D62828` |
| Dark | `#111827` |
| Light | `#F8FAFC` |
| White | `#FFFFFF` |

**Typography**: Inter (body) + Manrope (headings)

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🔐 Admin Access

Akses admin panel di footer website → tombol "Admin".

Login menggunakan akun yang sudah terdaftar di Firebase Authentication
dan memiliki dokumen role di Firestore collection `users`.

**Setup admin pertama:**

1. Buat user di Firebase Console → Authentication → Add user
2. Jalankan setup-admin script:

   **Di Termux (Android) — gunakan node (bun tidak support):**
   ```bash
   pkg install nodejs          # jika belum ada node
   node scripts/setup-admin.mjs admin@belarakyat.org "Administrator"
   ```

   **Di PC/Mac — bisa gunakan bun atau node:**
   ```bash
   bun run setup-admin admin@belarakyat.org "Administrator"
   # atau
   node scripts/setup-admin.mjs admin@belarakyat.org "Administrator"
   ```

   Script ini membuat dokumen `users/{uid}` dengan:
   - Document ID = Auth UID (PENTING agar app bisa baca role)
   - Field `role: "super_admin"`

3. Login di `/admin` dengan email & password yang dibuat

**Verifikasi setup berhasil:**

```bash
# Di Termux (node):
node scripts/verify-firestore-access.mjs admin@belarakyat.org Kapal7890@

# Di PC (bun atau node):
bun run verify-admin admin@belarakyat.org Kapal7890@
```

Script ini akan sign in ke Firebase Auth, baca `users/{uid}` via
`getDocFromServer`, dan report apakah dokumen ada dengan role benar.

**Menambah admin/editor lain:**
- Super admin bisa membuat dokumen `users/{uid}` baru via Firebase Console
  dengan field `role: "admin"` atau `role: "editor"`
  (PASTIKAN Document ID = Auth UID user tersebut)

## 🗂️ Struktur Project

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, SEO metadata
│   ├── page.tsx            # Main page with state-based routing
│   └── globals.css         # Brand theme (light + dark)
├── components/
│   ├── admin/              # Admin panel (login, dashboard, CRUD)
│   ├── sections/           # Public pages (home, about, team, dll)
│   ├── site/               # Header & Footer
│   ├── ui/                 # shadcn/ui components
│   ├── animation.tsx       # Framer Motion helpers
│   ├── logo.tsx
│   └── theme-provider.tsx
└── lib/
    ├── nav.tsx             # SPA navigation context
    ├── store.ts            # Zustand store (data + CRUD)
    └── utils.ts
public/
├── icon.svg                # PWA icon
├── manifest.webmanifest    # PWA manifest
├── robots.txt
└── sitemap.xml
```

## 🔄 Firebase Integration — LIVE & REALTIME

Website ini sekarang **100% live dan realtime** menggunakan Firebase Firestore.

### Arsitektur Realtime

```
Admin Panel (edit konten)
      ↓
  Firestore (database)
      ↓ onSnapshot
Public Website (realtime update)
```

**Cara kerja:**
1. Admin login di `/admin` → ubah konten (blog, news, campaigns, settings, dll.)
2. Perubahan langsung tersimpan ke Firestore
3. Semua pengunjung publik langsung melihat perubahan (via `onSnapshot` listener)
4. **Tidak perlu refresh halaman** — perubahan muncul otomatis

### Struktur Firestore Collections

```
collections:
- users          (autentikasi + role: super_admin / admin / editor)
- blog           (artikel blog — public lihat published, admin lihat semua)
- news           (berita — public lihat published, admin lihat semua)
- campaigns      (kampanye + petisi)
- pengurus       (anggota pengurus)
- penasehat      (dewan penasehat)
- relawan        (relawan terdaftar)
- supporters     (tokoh pendukung)
- gallery        (foto/video/dokumen)
- work           (kategori kerja kami)
- transparency   (transaksi keuangan)
- reports        (laporan resmi)
- settings/main  (konfigurasi situs — singleton doc)
- messages       (submission dari contact form)
```

### Setup di Termux (Android)

1. **Install dependencies:**
   ```bash
   pkg install nodejs git
   cd petisi-bela-rakyat
   npm install
   ```

2. **Buat file `.env.local`** (lihat `.env.example` untuk template):
   ```bash
   # Firebase Client SDK (dari Firebase Console → Project Settings → Web App)
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...

   # Firebase Admin SDK (dari Firebase Console → Service Accounts → Generate new private key)
   FIREBASE_ADMIN_PROJECT_ID=...
   FIREBASE_ADMIN_CLIENT_EMAIL=...
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXX\n-----END PRIVATE KEY-----\n"

   # Cloudinary (dari Cloudinary Console → Dashboard)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...

   NEXT_PUBLIC_SITE_URL=https://belarakyat.org
   ```

3. **Deploy Firestore rules:**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules
   ```

4. **Setup admin pertama:**
   - Buat user di Firebase Console → Authentication → Add user
   - Jalankan: `node scripts/setup-admin.mjs admin@email.com "Administrator"`

5. **Jalankan dev server:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser.

### Verifikasi Realtime Berfungsi

1. Buka website di browser A (publik, tidak login)
2. Buka `/admin` di browser B, login sebagai admin
3. Di browser B, edit apapun (misal: ganti hero headline)
4. Klik Simpan
5. **Browser A akan otomatis update** dalam 1-2 detik (tanpa refresh)

Jika tidak update otomatis, cek:
- DevTools Console → cari error `[PBR-STORE]` atau `permission-denied`
- Firebase Console → Firestore → pastikan rules sudah di-deploy
- Network tab → pastikan WebSocket ke Firebase terbuka

## 📦 Deployment

### Vercel (Recommended)
1. Push repo ke GitHub
2. Import di [vercel.com/new](https://vercel.com/new)
3. Deploy — auto-deteksi Next.js

### Manual
```bash
bun run build
bun run start
```

## 📝 License

© Petisi Bela Rakyat. All rights reserved. Dibangun untuk rakyat, oleh rakyat.

## 🤝 Kontribusi

Hubungi: halo@belarakyat.org
