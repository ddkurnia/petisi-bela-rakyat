"use client";

export function Logo({ className = "", showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 min-w-0 ${className}`}>
      <img
        src="/pbr.png"
        alt="Logo Petisi Bela Rakyat"
        className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 object-contain"
        width={40}
        height={40}
      />
      {showText && (
        <div className="flex flex-col leading-none min-w-0">
          {/* Mobile: "PBR" abbreviation | Desktop: full name */}
          <span className="font-heading text-sm sm:text-base font-extrabold tracking-tight whitespace-nowrap">
            <span className="sm:hidden">PBR</span>
            <span className="hidden sm:inline">Petisi Bela Rakyat</span>
          </span>
          {/* Subtitle hidden on mobile to save space */}
          <span className="hidden sm:block text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium whitespace-nowrap">
            Membela Suara Rakyat
          </span>
        </div>
      )}
    </div>
  );
}
