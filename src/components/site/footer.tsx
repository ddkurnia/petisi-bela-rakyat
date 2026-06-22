"use client";

import { motion } from "framer-motion";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { useNav, PublicRoute } from "@/lib/nav";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const socialIcon: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
};

const footerMenu: { label: string; route: PublicRoute }[] = [
  { label: "Tentang Kami", route: "about" },
  { label: "Kerja Kami", route: "work" },
  { label: "Kampanye", route: "campaigns" },
  { label: "News", route: "news" },
  { label: "Blog", route: "blog" },
  { label: "Media", route: "media" },
  { label: "Transparansi", route: "transparency" },
  { label: "Kontak", route: "contact" },
];

export function Footer() {
  const { navigate } = useNav();
  const settings = useStore((s) => s.settings);

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
                Bersama membela rakyat, tanpa kompromi.
              </h3>
              <p className="mt-2 text-white/70 text-sm md:text-base">
                Dapatkan kabar terbaru dari setiap kampanye dan peluang untuk berkontribusi.
              </p>
            </motion.div>
            <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white rounded-full"
                onClick={() => navigate("campaigns")}
              >
                Tandatangani Petisi
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 rounded-full bg-transparent"
                onClick={() => navigate("contact")}
              >
                Hubungi Kami
              </Button>
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
              Gerakan masyarakat sipil independen yang memperjuangkan kepentingan rakyat melalui advokasi, partisipasi publik, dan aksi nyata.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {settings.socials.map((s) => {
                const Icon = socialIcon[s.icon] || Twitter;
                return (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-full bg-white/5 hover:bg-primary flex items-center justify-center transition-colors"
                    aria-label={s.name}
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
                <li key={item.route}>
                  <button
                    onClick={() => navigate(item.route)}
                    className="text-white/70 hover:text-primary text-sm transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white/90 mb-4">
              Kontak
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-white/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>{settings.contact.address}</span>
              </li>
              <li className="flex items-center gap-2.5 text-white/70">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>{settings.contact.whatsapp}</span>
              </li>
              <li className="flex items-center gap-2.5 text-white/70">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>{settings.contact.email}</span>
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
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-2"
            >
              <Input
                type="email"
                placeholder="Email Anda"
                className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white rounded-full"
              >
                Berlangganan
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} Petisi Bela Rakyat. Hak cipta dilindungi. Dibangun untuk rakyat, oleh rakyat.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/50">
            <button className="hover:text-primary transition-colors">Kebijakan Privasi</button>
            <span className="opacity-30">•</span>
            <button className="hover:text-primary transition-colors">Syarat & Ketentuan</button>
            <span className="opacity-30">•</span>
            <button
              onClick={() => navigate("admin")}
              className="hover:text-primary transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
