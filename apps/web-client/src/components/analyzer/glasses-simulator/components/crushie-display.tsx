"use client";

import { Loader2 } from "lucide-react";
import type { GlassesTheme } from "../types";

/**
 * CrushieDisplay — The floating side-prism panel showing AI coaching suggestions.
 *
 * Uses gradient-mask fade instead of overflow-hidden so text floats
 * in space rather than being hard-clipped.
 */
export function CrushieDisplay({
  suggestion,
  visualCue,
  isPending,
  theme,
  languageFlag,
  compactMobile = false,
}: {
  suggestion: string;
  visualCue: string;
  isPending: boolean;
  theme: GlassesTheme;
  languageFlag: string;
  compactMobile?: boolean;
}) {
  return (
    <div
      className={`pointer-events-none flex flex-col ${compactMobile ? "gap-0.5 rounded-xl px-2 py-1.5" : "gap-1 rounded-lg px-2.5 py-2"} ${theme.border} border ${theme.panelBg} backdrop-blur-md`}
      style={{
        maxWidth: compactMobile ? "100%" : "min(56%, 280px)",
        willChange: "transform",
        transform: "translateZ(0)",
        filter: `drop-shadow(0 0 8px ${theme.glow})`,
      }}
    >
      {/* header */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`font-mono text-[7px] uppercase tracking-[0.18em] ${theme.textDim}`}
        >
          {languageFlag} Crushie
        </span>
        {isPending && (
          <Loader2 className={`h-2.5 w-2.5 animate-spin ${theme.accent}`} />
        )}
      </div>

      {/* Suggestion — gradient-mask, NO overflow-hidden */}
      <div
        style={
          compactMobile
            ? undefined
            : {
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 6%, black 88%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 6%, black 88%, transparent 100%)",
              }
        }
      >
        <p
          className={`font-mono ${compactMobile ? "text-[9px] leading-normal" : "text-[10px] leading-relaxed"} ${theme.text}`}
          style={{ textShadow: `0 0 8px ${theme.glow}` }}
        >
          {suggestion}
        </p>
      </div>

      {/* Visual cue */}
      <p
        className={`font-mono ${compactMobile ? "text-[6px] tracking-[0.18em]" : "text-[7px] tracking-widest"} uppercase ${theme.textDim}`}
      >
        cue: {visualCue}
      </p>
    </div>
  );
}
