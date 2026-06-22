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

## 🔐 Admin Access (Demo)

Akses admin panel di footer website → tombol "Admin".

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@petisibelarakyat.id` | `pbr2026` |
| Admin | `admin@petisibelarakyat.id` | `pbr2026` |
| Editor | `editor@petisibelarakyat.id` | `pbr2026` |

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

## 🔄 Firebase Integration

Struktur data sudah dirancang sesuai spesifikasi Firebase:

```
collections:
- users          (autentikasi + role)
- team           (anggota tim)
- blog           (artikel blog)
- news           (berita)
- campaigns      (kampanye + petisi)
- supporters     (tokoh pendukung)
- gallery        (foto/video/dokumen)
- documents      (laporan resmi)
- transparency   (transaksi keuangan)
- settings       (konfigurasi homepage)
```

Untuk migrasi dari Zustand ke Firebase:
1. Install Firebase SDK: `bun add firebase`
2. Ganti implementasi `useStore` di `src/lib/store.ts` dengan Firebase Firestore calls
3. Tambahkan Firebase Auth untuk mengganti login demo
4. Gunakan Firebase Storage untuk upload file di admin panel

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

Hubungi: halo@petisibelarakyat.id
