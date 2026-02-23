"use client";

import { useState, useEffect } from "react";
import { fetchPaywallStats, type PaywallStats } from "@/lib/db";
import { Flame, CheckCircle2, Target } from "lucide-react";

const GRADIENT =
  "linear-gradient(170deg, #2a1b3d 0%, #44254a 15%, #5e3352 28%, #7a4058 40%, #8f4d5c 50%, #a66b62 62%, #bf8a6e 75%, #d4a67a 88%, #e0bd8a 100%)";

interface PaywallProps {
  userStats?: PaywallStats | null;
  onMaybeLater?: () => void;
}

export function Paywall({ userStats, onMaybeLater }: PaywallProps) {
  const [internalStats, setInternalStats] = useState<PaywallStats | null>(null);
  const [loading, setLoading] = useState(typeof userStats === "undefined");
  const [checkoutLoading, setCheckoutLoading] = useState<"annual" | "monthly" | null>(null);

  const stats = typeof userStats !== "undefined" ? userStats : internalStats;

  useEffect(() => {
    if (typeof userStats !== "undefined") {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchPaywallStats().then((data) => {
      if (!cancelled) {
        setInternalStats(data ?? null);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userStats]);

  const handleCheckout = async (interval: "annual" | "monthly") => {
    setCheckoutLoading(interval);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: interval === "annual" ? "annual" : "monthly" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error("Paywall checkout failed:", e);
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center px-4 py-10"
      style={{ background: GRADIENT }}
    >
      <div className="w-full max-w-[400px]">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">
          Better Morning
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-white sm:text-3xl">
          Your trial has ended
        </h1>
        <p className="mt-2 font-sans text-sm text-white/70">
          Upgrade to keep your routine and unlock your full potential.
        </p>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          <StatCard
            icon={<Flame className="h-5 w-5 text-white/80" />}
            value={loading ? "—" : String(stats?.streak ?? 0)}
            label="Day streak"
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5 text-white/80" />}
            value={loading ? "—" : String(stats?.stepsCompleted ?? 0)}
            label="Steps completed"
          />
          <StatCard
            icon={<Target className="h-5 w-5 text-white/80" />}
            value={loading ? "—" : String(stats?.keystonesDone ?? 0)}
            label="Keystones set"
          />
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={() => handleCheckout("annual")}
          disabled={!!checkoutLoading}
          className="mt-8 flex w-full min-h-[52px] items-center justify-center rounded-xl font-sans text-base font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #d4856a, #c46b6b)",
            boxShadow: "0 4px 20px rgba(196, 107, 107, 0.3)",
          }}
        >
          {checkoutLoading === "annual"
            ? "Redirecting…"
            : "Continue my morning — €29.99/year"}
        </button>

        {/* Secondary option */}
        <button
          type="button"
          onClick={() => handleCheckout("monthly")}
          disabled={!!checkoutLoading}
          className="mt-3 w-full min-h-[48px] rounded-xl border border-white/25 bg-white/10 font-sans text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/15 disabled:opacity-60"
        >
          {checkoutLoading === "monthly" ? "Redirecting…" : "€3.99/month"}
        </button>

        {/* Maybe later */}
        {onMaybeLater && (
          <button
            type="button"
            onClick={onMaybeLater}
            className="mt-8 w-full font-sans text-sm text-white/50 underline decoration-white/30 underline-offset-2 transition-colors hover:text-white/70"
          >
            Maybe later
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-1.5">{icon}</div>
      <p className="mt-2 text-center font-mono text-xl font-semibold text-white">{value}</p>
      <p className="mt-0.5 text-center font-sans text-xs text-white/50">{label}</p>
    </div>
  );
}
