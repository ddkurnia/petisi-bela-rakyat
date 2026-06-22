"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { useStore, type Penasehat } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ImageUpload } from "../image-upload";
import { toast } from "sonner";

export function PenasehatManager() {
  const penasehat = useStore((s) => s.penasehat);
  const addPenasehat = useStore((s) => s.addPenasehat);
  const updatePenasehat = useStore((s) => s.updatePenasehat);
  const deletePenasehat = useStore((s) => s.deletePenasehat);
  const [editing, setEditing] = useState<Penasehat | null>(null);
  const [open, setOpen] = useState(false);

  const blank: Penasehat = {
    id: "", name: "", gelar: "", jabatan: "Dewan Penasehat",
    bio: "", photo: "", order: penasehat.length + 1,
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name) { toast.error("Nama wajib diisi"); return; }
    if (editing.id) { updatePenasehat(editing.id, editing); toast.success("Penasehat diperbarui"); }
    else { addPenasehat(editing); toast.success("Penasehat ditambahkan"); }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{penasehat.length} anggota dewan penasehat</p>
        <Button onClick={() => { setEditing(blank); setOpen(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1.5" /> Tambah Penasehat
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...penasehat].sort((a,b) => a.order - b.order).map((p) => (
          <Card key={p.id} className="overflow-hidden border-0 shadow-lg shadow-foreground/5">
            <div className="aspect-[4/5] overflow-hidden relative">
              <img src={p.photo} alt={p.name} className="h-full w-full object-cover" />
              <Badge className="absolute top-2 left-2 bg-primary text-white border-0">{p.jabatan}</Badge>
            </div>
            <div className="p-4">
              <h3 className="font-heading font-bold text-sm">{p.name}</h3>
              <p className="text-xs text-muted-foreground">{p.gelar}</p>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.bio}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="rounded-full flex-1" onClick={() => { setEditing(p); setOpen(true); }}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                  if (confirm(`Hapus ${p.name}?`)) { deletePenasehat(p.id); toast.success("Penasehat dihapus"); }
                }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Tambah"} Penasehat</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <ImageUpload
                label="Foto"
                value={editing.photo}
                onChange={(url) => setEditing({ ...editing, photo: url })}
                aspectRatio="portrait"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nama *</Label>
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Gelar</Label>
                  <Input value={editing.gelar} onChange={(e) => setEditing({ ...editing, gelar: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Jabatan</Label>
                <Input value={editing.jabatan} onChange={(e) => setEditing({ ...editing, jabatan: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Biografi</Label>
                <Textarea value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} rows={4} className="rounded-xl resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label>Urutan Tampil</Label>
                <Input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 1 })} className="rounded-xl" />
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
