"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, Send, Clock, Building } from "lucide-react";
import { Reveal } from "@/components/animation";
import { SectionHeading } from "./section-heading";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ContactPage() {
  const settings = useStore((s) => s.settings);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const addMessage = useStore((s) => s.addMessage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      addMessage({
        name: form.name, email: form.email, phone: form.phone,
        subject: form.subject, message: form.message,
      });
      toast.success("Pesan terkirim!", { description: "Tim kami akan menghubungi Anda dalam 1-2 hari kerja." });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("Gagal mengirim pesan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const channels = [
    {
      icon: MapPin,
      title: "Sekretariat",
      value: settings.contact.address,
      action: "Lihat di Maps",
      href: settings.contact.mapLink || "https://maps.google.com",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: settings.contact.whatsapp,
      action: "Chat Sekarang",
      href: `https://wa.me/${settings.contact.whatsapp.replace(/[^0-9]/g, "")}`,
    },
    {
      icon: Mail,
      title: "Email",
      value: settings.contact.email,
      action: "Kirim Email",
      href: `mailto:${settings.contact.email}`,
    },
    {
      icon: Clock,
      title: "Jam Operasional",
      value: settings.contact.operationHours,
      action: null,
    },
  ];

  return (
    <div className="pt-24 md:pt-32 pb-20">
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="Kontak"
              title="Mari Berbicara"
              description="Punya aspirasi, pertanyaan, atau ingin berkolaborasi? Kami selalu terbuka untuk percakapan."
            />
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-x">
          {/* Channels */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-12">
            {channels.map((c, i) => {
              const Icon = c.icon;
              const inner = (
                <Card className="p-5 md:p-6 h-full border-0 shadow-lg shadow-foreground/5 hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-sm">{c.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{c.value}</p>
                  {c.action && (
                    <div className="mt-3 text-xs font-semibold text-primary">
                      {c.action} →
                    </div>
                  )}
                </Card>
              );
              return (
                <Reveal key={i} delay={i * 0.1}>
                  {c.href ? (
                    <a href={c.href} target="_blank" rel="noopener noreferrer" className="block h-full">
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </Reveal>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Form */}
            <Reveal>
              <Card className="p-6 md:p-8 border-0 shadow-xl shadow-foreground/5">
                <h2 className="font-heading text-2xl font-bold mb-1">Kirim Pesan</h2>
                <p className="text-sm text-muted-foreground mb-6">Kami akan merespons dalam 1-2 hari kerja.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Nama Lengkap *</Label>
                      <Input
                        id="name"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Nama Anda"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="email@anda.com"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">No. Telepon</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="08xx-xxxx-xxxx"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="subject">Subjek *</Label>
                      <Input
                        id="subject"
                        required
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder="Apa yang ingin Anda sampaikan?"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Pesan *</Label>
                    <Textarea
                      id="message"
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tulis pesan Anda di sini..."
                      rows={5}
                      className="rounded-xl resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-12"
                    disabled={submitting}
                  >
                    {submitting ? "Mengirim..." : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Kirim Pesan
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </Reveal>

            {/* Map + WhatsApp CTA */}
            <div className="space-y-6">
              <Reveal delay={0.1}>
                <Card className="overflow-hidden border-0 shadow-xl shadow-foreground/5">
                  <div className="aspect-video bg-secondary">
                    <iframe
                      src={settings.contact.mapEmbed}
                      className="w-full h-full"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-heading font-bold text-sm">Sekretariat PBR</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{settings.contact.address}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Reveal>

              <Reveal delay={0.2}>
                <Card className="p-6 md:p-8 bg-foreground text-background border-0 shadow-xl">
                  <MessageCircle className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-white">
                    Lebih suka chat langsung?
                  </h3>
                  <p className="mt-2 text-white/70 text-sm">
                    Hubungi kami via WhatsApp untuk respon cepat. Tim siap membantu Anda.
                  </p>
                  <Button
                    className="mt-5 bg-green-600 hover:bg-green-700 text-white rounded-full"
                    onClick={() => window.open(`https://wa.me/${settings.contact.whatsapp.replace(/[^0-9]/g, "")}`, "_blank")}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat via WhatsApp
                  </Button>
                </Card>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
