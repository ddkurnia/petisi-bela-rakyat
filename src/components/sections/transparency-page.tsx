"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, FileText, Download, Calendar, Filter } from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore, formatCurrency, formatDate } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function TransparencyPage() {
  const records = useStore((s) => s.transparency);
  const reports = useStore((s) => s.reports);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const totalIncome = useMemo(
    () => records.filter((r) => r.type === "income").reduce((sum, r) => sum + r.amount, 0),
    [records]
  );
  const totalExpense = useMemo(
    () => records.filter((r) => r.type === "expense").reduce((sum, r) => sum + r.amount, 0),
    [records]
  );
  const balance = totalIncome - totalExpense;

  const filtered = filter === "all" ? records : records.filter((r) => r.type === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleExportPDF = () => {
    // Simple CSV export as PDF alternative (in real app would use jsPDF)
    const headers = ["Tanggal", "Tipe", "Kategori", "Deskripsi", "Jumlah"];
    const rows = sorted.map((r) => [
      formatDate(r.date),
      r.type === "income" ? "Pemasukan" : "Pengeluaran",
      r.category,
      r.description,
      r.amount.toString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-transparansi-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Laporan berhasil diunduh");
  };

  const stats = [
    {
      label: "Total Pemasukan",
      value: totalIncome,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      label: "Total Pengeluaran",
      value: totalExpense,
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-500/10",
    },
    {
      label: "Saldo Saat Ini",
      value: balance,
      icon: Wallet,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total Transaksi",
      value: records.length,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      isCount: true,
    },
  ];

  return (
    <div className="pt-24 md:pt-32 pb-20">
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="Transparansi"
              title="Setiap Rupiah, Terbuka untuk Anda"
              description="Kami percaya bahwa transparansi adalah fondasi kepercayaan. Setiap transaksi keuangan dan kegiatan kami dilaporkan terbuka untuk dapat diaudit publik."
            />
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 md:py-16">
        <div className="container-x">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={i} delay={i * 0.1}>
                  <Card className="p-5 md:p-7 border-0 shadow-lg shadow-foreground/5 hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className={`h-12 w-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${s.color}`} />
                    </div>
                    <div className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight">
                      {s.isCount ? s.value : formatCurrency(s.value)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reports */}
      <section className="pb-12 md:pb-16">
        <div className="container-x">
          <Reveal>
            <Card className="p-6 md:p-8 border-0 shadow-lg shadow-foreground/5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-heading text-xl md:text-2xl font-bold">Laporan Resmi</h2>
                  <p className="text-sm text-muted-foreground mt-1">Unduh laporan tahunan dan keuangan kami</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-sm truncate">{r.title}</h3>
                      <p className="text-xs text-muted-foreground">{formatDate(r.uploadedAt)}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-full shrink-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* Transactions */}
      <section className="pb-16 md:pb-24">
        <div className="container-x">
          <Card className="border-0 shadow-lg shadow-foreground/5 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl md:text-2xl font-bold">Riwayat Transaksi</h2>
                <p className="text-sm text-muted-foreground mt-1">Detail setiap pemasukan dan pengeluaran</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-secondary rounded-full p-1">
                  {(["all", "income", "expense"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        filter === f ? "bg-primary text-white" : "text-foreground/70"
                      }`}
                    >
                      {f === "all" ? "Semua" : f === "income" ? "Masuk" : "Keluar"}
                    </button>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={handleExportPDF}
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Export
                </Button>
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left p-4 font-semibold text-sm">Tanggal</th>
                    <th className="text-left p-4 font-semibold text-sm">Tipe</th>
                    <th className="text-left p-4 font-semibold text-sm">Kategori</th>
                    <th className="text-left p-4 font-semibold text-sm">Deskripsi</th>
                    <th className="text-right p-4 font-semibold text-sm">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r) => (
                    <tr key={r.id} className="border-b border-border/60 hover:bg-secondary/30 transition-colors">
                      <td className="p-4 text-sm">{formatDate(r.date)}</td>
                      <td className="p-4">
                        <Badge className={r.type === "income" ? "bg-green-500/10 text-green-600 border-0" : "bg-red-500/10 text-red-600 border-0"}>
                          {r.type === "income" ? "Masuk" : "Keluar"}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm font-medium">{r.category}</td>
                      <td className="p-4 text-sm text-muted-foreground">{r.description}</td>
                      <td className={`p-4 text-right text-sm font-bold ${r.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {r.type === "income" ? "+" : "−"} {formatCurrency(r.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {sorted.map((r) => (
                <div key={r.id} className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <Badge className={r.type === "income" ? "bg-green-500/10 text-green-600 border-0" : "bg-red-500/10 text-red-600 border-0"}>
                      {r.type === "income" ? "Masuk" : "Keluar"}
                    </Badge>
                    <span className={`text-sm font-bold ${r.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {r.type === "income" ? "+" : "−"} {formatCurrency(r.amount)}
                    </span>
                  </div>
                  <div className="font-medium text-sm">{r.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">{r.category} • {formatDate(r.date)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
