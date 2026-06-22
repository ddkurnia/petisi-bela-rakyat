"use client";

import { NavProvider, useNav } from "@/lib/nav";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { HomePage } from "@/components/sections/home-page";
import { Hero } from "@/components/sections/hero";
import { AboutPage } from "@/components/sections/about-page";
import { TeamPage } from "@/components/sections/team-page";
import { WorkPage } from "@/components/sections/work-page";
import { CampaignsPage } from "@/components/sections/campaigns-page";
import { NewsPage } from "@/components/sections/news-page";
import { BlogPage } from "@/components/sections/blog-page";
import { MediaPage } from "@/components/sections/media-page";
import { TransparencyPage } from "@/components/sections/transparency-page";
import { ContactPage } from "@/components/sections/contact-page";
import { AdminPanel } from "@/components/admin/admin-panel";

function Shell() {
  const { route } = useNav();

  // Admin uses full screen, no header/footer
  if (route === "admin") {
    return <AdminPanel />;
  }

  // Home has a special hero
  if (route === "home") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <Hero />
          <HomePage />
        </main>
        <Footer />
      </div>
    );
  }

  // Other public pages
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {route === "about" && <AboutPage />}
        {route === "team" && <TeamPage />}
        {route === "work" && <WorkPage />}
        {route === "campaigns" && <CampaignsPage />}
        {route === "news" && <NewsPage />}
        {route === "blog" && <BlogPage />}
        {route === "media" && <MediaPage />}
        {route === "transparency" && <TransparencyPage />}
        {route === "contact" && <ContactPage />}
      </main>
      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <NavProvider>
      <Shell />
    </NavProvider>
  );
}
