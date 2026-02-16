"use client";

import { useCallback } from "react";
import type { SupportedLocale } from "@/locales";

/**
 * Detects browser's preferred language.
 * Returns 'sk' if navigator.language starts with 'sk', else 'en'.
 */
export function detectBrowserLanguage(): SupportedLocale {
  if (typeof window === "undefined") return "en";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("sk")) return "sk";
  return "en";
}

/**
 * Hook for language detection logic.
 * Use on first login/registration to set initial language_preference in Supabase.
 */
export function useLanguageDetection() {
  const detected = useCallback(detectBrowserLanguage, []);

  return {
    detectedLanguage: detected(),
  };
}
