import { create } from "zustand";
import { translations, type SupportedLocale } from "@/locales";
import type { LocaleKeys } from "@/locales/en";

const LS_KEY = "morning-focus-locale";

export function getStoredLocale(): SupportedLocale | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(LS_KEY);
  return v === "en" || v === "sk" ? v : null;
}

interface LanguageState {
  locale: SupportedLocale;
  t: LocaleKeys;
  setLocale: (locale: SupportedLocale) => void;
}

export const useLanguageStore = create<LanguageState>()((set) => ({
  locale: "en",
  t: translations.en,
  setLocale: (locale) => {
    set({ locale, t: translations[locale] });
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEY, locale);
      document.documentElement.lang = locale;
    }
  },
}));
