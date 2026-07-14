// ============================================================
// Translation strings — Indonesia (default), English, Mandarin
// ============================================================
// Konten dinamis (blog, news, campaigns) tetap dari Firestore
// (admin input bahasa apa, itu yang tampil). Hanya UI strings
// (navigation, headings, buttons) yang di-translate di sini.
// ============================================================

export type Locale = 'id' | 'en' | 'zh';

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export const translations = {
  // ============================================================
  // NAVIGATION
  // ============================================================
  nav: {
    home: { id: 'Beranda', en: 'Home', zh: '首页' },
    aboutUs: { id: 'Tentang Kami', en: 'About Us', zh: '关于我们' },
    ourWork: { id: 'Kerja Kami', en: 'Our Work', zh: '我们的工作' },
    campaigns: { id: 'Kampanye', en: 'Campaigns', zh: '运动' },
    news: { id: 'News', en: 'News', zh: '新闻' },
    blog: { id: 'Blog', en: 'Blog', zh: '博客' },
    gallery: { id: 'Galeri', en: 'Gallery', zh: '画廊' },
    transparency: { id: 'Transparansi', en: 'Transparency', zh: '透明度' },
    proposal: { id: 'Proposal', en: 'Proposal', zh: '提案' },
    contact: { id: 'Kontak', en: 'Contact', zh: '联系' },
    faq: { id: 'FAQ', en: 'FAQ', zh: '常见问题' },
    // About submenu
    ourStory: { id: 'Cerita Kami', en: 'Our Story', zh: '我们的故事' },
    visionMission: { id: 'Visi & Misi', en: 'Vision & Mission', zh: '愿景与使命' },
    teamStructure: { id: 'Struktur Tim', en: 'Team Structure', zh: '团队结构' },
    ourTeam: { id: 'Tim Kami', en: 'Our Team', zh: '我们的团队' },
    advisors: { id: 'Penasihat', en: 'Advisors', zh: '顾问' },
    volunteers: { id: 'Relawan', en: 'Volunteers', zh: '志愿者' },
  },

  // ============================================================
  // HERO
  // ============================================================
  hero: {
    badge: { id: 'Gerakan Rakyat, oleh Rakyat', en: 'People\'s Movement, by the People', zh: '人民运动，由人民' },
    primaryCta: { id: 'Pelajari Lebih Lanjut', en: 'Learn More', zh: '了解更多' },
    secondaryCta: { id: 'Lihat Kampanye', en: 'View Campaigns', zh: '查看活动' },
    scroll: { id: 'Scroll', en: 'Scroll', zh: '滚动' },
  },

  // ============================================================
  // HOMEPAGE SECTIONS
  // ============================================================
  home: {
    teamEyebrow: { id: 'Tim Kami', en: 'Our Team', zh: '我们的团队' },
    teamTitle: { id: 'Tim di Balik Gerakan', en: 'The Team Behind the Movement', zh: '运动背后的团队' },
    teamDesc: { id: 'Orang-orang yang dedikasikan waktu dan tenaganya untuk Petisi Bela Rakyat.', en: 'People dedicating their time and energy to Petisi Bela Rakyat.', zh: '为 petitions bela rakyat 奉献时间和精力的人。' },
    viewTeamStructure: { id: 'Lihat Struktur Tim', en: 'View Team Structure', zh: '查看团队结构' },
    viewAll: { id: 'Lihat Semua', en: 'View All', zh: '查看全部' },
    activeMembers: { id: 'anggota tim', en: 'team members', zh: '团队成员' },
    differentRoles: { id: 'peran berbeda', en: 'different roles', zh: '不同角色' },
    viewAllTeam: { id: 'Lihat semua tim', en: 'View all team', zh: '查看所有团队' },

    aboutEyebrow: { id: 'Tentang Kami', en: 'About Us', zh: '关于我们' },
    aboutTitle: { id: 'Membela rakyat dengan cara yang berbeda', en: 'Defending people differently', zh: '以不同的方式捍卫人民' },
    vision: { id: 'Visi', en: 'Vision', zh: '愿景' },
    mission: { id: 'Misi', en: 'Mission', zh: '使命' },

    workEyebrow: { id: 'Fokus Perjuangan', en: 'Focus Areas', zh: '重点领域' },
    workTitle: { id: 'Fokus Perjuangan Kami', en: 'Our Focus Areas', zh: '我们的重点领域' },

    newsEyebrow: { id: 'News', en: 'News', zh: '新闻' },
    newsTitle: { id: 'Berita Terbaru', en: 'Latest News', zh: '最新新闻' },

    supportersEyebrow: { id: 'Dukungan Tokoh', en: 'Endorsements', zh: '社会支持' },

    finalCtaTitle: { id: 'Satu tanda tangan Anda bisa mengubah nasib ribuan rakyat.', en: 'Your one signature can change the fate of thousands.', zh: '您的一个签名可以改变成千上万人的命运。' },
    finalCtaDesc: { id: 'Kami tidak akan berhenti sebelum suara rakyat didengar. Bergabunglah dengan gerakan ini — mulai dari satu tanda tangan Anda.', en: 'We will not stop until the people\'s voice is heard. Join this movement — starting with your signature.', zh: '在人民的声音被听到之前，我们不会停止。加入这场运动——从您的签名开始。' },
    signPetition: { id: 'Tandatangani Petisi', en: 'Sign the Petition', zh: '签署请愿书' },
    donateNow: { id: 'Donasi Sekarang', en: 'Donate Now', zh: '立即捐赠' },
  },

  // ============================================================
  // FOOTER
  // ============================================================
  footer: {
    getLatest: { id: 'Dapatkan kabar terbaru dari setiap kampanye dan peluang untuk berkontribusi.', en: 'Get the latest news from every campaign and opportunities to contribute.', zh: '获取每场运动的最新消息和参与机会。' },
    quickLinks: { id: 'Tautan Cepat', en: 'Quick Links', zh: '快速链接' },
    contact: { id: 'Kontak', en: 'Contact', zh: '联系' },
    secretariat: { id: 'Sekretariat', en: 'Secretariat', zh: '秘书处' },
    operationalHours: { id: 'Jam Operasional', en: 'Operating Hours', zh: '营业时间' },
    privacyPolicy: { id: 'Kebijakan Privasi', en: 'Privacy Policy', zh: '隐私政策' },
    terms: { id: 'Syarat & Ketentuan', en: 'Terms & Conditions', zh: '条款与条件' },
  },

  // ============================================================
  // COMMON BUTTONS & ACTIONS
  // ============================================================
  common: {
    back: { id: 'Kembali', en: 'Back', zh: '返回' },
    save: { id: 'Simpan', en: 'Save', zh: '保存' },
    cancel: { id: 'Batal', en: 'Cancel', zh: '取消' },
    delete: { id: 'Hapus', en: 'Delete', zh: '删除' },
    edit: { id: 'Edit', en: 'Edit', zh: '编辑' },
    add: { id: 'Tambah', en: 'Add', zh: '添加' },
    search: { id: 'Cari...', en: 'Search...', zh: '搜索...' },
    all: { id: 'Semua', en: 'All', zh: '全部' },
    loadMore: { id: 'Muat Lebih Banyak', en: 'Load More', zh: '加载更多' },
    share: { id: 'Bagikan', en: 'Share', zh: '分享' },
    copyLink: { id: 'Salin Link', en: 'Copy Link', zh: '复制链接' },
    viewAll: { id: 'Lihat Semua', en: 'View All', zh: '查看全部' },
    readMore: { id: 'Baca Selengkapnya', en: 'Read More', zh: '阅读更多' },
    minRead: { id: 'min baca', en: 'min read', zh: '分钟阅读' },
    views: { id: 'views', en: 'views', zh: '次浏览' },
    shares: { id: 'shares', en: 'shares', zh: '次分享' },
    by: { id: 'oleh', en: 'by', zh: '作者' },
  },

  // ============================================================
  // PETITION
  // ============================================================
  petition: {
    title: { id: 'Tandatangani Petisi', en: 'Sign the Petition', zh: '签署请愿书' },
    subtitle: { id: 'Satu perangkat = satu tanda tangan', en: 'One device = one signature', zh: '一台设备 = 一次签名' },
    signatures: { id: 'Tanda Tangan', en: 'Signatures', zh: '签名' },
    ofTarget: { id: 'dari target', en: 'of target', zh: '目标' },
    progress: { id: 'Progress', en: 'Progress', zh: '进度' },
    fullName: { id: 'Nama Lengkap', en: 'Full Name', zh: '全名' },
    email: { id: 'Email', en: 'Email', zh: '邮箱' },
    fullAddress: { id: 'Alamat Lengkap', en: 'Full Address', zh: '详细地址' },
    city: { id: 'Kota/Kabupaten', en: 'City/Regency', zh: '城市/县' },
    province: { id: 'Provinsi', en: 'Province', zh: '省份' },
    selectProvince: { id: 'Pilih Provinsi', en: 'Select Province', zh: '选择省份' },
    realtimeLocation: { id: 'Lokasi Realtime:', en: 'Realtime Location:', zh: '实时位置：' },
    optional: { id: 'Opsional', en: 'Optional', zh: '可选' },
    detect: { id: 'Deteksi', en: 'Detect', zh: '检测' },
    update: { id: 'Update', en: 'Update', zh: '更新' },
    supportMessage: { id: 'Pesan Dukungan (opsional)', en: 'Support Message (optional)', zh: '支持信息（可选）' },
    signNow: { id: 'Tandatangani Sekarang', en: 'Sign Now', zh: '立即签署' },
    submitting: { id: 'Mengirim Tanda Tangan...', en: 'Submitting Signature...', zh: '正在提交签名...' },
    recentSignatures: { id: 'Tanda Tangan Terbaru', en: 'Recent Signatures', zh: '最新签名' },
    total: { id: 'total', en: 'total', zh: '总计' },
    justNow: { id: 'baru saja', en: 'just now', zh: '刚刚' },
    minutesAgo: { id: 'menit lalu', en: 'minutes ago', zh: '分钟前' },
    hoursAgo: { id: 'jam lalu', en: 'hours ago', zh: '小时前' },
    daysAgo: { id: 'hari lalu', en: 'days ago', zh: '天前' },
    inviteFriends: { id: 'Ajak Teman Tanda Tangani', en: 'Invite Friends to Sign', zh: '邀请朋友签署' },
    alreadySigned: { id: 'Anda Sudah Menandatangani', en: 'You Already Signed', zh: '您已签署' },
    thankYou: { id: 'Terima kasih atas dukungan Anda!', en: 'Thank you for your support!', zh: '感谢您的支持！' },
    spreadPetition: { id: 'Sebarkan Petisi Ini', en: 'Spread This Petition', zh: '传播此请愿书' },
    transparent: { id: 'Transparan & Aman', en: 'Transparent & Safe', zh: '透明安全' },
    protected: { id: 'Identitas Anda dilindungi. Setiap tanda tangan diverifikasi.', en: 'Your identity is protected. Every signature is verified.', zh: '您的身份受到保护。每个签名都经过验证。' },
  },

  // ============================================================
  // PROPOSAL
  // ============================================================
  proposal: {
    badge: { id: 'Salurkan Donasi Terbaik', en: 'Give Your Best Donation', zh: '献上您的最佳捐赠' },
    title: { id: 'Proposal Bantuan Kegiatan & Anggaran', en: 'Activity Assistance & Budget Proposal', zh: '活动援助与预算提案' },
    subtitle: { id: 'Transparansi penuh dalam setiap kegiatan. Lihat rincian anggaran, salurkan donasi via transfer bank atau QRIS, dan jadilah bagian dari perubahan.', en: 'Full transparency in every activity. View budget details, donate via bank transfer or QRIS, and be part of the change.', zh: '每项活动完全透明。查看预算详情，通过银行转账或QRIS捐赠，成为变革的一部分。' },
    activeProposals: { id: 'Proposal Aktif', en: 'Active Proposals', zh: '活跃提案' },
    totalNeeded: { id: 'Total Kebutuhan', en: 'Total Needed', zh: '总需求' },
    donationOptions: { id: 'Opsi Donasi', en: 'Donation Options', zh: '捐赠选项' },
    noProposals: { id: 'Belum ada proposal aktif', en: 'No active proposals', zh: '暂无活跃提案' },
    totalBudget: { id: 'Total Kebutuhan Dana', en: 'Total Funds Needed', zh: '所需资金总额' },
    budgetEstimate: { id: 'Estimasi Anggaran', en: 'Budget Estimate', zh: '预算估算' },
    howToDonate: { id: 'Cara Donasi', en: 'How to Donate', zh: '如何捐赠' },
    scanQris: { id: 'Scan QRIS untuk Donasi', en: 'Scan QRIS to Donate', zh: '扫描QRIS捐赠' },
    scanQrisDesc: { id: 'Scan QRIS via e-wallet apapun (GoPay, OVO, DANA, ShopeePay, dll)', en: 'Scan QRIS via any e-wallet (GoPay, OVO, DANA, ShopeePay, etc.)', zh: '通过任何电子钱包扫描QRIS（GoPay、OVO、DANA、ShopeePay等）' },
    confirmDonation: { id: 'Konfirmasi Donasi / Hubungi:', en: 'Confirm Donation / Contact:', zh: '确认捐赠/联系：' },
    confirmViaWa: { id: 'Konfirmasi via WhatsApp', en: 'Confirm via WhatsApp', zh: '通过WhatsApp确认' },
    deadline: { id: 'Batas donasi', en: 'Donation deadline', zh: '捐赠截止' },
    activity: { id: 'Kegiatan', en: 'Activity', zh: '活动' },
    date: { id: 'Tanggal', en: 'Date', zh: '日期' },
    location: { id: 'Lokasi', en: 'Location', zh: '地点' },
    duration: { id: 'Durasi', en: 'Duration', zh: '时长' },
    beneficiaries: { id: 'Penerima Manfaat', en: 'Beneficiaries', zh: '受益人' },
    organizer: { id: 'Penyelenggara', en: 'Organizer', zh: '组织者' },
    expectedOutcome: { id: 'Hasil yang Diharapkan', en: 'Expected Outcome', zh: '预期成果' },
    description: { id: 'Deskripsi', en: 'Description', zh: '描述' },
    viewDetails: { id: 'Lihat Rincian Anggaran & Donasi', en: 'View Budget & Donation Details', zh: '查看预算与捐赠详情' },
    hideDetails: { id: 'Sembunyikan', en: 'Hide', zh: '隐藏' },
    transfer: { id: 'Transfer', en: 'Transfer', zh: '转账' },
    copy: { id: 'Salin', en: 'Copy', zh: '复制' },
    copied: { id: 'Disalin', en: 'Copied', zh: '已复制' },
  },

  // ============================================================
  // CONTACT
  // ============================================================
  contact: {
    title: { id: 'Hubungi Kami', en: 'Contact Us', zh: '联系我们' },
    subtitle: { id: 'Punya pertanyaan, masukan, atau ingin bergabung? Tim kami siap membantu Anda.', en: 'Have questions, feedback, or want to join? Our team is ready to help.', zh: '有问题、反馈或想加入？我们的团队随时为您提供帮助。' },
    name: { id: 'Nama', en: 'Name', zh: '姓名' },
    email: { id: 'Email', en: 'Email', zh: '邮箱' },
    phone: { id: 'Nomor Telepon', en: 'Phone Number', zh: '电话号码' },
    subject: { id: 'Subjek', en: 'Subject', zh: '主题' },
    message: { id: 'Pesan', en: 'Message', zh: '留言' },
    send: { id: 'Kirim Pesan', en: 'Send Message', zh: '发送消息' },
    sending: { id: 'Mengirim...', en: 'Sending...', zh: '发送中...' },
    sent: { id: 'Pesan terkirim!', en: 'Message sent!', zh: '消息已发送！' },
    sentDesc: { id: 'Tim kami akan menghubungi Anda dalam 1-2 hari kerja.', en: 'Our team will contact you within 1-2 business days.', zh: '我们的团队将在1-2个工作日内与您联系。' },
    chatNow: { id: 'Chat Sekarang', en: 'Chat Now', zh: '立即聊天' },
    sendEmail: { id: 'Kirim Email', en: 'Send Email', zh: '发送邮件' },
    viewMaps: { id: 'Lihat di Maps', en: 'View on Maps', zh: '在地图上查看' },
  },

  // ============================================================
  // CAMPAIGNS
  // ============================================================
  campaigns: {
    eyebrow: { id: 'Kampanye', en: 'Campaigns', zh: '运动' },
    title: { id: 'Suara Rakyat Berubah Jadi Aksi', en: 'People\'s Voice Turns Into Action', zh: '人民的声音化为行动' },
    subtitle: { id: 'Bergabung dengan kampanye yang sedang berjalan. Setiap tanda tangan membawa kita selangkah lebih dekat ke perubahan.', en: 'Join ongoing campaigns. Every signature brings us one step closer to change.', zh: '加入正在进行的运动。每个签名都让我们更接近改变。' },
    backToCampaigns: { id: 'Kembali ke Kampanye', en: 'Back to Campaigns', zh: '返回活动' },
    aboutCampaign: { id: 'Tentang Kampanye', en: 'About This Campaign', zh: '关于此活动' },
    whyImportant: { id: 'Mengapa Ini Penting', en: 'Why This Matters', zh: '为什么这很重要' },
    ourDemands: { id: 'Tuntutan Kami', en: 'Our Demands', zh: '我们的诉求' },
    startedOn: { id: 'Dimulai', en: 'Started', zh: '开始于' },
    otherCampaigns: { id: 'Kampanye Lainnya', en: 'Other Campaigns', zh: '其他活动' },
    status: { id: 'Status', en: 'Status', zh: '状态' },
    statusActive: { id: 'Aktif', en: 'Active', zh: '活跃' },
    statusWon: { id: 'Berhasil', en: 'Won', zh: '成功' },
    statusLost: { id: 'Belum Tercapai', en: 'Not Achieved', zh: '未达成' },
    statusPlanned: { id: 'Direncanakan', en: 'Planned', zh: '计划中' },
  },

  // ============================================================
  // LEGAL PAGES
  // ============================================================
  legal: {
    privacyBadge: { id: 'Kebijakan Privasi', en: 'Privacy Policy', zh: '隐私政策' },
    privacyTitle: { id: 'Kebijakan Privasi', en: 'Privacy Policy', zh: '隐私政策' },
    privacySubtitle: { id: 'Privasi Anda penting bagi kami. Dokumen ini menjelaskan bagaimana Petisi Bela Rakyat mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat menggunakan website kami.', en: 'Your privacy is important to us. This document explains how Petisi Bela Rakyat collects, uses, and protects your personal data when using our website.', zh: '您的隐私对我们很重要。本文件说明 petitions bela rakyat 如何在使用我们网站时收集、使用和保护您的个人数据。' },
    termsBadge: { id: 'Syarat & Ketentuan', en: 'Terms & Conditions', zh: '条款与条件' },
    termsTitle: { id: 'Syarat & Ketentuan', en: 'Terms & Conditions', zh: '条款与条件' },
    termsSubtitle: { id: 'Dengan mengakses dan menggunakan website Petisi Bela Rakyat, Anda menyetujui syarat dan ketentuan berikut. Mohon baca dengan seksama sebelum menggunakan layanan kami.', en: 'By accessing and using the Petisi Bela Rakyat website, you agree to the following terms and conditions. Please read carefully before using our services.', zh: '访问和使用 petitions bela rakyat 网站即表示您同意以下条款和条件。请在使用我们的服务前仔细阅读。' },
    lastUpdated: { id: 'Terakhir diperbarui', en: 'Last updated', zh: '最后更新' },
    tableOfContents: { id: 'Daftar Isi', en: 'Table of Contents', zh: '目录' },
    backToTop: { id: 'Kembali ke Atas', en: 'Back to Top', zh: '返回顶部' },
    questions: { id: 'Pertanyaan?', en: 'Questions?', zh: '有问题？' },
    contactDesc: { id: 'Hubungi kami untuk pertanyaan terkait dokumen ini.', en: 'Contact us for questions about this document.', zh: '联系我们了解有关此文件的问题。' },
  },

  // ============================================================
  // ADMIN PANEL
  // ============================================================
  admin: {
    login: { id: 'Admin Panel', en: 'Admin Panel', zh: '管理面板' },
    email: { id: 'Email', en: 'Email', zh: '邮箱' },
    password: { id: 'Password', en: 'Password', zh: '密码' },
    loginBtn: { id: 'Masuk ke Dashboard', en: 'Sign In to Dashboard', zh: '登录到仪表板' },
    backToWebsite: { id: '← Kembali ke Website', en: '← Back to Website', zh: '← 返回网站' },
    logout: { id: 'Keluar', en: 'Logout', zh: '退出' },
    viewWebsite: { id: 'Lihat Website', en: 'View Website', zh: '查看网站' },
    welcome: { id: 'Selamat datang kembali! 👋', en: 'Welcome back! 👋', zh: '欢迎回来！👋' },
    overview: { id: 'Berikut ringkasan aktivitas organisasi Anda hari ini.', en: 'Here\'s a summary of your organization\'s activity today.', zh: '以下是您组织今日的活动摘要。' },
    visitorToday: { id: 'Visitor Hari Ini', en: 'Visitors Today', zh: '今日访客' },
    totalVisitor: { id: 'Total Visitor', en: 'Total Visitors', zh: '总访客' },
    // Menu items
    dashboard: { id: 'Dashboard', en: 'Dashboard', zh: '仪表板' },
    manageHomepage: { id: 'Kelola Homepage', en: 'Manage Homepage', zh: '管理首页' },
    manageTeam: { id: 'Kelola Tim', en: 'Manage Team', zh: '管理团队' },
    manageVolunteers: { id: 'Kelola Relawan', en: 'Manage Volunteers', zh: '管理志愿者' },
    manageBlog: { id: 'Kelola Blog', en: 'Manage Blog', zh: '管理博客' },
    manageNews: { id: 'Kelola News', en: 'Manage News', zh: '管理新闻' },
    manageCampaigns: { id: 'Kelola Kampanye', en: 'Manage Campaigns', zh: '管理活动' },
    endorsements: { id: 'Dukungan Tokoh', en: 'Endorsements', zh: '社会支持' },
    manageMedia: { id: 'Kelola Media', en: 'Manage Media', zh: '管理媒体' },
    manageTransparency: { id: 'Kelola Transparansi', en: 'Manage Transparency', zh: '管理透明度' },
    proposalDonation: { id: 'Proposal & Donasi', en: 'Proposal & Donation', zh: '提案与捐赠' },
    mobileApp: { id: 'Mobile App', en: 'Mobile App', zh: '移动应用' },
    siteSettings: { id: 'Pengaturan Situs', en: 'Site Settings', zh: '网站设置' },
  },
} as const;

// ============================================================
// Helper: get translation value
// ============================================================
export type TranslationKey = keyof typeof translations;

// Get a nested translation value by dot path (e.g. 'nav.home')
export function getTranslation(locale: Locale, path: string): string {
  const parts = path.split('.');
  let current: any = translations;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return path; // fallback: return the key itself
    }
  }
  if (current && typeof current === 'object' && locale in current) {
    return current[locale];
  }
  return path; // fallback
}
