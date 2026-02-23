import { create } from "zustand";

interface ProtocolProgressState {
  currentStep: number;
  totalSteps: number;
  setProgress: (current: number, total: number) => void;
}

export const useProtocolProgressStore = create<ProtocolProgressState>()((set) => ({
  currentStep: 0,
  totalSteps: 5,
  setProgress: (current, total) => set({ currentStep: current, totalSteps: total }),
}));
