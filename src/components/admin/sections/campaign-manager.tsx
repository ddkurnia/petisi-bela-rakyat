"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { useStore, type Campaign } from "@/lib/store";
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

export function CampaignManager() {
  const campaigns = useStore((s) => s.campaigns);
  const addCampaign = useStore((s) => s.addCampaign);
  const updateCampaign = useStore((s) => s.updateCampaign);
  const deleteCampaign = useStore((s) => s.deleteCampaign);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [open, setOpen] = useState(false);

  const blank: Omit<Campaign, "id"> = {
    slug: "", title: "", description: "", coverImage: "", petitionLink: "#",
    supporters: 0, goal: 1000, status: "active", location: "",
    startedAt: new Date().toISOString().split("T")[0],
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title) { toast.error("Judul wajib diisi"); return; }
    if (editing.id) { updateCampaign(editing.id, editing); toast.success("Kampanye diperbarui"); }
    else { addCampaign(editing); toast.success("Kampanye ditambahkan"); }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{campaigns.length} kampanye</p>
        <Button onClick={() => { setEditing(blank as Campaign); setOpen(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1.5" /> Tambah Kampanye
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((c) => (
          <Card key={c.id} className="overflow-hidden border-0 shadow-lg shadow-foreground/5">
            <div className="aspect-video overflow-hidden">
              <img src={c.coverImage} alt={c.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <Badge className="bg-primary text-white border-0 mb-2">{c.status}</Badge>
              <h3 className="font-heading font-bold text-sm line-clamp-2">{c.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{c.supporters}/{c.goal} pendukung</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="rounded-full flex-1" onClick={() => { setEditing(c); setOpen(true); }}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                  if (confirm(`Hapus "${c.title}"?`)) { deleteCampaign(c.id); toast.success("Kampanye dihapus"); }
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
            <DialogTitle>{editing?.id ? "Edit" : "Tambah"} Kampanye</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Judul *</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="rounded-xl" />
              </div>
              <ImageUpload
                label="Foto Kampanye"
                value={editing.coverImage}
                onChange={(url) => setEditing({ ...editing, coverImage: url })}
                aspectRatio="video"
              />
              <div className="space-y-1.5">
                <Label>Deskripsi</Label>
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="rounded-xl resize-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Lokasi</Label>
                  <Input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={editing.status} onValueChange={(v: Campaign["status"]) => setEditing({ ...editing, status: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="won">Berhasil</SelectItem>
                      <SelectItem value="lost">Belum Tercapai</SelectItem>
                      <SelectItem value="planned">Direncanakan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Jumlah Dukungan</Label>
                  <Input type="number" value={editing.supporters} onChange={(e) => setEditing({ ...editing, supporters: parseInt(e.target.value) || 0 })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Target</Label>
                  <Input type="number" value={editing.goal} onChange={(e) => setEditing({ ...editing, goal: parseInt(e.target.value) || 0 })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tanggal Mulai</Label>
                  <Input type="date" value={editing.startedAt} onChange={(e) => setEditing({ ...editing, startedAt: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Link Petisi</Label>
                <Input value={editing.petitionLink} onChange={(e) => setEditing({ ...editing, petitionLink: e.target.value })} className="rounded-xl" />
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
