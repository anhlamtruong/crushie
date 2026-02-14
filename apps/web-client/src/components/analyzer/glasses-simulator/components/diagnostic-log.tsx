"use client";

import { useEffect, useRef } from "react";

/** Scrolling diagnostic log — auto-scrolls to bottom with gradient-mask fade */
export function DiagnosticLog({
  entries,
  textClass,
  dimClass,
}: {
  entries: string[];
  textClass: string;
  dimClass: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-0.5 max-h-18 overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
      }}
    >
      {entries.map((entry, i) => (
        <p
          key={`${entry}-${i}`}
          className={`font-mono text-[8px] leading-tight tracking-wider uppercase whitespace-nowrap ${
            i === entries.length - 1 ? textClass : dimClass
          }`}
        >
          {entry}
        </p>
      ))}
    </div>
  );
}
