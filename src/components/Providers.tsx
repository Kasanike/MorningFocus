"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { ProtocolProgressProvider } from "@/context/ProtocolProgressContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ProtocolProgressProvider>{children}</ProtocolProgressProvider>
    </LanguageProvider>
  );
}
