import { create } from "zustand";
import { fetchStreakData } from "@/lib/db";

interface StreakState {
  currentStreak: number;
  bestStreak: number;
  totalMornings: number;
  weekCompletions: Set<string>;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const useStreakStore = create<StreakState>()((set) => ({
  currentStreak: 0,
  bestStreak: 0,
  totalMornings: 0,
  weekCompletions: new Set(),
  loading: true,

  refresh: async () => {
    set({ loading: true });
    try {
      const data = await fetchStreakData();
      set({ ...data, loading: false });
    } catch {
      set({
        currentStreak: 0,
        bestStreak: 0,
        totalMornings: 0,
        weekCompletions: new Set(),
        loading: false,
      });
    }
  },
}));
