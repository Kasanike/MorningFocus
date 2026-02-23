"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function isSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

/** Prefer English: Samantha (iOS), then Google UK English Female, then any English. */
function selectVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => v.lang.startsWith("en"));
  if (en.length === 0) return voices[0] ?? null;
  const samantha = en.find((v) => v.name.includes("Samantha"));
  if (samantha) return samantha;
  const googleUK = en.find((v) => v.name.includes("Google UK English Female"));
  if (googleUK) return googleUK;
  return en[0] ?? null;
}

export interface UseTextToSpeechOptions {
  texts: string[];
  /** Delay in ms after each text before speaking the next. Length can be texts.length (last is before onComplete). */
  delaysAfter?: number[];
  rate?: number;
  pitch?: number;
  onProgress?: (index: number) => void;
  onComplete?: () => void;
}

export function useTextToSpeech({
  texts,
  delaysAfter = [],
  rate = 1,
  pitch = 1,
  onProgress,
  onComplete,
}: UseTextToSpeechOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const indexRef = useRef(-1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getDelayAfter = useCallback(
    (i: number): number => {
      if (i < 0 || i >= delaysAfter.length) return 0;
      return delaysAfter[i] ?? 0;
    },
    [delaysAfter]
  );

  const speakNext = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const next = indexRef.current + 1;
    if (next >= texts.length) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentIndex(texts.length - 1);
      indexRef.current = texts.length - 1;
      onComplete?.();
      return;
    }

    indexRef.current = next;
    setCurrentIndex(next);
    onProgress?.(next);

    const text = texts[next];
    if (!text || text.trim() === "") {
      const delay = getDelayAfter(next);
      if (delay > 0) {
        timeoutRef.current = setTimeout(speakNext, delay);
      } else {
        speakNext();
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = rate;
    utterance.pitch = pitch;
    const voice = selectVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      const delay = getDelayAfter(next);
      if (delay > 0) {
        timeoutRef.current = setTimeout(speakNext, delay);
      } else {
        speakNext();
      }
    };
    utterance.onerror = () => {
      const delay = getDelayAfter(next);
      if (delay > 0) {
        timeoutRef.current = setTimeout(speakNext, delay);
      } else {
        speakNext();
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [texts, rate, pitch, getDelayAfter, onProgress, onComplete]);

  const play = useCallback(() => {
    if (!isSpeechSupported()) return;
    if (texts.length === 0) return;

    window.speechSynthesis.getVoices();
    window.speechSynthesis.cancel();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    indexRef.current = -1;
    setIsPlaying(true);
    setIsPaused(false);
    speakNext();
  }, [texts.length, speakNext]);

  const pause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.resume();
    setIsPlaying(true);
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    indexRef.current = -1;
    setCurrentIndex(-1);
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  // Load voices (Chrome needs voiceschanged)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => selectVoice();
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Cleanup on unmount or when stopping
  useEffect(() => {
    return () => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    play,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    currentIndex,
    isSupported: isSpeechSupported(),
  };
}
