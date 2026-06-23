"use client";

import { useState, useCallback } from "react";
import {
  Share2, MessageCircle, Facebook, Twitter, Send, Linkedin, Mail, Link2, Check, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ShareButtonsProps {
  url?: string;
  title: string;
  description?: string;
  variant?: "inline" | "compact" | "full";
  className?: string;
  onShare?: (platform: string) => void;
}

interface Platform {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  getUrl: (url: string, title: string, description: string) => string;
}

const platforms: Platform[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    color: "bg-green-600 hover:bg-green-700 text-white",
    getUrl: (url, title, desc) => `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${desc}\n\n${url}`)}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "bg-blue-600 hover:bg-blue-700 text-white",
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: Send,
    color: "bg-sky-500 hover:bg-sky-600 text-white",
    getUrl: (url, title) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    icon: Twitter,
    color: "bg-gray-900 hover:bg-black text-white",
    getUrl: (url, title) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-700 hover:bg-blue-800 text-white",
    getUrl: (url, title, desc) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(desc)}`,
  },
  {
    key: "email",
    label: "Email",
    icon: Mail,
    color: "bg-gray-600 hover:bg-gray-700 text-white",
    getUrl: (url, title, desc) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${desc}\n\n${url}`)}`,
  },
];

export function ShareButtons({
  url,
  title,
  description = "",
  variant = "inline",
  className = "",
  onShare,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = title;
  const shareDesc = description || title;

  const handleShare = useCallback(async (platform: Platform) => {
    const shareUrlStr = shareUrl;
    window.open(platform.getUrl(shareUrlStr, shareTitle, shareDesc), "_blank", "width=600,height=500,scrollbars=yes");
    onShare?.(platform.key);
    setPopupOpen(false);
  }, [shareUrl, shareTitle, shareDesc, onShare]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDesc,
          url: shareUrl,
        });
        onShare?.("native");
      } catch {
        // user cancelled
      }
    } else {
      setPopupOpen(true);
    }
  }, [shareTitle, shareDesc, shareUrl, onShare]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onShare?.("copy");
      toast.success("Link disalin ke clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin link");
    }
  }, [shareUrl, onShare]);

  // Compact variant: just a share button that triggers native share or popup
  if (variant === "compact") {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          className={`rounded-full ${className}`}
          onClick={handleNativeShare}
        >
          <Share2 className="h-3.5 w-3.5 mr-1.5" />
          Bagikan
        </Button>
        <SharePopup
          open={popupOpen}
          onOpenChange={setPopupOpen}
          platforms={platforms}
          onShare={handleShare}
          onCopy={handleCopyLink}
          copied={copied}
          url={shareUrl}
        />
      </>
    );
  }

  // Full variant: large buttons grid (for end of article)
  if (variant === "full") {
    return (
      <>
        <div className={className}>
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-base md:text-lg font-bold">Bagikan Konten Ini</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
            {platforms.slice(0, 4).map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.key}
                  onClick={() => handleShare(p)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${p.color}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{p.label}</span>
                </button>
              );
            })}
            <button
              onClick={handleCopyLink}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                copied ? "bg-green-600 text-white" : "bg-secondary text-foreground hover:bg-secondary/70"
              }`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              <span className="hidden sm:inline">{copied ? "Tersalin" : "Salin Link"}</span>
            </button>
          </div>
        </div>
        <SharePopup
          open={popupOpen}
          onOpenChange={setPopupOpen}
          platforms={platforms}
          onShare={handleShare}
          onCopy={handleCopyLink}
          copied={copied}
          url={shareUrl}
        />
      </>
    );
  }

  // Inline variant: horizontal row of small icon buttons (default, for under title)
  return (
    <>
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        <span className="text-xs text-muted-foreground font-medium mr-1">Bagikan:</span>
        {platforms.slice(0, 5).map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.key}
              onClick={() => handleShare(p)}
              aria-label={`Bagikan ke ${p.label}`}
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${p.color}`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
        <button
          onClick={handleCopyLink}
          aria-label="Salin Link"
          className={`h-8 w-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
            copied ? "bg-green-600 text-white" : "bg-secondary text-foreground hover:bg-secondary/70"
          }`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        </button>
      </div>
      <SharePopup
        open={popupOpen}
        onOpenChange={setPopupOpen}
        platforms={platforms}
        onShare={handleShare}
        onCopy={handleCopyLink}
        copied={copied}
        url={shareUrl}
      />
    </>
  );
}

// ============ SHARE POPUP (fallback for non-Web Share API browsers) ============
function SharePopup({
  open,
  onOpenChange,
  platforms,
  onShare,
  onCopy,
  copied,
  url,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  platforms: Platform[];
  onShare: (p: Platform) => void;
  onCopy: () => void;
  copied: boolean;
  url: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Bagikan Konten
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 py-2">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.key}
                onClick={() => onShare(p)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-all group"
              >
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${p.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium">{p.label}</span>
              </button>
            );
          })}
          <button
            onClick={onCopy}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-all group"
          >
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${
              copied ? "bg-green-600 text-white" : "bg-secondary text-foreground"
            }`}>
              {copied ? <Check className="h-6 w-6" /> : <Link2 className="h-6 w-6" />}
            </div>
            <span className="text-xs font-medium">{copied ? "Tersalin" : "Salin Link"}</span>
          </button>
        </div>
        <div className="mt-2 p-3 rounded-xl bg-secondary/50 flex items-center gap-2">
          <input
            readOnly
            value={url}
            className="flex-1 bg-transparent text-xs text-muted-foreground outline-none truncate"
          />
          <button
            onClick={onCopy}
            className="text-xs font-semibold text-primary hover:underline shrink-0"
          >
            {copied ? "Tersalin" : "Salin"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ FLOATING SHARE BUTTON (mobile) ============
export function FloatingShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Petisi Bela Rakyat",
          text: "Bersama membela rakyat, tanpa kompromi.",
          url: window.location.href,
        });
        setOpen(false);
      } catch {
        // cancelled
      }
    } else {
      setOpen(!open);
    }
  }, [open]);

  const handlePlatform = useCallback((platform: Platform) => {
    const url = window.location.href;
    const title = document.title;
    const desc = document.querySelector('meta[name="description"]')?.getAttribute("content") || title;
    window.open(platform.getUrl(url, title, desc), "_blank", "width=600,height=500");
    setOpen(false);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, []);

  const quickPlatforms = platforms.slice(0, 4); // WhatsApp, Facebook, Telegram, X

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2">
      {open && (
        <>
          {quickPlatforms.map((p, i) => {
            const Icon = p.icon;
            return (
              <button
                key={p.key}
                onClick={() => handlePlatform(p)}
                aria-label={p.label}
                style={{ animationDelay: `${i * 50}ms` }}
                className={`h-10 w-10 rounded-full ${p.color} shadow-lg flex items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
          <button
            onClick={handleCopy}
            aria-label="Salin Link"
            className={`h-10 w-10 rounded-full ${copied ? "bg-green-600 text-white" : "bg-secondary text-foreground"} shadow-lg flex items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          </button>
        </>
      )}
      <button
        onClick={handleNativeShare}
        aria-label={open ? "Tutup share" : "Bagikan halaman"}
        className="h-12 w-12 rounded-full bg-foreground text-background shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
      >
        {open ? <X className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
      </button>
    </div>
  );
}
