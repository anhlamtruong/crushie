/* ─── Shared types for Glasses Simulator ──────────────────────────────────── */

export type GlassesFrameType = "wayfarer" | "aviator" | "sport" | "round";

export interface GlassesTheme {
  text: string;
  textDim: string;
  glow: string;
  border: string;
  panelBg: string;
  accent: string;
  scanline: string;
  overlayClass: string;
  hudClass: string;
}

export interface GlassesConfig {
  label: string;
  subtitle: string;
  clipPath: string;
  theme: GlassesTheme;
}

export interface LanguageOption {
  code: string;
  /** BCP-47 tag for SpeechRecognition.lang */
  speechCode: string;
  label: string;
  flag: string;
  /** Instruction snippet injected into Gemini prompt */
  promptHint: string;
}

export type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

export type SpeechRecognitionFactory = new () => SpeechRecognitionLike;

/** Context entry captured from environment / conversation / analysis */
export interface ContextEntry {
  id: string;
  timestamp: number;
  type: "environment" | "speech" | "visual_cue" | "analysis" | "emotion";
  label: string;
  value: string;
}

export interface MetaGlassesSimulatorProps {
  targetVibe: string;
  matchName?: string;
}

export const POLL_MS = 7000;
export const MIN_CONFIDENCE_TO_SPEAK = 0.8;
