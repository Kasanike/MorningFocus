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
      className="rounded-[22px] border border-zinc-800/80 bg-zinc-900/50 sm:py-14"
      style={{
        padding: "22px 20px 28px",
      }}
      aria-label={t.stoic_oracle_aria}
    >
      <h2
        className="mb-6 font-bold text-white/95"
        style={{ fontSize: 22, letterSpacing: "-0.01em" }}
      >
        {t.quote_remember_today}
      </h2>

      <blockquote className="text-center drop-shadow-md">
        <p
          className={`${instrumentSerif.className} text-xl font-normal italic leading-[1.5] text-white/95 sm:text-2xl`}
        >
          &ldquo;{quote.text}&rdquo;
        </p>
        <footer
          className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-white/60"
        >
          — {quote.author}
        </footer>
      </blockquote>
    </section>
  );
}
