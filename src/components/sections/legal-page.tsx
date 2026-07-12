"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, FileText, Lock, UserCheck, Database, Globe,
  Mail, AlertTriangle, CheckCircle2, Eye, Cookie, Scale,
  ChevronRight, ArrowUp, Building2,
} from "lucide-react";
import { Reveal } from "@/components/animation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// ============================================================
// Shared layout untuk halaman legal
// ============================================================
interface LegalSection {
  id: string;
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
}

function LegalLayout({
  badge,
  title,
  subtitle,
  lastUpdated,
  sections,
}: {
  badge: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: LegalSection[];
}) {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      let current = "";
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            current = section.id;
            break;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pt-24 md:pt-32 pb-20">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-foreground/5" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-red-900/10 blur-3xl" />

        <div className="container-x relative max-w-4xl">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm font-semibold mb-6">
              <Shield className="h-4 w-4" />
              {badge}
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {title}
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {subtitle}
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Terakhir diperbarui: {lastUpdated}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Petisi Bela Rakyat
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Content + TOC */}
      <section className="py-12 md:py-16">
        <div className="container-x max-w-6xl">
          <div className="grid lg:grid-cols-[1fr_280px] gap-10">
            {/* Main content */}
            <div className="space-y-10 min-w-0">
              {sections.map((section, i) => {
                const Icon = section.icon;
                return (
                  <Reveal key={section.id} delay={i * 0.05}>
                    <section id={section.id} className="scroll-mt-28">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight">
                          {section.title}
                        </h2>
                      </div>
                      <div className="prose prose-sm md:prose-base max-w-none text-foreground/85 leading-relaxed space-y-3 pl-0 md:pl-13">
                        {section.content}
                      </div>
                    </section>
                  </Reveal>
                );
              })}

              {/* Back to top */}
              <div className="pt-8 border-t border-border">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={scrollToTop}
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Kembali ke Atas
                </Button>
              </div>
            </div>

            {/* Table of contents (sticky) */}
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <Card className="p-5 border-0 shadow-lg">
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    Daftar Isi
                  </h3>
                  <nav className="space-y-1">
                    {sections.map((section) => {
                      const isActive = activeSection === section.id;
                      return (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                          }`}
                        >
                          <ChevronRight className={`h-3 w-3 shrink-0 ${isActive ? 'opacity-100' : 'opacity-30'}`} />
                          <span className="line-clamp-1">{section.title}</span>
                        </a>
                      );
                    })}
                  </nav>
                </Card>

                <Card className="mt-4 p-5 border-0 shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-heading font-bold text-sm mb-1">Pertanyaan?</div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                        Hubungi kami untuk pertanyaan terkait dokumen ini.
                      </p>
                      <a
                        href="mailto:halo@belarakyat.org"
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        halo@belarakyat.org
                      </a>
                    </div>
                  </div>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// Komponen teks reusable
// ============================================================
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-foreground/80">{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2">{children}</ul>;
}

function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <span className="text-foreground/80">{children}</span>
    </li>
  );
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900 dark:text-amber-200">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// Privacy Policy Page
// ============================================================
export function PrivacyPolicyPage() {
  return (
    <LegalLayout
      badge="Kebijakan Privasi"
      title="Kebijakan Privasi"
      subtitle="Privasi Anda penting bagi kami. Dokumen ini menjelaskan bagaimana Petisi Bela Rakyat mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat menggunakan website kami."
      lastUpdated="10 Juli 2026"
      sections={[
        {
          id: "pendahuluan",
          icon: FileText,
          title: "1. Pendahuluan",
          content: (
            <>
              <P>
                Petisi Bela Rakyat ("PBR", "kami", "kita") berkomitmen melindungi privasi setiap pengunjung, pendukung, dan donatur. Kebijakan privasi ini menjelaskan jenis data yang kami kumpulkan, bagaimana data tersebut digunakan, dan hak Anda atas data pribadi tersebut.
              </P>
              <P>
                Dengan mengakses dan menggunakan website <strong>belarakyat.org</strong>, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini. Jika Anda tidak setuju, mohon untuk tidak menggunakan website ini.
              </P>
              <P>
                Kebijakan ini disusun mengacu pada <strong>Undang-Undang Nomor 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP)</strong> Republik Indonesia serta praktik privasi internasional yang berlaku.
              </P>
            </>
          ),
        },
        {
          id: "data-yang-dikumpulkan",
          icon: Database,
          title: "2. Data yang Kami Kumpulkan",
          content: (
            <>
              <P>Kami mengumpulkan beberapa jenis data untuk memberikan layanan yang optimal:</P>
              <UL>
                <LI><strong>Data yang Anda berikan langsung:</strong> nama, email, nomor telepon, pesan kontak, dan informasi lain yang Anda isi di formulir.</LI>
                <LI><strong>Data donasi:</strong> nama donatur, jumlah donasi, dan metode pembayaran (nomor rekening tidak disimpan di sistem kami).</LI>
                <LI><strong>Data kunjungan:</strong> alamat IP, jenis browser, sistem operasi, halaman yang dikunjungi, durasi kunjungan, dan referrer.</LI>
                <LI><strong>Data teknis:</strong> cookie, local storage, dan data analitik untuk meningkatkan pengalaman pengguna.</LI>
              </UL>
              <Alert>
                Kami <strong>TIDAK</strong> menyimpan data sensitif seperti password bank, PIN, atau CVV kartu kredit. Semua transaksi donasi diproses melalui pihak ketiga terpercaya (bank/e-wallet) dan tidak melalui server kami.
              </Alert>
            </>
          ),
        },
        {
          id: "penggunaan-data",
          icon: Eye,
          title: "3. Bagaimana Kami Menggunakan Data",
          content: (
            <>
              <P>Data yang kami kumpulkan digunakan untuk tujuan berikut:</P>
              <UL>
                <LI>Memproses dan memverifikasi donasi yang Anda berikan</LI>
                <LI>Mengirimkan konfirmasi donasi dan laporan penggunaan dana</LI>
                <LI>Menanggapi pertanyaan, masukan, atau permintaan Anda via formulir kontak</LI>
                <LI>Meningkatkan konten, fitur, dan pengalaman pengguna di website</LI>
                <LI>Menganalisis tren kunjungan untuk keperluan internal dan transparansi</LI>
                <LI>Mengirimkan newsletter atau update kampanye (hanya jika Anda berlangganan)</LI>
              </UL>
              <P>
                Kami <strong>TIDAK akan menjual, menyewakan, atau memperdagangkan</strong> data pribadi Anda kepada pihak ketiga untuk tujuan komersial.
              </P>
            </>
          ),
        },
        {
          id: "dasar-hukum",
          icon: Scale,
          title: "4. Dasar Hukum Pemrosesan",
          content: (
            <>
              <P>Pemrosesan data pribadi Anda didasarkan pada:</P>
              <UL>
                <LI><strong>Persetujuan Anda</strong> — saat mengisi formulir atau melakukan donasi</LI>
                <LI><strong>Kewajiban kontraktual</strong> — untuk memenuhi permintaan donasi atau layanan</LI>
                <LI><strong>Kepentingan sah</strong> — untuk meningkatkan layanan dan keamanan website</LI>
                <LI><strong>Kepentingan publik</strong> — transparansi keuangan organisasi sesuai UU PDP</LI>
              </UL>
            </>
          ),
        },
        {
          id: "berbagi-data",
          icon: Globe,
          title: "5. Berbagi Data dengan Pihak Ketiga",
          content: (
            <>
              <P>Kami dapat membagikan data Anda dalam kondisi terbatas berikut:</P>
              <UL>
                <LI><strong>Penyedia layanan tepercaya:</strong> Firebase (Google Cloud), Cloudinary (hosting gambar), Vercel (hosting website) — semuanya memiliki kebijakan privasi sendiri.</LI>
                <LI><strong>Bank dan payment gateway:</strong> untuk memproses donasi (kami hanya meneruskan info minimal yang diperlukan).</LI>
                <LI><strong>Otoritas hukum:</strong> jika diwajibkan oleh hukum, putusan pengadilan, atau permintaan resmi dari lembaga penegak hukum.</LI>
              </UL>
              <P>
                Kami tidak membagikan data Anda kepada pengiklan atau jaringan periklanan pihak ketiga.
              </P>
            </>
          ),
        },
        {
          id: "cookie",
          icon: Cookie,
          title: "6. Cookie & Teknologi Pelacakan",
          content: (
            <>
              <P>Website kami menggunakan cookie dan teknologi serupa untuk:</P>
              <UL>
                <LI><strong>Cookie esensial:</strong> menyimpan preferensi (seperti tema gelap/terang) — tidak dapat dimatikan</LI>
                <LI><strong>Cookie analitik:</strong> memahami bagaimana pengunjung berinteraksi dengan website</LI>
                <LI><strong>Local storage:</strong> menyimpan keranjang belanja, sesi admin, dan preferensi UI</LI>
              </UL>
              <P>
                Anda dapat mengatur browser untuk menolak cookie, namun beberapa fitur website mungkin tidak berfungsi optimal.
              </P>
            </>
          ),
        },
        {
          id: "keamanan-data",
          icon: Lock,
          title: "7. Keamanan Data",
          content: (
            <>
              <P>Kami menerapkan langkah teknis dan organisatoris untuk melindungi data Anda:</P>
              <UL>
                <LI>Enkripsi HTTPS (TLS 1.3) untuk semua transmisi data</LI>
                <LI>Firestore Database dengan aturan keamanan ketat (security rules)</LI>
                <LI>Firebase Authentication untuk akses admin dengan verifikasi server-side</LI>
                <LI>Pembatasan akses berbasis peran (super_admin, admin, editor)</LI>
                <LI>Audit log untuk aktivitas admin</LI>
                <LI>Backup data berkala oleh Google Cloud</LI>
              </UL>
              <Alert>
                Meskipun demikian, tidak ada sistem yang 100% aman. Jika terjadi pelanggaran data yang signifikan, kami akan memberitahu Anda dan otoritas terkait sesuai ketentuan UU PDP dalam waktu maksimal 3x24 jam.
              </Alert>
            </>
          ),
        },
        {
          id: "penyimpanan-data",
          icon: Database,
          title: "8. Penyimpanan & Penghapusan Data",
          content: (
            <>
              <P>
                Data pribadi disimpan selama diperlukan untuk tujuan yang dijelaskan dalam kebijakan ini, atau sesuai yang diwajibkan oleh hukum.
              </P>
              <UL>
                <LI><strong>Data donasi:</strong> disimpan 5 tahun untuk keperluan audit dan transparansi</LI>
                <LI><strong>Data kontak:</strong> disimpan hingga 2 tahun setelah interaksi terakhir</LI>
                <LI><strong>Data kunjungan:</strong> diagregasi dan disimpan tanpa batas (tanpa identitas pribadi)</LI>
                <LI><strong>Akun admin:</strong> dihapus saat akun dicabut atau organisasi dibubarkan</LI>
              </UL>
            </>
          ),
        },
        {
          id: "hak-anda",
          icon: UserCheck,
          title: "9. Hak Anda atas Data Pribadi",
          content: (
            <>
              <P>Sesuai UU PDP, Anda memiliki hak berikut:</P>
              <UL>
                <LI><strong>Hak akses</strong> — meminta salinan data pribadi yang kami simpan</LI>
                <LI><strong>Hak koreksi</strong> — memperbaiki data yang tidak akurat</LI>
                <LI><strong>Hak penghapusan</strong> — meminta data Anda dihapus ("right to be forgotten")</LI>
                <LI><strong>Hak pembatasan</strong> — membatasi pemrosesan data dalam kondisi tertentu</LI>
                <LI><strong>Hak portabilitas</strong> — menerima data dalam format terstruktur</LI>
                <LI><strong>Hak keberatan</strong> — menolak pemrosesan untuk tujuan marketing</LI>
              </UL>
              <P>
                Untuk menggunakan hak ini, hubungi kami di <a href="mailto:halo@belarakyat.org" className="text-primary font-semibold hover:underline">halo@belarakyat.org</a>. Kami akan merespons dalam waktu maksimal 14 hari kerja.
              </P>
            </>
          ),
        },
        {
          id: "privasi-anak",
          icon: UserCheck,
          title: "10. Privasi Anak",
          content: (
            <>
              <P>
                Website kami tidak ditujukan untuk anak di bawah usia 13 tahun. Kami tidak secara sengaja mengumpulkan data pribadi dari anak-anak. Jika Anda adalah orang tua/wali dan mengetahui bahwa anak Anda telah memberikan data kepada kami, silakan hubungi kami untuk penghapusan data tersebut.
              </P>
            </>
          ),
        },
        {
          id: "perubahan",
          icon: FileText,
          title: "11. Perubahan Kebijakan",
          content: (
            <>
              <P>
                Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu untuk mencerminkan perubahan praktik atau peraturan yang berlaku. Versi terbaru akan selalu tersedia di halaman ini dengan tanggal pembaruan.
              </P>
              <P>
                Untuk perubahan signifikan, kami akan memberitahu Anda melalui banner di website atau email (jika Anda berlangganan newsletter).
              </P>
            </>
          ),
        },
        {
          id: "kontak",
          icon: Mail,
          title: "12. Hubungi Kami",
          content: (
            <>
              <P>
                Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait kebijakan privasi ini, silakan hubungi:
              </P>
              <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-heading font-bold">Petisi Bela Rakyat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href="mailto:halo@belarakyat.org" className="text-primary hover:underline">halo@belarakyat.org</a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>belarakyat.org</span>
                  </div>
                </div>
              </Card>
            </>
          ),
        },
      ]}
    />
  );
}

// ============================================================
// Terms & Conditions Page
// ============================================================
export function TermsPage() {
  return (
    <LegalLayout
      badge="Syarat & Ketentuan"
      title="Syarat & Ketentuan"
      subtitle="Dengan mengakses dan menggunakan website Petisi Bela Rakyat, Anda menyetujui syarat dan ketentuan berikut. Mohon baca dengan seksama sebelum menggunakan layanan kami."
      lastUpdated="10 Juli 2026"
      sections={[
        {
          id: "penerimaan",
          icon: CheckCircle2,
          title: "1. Penerimaan Syarat",
          content: (
            <>
              <P>
                Dengan mengakses, menjelajahi, atau menggunakan website <strong>belarakyat.org</strong>, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh syarat dan ketentuan ini serta kebijakan privasi yang berlaku.
              </P>
              <P>
                Jika Anda tidak menyetujui salah satu bagian dari syarat ini, mohon untuk tidak menggunakan website kami.
              </P>
            </>
          ),
        },
        {
          id: "definisi",
          icon: FileText,
          title: "2. Definisi",
          content: (
            <>
              <UL>
                <LI><strong>"Organisasi"</strong> merujuk pada Petisi Bela Rakyat (PBR)</LI>
                <LI><strong>"Website"</strong> merujuk pada belarakyat.org dan semua subdomainnya</LI>
                <LI><strong>"Pengguna"</strong> merujuk pada setiap orang yang mengakses website</LI>
                <LI><strong>"Konten"</strong> merujuk pada semua artikel, gambar, video, dan materi di website</LI>
                <LI><strong>"Donasi"</strong> merujuk pada kontribusi dana sukarela kepada organisasi</LI>
              </UL>
            </>
          ),
        },
        {
          id: "penggunaan-layanan",
          icon: Eye,
          title: "3. Penggunaan Layanan",
          content: (
            <>
              <P>Dengan menggunakan website ini, Anda setuju untuk:</P>
              <UL>
                <LI>Memberikan informasi yang akurat dan benar saat mengisi formulir</LI>
                <LI>Tidak menggunakan website untuk tujuan ilegal atau melanggar hukum</LI>
                <LI>Tidak mencoba mengakses area terlarang (seperti panel admin) tanpa otorisasi</LI>
                <LI>Tidak melakukan upaya peretasan, DDoS, atau aktivitas malicious</LI>
                <LI>Tidak menyalahgunakan, spam, atau mengganggu pengguna lain</LI>
                <LI>Tidak menyebarluaskan konten yang melanggar hak cipta atau SARA</LI>
              </UL>
              <Alert>
                Pelanggaran terhadap syarat ini dapat berakibat pada pemblokiran akses Anda dan/atau tindakan hukum sesuai peraturan yang berlaku.
              </Alert>
            </>
          ),
        },
        {
          id: "kekayaan-intelektual",
          icon: Scale,
          title: "4. Kekayaan Intelektual",
          content: (
            <>
              <P>
                Semua konten di website ini — termasuk namun tidak terbatas pada teks, grafik, logo, gambar, video, audio, dan kode — adalah milik Petisi Bela Rakyat atau pemberi lisensi, dan dilindungi oleh <strong>Undang-Undang Hak Cipta Nomor 28 Tahun 2014</strong>.
              </P>
              <P>Anda diizinkan untuk:</P>
              <UL>
                <LI>Mengakses dan membaca konten untuk keperluan pribadi atau non-komersial</LI>
                <LI>Membagikan link artikel ke media sosial dengan mencantumkan sumber</LI>
                <LI>Mengutip sebagian konten dengan menyebutkan sumber (belarakyat.org)</LI>
              </UL>
              <P>Anda TIDAK diizinkan untuk:</P>
              <UL>
                <LI>Menyalin, memodifikasi, atau mendistribusikan konten tanpa izin tertulis</LI>
                <LI>Menggunakan konten untuk tujuan komersial tanpa persetujuan</LI>
                <LI>Menghapus pemberitahuan hak cipta atau atribusi</LI>
                <LI>Menggunakan logo atau brand PBR tanpa izin resmi</LI>
              </UL>
            </>
          ),
        },
        {
          id: "donasi",
          icon: UserCheck,
          title: "5. Ketentuan Donasi",
          content: (
            <>
              <P>Saat melakukan donasi melalui website kami, Anda menyetujui bahwa:</P>
              <UL>
                <LI>Donasi bersifat <strong>sukarela dan non-refundable</strong> kecuali dalam kasus kesalahan teknis terbukti</LI>
                <LI>Dana yang diterima akan digunakan sesuai tujuan yang tertera pada proposal terkait</LI>
                <LI>Anda tidak memiliki hak klaim atas penggunaan dana lebih lanjut</LI>
                <LI>Laporan penggunaan dana akan dipublikasikan di halaman Transparansi</LI>
                <LI>Donasi atas nama pihak ketiga hanya boleh dengan persetujuan pihak tersebut</LI>
              </UL>
              <P>
                Untuk donasi besar (di atas Rp 10.000.000), hubungi kami terlebih dahulu untuk mendapatkan konfirmasi resmi dan tanda terima.
              </P>
            </>
          ),
        },
        {
          id: "konten-pengguna",
          icon: FileText,
          title: "6. Konten Pengguna",
          content: (
            <>
              <P>
                Jika Anda mengirimkan konten melalui formulir kontak, komentar, atau channel lain (mis. pesan WhatsApp), Anda memberikan organisasi hak non-eksklusif untuk:
              </P>
              <UL>
                <LI>Menyimpan dan memproses konten tersebut</LI>
                <LI>Menampilkan konten (jika relevan) di website atau publikasi resmi</LI>
                <LI>Menghapus konten yang dianggap melanggar tanpa pemberitahuan</LI>
              </UL>
              <P>
                Anda bertanggung jawab atas konten yang Anda kirimkan dan menjamin tidak melanggar hak pihak ketiga.
              </P>
            </>
          ),
        },
        {
          id: "batasan-tanggung-jawab",
          icon: AlertTriangle,
          title: "7. Batasan Tanggung Jawab",
          content: (
            <>
              <P>
                Website disediakan "sebagaimana adanya" tanpa jaminan apa pun. Organisasi tidak bertanggung jawab atas:
              </P>
              <UL>
                <LI>Kerugian tidak langsung atau insidental akibat penggunaan website</LI>
                <LI>Gangguan akses sementara karena maintenance atau kegagalan server</LI>
                <LI>Ketidakakuratan informasi dari pihak ketiga yang ditampilkan di website</LI>
                <LI>Tindakan penipuan yang mengatasnamakan organisasi tanpa otorisasi</LI>
                <LI>Kehilangan data akibat kegagalan teknis di luar kendali kami</LI>
              </UL>
              <Alert>
                Organisasi berkomitmen untuk transparansi dan akuntabilitas. Untuk klaim kerugian langsung akibat kelalaian kami, pertanggungjawaban dibatasi maksimal sebesar donasi yang pernah Anda berikan dalam 12 bulan terakhir.
              </Alert>
            </>
          ),
        },
        {
          id: "link-eksternal",
          icon: Globe,
          title: "8. Link Eksternal",
          content: (
            <>
              <P>
                Website kami mungkin berisi link ke website pihak ketiga (mis. media sosial, portal berita, payment gateway). Kami tidak bertanggung jawab atas konten atau kebijakan privasi website tersebut. Pengguna disarankan membaca ketentuan masing-masing website.
              </P>
            </>
          ),
        },
        {
          id: "perubahan-layanan",
          icon: FileText,
          title: "9. Perubahan Layanan & Syarat",
          content: (
            <>
              <P>
                Organisasi berhak mengubah, menangguhkan, atau menghentikan layanan kapan saja tanpa pemberitahuan sebelumnya. Syarat dan ketentuan ini juga dapat diperbarui secara berkala.
              </P>
              <P>
                Perubahan berlaku efektif sejak dipublikasikan di halaman ini. Penggunaan website setelah perubahan dianggap sebagai persetujuan Anda terhadap syarat yang baru.
              </P>
            </>
          ),
        },
        {
          id: "hukum-berlaku",
          icon: Scale,
          title: "10. Hukum yang Berlaku",
          content: (
            <>
              <P>
                Syarat dan ketentuan ini diatur oleh hukum <strong>Republik Indonesia</strong>. Setiap sengketa yang timbul akan diselesaikan terlebih dahulu melalui musyawarah. Jika tidak tercapai, sengketa akan diajukan ke <strong>Pengadilan Negeri Jakarta Selatan</strong>.
              </P>
            </>
          ),
        },
        {
          id: "kontak",
          icon: Mail,
          title: "11. Hubungi Kami",
          content: (
            <>
              <P>
                Untuk pertanyaan terkait syarat dan ketentuan ini, silakan hubungi:
              </P>
              <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-heading font-bold">Petisi Bela Rakyat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href="mailto:halo@belarakyat.org" className="text-primary hover:underline">halo@belarakyat.org</a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>belarakyat.org</span>
                  </div>
                </div>
              </Card>
            </>
          ),
        },
      ]}
    />
  );
}
