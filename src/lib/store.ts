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

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  metaTitle: string;
  metaDescription: string;
  status: "published" | "draft";
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

export interface SiteSettings {
  hero: {
    image: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
  };
  stats: { label: string; value: number; suffix: string }[];
  about: {
    visi: string;
    misi: string[];
    nilai: { title: string; description: string }[];
    sejarah: string;
  };
  contact: {
    address: string;
    whatsapp: string;
    email: string;
    mapEmbed: string;
  };
  socials: { name: string; url: string; icon: string }[];
}

// ============ SEED DATA ============
const seedSettings: SiteSettings = {
  hero: {
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80",
    headline: "Menyatukan Suara Rakyat Menjadi Perubahan",
    subheadline:
      "Gerakan masyarakat sipil independen untuk memperjuangkan kepentingan rakyat melalui advokasi, partisipasi publik, dan aksi nyata.",
    primaryCta: "Tandatangani Petisi",
    secondaryCta: "Pelajari Perjuangan Kami",
  },
  stats: [
    { label: "Tanda Tangan", value: 585, suffix: "+" },
    { label: "Relawan", value: 10, suffix: "+" },
    { label: "Tokoh Pendukung", value: 6, suffix: "+" },
    { label: "Kampanye Aktif", value: 2, suffix: "" },
  ],
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
      {
        title: "Independen",
        description:
          "Kami bebas dari pengaruh politik dan kepentingan ekonomi tertentu, berdiri tegak untuk kepentingan rakyat.",
      },
      {
        title: "Berani",
        description:
          "Kami berani menyuarakan kebenaran dan menuntut keadilan meskipun di hadapan kekuasaan.",
      },
      {
        title: "Transparan",
        description:
          "Setiap rupiah yang kami terima dan keluarkan dilaporkan terbuka untuk dapat diaudit publik.",
      },
      {
        title: "Berakar pada Rakyat",
        description:
          "Seluruh agenda kami lahir dari aspirasi nyata masyarakat di lapangan, bukan dari meja elite.",
      },
    ],
    sejarah:
      "Petisi Bela Rakyat lahir dari keprihatinan sekelompok aktivis, akademisi, dan tokoh masyarakat di Kabupaten Kepulauan Meranti terhadap lambatnya pembangunan infrastruktur publik dan lemahnya advokasi hak warga. Berdiri sejak 2024, organisasi ini memulai perjalanan dengan kampanye penuntasan pembangunan Jembatan Panglima Sampul dan Jembatan Perawang — dua infrastruktur vital yang menghubungkan pulau-pulau dan menentukan nasib ribuan warga. Dalam waktu singkat, gerakan ini berhasil mengumpulkan ratusan tanda tangan dukungan dan melibatkan tokoh-tokoh strategis sebagai pendukung. Hari ini, Petisi Bela Rakyat berkembang menjadi platform advokasi multisektor yang mencakup infrastruktur, pendidikan, ekonomi rakyat, pelayanan publik, dan advokasi hukum — dengan komitmen yang sama: membela rakyat, tanpa kompromi.",
  },
  contact: {
    address:
      "Sekretariat Petisi Bela Rakyat, Jl. Pahlawan No. 12, Selatpanjang, Kabupaten Kepulauan Meranti, Riau 28753",
    whatsapp: "+62 812-0000-0000",
    email: "halo@petisibelarakyat.id",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.5!2d102.7!3d1.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMDAnMDAuMCJOIDEwMsKwNDInMDAuMCJF!5e0!3m2!1sen!2sid!4v1700000000000",
  },
  socials: [
    { name: "Facebook", url: "https://facebook.com/petisibelarakyat", icon: "facebook" },
    { name: "Instagram", url: "https://instagram.com/petisibelarakyat", icon: "instagram" },
    { name: "X", url: "https://twitter.com/petisibelarakyat", icon: "twitter" },
    { name: "YouTube", url: "https://youtube.com/@petisibelarakyat", icon: "youtube" },
  ],
};

const seedTeam: TeamMember[] = [
  {
    id: "t1",
    slug: "agus-suliadi",
    name: "Agus Suliadi",
    position: "Ketua Dewan Pembina",
    summary:
      "Tokoh masyarakat Kepulauan Meranti dengan lebih dari 20 tahun pengalaman advokasi infrastruktur publik.",
    bio: "Agus Suliadi adalah putra asli Selatpanjang yang sejak muda aktif dalam berbagai gerakan masyarakat sipil. Ia memimpin petisi penuntasan Jembatan Panglima Sampul dan dikenal sebagai suara yang konsisten membela hak masyarakat pesisir.",
    experience:
      "Pendiri Forum Masyarakat Sipil Meranti (2018), Konsultan Advokasi Infrastruktur Pemerintah Daerah (2020-2023), Pembicara di Forum NGO Nasional 2023.",
    responsibilities:
      "Mengarahkan strategi organisasi, membangun aliansi strategis dengan pemangku kepentingan, dan memastikan setiap kampanye berakar pada kebutuhan riil masyarakat.",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    order: 1,
  },
  {
    id: "t2",
    slug: "siti-rahmawati",
    name: "Siti Rahmawati",
    position: "Direktur Eksekutif",
    summary:
      "Peneliti kebijakan publik dengan fokus pada tata kelola pemerintahan dan transparansi anggaran.",
    bio: "Siti Rahmawati menyelesaikan magister di bidang Kebijakan Publik dan aktif menulis tentang akuntabilitas anggaran daerah. Ia memimpin operasional harian Petisi Bela Rakyat.",
    experience:
      "Peneliti di Lembaga Studi Kebijakan Publik (2019-2024), Penulis 12 policy brief, Narasumber di 30+ forum publik.",
    responsibilities:
      "Mengelola operasional organisasi, mengarahkan riset kebijakan, dan mengawal pelaksanaan program kerja.",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    order: 2,
  },
  {
    id: "t3",
    slug: "budi-hartono",
    name: "Budi Hartono",
    position: "Koordinator Kampanye",
    summary:
      "Aktivis lapangan dengan jaringan luas di komunitas nelayan dan petani Kepulauan Meranti.",
    bio: "Budi Hartono adalah mantan nelayan yang berubah menjadi aktivis. Ia mengkoordinir seluruh kampanye lapangan dan menjadi jembatan antara organisasi dengan masyarakat akar rumput.",
    experience:
      "Koordinator Lapangan Forum Nelayan Meranti (2017-2024), Penyelenggara 50+ aksi damai, Pelatih partisipasi warga.",
    responsibilities:
      "Merancang dan mengeksekusi kampanye lapangan, mengelola relawan, serta memastikan partisipasi masyarakat dalam setiap aksi.",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    order: 3,
  },
  {
    id: "t4",
    slug: "maya-anggraini",
    name: "Maya Anggraini",
    position: "Manajer Komunikasi",
    summary:
      "Jurnalis dan content strategist dengan pengalaman 8 tahun di media nasional.",
    blog: "",
    experience: "",
    responsibilities: "",
    bio: "Maya Anggraini bertugas memastikan setiap cerita rakyat didengar oleh publik luas melalui narasi yang kuat dan etis.",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    order: 4,
  } as TeamMember,
];

const seedBlog: BlogPost[] = [
  {
    id: "b1",
    slug: "mengapa-jembatan-panglima-sampul-penting",
    title: "Mengapa Jembatan Panglima Sampul Penting bagi Masyarakat Meranti?",
    excerpt:
      "Jembatan ini bukan sekadar infrastruktur — ia adalah penghubung harapan, ekonomi, dan akses dasar bagi ribuan warga.",
    content:
      "## Latar Belakang\n\nJembatan Panglima Sampul adalah penghubung vital antara Pulau Tebing Tinggi dengan Pulau Rangsang di Kabupaten Kepulauan Meranti. Pembangunannya yang sudah berjalan bertahun-tahun masih belum tuntas, menyebabkan penderitaan nyata bagi masyarakat.\n\n## Dampak Ekonomi\n\nSetiap hari, ratusan warga harus menempuh jalur laut yang mahal dan berisiko untuk mengakses pasar, sekolah, dan layanan kesehatan. Biaya transportasi meningkat hingga 3x lipat dibanding jika jembatan berfungsi.\n\n## Dampak Sosial\n\nAnak-anak terlambat ke sekolah, ibu hamil kesulitan akses fasilitas kesehatan, dan pedagang kecil kehilangan margin akibat biaya logistik tinggi.\n\n## Solusi\n\nKami menuntut percepatan penyelesaian jembatan ini dengan transparansi anggaran dan keterlibatan masyarakat dalam pengawasan.",
    coverImage:
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    category: "Infrastruktur",
    tags: ["jembatan", "meranti", "infrastruktur"],
    author: "Siti Rahmawati",
    publishedAt: "2025-05-20",
    metaTitle: "Mengapa Jembatan Panglima Sampul Penting? | Petisi Bela Rakyat",
    metaDescription:
      "Jembatan Panglima Sampul bukan sekadar infrastruktur — ia adalah penghubung harapan bagi ribuan warga Meranti.",
    status: "published",
    views: 1240,
  },
  {
    id: "b2",
    slug: "transparansi-anggaran-daerah",
    title: "Transparansi Anggaran Daerah: Hak Rakyat, Bukan Privilese",
    excerpt:
      "Mengapa publik berhak tahu ke mana uang mereka pergi, dan bagaimana kami mengawalnya.",
    content:
      "## Hak Konstitusional\n\nPasal 23E UUD 1945 menegaskan bahwa anggaran negara harus dikelola secara terbuka dan akuntabel.\n\n## Praktik Baik\n\nBeberapa daerah sudah membuka portal transparansi anggaran. Ini contoh yang harus diikuti oleh semua pemerintah daerah.\n\n## Peran Kami\n\nKami melakukan pendampingan masyarakat untuk mengakses informasi anggaran dan melaporkan indikasi penyimpangan.",
    coverImage:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    category: "Kebijakan Publik",
    tags: ["transparansi", "anggaran", "advokasi"],
    author: "Siti Rahmawati",
    publishedAt: "2025-05-10",
    metaTitle: "Transparansi Anggaran Daerah | Petisi Bela Rakyat",
    metaDescription:
      "Mengapa publik berhak tahu ke mana uang mereka pergi, dan bagaimana kami mengawalnya.",
    status: "published",
    views: 870,
  },
  {
    id: "b3",
    slug: "aspirasi-nelayan-kepulauan-meranti",
    title: "Aspirasi Nelayan Kepulauan Meranti yang Tidak Pernah Didengar",
    excerpt:
      "Suara nelayan kecil seringkali tenggelam. Kami mendokumentasikannya untuk menjadi catatan publik.",
    content:
      "## Profil Nelayan Meranti\n\nLebih dari 60% penduduk Kepulauan Meranti menggantungkan hidup pada laut. Namun kebijakan kelautan sering tidak berpihak pada mereka.\n\n## Isu Utama\n\n- Tidak ada subsidi BBM untuk nelayan kecil\n- Pencemaran tambang mengancam hasil tangkapan\n- Tidak ada perlindungan harga saat panen raya\n\n## Tuntutan\n\nKami mendorong pemerintah untuk membuat kebijakan pro-nelayan kecil.",
    coverImage:
      "https://images.unsplash.com/photo-1505881502353-a1986add3762?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    category: "Aspirasi Rakyat",
    tags: ["nelayan", "meranti", "ekonomi"],
    author: "Budi Hartono",
    publishedAt: "2025-04-28",
    metaTitle: "Aspirasi Nelayan Kepulauan Meranti | Petisi Bela Rakyat",
    metaDescription:
      "Suara nelayan kecil Kepulauan Meranti yang tenggelam — kami dokumentasikan untuk menjadi catatan publik.",
    status: "published",
    views: 645,
  },
  {
    id: "b4",
    slug: "advokasi-hukum-warga",
    title: "Advokasi Hukum untuk Warga yang Terdzolimi",
    excerpt:
      "Bagaimana kami mendampingi warga biasa yang berhadapan dengan sistem hukum yang kompleks.",
    content:
      "## Pendampingan Hukum\n\nKami menyediakan pendampingan hukum gratis bagi warga miskin yang berhadapan dengan kasus perdata atau pidana terkait hak-hak mereka.\n\n## Kasus yang Kami Tangani\n\n- Sengketa lahan masyarakat adat\n- Pemutusan hubungan kerja tanpa kompensasi\n- Pelanggaran hak konsumen\n\n## Cara Mengakses\n\nHubungi sekretariat kami atau kirim email ke advokasi@petisibelarakyat.id",
    coverImage:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    category: "Hukum",
    tags: ["advokasi", "hukum", "pendampingan"],
    author: "Maya Anggraini",
    publishedAt: "2025-04-15",
    metaTitle: "Advokasi Hukum untuk Warga | Petisi Bela Rakyat",
    metaDescription:
      "Bagaimana kami mendampingi warga biasa yang berhadapan dengan sistem hukum yang kompleks.",
    status: "published",
    views: 512,
  },
];

const seedNews: NewsArticle[] = [
  {
    id: "n1",
    slug: "petisi-jembatan-tembus-500-tanda-tangan",
    title: "Petisi Jembatan Panglima Sampul Tembus 500 Tanda Tangan",
    excerpt:
      "Dalam dua minggu, petisi menuntut percepatan pembangunan jembatan berhasil mengumpulkan dukungan luar biasa dari masyarakat.",
    content:
      "## Sorotan\n\nPetisi yang diluncurkan pada awal Mei 2025 berhasil mengumpulkan lebih dari 500 tanda tangan dalam dua minggu.\n\n## Dukungan Tokoh\n\nSejumlah tokoh masyarakat, akademisi, dan mantan pejabat menyatakan dukungan terbuka terhadap petisi ini.\n\n## Langkah Selanjutnya\n\nKami akan membawa petisi ini ke DPRD Provinsi Riau dan Kementerian PUPR pada bulan depan.",
    coverImage:
      "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
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
    excerpt:
      "Tim Petisi Bela Rakyat melakukan audiensi resmi dengan DPRD Kabupaten Kepulauan Meranti membahas pembangunan infrastruktur.",
    content:
      "## Audiensi\n\nAudiensi berlangsung selama 2 jam dan membahas tuntutan percepatan pembangunan dua jembatan vital.\n\n## Komitmen DPRD\n\nDPRD berkomitmen membentuk panitia khusus untuk mengawal isu ini.\n\n## Catatan Kami\n\nKami akan terus memantau perkembangan dan melaporkan kepada publik secara berkala.",
    coverImage:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
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
    excerpt:
      "Untuk memperluas jangkauan advokasi, kami mengadakan pelatihan relawan baru selama tiga hari di Selatpanjang.",
    content:
      "## Pelatihan\n\nMateri mencakup advokasi, dokumentasi isu, komunikasi publik, dan keselamatan kerja lapangan.\n\n## Peserta\n\n20 relawan dari 6 kecamatan berpartisipasi aktif.\n\n## Rencana\n\nPara relawan akan didistribusikan ke kampung-kampung untuk mengumpulkan aspirasi warga.",
    coverImage:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
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
    description:
      "Menuntut percepatan penyelesaian Jembatan Panglima Sampul yang menghubungkan Pulau Tebing Tinggi dengan Pulau Rangsang. Pembangunan sudah berjalan lebih dari 5 tahun dan belum tuntas, menyulitkan ribuan warga untuk mengakses layanan dasar.",
    coverImage:
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
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
    description:
      "Mengadvokasi pembangunan Jembatan Perawang sebagai infrastruktur vital untuk mobilitas ekonomi masyarakat pesisir. Kami menuntut alokasi anggaran yang transparan dan jadwal yang jelas.",
    coverImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    petitionLink: "#",
    supporters: 258,
    goal: 1000,
    status: "active",
    location: "Kepulauan Meranti, Riau",
    startedAt: "2025-05-05",
  },
];

const seedSupporters: Supporter[] = [
  {
    id: "s1",
    name: "Prof. Dr. H. Marwan Bali",
    position: "Akademisi Universitas Riau",
    statement:
      "Gerakan seperti Petisi Bela Rakyat adalah ruang demokrasi yang sehat. Saya mendukung penuh agenda advokasi infrastruktur ini.",
    photo:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "s2",
    name: "Drs. H. Syafrudin, M.Si",
    position: "Tokoh Masyarakat Meranti",
    statement:
      "Sudah saatnya masyarakat bersuara. Saya berdiri di belakang Petisi Bela Rakyat untuk menuntut hak dasar warga.",
    photo:
      "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "s3",
    name: "Hj. Rohani, S.Pd",
    position: "Pendidik & Aktivis Perempuan",
    statement:
      "Kesejahteraan rakyat harus didahulukan. Saya mendukung perjuangan ini demi generasi mendatang.",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "s4",
    name: "Ir. H. Asmawi",
    position: "Pengusaha Lokal",
    statement:
      "Infrastruktur adalah darah perekonomian. Saya mendukung transparansi dan percepatan pembangunan jembatan.",
    photo:
      "https://images.unsplash.com/photo-1472099483957-5a6586b09573?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "s5",
    name: "Dra. Hj. Nuraini",
    position: "Pensiunan ASN",
    statement:
      "Pelayanan publik yang baik adalah hak setiap warga. Saya bersama Petisi Bela Rakyat.",
    photo:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "s6",
    name: "H. Rizal Rahman",
    position: "Pemuka Agama",
    statement:
      "Membela hak rakyat adalah ibadah. Mari bersama mendukung gerakan ini.",
    photo:
      "https://images.unsplash.com/photo-1546961342-1543f0a9c4c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  },
];

const seedGallery: GalleryItem[] = [
  {
    id: "g1",
    type: "photo",
    title: "Aksi Damai Tuntut Jembatan",
    url: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    thumbnail: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Aksi",
    description: "Aksi damai di depan kantor bupati, Mei 2025",
    uploadedAt: "2025-05-22",
  },
  {
    id: "g2",
    type: "photo",
    title: "Audiensi DPRD",
    url: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    thumbnail: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Audiensi",
    description: "Audiensi dengan DPRD Meranti, Mei 2025",
    uploadedAt: "2025-05-18",
  },
  {
    id: "g3",
    type: "photo",
    title: "Pelatihan Relawan",
    url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    thumbnail: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Organisasi",
    description: "Pelatihan 20 relawan baru, Mei 2025",
    uploadedAt: "2025-05-08",
  },
  {
    id: "g4",
    type: "video",
    title: "Dokumentasi Aksi Damai",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Video",
    description: "Video dokumentasi aksi damai tuntutan jembatan",
    uploadedAt: "2025-05-23",
  },
  {
    id: "g5",
    type: "document",
    title: "Laporan Transparansi Q1 2025",
    url: "#",
    thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Laporan",
    description: "Laporan keuangan dan kegiatan Q1 2025",
    uploadedAt: "2025-04-05",
  },
  {
    id: "g6",
    type: "document",
    title: "Press Release Mei 2025",
    url: "#",
    thumbnail: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Press Release",
    description: "Siaran pers petisi jembatan",
    uploadedAt: "2025-05-01",
  },
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
  {
    id: "w1",
    slug: "infrastruktur-publik",
    title: "Infrastruktur Publik",
    description: "Mengadvokasi percepatan pembangunan infrastruktur vital seperti jembatan, jalan, dan pelabuhan yang menentukan nasib ribuan warga.",
    icon: "Building2",
    coverImage: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "w2",
    slug: "pendidikan",
    title: "Pendidikan",
    description: "Memperjuangkan akses pendidikan berkualitas untuk anak-anak di daerah terpencil, termasuk sekolah layang dan beasiswa.",
    icon: "GraduationCap",
    coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "w3",
    slug: "ekonomi-rakyat",
    title: "Ekonomi Rakyat",
    description: "Mendukung UMKM, nelayan, dan petani melalui advokasi kebijakan ekonomi yang berpihak pada rakyat kecil.",
    icon: "TrendingUp",
    coverImage: "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "w4",
    slug: "pelayanan-publik",
    title: "Pelayanan Publik",
    description: "Mengawal kualitas pelayanan publik di bidang kesehatan, kependudukan, dan administrasi yang bersih.",
    icon: "HeartHandshake",
    coverImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "w5",
    slug: "advokasi-hukum",
    title: "Advokasi Hukum",
    description: "Memberikan pendampingan hukum gratis bagi warga miskin dan rentan yang berhadapan dengan sistem hukum.",
    icon: "Scale",
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  },
];

// ============ STORE ============
interface AppState {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Data
  settings: SiteSettings;
  team: TeamMember[];
  blog: BlogPost[];
  news: NewsArticle[];
  campaigns: Campaign[];
  supporters: Supporter[];
  gallery: GalleryItem[];
  work: WorkCategory[];
  transparency: TransparencyRecord[];
  reports: TransparencyReport[];

  // Settings
  updateSettings: (s: Partial<SiteSettings>) => void;

  // Team CRUD
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

// Demo admin accounts
const adminAccounts = [
  { email: "superadmin@petisibelarakyat.id", password: "pbr2026", role: "super_admin" as Role, displayName: "Super Admin" },
  { email: "admin@petisibelarakyat.id", password: "pbr2026", role: "admin" as Role, displayName: "Admin" },
  { email: "editor@petisibelarakyat.id", password: "pbr2026", role: "editor" as Role, displayName: "Editor" },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,

      login: (email, password) => {
        const acc = adminAccounts.find(
          (a) => a.email === email && a.password === password
        );
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
          blog: state.blog.map((b) =>
            b.id === id ? { ...b, views: b.views + 1 } : b
          ),
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
          news: state.news.map((b) =>
            b.id === id ? { ...b, views: b.views + 1 } : b
          ),
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
      name: "pbr-storage-v1",
      partialize: (state) => ({
        currentUser: state.currentUser,
        settings: state.settings,
        team: state.team,
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
