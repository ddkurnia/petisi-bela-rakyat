"use client";

import { useState } from "react";
import { Save, Type, Bold, AlignLeft, FileText } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { TypographySettings } from "@/types";

export function TypographyManager() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const [form, setForm] = useState<TypographySettings>(
    settings.typography || {
      bodyFontSize: 16,
      bodyFontWeight: 400,
      bodyLineHeight: 1.6,
      headingFontSize: 1.0,
      headingFontWeight: 700,
      articleFontSize: 16,
      articleFontWeight: 400,
      articleLineHeight: 1.8,
      cardTitleWeight: 700,
      cardTextSize: 14,
    }
  );

  const save = () => {
    updateSettings({ typography: form });
  };

  const fontWeights = [
    { value: 300, label: "Light" },
    { value: 400, label: "Regular" },
    { value: 500, label: "Medium" },
    { value: 600, label: "Semibold" },
    { value: 700, label: "Bold" },
    { value: 800, label: "Extrabold" },
  ];

  const FontWeightSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex flex-wrap gap-2">
      {fontWeights.map((fw) => (
        <button
          key={fw.value}
          onClick={() => onChange(fw.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            value === fw.value
              ? "bg-primary text-white"
              : "bg-secondary text-foreground hover:bg-secondary/70"
          }`}
          style={{ fontWeight: fw.value }}
        >
          {fw.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Type className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold">Pengaturan Tipografi</h3>
            <p className="text-xs text-muted-foreground">Atur ukuran font & bold untuk seluruh website. Realtime.</p>
          </div>
        </div>
      </Card>

      {/* Body Typography */}
      <Card className="p-5 border-0 shadow-lg">
        <h4 className="font-heading font-bold text-sm flex items-center gap-2 mb-4">
          <AlignLeft className="h-4 w-4 text-primary" />
          Teks Umum (Body)
        </h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Ukuran Font Body</Label>
              <Badge variant="outline" className="text-xs">{form.bodyFontSize}px</Badge>
            </div>
            <Slider
              value={[form.bodyFontSize]}
              onValueChange={(v) => setForm({ ...form, bodyFontSize: v[0] })}
              min={12}
              max={22}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Bold/Tebal Font Body</Label>
            <FontWeightSelector value={form.bodyFontWeight} onChange={(v) => setForm({ ...form, bodyFontWeight: v })} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Jarak Baris (Line Height)</Label>
              <Badge variant="outline" className="text-xs">{form.bodyLineHeight.toFixed(1)}</Badge>
            </div>
            <Slider
              value={[form.bodyLineHeight]}
              onValueChange={(v) => setForm({ ...form, bodyLineHeight: v[0] })}
              min={1.2}
              max={2.0}
              step={0.1}
            />
          </div>
        </div>
      </Card>

      {/* Heading Typography */}
      <Card className="p-5 border-0 shadow-lg">
        <h4 className="font-heading font-bold text-sm flex items-center gap-2 mb-4">
          <Bold className="h-4 w-4 text-primary" />
          Judul (Headings)
        </h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Skala Ukuran Judul</Label>
              <Badge variant="outline" className="text-xs">{form.headingFontSize.toFixed(1)}x</Badge>
            </div>
            <Slider
              value={[form.headingFontSize]}
              onValueChange={(v) => setForm({ ...form, headingFontSize: v[0] })}
              min={0.8}
              max={1.5}
              step={0.1}
            />
            <p className="text-[10px] text-muted-foreground">Ubah skala semua judul (h1-h6). 1.0 = normal, 1.2 = 20% lebih besar.</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Bold/Tebal Judul</Label>
            <FontWeightSelector value={form.headingFontWeight} onChange={(v) => setForm({ ...form, headingFontWeight: v })} />
          </div>
        </div>
      </Card>

      {/* Article Typography */}
      <Card className="p-5 border-0 shadow-lg">
        <h4 className="font-heading font-bold text-sm flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-primary" />
          Konten Artikel (Blog & News)
        </h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Ukuran Font Artikel</Label>
              <Badge variant="outline" className="text-xs">{form.articleFontSize}px</Badge>
            </div>
            <Slider
              value={[form.articleFontSize]}
              onValueChange={(v) => setForm({ ...form, articleFontSize: v[0] })}
              min={14}
              max={22}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Bold/Tebal Artikel</Label>
            <FontWeightSelector value={form.articleFontWeight} onChange={(v) => setForm({ ...form, articleFontWeight: v })} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Jarak Baris Artikel</Label>
              <Badge variant="outline" className="text-xs">{form.articleLineHeight.toFixed(1)}</Badge>
            </div>
            <Slider
              value={[form.articleLineHeight]}
              onValueChange={(v) => setForm({ ...form, articleLineHeight: v[0] })}
              min={1.4}
              max={2.2}
              step={0.1}
            />
          </div>
        </div>
      </Card>

      {/* Card Typography */}
      <Card className="p-5 border-0 shadow-lg">
        <h4 className="font-heading font-bold text-sm flex items-center gap-2 mb-4">
          <Type className="h-4 w-4 text-primary" />
          Kartu (Cards — Blog/News/Campaign List)
        </h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Bold Judul Kartu</Label>
            <FontWeightSelector value={form.cardTitleWeight} onChange={(v) => setForm({ ...form, cardTitleWeight: v })} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Ukuran Teks Kartu</Label>
              <Badge variant="outline" className="text-xs">{form.cardTextSize}px</Badge>
            </div>
            <Slider
              value={[form.cardTextSize]}
              onValueChange={(v) => setForm({ ...form, cardTextSize: v[0] })}
              min={11}
              max={18}
              step={1}
            />
          </div>
        </div>
      </Card>

      {/* Live Preview */}
      <Card className="p-5 border-0 shadow-lg bg-secondary/30">
        <h4 className="font-heading font-bold text-sm mb-3">Preview</h4>
        <div className="space-y-3">
          <h3 style={{ fontSize: `${1.5 * form.headingFontSize}rem`, fontWeight: form.headingFontWeight }} className="font-heading">
            Contoh Judul Artikel
          </h3>
          <p style={{ fontSize: `${form.articleFontSize}px`, fontWeight: form.articleFontWeight, lineHeight: form.articleLineHeight }} className="text-foreground/80">
            Ini adalah contoh teks artikel. Pengaturan tipografi yang Anda pilih akan diterapkan ke seluruh konten artikel blog dan berita secara realtime.
          </p>
          <div className="p-3 rounded-xl bg-background border border-border">
            <h4 style={{ fontWeight: form.cardTitleWeight }} className="font-heading text-sm">Judul Kartu Blog</h4>
            <p style={{ fontSize: `${form.cardTextSize}px` }} className="text-muted-foreground mt-1">Ini teks deskripsi pada kartu.</p>
          </div>
        </div>
      </Card>

      {/* Save button */}
      <div className="sticky bottom-4 z-10">
        <Button
          onClick={save}
          className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-12 shadow-xl shadow-primary/30"
        >
          <Save className="h-4 w-4 mr-2" />
          Simpan Pengaturan Tipografi
        </Button>
      </div>
    </div>
  );
}
