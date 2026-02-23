"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { ProtocolProgressProvider } from "@/context/ProtocolProgressContext";
import { BootstrapProvider } from "@/context/BootstrapContext";
import { StreakProvider } from "@/context/StreakContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <BootstrapProvider>
        <StreakProvider>
          <ProtocolProgressProvider>{children}</ProtocolProgressProvider>
        </StreakProvider>
      </BootstrapProvider>
    </LanguageProvider>
  );
}
