"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface ProtocolProgressContextValue {
  currentStep: number;
  totalSteps: number;
  setProgress: (current: number, total: number) => void;
}

const ProtocolProgressContext = createContext<ProtocolProgressContextValue | null>(
  null
);

export function ProtocolProgressProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(5);

  const setProgress = useCallback((current: number, total: number) => {
    setCurrentStep(current);
    setTotalSteps(total);
  }, []);

  return (
    <ProtocolProgressContext.Provider
      value={{ currentStep, totalSteps, setProgress }}
    >
      {children}
    </ProtocolProgressContext.Provider>
  );
}

export function useProtocolProgress() {
  const ctx = useContext(ProtocolProgressContext);
  if (!ctx) {
    return {
      currentStep: 0,
      totalSteps: 5,
      setProgress: () => {},
    };
  }
  return ctx;
}
