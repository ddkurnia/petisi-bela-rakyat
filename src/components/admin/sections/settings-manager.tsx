"use client";

import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const socialIcons = ["facebook", "instagram", "twitter", "youtube", "tiktok"];

export function SettingsManager() {
  const settings = useStore((s) => s.settings);
  const updateContact = useStore((s) => s.updateContact);
  const updateSocials = useStore((s) => s.updateSocials);
  const updateFooter = useStore((s) => s.updateFooter);
  const updateAbout = useStore((s) => s.updateAbout);

  const [contact, setContact] = useState(settings.contact);
  const [socials, setSocials] = useState(settings.socials);
  const [footer, setFooter] = useState(settings.footer);
  const [about, setAbout] = useState(settings.about);

  return (
    <div className="space-y-6">
      {/* Site Identity */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-1">Identitas Situs</h3>
        <p className="text-sm text-muted-foreground mb-5">Informasi dasar organisasi.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Nama Situs</Label>
            <Input value={settings.siteName} readOnly className="rounded-xl bg-secondary/50" />
          </div>
          <div className="space-y-1.5">
            <Label>Tagline</Label>
            <Input value={settings.tagline} readOnly className="rounded-xl bg-secondary/50" />
          </div>
        </div>
      </Card>

      {/* Contact Info */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-1">Kontak</h3>
        <p className="text-sm text-muted-foreground mb-5">Informasi kontak yang tampil di footer, halaman kontak, dan CTA.</p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Alamat Sekretariat</Label>
            <Textarea
              value={contact.address}
              onChange={(e) => setContact({ ...contact, address: e.target.value })}
              rows={2}
              className="rounded-xl resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nomor WhatsApp</Label>
              <Input value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Nomor Telepon</Label>
              <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Jam Operasional</Label>
              <Input value={contact.operationHours} onChange={(e) => setContact({ ...contact, operationHours: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Google Maps Embed URL</Label>
            <Textarea
              value={contact.mapEmbed}
              onChange={(e) => setContact({ ...contact, mapEmbed: e.target.value })}
              rows={2}
              className="rounded-xl resize-none font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Google Maps Link (untuk tombol)</Label>
            <Input value={contact.mapLink} onChange={(e) => setContact({ ...contact, mapLink: e.target.value })} className="rounded-xl" />
          </div>
          <Button
            onClick={() => { updateContact(contact); }}
            className="rounded-full bg-primary hover:bg-primary/90 text-white"
          >
            <Save className="h-4 w-4 mr-2" /> Simpan Kontak
          </Button>
        </div>
      </Card>

      {/* Social Media */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-1">Media Sosial</h3>
        <p className="text-sm text-muted-foreground mb-5">Akun media sosial organisasi (muncul di footer).</p>
        <div className="space-y-3">
          {socials.map((s, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end p-3 rounded-xl bg-secondary/40">
              <div className="col-span-12 sm:col-span-3 space-y-1">
                <Label className="text-xs">Platform</Label>
                <Select
                  value={s.icon}
                  onValueChange={(v) => {
                    const next = [...socials];
                    next[i] = { ...next[i], icon: v, name: v.charAt(0).toUpperCase() + v.slice(1) };
                    setSocials(next);
                  }}
                >
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {socialIcons.map((ic) => (
                      <SelectItem key={ic} value={ic}>{ic.charAt(0).toUpperCase() + ic.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-7 sm:col-span-3 space-y-1">
                <Label className="text-xs">Handle</Label>
                <Input
                  value={s.handle}
                  onChange={(e) => { const next = [...socials]; next[i] = { ...next[i], handle: e.target.value }; setSocials(next); }}
                  className="rounded-xl"
                />
              </div>
              <div className="col-span-9 sm:col-span-5 space-y-1">
                <Label className="text-xs">URL</Label>
                <Input
                  value={s.url}
                  onChange={(e) => { const next = [...socials]; next[i] = { ...next[i], url: e.target.value }; setSocials(next); }}
                  className="rounded-xl"
                />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-red-600 hover:bg-red-500/10"
                  onClick={() => setSocials(socials.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setSocials([...socials, { name: "Facebook", url: "https://", icon: "facebook", handle: "@" }])}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Tambah Media Sosial
            </Button>
            <Button
              onClick={() => { updateSocials(socials); }}
              className="rounded-full bg-primary hover:bg-primary/90 text-white"
            >
              <Save className="h-4 w-4 mr-2" /> Simpan
            </Button>
          </div>
        </div>
      </Card>

      {/* About: Visi, Misi, Sejarah */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-1">Tentang Organisasi</h3>
        <p className="text-sm text-muted-foreground mb-5">Visi, Misi, Sejarah, Motto, dan Nilai-nilai.</p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Motto</Label>
            <Input value={about.motto} onChange={(e) => setAbout({ ...about, motto: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label>Visi</Label>
            <Textarea value={about.visi} onChange={(e) => setAbout({ ...about, visi: e.target.value })} rows={3} className="rounded-xl resize-none" />
          </div>
          <div className="space-y-1.5">
            <Label>Misi (satu per baris)</Label>
            <Textarea
              value={about.misi.join("\n")}
              onChange={(e) => setAbout({ ...about, misi: e.target.value.split("\n").filter(Boolean) })}
              rows={6}
              className="rounded-xl resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Sejarah Organisasi</Label>
            <Textarea value={about.sejarah} onChange={(e) => setAbout({ ...about, sejarah: e.target.value })} rows={8} className="rounded-xl resize-none" />
          </div>
          <Button
            onClick={() => { updateAbout(about); }}
            className="rounded-full bg-primary hover:bg-primary/90 text-white"
          >
            <Save className="h-4 w-4 mr-2" /> Simpan Tentang
          </Button>
        </div>
      </Card>

      {/* Footer */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-1">Footer</h3>
        <p className="text-sm text-muted-foreground mb-5">Konten footer (deskripsi, copyright, legal links).</p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Deskripsi Organisasi (di footer)</Label>
            <Textarea value={footer.description} onChange={(e) => setFooter({ ...footer, description: e.target.value })} rows={2} className="rounded-xl resize-none" />
          </div>
          <div className="space-y-1.5">
            <Label>Copyright Text (gunakan {"{year}"} untuk tahun otomatis)</Label>
            <Input value={footer.copyrightText} onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })} className="rounded-xl" />
          </div>
          <Button
            onClick={() => { updateFooter(footer); }}
            className="rounded-full bg-primary hover:bg-primary/90 text-white"
          >
            <Save className="h-4 w-4 mr-2" /> Simpan Footer
          </Button>
        </div>
      </Card>
    </div>
  );
}
