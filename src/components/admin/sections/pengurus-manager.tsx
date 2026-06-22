"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Save, Phone, Mail } from "lucide-react";
import { useStore, type Pengurus, type OrgPositionKey } from "@/lib/store";
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

const jabatanOptions: { key: OrgPositionKey; label: string }[] = [
  { key: "ketua", label: "Ketua" },
  { key: "wakil_ketua", label: "Wakil Ketua" },
  { key: "sekretaris", label: "Sekretaris" },
  { key: "bidang_hukum", label: "Bidang Hukum" },
  { key: "bidang_advokasi", label: "Bidang Advokasi" },
  { key: "bidang_media", label: "Bidang Media" },
  { key: "bidang_hubungan_pemerintah", label: "Bidang Hubungan Pemerintah" },
  { key: "bidang_penggalangan_dukungan", label: "Bidang Penggalangan Dukungan" },
  { key: "bidang_riset_data", label: "Bidang Riset dan Data" },
  { key: "bidang_keuangan", label: "Bidang Keuangan" },
];

export function PengurusManager() {
  const pengurus = useStore((s) => s.pengurus);
  const addPengurus = useStore((s) => s.addPengurus);
  const updatePengurus = useStore((s) => s.updatePengurus);
  const deletePengurus = useStore((s) => s.deletePengurus);
  const [editing, setEditing] = useState<Pengurus | null>(null);
  const [open, setOpen] = useState(false);

  const blank: Pengurus = {
    id: "", slug: "", name: "", gelar: "", jabatan: "Bidang Advokasi",
    jabatanKey: "bidang_advokasi", bio: "", experience: "",
    whatsapp: "", email: "", photo: "", order: pengurus.length + 1, status: "active",
  };

  const openNew = () => { setEditing(blank); setOpen(true); };
  const openEdit = (m: Pengurus) => { setEditing(m); setOpen(true); };

  const save = () => {
    if (!editing) return;
    if (!editing.name) { toast.error("Nama wajib diisi"); return; }
    // Sync jabatan label from key
    const jab = jabatanOptions.find((j) => j.key === editing.jabatanKey);
    const finalData = { ...editing, jabatan: jab?.label || editing.jabatan };
    if (editing.id) {
      updatePengurus(editing.id, finalData);
      toast.success("Pengurus diperbarui");
    } else {
      addPengurus(finalData);
      toast.success("Pengurus ditambahkan");
    }
    setOpen(false);
  };

  const sorted = [...pengurus].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pengurus.filter((p) => p.status === "active").length} aktif dari {pengurus.length} pengurus
        </p>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1.5" />
          Tambah Pengurus
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((m) => (
          <Card key={m.id} className="overflow-hidden border-0 shadow-lg shadow-foreground/5">
            <div className="aspect-square overflow-hidden relative">
              <img src={m.photo} alt={m.name} className="h-full w-full object-cover" />
              <Badge className={`absolute top-2 left-2 border-0 ${m.status === "active" ? "bg-green-600 text-white" : "bg-gray-500 text-white"}`}>
                {m.status === "active" ? "Aktif" : "Nonaktif"}
              </Badge>
              <Badge className="absolute bottom-2 left-2 bg-primary text-white border-0">{m.jabatan}</Badge>
            </div>
            <div className="p-4">
              <h3 className="font-heading font-bold text-sm truncate">{m.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{m.gelar}</p>
              <div className="mt-2 space-y-1 text-[10px] text-muted-foreground">
                {m.whatsapp && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-2.5 w-2.5" /> {m.whatsapp}
                  </div>
                )}
                {m.email && (
                  <div className="flex items-center gap-1 truncate">
                    <Mail className="h-2.5 w-2.5" /> {m.email}
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="rounded-full flex-1" onClick={() => openEdit(m)}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                  if (confirm(`Hapus ${m.name}?`)) { deletePengurus(m.id); toast.success("Pengurus dihapus"); }
                }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Tambah"} Pengurus</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <ImageUpload
                label="Foto Pengurus"
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
                  <Input value={editing.gelar} onChange={(e) => setEditing({ ...editing, gelar: e.target.value })} placeholder="S.H., M.H" className="rounded-xl" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Jabatan</Label>
                  <Select
                    value={editing.jabatanKey}
                    onValueChange={(v) => setEditing({ ...editing, jabatanKey: v as OrgPositionKey })}
                  >
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {jabatanOptions.map((j) => (
                        <SelectItem key={j.key} value={j.key}>{j.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={editing.status}
                    onValueChange={(v: "active" | "inactive") => setEditing({ ...editing, status: v })}
                  >
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nomor WhatsApp</Label>
                  <Input value={editing.whatsapp} onChange={(e) => setEditing({ ...editing, whatsapp: e.target.value })} placeholder="+62 812-xxxx-xxxx" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Biografi</Label>
                <Textarea value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} rows={3} className="rounded-xl resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label>Pengalaman (pisahkan dengan titik)</Label>
                <Textarea value={editing.experience} onChange={(e) => setEditing({ ...editing, experience: e.target.value })} rows={3} className="rounded-xl resize-none" />
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
