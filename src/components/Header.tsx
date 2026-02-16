"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Settings } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Header() {
  const { t } = useLanguage();

  const formattedDate = useMemo(() => {
    const d = new Date();
    const weekday = t.weekdays[d.getDay()];
    const month = t.months[d.getMonth()];
    const day = d.getDate();
    return `${weekday}, ${month} ${day}`;
  }, [t]);

  return (
    <header className="sticky top-0 z-10 border-b border-app-border bg-app-bg px-4 py-8 backdrop-blur-sm sm:px-8 sm:py-10">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-app-muted sm:text-sm">
            {formattedDate}
          </p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tighter text-app-fg sm:text-4xl">
            {t.greeting}
          </h1>
        </div>
        <Link
          href="/settings"
          className="flex shrink-0 items-center justify-center rounded-lg p-2.5 text-app-muted transition-colors hover:bg-app-border hover:text-app-fg"
          aria-label={t.settings_title}
        >
          <Settings className="h-5 w-5" strokeWidth={1.5} />
        </Link>
      </div>
    </header>
  );
}
