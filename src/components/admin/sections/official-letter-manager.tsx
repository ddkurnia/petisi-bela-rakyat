"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Send, FileText, Plus, Trash2, Edit, Eye, Search,
  Building2, Users, Clock, CheckCircle2, XCircle, AlertCircle,
  Save, Upload, X, ChevronLeft, Filter, Download, Star,
} from "lucide-react";
import { useStore } from "@/lib/store";
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
import { RichTextEditor } from "../rich-text-editor";
import { getCurrentFirebaseUser } from "@/lib/firebase/auth";
import { toast } from "sonner";

// ============================================================
// Types & constants
// ============================================================
interface Letter {
  id?: string;
  letterNumber: string;
  institution: string;
  recipientName: string;
  recipientEmail: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  content: string;
  attachments: any[];
  priority: string;
  templateType: string;
  status: string;
  opened: boolean;
  replied: boolean;
  createdAt?: string;
  sentAt?: string;
}

interface Institution {
  id?: string;
  name: string;
  email: string;
  website?: string;
  phone?: string;
  address?: string;
  category: string;
}

const TEMPLATES = [
  { type: 'permohonan', label: 'Permohonan', content: '<h2>Permohonan</h2><p>Dengan hormat,</p><p>Sehubungan dengan ...</p>' },
  { type: 'pengaduan', label: 'Pengaduan', content: '<h2>Pengaduan</h2><p>Dengan hormat,</p><p>Bersama ini kami sampaikan pengaduan terkait ...</p>' },
  { type: 'audiensi', label: 'Audiensi', content: '<h2>Permohonan Audiensi</h2><p>Dengan hormat,</p><p>Kami bermaksud memohon kesempatan audiensi ...</p>' },
  { type: 'petisi', label: 'Petisi', content: '<h2>Petisi</h2><p>Dengan hormat,</p><p>Bersama ini kami menyampaikan petisi ...</p>' },
  { type: 'keberatan', label: 'Keberatan', content: '<h2>Surat Keberatan</h2><p>Dengan hormat,</p><p>Kami menyampaikan keberatan atas ...</p>' },
  { type: 'klarifikasi', label: 'Klarifikasi', content: '<h2>Permohonan Klarifikasi</h2><p>Dengan hormat,</p><p>Kami memohon klarifikasi terkait ...</p>' },
  { type: 'permintaan_informasi', label: 'Permintaan Informasi', content: '<h2>Permintaan Informasi</h2><p>Dengan hormat,</p><p>Sesuai UU KIP, kami meminta informasi ...</p>' },
  { type: 'lainnya', label: 'Lainnya', content: '<h2>Surat</h2><p>Dengan hormat,</p><p>...</p>' },
];

const PRIORITIES = [
  { value: 'normal', label: 'Biasa', color: 'bg-blue-500/10 text-blue-600' },
  { value: 'important', label: 'Penting', color: 'bg-amber-500/10 text-amber-600' },
  { value: 'urgent', label: 'Sangat Penting', color: 'bg-red-500/10 text-red-600' },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
  sent: { label: 'Terkirim', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  failed: { label: 'Gagal', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  opened: { label: 'Dibuka', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  replied: { label: 'Dibalas', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
};

const INSTITUTION_CATEGORIES = [
  { value: 'dpr', label: 'DPR RI' },
  { value: 'presiden', label: 'Presiden RI' },
  { value: 'kementerian', label: 'Kementerian' },
  { value: 'gubernur', label: 'Gubernur' },
  { value: 'bupati', label: 'Bupati/Wali Kota' },
  { value: 'ombudsman', label: 'Ombudsman RI' },
  { value: 'komnas', label: 'Komnas HAM' },
  { value: 'bumn', label: 'BUMN' },
  { value: 'lainnya', label: 'Lainnya' },
];

// ============================================================
// Main Component
// ============================================================
type Tab = 'dashboard' | 'compose' | 'history' | 'contacts';

export function OfficialLetterManager() {
  const currentUser = useStore((s) => s.currentUser);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [letters, setLetters] = useState<Letter[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [editingLetter, setEditingLetter] = useState<Partial<Letter> | null>(null);

  const fetchData = useCallback(async () => {
    const fbUser = getCurrentFirebaseUser();
    if (!fbUser) return;
    try {
      const token = await fbUser.getIdToken();
      const [lettersRes, instRes] = await Promise.all([
        fetch(`/api/official-letters?search=${search}&status=${statusFilter}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
        fetch('/api/institutions', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
      ]);
      const lettersData = await lettersRes.json();
      const instData = await instRes.json();
      if (lettersData.ok) setLetters(lettersData.letters || []);
      if (instData.ok) setInstitutions(instData.institutions || []);
    } catch (e) { console.error('fetch error', e); }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Stats
  const stats = {
    total: letters.length,
    sent: letters.filter((l) => l.status === 'sent' || l.status === 'opened' || l.status === 'replied').length,
    draft: letters.filter((l) => l.status === 'draft').length,
    failed: letters.filter((l) => l.status === 'failed').length,
    opened: letters.filter((l) => l.status === 'opened' || l.opened).length,
    replied: letters.filter((l) => l.status === 'replied' || l.replied).length,
  };

  const handleSend = async (letterData: any, action: 'draft' | 'send') => {
    const fbUser = getCurrentFirebaseUser();
    if (!fbUser) { toast.error('Sesi berakhir'); return; }
    const token = await fbUser.getIdToken();
    try {
      const res = await fetch('/api/official-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        cache: 'no-store',
        body: JSON.stringify({ action, letterData }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(action === 'send' ? `Surat ${data.letterNumber} berhasil dikirim!` : `Draft ${data.letterNumber} tersimpan`);
        setShowCompose(false);
        setEditingLetter(null);
        fetchData();
      } else {
        toast.error(data.error || 'Gagal');
      }
    } catch { toast.error('Gagal'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus surat ini?')) return;
    const fbUser = getCurrentFirebaseUser();
    if (!fbUser) return;
    const token = await fbUser.getIdToken();
    await fetch(`/api/official-letters?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    toast.success('Surat dihapus');
    await fetchData();
  };

  const handleAddInstitution = async (inst: any) => {
    const fbUser = getCurrentFirebaseUser();
    if (!fbUser) { toast.error('Sesi berakhir'); return; }
    const token = await fbUser.getIdToken();
    try {
      const res = await fetch('/api/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        cache: 'no-store',
        body: JSON.stringify(inst),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('Instansi ditambahkan');
        // Small delay to allow Firestore consistency
        await new Promise((r) => setTimeout(r, 500));
        await fetchData();
      } else {
        toast.error(data.error || 'Gagal menambahkan instansi');
      }
    } catch (e) {
      console.error('add institution error', e);
      toast.error('Gagal menambahkan instansi');
    }
  };

  const handleDeleteInstitution = async (id: string) => {
    const fbUser = getCurrentFirebaseUser();
    if (!fbUser) return;
    const token = await fbUser.getIdToken();
    await fetch(`/api/institutions?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    toast.success('Instansi dihapus');
    await new Promise((r) => setTimeout(r, 300));
    await fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Header + Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold">Surat Resmi</h3>
            <p className="text-xs text-muted-foreground">Kirim surat resmi ke instansi pemerintah</p>
          </div>
        </div>
        <Button onClick={() => { setEditingLetter(null); setShowCompose(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1" /> Buat Surat
        </Button>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/40 w-full sm:w-auto">
        {([
          { id: 'dashboard', label: 'Dashboard', icon: FileText },
          { id: 'history', label: 'Riwayat', icon: Clock },
          { id: 'contacts', label: 'Kontak Instansi', icon: Building2 },
        ] as { id: Tab; label: string; icon: any }[]).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dashboard tab */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'Total Surat', value: stats.total, icon: FileText, color: 'bg-blue-500/10 text-blue-600' },
              { label: 'Terkirim', value: stats.sent, icon: Send, color: 'bg-green-500/10 text-green-600' },
              { label: 'Draft', value: stats.draft, icon: Save, color: 'bg-gray-500/10 text-gray-600' },
              { label: 'Gagal', value: stats.failed, icon: XCircle, color: 'bg-red-500/10 text-red-600' },
              { label: 'Dibuka', value: stats.opened, icon: Eye, color: 'bg-purple-500/10 text-purple-600' },
              { label: 'Dibalas', value: stats.replied, icon: CheckCircle2, color: 'bg-amber-500/10 text-amber-600' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <Card key={i} className="p-4 border-0 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-heading text-2xl font-extrabold">{s.value}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Recent letters */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h4 className="font-heading font-bold text-sm">Surat Terbaru</h4>
              <Button variant="ghost" size="sm" onClick={() => setTab('history')} className="text-xs">Lihat Semua</Button>
            </div>
            <div className="divide-y divide-border">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Memuat...</div>
              ) : letters.slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold text-primary">{l.letterNumber}</span>
                      <Badge variant="outline" className={`text-[10px] ${STATUS_MAP[l.status]?.color}`}>{STATUS_MAP[l.status]?.label || l.status}</Badge>
                    </div>
                    <div className="text-sm font-semibold truncate">{l.subject}</div>
                    <div className="text-xs text-muted-foreground truncate">{l.institution} — {l.recipientName}</div>
                  </div>
                  <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 shrink-0" onClick={() => setSelectedLetter(l)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {!loading && letters.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">Belum ada surat. Klik "Buat Surat" untuk mulai.</div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="space-y-4">
          {/* Search + filter */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor, instansi, perihal..."
                className="pl-10 rounded-xl"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Terkirim</SelectItem>
                <SelectItem value="failed">Gagal</SelectItem>
                <SelectItem value="opened">Dibuka</SelectItem>
                <SelectItem value="replied">Dibalas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Nomor</th>
                    <th className="px-4 py-3">Instansi</th>
                    <th className="px-4 py-3 hidden md:table-cell">Perihal</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Tanggal</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Memuat...</td></tr>
                  ) : letters.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Tidak ada surat.</td></tr>
                  ) : letters.map((l) => (
                    <tr key={l.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{l.letterNumber}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-xs">{l.institution}</div>
                        <div className="text-[10px] text-muted-foreground">{l.recipientName}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell max-w-[200px] truncate text-xs">{l.subject}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-[10px] ${STATUS_MAP[l.status]?.color}`}>{STATUS_MAP[l.status]?.label}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                        {l.sentAt ? new Date(l.sentAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => setSelectedLetter(l)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-red-600 hover:bg-red-500/10" onClick={() => handleDelete(l.id!)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Contacts tab */}
      {tab === 'contacts' && (
        <InstitutionManager
          institutions={institutions}
          onAdd={handleAddInstitution}
          onDelete={handleDeleteInstitution}
        />
      )}

      {/* Compose dialog */}
      <ComposeDialog
        open={showCompose}
        onOpenChange={setShowCompose}
        institutions={institutions}
        editingLetter={editingLetter}
        onSend={handleSend}
      />

      {/* Detail dialog */}
      <Dialog open={!!selectedLetter} onOpenChange={(v) => !v && setSelectedLetter(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono text-sm text-primary">{selectedLetter?.letterNumber}</span>
              <Badge variant="outline" className={`text-xs ${STATUS_MAP[selectedLetter?.status || '']?.color}`}>
                {STATUS_MAP[selectedLetter?.status || '']?.label}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedLetter && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Instansi:</span> <strong>{selectedLetter.institution}</strong></div>
                <div><span className="text-muted-foreground">Penerima:</span> <strong>{selectedLetter.recipientName}</strong></div>
                <div><span className="text-muted-foreground">Email:</span> {selectedLetter.recipientEmail}</div>
                <div><span className="text-muted-foreground">Prioritas:</span> {PRIORITIES.find(p => p.value === selectedLetter.priority)?.label}</div>
                <div className="sm:col-span-2"><span className="text-muted-foreground">Perihal:</span> <strong>{selectedLetter.subject}</strong></div>
                <div><span className="text-muted-foreground">Dibuat:</span> {selectedLetter.createdAt ? new Date(selectedLetter.createdAt).toLocaleString('id-ID') : '-'}</div>
                <div><span className="text-muted-foreground">Dikirim:</span> {selectedLetter.sentAt ? new Date(selectedLetter.sentAt).toLocaleString('id-ID') : '-'}</div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                <h4 className="font-heading font-bold text-sm mb-2">Isi Surat:</h4>
                <div className="prose-pbr max-w-none text-sm" dangerouslySetInnerHTML={{ __html: selectedLetter.content }} />
              </div>
              {selectedLetter.attachments?.length > 0 && (
                <div>
                  <h4 className="font-heading font-bold text-sm mb-2">Lampiran:</h4>
                  <div className="space-y-2">
                    {selectedLetter.attachments.map((att: any, i: number) => (
                      <a key={i} href={att.url} target="_blank" className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors text-sm">
                        <FileText className="h-4 w-4 text-primary" />
                        {att.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// Compose Dialog
// ============================================================
function ComposeDialog({ open, onOpenChange, institutions, editingLetter, onSend }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  institutions: Institution[];
  editingLetter: Partial<Letter> | null;
  onSend: (data: any, action: 'draft' | 'send') => void;
}) {
  const [form, setForm] = useState<any>({
    institution: '', recipientName: '', recipientEmail: '',
    cc: '', bcc: '', subject: '', content: '', attachments: [],
    priority: 'normal', templateType: 'lainnya',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingLetter) {
      setForm({
        ...editingLetter,
        cc: Array.isArray(editingLetter.cc) ? editingLetter.cc.join(', ') : '',
        bcc: Array.isArray(editingLetter.bcc) ? editingLetter.bcc.join(', ') : '',
      });
    } else {
      setForm({ institution: '', recipientName: '', recipientEmail: '', cc: '', bcc: '', subject: '', content: '', attachments: [], priority: 'normal', templateType: 'lainnya' });
    }
  }, [editingLetter, open]);

  const applyTemplate = (type: string) => {
    const template = TEMPLATES.find((t) => t.type === type);
    if (template) {
      setForm({ ...form, templateType: type, content: template.content });
    }
  };

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    const fbUser = getCurrentFirebaseUser();
    if (!fbUser) return;
    const token = await fbUser.getIdToken();
    const newAttachments = [...(form.attachments || [])];
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'letters');
        const res = await fetch('/api/cloudinary-upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
        const data = await res.json();
        if (data.url) newAttachments.push({ name: file.name, url: data.url, size: file.size, type: file.type });
      } catch (e) { console.error('upload error', e); }
    }
    setForm({ ...form, attachments: newAttachments });
    setUploading(false);
    toast.success(`${newAttachments.length} lampiran`);
  };

  const submit = (action: 'draft' | 'send') => {
    if (!form.institution || !form.recipientEmail || !form.subject) {
      toast.error('Instansi, Email, dan Perihal wajib diisi');
      return;
    }
    if (action === 'send' && !confirm('Kirim surat sekarang? Pastikan semua data sudah benar.')) return;
    onSend({
      ...form,
      cc: form.cc ? form.cc.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      bcc: form.bcc ? form.bcc.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    }, action);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingLetter ? 'Edit' : 'Buat'} Surat Resmi</DialogTitle>
        </DialogHeader>

        {showPreview ? (
          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-secondary/30 border border-border">
              <div className="text-center mb-4 pb-4 border-b border-border">
                <h2 className="font-heading text-xl font-extrabold">PETISI BELA RAKYAT</h2>
                <p className="text-xs text-muted-foreground mt-1">{form.institution}</p>
              </div>
              <div className="text-sm space-y-2">
                <p><strong>Nomor:</strong> Auto-generated</p>
                <p><strong>Kepada:</strong> {form.recipientName} ({form.recipientEmail})</p>
                <p><strong>Perihal:</strong> {form.subject}</p>
              </div>
              <div className="mt-4 prose-pbr max-w-none" dangerouslySetInnerHTML={{ __html: form.content }} />
            </div>
            <Button variant="outline" className="rounded-full" onClick={() => setShowPreview(false)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Kembali Edit
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Template selector */}
            <div className="space-y-2">
              <Label className="text-xs">Template Surat</Label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => applyTemplate(t.type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      form.templateType === t.type ? 'bg-primary text-white' : 'bg-secondary text-foreground hover:bg-secondary/70'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Institution select */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Instansi *</Label>
                <Select
                  value={form.institution}
                  onValueChange={(v) => {
                    const inst = institutions.find((i) => i.name === v);
                    setForm({ ...form, institution: v, recipientEmail: inst?.email || form.recipientEmail });
                  }}
                >
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Pilih instansi" /></SelectTrigger>
                  <SelectContent>
                    {institutions.map((inst) => (
                      <SelectItem key={inst.id} value={inst.name}>{inst.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nama Penerima *</Label>
                <Input value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} placeholder="Bpk/Ibu ..." className="rounded-xl" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Email Tujuan *</Label>
                <Input type="email" value={form.recipientEmail} onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })} placeholder="email@instansi.go.id" className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Prioritas</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">CC (opsional, pisahkan dengan koma)</Label>
                <Input value={form.cc} onChange={(e) => setForm({ ...form, cc: e.target.value })} placeholder="email1@x.com, email2@y.com" className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">BCC (opsional)</Label>
                <Input value={form.bcc} onChange={(e) => setForm({ ...form, bcc: e.target.value })} placeholder="bcc@x.com" className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Perihal *</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Perihal surat" className="rounded-xl" />
            </div>

            {/* Rich Text Editor */}
            <RichTextEditor
              label="Isi Surat"
              value={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
              placeholder="Tulis isi surat di sini..."
              minHeight={300}
            />

            {/* Attachments */}
            <div className="space-y-2">
              <Label className="text-xs">Lampiran (PDF, DOCX, JPG, PNG)</Label>
              <div className="flex flex-wrap gap-2">
                {form.attachments?.map((att: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/40 text-xs">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate max-w-[150px]">{att.name}</span>
                    <button onClick={() => setForm({ ...form, attachments: form.attachments.filter((_: any, idx: number) => idx !== i) })}>
                      <X className="h-3 w-3 text-red-500" />
                    </button>
                  </div>
                ))}
                <label className="cursor-pointer">
                  <input type="file" multiple accept=".pdf,.docx,.jpg,.jpeg,.png" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files)} />
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-dashed border-border hover:border-primary/50 text-xs cursor-pointer">
                    {uploading ? 'Uploading...' : <><Upload className="h-3.5 w-3.5" /> Upload</>}
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-1" /> {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => submit('draft')}>
            <Save className="h-4 w-4 mr-1" /> Simpan Draft
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full" onClick={() => submit('send')}>
            <Send className="h-4 w-4 mr-1" /> Kirim Surat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Institution Manager (Contacts tab)
// ============================================================
function InstitutionManager({ institutions, onAdd, onDelete }: {
  institutions: Institution[];
  onAdd: (inst: any) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Institution>({ name: '', email: '', website: '', phone: '', address: '', category: 'lainnya' });
  const [filter, setFilter] = useState('all');

  const [saving, setSaving] = useState(false);

  const filtered = filter === 'all' ? institutions : institutions.filter((i) => i.category === filter);

  const save = async () => {
    if (!form.name || !form.email) { toast.error('Nama dan email wajib'); return; }
    if (saving) return;
    setSaving(true);
    try {
      await onAdd(form);
      setForm({ name: '', email: '', website: '', phone: '', address: '', category: 'lainnya' });
      setShowForm(false);
    } catch (e) {
      console.error('save institution error', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder="Kategori" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {INSTITUTION_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-1" /> Tambah Instansi
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((inst) => (
          <Card key={inst.id} className="p-4 border-0 shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-bold text-sm truncate">{inst.name}</h4>
                <Badge variant="outline" className="text-[10px] mt-1">
                  {INSTITUTION_CATEGORIES.find((c) => c.value === inst.category)?.label || inst.category}
                </Badge>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p className="truncate">{inst.email}</p>
                  {inst.phone && <p>{inst.phone}</p>}
                  {inst.website && <a href={inst.website} target="_blank" className="text-primary hover:underline truncate block">{inst.website}</a>}
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-red-600 hover:bg-red-500/10 shrink-0" onClick={() => onDelete(inst.id!)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
            Belum ada instansi. Klik "Tambah Instansi" untuk mulai.
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Tambah Instansi</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Instansi *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="DPR RI" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@dpr.go.id" className="rounded-xl" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Kategori</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INSTITUTION_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Telepon</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="021-xxx" className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Website</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Alamat</Label>
              <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="rounded-xl resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setShowForm(false)}>Batal</Button>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full" onClick={save} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
