"use client";

import { useState } from "react";
import { usePlan } from "@/hooks/usePlan";
import { SkeletonCard } from "@/components/SkeletonCard";

export function PaywallBanner() {
  const { plan, loading, refresh } = usePlan();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const handleUpgrade = async (interval: "monthly" | "annual" = "monthly") => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error("Paywall banner checkout failed:", e);
      setCheckoutLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoreLoading(true);
    setRestoreMessage(null);
    try {
      const res = await fetch("/api/restore", { method: "POST" });
      const data = await res.json();
      if (data.restored) {
        await refresh();
      } else {
        setRestoreMessage(data.message || "No purchase found for this account.");
      }
    } catch {
      setRestoreMessage("Something went wrong. Try again.");
    } finally {
      setRestoreLoading(false);
    }
  };

  if (loading) return <SkeletonCard variant="banner" />;
  if (plan === "pro") return null;

  return (
    <div className="rounded-xl border border-app-border bg-app-card/90 p-4 sm:p-5">
      <p className="font-sans text-sm font-medium text-app-fg">
        Go Pro — unlimited principles, protocol steps, streak & history
      </p>
      <p className="mt-1 font-sans text-xs text-app-muted">
        From €3.99/month or €29.99/year. Cancel anytime.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => handleUpgrade("monthly")}
          disabled={checkoutLoading}
          className="min-h-[44px] rounded-lg bg-app-fg px-4 py-2 font-sans text-sm font-medium text-app-bg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {checkoutLoading ? "Redirecting…" : "Upgrade now"}
        </button>
        <button
          type="button"
          onClick={handleRestore}
          disabled={restoreLoading}
          className="min-h-[44px] rounded-lg border border-app-border bg-transparent px-4 py-2 font-sans text-sm font-medium text-app-fg transition-colors hover:bg-app-bg disabled:opacity-60"
        >
          {restoreLoading ? "Checking…" : "Restore purchase"}
        </button>
      </div>
      {restoreMessage && (
        <p className="mt-3 font-sans text-xs text-app-muted">{restoreMessage}</p>
      )}
    </div>
  );
}
