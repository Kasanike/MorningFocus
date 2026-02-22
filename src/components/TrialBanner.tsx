"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Star } from "lucide-react";
import { STORAGE_KEYS } from "@/lib/constants";
import { fetchPaywallStats } from "@/lib/db";

export interface TrialBannerProps {
  daysLeft: number;
  streak?: number;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function isDismissedToday(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.TRIAL_BANNER_DISMISSED_DATE) === getTodayKey();
}

function dismissForToday(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.TRIAL_BANNER_DISMISSED_DATE, getTodayKey());
}


export function TrialBanner({ daysLeft, streak: streakProp }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [streak, setStreak] = useState<number | null>(streakProp ?? null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setDismissed(isDismissedToday());
  }, [mounted]);

  useEffect(() => {
    if (daysLeft === 1 && streak === null && typeof streakProp === "undefined") {
      fetchPaywallStats().then((s) => setStreak(s?.streak ?? null));
    } else if (typeof streakProp === "number") {
      setStreak(streakProp);
    }
  }, [daysLeft, streakProp]);

  let message: string;
  if (daysLeft > 2) {
    message = `☀️ Day ${8 - daysLeft} of 7 — full access`;
  } else if (daysLeft === 2) {
    message = "⚡ 2 days left in your free trial";
  } else {
    const streakNum = streak ?? 0;
    message =
      streakNum > 0
        ? `🔥 Last day — your ${streakNum}-day streak is worth keeping`
        : "🔥 Last day — your streak is worth keeping";
  }

  const showUpsell = daysLeft <= 2;
  if (dismissed) return null;

  return (
    <div className="space-y-1">
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
        style={{
          background: "rgba(60, 30, 80, 0.5)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Star className="h-4 w-4 shrink-0 text-amber-400/90" strokeWidth={1.5} fill="currentColor" />
          <span className="font-mono text-xs text-white/90">{message}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            dismissForToday();
            setDismissed(true);
          }}
          className="shrink-0 rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {showUpsell && (
        <Link
          href="/settings#subscription"
          className="block font-mono text-[0.75rem] text-app-muted underline decoration-white/20 underline-offset-2 transition-colors hover:text-app-fg hover:decoration-white/40"
        >
          Keep everything → See plans
        </Link>
      )}
    </div>
  );
}
