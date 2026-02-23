"use client";

import { useEffect, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import { createClient } from "@/utils/supabase/client";
import { type SupportedLocale } from "@/locales";
import { detectBrowserLanguage } from "@/hooks/useLanguageDetection";
import { useLanguageStore, getStoredLocale } from "@/store/languageStore";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const setLocale = useLanguageStore((s) => s.setLocale);

  useEffect(() => {
    // 1. Hydrate from localStorage or browser detection
    const stored = getStoredLocale();
    setLocale(stored ?? detectBrowserLanguage());

    // 2. Sync with Supabase profile (if configured)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;

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
        const created = profile?.created_at ? new Date(profile.created_at).getTime() : 0;
        const isNewProfile = Date.now() - created < 2 * 60 * 1000;

        if (isNewProfile && detected === "sk" && profileLang === "en") {
          await supabase
            .from("profiles")
            .update({ language_preference: "sk" })
            .eq("id", user.id);
          setLocale("sk");
          return;
        }
        if (profileLang === "en" || profileLang === "sk") {
          setLocale(profileLang);
        }
      } catch {
        // Supabase not configured or profiles table missing
      }
    };

    void loadProfileLanguage();

    let cleanup: (() => void) | undefined;
    try {
      const supabase = createClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(() => {
        void loadProfileLanguage();
      });
      cleanup = () => subscription.unsubscribe();
    } catch {
      // ignore
    }

    return cleanup;
  }, [setLocale]);

  return <>{children}</>;
}

export function useLanguage() {
  return useLanguageStore(
    useShallow((s) => ({ locale: s.locale, t: s.t, setLocale: s.setLocale }))
  );
}
