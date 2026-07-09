"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Upload } from "lucide-react";
import { useStore, type GalleryItem } from "@/lib/store";
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

export function MediaManager() {
  const gallery = useStore((s) => s.gallery);
  const addGallery = useStore((s) => s.addGallery);
  const deleteGallery = useStore((s) => s.deleteGallery);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [open, setOpen] = useState(false);

  const blank: Omit<GalleryItem, "id"> = {
    type: "photo", title: "", url: "", thumbnail: "", category: "Aksi",
    description: "", uploadedAt: new Date().toISOString().split("T")[0],
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title) { toast.error("Judul wajib diisi"); return; }
    const finalData = { ...editing, thumbnail: editing.thumbnail || editing.url };
    addGallery(finalData);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {gallery.length} item media • {gallery.filter((g) => g.type === "photo").length} foto • {gallery.filter((g) => g.type === "video").length} video • {gallery.filter((g) => g.type === "document").length} dokumen
        </p>
        <Button onClick={() => { setEditing(blank as GalleryItem); setOpen(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Upload className="h-4 w-4 mr-1.5" /> Upload Media
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gallery.map((g) => (
          <Card key={g.id} className="overflow-hidden border-0 shadow-lg shadow-foreground/5">
            <div className="aspect-square overflow-hidden relative">
              <img src={g.thumbnail} alt={g.title} className="h-full w-full object-cover" />
              <Badge className="absolute top-2 left-2 bg-primary text-white border-0 capitalize text-xs">{g.type}</Badge>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm truncate">{g.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{g.category}</p>
              <Button size="sm" variant="ghost" className="w-full mt-2 rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                if (confirm(`Hapus "${g.title}"?`)) { deleteGallery(g.id); }
              }}>
                <Trash2 className="h-3 w-3 mr-1" /> Hapus
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Media Baru</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Tipe Media</Label>
                <Select value={editing.type} onValueChange={(v: "photo" | "video" | "document") => setEditing({ ...editing, type: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo">Foto</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">Dokumen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editing.type === "photo" && (
                <ImageUpload
                  label="Upload Foto"
                  value={editing.url}
                  onChange={(url) => setEditing({ ...editing, url, thumbnail: url })}
                  aspectRatio="video"
                />
              )}

              {(editing.type === "video" || editing.type === "document") && (
                <div className="space-y-1.5">
                  <Label>URL {editing.type === "video" ? "Video (YouTube embed)" : "File PDF"}</Label>
                  <Input value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} className="rounded-xl" />
                </div>
              )}

              {editing.type !== "photo" && (
                <ImageUpload
                  label="Thumbnail"
                  value={editing.thumbnail}
                  onChange={(url) => setEditing({ ...editing, thumbnail: url })}
                  aspectRatio="video"
                />
              )}

              <div className="space-y-1.5">
                <Label>Judul *</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="rounded-xl" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tanggal</Label>
                  <Input type="date" value={editing.uploadedAt} onChange={(e) => setEditing({ ...editing, uploadedAt: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Deskripsi</Label>
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="rounded-xl resize-none" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
            <Button onClick={save} className="bg-primary hover:bg-primary/90 text-white rounded-full">
              <Save className="h-4 w-4 mr-1.5" /> Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
