"use client";

import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "../image-upload";
import { toast } from "sonner";

export function HomepageManager() {
  const settings = useStore((s) => s.settings);
  const updateHomepage = useStore((s) => s.updateHomepage);
  const [form, setForm] = useState(settings.homepage);

  const save = () => {
    updateHomepage(form);
    toast.success("Homepage berhasil diperbarui");
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-1">Hero Section</h3>
        <p className="text-sm text-muted-foreground mb-5">Konten utama yang tampil di beranda.</p>
        <div className="space-y-4">
          <ImageUpload
            label="Foto Hero (fullscreen)"
            value={form.hero.image}
            onChange={(url) => setForm({ ...form, hero: { ...form.hero, image: url } })}
            aspectRatio="wide"
          />
          <div className="space-y-1.5">
            <Label>Headline</Label>
            <Input
              value={form.hero.headline}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, headline: e.target.value } })}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Subheadline</Label>
            <Textarea
              value={form.hero.subheadline}
              onChange={(e) => setForm({ ...form, hero: { ...form.hero, subheadline: e.target.value } })}
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Primary CTA</Label>
              <Input
                value={form.hero.primaryCta}
                onChange={(e) => setForm({ ...form, hero: { ...form.hero, primaryCta: e.target.value } })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Secondary CTA</Label>
              <Input
                value={form.hero.secondaryCta}
                onChange={(e) => setForm({ ...form, hero: { ...form.hero, secondaryCta: e.target.value } })}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-1">Statistik</h3>
        <p className="text-sm text-muted-foreground mb-5">Angka yang ditampilkan dengan animasi counter.</p>
        <div className="space-y-3">
          {form.stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-end p-3 rounded-xl bg-secondary/40">
              <div className="col-span-12 sm:col-span-5 space-y-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={stat.label}
                  onChange={(e) => {
                    const stats = [...form.stats];
                    stats[i] = { ...stats[i], label: e.target.value };
                    setForm({ ...form, stats });
                  }}
                  className="rounded-xl"
                />
              </div>
              <div className="col-span-6 sm:col-span-3 space-y-1">
                <Label className="text-xs">Nilai</Label>
                <Input
                  type="number"
                  value={stat.value}
                  onChange={(e) => {
                    const stats = [...form.stats];
                    stats[i] = { ...stats[i], value: parseInt(e.target.value) || 0 };
                    setForm({ ...form, stats });
                  }}
                  className="rounded-xl"
                />
              </div>
              <div className="col-span-4 sm:col-span-2 space-y-1">
                <Label className="text-xs">Suffix</Label>
                <Input
                  value={stat.suffix}
                  onChange={(e) => {
                    const stats = [...form.stats];
                    stats[i] = { ...stats[i], suffix: e.target.value };
                    setForm({ ...form, stats });
                  }}
                  className="rounded-xl"
                />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-red-600 hover:bg-red-500/10"
                  onClick={() => {
                    const stats = form.stats.filter((_, idx) => idx !== i);
                    setForm({ ...form, stats });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setForm({ ...form, stats: [...form.stats, { label: "Stat Baru", value: 0, suffix: "+" }] })}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Statistik
          </Button>
        </div>
      </Card>

      {/* Section Images & Texts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
          <h3 className="font-heading font-bold mb-1">Section: Tentang Kami</h3>
          <p className="text-sm text-muted-foreground mb-5">Tampil di homepage section about.</p>
          <ImageUpload
            label="Foto About"
            value={form.about.image}
            onChange={(url) => setForm({ ...form, about: { ...form.about, image: url } })}
            aspectRatio="video"
          />
          <div className="mt-4 space-y-1.5">
            <Label>Judul</Label>
            <Input
              value={form.about.title}
              onChange={(e) => setForm({ ...form, about: { ...form.about, title: e.target.value } })}
              className="rounded-xl"
            />
          </div>
          <div className="mt-3 space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              value={form.about.description}
              onChange={(e) => setForm({ ...form, about: { ...form.about, description: e.target.value } })}
              rows={2}
              className="rounded-xl resize-none"
            />
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
          <h3 className="font-heading font-bold mb-1">Section: Kerja Kami</h3>
          <p className="text-sm text-muted-foreground mb-5">Heading untuk section work di homepage.</p>
          <div className="space-y-1.5">
            <Label>Judul</Label>
            <Input
              value={form.work.title}
              onChange={(e) => setForm({ ...form, work: { ...form.work, title: e.target.value } })}
              className="rounded-xl"
            />
          </div>
          <div className="mt-3 space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              value={form.work.description}
              onChange={(e) => setForm({ ...form, work: { ...form.work, description: e.target.value } })}
              rows={2}
              className="rounded-xl resize-none"
            />
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
          <h3 className="font-heading font-bold mb-1">Section: Kampanye</h3>
          <p className="text-sm text-muted-foreground mb-5">Heading untuk section campaigns di homepage.</p>
          <div className="space-y-1.5">
            <Label>Judul</Label>
            <Input
              value={form.campaigns.title}
              onChange={(e) => setForm({ ...form, campaigns: { ...form.campaigns, title: e.target.value } })}
              className="rounded-xl"
            />
          </div>
          <div className="mt-3 space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              value={form.campaigns.description}
              onChange={(e) => setForm({ ...form, campaigns: { ...form.campaigns, description: e.target.value } })}
              rows={2}
              className="rounded-xl resize-none"
            />
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
          <h3 className="font-heading font-bold mb-1">Section: Dukungan Tokoh</h3>
          <p className="text-sm text-muted-foreground mb-5">Heading untuk section supporters di homepage.</p>
          <div className="space-y-1.5">
            <Label>Judul</Label>
            <Input
              value={form.supporters.title}
              onChange={(e) => setForm({ ...form, supporters: { ...form.supporters, title: e.target.value } })}
              className="rounded-xl"
            />
          </div>
          <div className="mt-3 space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              value={form.supporters.description}
              onChange={(e) => setForm({ ...form, supporters: { ...form.supporters, description: e.target.value } })}
              rows={2}
              className="rounded-xl resize-none"
            />
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          <Save className="h-4 w-4 mr-2" />
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
}
