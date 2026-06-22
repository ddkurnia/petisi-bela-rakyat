"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

export type PublicRoute =
  | "home"
  | "about"
  | "struktur"
  | "pengurus"
  | "penasehat"
  | "relawan"
  | "work"
  | "campaigns"
  | "news"
  | "blog"
  | "media"
  | "transparency"
  | "contact"
  | "admin"
  | "app";

export interface NavState {
  route: PublicRoute;
  aboutSection?: "sejarah" | "visi-misi" | "struktur" | "pengurus" | "penasehat" | "relawan";
  pengurusSlug?: string;
  teamSlug?: string;
  blogSlug?: string;
  newsSlug?: string;
  campaignSlug?: string;
  workSlug?: string;
}

interface NavContextValue extends NavState {
  navigate: (route: PublicRoute, params?: Partial<Omit<NavState, "route">>) => void;
}

const NavContext = createContext<NavContextValue | null>(null);

// ============ URL <-> STATE MAPPING ============
const routeToPath: Record<PublicRoute, string> = {
  home: "/",
  about: "/tentang-kami",
  struktur: "/struktur-organisasi",
  pengurus: "/pengurus",
  penasehat: "/dewan-penasehat",
  relawan: "/relawan",
  work: "/kerja-kami",
  campaigns: "/kampanye",
  news: "/news",
  blog: "/blog",
  media: "/galeri",
  transparency: "/transparansi",
  contact: "/kontak",
  admin: "/admin",
  app: "/aplikasi",
};

// Convert NavState to URL path
function stateToUrl(state: NavState): string {
  if (state.pengurusSlug) return `/pengurus/${state.pengurusSlug}`;
  if (state.blogSlug) return `/blog/${state.blogSlug}`;
  if (state.newsSlug) return `/news/${state.newsSlug}`;
  if (state.campaignSlug) return `/kampanye/${state.campaignSlug}`;
  if (state.workSlug) return `/kerja-kami/${state.workSlug}`;

  if (state.route === "about") {
    if (state.aboutSection === "sejarah") return "/sejarah";
    if (state.aboutSection === "visi-misi") return "/visi-misi";
    if (state.aboutSection === "struktur") return "/struktur-organisasi";
    if (state.aboutSection === "pengurus") return "/pengurus";
    if (state.aboutSection === "penasehat") return "/dewan-penasehat";
    if (state.aboutSection === "relawan") return "/relawan";
    return "/tentang-kami";
  }

  return routeToPath[state.route] || "/";
}

// Parse current pathname into NavState
function parsePathname(pathname: string): NavState {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return { route: "home" };

  if (segments.length === 1) {
    const seg = segments[0];
    if (seg === "sejarah") return { route: "about", aboutSection: "sejarah" };
    if (seg === "visi-misi") return { route: "about", aboutSection: "visi-misi" };
    if (seg === "struktur-organisasi") return { route: "about", aboutSection: "struktur" };
    if (seg === "tentang-kami") return { route: "about", aboutSection: "sejarah" };
    if (seg === "pengurus") return { route: "about", aboutSection: "pengurus" };
    if (seg === "dewan-penasehat") return { route: "about", aboutSection: "penasehat" };
    if (seg === "relawan") return { route: "about", aboutSection: "relawan" };
    if (seg === "kerja-kami") return { route: "work" };
    if (seg === "kampanye") return { route: "campaigns" };
    if (seg === "news") return { route: "news" };
    if (seg === "blog") return { route: "blog" };
    if (seg === "galeri") return { route: "media" };
    if (seg === "transparansi") return { route: "transparency" };
    if (seg === "kontak") return { route: "contact" };
    if (seg === "admin") return { route: "admin" };
    if (seg === "aplikasi") return { route: "app" };
  }

  if (segments.length === 2) {
    const [base, slug] = segments;
    if (base === "pengurus") return { route: "about", aboutSection: "pengurus", pengurusSlug: slug };
    if (base === "blog") return { route: "blog", blogSlug: slug };
    if (base === "news") return { route: "news", newsSlug: slug };
    if (base === "kampanye") return { route: "campaigns", campaignSlug: slug };
    if (base === "kerja-kami") return { route: "work", workSlug: slug };
  }

  return { route: "home" };
}

export function NavProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const state = parsePathname(pathname);

  const navigate = useCallback(
    (route: PublicRoute, params?: Partial<Omit<NavState, "route">>) => {
      const newState = { route, ...params };
      const url = stateToUrl(newState);
      // Use Next.js router for real URL routing
      // This enables: Android back button, deep links, SEO, share-friendly URLs
      router.push(url);
      // Scroll to top on navigation
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [router]
  );

  return (
    <NavContext.Provider value={{ ...state, navigate }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used inside NavProvider");
  return ctx;
}
