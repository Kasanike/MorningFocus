"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";

export function UpgradePrompt({ message }: { message: string }) {
  const { isPro, refresh } = usePlan();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: "monthly" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  };

  if (isPro) return null;

  return (
    <div className="rounded-xl border border-white/20 bg-black/30 p-4 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <Lock className="h-5 w-5 shrink-0 text-white/60" />
        <div>
          <p className="font-sans text-sm text-white/90">{message}</p>
          <p className="mt-1 font-mono text-xs text-white/50">
            Free: limited items. Pro: unlimited + streak & history.
          </p>
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading}
            className="mt-3 rounded-lg bg-white/20 px-3 py-1.5 font-sans text-sm font-medium text-white/95 transition-opacity hover:bg-white/30 disabled:opacity-60"
          >
            {loading ? "Redirecting…" : "Upgrade to Pro"}
          </button>
        </div>
      </div>
    </div>
  );
}
