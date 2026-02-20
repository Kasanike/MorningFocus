"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { ProtocolProgressProvider } from "@/context/ProtocolProgressContext";
import { BootstrapProvider } from "@/context/BootstrapContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <BootstrapProvider>
        <ProtocolProgressProvider>{children}</ProtocolProgressProvider>
      </BootstrapProvider>
    </LanguageProvider>
  );
}
