"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, MapPin, Clock, Users, Target, Phone, Mail, User,
  Wallet, Banknote, QrCode, Copy, Check, FileText, ChevronDown,
  ChevronUp, HandHeart, AlertCircle, ArrowRight, Sparkles,
} from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore, formatCurrency, formatDate, type Proposal } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ============================================================
// Helper: hitung total anggaran
// ============================================================
function calcTotal(proposal: Proposal): number {
  return (proposal.budgetItems || []).reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );
}

// ============================================================
// Helper: copy to clipboard
// ============================================================
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      toast.success(`${label} disalin ke clipboard`);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => toast.error("Gagal menyalin"));
  };
  return { copied, copy };
}

// ============================================================
// Komponen: ProposalCard
// ============================================================
function ProposalCard({ proposal }: { proposal: Proposal }) {
  const [expanded, setExpanded] = useState(false);
  const { copied, copy } = useCopy();
  const total = calcTotal(proposal);

  // Group budget items by category
  const groupedBudget = useMemo(() => {
    const groups: Record<string, typeof proposal.budgetItems> = {};
    for (const item of proposal.budgetItems || []) {
      const cat = item.category || 'Lainnya';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [proposal.budgetItems]);

  return (
    <Card className="overflow-hidden border-0 shadow-2xl shadow-foreground/10 hover:shadow-foreground/20 transition-all duration-500">
      {/* Header gradient */}
      <div className="relative bg-gradient-to-br from-primary via-red-700 to-foreground p-6 md:p-8 text-white overflow-hidden">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/5 blur-3xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-3">
            <Badge className="bg-white/20 backdrop-blur text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              Proposal
            </Badge>
            {proposal.donationDeadline && (
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Batas donasi: {formatDate(proposal.donationDeadline)}
              </Badge>
            )}
          </div>

          <h2 className="font-heading text-2xl md:text-3xl font-extrabold leading-tight mb-2">
            {proposal.title}
          </h2>
          {proposal.subtitle && (
            <p className="text-white/85 text-sm md:text-base">{proposal.subtitle}</p>
          )}

          {/* Total anggaran highlight */}
          <div className="mt-5 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/15 backdrop-blur border border-white/20">
            <Wallet className="h-5 w-5" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/70">Total Kebutuhan</div>
              <div className="font-heading text-xl font-bold">{formatCurrency(total)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Info kegiatan */}
        <div className="grid sm:grid-cols-2 gap-3">
          {proposal.activityName && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40">
              <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <div className="text-xs text-muted-foreground">Kegiatan</div>
                <div className="font-semibold">{proposal.activityName}</div>
              </div>
            </div>
          )}
          {proposal.activityDate && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40">
              <Calendar className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <div className="text-xs text-muted-foreground">Tanggal</div>
                <div className="font-semibold">{formatDate(proposal.activityDate)}</div>
              </div>
            </div>
          )}
          {proposal.activityLocation && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40">
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <div className="text-xs text-muted-foreground">Lokasi</div>
                <div className="font-semibold">{proposal.activityLocation}</div>
              </div>
            </div>
          )}
          {proposal.activityDuration && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40">
              <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <div className="text-xs text-muted-foreground">Durasi</div>
                <div className="font-semibold">{proposal.activityDuration}</div>
              </div>
            </div>
          )}
          {proposal.targetBeneficiaries && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40">
              <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <div className="text-xs text-muted-foreground">Penerima Manfaat</div>
                <div className="font-semibold">{proposal.targetBeneficiaries}</div>
              </div>
            </div>
          )}
          {proposal.organizer && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40">
              <User className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <div className="text-xs text-muted-foreground">Penyelenggara</div>
                <div className="font-semibold">{proposal.organizer}</div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {proposal.description && (
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground mb-2">
              Deskripsi
            </h4>
            <div className="prose prose-sm max-w-none text-foreground/85 leading-relaxed">
              {proposal.description.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h3 key={i} className="font-heading font-bold text-lg mt-3 mb-1">{line.replace('## ', '')}</h3>;
                if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.replace('- ', '')}</li>;
                if (line.trim()) return <p key={i}>{line}</p>;
                return null;
              })}
            </div>
          </div>
        )}

        {/* Expected outcome */}
        {proposal.expectedOutcome && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
            <h4 className="font-heading font-bold text-sm flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              Hasil yang Diharapkan
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{proposal.expectedOutcome}</p>
          </div>
        )}

        {/* Toggle expand for budget + donation */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          <span className="font-heading font-bold text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {expanded ? 'Sembunyikan' : 'Lihat'} Rincian Anggaran & Donasi
          </span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden space-y-6"
            >
              {/* Rincian anggaran */}
              <div>
                <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  Estimasi Anggaran
                </h4>
                <div className="space-y-4">
                  {Object.entries(groupedBudget).map(([category, items]) => (
                    <div key={category} className="rounded-xl border border-border overflow-hidden">
                      <div className="px-4 py-2 bg-secondary/60 font-heading font-semibold text-xs uppercase tracking-wider">
                        {category}
                      </div>
                      <div className="divide-y divide-border">
                        {items.map((item) => (
                          <div key={item.id} className="px-4 py-3 flex items-start justify-between gap-3 text-sm">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{item.description}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                              </div>
                            </div>
                            <div className="font-heading font-bold text-primary shrink-0">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Grand total */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary to-red-700 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    <span className="font-heading font-bold">Total Kebutuhan Dana</span>
                  </div>
                  <div className="font-heading text-xl font-extrabold">{formatCurrency(total)}</div>
                </div>
              </div>

              {/* Donation section */}
              <div>
                <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <HandHeart className="h-4 w-4 text-primary" />
                  Cara Donasi
                </h4>

                {/* Bank accounts */}
                {proposal.bankAccounts && proposal.bankAccounts.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {proposal.bankAccounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="p-4 rounded-2xl border-2 border-border hover:border-primary/40 transition-all bg-gradient-to-br from-background to-secondary/30"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white font-heading font-bold text-xs">
                              {acc.bankName.substring(0, 3).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-heading font-bold">{acc.bankName}</div>
                              <div className="text-xs text-muted-foreground">a.n. {acc.accountHolder}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-primary/5 text-primary">
                            <Banknote className="h-3 w-3 mr-1" />
                            Transfer
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-secondary/50">
                          <code className="font-mono font-bold text-base tracking-wider">{acc.accountNumber}</code>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full h-8 px-3"
                            onClick={() => copy(acc.accountNumber, `No. Rekening ${acc.bankName}`)}
                          >
                            {copied === `No. Rekening ${acc.bankName}` ? (
                              <><Check className="h-3 w-3 mr-1" /> Disalin</>
                            ) : (
                              <><Copy className="h-3 w-3 mr-1" /> Salin</>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* QRIS */}
                {proposal.qrisUrl && (
                  <div className="p-5 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent text-center">
                    <div className="inline-flex items-center gap-2 mb-3 text-primary">
                      <QrCode className="h-5 w-5" />
                      <span className="font-heading font-bold">Scan QRIS untuk Donasi</span>
                    </div>
                    <div className="inline-block p-4 bg-white rounded-2xl shadow-lg">
                      <img
                        src={proposal.qrisUrl}
                        alt="QRIS Donasi"
                        className="h-56 w-56 object-contain"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Scan QRIS via e-wallet apapun (GoPay, OVO, DANA, ShopeePay, dll)
                    </p>
                  </div>
                )}

                {/* Contact person */}
                {(proposal.contactPerson || proposal.contactPhone || proposal.contactEmail) && (
                  <div className="mt-4 p-4 rounded-2xl bg-secondary/40 border border-border">
                    <div className="font-heading font-bold text-sm mb-2">Konfirmasi Donasi / Hubungi:</div>
                    <div className="space-y-1 text-sm">
                      {proposal.contactPerson && (
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{proposal.contactPerson}</span>
                        </div>
                      )}
                      {proposal.contactPhone && (
                        <button
                          onClick={() => copy(proposal.contactPhone, 'No. WhatsApp')}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{proposal.contactPhone}</span>
                          {copied === 'No. WhatsApp' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                        </button>
                      )}
                      {proposal.contactEmail && (
                        <button
                          onClick={() => copy(proposal.contactEmail, 'Email')}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{proposal.contactEmail}</span>
                          {copied === 'Email' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* WhatsApp button */}
                {proposal.contactPhone && (
                  <Button
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white rounded-full"
                    onClick={() => {
                      const phone = proposal.contactPhone.replace(/[^0-9]/g, '');
                      window.open(`https://wa.me/${phone}`, '_blank');
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Konfirmasi via WhatsApp
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

// ============================================================
// Komponen utama: ProposalPage
// ============================================================
export function ProposalPage() {
  const proposals = useStore((s) => s.proposals);
  const published = proposals.filter((p) => p.status === 'published');

  return (
    <div className="pt-24 md:pt-32 pb-20">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-foreground/5" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-red-900/10 blur-3xl" />

        <div className="container-x relative">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm font-semibold mb-6">
              <HandHeart className="h-4 w-4" />
              Salurkan Donasi Terbaik
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Proposal Bantuan<br />
              <span className="bg-gradient-to-r from-primary to-red-700 bg-clip-text text-transparent">
                Kegiatan & Anggaran
              </span>
            </h1>
            <p className="mt-6 text-base md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Transparansi penuh dalam setiap kegiatan. Lihat rincian anggaran, salurkan donasi via transfer bank atau QRIS, dan jadilah bagian dari perubahan.
            </p>

            {/* Quick stats */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
              <div className="text-center">
                <div className="font-heading text-2xl md:text-3xl font-extrabold text-primary">{published.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Proposal Aktif</div>
              </div>
              <div className="text-center">
                <div className="font-heading text-2xl md:text-3xl font-extrabold text-primary">
                  {formatCurrency(published.reduce((sum, p) => sum + calcTotal(p), 0)).replace('Rp ', '')}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total Kebutuhan</div>
              </div>
              <div className="text-center">
                <div className="font-heading text-2xl md:text-3xl font-extrabold text-primary">
                  {published.reduce((sum, p) => sum + (p.bankAccounts?.length || 0), 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Opsi Donasi</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Proposal list */}
      <section className="py-12 md:py-16">
        <div className="container-x">
          {published.length === 0 ? (
            <Reveal>
              <Card className="p-12 text-center border-0 shadow-lg">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-secondary mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Belum ada proposal aktif</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Proposal bantuan kegiatan akan muncul di sini. Silakan kembali lagi nanti atau hubungi kami untuk info lebih lanjut.
                </p>
              </Card>
            </Reveal>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
              {published.map((proposal, i) => (
                <Reveal key={proposal.id} delay={i * 0.1}>
                  <ProposalCard proposal={proposal} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
