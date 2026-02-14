import { useMemo } from "react";
import type { GlassesFrameType, GlassesConfig, LanguageOption } from "./types";

/* ─── Per-frame theme configurations ──────────────────────────────────────── */

export const GLASSES_CONFIG: Record<GlassesFrameType, GlassesConfig> = {
  wayfarer: {
    label: "Wayfarer",
    subtitle: "Classic Noir",
    clipPath:
      "polygon(3% 12%, 10% 6%, 35% 3%, 49% 8%, 51% 8%, 65% 3%, 90% 6%, 97% 12%, 96% 88%, 90% 94%, 65% 97%, 51% 92%, 49% 92%, 35% 97%, 10% 94%, 4% 88%)",
    theme: {
      text: "text-rose-200",
      textDim: "text-rose-300/60",
      glow: "rgba(251,113,133,0.55)",
      border: "border-rose-400/25",
      panelBg: "bg-neutral-950/50",
      accent: "text-rose-400",
      scanline: "bg-rose-400/50",
      overlayClass: "bg-neutral-950/35",
      hudClass: "",
    },
  },
  aviator: {
    label: "Aviator",
    subtitle: "Flight HUD",
    clipPath:
      "polygon(8% 10%, 18% 4%, 38% 4%, 49% 10%, 51% 10%, 62% 4%, 82% 4%, 92% 10%, 95% 50%, 92% 90%, 82% 96%, 62% 96%, 51% 90%, 49% 90%, 38% 96%, 18% 96%, 8% 90%, 5% 50%)",
    theme: {
      text: "text-amber-200",
      textDim: "text-amber-300/60",
      glow: "rgba(251,191,36,0.55)",
      border: "border-amber-400/25",
      panelBg: "bg-neutral-950/50",
      accent: "text-amber-400",
      scanline: "bg-amber-400/40",
      overlayClass: "bg-neutral-950/30",
      hudClass: "aviator-grid",
    },
  },
  sport: {
    label: "Sport",
    subtitle: "Pulse",
    clipPath:
      "polygon(2% 20%, 12% 8%, 38% 4%, 49% 8%, 51% 8%, 62% 4%, 88% 8%, 98% 20%, 96% 85%, 86% 94%, 62% 97%, 51% 92%, 49% 92%, 38% 97%, 14% 94%, 4% 85%)",
    theme: {
      text: "text-fuchsia-200",
      textDim: "text-fuchsia-300/60",
      glow: "rgba(232,121,249,0.6)",
      border: "border-fuchsia-400/30",
      panelBg: "bg-neutral-950/55",
      accent: "text-fuchsia-400",
      scanline: "bg-fuchsia-500/50",
      overlayClass: "bg-neutral-950/40",
      hudClass: "",
    },
  },
  round: {
    label: "Round",
    subtitle: "Ethereal",
    clipPath: "ellipse(48% 45% at 50% 50%)",
    theme: {
      text: "text-pink-100",
      textDim: "text-pink-200/60",
      glow: "rgba(244,114,182,0.4)",
      border: "border-pink-300/20",
      panelBg: "bg-white/[0.06]",
      accent: "text-pink-300",
      scanline: "bg-pink-300/30",
      overlayClass: "bg-neutral-950/25",
      hudClass: "ethereal-sparkle",
    },
  },
};

/* ─── Language presets ─────────────────────────────────────────────────────── */

export const LANGUAGES: LanguageOption[] = [
  {
    code: "en",
    speechCode: "en-US",
    label: "English",
    flag: "🇺🇸",
    promptHint: "Respond in English.",
  },
  {
    code: "vi",
    speechCode: "vi-VN",
    label: "Tiếng Việt",
    flag: "🇻🇳",
    promptHint: "Respond in Vietnamese (Tiếng Việt).",
  },
  {
    code: "es",
    speechCode: "es-ES",
    label: "Español",
    flag: "🇪🇸",
    promptHint: "Respond in Spanish (Español).",
  },
  {
    code: "fr",
    speechCode: "fr-FR",
    label: "Français",
    flag: "🇫🇷",
    promptHint: "Respond in French (Français).",
  },
  {
    code: "de",
    speechCode: "de-DE",
    label: "Deutsch",
    flag: "🇩🇪",
    promptHint: "Respond in German (Deutsch).",
  },
  {
    code: "ja",
    speechCode: "ja-JP",
    label: "日本語",
    flag: "🇯🇵",
    promptHint: "Respond in Japanese (日本語).",
  },
  {
    code: "ko",
    speechCode: "ko-KR",
    label: "한국어",
    flag: "🇰🇷",
    promptHint: "Respond in Korean (한국어).",
  },
  {
    code: "zh",
    speechCode: "zh-CN",
    label: "中文",
    flag: "🇨🇳",
    promptHint: "Respond in Mandarin Chinese (中文).",
  },
  {
    code: "pt",
    speechCode: "pt-BR",
    label: "Português",
    flag: "🇧🇷",
    promptHint: "Respond in Portuguese (Português).",
  },
  {
    code: "th",
    speechCode: "th-TH",
    label: "ไทย",
    flag: "🇹🇭",
    promptHint: "Respond in Thai (ไทย).",
  },
  {
    code: "hi",
    speechCode: "hi-IN",
    label: "हिन्दी",
    flag: "🇮🇳",
    promptHint: "Respond in Hindi (हिन्दी).",
  },
  {
    code: "ar",
    speechCode: "ar-SA",
    label: "العربية",
    flag: "🇸🇦",
    promptHint: "Respond in Arabic (العربية).",
  },
];

/* ─── Theme hook ──────────────────────────────────────────────────────────── */

export function useGlassesTheme(frame: GlassesFrameType) {
  return useMemo(() => GLASSES_CONFIG[frame], [frame]);
}
