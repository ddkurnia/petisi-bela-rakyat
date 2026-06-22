"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export type PublicRoute =
  | "home"
  | "about"
  | "team"
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
  // sub-route params
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
    const valid: PublicRoute[] = ["home","about","team","work","campaigns","news","blog","media","transparency","contact","admin"];
    if (valid.includes(hash as PublicRoute)) {
      // Defer to avoid cascading renders per react-hooks/set-state-in-effect rule
      const id = requestAnimationFrame(() =>
        setState({ route: hash as PublicRoute })
      );
      return () => cancelAnimationFrame(id);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const newHash = `#/${state.route}`;
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, "", newHash);
    }
  }, [state.route]);

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
