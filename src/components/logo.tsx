"use client";

export function Logo({ className = "", showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/pbr.png"
        alt="Logo Petisi Bela Rakyat"
        className="h-10 w-10 shrink-0 object-contain"
        width={40}
        height={40}
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-heading text-base font-extrabold tracking-tight">
            Petisi Bela Rakyat
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
            Membela Suara Rakyat
          </span>
        </div>
      )}
    </div>
  );
}
