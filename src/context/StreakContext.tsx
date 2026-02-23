"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { fetchStreakData, type StreakData } from "@/lib/db";

interface StreakContextValue extends StreakData {
  loading: boolean;
  refresh: () => Promise<void>;
}

const StreakContext = createContext<StreakContextValue | null>(null);

export function StreakProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StreakData>({
    currentStreak: 0,
    bestStreak: 0,
    totalMornings: 0,
    weekCompletions: new Set(),
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchStreakData();
      setData(next);
    } catch {
      setData({
        currentStreak: 0,
        bestStreak: 0,
        totalMornings: 0,
        weekCompletions: new Set(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <StreakContext.Provider value={{ ...data, loading, refresh }}>
      {children}
    </StreakContext.Provider>
  );
}

export function useStreak() {
  return useContext(StreakContext);
}
