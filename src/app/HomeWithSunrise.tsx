"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Paywall } from "@/components/Paywall";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { OnboardingSuggestionsBanner } from "@/components/onboarding/OnboardingSuggestionsBanner";
import { TrialBanner } from "@/components/TrialBanner";
import { HomeTabs } from "@/components/HomeTabs";
import { useDailyReset } from "@/hooks/useDailyReset";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useBootstrap } from "@/context/BootstrapContext";
import { fetchTrialInfo } from "@/lib/db";
import { fetchPaywallStats } from "@/lib/db";
import { getAccessStatus } from "@/lib/subscription";

type AccessGate =
  | { status: "loading" }
  | { status: "pro" }
  | { status: "trial"; daysLeft: number }
  | { status: "expired"; stats: Awaited<ReturnType<typeof fetchPaywallStats>> };

export function HomeWithSunrise() {
  const { isReady } = useDailyReset();
  const { showWizard, refresh: refreshOnboarding } = useOnboardingStatus();
  const bootstrap = useBootstrap();
  const showNewOnboarding =
    bootstrap?.onboardingStatus && !bootstrap.onboardingStatus.onboardingCompleted;

  const [accessGate, setAccessGate] = useState<AccessGate>({ status: "loading" });

  const showDashboardOrPaywall =
    isReady && !bootstrap?.loading && !showNewOnboarding && !showWizard;

  useEffect(() => {
    if (!showDashboardOrPaywall) return;
    let cancelled = false;
    (async () => {
      try {
        const trialInfo = await fetchTrialInfo();
        if (cancelled) return;
        if (!trialInfo) {
          setAccessGate({ status: "pro" });
          return;
        }
        const plan = trialInfo.plan as "trial" | "expired" | "pro";
        const profile = {
          plan,
          trial_ends: trialInfo.trial_ends ?? new Date(0).toISOString(),
        };
        const access = getAccessStatus(profile);
        if (access === "pro") {
          setAccessGate({ status: "pro" });
          return;
        }
        if (typeof access === "object" && access.status === "expired") {
          const stats = await fetchPaywallStats();
          if (cancelled) return;
          setAccessGate({ status: "expired", stats });
          return;
        }
        if (typeof access === "object" && access.status === "trial") {
          const daysLeft = access.daysLeft ?? 1;
          setAccessGate({ status: "trial", daysLeft });
          return;
        }
        setAccessGate({ status: "pro" });
      } catch {
        if (!cancelled) setAccessGate({ status: "pro" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showDashboardOrPaywall]);

  const isExpired =
    accessGate.status === "expired";
  const isGateLoading =
    showDashboardOrPaywall && accessGate.status === "loading";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="relative z-10 mx-auto max-w-2xl pb-20 sm:pb-0">
        <Header />

        {!isReady || bootstrap?.loading ? (
          <div className="flex min-h-[50vh] items-center justify-center px-4">
            <p className="font-mono text-sm text-white/50">Loading…</p>
          </div>
        ) : showNewOnboarding ? (
          <OnboardingFlow onComplete={refreshOnboarding} />
        ) : showWizard ? (
          <OnboardingWizard onComplete={refreshOnboarding} />
        ) : isGateLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center px-4">
            <p className="font-mono text-sm text-white/50">Loading…</p>
          </div>
        ) : isExpired ? (
          <Paywall userStats={accessGate.status === "expired" ? accessGate.stats : null} />
        ) : (
          <div className="animate-fade-in" style={{ paddingTop: 0 }}>
            {accessGate.status === "trial" && (
              <div className="mx-4 mb-4">
                <TrialBanner daysLeft={accessGate.daysLeft} />
              </div>
            )}
            <OnboardingSuggestionsBanner />
            <HomeTabs />
          </div>
        )}
      </div>
    </main>
  );
}
