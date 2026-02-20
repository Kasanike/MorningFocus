"use client";

import { Header } from "@/components/Header";
import { PaywallBanner } from "@/components/PaywallBanner";
import { StoicQuote } from "@/components/StoicQuote";
import { ConstitutionList } from "@/components/ConstitutionList";
import { OneThing } from "@/components/OneThing";
import { MorningProtocol } from "@/components/MorningProtocol";
import { SunriseBackground } from "@/components/SunriseBackground";
import { useProtocolProgress } from "@/context/ProtocolProgressContext";
import { useDailyReset } from "@/hooks/useDailyReset";

export function HomeWithSunrise() {
  const { isReady } = useDailyReset();
  const { currentStep, totalSteps } = useProtocolProgress();

  return (
    <>
      <SunriseBackground currentStep={currentStep} totalSteps={totalSteps} />

      <main className="relative z-10 mx-auto min-h-screen max-w-2xl pb-16">
        <Header />

        {!isReady ? (
          <div className="flex min-h-[50vh] items-center justify-center px-4">
            <p className="font-mono text-sm text-white/50">Loading…</p>
          </div>
        ) : (
          <div className="animate-fade-in mt-8 space-y-8 px-4 sm:px-8 sm:mt-10">
            <PaywallBanner />
            <section aria-label="Quote from Stoics">
              <StoicQuote />
            </section>

            <section aria-label="Morning Protocol">
              <MorningProtocol />
            </section>

            <section aria-label="Personal Constitution">
              <ConstitutionList />
            </section>

            <section aria-label="One Thing - Priority of the day">
              <OneThing />
            </section>
          </div>
        )}
      </main>
    </>
  );
}
