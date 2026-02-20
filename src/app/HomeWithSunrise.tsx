"use client";

import { Header } from "@/components/Header";
import { PaywallBanner } from "@/components/PaywallBanner";
import { StoicQuote } from "@/components/StoicQuote";
import { ConstitutionList } from "@/components/ConstitutionList";
import { OneThing } from "@/components/OneThing";
import { MorningProtocol } from "@/components/MorningProtocol";
import { SunriseBackground } from "@/components/SunriseBackground";
import { ProGate } from "@/components/ProGate";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { OnboardingSuggestionsBanner } from "@/components/onboarding/OnboardingSuggestionsBanner";
import { useProtocolProgress } from "@/context/ProtocolProgressContext";
import { useDailyReset } from "@/hooks/useDailyReset";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useBootstrap } from "@/context/BootstrapContext";

export function HomeWithSunrise() {
  const { isReady } = useDailyReset();
  const { currentStep, totalSteps } = useProtocolProgress();
  const { showWizard, loading: onboardingLoading, refresh: refreshOnboarding } = useOnboardingStatus();
  const bootstrap = useBootstrap();
  const showNewOnboarding =
    bootstrap?.onboardingStatus && !bootstrap.onboardingStatus.onboardingCompleted;

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
        ) : (
          <div className="animate-fade-in mt-8 space-y-8 px-4 sm:px-8 sm:mt-10">
            <OnboardingSuggestionsBanner />
            <PaywallBanner />
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
              <ProGate featureName="Streak">
                <div className="card-glass rounded-2xl border border-white/10 px-4 py-10 sm:px-8">
                  <h2 className="font-mono text-xl font-semibold text-white/95">
                    Streak
                  </h2>
                  <p className="mt-2 font-mono text-sm text-white/60">
                    Your consistency streak will appear here.
                  </p>
                </div>
              </ProGate>
            </section>

            <section aria-label="History">
              <ProGate featureName="History">
                <div className="card-glass rounded-2xl border border-white/10 px-4 py-10 sm:px-8">
                  <h2 className="font-mono text-xl font-semibold text-white/95">
                    History
                  </h2>
                  <p className="mt-2 font-mono text-sm text-white/60">
                    Your morning history will appear here.
                  </p>
                </div>
              </ProGate>
            </section>
          </div>
        )}
      </main>
    </>
  );
}
