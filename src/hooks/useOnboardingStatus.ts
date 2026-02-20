"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchOnboardingStatus,
  type OnboardingStatus,
} from "@/lib/db";

/**
 * Show wizard when user has not completed onboarding AND has no constitution AND no protocol.
 */
export function useOnboardingStatus() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const s = await fetchOnboardingStatus();
      setStatus(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const showWizard =
    status !== null &&
    !status.onboardingCompleted &&
    !status.hasPrinciples &&
    !status.hasProtocol;

  return { status, loading, showWizard, refresh };
}
