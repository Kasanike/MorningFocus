"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/utils/supabase/client";
import { translations, type SupportedLocale } from "@/locales";
import { detectBrowserLanguage } from "@/hooks/useLanguageDetection";
import type { LocaleKeys } from "@/locales/en";

interface LanguageContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: LocaleKeys;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const LS_KEY = "morning-focus-locale";

function getStoredLocale(): SupportedLocale | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LS_KEY);
  if (stored === "en" || stored === "sk") return stored;
  return null;
}

function storeLocale(locale: SupportedLocale) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_KEY, locale);
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>("en");
  const [mounted, setMounted] = useState(false);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    storeLocale(newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  // On mount: load from localStorage, or detect browser, or default to 'en'
  useEffect(() => {
    setMounted(true);
    const stored = getStoredLocale();
    if (stored) {
      setLocaleState(stored);
      document.documentElement.lang = stored;
    } else {
      const detected = detectBrowserLanguage();
      setLocaleState(detected);
      storeLocale(detected);
      document.documentElement.lang = detected;
    }
  }, []);

  // Sync with Supabase profile when user is logged in (only if Supabase is configured)
  useEffect(() => {
    if (!mounted) return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;

    let subscription: { unsubscribe: () => void } | null = null;

    const loadProfileLanguage = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("language_preference, created_at")
          .eq("id", user.id)
          .maybeSingle();

        if (error) return;

        const profileLang = profile?.language_preference as SupportedLocale | null;
        const detected = detectBrowserLanguage();

        // First login: if profile was created recently and browser is Slovak, update profile
        const created = profile?.created_at ? new Date(profile.created_at).getTime() : 0;
        const isNewProfile = Date.now() - created < 2 * 60 * 1000; // within 2 min
        if (isNewProfile && detected === "sk" && profileLang === "en") {
          await supabase
            .from("profiles")
            .update({ language_preference: "sk" })
            .eq("id", user.id);
          setLocaleState("sk");
          storeLocale("sk");
          if (typeof document !== "undefined") document.documentElement.lang = "sk";
          return;
        }

        if (profileLang && (profileLang === "en" || profileLang === "sk")) {
          setLocaleState(profileLang);
          storeLocale(profileLang);
          if (typeof document !== "undefined") document.documentElement.lang = profileLang;
        }
      } catch {
        // Supabase not configured or profiles table missing - use localStorage only
      }
    };

    void loadProfileLanguage();

    try {
      const supabase = createClient();
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(() => {
        void loadProfileLanguage();
      });
      subscription = sub;
    } catch {
      // Supabase client failed to initialize
    }

    return () => subscription?.unsubscribe();
  }, [mounted]);

  const t = translations[locale];

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback when used outside provider (e.g. during SSR or misconfiguration)
    return {
      locale: "en" as SupportedLocale,
      setLocale: () => {},
      t: translations.en,
    };
  }
  return ctx;
}
