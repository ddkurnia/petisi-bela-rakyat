"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Save, MapPin } from "lucide-react";
import { useStore, type Relawan } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export function RelawanManager() {
  const relawan = useStore((s) => s.relawan);
  const addRelawan = useStore((s) => s.addRelawan);
  const updateRelawan = useStore((s) => s.updateRelawan);
  const deleteRelawan = useStore((s) => s.deleteRelawan);
  const [editing, setEditing] = useState<Relawan | null>(null);
  const [open, setOpen] = useState(false);

  const blank: Relawan = {
    id: "", name: "", area: "", joinedAt: new Date().toISOString().split("T")[0],
    photo: "", active: true,
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name) { toast.error("Nama wajib diisi"); return; }
    if (editing.id) { updateRelawan(editing.id, editing); toast.success("Relawan diperbarui"); }
    else { addRelawan(editing); toast.success("Relawan ditambahkan"); }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {relawan.filter((r) => r.active).length} aktif dari {relawan.length} relawan
        </p>
        <Button onClick={() => { setEditing(blank); setOpen(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1.5" /> Tambah Relawan
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {relawan.map((r) => (
          <Card key={r.id} className="overflow-hidden border-0 shadow-lg shadow-foreground/5">
            <div className="aspect-square overflow-hidden relative">
              <img src={r.photo} alt={r.name} className="h-full w-full object-cover" />
              <Badge className={`absolute top-2 left-2 border-0 ${r.active ? "bg-green-600 text-white" : "bg-gray-500 text-white"}`}>
                {r.active ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
            <div className="p-3">
              <h3 className="font-heading font-bold text-sm truncate">{r.name}</h3>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                <MapPin className="h-2.5 w-2.5" /> {r.area}
              </div>
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="outline" className="rounded-full flex-1 h-7 text-xs" onClick={() => { setEditing(r); setOpen(true); }}>
                  <Pencil className="h-2.5 w-2.5 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10 h-7 w-7 p-0" onClick={() => {
                  if (confirm(`Hapus ${r.name}?`)) { deleteRelawan(r.id); toast.success("Relawan dihapus"); }
                }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Tambah"} Relawan</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <ImageUpload
                label="Foto"
                value={editing.photo}
                onChange={(url) => setEditing({ ...editing, photo: url })}
                aspectRatio="square"
              />
              <div className="space-y-1.5">
                <Label>Nama *</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="rounded-xl" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Wilayah/Area</Label>
                  <Input value={editing.area} onChange={(e) => setEditing({ ...editing, area: e.target.value })} placeholder="Selatpanjang" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tanggal Bergabung</Label>
                  <Input type="date" value={editing.joinedAt} onChange={(e) => setEditing({ ...editing, joinedAt: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={editing.active ? "active" : "inactive"}
                  onValueChange={(v) => setEditing({ ...editing, active: v === "active" })}
                >
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
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
