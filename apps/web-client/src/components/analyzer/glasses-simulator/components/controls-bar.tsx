"use client";

import { useState } from "react";
import {
  Moon,
  Sun,
  Camera,
  Volume2,
  VolumeX,
  Settings2,
  X,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GlassesFrameType, GlassesConfig, GlassesTheme } from "../types";
import { AudioWaveform } from "./audio-waveform";

interface ControlsBarProps {
  frameType: GlassesFrameType;
  glassesConfigs: Record<GlassesFrameType, GlassesConfig>;
  onFrameChange: (type: GlassesFrameType) => void;
  nightVision: boolean;
  onToggleNightVision: () => void;
  onScreenshot: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  autoVoiceEnabled: boolean;
  onToggleAutoVoice: () => void;
  speechSupported: boolean;
  isListening: boolean;
  theme: GlassesTheme;
  confidencePct: number;
  isMobile: boolean;
  languageCode: string;
  languageFlag: string;
  onCycleLanguage: () => void;
}

export function ControlsBar({
  frameType,
  glassesConfigs,
  onFrameChange,
  nightVision,
  onToggleNightVision,
  onScreenshot,
  isMuted,
  onToggleMute,
  autoVoiceEnabled,
  onToggleAutoVoice,
  speechSupported,
  isListening,
  theme,
  confidencePct,
  isMobile,
  languageCode,
  languageFlag,
  onCycleLanguage,
}: ControlsBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile unified options menu */}
      <div className="fixed right-3 top-3 z-50 lg:hidden">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-rose-300/40 bg-black/60 text-rose-200 backdrop-blur-md"
          onClick={() => setMenuOpen((p) => !p)}
          aria-label={menuOpen ? "Close options" : "Open options"}
        >
          {menuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Settings2 className="h-4 w-4" />
          )}
          <span className="ml-1 text-[11px]">Menu</span>
        </Button>

        {menuOpen && (
          <div className="mt-2 w-[86vw] max-w-sm rounded-xl border border-rose-300/30 bg-black/85 p-3 text-rose-100 shadow-xl backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-wider text-rose-200/90">
                HUD Options
              </p>
              <span className="font-mono text-[11px] text-rose-300/80">
                {confidencePct}%
              </span>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-1.5">
              {(Object.keys(glassesConfigs) as GlassesFrameType[]).map(
                (type) => {
                  const c = glassesConfigs[type];
                  const active = frameType === type;
                  return (
                    <Button
                      key={type}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className={
                        active
                          ? "bg-rose-500 text-white hover:bg-rose-600"
                          : "border-rose-300/40 bg-black/30 text-rose-300 hover:bg-rose-500/10"
                      }
                      onClick={() => onFrameChange(type)}
                    >
                      {c.label}
                    </Button>
                  );
                },
              )}
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-rose-300/40 bg-black/30 text-[11px] text-rose-300 hover:bg-rose-500/10"
                onClick={onToggleNightVision}
              >
                {nightVision ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span className="ml-1">Night</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-rose-300/40 bg-black/30 text-[11px] text-rose-300 hover:bg-rose-500/10"
                onClick={onScreenshot}
              >
                <Camera className="h-4 w-4" />
                <span className="ml-1">Capture</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-rose-300/40 bg-black/30 text-[11px] text-rose-300 hover:bg-rose-500/10"
                onClick={onToggleAutoVoice}
                disabled={!speechSupported}
              >
                <AudioWaveform
                  active={isListening}
                  accentClass={`${theme.accent} bg-current`}
                  glowColor={theme.glow}
                />
                <span className="ml-1">
                  {!speechSupported
                    ? "Voice N/A"
                    : autoVoiceEnabled
                      ? "Auto Voice"
                      : "Voice Off"}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom action bar */}
      {isMobile && (
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-rose-300/30 bg-black/70 px-2 py-2 backdrop-blur-md lg:hidden">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-10 min-w-28 border-rose-300/40 bg-rose-500/20 text-[12px] text-rose-100 hover:bg-rose-500/30"
            onClick={onToggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            <span className="ml-1">{isMuted ? "TTS Off" : "TTS On"}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-10 min-w-28 border-rose-300/40 bg-rose-500/20 text-[12px] text-rose-100 hover:bg-rose-500/30"
            onClick={onCycleLanguage}
          >
            <Languages className="h-4 w-4" />
            <span className="ml-1">
              {languageFlag} {languageCode.toUpperCase()}
            </span>
          </Button>
        </div>
      )}

      <div className="mx-auto hidden w-full max-w-5xl flex-wrap items-center justify-center gap-2 px-4 lg:flex">
        {/* Frame picker */}
        {(Object.keys(glassesConfigs) as GlassesFrameType[]).map((type) => {
          const c = glassesConfigs[type];
          const active = frameType === type;
          return (
            <Button
              key={type}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              className={
                active
                  ? "bg-rose-500 text-white hover:bg-rose-600"
                  : "border-rose-300/40 bg-black/30 text-rose-300 hover:bg-rose-500/10"
              }
              onClick={() => onFrameChange(type)}
            >
              {c.label}
              <span className="ml-1 text-[9px] opacity-60">{c.subtitle}</span>
            </Button>
          );
        })}

        {/* Divider */}
        <span className="mx-1 h-5 w-px bg-rose-400/20" />

        {/* Night vision */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`h-8 w-8 hover:bg-rose-500/15 ${
            nightVision ? "text-green-400" : "text-rose-300 hover:text-rose-200"
          }`}
          onClick={onToggleNightVision}
          aria-label={
            nightVision ? "Disable night vision" : "Enable night vision"
          }
        >
          {nightVision ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        {/* Screenshot */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-rose-300 hover:bg-rose-500/15 hover:text-rose-200"
          onClick={onScreenshot}
          aria-label="Capture screenshot"
        >
          <Camera className="h-4 w-4" />
        </Button>

        {/* TTS toggle */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-rose-300/40 bg-black/30 text-[10px] text-rose-300 hover:bg-rose-500/10"
          onClick={onToggleMute}
          aria-label={isMuted ? "Enable TTS" : "Disable TTS"}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          <span className="ml-1">{isMuted ? "TTS Off" : "TTS On"}</span>
        </Button>

        {/* Auto-voice toggle */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-rose-300/40 bg-black/30 text-[10px] text-rose-300 hover:bg-rose-500/10"
          onClick={onToggleAutoVoice}
          disabled={!speechSupported}
        >
          <AudioWaveform
            active={isListening}
            accentClass={`${theme.accent} bg-current`}
            glowColor={theme.glow}
          />
          <span className="ml-1">
            {!speechSupported
              ? "Voice N/A"
              : autoVoiceEnabled
                ? "Auto Voice"
                : "Voice Off"}
          </span>
        </Button>

        {/* Confidence readout */}
        <span className="font-mono text-[10px] text-rose-400/80">
          {confidencePct}%
        </span>
      </div>
    </>
  );
}
