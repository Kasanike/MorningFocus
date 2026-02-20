"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchPlan,
  fetchProfilePlan,
  type Plan,
  type ProfilePlan,
} from "@/lib/db";
import { isPro as checkIsPro } from "@/lib/subscription";
import { useBootstrap } from "@/context/BootstrapContext";

export function usePlan() {
  const bootstrap = useBootstrap();
  const [fallbackPlan, setFallbackPlan] = useState<Plan>("free");
  const [fallbackProfile, setFallbackProfile] = useState<ProfilePlan | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(!bootstrap);

  const refresh = useCallback(async () => {
    if (bootstrap) {
      await bootstrap.refresh();
      return;
    }
    setFallbackLoading(true);
    try {
      const [p, prof] = await Promise.all([
        fetchPlan(),
        fetchProfilePlan(),
      ]);
      setFallbackPlan(p);
      setFallbackProfile(prof);
    } finally {
      setFallbackLoading(false);
    }
  }, [bootstrap]);

  useEffect(() => {
    if (bootstrap) return;
    void refresh();
  }, [bootstrap, refresh]);

  if (bootstrap) {
    return {
      plan: bootstrap.plan,
      profile: bootstrap.profile,
      isPro: bootstrap.isPro,
      loading: bootstrap.loading,
      refresh: bootstrap.refresh,
    };
  }
  const isPro = checkIsPro(fallbackProfile);
  return {
    plan: fallbackPlan,
    profile: fallbackProfile,
    isPro,
    loading: fallbackLoading,
    refresh,
  };
}
