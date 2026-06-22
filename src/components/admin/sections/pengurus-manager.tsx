"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Save, Phone, Mail, ArrowUp, ArrowDown } from "lucide-react";
import { useStore, type Pengurus } from "@/lib/store";
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
import { Avatar } from "@/components/avatar";

export function PengurusManager() {
  const pengurus = useStore((s) => s.pengurus);
  const addPengurus = useStore((s) => s.addPengurus);
  const updatePengurus = useStore((s) => s.updatePengurus);
  const deletePengurus = useStore((s) => s.deletePengurus);
  const [editing, setEditing] = useState<Pengurus | null>(null);
  const [open, setOpen] = useState(false);

  const blank: Pengurus = {
    id: "", slug: "", name: "", gelar: "", jabatan: "",
    parentId: null, bio: "", experience: "",
    whatsapp: "", email: "", photo: "", order: pengurus.length + 1, status: "active",
  };

  const openNew = () => { setEditing(blank); setOpen(true); };
  const openEdit = (m: Pengurus) => { setEditing(m); setOpen(true); };

  const save = () => {
    if (!editing) return;
    if (!editing.name) { toast.error("Nama wajib diisi"); return; }
    if (!editing.jabatan) { toast.error("Jabatan wajib diisi"); return; }
    // Prevent circular reference: parent cannot be self or own descendant
    if (editing.parentId && editing.parentId === editing.id) {
      toast.error("Atasan tidak boleh diri sendiri");
      return;
    }
    if (editing.id) {
      updatePengurus(editing.id, editing);
      toast.success("Pengurus diperbarui");
    } else {
      addPengurus(editing);
      toast.success("Pengurus ditambahkan");
    }
    setOpen(false);
  };

  // Move pengurus up/down within same parent (reorder)
  const movePengurus = (id: string, direction: "up" | "down") => {
    const item = pengurus.find((p) => p.id === id);
    if (!item) return;
    const siblings = pengurus
      .filter((p) => p.parentId === item.parentId)
      .sort((a, b) => a.order - b.order);
    const idx = siblings.findIndex((p) => p.id === id);
    if (direction === "up" && idx > 0) {
      const prev = siblings[idx - 1];
      updatePengurus(item.id, { order: prev.order });
      updatePengurus(prev.id, { order: item.order });
    } else if (direction === "down" && idx < siblings.length - 1) {
      const next = siblings[idx + 1];
      updatePengurus(item.id, { order: next.order });
      updatePengurus(next.id, { order: item.order });
    }
  };

  // Render pengurus as indented tree in admin list
  const renderPengurusList = () => {
    const result: React.ReactNode[] = [];
    const renderNode = (parentId: string | null, depth: number) => {
      const items = pengurus
        .filter((p) => p.parentId === parentId)
        .sort((a, b) => a.order - b.order);
      items.forEach((m) => {
        result.push(
          <div
            key={m.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors"
            style={{ marginLeft: depth * 20 }}
          >
            <Avatar src={m.photo} name={m.name} size={40} shape="circle" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm truncate">{m.name}</span>
                <Badge className="bg-primary/10 text-primary border-0 text-xs">{m.jabatan}</Badge>
                <Badge variant="outline" className={m.status === "active" ? "border-green-500/30 text-green-600 text-xs" : "text-xs"}>
                  {m.status === "active" ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {m.gelar}{m.whatsapp && ` • ${m.whatsapp}`}
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="rounded-full h-8 w-8" onClick={() => movePengurus(m.id, "up")} title="Pindah ke atas">
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full h-8 w-8" onClick={() => movePengurus(m.id, "down")} title="Pindah ke bawah">
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => openEdit(m)}>
                <Pencil className="h-3 w-3 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                if (confirm(`Hapus ${m.name}?`)) {
                  deletePengurus(m.id);
                  toast.success("Pengurus dihapus");
                }
              }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
        renderNode(m.id, depth + 1);
      });
    };
    renderNode(null, 0);
    return result;
  };

  // Options for parent selector (exclude self and own descendants to prevent circular)
  const getParentOptions = () => {
    if (!editing) return [];
    // Get all pengurus except self
    let candidates = pengurus.filter((p) => p.id !== editing.id);
    // If editing existing, also exclude own descendants
    if (editing.id) {
      const getDescendantIds = (id: string): string[] => {
        const children = pengurus.filter((p) => p.parentId === id);
        return [...children.map((c) => c.id), ...children.flatMap((c) => getDescendantIds(c.id))];
      };
      const descendantIds = getDescendantIds(editing.id);
      candidates = candidates.filter((p) => !descendantIds.includes(p.id));
    }
    return candidates.sort((a, b) => a.name.localeCompare(b.name));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">
          {pengurus.filter((p) => p.status === "active").length} aktif dari {pengurus.length} pengurus total
        </p>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1.5" />
          Tambah Pengurus
        </Button>
      </div>

      <Card className="p-4 md:p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold text-sm mb-3 flex items-center gap-2">
          📊 Struktur Hierarki Pengurus
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Susunan berikut otomatis terbentuk berdasarkan <strong>Atasan Langsung</strong> setiap pengurus. Gunakan tombol ↑↓ untuk mengatur urutan tampil.
        </p>
        <div className="space-y-2">
          {renderPengurusList()}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Tambah"} Pengurus</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <ImageUpload
                label="Foto Pengurus (kosongkan untuk pakai inisial)"
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
                  <Label>Jabatan * <span className="text-xs text-muted-foreground">(bebas, mis. "Wakil Ketua 1", "Bidang Relawan")</span></Label>
                  <Input
                    value={editing.jabatan}
                    onChange={(e) => setEditing({ ...editing, jabatan: e.target.value })}
                    placeholder="Ketua / Wakil Ketua / Sekretaris / Bidang..."
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Atasan Langsung <span className="text-xs text-muted-foreground">(kosong = top-level/Ketua)</span></Label>
                  <Select
                    value={editing.parentId || "__none__"}
                    onValueChange={(v) => setEditing({ ...editing, parentId: v === "__none__" ? null : v })}
                  >
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="— Tidak ada (top-level) —" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Tidak ada (top-level/Ketua) —</SelectItem>
                      {getParentOptions().map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.jabatan})
                        </SelectItem>
                      ))}
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

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Urutan Tampil <span className="text-xs text-muted-foreground">(di level yang sama)</span></Label>
                  <Input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 1 })} className="rounded-xl" />
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
