"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, PenLine, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { useNav, PublicRoute } from "@/lib/nav";

const menu: { label: string; route: PublicRoute }[] = [
  { label: "Home", route: "home" },
  { label: "Tentang Kami", route: "about" },
  { label: "Kerja Kami", route: "work" },
  { label: "Kampanye", route: "campaigns" },
  { label: "News", route: "news" },
  { label: "Blog", route: "blog" },
  { label: "Media", route: "media" },
  { label: "Transparansi", route: "transparency" },
  { label: "Kontak", route: "contact" },
];

export function Header() {
  const { route, navigate } = useNav();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer to avoid cascading renders per react-hooks/set-state-in-effect rule
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-border/60 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container-x flex items-center justify-between h-16 md:h-18">
        <button
          onClick={() => navigate("home")}
          className="flex items-center"
          aria-label="Petisi Bela Rakyat Home"
        >
          <Logo />
        </button>

        {/* Desktop nav */}
        <nav className="hidden xl:flex items-center gap-1">
          {menu.map((item) => (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                route === item.route
                  ? "text-primary bg-primary/10"
                  : "text-foreground/80 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
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

          <Button
            onClick={() => navigate("campaigns")}
            className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 rounded-full"
          >
            <PenLine className="h-4 w-4 mr-1.5" />
            Tandatangani Petisi
          </Button>

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
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {menu.map((item) => (
                    <button
                      key={item.route}
                      onClick={() => {
                        navigate(item.route);
                        setMobileOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        route === item.route
                          ? "bg-primary text-white"
                          : "hover:bg-primary/10 text-foreground"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
                <div className="p-4 border-t border-border">
                  <Button
                    onClick={() => {
                      navigate("campaigns");
                      setMobileOpen(false);
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-full"
                  >
                    <PenLine className="h-4 w-4 mr-2" />
                    Tandatangani Petisi
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
