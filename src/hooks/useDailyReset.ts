"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function resetProtocolCompleted(): void {
  if (typeof window === "undefined") return;
  const today = getTodayKey();
  localStorage.setItem(
    STORAGE_KEYS.MORNING_PROTOCOL_COMPLETED,
    JSON.stringify({ date: today, completed: {} })
  );
}

function resetKeystone(): void {
  if (typeof window === "undefined") return;
  const today = getTodayKey();
  localStorage.setItem(
    STORAGE_KEYS.KEYSTONE,
    JSON.stringify({ date: today, text: "" })
  );
}

/**
 * Hook that runs a daily reset when the user visits on a new day (past midnight).
 * Resets Morning Protocol checkboxes and Keystone input, then updates lastVisitDate.
 * Returns isReady: true only after the check has run, so children read fresh data.
 */
export function useDailyReset() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastSaved = localStorage.getItem(STORAGE_KEYS.LAST_VISIT_DATE);

    if (lastSaved !== today) {
      resetProtocolCompleted();
      resetKeystone();
      localStorage.setItem(STORAGE_KEYS.LAST_VISIT_DATE, today);
    }

    queueMicrotask(() => setIsReady(true));
  }, []);

  return { isReady };
}
