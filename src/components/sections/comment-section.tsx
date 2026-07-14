"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Comment {
  id: string;
  name: string;
  comment: string;
  createdAt: string;
}

export function CommentSection({ articleId, articleType }: { articleId: string; articleType: 'blog' | 'news' }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comment?articleId=${articleId}`);
      const data = await res.json();
      if (data.ok) {
        setComments(data.comments || []);
      }
    } catch {}
    setLoading(false);
  }, [articleId]);

  useEffect(() => {
    fetchComments();
    const id = setInterval(fetchComments, 10000); // realtime poll every 10s
    return () => clearInterval(id);
  }, [fetchComments]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, articleType, name, comment }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Komentar berhasil dikirim!");
        setName("");
        setComment("");
        fetchComments();
      } else {
        toast.error(data.error || "Gagal mengirim komentar");
      }
    } catch {
      toast.error("Gagal mengirim. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  function timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }

  return (
    <div className="mt-12 pt-10 border-t border-border">
      <h3 className="font-heading text-xl md:text-2xl font-bold flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5 text-primary" />
        Komentar ({comments.length})
      </h3>

      {/* Comment form */}
      <form onSubmit={submit} className="space-y-3 mb-8">
        <div className="space-y-1.5">
          <Label className="text-xs">Nama</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Anda"
            maxLength={100}
            required
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Komentar</Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tulis komentar Anda..."
            rows={3}
            maxLength={1000}
            required
            className="rounded-xl resize-none"
          />
        </div>
        <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-white rounded-full">
          {submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
          Kirim Komentar
        </Button>
      </form>

      {/* Comments list */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Memuat komentar...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Belum ada komentar. Jadilah yang pertama!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-secondary/40 border border-border"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-white font-heading font-bold text-xs shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground">{timeAgo(c.createdAt)}</div>
                </div>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed pl-12">{c.comment}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
