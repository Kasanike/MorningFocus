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
    <header className="px-4 pt-5 pb-1.5">
      <p className="text-[10px] font-medium tracking-[0.15em] text-zinc-500 uppercase mb-0.5">
        {formattedDate}
      </p>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 leading-tight">
          Better Morning.
        </h1>
        <Link
          href="/settings"
          className="w-8 h-8 flex items-center justify-center 
                     text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label={t.settings_title}
        >
          <Settings size={18} strokeWidth={1.5} />
        </Link>
      </div>
    </header>
  );
}
