"use client";

import { useState } from "react";
import { Plus, Trash2, Save, FileText, Download } from "lucide-react";
import { useStore, type TransparencyRecord, formatCurrency, formatDate } from "@/lib/store";
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
import { toast } from "sonner";

export function TransparencyManager() {
  const records = useStore((s) => s.transparency);
  const reports = useStore((s) => s.reports);
  const addTransparency = useStore((s) => s.addTransparency);
  const deleteTransparency = useStore((s) => s.deleteTransparency);
  const addReport = useStore((s) => s.addReport);
  const deleteReport = useStore((s) => s.deleteReport);
  const [editing, setEditing] = useState<TransparencyRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ title: "", year: new Date().getFullYear(), url: "#" });

  const blank: Omit<TransparencyRecord, "id"> = {
    date: new Date().toISOString().split("T")[0], type: "income",
    category: "", description: "", amount: 0, source: "",
  };

  const save = () => {
    if (!editing) return;
    if (!editing.category || !editing.description) { toast.error("Kategori dan deskripsi wajib diisi"); return; }
    addTransparency(editing);
    setOpen(false);
  };

  const saveReport = () => {
    if (!reportForm.title) { toast.error("Judul laporan wajib diisi"); return; }
    addReport({ ...reportForm, uploadedAt: new Date().toISOString().split("T")[0] });
    setReportOpen(false);
    setReportForm({ title: "", year: new Date().getFullYear(), url: "#" });
  };

  return (
    <div className="space-y-6">
      {/* Reports section */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold">Laporan Resmi</h3>
          <Button size="sm" onClick={() => setReportOpen(true)} className="rounded-full bg-primary hover:bg-primary/90 text-white">
            <Plus className="h-4 w-4 mr-1" /> Tambah Laporan
          </Button>
        </div>
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.year}</div>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                if (confirm(`Hapus "${r.title}"?`)) { deleteReport(r.id); }
              }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {reports.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Belum ada laporan</p>
          )}
        </div>
      </Card>

      {/* Transactions */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold">Riwayat Transaksi</h3>
          <Button size="sm" onClick={() => { setEditing(blank as TransparencyRecord); setOpen(true); }} className="rounded-full bg-primary hover:bg-primary/90 text-white">
            <Plus className="h-4 w-4 mr-1" /> Tambah Transaksi
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 text-sm font-semibold">Tanggal</th>
                <th className="p-3 text-sm font-semibold">Tipe</th>
                <th className="p-3 text-sm font-semibold">Kategori</th>
                <th className="p-3 text-sm font-semibold">Jumlah</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {[...records].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="p-3 text-sm">{r.date}</td>
                  <td className="p-3">
                    <Badge className={r.type === "income" ? "bg-green-500/10 text-green-600 border-0" : "bg-red-500/10 text-red-600 border-0"}>
                      {r.type === "income" ? "Masuk" : "Keluar"}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm">{r.category}</td>
                  <td className={`p-3 text-sm font-bold ${r.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {r.type === "income" ? "+" : "−"} {formatCurrency(r.amount)}
                  </td>
                  <td className="p-3">
                    <Button size="icon" variant="ghost" className="rounded-full text-red-600 hover:bg-red-500/10" onClick={() => {
                      if (confirm("Hapus transaksi ini?")) { deleteTransparency(r.id); }
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Transaksi</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Tanggal</Label>
                  <Input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipe</Label>
                  <Select value={editing.type} onValueChange={(v: "income" | "expense") => setEditing({ ...editing, type: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Donasi, Operasional, Aksi..." className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Deskripsi</Label>
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="rounded-xl resize-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Jumlah (Rp)</Label>
                  <Input type="number" value={editing.amount} onChange={(e) => setEditing({ ...editing, amount: parseInt(e.target.value) || 0 })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Sumber (opsional)</Label>
                  <Input value={editing.source || ""} onChange={(e) => setEditing({ ...editing, source: e.target.value })} className="rounded-xl" />
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

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Laporan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Judul Laporan *</Label>
              <Input value={reportForm.title} onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Tahun</Label>
              <Input type="number" value={reportForm.year} onChange={(e) => setReportForm({ ...reportForm, year: parseInt(e.target.value) })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>URL File</Label>
              <Input value={reportForm.url} onChange={(e) => setReportForm({ ...reportForm, url: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)} className="rounded-full">Batal</Button>
            <Button onClick={saveReport} className="bg-primary hover:bg-primary/90 text-white rounded-full">
              <Save className="h-4 w-4 mr-1.5" /> Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
