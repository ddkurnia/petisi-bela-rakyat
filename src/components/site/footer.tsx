"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, ArrowRight, Clock, MessageCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/i18n/context";
import { NewsletterForm } from "./newsletter-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const socialIcon: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: Youtube,
};

const footerMenu: { label: string; href: string }[] = [
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Kerja Kami", href: "/kerja-kami" },
  { label: "Kampanye", href: "/kampanye" },
  { label: "News", href: "/news" },
  { label: "Blog", href: "/blog" },
  { label: "Galeri", href: "/galeri" },
  { label: "Transparansi", href: "/transparansi" },
  { label: "Kontak", href: "/kontak" },
];

export function Footer() {
  const settings = useStore((s) => s.settings);
  const { t } = useLang();
  const year = new Date().getFullYear();
  // Defensive — Firestore doc may be partial
  const footer = settings?.footer ?? { description: "", copyrightText: "© 2026 Petisi Bela Rakyat", legalLinks: [] };
  const about = settings?.about ?? { visi: "", misi: [], nilai: [], sejarah: "", sejarahTimeline: [], motto: "" };
  const contact = settings?.contact ?? { address: "", whatsapp: "", email: "", phone: "", mapEmbed: "", mapLink: "", operationHours: "" };
  const socials = settings?.socials ?? [];
  const copyright = (footer.copyrightText || "© 2026 Petisi Bela Rakyat").replace("{year}", String(year));

  return (
    <footer className="mt-auto bg-foreground text-background">
      {/* CTA strip */}
      <div className="border-b border-white/10">
        <div className="container-x py-10 md:py-14">
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-white">
                {about.motto}
              </h3>
              <p className="mt-2 text-white/70 text-sm md:text-base">
                {t("footer.getLatest")}
              </p>
              <div className="mt-4">
                <NewsletterForm />
              </div>
            </motion.div>
            <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
              <Link href="/kampanye">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full w-full sm:w-auto">
                  Tandatangani Petisi
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/kontak">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full bg-transparent w-full sm:w-auto">
                  {t("nav.contact")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="bg-white/5 p-3 rounded-2xl inline-block">
              <Logo />
            </div>
            <p className="mt-5 text-white/70 text-sm leading-relaxed max-w-sm">
              {footer.description}
            </p>
            <div className="mt-5 flex items-center gap-2 flex-wrap">
              {socials.map((s) => {
                const Icon = socialIcon[s.icon] || Twitter;
                return (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-full bg-white/5 hover:bg-primary flex items-center justify-center transition-colors"
                    aria-label={s.name}
                    title={s.handle}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white/90 mb-4">
              Navigasi
            </h4>
            <ul className="space-y-2.5">
              {footerMenu.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/70 hover:text-primary text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white/90 mb-4">
              {t("footer.contact")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-white/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>{contact.address}</span>
              </li>
              <li>
                <a href={`https://wa.me/${(contact.whatsapp || '').replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-white/70 hover:text-primary transition-colors">
                  <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
                  <span>{contact.whatsapp}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 text-white/70 hover:text-primary transition-colors">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <span>{contact.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/70">
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>{contact.operationHours}</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white/90 mb-4">
              Newsletter
            </h4>
            <p className="text-white/70 text-xs mb-3">
              Berlangganan untuk update bulanan.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Email Anda"
                className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
              />
              <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-full">
                Berlangganan
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-xs text-center sm:text-left">
            {copyright}
          </p>
          <div className="flex items-center gap-4 text-xs text-white/50 flex-wrap justify-center">
            {/* Default legal links if admin hasn't set custom ones */}
            {(footer.legalLinks && footer.legalLinks.length > 0 ? footer.legalLinks : [
              { label: t("footer.privacyPolicy"), url: "/kebijakan-privasi" },
              { label: t("footer.terms"), url: "/syarat-ketentuan" },
            ]).map((link, i, arr) => (
              <span key={link.label} className="flex items-center gap-4">
                {link.url?.startsWith('/') ? (
                  <Link href={link.url} className="hover:text-primary transition-colors">{link.label}</Link>
                ) : (
                  <button className="hover:text-primary transition-colors">{link.label}</button>
                )}
                {i < arr.length - 1 && <span className="opacity-30">•</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
