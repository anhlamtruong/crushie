"use client";

import { useCallback, useRef } from "react";

/**
 * Hook that manages text-to-speech playback via the /api/realtime-tts endpoint.
 * Handles auto-cancellation of previous audio and mute state.
 */
export function useTts() {
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const playTts = useCallback(async (text: string, muted: boolean) => {
    if (muted) return;
    try {
      const response = await fetch("/api/realtime-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok || response.status === 204) return;
      const blob = await response.blob();
      if (!blob.size) return;
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current.src = "";
      }
      activeAudioRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch {
      // Gracefully ignore TTS errors
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.src = "";
      activeAudioRef.current = null;
    }
  }, []);

  return { playTts, stopAudio };
}
