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
      className="rounded-lg border border-app-border bg-app-card px-8 py-12 sm:px-12 sm:py-16"
      aria-label={t.stoic_oracle_aria}
    >
      <blockquote className="text-center">
        <p
          className={`${instrumentSerif.className} text-3xl font-normal italic leading-[1.4] text-app-fg sm:text-4xl`}
        >
          &ldquo;{quote.text}&rdquo;
        </p>
        <footer className="mt-8 font-mono text-xs uppercase tracking-widest text-app-muted">
          — {quote.author}
        </footer>
      </blockquote>
    </section>
  );
}
