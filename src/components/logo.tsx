"use client";

export function Logo({ className = "", showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/30">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      </div>
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
