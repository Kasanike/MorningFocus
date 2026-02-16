"use client";

import { useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getQuoteForDate } from "@/lib/stoic-quotes";

export function StoicQuote() {
  const { t } = useLanguage();
  const quote = useMemo(() => getQuoteForDate(new Date()), []);

  return (
    <section
      className="rounded-2xl border border-app-border bg-app-card px-6 py-10 sm:px-10 sm:py-12 shadow-xl shadow-black/20"
      aria-label={t.stoic_oracle_aria}
    >
      <blockquote className="text-center">
        <p className="font-serif text-xl leading-[1.7] text-app-fg sm:text-2xl italic">
          &ldquo;{quote.text}&rdquo;
        </p>
        <footer className="mt-6 font-sans text-xs uppercase tracking-[0.25em] text-app-muted">
          — {quote.author}
        </footer>
      </blockquote>
    </section>
  );
}
