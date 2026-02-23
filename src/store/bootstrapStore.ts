import { create } from "zustand";
import { fetchBootstrap, type BootstrapData, type ProfilePlan } from "@/lib/db";
import { isPro as checkIsPro } from "@/lib/subscription";

type Plan = "free" | "pro";

interface BootstrapState {
  profile: ProfilePlan | null;
  onboardingStatus: BootstrapData["onboardingStatus"];
  loading: boolean;
  isPro: boolean;
  plan: Plan;
  refresh: () => Promise<void>;
  markOnboardingCompleted: () => void;
}

export const useBootstrapStore = create<BootstrapState>()((set, get) => ({
  profile: null,
  onboardingStatus: null,
  loading: true,
  isPro: false,
  plan: "free",

  refresh: async () => {
    set({ loading: true });
    try {
      const data = await fetchBootstrap();
      const prev = get().onboardingStatus;
      const next = data.onboardingStatus;
      // Never overwrite onboardingCompleted: true → false (prevents loop after finishing onboarding)
      const merged =
        prev?.onboardingCompleted && next
          ? { ...next, onboardingCompleted: true }
          : next;
      set({
        profile: data.profile,
        onboardingStatus: merged,
        isPro: checkIsPro(data.profile),
        plan: (data.profile?.plan ?? "free") as Plan,
      });
    } finally {
      set({ loading: false });
    }
  },

  markOnboardingCompleted: () => {
    const prev = get().onboardingStatus;
    set({
      onboardingStatus: prev
        ? { ...prev, onboardingCompleted: true }
        : { onboardingCompleted: true, hasPrinciples: false, hasProtocol: false },
    });
  },
}));
