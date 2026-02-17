import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * App flow:
 * IDLE → (alarm fires) → RINGING → (slide to begin) → PROTOCOL → (I AM READY) → FOCUSED
 */
export type AlarmAppState = "IDLE" | "RINGING" | "PROTOCOL" | "FOCUSED";

export interface AlarmStore {
  // --- State ---
  state: AlarmAppState;

  // --- User data (persisted) ---
  /** Time string "HH:mm" (24h) for wake up */
  wakeUpTime: string;
  /** 0 = Sunday … 6 = Saturday; days when alarm is active */
  alarmDays: number[];
  /** Personal manifesto / constitution text shown on Protocol screen */
  personalManifesto: string;

  // --- Computed / runtime (optional, can be derived) ---
  /** Next alarm date (for display in Night Mode); set when scheduling */
  nextAlarmAt: Date | null;

  // --- Actions ---
  setState: (state: AlarmAppState) => void;
  setWakeUpTime: (time: string) => void;
  setAlarmDays: (days: number[]) => void;
  setPersonalManifesto: (text: string) => void;
  setNextAlarmAt: (date: Date | null) => void;

  /** Called when user completes "Slide to Begin" — go to Protocol screen */
  dismissToProtocol: () => void;
  /** Called when user taps "I AM READY" — leave alarm flow, go to main app */
  finishProtocol: () => void;

  /** Reset to IDLE (e.g. after finishing or canceling alarm flow) */
  resetToIdle: () => void;
}

const DEFAULT_WAKE_UP_TIME = "07:00";
const DEFAULT_ALARM_DAYS = [1, 2, 3, 4, 5]; // Mon–Fri
const DEFAULT_MANIFESTO = "";

export const useAlarmStore = create<AlarmStore>()(
  persist(
    (set) => ({
      state: "IDLE",
      wakeUpTime: DEFAULT_WAKE_UP_TIME,
      alarmDays: DEFAULT_ALARM_DAYS,
      personalManifesto: DEFAULT_MANIFESTO,
      nextAlarmAt: null,

      setState: (state) => set({ state }),
      setWakeUpTime: (wakeUpTime) => set({ wakeUpTime }),
      setAlarmDays: (alarmDays) => set({ alarmDays }),
      setPersonalManifesto: (personalManifesto) => set({ personalManifesto }),
      setNextAlarmAt: (nextAlarmAt) => set({ nextAlarmAt }),

      dismissToProtocol: () => set({ state: "PROTOCOL" }),
      finishProtocol: () => set({ state: "FOCUSED" }),
      resetToIdle: () => set({ state: "IDLE" }),
    }),
    {
      name: "morning-focus-alarm-store",
      partialize: (s) => ({
        wakeUpTime: s.wakeUpTime,
        alarmDays: s.alarmDays,
        personalManifesto: s.personalManifesto,
        // Do not persist: state, nextAlarmAt (runtime only)
      }),
    }
  )
);
