"use client";

import { useMemo } from "react";
import { Instrument_Serif } from "next/font/google";
import { useLanguage } from "@/context/LanguageContext";
import { getQuoteForDate } from "@/lib/stoic-quotes";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: "italic",
  subsets: ["latin"],
});

export function StoicQuote() {
  const { t, locale } = useLanguage();
  const quote = useMemo(() => getQuoteForDate(new Date(), locale), [locale]);

  return (
    <section
      className="card-glass rounded-2xl border border-white/10 p-8 shadow-2xl shadow-black/20 sm:p-10 sm:py-14"
      aria-label={t.stoic_oracle_aria}
    >
      <h2 className="mb-6 font-mono text-xl font-semibold text-white/95">
        Quote of the day
      </h2>

      <blockquote className="text-center drop-shadow-md">
        <p
          className={`${instrumentSerif.className} text-3xl font-normal italic leading-[1.5] text-white/95 sm:text-4xl`}
        >
          &ldquo;{quote.text}&rdquo;
        </p>
        <footer className="mt-10 font-mono text-xs font-medium uppercase tracking-[0.2em] text-white/60">
          — {quote.author}
        </footer>
      </blockquote>
    </section>
  );
}
