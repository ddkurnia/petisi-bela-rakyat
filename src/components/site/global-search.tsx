"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, Newspaper, Megaphone, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n/use-translated-text";
import {
  Dialog, DialogContent, DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SearchResult {
  type: 'blog' | 'news' | 'campaign' | 'pengurus';
  title: string;
  excerpt: string;
  slug: string;
  href: string;
  icon: React.ElementType;
}

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const blog = useStore((s) => s.blog);
  const news = useStore((s) => s.news);
  const campaigns = useStore((s) => s.campaigns);
  const pengurus = useStore((s) => s.pengurus);
  const [query, setQuery] = useState("");

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    blog.forEach((p) => {
      if (p.status !== 'published') return;
      if (p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)) {
        matches.push({ type: 'blog', title: p.title, excerpt: p.excerpt, slug: p.slug, href: `/blog/${p.slug}`, icon: FileText });
      }
    });
    news.forEach((n) => {
      if (n.status !== 'published') return;
      if (n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q)) {
        matches.push({ type: 'news', title: n.title, excerpt: n.excerpt, slug: n.slug, href: `/news/${n.slug}`, icon: Newspaper });
      }
    });
    campaigns.forEach((c) => {
      if (c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        matches.push({ type: 'campaign', title: c.title, excerpt: c.description, slug: c.slug, href: `/kampanye/${c.slug}`, icon: Megaphone });
      }
    });
    pengurus.forEach((p) => {
      if (p.status !== 'active') return;
      if (p.name.toLowerCase().includes(q) || p.jabatan.toLowerCase().includes(q)) {
        matches.push({ type: 'pengurus', title: `${p.name} — ${p.jabatan}`, excerpt: p.bio || '', slug: p.slug || '', href: `/pengurus/${p.slug}`, icon: Users });
      }
    });

    return matches.slice(0, 20);
  }, [query, blog, news, campaigns, pengurus]);

  const handleNavigate = (href: string) => {
    router.push(href);
    onOpenChange(false);
    setQuery("");
  };

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari artikel, berita, kampanye, tim..."
            className="border-0 outline-none focus-visible:ring-0 h-9 text-base"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-secondary border border-border text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Ketik untuk mencari di seluruh website
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Tidak ada hasil untuk "{query}"
            </div>
          ) : (
            <div className="divide-y divide-border">
              {results.map((r, i) => {
                const Icon = r.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleNavigate(r.href)}
                    className="w-full flex items-start gap-3 p-4 hover:bg-secondary/40 transition-colors text-left"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{r.type}</span>
                      </div>
                      <div className="font-heading font-semibold text-sm line-clamp-1">
                        <T>{r.title}</T>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{r.excerpt}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
