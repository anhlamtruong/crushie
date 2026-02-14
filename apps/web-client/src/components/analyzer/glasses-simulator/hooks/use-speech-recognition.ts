"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  SpeechRecognitionLike,
  SpeechRecognitionFactory,
  LanguageOption,
} from "../types";

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  voiceInput: string;
  speechSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  setAutoVoice: (enabled: boolean) => void;
  autoVoiceEnabled: boolean;
  /** Sync language – restarts recognition with new BCP-47 tag */
  setLanguage: (lang: LanguageOption) => void;
  /** Callback for external consumers: current topic derived from voice */
  currentTopic: string;
}

export function useSpeechRecognition(
  initialLanguage: LanguageOption,
): UseSpeechRecognitionReturn {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const autoVoiceEnabledRef = useRef(true);
  const languageRef = useRef(initialLanguage);

  const [isListening, setIsListening] = useState(false);
  const [voiceInput, setVoiceInput] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [autoVoiceEnabled, setAutoVoiceEnabledState] = useState(true);

  const speechSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    const w = window as Window & {
      SpeechRecognition?: SpeechRecognitionFactory;
      webkitSpeechRecognition?: SpeechRecognitionFactory;
    };
    return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    if (!speechSupported || typeof window === "undefined") return;
    const w = window as Window & {
      SpeechRecognition?: SpeechRecognitionFactory;
      webkitSpeechRecognition?: SpeechRecognitionFactory;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = languageRef.current.speechCode;
    r.interimResults = true;
    r.maxAlternatives = 1;
    r.continuous = false;
    r.onresult = (e) => {
      const t = Array.from(e.results)
        .map((x) => x[0]?.transcript ?? "")
        .join(" ")
        .trim();
      setVoiceInput(t);
      if (t) setCurrentTopic(t);
    };
    r.onerror = () => setIsListening(false);
    r.onend = () => {
      setIsListening(false);
      if (autoVoiceEnabledRef.current) {
        window.setTimeout(() => {
          recognitionRef.current = null;
          startListening();
        }, 250);
      }
    };
    recognitionRef.current = r;
    setIsListening(true);
    r.start();
  }, [speechSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const setAutoVoice = useCallback(
    (enabled: boolean) => {
      autoVoiceEnabledRef.current = enabled;
      setAutoVoiceEnabledState(enabled);
      if (!enabled) {
        recognitionRef.current?.stop();
        setIsListening(false);
      } else if (speechSupported && !isListening) {
        startListening();
      }
    },
    [speechSupported, isListening, startListening],
  );

  const setLanguage = useCallback((lang: LanguageOption) => {
    languageRef.current = lang;
    // Restart recognition with new language
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  /* Auto-start when autoVoice flips on */
  useEffect(() => {
    autoVoiceEnabledRef.current = autoVoiceEnabled;
    if (!autoVoiceEnabled) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    if (speechSupported && !isListening) startListening();
  }, [autoVoiceEnabled, isListening, speechSupported, startListening]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    isListening,
    voiceInput,
    speechSupported,
    startListening,
    stopListening,
    setAutoVoice,
    autoVoiceEnabled,
    setLanguage,
    currentTopic,
  };
}
