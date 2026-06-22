"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

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
  | "admin";

export interface NavState {
  route: PublicRoute;
  // about sub-section
  aboutSection?: "sejarah" | "visi-misi" | "struktur" | "pengurus" | "penasehat" | "relawan";
  // sub-route params
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

export function NavProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NavState>({ route: "home" });

  const navigate = useCallback(
    (route: PublicRoute, params?: Partial<Omit<NavState, "route">>) => {
      setState({ route, ...params });
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    []
  );

  // Sync with hash for shareable URLs (best-effort)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#\/?/, "");
    if (!hash) return;
    const parts = hash.split("/");
    const valid: PublicRoute[] = ["home","about","struktur","pengurus","penasehat","relawan","work","campaigns","news","blog","media","transparency","contact","admin"];
    if (valid.includes(parts[0] as PublicRoute)) {
      const route = parts[0] as PublicRoute;
      const extra: Partial<NavState> = {};
      if (parts[1] === "sejarah" || parts[1] === "visi-misi" || parts[1] === "struktur" || parts[1] === "pengurus" || parts[1] === "penasehat" || parts[1] === "relawan") {
        if (route === "about") extra.aboutSection = parts[1];
      }
      if (parts[1] && route === "pengurus") extra.pengurusSlug = parts[1];
      if (parts[1] && route === "blog") extra.blogSlug = parts[1];
      if (parts[1] && route === "news") extra.newsSlug = parts[1];
      if (parts[1] && route === "campaigns") extra.campaignSlug = parts[1];
      if (parts[1] && route === "work") extra.workSlug = parts[1];
      const id = requestAnimationFrame(() => setState({ route, ...extra }));
      return () => cancelAnimationFrame(id);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let hash = `#/${state.route}`;
    if (state.route === "about" && state.aboutSection) hash = `#/about/${state.aboutSection}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }, [state.route, state.aboutSection]);

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
