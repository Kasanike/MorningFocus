"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Paywall } from "@/components/Paywall";
import { StoicQuote } from "@/components/StoicQuote";
import { ConstitutionList } from "@/components/ConstitutionList";
import { OneThing } from "@/components/OneThing";
import { MorningProtocol } from "@/components/MorningProtocol";
import { SunriseBackground } from "@/components/SunriseBackground";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { OnboardingSuggestionsBanner } from "@/components/onboarding/OnboardingSuggestionsBanner";
import { TrialBanner } from "@/components/TrialBanner";
import { StreakCard } from "@/components/StreakCard";
import { HistoryCard } from "@/components/HistoryCard";
import { useProtocolProgress } from "@/context/ProtocolProgressContext";
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
  const { currentStep, totalSteps } = useProtocolProgress();
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
    <>
      <SunriseBackground currentStep={currentStep} totalSteps={totalSteps} />

      <main className="relative z-10 mx-auto min-h-screen max-w-2xl pb-16">
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
          <div className="animate-fade-in mt-8 space-y-8 px-4 sm:px-8 sm:mt-10">
            {accessGate.status === "trial" && (
              <TrialBanner daysLeft={accessGate.daysLeft} />
            )}
            <OnboardingSuggestionsBanner />
            <section aria-label="Morning Protocol">
              <MorningProtocol />
            </section>

            <section aria-label="One Thing - Priority of the day">
              <OneThing />
            </section>

            <section aria-label="Personal Constitution">
              <ConstitutionList />
            </section>

            <section aria-label="Quote from Stoics">
              <StoicQuote />
            </section>

            <section aria-label="Streak">
              <StreakCard />
            </section>

            <section aria-label="History">
              <HistoryCard />
            </section>
          </div>
        )}
      </main>
    </>
  );
}
