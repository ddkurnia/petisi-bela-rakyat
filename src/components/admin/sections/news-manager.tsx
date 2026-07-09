"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { useStore, type NewsArticle } from "@/lib/store";
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
import { ImageUpload } from "../image-upload";
import { toast } from "sonner";

const newsCategories = ["Kampanye", "Advokasi", "Organisasi", "Aksi", "Audiensi"];

export function NewsManager() {
  const news = useStore((s) => s.news);
  const addNews = useStore((s) => s.addNews);
  const updateNews = useStore((s) => s.updateNews);
  const deleteNews = useStore((s) => s.deleteNews);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [open, setOpen] = useState(false);

  const blank: Omit<NewsArticle, "id" | "views" | "shares"> = {
    slug: "", title: "", excerpt: "", content: "", coverImage: "",
    category: "Kampanye", author: "Admin", publishedAt: new Date().toISOString().split("T")[0],
    status: "draft",
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title) { toast.error("Judul wajib diisi"); return; }
    if (editing.id) { updateNews(editing.id, editing); }
    else { addNews(editing); }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{news.length} berita</p>
        <Button onClick={() => { setEditing(blank as NewsArticle); setOpen(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1.5" /> Tulis Berita
        </Button>
      </div>

      <Card className="border-0 shadow-lg shadow-foreground/5 overflow-hidden">
        <div className="divide-y divide-border">
          {news.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-secondary/40 transition-colors">
              <img src={p.coverImage} alt="" className="h-14 w-14 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{p.category}</Badge>
                  <Badge variant="outline" className={p.status === "published" ? "border-green-500/30 text-green-600 text-xs" : "text-xs"}>
                    {p.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm mt-1 truncate">{p.title}</h3>
                <p className="text-xs text-muted-foreground">{p.views} views • {p.shares || 0} shares • {p.publishedAt}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="rounded-full" onClick={() => { setEditing(p); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                  if (confirm(`Hapus "${p.title}"?`)) { deleteNews(p.id); }
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {news.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">Belum ada berita.</div>
          )}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Tulis"} Berita</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Judul *</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="rounded-xl" />
              </div>
              <ImageUpload
                label="Foto Berita"
                value={editing.coverImage}
                onChange={(url) => setEditing({ ...editing, coverImage: url })}
                aspectRatio="video"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {newsCategories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={editing.status} onValueChange={(v: "published" | "draft") => setEditing({ ...editing, status: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Excerpt</Label>
                <Textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={2} className="rounded-xl resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label>Konten (Markdown)</Label>
                <Textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={8} className="rounded-xl resize-y font-mono text-sm" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Penulis</Label>
                  <Input value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tanggal</Label>
                  <Input type="date" value={editing.publishedAt} onChange={(e) => setEditing({ ...editing, publishedAt: e.target.value })} className="rounded-xl" />
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
