"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchPlan,
  fetchProfilePlan,
  type Plan,
  type ProfilePlan,
} from "@/lib/db";
import { isPro as checkIsPro } from "@/lib/subscription";

export function usePlan() {
  const [plan, setPlan] = useState<Plan>("free");
  const [profile, setProfile] = useState<ProfilePlan | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [p, prof] = await Promise.all([
        fetchPlan(),
        fetchProfilePlan(),
      ]);
      setPlan(p);
      setProfile(prof);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isPro = checkIsPro(profile);

  return { plan, profile, isPro, loading, refresh };
}
