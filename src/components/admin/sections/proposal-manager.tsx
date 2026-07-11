"use client";

import { useState } from "react";
import {
  Plus, Pencil, Trash2, Save, X, FileText, Banknote, QrCode,
  Wallet, Calendar, User, Phone, Mail, MapPin, Clock, Target, Users,
} from "lucide-react";
import { useStore, type Proposal, type BudgetItem, type BankAccount } from "@/lib/store";
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

const generateId = () => Math.random().toString(36).substring(2, 11);

export function ProposalManager() {
  const proposals = useStore((s) => s.proposals);
  const addProposal = useStore((s) => s.addProposal);
  const updateProposal = useStore((s) => s.updateProposal);
  const deleteProposal = useStore((s) => s.deleteProposal);
  const [editing, setEditing] = useState<Proposal | null>(null);
  const [open, setOpen] = useState(false);

  const blank: Omit<Proposal, "id"> = {
    title: "", subtitle: "", description: "",
    organizer: "", contactPerson: "", contactPhone: "", contactEmail: "",
    activityName: "", activityDate: "", activityLocation: "",
    activityDuration: "", targetBeneficiaries: "", expectedOutcome: "",
    budgetItems: [], currency: "IDR",
    bankAccounts: [], qrisUrl: "", donationDeadline: "",
    status: "draft",
  };

  const openNew = () => {
    setEditing(blank as Proposal);
    setOpen(true);
  };

  const openEdit = (p: Proposal) => {
    setEditing({ ...p });
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title) { toast.error("Judul proposal wajib diisi"); return; }
    if (editing.id) {
      updateProposal(editing.id, editing);
    } else {
      addProposal(editing);
    }
    setOpen(false);
  };

  // Budget item handlers
  const addBudgetItem = () => {
    if (!editing) return;
    const newItem: BudgetItem = {
      id: generateId(),
      category: "", description: "", quantity: 1, unit: "unit", unitPrice: 0,
    };
    setEditing({ ...editing, budgetItems: [...(editing.budgetItems || []), newItem] });
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    if (!editing) return;
    setEditing({
      ...editing,
      budgetItems: (editing.budgetItems || []).map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const deleteBudgetItem = (id: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      budgetItems: (editing.budgetItems || []).filter((item) => item.id !== id),
    });
  };

  // Bank account handlers
  const addBankAccount = () => {
    if (!editing) return;
    const newAcc: BankAccount = {
      id: generateId(),
      bankName: "", accountNumber: "", accountHolder: "",
    };
    setEditing({ ...editing, bankAccounts: [...(editing.bankAccounts || []), newAcc] });
  };

  const updateBankAccount = (id: string, updates: Partial<BankAccount>) => {
    if (!editing) return;
    setEditing({
      ...editing,
      bankAccounts: (editing.bankAccounts || []).map((acc) =>
        acc.id === id ? { ...acc, ...updates } : acc
      ),
    });
  };

  const deleteBankAccount = (id: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      bankAccounts: (editing.bankAccounts || []).filter((acc) => acc.id !== id),
    });
  };

  // Calculate total
  const total = editing ? (editing.budgetItems || []).reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0
  ) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">
          {proposals.length} proposal total • {proposals.filter((p) => p.status === 'published').length} published
        </p>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1.5" />
          Buat Proposal
        </Button>
      </div>

      {/* List */}
      <div className="grid md:grid-cols-2 gap-4">
        {proposals.map((p) => {
          const pTotal = (p.budgetItems || []).reduce(
            (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0
          );
          return (
            <Card key={p.id} className="p-5 border-0 shadow-lg shadow-foreground/5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={
                      p.status === 'published' ? "border-green-500/30 text-green-600 text-xs"
                      : p.status === 'completed' ? "border-blue-500/30 text-blue-600 text-xs"
                      : p.status === 'cancelled' ? "border-red-500/30 text-red-600 text-xs"
                      : "text-xs"
                    }>
                      {p.status}
                    </Badge>
                  </div>
                  <h3 className="font-heading font-bold text-sm line-clamp-2">{p.title}</h3>
                  {p.subtitle && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.subtitle}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="rounded-full h-8 w-8" onClick={() => openEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full h-8 w-8 text-red-600 hover:bg-red-500/10"
                    onClick={() => { if (confirm(`Hapus proposal "${p.title}"?`)) deleteProposal(p.id); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Wallet className="h-3 w-3" />
                  Rp {pTotal.toLocaleString('id-ID')}
                </span>
                <span>•</span>
                <span>{(p.budgetItems || []).length} item anggaran</span>
                <span>•</span>
                <span>{(p.bankAccounts || []).length} rekening</span>
                {p.qrisUrl && (<><span>•</span><span className="text-green-600 flex items-center gap-1"><QrCode className="h-3 w-3" /> QRIS</span></>)}
              </div>
            </Card>
          );
        })}
      </div>

      {proposals.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground border-0">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Belum ada proposal. Klik "Buat Proposal" untuk mulai.</p>
        </Card>
      )}

      {/* Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Buat"} Proposal</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-6">
              {/* ===== Bagian 1: Info Dasar ===== */}
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-sm flex items-center gap-2 text-primary">
                  <FileText className="h-4 w-4" />
                  Informasi Dasar
                </h3>
                <div className="space-y-1.5">
                  <Label>Judul Proposal *</Label>
                  <Input
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    placeholder="mis. Bantuan Pendidikan Anak Yatim 2026"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Sub Judul</Label>
                  <Input
                    value={editing.subtitle}
                    onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                    placeholder="ringkasan singkat proposal"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Deskripsi Lengkap</Label>
                  <Textarea
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    placeholder="Jelaskan proposal secara detail. Gunakan ## untuk heading, - untuk list."
                    rows={5}
                    className="rounded-xl resize-y"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={editing.status} onValueChange={(v: any) => setEditing({ ...editing, status: v })}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Batas Donasi</Label>
                    <Input
                      type="date"
                      value={editing.donationDeadline?.split('T')[0] || ""}
                      onChange={(e) => setEditing({ ...editing, donationDeadline: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* ===== Bagian 2: Kegiatan ===== */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-heading font-bold text-sm flex items-center gap-2 text-primary">
                  <Target className="h-4 w-4" />
                  Detail Kegiatan
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nama Kegiatan</Label>
                    <Input
                      value={editing.activityName}
                      onChange={(e) => setEditing({ ...editing, activityName: e.target.value })}
                      placeholder="mis. Santunan Anak Yatim"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tanggal Kegiatan</Label>
                    <Input
                      type="date"
                      value={editing.activityDate?.split('T')[0] || ""}
                      onChange={(e) => setEditing({ ...editing, activityDate: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Lokasi</Label>
                    <Input
                      value={editing.activityLocation}
                      onChange={(e) => setEditing({ ...editing, activityLocation: e.target.value })}
                      placeholder="mis. Aula PBR, Riau"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Durasi</Label>
                    <Input
                      value={editing.activityDuration}
                      onChange={(e) => setEditing({ ...editing, activityDuration: e.target.value })}
                      placeholder="mis. 3 hari"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Penerima Manfaat</Label>
                    <Input
                      value={editing.targetBeneficiaries}
                      onChange={(e) => setEditing({ ...editing, targetBeneficiaries: e.target.value })}
                      placeholder="mis. 50 anak yatim"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Penyelenggara / PJ</Label>
                    <Input
                      value={editing.organizer}
                      onChange={(e) => setEditing({ ...editing, organizer: e.target.value })}
                      placeholder="nama penyelenggara"
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Hasil yang Diharapkan</Label>
                  <Textarea
                    value={editing.expectedOutcome}
                    onChange={(e) => setEditing({ ...editing, expectedOutcome: e.target.value })}
                    placeholder="mis. 50 anak yatim mendapat bantuan pendidikan..."
                    rows={2}
                    className="rounded-xl resize-none"
                  />
                </div>
              </div>

              {/* ===== Bagian 3: Anggaran ===== */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm flex items-center gap-2 text-primary">
                    <Wallet className="h-4 w-4" />
                    Estimasi Anggaran
                  </h3>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={addBudgetItem}>
                    <Plus className="h-3 w-3 mr-1" /> Tambah Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {(editing.budgetItems || []).map((item) => (
                    <div key={item.id} className="p-3 rounded-xl border border-border space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={item.category}
                          onChange={(e) => updateBudgetItem(item.id, { category: e.target.value })}
                          placeholder="Kategori (mis. Konsumsi)"
                          className="rounded-lg h-8 text-sm"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full h-8 w-8 text-red-600 hover:bg-red-500/10 shrink-0"
                          onClick={() => deleteBudgetItem(item.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Input
                        value={item.description}
                        onChange={(e) => updateBudgetItem(item.id, { description: e.target.value })}
                        placeholder="Deskripsi item (mis. Nasi kotak)"
                        className="rounded-lg h-8 text-sm"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateBudgetItem(item.id, { quantity: Number(e.target.value) })}
                          placeholder="Qty"
                          className="rounded-lg h-8 text-sm"
                        />
                        <Input
                          value={item.unit}
                          onChange={(e) => updateBudgetItem(item.id, { unit: e.target.value })}
                          placeholder="Unit (mis. pack)"
                          className="rounded-lg h-8 text-sm"
                        />
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateBudgetItem(item.id, { unitPrice: Number(e.target.value) })}
                          placeholder="Harga/unit"
                          className="rounded-lg h-8 text-sm"
                        />
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        Subtotal: <span className="font-bold text-primary">Rp {(item.quantity * item.unitPrice).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                  {(editing.budgetItems || []).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Belum ada item anggaran.</p>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                  <span className="font-heading font-bold text-sm">Total Keseluruhan</span>
                  <span className="font-heading font-extrabold text-primary text-lg">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* ===== Bagian 4: Donasi ===== */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm flex items-center gap-2 text-primary">
                    <Banknote className="h-4 w-4" />
                    Rekening Donasi
                  </h3>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={addBankAccount}>
                    <Plus className="h-3 w-3 mr-1" /> Tambah Rekening
                  </Button>
                </div>
                <div className="space-y-2">
                  {(editing.bankAccounts || []).map((acc) => (
                    <div key={acc.id} className="p-3 rounded-xl border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <Input
                          value={acc.bankName}
                          onChange={(e) => updateBankAccount(acc.id, { bankName: e.target.value })}
                          placeholder="Nama Bank (mis. BCA)"
                          className="rounded-lg h-8 text-sm"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full h-8 w-8 text-red-600 hover:bg-red-500/10 shrink-0"
                          onClick={() => deleteBankAccount(acc.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Input
                        value={acc.accountNumber}
                        onChange={(e) => updateBankAccount(acc.id, { accountNumber: e.target.value })}
                        placeholder="Nomor Rekening"
                        className="rounded-lg h-8 text-sm font-mono"
                      />
                      <Input
                        value={acc.accountHolder}
                        onChange={(e) => updateBankAccount(acc.id, { accountHolder: e.target.value })}
                        placeholder="Atas Nama"
                        className="rounded-lg h-8 text-sm"
                      />
                    </div>
                  ))}
                  {(editing.bankAccounts || []).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Belum ada rekening.</p>
                  )}
                </div>

                {/* QRIS */}
                <div className="pt-2">
                  <Label className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                    <QrCode className="h-4 w-4" />
                    Gambar QRIS (opsional)
                  </Label>
                  <ImageUpload
                    label="Upload QRIS"
                    value={editing.qrisUrl || ""}
                    onChange={(url) => setEditing({ ...editing, qrisUrl: url })}
                    aspectRatio="square"
                  />
                </div>
              </div>

              {/* ===== Bagian 5: Kontak ===== */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-heading font-bold text-sm flex items-center gap-2 text-primary">
                  <User className="h-4 w-4" />
                  Kontak untuk Konfirmasi Donasi
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nama Kontak</Label>
                    <Input
                      value={editing.contactPerson}
                      onChange={(e) => setEditing({ ...editing, contactPerson: e.target.value })}
                      placeholder="mis. Budi (Bendahara)"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>No. WhatsApp</Label>
                    <Input
                      value={editing.contactPhone}
                      onChange={(e) => setEditing({ ...editing, contactPhone: e.target.value })}
                      placeholder="+62 812-xxxx-xxxx"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editing.contactEmail}
                      onChange={(e) => setEditing({ ...editing, contactEmail: e.target.value })}
                      placeholder="email@belarakyat.org"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Batal</Button>
            <Button onClick={save} className="bg-primary hover:bg-primary/90 text-white rounded-full">
              <Save className="h-4 w-4 mr-1.5" /> Simpan Proposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
