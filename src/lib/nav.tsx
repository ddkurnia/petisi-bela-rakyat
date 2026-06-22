"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

type LegacyRoute =
  | "home" | "about" | "struktur" | "pengurus" | "penasehat" | "relawan"
  | "work" | "campaigns" | "news" | "blog" | "media" | "transparency"
  | "contact" | "admin";

interface LegacyNavParams {
  aboutSection?: "sejarah" | "visi-misi" | "struktur" | "pengurus" | "penasehat" | "relawan";
  pengurusSlug?: string;
  teamSlug?: string;
  blogSlug?: string;
  newsSlug?: string;
  campaignSlug?: string;
  workSlug?: string;
}

const routeMap: Record<LegacyRoute, string> = {
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
};

const aboutSectionMap: Record<string, string> = {
  sejarah: "/sejarah",
  "visi-misi": "/visi-misi",
  struktur: "/struktur-organisasi",
  pengurus: "/pengurus",
  penasehat: "/dewan-penasehat",
  relawan: "/relawan",
};

/**
 * Parse current pathname to extract legacy nav state (route, slugs, aboutSection)
 * This allows section components to keep their existing prop-based logic.
 */
function parsePathname(pathname: string) {
  // Strip trailing slash (except root)
  const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const segments = path.split("/").filter(Boolean);

  const result: {
    route: LegacyRoute;
    aboutSection?: string;
    pengurusSlug?: string;
    blogSlug?: string;
    newsSlug?: string;
    campaignSlug?: string;
    workSlug?: string;
  } = { route: "home" };

  if (segments.length === 0) {
    return result;
  }

  const first = segments[0];

  // Map first segment to legacy route
  const reverseMap: Record<string, LegacyRoute> = {
    "tentang-kami": "about",
    sejarah: "about",
    "visi-misi": "about",
    "struktur-organisasi": "struktur",
    pengurus: "pengurus",
    "dewan-penasehat": "penasehat",
    relawan: "relawan",
    "kerja-kami": "work",
    kampanye: "campaigns",
    news: "news",
    blog: "blog",
    galeri: "media",
    transparansi: "transparency",
    kontak: "contact",
    admin: "admin",
  };

  result.route = reverseMap[first] || "home";

  // Extract aboutSection
  if (first === "sejarah") result.aboutSection = "sejarah";
  else if (first === "visi-misi") result.aboutSection = "visi-misi";
  else if (first === "struktur-organisasi") result.aboutSection = "struktur";
  else if (first === "pengurus") result.aboutSection = "pengurus";
  else if (first === "dewan-penasehat") result.aboutSection = "penasehat";
  else if (first === "relawan") result.aboutSection = "relawan";

  // Extract slugs from second segment
  if (segments[1]) {
    if (first === "pengurus") result.pengurusSlug = segments[1];
    if (first === "kerja-kami") result.workSlug = segments[1];
    if (first === "kampanye") result.campaignSlug = segments[1];
    if (first === "news") result.newsSlug = segments[1];
    if (first === "blog") result.blogSlug = segments[1];
  }

  return result;
}

export function useNav() {
  const router = useRouter();
  const pathname = usePathname();
  const parsed = parsePathname(pathname);

  const navigate = useCallback(
    (route: LegacyRoute, params?: LegacyNavParams) => {
      let url = routeMap[route] || "/";

      if (route === "about" && params?.aboutSection) {
        url = aboutSectionMap[params.aboutSection] || "/tentang-kami";
      }

      if (route === "pengurus" && params?.pengurusSlug) {
        url = `/pengurus/${params.pengurusSlug}`;
      }
      if (route === "work" && params?.workSlug) {
        url = `/kerja-kami/${params.workSlug}`;
      }
      if (route === "campaigns" && params?.campaignSlug) {
        url = `/kampanye/${params.campaignSlug}`;
      }
      if (route === "news" && params?.newsSlug) {
        url = `/news/${params.newsSlug}`;
      }
      if (route === "blog" && params?.blogSlug) {
        url = `/blog/${params.blogSlug}`;
      }

      router.push(url);

      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [router]
  );

  return {
    navigate,
    route: parsed.route,
    aboutSection: parsed.aboutSection as LegacyNavParams["aboutSection"],
    pengurusSlug: parsed.pengurusSlug,
    blogSlug: parsed.blogSlug,
    newsSlug: parsed.newsSlug,
    campaignSlug: parsed.campaignSlug,
    workSlug: parsed.workSlug,
  };
}
