"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(true);
        toast.success("Berhasil berlangganan newsletter!");
        setEmail("");
      } else {
        toast.error(data.error || "Gagal berlangganan");
      }
    } catch {
      toast.error("Gagal mengirim. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <CheckCircle2 className="h-4 w-4" />
        <span>Terima kasih! Cek email Anda untuk konfirmasi.</span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2 max-w-md">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@anda.com"
        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-full"
        required
      />
      <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white rounded-full shrink-0">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
      </Button>
    </form>
  );
}
