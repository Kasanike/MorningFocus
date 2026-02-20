"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchPlan, type Plan } from "@/lib/db";

export function usePlan() {
  const [plan, setPlan] = useState<Plan>("free");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const p = await fetchPlan();
      setPlan(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { plan, loading, refresh };
}
