"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useScribe } from "@elevenlabs/react";
import type {
  LanguageOption,
  SpeechRecognitionFactory,
  SpeechRecognitionLike,
} from "../types";

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  voiceInput: string;
  recentUtterances: string[];
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
  const autoVoiceEnabledRef = useRef(true);
  const languageRef = useRef(initialLanguage);
  const scribeRef = useRef<ReturnType<typeof useScribe> | null>(null);
  const lastCommittedTranscriptRef = useRef("");
  const manuallyStoppedRef = useRef(false);
  const connectingRef = useRef(false);
  const browserRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);
  const elevenLabsUnavailableRef = useRef(false);

  const [isListening, setIsListening] = useState(false);
  const [voiceInput, setVoiceInput] = useState("");
  const [recentUtterances, setRecentUtterances] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState("");
  const [autoVoiceEnabled, setAutoVoiceEnabledState] = useState(true);

  const speechSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.navigator?.mediaDevices?.getUserMedia);
  }, []);

  const browserSpeechSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    const w = window as Window & {
      SpeechRecognition?: SpeechRecognitionFactory;
      webkitSpeechRecognition?: SpeechRecognitionFactory;
    };
    return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
  }, []);

  const commitTranscript = useCallback((text: string) => {
    const cleaned = text.trim();
    if (!cleaned) return;

    setVoiceInput(cleaned);
    setCurrentTopic(cleaned);

    const normalized = cleaned.replace(/\s+/g, " ").trim();
    if (
      normalized.length >= 8 &&
      normalized !== lastCommittedTranscriptRef.current
    ) {
      lastCommittedTranscriptRef.current = normalized;
      setRecentUtterances((prev) => [...prev.slice(-4), normalized]);
    }
  }, []);

  const startBrowserFallback = useCallback(() => {
    if (!browserSpeechSupported || typeof window === "undefined") {
      setIsListening(false);
      return;
    }

    if (browserRecognitionRef.current) return;

    const w = window as Window & {
      SpeechRecognition?: SpeechRecognitionFactory;
      webkitSpeechRecognition?: SpeechRecognitionFactory;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setIsListening(false);
      return;
    }

    const recognition = new Ctor();
    recognition.lang = languageRef.current.speechCode;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (!transcript) return;

      setVoiceInput(transcript);
      setCurrentTopic(transcript);
      commitTranscript(transcript);
    };

    recognition.onerror = () => {
      browserRecognitionRef.current = null;

      if (!autoVoiceEnabledRef.current || manuallyStoppedRef.current) {
        setIsListening(false);
        return;
      }

      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
      }

      restartTimeoutRef.current = window.setTimeout(() => {
        restartTimeoutRef.current = null;
        startBrowserFallback();
      }, 260);
    };

    recognition.onend = () => {
      browserRecognitionRef.current = null;

      if (!autoVoiceEnabledRef.current || manuallyStoppedRef.current) {
        setIsListening(false);
        return;
      }

      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
      }

      restartTimeoutRef.current = window.setTimeout(() => {
        restartTimeoutRef.current = null;
        startBrowserFallback();
      }, 180);
    };

    browserRecognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }, [browserSpeechSupported, commitTranscript]);

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    onPartialTranscript: (data: { text?: string }) => {
      const text = data?.text?.trim() ?? "";
      if (!text) return;
      setVoiceInput(text);
      setCurrentTopic(text);
    },
    onCommittedTranscript: (data: { text?: string }) => {
      const text = data?.text?.trim() ?? "";
      commitTranscript(text);
    },
    onError: () => {
      if (manuallyStoppedRef.current) return;
      elevenLabsUnavailableRef.current = true;
      connectingRef.current = false;
      if (autoVoiceEnabledRef.current) {
        startBrowserFallback();
      }
    },
  });

  useEffect(() => {
    scribeRef.current = scribe;
  }, [scribe]);

  const startListening = useCallback(async () => {
    const scribeClient = scribeRef.current;
    if (!scribeClient) return;

    if (!speechSupported) return;
    if (scribeClient.isConnected || browserRecognitionRef.current) return;
    if (connectingRef.current) return;

    manuallyStoppedRef.current = false;
    connectingRef.current = true;

    if (elevenLabsUnavailableRef.current) {
      connectingRef.current = false;
      startBrowserFallback();
      return;
    }

    try {
      const tokenRes = await fetch("/api/realtime-scribe-token", {
        method: "GET",
        cache: "no-store",
      });

      if (!tokenRes.ok) {
        elevenLabsUnavailableRef.current = true;
        connectingRef.current = false;
        startBrowserFallback();
        return;
      }

      const payload = (await tokenRes.json()) as { token?: string };
      if (!payload.token) {
        elevenLabsUnavailableRef.current = true;
        connectingRef.current = false;
        startBrowserFallback();
        return;
      }

      if (!autoVoiceEnabledRef.current || manuallyStoppedRef.current) {
        connectingRef.current = false;
        return;
      }

      await scribeClient.connect({
        token: payload.token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setIsListening(true);
    } catch {
      elevenLabsUnavailableRef.current = true;
      connectingRef.current = false;
      startBrowserFallback();
      return;
    } finally {
      connectingRef.current = false;
    }
  }, [speechSupported, startBrowserFallback]);

  const stopListening = useCallback(() => {
    const scribeClient = scribeRef.current;

    manuallyStoppedRef.current = true;
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    try {
      browserRecognitionRef.current?.stop();
    } catch {
      // ignore browser speech stop race errors
    }
    browserRecognitionRef.current = null;
    connectingRef.current = false;
    void Promise.resolve(scribeClient?.disconnect()).catch(() => {
      // ignore disconnect races while user manually turns voice off
    });
    setIsListening(false);
  }, []);

  const setAutoVoice = useCallback(
    (enabled: boolean) => {
      autoVoiceEnabledRef.current = enabled;
      setAutoVoiceEnabledState(enabled);

      if (!enabled) {
        stopListening();
      } else if (speechSupported && !isListening) {
        manuallyStoppedRef.current = false;
        void startListening();
      }
    },
    [speechSupported, isListening, startListening, stopListening],
  );

  const setLanguage = useCallback(
    (lang: LanguageOption) => {
      const scribeClient = scribeRef.current;

      languageRef.current = lang;
      if (browserRecognitionRef.current) {
        try {
          browserRecognitionRef.current.stop();
        } catch {
          // ignore browser speech stop race errors
        }
        browserRecognitionRef.current = null;
        if (autoVoiceEnabledRef.current) {
          void startListening();
        }
        return;
      }

      if (scribeClient?.isConnected) {
        void Promise.resolve(scribeClient.disconnect()).catch(() => {
          // ignore disconnect races while switching language
        });
        if (autoVoiceEnabledRef.current) {
          void startListening();
        }
      }
    },
    [startListening],
  );

  useEffect(() => {
    if (scribe.isConnected) {
      setIsListening(true);
      return;
    }

    if (!browserRecognitionRef.current) {
      setIsListening(false);
    }
  }, [scribe.isConnected]);

  /* Auto-start when autoVoice flips on */
  useEffect(() => {
    autoVoiceEnabledRef.current = autoVoiceEnabled;
    if (!autoVoiceEnabled) {
      stopListening();
      return;
    }
    if (speechSupported && !isListening) void startListening();
  }, [
    autoVoiceEnabled,
    isListening,
    speechSupported,
    startListening,
    stopListening,
  ]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      manuallyStoppedRef.current = true;
      connectingRef.current = false;
      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
      }
      try {
        browserRecognitionRef.current?.stop();
      } catch {
        // ignore browser speech stop race errors
      }
      void Promise.resolve(scribeRef.current?.disconnect()).catch(() => {
        // ignore disconnect races on unmount
      });
    };
  }, []);

  return {
    isListening,
    voiceInput,
    recentUtterances,
    speechSupported,
    startListening,
    stopListening,
    setAutoVoice,
    autoVoiceEnabled,
    setLanguage,
    currentTopic,
  };
}
