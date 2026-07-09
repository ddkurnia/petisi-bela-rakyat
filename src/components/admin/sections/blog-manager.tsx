"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, Calendar, Clock } from "lucide-react";
import { useStore, type BlogPost } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ImageUpload, MultiImageUpload } from "../image-upload";
import { toast } from "sonner";

const blogCategories = ["Infrastruktur", "Hukum", "Kebijakan Publik", "Aspirasi Rakyat", "Kepulauan Meranti"];

export function BlogManager() {
  const blog = useStore((s) => s.blog);
  const addBlog = useStore((s) => s.addBlog);
  const updateBlog = useStore((s) => s.updateBlog);
  const deleteBlog = useStore((s) => s.deleteBlog);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [open, setOpen] = useState(false);

  // Auto-publish scheduled posts (runs every minute)
  useEffect(() => {
    const checkScheduled = () => {
      const now = new Date();
      blog.forEach((p) => {
        if (p.status === "scheduled" && p.scheduledAt) {
          const scheduled = new Date(p.scheduledAt);
          if (scheduled <= now) {
            updateBlog(p.id, { status: "published", publishedAt: scheduled.toISOString().split("T")[0], scheduledAt: null });
          }
        }
      });
    };
    checkScheduled();
    const id = setInterval(checkScheduled, 60000);
    return () => clearInterval(id);
  }, [blog, updateBlog]);

  const blank: Omit<BlogPost, "id" | "views" | "shares"> = {
    slug: "", title: "", excerpt: "", content: "", coverImage: "",
    images: [], category: "Infrastruktur", tags: [], author: "Admin",
    publishedAt: new Date().toISOString().split("T")[0],
    scheduledAt: null,
    metaTitle: "", metaDescription: "", status: "draft",
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title) { toast.error("Judul wajib diisi"); return; }

    // Auto-set metaTitle / metaDescription if empty
    const finalData = {
      ...editing,
      metaTitle: editing.metaTitle || editing.title,
      metaDescription: editing.metaDescription || editing.excerpt,
    };

    if (editing.id) {
      updateBlog(editing.id, finalData);
    } else {
      addBlog(finalData);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {blog.length} artikel • {blog.filter((b) => b.status === "published").length} published • {blog.filter((b) => b.status === "scheduled").length} scheduled • {blog.filter((b) => b.status === "draft").length} draft
        </p>
        <Button onClick={() => { setEditing(blank as BlogPost); setOpen(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1.5" /> Tulis Artikel
        </Button>
      </div>

      <Card className="border-0 shadow-lg shadow-foreground/5 overflow-hidden">
        <div className="divide-y divide-border">
          {blog.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-secondary/40 transition-colors">
              <img src={p.coverImage} alt="" className="h-14 w-14 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">{p.category}</Badge>
                  <Badge variant="outline" className={
                    p.status === "published" ? "border-green-500/30 text-green-600 text-xs"
                    : p.status === "scheduled" ? "border-amber-500/30 text-amber-600 text-xs"
                    : "text-xs"
                  }>
                    {p.status === "published" ? "Published" : p.status === "scheduled" ? "Scheduled" : "Draft"}
                  </Badge>
                  {p.status === "scheduled" && p.scheduledAt && (
                    <span className="text-[10px] text-amber-600 inline-flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(p.scheduledAt).toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm mt-1 truncate">{p.title}</h3>
                <p className="text-xs text-muted-foreground">{p.views} views • {p.shares || 0} shares • {p.publishedAt}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="rounded-full" onClick={() => { setEditing(p); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                  if (confirm(`Hapus "${p.title}"?`)) { deleteBlog(p.id); }
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {blog.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">Belum ada artikel.</div>
          )}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Tulis"} Artikel Blog</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Judul *</Label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {blogCategories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={editing.status} onValueChange={(v: "published" | "draft" | "scheduled") => setEditing({ ...editing, status: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ImageUpload
                label="Featured Image"
                value={editing.coverImage}
                onChange={(url) => setEditing({ ...editing, coverImage: url })}
                aspectRatio="video"
              />

              <MultiImageUpload
                label="Galeri Gambar Tambahan"
                value={editing.images}
                onChange={(images) => setEditing({ ...editing, images })}
              />

              <div className="space-y-1.5">
                <Label>Excerpt</Label>
                <Textarea
                  value={editing.excerpt}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  rows={2}
                  className="rounded-xl resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Tags (pisahkan dengan koma)</Label>
                <Input
                  value={editing.tags.join(", ")}
                  onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Konten (Markdown: ## Heading, - list item)</Label>
                <Textarea
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  rows={10}
                  className="rounded-xl resize-y font-mono text-sm"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Penulis</Label>
                  <Input value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tanggal Publish</Label>
                  <Input type="date" value={editing.publishedAt} onChange={(e) => setEditing({ ...editing, publishedAt: e.target.value })} className="rounded-xl" />
                </div>
              </div>

              {editing.status === "scheduled" && (
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Tanggal & Jam Publish Otomatis
                  </Label>
                  <Input
                    type="datetime-local"
                    value={editing.scheduledAt ? editing.scheduledAt.slice(0, 16) : ""}
                    onChange={(e) => setEditing({ ...editing, scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Artikel akan otomatis dipublish pada waktu yang dijadwalkan.
                  </p>
                </div>
              )}

              {/* SEO */}
              <div className="p-4 rounded-xl bg-secondary/40 border border-border space-y-3">
                <h4 className="font-heading text-sm font-bold">SEO Settings</h4>
                <div className="space-y-1.5">
                  <Label>Meta Title</Label>
                  <Input
                    value={editing.metaTitle}
                    onChange={(e) => setEditing({ ...editing, metaTitle: e.target.value })}
                    placeholder={editing.title || "Auto dari judul..."}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={editing.metaDescription}
                    onChange={(e) => setEditing({ ...editing, metaDescription: e.target.value })}
                    placeholder={editing.excerpt || "Auto dari excerpt..."}
                    rows={2}
                    className="rounded-xl resize-none"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
            <Button onClick={save} className="bg-primary hover:bg-primary/90 text-white rounded-full">
              <Save className="h-4 w-4 mr-1.5" /> Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
