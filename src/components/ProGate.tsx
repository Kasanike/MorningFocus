"use client";

import { Lock } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";

interface ProGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  featureName: string;
}

/**
 * Renders children when user is Pro, otherwise shows upgrade prompt.
 */
export function ProGate({ children, fallback, featureName }: ProGateProps) {
  const { isPro } = usePlan();

  if (isPro) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-6 text-center">
      <Lock className="mx-auto h-8 w-8 text-white/50" />
      <p className="mt-2 font-sans text-sm font-medium text-white/90">
        {featureName}
      </p>
      <p className="mt-1 font-mono text-xs text-white/50">
        Pro feature — upgrade to unlock
      </p>
    </div>
  );
}
