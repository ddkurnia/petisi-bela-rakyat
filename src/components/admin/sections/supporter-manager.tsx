"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { useStore, type Supporter } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ImageUpload } from "../image-upload";
import { toast } from "sonner";

export function SupporterManager() {
  const supporters = useStore((s) => s.supporters);
  const addSupporter = useStore((s) => s.addSupporter);
  const updateSupporter = useStore((s) => s.updateSupporter);
  const deleteSupporter = useStore((s) => s.deleteSupporter);
  const [editing, setEditing] = useState<Supporter | null>(null);
  const [open, setOpen] = useState(false);

  const blank: Omit<Supporter, "id"> = { name: "", position: "", statement: "", photo: "" };

  const save = () => {
    if (!editing) return;
    if (!editing.name) { toast.error("Nama wajib diisi"); return; }
    if (editing.id) { updateSupporter(editing.id, editing); }
    else { addSupporter(editing); }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{supporters.length} pendukung</p>
        <Button onClick={() => { setEditing(blank as Supporter); setOpen(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1.5" /> Tambah Pendukung
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {supporters.map((s) => (
          <Card key={s.id} className="p-5 border-0 shadow-lg shadow-foreground/5">
            <div className="flex items-start gap-3">
              <img src={s.photo} alt={s.name} className="h-14 w-14 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-sm">{s.name}</h3>
                <p className="text-xs text-muted-foreground">{s.position}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic line-clamp-3">&ldquo;{s.statement}&rdquo;</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="rounded-full flex-1" onClick={() => { setEditing(s); setOpen(true); }}>
                <Pencil className="h-3 w-3 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                if (confirm(`Hapus ${s.name}?`)) { deleteSupporter(s.id); }
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Tambah"} Pendukung</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <ImageUpload
                label="Foto"
                value={editing.photo}
                onChange={(url) => setEditing({ ...editing, photo: url })}
                aspectRatio="square"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nama *</Label>
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Jabatan</Label>
                  <Input value={editing.position} onChange={(e) => setEditing({ ...editing, position: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Pernyataan Dukungan</Label>
                <Textarea value={editing.statement} onChange={(e) => setEditing({ ...editing, statement: e.target.value })} rows={3} className="rounded-xl resize-none" />
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
