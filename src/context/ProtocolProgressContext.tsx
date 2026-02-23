"use client";

import { useShallow } from "zustand/react/shallow";
import type { ReactNode } from "react";
import { useProtocolProgressStore } from "@/store/protocolProgressStore";

/** No-op — kept for import compatibility. State now lives in the Zustand store. */
export function ProtocolProgressProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useProtocolProgress() {
  return useProtocolProgressStore(
    useShallow((s) => ({
      currentStep: s.currentStep,
      totalSteps: s.totalSteps,
      setProgress: s.setProgress,
    }))
  );
}
