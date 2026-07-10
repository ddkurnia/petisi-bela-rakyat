"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore, buildPengurusTree, getInitials, type PengurusTreeNode } from "@/lib/store";
import { useNav } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/avatar";

export function StrukturOrganisasiPage() {
  const { navigate } = useNav();
  const pengurus = useStore((s) => s.pengurus);
  const tree = buildPengurusTree(pengurus);
  const totalActive = pengurus.filter((p) => p.status === "active").length;

  return (
    <div className="pt-24 md:pt-32 pb-20">
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="Tentang Kami"
              title="Struktur Tim"
              description="Susunan tim Petisi Bela Rakyat yang menjalankan gerakan ini setiap hari. Hierarki otomatis terbentuk berdasarkan atasan langsung setiap anggota."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-center">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-white border-0">{totalActive} pengurus aktif</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Klik kartu untuk lihat profil detail</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Org Chart - Tree visualization */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          {tree.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Belum ada data pengurus.</p>
              <p className="text-xs text-muted-foreground mt-2">
                Admin dapat menambah pengurus melalui Admin Panel → Kelola Pengurus.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP: Horizontal tree */}
              <div className="hidden lg:block">
                <OrgTreeDesktop tree={tree} navigate={navigate} />
              </div>

              {/* MOBILE: Vertical card stack */}
              <div className="lg:hidden">
                <OrgTreeMobile tree={tree} navigate={navigate} />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

// ============ DESKTOP TREE (recursive) ============
function OrgTreeDesktop({
  tree,
  navigate,
}: {
  tree: PengurusTreeNode[];
  navigate: ReturnType<typeof useNav>["navigate"];
}) {
  return (
    <div className="flex flex-col items-center gap-8">
      {tree.map((node) => (
        <DesktopNode key={node.id} node={node} navigate={navigate} />
      ))}
    </div>
  );
}

function DesktopNode({
  node,
  navigate,
}: {
  node: PengurusTreeNode;
  navigate: ReturnType<typeof useNav>["navigate"];
}) {
  return (
    <div className="flex flex-col items-center">
      {/* Node card */}
      <Reveal>
        <button
          onClick={() => node.slug && navigate("pengurus", { pengurusSlug: node.slug })}
          className="group block"
        >
          <Card className="p-4 w-56 border-0 shadow-lg shadow-foreground/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-card">
            <div className="flex flex-col items-center text-center">
              <Avatar
                src={node.photo}
                name={node.name}
                size={80}
                shape="circle"
                className="ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all"
              />
              <div className="mt-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wide">
                {node.jabatan}
              </div>
              <div className="mt-2 font-heading text-sm font-bold line-clamp-1">{node.name}</div>
              <div className="text-[10px] text-muted-foreground line-clamp-1">{node.gelar}</div>
            </div>
          </Card>
        </button>
      </Reveal>

      {/* Connector + children */}
      {node.children.length > 0 && (
        <>
          {/* Vertical line down */}
          <div className="w-px h-8 bg-border" />
          {/* Horizontal line connecting children */}
          <div className="relative flex justify-center gap-6">
            {/* Horizontal connector line above children */}
            {node.children.length > 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-border"
                style={{
                  width: `${(node.children.length - 1) * 236}px`,
                  left: `calc(50% - ${((node.children.length - 1) * 236) / 2}px)`,
                }}
              />
            )}
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical line from horizontal connector to child */}
                <div className="w-px h-8 bg-border" />
                <DesktopNode node={child} navigate={navigate} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============ MOBILE TREE (vertical card stack) ============
function OrgTreeMobile({
  tree,
  navigate,
}: {
  tree: PengurusTreeNode[];
  navigate: ReturnType<typeof useNav>["navigate"];
}) {
  return (
    <div className="space-y-3">
      {tree.map((node) => (
        <MobileNode key={node.id} node={node} navigate={navigate} depth={0} />
      ))}
    </div>
  );
}

function MobileNode({
  node,
  navigate,
  depth,
}: {
  node: PengurusTreeNode;
  navigate: ReturnType<typeof useNav>["navigate"];
  depth: number;
}) {
  return (
    <div style={{ marginLeft: depth * 20 }}>
      <Reveal>
        <button
          onClick={() => node.slug && navigate("pengurus", { pengurusSlug: node.slug })}
          className="group block w-full text-left"
        >
          <Card className="p-3 border-0 shadow-md shadow-foreground/5 hover:shadow-lg transition-all bg-card flex items-center gap-3"
            style={{ borderLeft: depth === 0 ? "4px solid var(--primary)" : "4px solid var(--border)" }}
          >
            <Avatar
              src={node.photo}
              name={node.name}
              size={48}
              shape="circle"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                  {node.jabatan}
                </span>
                {depth > 0 && (
                  <span className="text-[9px] text-muted-foreground">↳ bawahan</span>
                )}
              </div>
              <div className="font-heading text-sm font-bold line-clamp-1">{node.name}</div>
              <div className="text-[10px] text-muted-foreground line-clamp-1">{node.gelar}</div>
            </div>
          </Card>
        </button>
      </Reveal>
      {node.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <MobileNode key={child.id} node={child} navigate={navigate} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
