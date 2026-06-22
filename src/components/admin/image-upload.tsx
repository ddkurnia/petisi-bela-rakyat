"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: "square" | "video" | "portrait" | "wide";
  multiple?: false;
}

export function ImageUpload({ value, onChange, label = "Gambar", aspectRatio = "video" }: ImageUploadProps) {
  const [mode, setMode] = useState<"upload" | "url">(value ? "url" : "upload");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[4/5]",
    wide: "aspect-[21/9]",
  }[aspectRatio];

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diizinkan");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran maksimal 5MB");
      return;
    }
    setUploading(true);
    // Convert to base64 — in production, this would upload to Firebase Storage
    const reader = new FileReader();
    reader.onloadend = () => {
      // Simulate network delay
      setTimeout(() => {
        onChange(reader.result as string);
        setUploading(false);
        toast.success("Gambar berhasil diunggah");
      }, 600);
    };
    reader.onerror = () => {
      setUploading(false);
      toast.error("Gagal mengunggah gambar");
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1 mb-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === "upload" ? "bg-primary text-white" : "bg-secondary text-foreground hover:bg-secondary/70"
          }`}
        >
          <Upload className="h-3 w-3 inline mr-1" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === "url" ? "bg-primary text-white" : "bg-secondary text-foreground hover:bg-secondary/70"
          }`}
        >
          <LinkIcon className="h-3 w-3 inline mr-1" />
          URL Eksternal
        </button>
      </div>

      {mode === "upload" ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={`relative ${aspectClass} w-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-all overflow-hidden flex items-center justify-center`}
        >
          {uploading ? (
            <div className="flex flex-col items-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <span className="text-xs">Mengunggah...</span>
            </div>
          ) : value ? (
            <>
              <img src={value} alt={label} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-sm font-medium">Ganti Gambar</div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center text-muted-foreground p-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-sm font-medium">Klik atau drag gambar ke sini</div>
              <div className="text-xs mt-1">PNG, JPG hingga 5MB</div>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="rounded-xl"
        />
      )}

      {value && mode === "url" && (
        <div className={`${aspectClass} w-full rounded-xl overflow-hidden bg-secondary`}>
          <img src={value} alt={label} className="h-full w-full object-cover" />
        </div>
      )}
    </div>
  );
}

// Multi-image upload variant
export function MultiImageUpload({ value, onChange, label = "Galeri Gambar" }: {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList) => {
    setUploading(true);
    const newImages: string[] = [];
    let processed = 0;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        processed++;
        if (processed === files.length) {
          onChange([...value, ...newImages]);
          setUploading(false);
          toast.success(`${newImages.length} gambar ditambahkan`);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [value, onChange]);

  return (
    <div className="space-y-2">
      <Label>{label} ({value.length})</Label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {value.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-secondary group">
            <img src={img} alt={`Image ${i+1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-secondary/30 hover:bg-secondary/50 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-all"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Upload className="h-5 w-5 mb-1" />
              <span className="text-[10px]">Tambah</span>
            </>
          )}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
