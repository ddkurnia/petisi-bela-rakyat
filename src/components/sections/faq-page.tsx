"use client";

import { HelpCircle, Mail, MessageCircle, PenLine, HeartHandshake, FileText, Shield } from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const faqData = [
  {
    category: "Tentang Organisasi",
    items: [
      { q: "Apa itu Petisi Bela Rakyat?", a: "Petisi Bela Rakyat (PBR) adalah gerakan masyarakat sipil independen yang memperjuangkan kepentingan rakyat melalui advokasi, partisipasi publik, dan aksi nyata. Kami berdiri sejak 2016 dan berkomitmen membela hak-hak rakyat tanpa kompromi." },
      { q: "Siapa yang mendanai PBR?", a: "PBR didanai oleh donasi sukarela dari masyarakat, individu, dan organisasi yang mendukung perjuangan kami. Kami berkomitmen pada transparansi penuh — semua laporan keuangan dapat diakses di halaman Transparansi." },
      { q: "Bagaimana cara bergabung sebagai relawan?", a: "Anda bisa bergabung sebagai relawan dengan mengisi formulir di halaman Relawan atau menghubungi kami via WhatsApp. Kami selalu membutuhkan relawan untuk berbagai bidang: advokasi, media sosial, dokumentasi, dan kegiatan lapangan." },
      { q: "Apakah PBR berafiliasi dengan partai politik?", a: "Tidak. PBR adalah organisasi independen yang tidak berafiliasi dengan partai politik mana pun. Kami berjuang untuk kepentingan rakyat, bukan kepentingan politik." },
    ],
  },
  {
    category: "Donasi & Keuangan",
    items: [
      { q: "Bagaimana cara berdonasi?", a: "Anda bisa berdonasi via transfer bank atau QRIS. Buka halaman Proposal untuk melihat rekening bank dan QRIS yang tersedia. Setiap donasi akan digunakan sesuai dengan proposal kegiatan yang dipilih." },
      { q: "Apakah donasi saya bisa dipotong pajak?", a: "Saat ini PBR belum memiliki status pajak (tax-deductible). Namun, kami sedang dalam proses pengurusan legalitas untuk memungkinkan hal ini di masa depan." },
      { q: "Berapa donasi minimum?", a: "Tidak ada donasi minimum. Setiap kontribusi, berapapun nilainya, sangat berarti bagi kami. Donasi mulai dari Rp 10.000 sudah sangat membantu." },
      { q: "Apakah donasi saya akan dilaporkan?", a: "Ya. Semua donasi dicatat dan dilaporkan di halaman Transparansi. Anda juga bisa meminta laporan penggunaan dana kapan saja dengan menghubungi kami." },
      { q: "Apakah saya bisa membatalkan donasi?", a: "Donasi bersifat sukarela dan non-refundable kecuali dalam kasus kesalahan teknis yang terbukti. Hubungi kami dalam 24 jam jika terjadi kesalahan transfer." },
    ],
  },
  {
    category: "Petisi & Tanda Tangan",
    items: [
      { q: "Apa itu petisi dan mengapa penting?", a: "Petisi adalah cara untuk menyuarakan tuntutan rakyat kepada pihak berwenang. Setiap tanda tangan memperkuat posisi tawar rakyat dalam negosiasi. Semakin banyak tanda tangan, semakin kuat suara kita." },
      { q: "Apakah data saya aman saat menandatangani petisi?", a: "Ya. Data Anda dilindungi sesuai Kebijakan Privasi kami. Email Anda akan di-mask (j***@gmail.com) saat ditampilkan di daftar tanda tangan. Alamat lengkap tidak ditampilkan secara publik." },
      { q: "Mengapa saya hanya bisa menandatangani sekali per kampanye?", a: "Untuk mencegah spam dan menjaga integritas petisi, satu perangkat (device) dan satu email hanya bisa menandatangani satu kampanye satu kali. Ini memastikan setiap tanda tangan adalah unik dan kredibel." },
      { q: "Apa yang terjadi setelah saya menandatangani petisi?", a: "Kami akan mengumpulkan tanda tangan dan menyampaikannya kepada pihak berwenang yang berwenang. Kami juga akan mengupdate Anda tentang progress kampanye melalui email (jika Anda berlangganan newsletter)." },
      { q: "Bisakah saya membuat kampanye sendiri?", a: "Saat ini kampanye dibuat oleh tim PBR berdasarkan aspirasi masyarakat. Namun, Anda bisa mengusulkan kampanye baru dengan menghubungi kami via formulir kontak atau WhatsApp." },
    ],
  },
  {
    category: "Konten & Artikel",
    items: [
      { q: "Bisakah saya berkontribusi menulis artikel?", a: "Tentu! Kami menerima kontribusi artikel dari relawan dan penulis eksternal yang sesuai dengan visi PBR. Hubungi kami via formulir kontak dengan subjek 'Kontribusi Artikel'." },
      { q: "Apakah artikel PBR bisa di-share?", a: "Ya, Anda dipersilakan membagikan artikel PBR ke media sosial dengan mencantumkan sumber (belarakyat.org). Namun, penggunaan komersial tanpa izin tidak diperbolehkan." },
      { q: "Bagaimana cara melaporkan kesalahan dalam artikel?", a: "Jika Anda menemukan kesalahan faktual dalam artikel kami, silakan hubungi halo@belarakyat.org dengan menyebutkan artikel dan kesalahan yang dimaksud. Kami akan segera memperbaikinya." },
    ],
  },
  {
    category: "Privasi & Keamanan",
    items: [
      { q: "Apakah website PBR menggunakan cookie?", a: "Ya, kami menggunakan cookie esensial untuk menjalankan website (seperti preferensi tema) dan cookie analitik untuk memahami trafik. Anda bisa mengatur cookie melalui browser Anda." },
      { q: "Bagaimana PBR melindungi data pribadi saya?", a: "Kami memproses data pribadi sesuai UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi. Data disimpan dengan enkripsi HTTPS, diakses hanya oleh admin yang berwenang, dan tidak dibagikan ke pihak ketiga untuk tujuan komersial." },
      { q: "Apakah saya bisa menghapus data saya?", a: "Ya. Anda berhak meminta penghapusan data pribadi Anda ('right to be forgotten'). Hubungi halo@belarakyat.org untuk permintaan penghapusan data." },
    ],
  },
];

export function FaqPage() {
  return (
    <div className="pt-24 md:pt-32 pb-20">
      {/* Hero */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-foreground/5" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />

        <div className="container-x relative max-w-3xl">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm font-semibold mb-5">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </div>
            <h1 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Pertanyaan yang Sering Diajukan
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              Temukan jawaban atas pertanyaan umum tentang Petisi Bela Rakyat, donasi, petisi, dan cara berkontribusi.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-8 md:py-12">
        <div className="container-x max-w-3xl">
          {faqData.map((section, si) => (
            <Reveal key={si} delay={si * 0.1}>
              <div className="mb-8">
                <h2 className="font-heading text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="h-1 w-6 bg-primary rounded-full" />
                  {section.category}
                </h2>
                <Card className="border-0 shadow-lg overflow-hidden">
                  <Accordion type="single" collapsible>
                    {section.items.map((item, ii) => (
                      <AccordionItem key={ii} value={`s${si}-i${ii}`} className="border-b border-border last:border-0">
                        <AccordionTrigger className="px-5 py-4 text-sm md:text-base font-semibold text-left hover:no-underline">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Card>
              </div>
            </Reveal>
          ))}

          {/* Contact CTA */}
          <Reveal delay={0.3}>
            <Card className="p-6 md:p-8 border-0 shadow-xl bg-gradient-to-br from-primary/5 to-transparent text-center mt-8">
              <h3 className="font-heading text-xl font-bold mb-2">Masih Ada Pertanyaan?</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                Tim kami siap membantu. Hubungi kami melalui WhatsApp atau email.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/kontak">
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-full w-full sm:w-auto">
                    <Mail className="h-4 w-4 mr-2" />
                    Hubungi Kami
                  </Button>
                </Link>
                <Link href="/kampanye">
                  <Button variant="outline" className="rounded-full w-full sm:w-auto">
                    <PenLine className="h-4 w-4 mr-2" />
                    Lihat Kampanye
                  </Button>
                </Link>
              </div>
            </Card>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
