"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { fetchBootstrap, type BootstrapData, type ProfilePlan } from "@/lib/db";
import { isPro as checkIsPro } from "@/lib/subscription";

type Plan = "free" | "pro";

interface BootstrapContextValue extends BootstrapData {
  loading: boolean;
  refresh: () => Promise<void>;
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
      setOnboardingStatus(data.onboardingStatus);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isPro = checkIsPro(profile);
  const plan = profile?.plan ?? "free";

  const value: BootstrapContextValue = {
    profile,
    onboardingStatus,
    loading,
    refresh,
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
