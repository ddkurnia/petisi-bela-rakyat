"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============ TYPES ============
export type Role = "super_admin" | "admin" | "editor";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  photoURL?: string;
}

// Legacy team (kept for backward compat) — replaced by Pengurus
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

// ============ PENGURUS (dynamic org structure) ============
export interface Pengurus {
  id: string;
  slug: string;
  name: string;
  gelar: string; // e.g. "S.H., M.H."
  jabatan: string; // free text: "Ketua", "Wakil Ketua 1", "Bidang Relawan", dll
  parentId: string | null; // ID pengurus lain sebagai atasan langsung, null = top-level (Ketua)
  bio: string;
  experience: string;
  whatsapp: string;
  email: string;
  photo: string; // empty string = use initials placeholder
  order: number; // urutan tampil di level yang sama
  status: "active" | "inactive";
}

// ============ DEWAN PENASEHAT ============
export interface Penasehat {
  id: string;
  name: string;
  gelar: string;
  jabatan: string; // e.g. "Dewan Penasehat"
  bio: string;
  photo: string;
  order: number;
}

// ============ RELAWAN ============
export interface Relawan {
  id: string;
  name: string;
  area: string; // lokasi
  joinedAt: string;
  photo: string;
  active: boolean;
}

// ============ BLOG ============
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  images: string[]; // multiple images
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  scheduledAt?: string | null; // ISO datetime for scheduled publish
  metaTitle: string;
  metaDescription: string;
  status: "published" | "draft" | "scheduled";
  views: number;
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
  status: "published" | "draft";
  views: number;
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
  status: "active" | "won" | "lost" | "planned";
  location: string;
  startedAt: string;
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
  type: "photo" | "video" | "document";
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
  type: "income" | "expense";
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

// ============ EXPANDED SETTINGS ============
export interface SocialLink {
  name: string;
  url: string;
  icon: string; // facebook, instagram, twitter, youtube, tiktok
  handle: string; // @petisibelarakyat
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
  // New structured sections
  sejarahTimeline: { year: string; title: string; description: string; icon?: string }[];
  motto: string;
}

export interface FooterSettings {
  description: string;
  copyrightText: string;
  legalLinks: { label: string; url: string }[];
}

export interface HomepageSettings {
  hero: {
    image: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
  };
  about: {
    image: string;
    title: string;
    description: string;
  };
  work: {
    title: string;
    description: string;
  };
  campaigns: {
    title: string;
    description: string;
  };
  supporters: {
    title: string;
    description: string;
  };
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

// ============ SEED DATA ============
const seedPengurus: Pengurus[] = [
  {
    id: "p1",
    slug: "agus-suliadi",
    name: "Agus Suliadi",
    gelar: "S.Sos., M.Si",
    jabatan: "Ketua",
    parentId: null,
    bio: "Agus Suliadi adalah pendiri Petisi Bela Rakyat yang sejak muda aktif dalam gerakan masyarakat sipil. Ia memimpin organisasi dengan visi membela rakyat kecil tanpa kompromi.",
    experience: "Pendiri Forum Masyarakat Sipil Meranti (2018). Konsultan Advokasi Infrastruktur Pemerintah Daerah (2020-2023). Pembicara Forum NGO Nasional 2023.",
    whatsapp: "+62 812-0000-0001",
    email: "agus@petisibelarakyat.id",
    photo: "",
    order: 1,
    status: "active",
  },
  {
    id: "p2",
    slug: "alazhar-yusuf",
    name: "Alazhar Yusuf",
    gelar: "S.Sos",
    jabatan: "Wakil Ketua",
    parentId: "p1",
    bio: "Alazhar Yusuf mendampingi Ketua dalam pengambilan keputusan strategis dan mengawasi operasional bidang advokasi.",
    experience: "Aktivis masyarakat sipil Meranti sejak 2016. Koordinator lapangan kampanye infrastruktur.",
    whatsapp: "+62 812-0000-0002",
    email: "alazhar@petisibelarakyat.id",
    photo: "",
    order: 1,
    status: "active",
  },
  {
    id: "p3",
    slug: "mitrizal",
    name: "Mitrizal",
    gelar: "S.E",
    jabatan: "Wakil Ketua",
    parentId: "p1",
    bio: "Mitrizal bertanggung jawab atas bidang ekonomi rakyat dan hubungan komunitas.",
    experience: "Pengusaha lokal dan tokoh masyarakat Meranti. Aktif dalam koperasi nelayan.",
    whatsapp: "+62 812-0000-0003",
    email: "mitrizal@petisibelarakyat.id",
    photo: "",
    order: 2,
    status: "active",
  },
  {
    id: "p4",
    slug: "mujiono",
    name: "Mujiono",
    gelar: "S.Pd",
    jabatan: "Wakil Ketua",
    parentId: "p1",
    bio: "Mujiono memimpin bidang pendidikan dan pemberdayaan pemuda.",
    experience: "Pendidik dan aktivis kepemudaan. Pendiri sanggar belajar untuk anak pesisir.",
    whatsapp: "+62 812-0000-0004",
    email: "mujiono@petisibelarakyat.id",
    photo: "",
    order: 3,
    status: "active",
  },
  {
    id: "p5",
    slug: "budi-hartono",
    name: "Budi Hartono",
    gelar: "S.Kom",
    jabatan: "Sekretaris",
    parentId: "p1",
    bio: "Budi Hartono bertanggung jawab atas administrasi dan dokumentasi organisasi.",
    experience: "Koordinator Lapangan Forum Nelayan Meranti (2017-2024). Penyelenggara 50+ aksi damai.",
    whatsapp: "+62 812-0000-0005",
    email: "budi@petisibelarakyat.id",
    photo: "",
    order: 1,
    status: "active",
  },
  {
    id: "p6",
    slug: "dewi-lestari",
    name: "Dewi Lestari",
    gelar: "S.E., M.M",
    jabatan: "Bendahara",
    parentId: "p1",
    bio: "Dewi Lestari adalah akuntan publik bersertifikasi yang mengawal transparansi keuangan organisasi.",
    experience: "Auditor KAP Big Four (2012-2020). Treasurer untuk 3 organisasi nirlaba.",
    whatsapp: "+62 812-0000-0006",
    email: "keuangan@petisibelarakyat.id",
    photo: "",
    order: 2,
    status: "active",
  },
  {
    id: "p7",
    slug: "may-ratna-sari",
    name: "May Ratna Sari",
    gelar: "S.H., M.H",
    jabatan: "Bidang Hukum",
    parentId: "p5",
    bio: "May Ratna Sari adalah advokat dengan pengalaman 15 tahun dalam kasus hak warga. Ia memimpin pendampingan hukum gratis untuk masyarakat miskin.",
    experience: "Advokat tetap Peradin (2010-sekarang). Pendamping 100+ kasus pro bono.",
    whatsapp: "+62 812-0000-0007",
    email: "hukum@petisibelarakyat.id",
    photo: "",
    order: 1,
    status: "active",
  },
  {
    id: "p8",
    slug: "rudi-hartono",
    name: "Rudi Hartono",
    gelar: "S.Sos",
    jabatan: "Bidang Advokasi",
    parentId: "p5",
    bio: "Rudi Hartono adalah aktivis lapangan yang mengkoordinir seluruh kampanye advokasi di tingkat desa dan kecamatan.",
    experience: "Aktivis BMH (2015-2023). Koordinator 20+ kampanye advokasi lokal.",
    whatsapp: "+62 812-0000-0008",
    email: "advokasi@petisibelarakyat.id",
    photo: "",
    order: 2,
    status: "active",
  },
  {
    id: "p9",
    slug: "maya-anggraini",
    name: "Maya Anggraini",
    gelar: "S.I.Kom",
    jabatan: "Bidang Media",
    parentId: "p5",
    bio: "Maya Anggraini adalah jurnalis berpengalaman yang kini memimpin strategi komunikasi organisasi.",
    experience: "Jurnalis Media Nasional (2016-2024). Pemenang Anugerah Pers Jurnalistik 2022.",
    whatsapp: "+62 812-0000-0009",
    email: "media@petisibelarakyat.id",
    photo: "",
    order: 3,
    status: "active",
  },
  {
    id: "p10",
    slug: "fauzi-akmal",
    name: "Fauzi Akmal",
    gelar: "S.IP., M.Si",
    jabatan: "Bidang Hubungan Pemerintah",
    parentId: "p5",
    bio: "Fauzi Akmal menjembatani komunikasi organisasi dengan institusi pemerintah dan DPRD.",
    experience: "Staf ahli anggota DPRD (2014-2019). Konsultan kebijakan publik (2020-sekarang).",
    whatsapp: "+62 812-0000-0010",
    email: "pemerintah@petisibelarakyat.id",
    photo: "",
    order: 4,
    status: "active",
  },
  {
    id: "p11",
    slug: "nia-permata",
    name: "Nia Permata",
    gelar: "S.E",
    jabatan: "Bidang Penggalangan Dukungan",
    parentId: "p5",
    bio: "Nia Permata bertanggung jawab atas rekrutmen relawan dan kampanye crowdfunding.",
    experience: "Manajer Kampanye LSM Lestari (2018-2024). Penggalang Rp 2M+ dana sosial.",
    whatsapp: "+62 812-0000-0011",
    email: "dukungan@petisibelarakyat.id",
    photo: "",
    order: 5,
    status: "active",
  },
  {
    id: "p12",
    slug: "arif-rahman",
    name: "Arif Rahman",
    gelar: "S.Stat., M.Sc",
    jabatan: "Bidang Riset dan Data",
    parentId: "p5",
    bio: "Arif Rahman memimpin tim riset yang menghasilkan data dan analisis pendukung advokasi.",
    experience: "Peneliti senior BPS (2013-2023). Konsultan data untuk 10+ lembaga internasional.",
    whatsapp: "+62 812-0000-0012",
    email: "riset@petisibelarakyat.id",
    photo: "",
    order: 6,
    status: "active",
  },
];

const seedPenasehat: Penasehat[] = [
  {
    id: "pn1",
    name: "Prof. Dr. H. Marwan Bali",
    gelar: "Prof. Dr. S.H., M.H",
    jabatan: "Dewan Penasehat",
    bio: "Akademisi hukum tata negara Universitas Riau dengan 30 tahun pengalaman.",
    photo: "",
    order: 1,
  },
  {
    id: "pn2",
    name: "Drs. H. Syafrudin, M.Si",
    gelar: "M.Si",
    jabatan: "Dewan Penasehat",
    bio: "Tokoh masyarakat Meranti dengan pengalaman birokrasi 35 tahun.",
    photo: "",
    order: 2,
  },
  {
    id: "pn3",
    name: "Hj. Rohani, S.Pd",
    gelar: "S.Pd",
    jabatan: "Dewan Penasehat",
    bio: "Pendidik dan aktivis perempuan, pendiri 5 PAUD di kepulauan.",
    photo: "",
    order: 3,
  },
];

const seedRelawan: Relawan[] = [
  { id: "r1", name: "Andi Pratama", area: "Selatpanjang", joinedAt: "2024-01-15", photo: "", active: true },
  { id: "r2", name: "Rina Wati", area: "Rangsang", joinedAt: "2024-02-20", photo: "", active: true },
  { id: "r3", name: "Joko Susilo", area: "Tebing Tinggi", joinedAt: "2024-03-10", photo: "", active: true },
  { id: "r4", name: "Fitri Handayani", area: "Merbau", joinedAt: "2024-04-05", photo: "", active: true },
];

const seedSettings: SiteSettings = {
  siteName: "Petisi Bela Rakyat",
  tagline: "Membela Suara Rakyat",
  logoUrl: "",
  homepage: {
    hero: {
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80",
      headline: "Menyatukan Suara Rakyat Menjadi Perubahan",
      subheadline: "Gerakan masyarakat sipil independen untuk memperjuangkan kepentingan rakyat melalui advokasi, partisipasi publik, dan aksi nyata.",
      primaryCta: "Tandatangani Petisi",
      secondaryCta: "Pelajari Perjuangan Kami",
    },
    about: {
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "Lahir dari Rakyat, untuk Rakyat",
      description: "Kami bukan sekadar NGO — kami adalah perpanjangan tangan masyarakat yang selama ini tidak didengar.",
    },
    work: {
      title: "Lima Bidang Perjuangan",
      description: "Kami fokus pada isu-isu strategis yang berdampak langsung pada kehidupan rakyat.",
    },
    campaigns: {
      title: "Bergabung dalam Perjuangan",
      description: "Setiap tanda tangan adalah suara yang membawa kami lebih dekat pada keadilan.",
    },
    supporters: {
      title: "Suara yang Mempercayai Kami",
      description: "Tokoh-tokoh dari berbagai latar belakang memberikan dukungan mereka pada perjuangan ini.",
    },
    stats: [
      { label: "Tanda Tangan", value: 585, suffix: "+" },
      { label: "Relawan", value: 10, suffix: "+" },
      { label: "Tokoh Pendukung", value: 6, suffix: "+" },
      { label: "Kampanye Aktif", value: 2, suffix: "" },
    ],
  },
  about: {
    visi: "Menjadi gerakan masyarakat sipil terdepan di Indonesia yang memperjuangkan keadilan, transparansi, dan kesejahteraan rakyat melalui partisipasi publik yang berkelanjutan.",
    misi: [
      "Mengadvokasi kebijakan publik yang berpihak pada rakyat kecil.",
      "Membangun partisipasi warga negara dalam pengawasan pemerintahan.",
      "Memberdayakan masyarakat lokal untuk bersuara atas hak-hak mereka.",
      "Mendorong transparansi dan akuntabilitas pengelolaan dana publik.",
      "Membangun aliansi lintas sektor untuk perubahan struktural.",
    ],
    nilai: [
      { title: "Independen", description: "Kami bebas dari pengaruh politik dan kepentingan ekonomi tertentu, berdiri tegak untuk kepentingan rakyat.", icon: "Eye" },
      { title: "Berani", description: "Kami berani menyuarakan kebenaran dan menuntut keadilan meskipun di hadapan kekuasaan.", icon: "Shield" },
      { title: "Transparan", description: "Setiap rupiah yang kami terima dan keluarkan dilaporkan terbuka untuk dapat diaudit publik.", icon: "Wallet" },
      { title: "Berakar pada Rakyat", description: "Seluruh agenda kami lahir dari aspirasi nyata masyarakat di lapangan, bukan dari meja elite.", icon: "Heart" },
    ],
    sejarah: `Petisi Bela Rakyat bukanlah gerakan yang lahir secara tiba-tiba.

Pada September 2016, sejumlah masyarakat dan aktivis Kepulauan Meranti pernah menginisiasi sebuah petisi publik terkait peristiwa yang dikenal masyarakat sebagai "Meranti Berdarah", yang terjadi pada 25 Agustus 2016.

Saat itu, tujuan gerakan tersebut adalah mendorong pemerintah dan aparat penegak hukum untuk mengusut tuntas kematian tidak wajar dua warga Kepulauan Meranti yang diduga melibatkan oknum aparat.

Melalui dukungan masyarakat dan berbagai elemen sipil, gerakan tersebut berhasil menarik perhatian nasional. Ketua Komnas HAM saat itu, Natalius Pigai, serta aktivis HAM dan Ketua KontraS, Haris Azhar, datang langsung ke Kepulauan Meranti untuk melihat dan mendalami peristiwa yang terjadi.

Perjuangan tersebut membuahkan hasil. Kasus yang menjadi perhatian masyarakat akhirnya diproses melalui mekanisme hukum yang berlaku dan para pelaku diadili sesuai ketentuan hukum.

Hampir sepuluh tahun kemudian, semangat yang sama kembali hadir.

Hari ini, yang dihadapi masyarakat bukan lagi tragedi berdarah, melainkan persoalan infrastruktur yang berdampak langsung terhadap kehidupan ribuan warga.

Ambruknya Jembatan Perawang di Selat Akar pada 14 Agustus 2023 dan Jembatan Panglima Sampul di Alai pada 22 Mei 2024 telah menyebabkan terganggunya aktivitas masyarakat, pendidikan, pelayanan kesehatan, mobilitas, serta perekonomian warga.

Atas dasar itulah Petisi Bela Rakyat kembali bergerak.

Melalui jalur partisipasi publik yang damai, terbuka, dan konstitusional, gerakan ini berupaya menyampaikan aspirasi masyarakat Kepulauan Meranti kepada pemerintah daerah, pemerintah pusat, hingga Presiden Republik Indonesia agar pembangunan kedua jembatan tersebut menjadi perhatian dan prioritas.

Petisi Bela Rakyat tidak berafiliasi dengan kepentingan politik praktis.

Gerakan ini hadir sebagai wadah masyarakat untuk memperjuangkan kepentingan bersama, menghubungkan aspirasi rakyat dengan pengambil kebijakan, serta mendorong hadirnya solusi nyata bagi masyarakat Kepulauan Meranti.

Karena setiap jembatan yang dibangun kembali bukan hanya menghubungkan dua wilayah, tetapi juga menghubungkan harapan dan masa depan masyarakat.`,
    sejarahTimeline: [
      { year: "2016", title: "Petisi Meranti Berdarah", description: "Masyarakat dan aktivis Kepulauan Meranti menginisiasi petisi publik terkait peristiwa 25 Agustus 2016 untuk mendorong penegakan hukum.", icon: "Megaphone" },
      { year: "2016", title: "Kunjungan Komnas HAM dan KontraS", description: "Ketua Komnas HAM Natalius Pigai dan Ketua KontraS Haris Azhar datang langsung ke Kepulauan Meranti untuk mendalami peristiwa.", icon: "Users" },
      { year: "2016", title: "Kasus Diproses Secara Hukum", description: "Perjuangan membuahkan hasil — kasus diproses melalui mekanisme hukum dan para pelaku diadili sesuai ketentuan.", icon: "Scale" },
      { year: "2025", title: "Petisi Bela Rakyat Kembali Bergerak", description: "Hampir sepuluh tahun kemudian, semangat yang sama kembali hadir untuk menjawab persoalan infrastruktur masyarakat.", icon: "RefreshCw" },
      { year: "2025", title: "Perjuangan Pembangunan Dua Jembatan Meranti", description: "Mengadvokasi pembangunan kembali Jembatan Perawang (ambruk 14 Agustus 2023) dan Jembatan Panglima Sampul (ambruk 22 Mei 2024).", icon: "Building2" },
      { year: "2025", title: "Dukungan Masyarakat Terus Bertambah", description: "Petisi menjangkau pemerintah daerah, pusat, hingga Presiden RI — didukung masyarakat luas dan berbagai elemen sipil.", icon: "HeartHandshake" },
    ],
    motto: "Bersama membela rakyat, tanpa kompromi.",
  },
  contact: {
    address: "Sekretariat Petisi Bela Rakyat, Jl. Pahlawan No. 12, Selatpanjang, Kabupaten Kepulauan Meranti, Riau 28753",
    whatsapp: "+62 812-0000-0000",
    email: "halo@petisibelarakyat.id",
    phone: "+62 812-0000-0000",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.5!2d102.7!3d1.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMDAnMDAuMCJOIDEwMsKwNDInMDAuMCJF!5e0!3m2!1sen!2sid!4v1700000000000",
    mapLink: "https://maps.google.com/?q=Selatpanjang+Meranti",
    operationHours: "Senin – Jumat, 09:00 – 17:00 WIB",
  },
  socials: [
    { name: "Facebook", url: "https://facebook.com/petisibelarakyat", icon: "facebook", handle: "@petisibelarakyat" },
    { name: "Instagram", url: "https://instagram.com/petisibelarakyat", icon: "instagram", handle: "@petisibelarakyat" },
    { name: "X", url: "https://twitter.com/petisibelarakyat", icon: "twitter", handle: "@petisibelarakyat" },
    { name: "YouTube", url: "https://youtube.com/@petisibelarakyat", icon: "youtube", handle: "@petisibelarakyat" },
    { name: "TikTok", url: "https://tiktok.com/@petisibelarakyat", icon: "tiktok", handle: "@petisibelarakyat" },
  ],
  footer: {
    description: "Gerakan masyarakat sipil independen yang memperjuangkan kepentingan rakyat melalui advokasi, partisipasi publik, dan aksi nyata.",
    copyrightText: "© {year} Petisi Bela Rakyat. Hak cipta dilindungi. Dibangun untuk rakyat, oleh rakyat.",
    legalLinks: [
      { label: "Kebijakan Privasi", url: "#" },
      { label: "Syarat & Ketentuan", url: "#" },
    ],
  },
};

const seedTeam: TeamMember[] = [];

const seedBlog: BlogPost[] = [
  {
    id: "b1",
    slug: "mengapa-jembatan-panglima-sampul-penting",
    title: "Mengapa Jembatan Panglima Sampul Penting bagi Masyarakat Meranti?",
    excerpt: "Jembatan ini bukan sekadar infrastruktur — ia adalah penghubung harapan, ekonomi, dan akses dasar bagi ribuan warga.",
    content: "## Latar Belakang\n\nJembatan Panglima Sampul adalah penghubung vital antara Pulau Tebing Tinggi dengan Pulau Rangsang di Kabupaten Kepulauan Meranti. Pembangunannya yang sudah berjalan bertahun-tahun masih belum tuntas, menyebabkan penderitaan nyata bagi masyarakat.\n\n## Dampak Ekonomi\n\nSetiap hari, ratusan warga harus menempuh jalur laut yang mahal dan berisiko untuk mengakses pasar, sekolah, dan layanan kesehatan. Biaya transportasi meningkat hingga 3x lipat dibanding jika jembatan berfungsi.\n\n## Dampak Sosial\n\nAnak-anak terlambat ke sekolah, ibu hamil kesulitan akses fasilitas kesehatan, dan pedagang kecil kehilangan margin akibat biaya logistik tinggi.\n\n## Solusi\n\nKami menuntut percepatan penyelesaian jembatan ini dengan transparansi anggaran dan keterlibatan masyarakat dalam pengawasan.",
    coverImage: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    ],
    category: "Infrastruktur",
    tags: ["jembatan", "meranti", "infrastruktur"],
    author: "Siti Rahmawati",
    publishedAt: "2025-05-20",
    scheduledAt: null,
    metaTitle: "Mengapa Jembatan Panglima Sampul Penting? | Petisi Bela Rakyat",
    metaDescription: "Jembatan Panglima Sampul bukan sekadar infrastruktur — ia adalah penghubung harapan bagi ribuan warga Meranti.",
    status: "published",
    views: 1240,
  },
  {
    id: "b2",
    slug: "transparansi-anggaran-daerah",
    title: "Transparansi Anggaran Daerah: Hak Rakyat, Bukan Privilese",
    excerpt: "Mengapa publik berhak tahu ke mana uang mereka pergi, dan bagaimana kami mengawalnya.",
    content: "## Hak Konstitusional\n\nPasal 23E UUD 1945 menegaskan bahwa anggaran negara harus dikelola secara terbuka dan akuntabel.\n\n## Praktik Baik\n\nBeberapa daerah sudah membuka portal transparansi anggaran. Ini contoh yang harus diikuti oleh semua pemerintah daerah.\n\n## Peran Kami\n\nKami melakukan pendampingan masyarakat untuk mengakses informasi anggaran dan melaporkan indikasi penyimpangan.",
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    images: [],
    category: "Kebijakan Publik",
    tags: ["transparansi", "anggaran", "advokasi"],
    author: "Siti Rahmawati",
    publishedAt: "2025-05-10",
    scheduledAt: null,
    metaTitle: "Transparansi Anggaran Daerah | Petisi Bela Rakyat",
    metaDescription: "Mengapa publik berhak tahu ke mana uang mereka pergi, dan bagaimana kami mengawalnya.",
    status: "published",
    views: 870,
  },
  {
    id: "b3",
    slug: "aspirasi-nelayan-kepulauan-meranti",
    title: "Aspirasi Nelayan Kepulauan Meranti yang Tidak Pernah Didengar",
    excerpt: "Suara nelayan kecil seringkali tenggelam. Kami mendokumentasikannya untuk menjadi catatan publik.",
    content: "## Profil Nelayan Meranti\n\nLebih dari 60% penduduk Kepulauan Meranti menggantungkan hidup pada laut. Namun kebijakan kelautan sering tidak berpihak pada mereka.\n\n## Isu Utama\n\n- Tidak ada subsidi BBM untuk nelayan kecil\n- Pencemaran tambang mengancam hasil tangkapan\n- Tidak ada perlindungan harga saat panen raya\n\n## Tuntutan\n\nKami mendorong pemerintah untuk membuat kebijakan pro-nelayan kecil.",
    coverImage: "https://images.unsplash.com/photo-1505881502353-a1986add3762?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    images: [],
    category: "Aspirasi Rakyat",
    tags: ["nelayan", "meranti", "ekonomi"],
    author: "Budi Hartono",
    publishedAt: "2025-04-28",
    scheduledAt: null,
    metaTitle: "Aspirasi Nelayan Kepulauan Meranti | Petisi Bela Rakyat",
    metaDescription: "Suara nelayan kecil Kepulauan Meranti yang tenggelam — kami dokumentasikan untuk menjadi catatan publik.",
    status: "published",
    views: 645,
  },
  {
    id: "b4",
    slug: "advokasi-hukum-warga",
    title: "Advokasi Hukum untuk Warga yang Terdzolimi",
    excerpt: "Bagaimana kami mendampingi warga biasa yang berhadapan dengan sistem hukum yang kompleks.",
    content: "## Pendampingan Hukum\n\nKami menyediakan pendampingan hukum gratis bagi warga miskin yang berhadapan dengan kasus perdata atau pidana terkait hak-hak mereka.\n\n## Kasus yang Kami Tangani\n\n- Sengketa lahan masyarakat adat\n- Pemutusan hubungan kerja tanpa kompensasi\n- Pelanggaran hak konsumen\n\n## Cara Mengakses\n\nHubungi sekretariat kami atau kirim email ke advokasi@petisibelarakyat.id",
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    images: [],
    category: "Hukum",
    tags: ["advokasi", "hukum", "pendampingan"],
    author: "Maya Anggraini",
    publishedAt: "2025-04-15",
    scheduledAt: null,
    metaTitle: "Advokasi Hukum untuk Warga | Petisi Bela Rakyat",
    metaDescription: "Bagaimana kami mendampingi warga biasa yang berhadapan dengan sistem hukum yang kompleks.",
    status: "published",
    views: 512,
  },
];

const seedNews: NewsArticle[] = [
  {
    id: "n1",
    slug: "petisi-jembatan-tembus-500-tanda-tangan",
    title: "Petisi Jembatan Panglima Sampul Tembus 500 Tanda Tangan",
    excerpt: "Dalam dua minggu, petisi menuntut percepatan pembangunan jembatan berhasil mengumpulkan dukungan luar biasa dari masyarakat.",
    content: "## Sorotan\n\nPetisi yang diluncurkan pada awal Mei 2025 berhasil mengumpulkan lebih dari 500 tanda tangan dalam dua minggu.\n\n## Dukungan Tokoh\n\nSejumlah tokoh masyarakat, akademisi, dan mantan pejabat menyatakan dukungan terbuka terhadap petisi ini.\n\n## Langkah Selanjutnya\n\nKami akan membawa petisi ini ke DPRD Provinsi Riau dan Kementerian PUPR pada bulan depan.",
    coverImage: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    category: "Kampanye",
    author: "Maya Anggraini",
    publishedAt: "2025-05-25",
    status: "published",
    views: 980,
  },
  {
    id: "n2",
    slug: "audiensi-dengan-dprd-meranti",
    title: "Audiensi dengan DPRD Meranti: Hasil dan Tanggapan",
    excerpt: "Tim Petisi Bela Rakyat melakukan audiensi resmi dengan DPRD Kabupaten Kepulauan Meranti membahas pembangunan infrastruktur.",
    content: "## Audiensi\n\nAudiensi berlangsung selama 2 jam dan membahas tuntutan percepatan pembangunan dua jembatan vital.\n\n## Komitmen DPRD\n\nDPRD berkomitmen membentuk panitia khusus untuk mengawal isu ini.\n\n## Catatan Kami\n\nKami akan terus memantau perkembangan dan melaporkan kepada publik secara berkala.",
    coverImage: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    category: "Advokasi",
    author: "Siti Rahmawati",
    publishedAt: "2025-05-18",
    status: "published",
    views: 720,
  },
  {
    id: "n3",
    slug: "pelatihan-relawan-baru",
    title: "Pelatihan 20 Relawan Baru Petisi Bela Rakyat",
    excerpt: "Untuk memperluas jangkauan advokasi, kami mengadakan pelatihan relawan baru selama tiga hari di Selatpanjang.",
    content: "## Pelatihan\n\nMateri mencakup advokasi, dokumentasi isu, komunikasi publik, dan keselamatan kerja lapangan.\n\n## Peserta\n\n20 relawan dari 6 kecamatan berpartisipasi aktif.\n\n## Rencana\n\nPara relawan akan didistribusikan ke kampung-kampung untuk mengumpulkan aspirasi warga.",
    coverImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    category: "Organisasi",
    author: "Budi Hartono",
    publishedAt: "2025-05-08",
    status: "published",
    views: 430,
  },
];

const seedCampaigns: Campaign[] = [
  {
    id: "c1",
    slug: "jembatan-panglima-sampul",
    title: "Pembangunan Jembatan Panglima Sampul",
    description: "Menuntut percepatan penyelesaian Jembatan Panglima Sampul yang menghubungkan Pulau Tebing Tinggi dengan Pulau Rangsang. Pembangunan sudah berjalan lebih dari 5 tahun dan belum tuntas, menyulitkan ribuan warga untuk mengakses layanan dasar.",
    coverImage: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    petitionLink: "#",
    supporters: 327,
    goal: 1000,
    status: "active",
    location: "Kepulauan Meranti, Riau",
    startedAt: "2025-05-01",
  },
  {
    id: "c2",
    slug: "jembatan-perawang",
    title: "Pembangunan Jembatan Perawang",
    description: "Mengadvokasi pembangunan Jembatan Perawang sebagai infrastruktur vital untuk mobilitas ekonomi masyarakat pesisir. Kami menuntut alokasi anggaran yang transparan dan jadwal yang jelas.",
    coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    petitionLink: "#",
    supporters: 258,
    goal: 1000,
    status: "active",
    location: "Kepulauan Meranti, Riau",
    startedAt: "2025-05-05",
  },
];

const seedSupporters: Supporter[] = [
  { id: "s1", name: "Prof. Dr. H. Marwan Bali", position: "Akademisi Universitas Riau", statement: "Gerakan seperti Petisi Bela Rakyat adalah ruang demokrasi yang sehat. Saya mendukung penuh agenda advokasi infrastruktur ini.", photo: "" },
  { id: "s2", name: "Drs. H. Syafrudin, M.Si", position: "Tokoh Masyarakat Meranti", statement: "Sudah saatnya masyarakat bersuara. Saya berdiri di belakang Petisi Bela Rakyat untuk menuntut hak dasar warga.", photo: "" },
  { id: "s3", name: "Hj. Rohani, S.Pd", position: "Pendidik & Aktivis Perempuan", statement: "Kesejahteraan rakyat harus didahulukan. Saya mendukung perjuangan ini demi generasi mendatang.", photo: "" },
  { id: "s4", name: "Ir. H. Asmawi", position: "Pengusaha Lokal", statement: "Infrastruktur adalah darah perekonomian. Saya mendukung transparansi dan percepatan pembangunan jembatan.", photo: "" },
  { id: "s5", name: "Dra. Hj. Nuraini", position: "Pensiunan ASN", statement: "Pelayanan publik yang baik adalah hak setiap warga. Saya bersama Petisi Bela Rakyat.", photo: "" },
  { id: "s6", name: "H. Rizal Rahman", position: "Pemuka Agama", statement: "Membela hak rakyat adalah ibadah. Mari bersama mendukung gerakan ini.", photo: "" },
];

const seedGallery: GalleryItem[] = [
  { id: "g1", type: "photo", title: "Aksi Damai Tuntut Jembatan", url: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80", thumbnail: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", category: "Aksi", description: "Aksi damai di depan kantor bupati, Mei 2025", uploadedAt: "2025-05-22" },
  { id: "g2", type: "photo", title: "Audiensi DPRD", url: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80", thumbnail: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", category: "Audiensi", description: "Audiensi dengan DPRD Meranti, Mei 2025", uploadedAt: "2025-05-18" },
  { id: "g3", type: "photo", title: "Pelatihan Relawan", url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80", thumbnail: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", category: "Organisasi", description: "Pelatihan 20 relawan baru, Mei 2025", uploadedAt: "2025-05-08" },
  { id: "g4", type: "video", title: "Dokumentasi Aksi Damai", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", category: "Video", description: "Video dokumentasi aksi damai tuntutan jembatan", uploadedAt: "2025-05-23" },
  { id: "g5", type: "document", title: "Laporan Transparansi Q1 2025", url: "#", thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", category: "Laporan", description: "Laporan keuangan dan kegiatan Q1 2025", uploadedAt: "2025-04-05" },
  { id: "g6", type: "document", title: "Press Release Mei 2025", url: "#", thumbnail: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", category: "Press Release", description: "Siaran pers petisi jembatan", uploadedAt: "2025-05-01" },
];

const seedTransparency: TransparencyRecord[] = [
  { id: "tr1", date: "2025-05-01", type: "income", category: "Donasi Individu", description: "Donasi dari 45 donatur", amount: 12500000, source: "Crowdfunding" },
  { id: "tr2", date: "2025-05-03", type: "expense", category: "Operasional", description: "Cetak banner & spanduk aksi", amount: 2300000 },
  { id: "tr3", date: "2025-05-08", type: "expense", category: "Pelatihan", description: "Konsumsi & akomodasi pelatihan relawan", amount: 4500000 },
  { id: "tr4", date: "2025-05-10", type: "income", category: "Donasi Individu", description: "Donasi dari 28 donatur", amount: 8750000, source: "Transfer Bank" },
  { id: "tr5", date: "2025-05-15", type: "expense", category: "Advokasi", description: "Honor advokat pendamping", amount: 5000000 },
  { id: "tr6", date: "2025-05-20", type: "income", category: "Hibah", description: "Hibah lembaga mitra", amount: 25000000, source: "Hibah LSM" },
  { id: "tr7", date: "2025-05-22", type: "expense", category: "Aksi", description: "Operasional aksi damai", amount: 3200000 },
  { id: "tr8", date: "2025-05-25", type: "expense", category: "Komunikasi", description: "Biaya produksi konten", amount: 1800000 },
];

const seedTransparencyReports: TransparencyReport[] = [
  { id: "rp1", title: "Laporan Tahunan 2024", year: 2024, url: "#", uploadedAt: "2025-01-15" },
  { id: "rp2", title: "Laporan Keuangan Q1 2025", year: 2025, url: "#", uploadedAt: "2025-04-05" },
  { id: "rp3", title: "Laporan Kegiatan Mei 2025", year: 2025, url: "#", uploadedAt: "2025-06-01" },
];

const seedWork: WorkCategory[] = [
  { id: "w1", slug: "infrastruktur-publik", title: "Infrastruktur Publik", description: "Mengadvokasi percepatan pembangunan infrastruktur vital seperti jembatan, jalan, dan pelabuhan yang menentukan nasib ribuan warga.", icon: "Building2", coverImage: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
  { id: "w2", slug: "pendidikan", title: "Pendidikan", description: "Memperjuangkan akses pendidikan berkualitas untuk anak-anak di daerah terpencil, termasuk sekolah layang dan beasiswa.", icon: "GraduationCap", coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
  { id: "w3", slug: "ekonomi-rakyat", title: "Ekonomi Rakyat", description: "Mendukung UMKM, nelayan, dan petani melalui advokasi kebijakan ekonomi yang berpihak pada rakyat kecil.", icon: "TrendingUp", coverImage: "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
  { id: "w4", slug: "pelayanan-publik", title: "Pelayanan Publik", description: "Mengawal kualitas pelayanan publik di bidang kesehatan, kependudukan, dan administrasi yang bersih.", icon: "HeartHandshake", coverImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
  { id: "w5", slug: "advokasi-hukum", title: "Advokasi Hukum", description: "Memberikan pendampingan hukum gratis bagi warga miskin dan rentan yang berhadapan dengan sistem hukum.", icon: "Scale", coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
];

// Demo admin accounts
const adminAccounts = [
  { email: "superadmin@petisibelarakyat.id", password: "pbr2026", role: "super_admin" as Role, displayName: "Super Admin" },
  { email: "admin@petisibelarakyat.id", password: "pbr2026", role: "admin" as Role, displayName: "Admin" },
  { email: "editor@petisibelarakyat.id", password: "pbr2026", role: "editor" as Role, displayName: "Editor" },
];

// ============ ROLE PERMISSIONS ============
export const rolePermissions: Record<Role, string[]> = {
  super_admin: ["*"], // all
  admin: [
    "dashboard", "homepage", "team", "pengurus", "orgstructure", "penasehat", "relawan",
    "blog", "news", "campaigns", "supporters", "media", "transparency", "settings",
  ],
  editor: ["dashboard", "blog", "news"], // only blog & news
};

export function canAccess(role: Role, section: string): boolean {
  const perms = rolePermissions[role];
  return perms.includes("*") || perms.includes(section);
}

// ============ STORE ============
interface AppState {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Data
  settings: SiteSettings;
  team: TeamMember[]; // legacy
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

  // Settings update (deep merge for nested)
  updateSettings: (s: Partial<SiteSettings>) => void;
  updateHomepage: (s: Partial<HomepageSettings>) => void;
  updateAbout: (s: Partial<AboutSection>) => void;
  updateContact: (s: Partial<ContactInfo>) => void;
  updateSocials: (s: SocialLink[]) => void;
  updateFooter: (s: Partial<FooterSettings>) => void;

  // Pengurus CRUD
  addPengurus: (m: Omit<Pengurus, "id">) => void;
  updatePengurus: (id: string, m: Partial<Pengurus>) => void;
  deletePengurus: (id: string) => void;

  // Penasehat CRUD
  addPenasehat: (p: Omit<Penasehat, "id">) => void;
  updatePenasehat: (id: string, p: Partial<Penasehat>) => void;
  deletePenasehat: (id: string) => void;

  // Relawan CRUD
  addRelawan: (r: Omit<Relawan, "id">) => void;
  updateRelawan: (id: string, r: Partial<Relawan>) => void;
  deleteRelawan: (id: string) => void;

  // Team CRUD (legacy)
  addTeam: (m: Omit<TeamMember, "id">) => void;
  updateTeam: (id: string, m: Partial<TeamMember>) => void;
  deleteTeam: (id: string) => void;

  // Blog CRUD
  addBlog: (p: Omit<BlogPost, "id" | "views">) => void;
  updateBlog: (id: string, p: Partial<BlogPost>) => void;
  deleteBlog: (id: string) => void;
  incrementBlogView: (id: string) => void;

  // News CRUD
  addNews: (p: Omit<NewsArticle, "id" | "views">) => void;
  updateNews: (id: string, p: Partial<NewsArticle>) => void;
  deleteNews: (id: string) => void;
  incrementNewsView: (id: string) => void;

  // Campaign CRUD
  addCampaign: (c: Omit<Campaign, "id">) => void;
  updateCampaign: (id: string, c: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;

  // Supporter CRUD
  addSupporter: (s: Omit<Supporter, "id">) => void;
  updateSupporter: (id: string, s: Partial<Supporter>) => void;
  deleteSupporter: (id: string) => void;

  // Gallery CRUD
  addGallery: (g: Omit<GalleryItem, "id">) => void;
  updateGallery: (id: string, g: Partial<GalleryItem>) => void;
  deleteGallery: (id: string) => void;

  // Transparency CRUD
  addTransparency: (t: Omit<TransparencyRecord, "id">) => void;
  updateTransparency: (id: string, t: Partial<TransparencyRecord>) => void;
  deleteTransparency: (id: string) => void;
  addReport: (r: Omit<TransparencyReport, "id">) => void;
  deleteReport: (id: string) => void;
}

const genId = () => Math.random().toString(36).slice(2, 10);
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,

      login: (email, password) => {
        const acc = adminAccounts.find((a) => a.email === email && a.password === password);
        if (!acc) return false;
        set({
          currentUser: {
            uid: genId(),
            email: acc.email,
            displayName: acc.displayName,
            role: acc.role,
          },
        });
        return true;
      },
      logout: () => set({ currentUser: null }),

      settings: seedSettings,
      team: seedTeam,
      pengurus: seedPengurus,
      penasehat: seedPenasehat,
      relawan: seedRelawan,
      blog: seedBlog,
      news: seedNews,
      campaigns: seedCampaigns,
      supporters: seedSupporters,
      gallery: seedGallery,
      work: seedWork,
      transparency: seedTransparency,
      reports: seedTransparencyReports,

      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } as SiteSettings })),
      updateHomepage: (s) =>
        set((state) => ({
          settings: { ...state.settings, homepage: { ...state.settings.homepage, ...s } as HomepageSettings },
        })),
      updateAbout: (s) =>
        set((state) => ({
          settings: { ...state.settings, about: { ...state.settings.about, ...s } as AboutSection },
        })),
      updateContact: (s) =>
        set((state) => ({
          settings: { ...state.settings, contact: { ...state.settings.contact, ...s } as ContactInfo },
        })),
      updateSocials: (s) =>
        set((state) => ({ settings: { ...state.settings, socials: s } })),
      updateFooter: (s) =>
        set((state) => ({
          settings: { ...state.settings, footer: { ...state.settings.footer, ...s } as FooterSettings },
        })),

      addPengurus: (m) =>
        set((state) => ({
          pengurus: [...state.pengurus, { ...m, id: genId(), slug: m.slug || slugify(m.name) }],
        })),
      updatePengurus: (id, m) =>
        set((state) => ({
          pengurus: state.pengurus.map((t) => (t.id === id ? { ...t, ...m } : t)),
        })),
      deletePengurus: (id) =>
        set((state) => ({ pengurus: state.pengurus.filter((t) => t.id !== id) })),

      addPenasehat: (p) =>
        set((state) => ({ penasehat: [...state.penasehat, { ...p, id: genId() }] })),
      updatePenasehat: (id, p) =>
        set((state) => ({
          penasehat: state.penasehat.map((t) => (t.id === id ? { ...t, ...p } : t)),
        })),
      deletePenasehat: (id) =>
        set((state) => ({ penasehat: state.penasehat.filter((t) => t.id !== id) })),

      addRelawan: (r) =>
        set((state) => ({ relawan: [...state.relawan, { ...r, id: genId() }] })),
      updateRelawan: (id, r) =>
        set((state) => ({
          relawan: state.relawan.map((t) => (t.id === id ? { ...t, ...r } : t)),
        })),
      deleteRelawan: (id) =>
        set((state) => ({ relawan: state.relawan.filter((t) => t.id !== id) })),

      addTeam: (m) =>
        set((state) => ({
          team: [...state.team, { ...m, id: genId(), slug: m.slug || slugify(m.name) }],
        })),
      updateTeam: (id, m) =>
        set((state) => ({
          team: state.team.map((t) => (t.id === id ? { ...t, ...m } : t)),
        })),
      deleteTeam: (id) =>
        set((state) => ({ team: state.team.filter((t) => t.id !== id) })),

      addBlog: (p) =>
        set((state) => ({
          blog: [{ ...p, id: genId(), slug: p.slug || slugify(p.title), views: 0 }, ...state.blog],
        })),
      updateBlog: (id, p) =>
        set((state) => ({
          blog: state.blog.map((b) => (b.id === id ? { ...b, ...p } : b)),
        })),
      deleteBlog: (id) =>
        set((state) => ({ blog: state.blog.filter((b) => b.id !== id) })),
      incrementBlogView: (id) =>
        set((state) => ({
          blog: state.blog.map((b) => (b.id === id ? { ...b, views: b.views + 1 } : b)),
        })),

      addNews: (p) =>
        set((state) => ({
          news: [{ ...p, id: genId(), slug: p.slug || slugify(p.title), views: 0 }, ...state.news],
        })),
      updateNews: (id, p) =>
        set((state) => ({
          news: state.news.map((b) => (b.id === id ? { ...b, ...p } : b)),
        })),
      deleteNews: (id) =>
        set((state) => ({ news: state.news.filter((b) => b.id !== id) })),
      incrementNewsView: (id) =>
        set((state) => ({
          news: state.news.map((b) => (b.id === id ? { ...b, views: b.views + 1 } : b)),
        })),

      addCampaign: (c) =>
        set((state) => ({
          campaigns: [{ ...c, id: genId(), slug: c.slug || slugify(c.title) }, ...state.campaigns],
        })),
      updateCampaign: (id, c) =>
        set((state) => ({
          campaigns: state.campaigns.map((b) => (b.id === id ? { ...b, ...c } : b)),
        })),
      deleteCampaign: (id) =>
        set((state) => ({ campaigns: state.campaigns.filter((b) => b.id !== id) })),

      addSupporter: (s) =>
        set((state) => ({ supporters: [...state.supporters, { ...s, id: genId() }] })),
      updateSupporter: (id, s) =>
        set((state) => ({
          supporters: state.supporters.map((b) => (b.id === id ? { ...b, ...s } : b)),
        })),
      deleteSupporter: (id) =>
        set((state) => ({ supporters: state.supporters.filter((b) => b.id !== id) })),

      addGallery: (g) =>
        set((state) => ({ gallery: [...state.gallery, { ...g, id: genId() }] })),
      updateGallery: (id, g) =>
        set((state) => ({
          gallery: state.gallery.map((b) => (b.id === id ? { ...b, ...g } : b)),
        })),
      deleteGallery: (id) =>
        set((state) => ({ gallery: state.gallery.filter((b) => b.id !== id) })),

      addTransparency: (t) =>
        set((state) => ({ transparency: [...state.transparency, { ...t, id: genId() }] })),
      updateTransparency: (id, t) =>
        set((state) => ({
          transparency: state.transparency.map((b) => (b.id === id ? { ...b, ...t } : b)),
        })),
      deleteTransparency: (id) =>
        set((state) => ({ transparency: state.transparency.filter((b) => b.id !== id) })),
      addReport: (r) =>
        set((state) => ({ reports: [...state.reports, { ...r, id: genId() }] })),
      deleteReport: (id) =>
        set((state) => ({ reports: state.reports.filter((b) => b.id !== id) })),
    }),
    {
      name: "pbr-storage-v4",
      partialize: (state) => ({
        currentUser: state.currentUser,
        settings: state.settings,
        team: state.team,
        pengurus: state.pengurus,
        penasehat: state.penasehat,
        relawan: state.relawan,
        blog: state.blog,
        news: state.news,
        campaigns: state.campaigns,
        supporters: state.supporters,
        gallery: state.gallery,
        transparency: state.transparency,
        reports: state.reports,
        work: state.work,
      }),
    }
  )
);

export const formatCurrency = (n: number) =>
  "Rp " + n.toLocaleString("id-ID");

export const formatDate = (s: string) => {
  try {
    return new Date(s).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return s;
  }
};

// ============ ORG TREE HELPERS (dynamic) ============
export interface PengurusTreeNode extends Pengurus {
  children: PengurusTreeNode[];
  level: number;
}

/** Get root-level pengurus (parentId is null/empty) — sorted by order */
export function getRootPengurus(all: Pengurus[]): Pengurus[] {
  return all
    .filter((p) => !p.parentId)
    .sort((a, b) => a.order - b.order);
}

/** Get direct children of a pengurus (by parentId) — sorted by order */
export function getChildrenPengurus(all: Pengurus[], parentId: string): Pengurus[] {
  return all
    .filter((p) => p.parentId === parentId)
    .sort((a, b) => a.order - b.order);
}

/** Build full tree from flat pengurus list (only active by default) */
export function buildPengurusTree(
  all: Pengurus[],
  options: { onlyActive?: boolean } = {}
): PengurusTreeNode[] {
  const { onlyActive = true } = options;
  const filtered = onlyActive ? all.filter((p) => p.status === "active") : all;

  const buildNode = (p: Pengurus, level: number): PengurusTreeNode => {
    const children = filtered
      .filter((c) => c.parentId === p.id)
      .sort((a, b) => a.order - b.order)
      .map((c) => buildNode(c, level + 1));
    return { ...p, children, level };
  };

  return filtered
    .filter((p) => !p.parentId)
    .sort((a, b) => a.order - b.order)
    .map((p) => buildNode(p, 0));
}

/** Get all ancestors of a pengurus (for breadcrumb) */
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

/** Generate initials from name for placeholder avatar */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

