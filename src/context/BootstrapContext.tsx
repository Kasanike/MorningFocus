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
import { fetchBootstrap, type BootstrapData, type ProfilePlan } from "@/lib/db";
import { isPro as checkIsPro } from "@/lib/subscription";

type Plan = "free" | "pro";

interface BootstrapContextValue extends BootstrapData {
  loading: boolean;
  refresh: () => Promise<void>;
  /** Call after onboarding flow is saved so the UI exits onboarding immediately without waiting for refetch. */
  markOnboardingCompleted: () => void;
  isPro: boolean;
  plan: Plan;
}

const BootstrapContext = createContext<BootstrapContextValue | null>(null);

export function BootstrapProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfilePlan | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<BootstrapData["onboardingStatus"]>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBootstrap();
      setProfile(data.profile);
      setOnboardingStatus((prev) => {
        const next = data.onboardingStatus;
        if (!next) return prev ?? null;
        // Never overwrite onboarding completed with incomplete (avoids loop after finishing onboarding)
        if (prev?.onboardingCompleted) {
          return { ...next, onboardingCompleted: true };
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const markOnboardingCompleted = useCallback(() => {
    setOnboardingStatus((prev) =>
      prev
        ? { ...prev, onboardingCompleted: true }
        : { onboardingCompleted: true, hasPrinciples: false, hasProtocol: false }
    );
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Re-fetch when auth session is restored (e.g. after mobile app reload)
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "INITIAL_SESSION"
      ) {
        if (session?.user) void refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, [refresh]);

  const isPro = checkIsPro(profile);
  const plan = profile?.plan ?? "free";

  const value: BootstrapContextValue = {
    profile,
    onboardingStatus,
    loading,
    refresh,
    markOnboardingCompleted,
    isPro,
    plan,
  };

  return (
    <BootstrapContext.Provider value={value}>
      {children}
    </BootstrapContext.Provider>
  );
}

export function useBootstrap() {
  return useContext(BootstrapContext);
}
