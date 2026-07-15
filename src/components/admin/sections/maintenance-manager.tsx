"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wrench, Power, PowerOff, Clock, Save, AlertTriangle,
  CheckCircle2, Shield, Eye, Settings as SettingsIcon,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { MaintenanceSettings } from "@/types";

const LOGO_URL = "https://res.cloudinary.com/dwmoqe4kj/image/upload/w_200,h_200,c_fit,q_auto,f_png/v1784097288/1000130803-Photoroom_o6wqrc.png";

export function MaintenanceManager() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const currentUser = useStore((s) => s.currentUser);

  const [form, setForm] = useState<MaintenanceSettings>(
    settings.maintenance || {
      enabled: false,
      title: "Sedang Pemeliharaan",
      message: "Website Petisi Bela Rakyat saat ini sedang dalam pemeliharaan untuk meningkatkan layanan. Kami akan kembali secepatnya.",
      estimatedTime: "",
      allowAdminAccess: true,
    }
  );

  const save = () => {
    updateSettings({ maintenance: form });
  };

  const toggleMaintenance = () => {
    const newForm = { ...form, enabled: !form.enabled, updatedAt: new Date().toISOString() };
    setForm(newForm);
    updateSettings({ maintenance: newForm });
    if (newForm.enabled) {
      toast.warning("Mode Pemeliharaan AKTIF", {
        description: "Website sekarang tidak dapat diakses publik. Admin tetap bisa akses.",
        duration: 8000,
      });
    } else {
      toast.success("Mode Pemeliharaan NONAKTIF", {
        description: "Website kembali live untuk publik.",
        duration: 5000,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`p-5 border-0 shadow-lg overflow-hidden relative ${
          form.enabled
            ? "bg-gradient-to-br from-amber-500/10 to-red-500/5 border-amber-500/20"
            : "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20"
        }`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${
                form.enabled ? "bg-amber-500/20" : "bg-green-500/20"
              }`}>
                {form.enabled ? (
                  <Wrench className="h-7 w-7 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading font-bold text-base">
                    {form.enabled ? "Mode Pemeliharaan Aktif" : "Website Live"}
                  </h3>
                  <Badge className={form.enabled
                    ? "bg-amber-500 text-white border-0 text-xs"
                    : "bg-green-500 text-white border-0 text-xs"
                  }>
                    {form.enabled ? "MAINTENANCE" : "LIVE"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {form.enabled
                    ? "Pengunjung publik melihat halaman pemeliharaan. Admin tetap bisa akses."
                    : "Website dapat diakses oleh semua pengunjung secara normal."
                  }
                </p>
              </div>
            </div>

            {/* Toggle switch */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <Switch
                checked={form.enabled}
                onCheckedChange={toggleMaintenance}
                className="scale-125"
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {form.enabled ? "ON" : "OFF"}
              </span>
            </div>
          </div>

          {/* Warning when enabled */}
          {form.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <strong>Perhatian:</strong> Mode pemeliharaan sedang aktif. Pengunjung publik tidak dapat mengakses website.
                  {currentUser && form.allowAdminAccess && (
                    <span className="block mt-1 text-green-700 dark:text-green-400">
                      ✓ Admin tetap bisa akses (Anda login sebagai {currentUser.role}).
                    </span>
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Settings form */}
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center gap-2 mb-5">
          <SettingsIcon className="h-5 w-5 text-primary" />
          <h4 className="font-heading font-bold text-sm">Pengaturan Pemeliharaan</h4>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs">Judul Halaman Pemeliharaan</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Sedang Pemeliharaan"
              className="rounded-xl"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label className="text-xs">Pesan ke Pengunjung</Label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Website sedang dalam pemeliharaan..."
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>

          {/* Estimated time */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Estimasi Selesai (opsional)
            </Label>
            <Input
              value={form.estimatedTime}
              onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })}
              placeholder="mis. 2 jam, pukul 20:00 WIB, besok pagi"
              className="rounded-xl"
            />
          </div>

          {/* Allow admin access */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium">Izinkan Akses Admin</div>
                <div className="text-[10px] text-muted-foreground">Admin yang login tetap bisa akses website saat maintenance</div>
              </div>
            </div>
            <Switch
              checked={form.allowAdminAccess}
              onCheckedChange={(v) => setForm({ ...form, allowAdminAccess: v })}
            />
          </div>
        </div>

        {/* Save button */}
        <Button
          onClick={save}
          className="w-full mt-5 bg-primary hover:bg-primary/90 text-white rounded-full"
        >
          <Save className="h-4 w-4 mr-2" />
          Simpan Pengaturan
        </Button>
      </Card>

      {/* Live Preview */}
      <Card className="p-0 border-0 shadow-xl overflow-hidden">
        <div className="p-4 bg-foreground text-background flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Preview Halaman Pemeliharaan</span>
        </div>
        <div className="p-8 md:p-12 bg-gradient-to-br from-foreground via-foreground/95 to-primary/20 min-h-[300px] flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Decorative blur */}
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />

          {/* Animated logo */}
          <motion.div
            animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 mb-6"
          >
            <img src={LOGO_URL} alt="PBR" className="h-20 w-20 md:h-28 md:w-28 object-contain" />
          </motion.div>

          {/* Wrench icon */}
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 mb-4"
          >
            <Wrench className="h-8 w-8 text-primary" />
          </motion.div>

          <h2 className="relative z-10 font-heading text-2xl md:text-3xl font-extrabold text-white mb-3">
            {form.title || "Sedang Pemeliharaan"}
          </h2>
          <p className="relative z-10 text-sm md:text-base text-white/70 max-w-md leading-relaxed mb-4">
            {form.message || "Website sedang dalam pemeliharaan."}
          </p>
          {form.estimatedTime && (
            <div className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs">
              <Clock className="h-3.5 w-3.5" />
              Estimasi selesai: <strong>{form.estimatedTime}</strong>
            </div>
          )}

          {/* Loading dots */}
          <div className="relative z-10 flex gap-1.5 mt-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                className="h-2 w-2 rounded-full bg-primary"
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="rounded-xl h-auto py-3 flex flex-col items-center gap-1"
          onClick={() => {
            setForm({
              ...form,
              enabled: true,
              title: "Pemeliharaan Terjadwal",
              message: "Kami sedang melakukan peningkatan sistem untuk memberikan pengalaman yang lebih baik. Mohon maaf atas ketidaknyamanannya.",
              estimatedTime: "2 jam",
              allowAdminAccess: true,
            });
            toast.info("Template pemeliharaan diterapkan. Klik Simpan untuk aktifkan.");
          }}
        >
          <Wrench className="h-4 w-4 text-amber-500" />
          <span className="text-xs">Template Pemeliharaan</span>
        </Button>
        <Button
          variant="outline"
          className="rounded-xl h-auto py-3 flex flex-col items-center gap-1"
          onClick={() => {
            const newForm = { ...form, enabled: false, updatedAt: new Date().toISOString() };
            setForm(newForm);
            updateSettings({ maintenance: newForm });
            toast.success("Website kembali LIVE");
          }}
        >
          <PowerOff className="h-4 w-4 text-green-500" />
          <span className="text-xs">Matikan Maintenance</span>
        </Button>
      </div>
    </div>
  );
}
