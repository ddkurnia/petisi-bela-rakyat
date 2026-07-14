"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, PenLine, Sun, Moon, ChevronDown, Users, Building2, Crown, Heart, History, Target, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "./language-switcher";
import { GlobalSearch } from "./global-search";
import { useLang } from "@/lib/i18n/context";
import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const mainMenu: { key: string; href: string }[] = [
  { key: "nav.home", href: "/" },
  { key: "nav.ourWork", href: "/kerja-kami" },
  { key: "nav.campaigns", href: "/kampanye" },
  { key: "nav.news", href: "/news" },
  { key: "nav.blog", href: "/blog" },
  { key: "nav.proposal", href: "/proposal" },
  { key: "nav.gallery", href: "/galeri" },
  { key: "nav.transparency", href: "/transparansi" },
  { key: "nav.contact", href: "/kontak" },
  { key: "nav.faq", href: "/faq" },
];

const aboutSubmenu = [
  { key: "nav.ourStory", href: "/sejarah", icon: History },
  { key: "nav.visionMission", href: "/visi-misi", icon: Target },
  { key: "nav.teamStructure", href: "/struktur-organisasi", icon: Building2 },
  { key: "nav.ourTeam", href: "/pengurus", icon: Users },
  { key: "nav.advisors", href: "/dewan-penasehat", icon: Crown },
  { key: "nav.volunteers", href: "/relawan", icon: Heart },
];

function isPathActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function isAboutActive(pathname: string): boolean {
  return ["/tentang-kami", "/sejarah", "/visi-misi", "/struktur-organisasi", "/pengurus", "/dewan-penasehat", "/relawan"].some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const id = requestAnimationFrame(() => setMobileOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || pathname !== "/" ? "glass border-b border-border/60 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container-x flex items-center justify-between h-16 md:h-18 gap-2">
        <Link href="/" className="flex items-center min-w-0 shrink" aria-label="Petisi Bela Rakyat Home">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden xl:flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${
                  isAboutActive(pathname)
                    ? "text-primary bg-primary/10"
                    : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {t('nav.aboutUs')}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('nav.aboutUs')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {aboutSubmenu.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="cursor-pointer p-2 flex items-center">
                      <Icon className="h-4 w-4 text-primary mr-2" />
                      <span>{t(item.key)}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {mainMenu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                isPathActive(pathname, item.href)
                  ? "text-primary bg-primary/10"
                  : "text-foreground/80 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <LanguageSwitcher compact />

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-9 w-9"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <Link href="/kampanye">
            <Button className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 rounded-full">
              <PenLine className="h-4 w-4 mr-1.5" />
              {t('home.signPetition')}
            </Button>
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden rounded-full h-9 w-9"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0">
              <div className="flex flex-col h-full">
                {/* Header with logo + close */}
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <Logo />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                  {/* Home */}
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      pathname === "/"
                        ? "bg-primary text-white"
                        : "hover:bg-primary/10 text-foreground"
                    }`}
                  >
                    {t('nav.home')}
                  </Link>

                  {/* About section */}
                  <div className="pt-2">
                    <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t('nav.aboutUs')}
                    </div>
                    {aboutSubmenu.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2.5 ${
                            isPathActive(pathname, item.href)
                              ? "bg-primary/10 text-primary font-semibold"
                              : "hover:bg-secondary text-foreground/80"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {t(item.key)}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div className="my-2 border-t border-border" />

                  {/* Main menu */}
                  {mainMenu.filter((item) => item.href !== "/").map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isPathActive(pathname, item.href)
                          ? "bg-primary text-white"
                          : "hover:bg-primary/10 text-foreground"
                      }`}
                    >
                      {t(item.key)}
                    </Link>
                  ))}
                </nav>

                {/* Bottom: Search + Sign petition */}
                <div className="p-4 border-t border-border space-y-3">
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {t('common.search')}
                  </Button>
                  <Link href="/kampanye" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full">
                      <PenLine className="h-4 w-4 mr-2" />
                      {t('home.signPetition')}
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
