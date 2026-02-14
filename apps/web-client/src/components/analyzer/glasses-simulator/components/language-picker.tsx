"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { LanguageOption, GlassesTheme } from "../types";

/** Compact AR-styled language picker dropdown */
export function LanguagePicker({
  languages,
  selected,
  onChange,
  theme,
}: {
  languages: LanguageOption[];
  selected: LanguageOption;
  onChange: (lang: LanguageOption) => void;
  theme: GlassesTheme;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-auto relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1 rounded-md ${theme.border} border ${theme.panelBg} px-1.5 py-0.5 backdrop-blur-sm transition-colors hover:brightness-125`}
      >
        <span className="text-[9px]">{selected.flag}</span>
        <span className={`font-mono text-[7px] uppercase ${theme.text}`}>
          {selected.code}
        </span>
        <ChevronDown
          className={`h-2 w-2 ${theme.textDim} transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 top-full z-50 mt-0.5 max-h-36 overflow-y-auto rounded-md ${theme.border} border ${theme.panelBg} py-0.5 backdrop-blur-xl`}
          style={{ minWidth: "100px" }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                onChange(lang);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-1.5 px-2 py-0.5 text-left transition-colors hover:brightness-150 ${
                lang.code === selected.code ? theme.accent : theme.textDim
              }`}
            >
              <span className="text-[9px]">{lang.flag}</span>
              <span className="font-mono text-[8px]">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
