"use client";

import { useEffect, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import { createClient } from "@/utils/supabase/client";
import { useBootstrapStore } from "@/store/bootstrapStore";

export function BootstrapProvider({ children }: { children: ReactNode }) {
  const refresh = useBootstrapStore((s) => s.refresh);

  useEffect(() => {
    void refresh();

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

  return <>{children}</>;
}

export function useBootstrap() {
  return useBootstrapStore(
    useShallow((s) => ({
      profile: s.profile,
      onboardingStatus: s.onboardingStatus,
      loading: s.loading,
      isPro: s.isPro,
      plan: s.plan,
      refresh: s.refresh,
      markOnboardingCompleted: s.markOnboardingCompleted,
    }))
  );
}
