"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchOnboardingStatus, type OnboardingStatus } from "@/lib/db";
import { useBootstrap } from "@/context/BootstrapContext";

/**
 * Show wizard when user has not completed onboarding AND has no constitution AND no protocol.
 */
export function useOnboardingStatus() {
  const bootstrap = useBootstrap();
  const [fallbackStatus, setFallbackStatus] = useState<OnboardingStatus | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(!bootstrap);

  const refresh = useCallback(async () => {
    if (bootstrap) {
      await bootstrap.refresh();
      return;
    }
    setFallbackLoading(true);
    try {
      const s = await fetchOnboardingStatus();
      setFallbackStatus(s);
    } finally {
      setFallbackLoading(false);
    }
  }, [bootstrap]);

  useEffect(() => {
    if (bootstrap) return;
    void refresh();
  }, [bootstrap, refresh]);

  const status = bootstrap ? bootstrap.onboardingStatus : fallbackStatus;
  const loading = bootstrap ? bootstrap.loading : fallbackLoading;

  const showWizard =
    status !== null &&
    !status.onboardingCompleted &&
    !status.hasPrinciples &&
    !status.hasProtocol;

  return { status, loading, showWizard, refresh };
}
