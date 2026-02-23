"use client";

import { useEffect, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStreakStore } from "@/store/streakStore";

export function StreakProvider({ children }: { children: ReactNode }) {
  const refresh = useStreakStore((s) => s.refresh);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return <>{children}</>;
}

export function useStreak() {
  return useStreakStore(
    useShallow((s) => ({
      currentStreak: s.currentStreak,
      bestStreak: s.bestStreak,
      totalMornings: s.totalMornings,
      weekCompletions: s.weekCompletions,
      loading: s.loading,
      refresh: s.refresh,
    }))
  );
}
