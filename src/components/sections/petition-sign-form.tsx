"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenLine, MapPin, Loader2, CheckCircle2, Users, Clock,
  AlertCircle, Navigation, Heart, Share2, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/animation";
import { usePetitionSignatures, useGeolocation } from "@/hooks/use-petition";
import { toast } from "sonner";

const PROVINCES = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau',
  'Jambi', 'Sumatera Selatan', 'Bangka Belitung', 'Bengkulu', 'Lampung',
  'DKI Jakarta', 'Jawa Barat', 'Banten', 'Jawa Tengah', 'DI Yogyakarta',
  'Jawa Timur', 'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan',
  'Kalimantan Timur', 'Kalimantan Utara', 'Sulawesi Utara', 'Gorontalo',
  'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara',
  'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat', 'Papua Selatan',
  'Papua Tengah', 'Papua Pegunungan', 'Papua Barat Daya',
];

interface PetitionSignFormProps {
  campaignId: string;
  campaignTitle: string;
  goal?: number; // target signatures
}

export function PetitionSignForm({ campaignId, campaignTitle, goal = 1000 }: PetitionSignFormProps) {
  const { signatures, count, loading, hasSigned, sign } = usePetitionSignatures(campaignId);
  const { location, getLocation } = useGeolocation();

  const [form, setForm] = useState({
    name: '', email: '', address: '', city: '', province: '', comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const progress = goal > 0 ? Math.min((count / goal) * 100, 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.name.trim() || !form.email.trim() || !form.address.trim() || !form.city.trim() || !form.province) {
      toast.error("Lengkapi semua field wajib");
      return;
    }

    setSubmitting(true);
    try {
      const result = await sign({
        campaignId,
        name: form.name,
        email: form.email,
        address: form.address,
        city: form.city,
        province: form.province,
        latitude: location.latitude || null,
        longitude: location.longitude || null,
        locationLabel: location.label || '',
        comment: form.comment,
      });

      if (result.ok) {
        setShowSuccess(true);
        toast.success("Tanda tangan berhasil! Terima kasih atas dukungan Anda 🙏");
        setForm({ name: '', email: '', address: '', city: '', province: '', comment: '' });
      } else {
        if (result.code === 'ALREADY_SIGNED_DEVICE' || result.code === 'ALREADY_SIGNED_EMAIL') {
          toast.error("Anda sudah menandatangani petisi ini");
        } else if (result.code === 'IP_LIMIT_REACHED') {
          toast.error("Batas tanda tangan dari jaringan ini tercapai");
        } else {
          toast.error(result.error || "Gagal mengirim tanda tangan");
        }
      }
    } catch (err) {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      navigator.share({
        title: campaignTitle,
        text: `Tandatangani petisi: ${campaignTitle}`,
        url,
      }).catch(() => {
        navigator.clipboard.writeText(url);
        toast.success("Link disalin ke clipboard");
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link disalin ke clipboard");
    }
  };

  // ============================================================
  // Success state
  // ============================================================
  if (showSuccess) {
    return (
      <Reveal>
        <Card className="p-8 md:p-10 border-0 shadow-2xl text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-500 mb-5"
          >
            <CheckCircle2 className="h-10 w-10 text-white" />
          </motion.div>
          <h3 className="font-heading text-2xl md:text-3xl font-extrabold mb-2">
            Terima Kasih! 🎉
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Tanda tangan Anda berhasil tercatat. Setiap suara berarti untuk perubahan.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={handleShare}
              className="bg-primary hover:bg-primary/90 text-white rounded-full"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Ajak Teman Tanda Tangani
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setShowSuccess(false)}
            >
              Lihat Tanda Tangan Lain
            </Button>
          </div>
        </Card>
      </Reveal>
    );
  }

  // ============================================================
  // Already signed state
  // ============================================================
  if (hasSigned) {
    return (
      <Reveal>
        <Card className="p-6 md:p-8 border-0 shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-green-500 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">Anda Sudah Menandatangani</h3>
              <p className="text-xs text-muted-foreground">Terima kasih atas dukungan Anda!</p>
            </div>
          </div>
          <Button onClick={handleShare} variant="outline" className="rounded-full w-full">
            <Share2 className="h-4 w-4 mr-2" />
            Ajak Teman Tanda Tangani
          </Button>
        </Card>
      </Reveal>
    );
  }

  // ============================================================
  // Sign form
  // ============================================================
  return (
    <div className="space-y-6">
      {/* Progress card */}
      <Reveal>
        <Card className="overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-primary to-red-700 p-6 text-white">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-white/70 mb-1">Tanda Tangan</div>
                <div className="font-heading text-3xl font-extrabold">
                  {loading ? '...' : count.toLocaleString('id-ID')}
                </div>
                <div className="text-xs text-white/70 mt-0.5">dari target {goal.toLocaleString('id-ID')}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-white/70 mb-1">Progress</div>
                <div className="font-heading text-3xl font-extrabold">{progress.toFixed(1)}%</div>
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Form */}
      <Reveal delay={0.1}>
        <Card className="p-6 md:p-8 border-0 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <PenLine className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">Tandatangani Petisi</h3>
              <p className="text-xs text-muted-foreground">Satu perangkat = satu tanda tangan</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nama Lengkap *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama Anda"
                  className="rounded-xl"
                  required
                  maxLength={100}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@contoh.com"
                  className="rounded-xl"
                  required
                  maxLength={100}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Alamat Lengkap *</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan"
                rows={2}
                className="rounded-xl resize-none"
                required
                maxLength={300}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Kota/Kabupaten *</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="mis. Jakarta Selatan"
                  className="rounded-xl"
                  required
                  maxLength={100}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Provinsi *</Label>
                <select
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  required
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Pilih Provinsi</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Geolocation */}
            <div className="p-3 rounded-xl bg-secondary/40 border border-border">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Lokasi Realtime:</span>
                  {location.label ? (
                    <span className="font-semibold text-foreground">{location.label}</span>
                  ) : location.loading ? (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> Mendeteksi...
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60">Opsional</span>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full h-8"
                  onClick={getLocation}
                  disabled={location.loading}
                >
                  {location.loading ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Navigation className="h-3 w-3 mr-1" />
                  )}
                  {location.label ? 'Update' : 'Deteksi'}
                </Button>
              </div>
              {location.error && (
                <p className="text-xs text-amber-600 mt-2">{location.error}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Pesan Dukungan (opsional)</Label>
              <Textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="Saya mendukung petisi ini karena..."
                rows={2}
                className="rounded-xl resize-none"
                maxLength={300}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-12 font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengirim Tanda Tangan...
                </>
              ) : (
                <>
                  <PenLine className="h-4 w-4 mr-2" />
                  Tandatangani Sekarang
                </>
              )}
            </Button>

            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              Dengan menandatangani, Anda menyetujui{" "}
              <a href="/kebijakan-privasi" className="underline hover:text-primary">Kebijakan Privasi</a> kami.
              Data Anda dilindungi dan tidak dibagikan ke pihak ketiga.
            </p>
          </form>
        </Card>
      </Reveal>

      {/* Recent signatures */}
      {signatures.length > 0 && (
        <Reveal delay={0.2}>
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Tanda Tangan Terbaru
              </h3>
              <Badge variant="outline" className="text-xs">
                {count} total
              </Badge>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {signatures.slice(0, 20).map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white font-heading font-bold text-xs shrink-0">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{s.name}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {timeAgo(s.createdAt)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {s.locationLabel || `${s.city}, ${s.province}`}
                    </div>
                    {s.comment && (
                      <p className="text-xs text-foreground/70 mt-1 italic">"{s.comment}"</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </Reveal>
      )}
    </div>
  );
}

// Helper: time ago in Indonesian
function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
