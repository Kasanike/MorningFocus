"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { BootstrapProvider } from "@/context/BootstrapContext";
import { StreakProvider } from "@/context/StreakContext";

/**
 * Each "provider" is now a thin effect-runner that initialises a Zustand store.
 * No React context values are created or compared, so no consumer re-renders
 * cascade from store updates — only components subscribed to a specific slice
 * of state will re-render when that slice changes.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <BootstrapProvider>
        <StreakProvider>{children}</StreakProvider>
      </BootstrapProvider>
    </LanguageProvider>
  );
}
