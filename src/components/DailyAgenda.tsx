"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Circle, Calendar, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { CalendarEvent } from "@/lib/calendar-types";
import { createClient } from "@/utils/supabase/client";
import { MOCK_AGENDA } from "@/lib/agenda";

type DisplayItem = {
  id: string;
  time: string;
  title: string;
  description?: string;
  endTime?: string;
  isAllDay?: boolean;
};

function toDisplayItem(ev: CalendarEvent): DisplayItem {
  const time = ev.is_all_day ? "All day" : ev.start_time;
  const desc = ev.is_all_day ? undefined : (ev.end_time !== "00:00" ? `Until ${ev.end_time}` : ev.description);
  return {
    id: ev.id,
    time,
    title: ev.title,
    description: desc ?? ev.description,
    endTime: ev.end_time,
    isAllDay: ev.is_all_day,
  };
}

export function DailyAgenda() {
  const { t } = useLanguage();
  const router = useRouter();
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsGoogle, setNeedsGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNeedsGoogle(false);

    const res = await fetch("/api/calendar/events");
    const result = (await res.json()) as
      | { ok: true; events: CalendarEvent[] }
      | { ok: false; error: string; message?: string };

    if (result.ok) {
      setItems(result.events.map(toDisplayItem));
      setNeedsGoogle(false);
    } else if (result.error === "no_google_token") {
      setNeedsGoogle(true);
      setItems(MOCK_AGENDA.map((m) => ({ id: m.id, time: m.time, title: m.title, description: m.description })));
    } else if (result.error === "unauthenticated") {
      router.push("/login");
      return;
    } else if (result.error === "token_expired" || result.error === "api_error") {
      setError(result.message ?? "Failed to load calendar");
      setItems(MOCK_AGENDA.map((m) => ({ id: m.id, time: m.time, title: m.title, description: m.description })));
    } else {
      setItems(MOCK_AGENDA.map((m) => ({ id: m.id, time: m.time, title: m.title, description: m.description })));
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  const handleConnectGoogle = async () => {
    try {
      const supabase = createClient();
      const { data, error: linkError } = await supabase.auth.linkIdentity({
        provider: "google",
        options: {
          redirectTo: window.location.href,
          scopes: "https://www.googleapis.com/auth/calendar.readonly",
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (linkError) throw linkError;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect Google");
    }
  };

  return (
    <section
      className="rounded-2xl border border-app-border bg-app-card px-6 py-8 sm:px-8 sm:py-10 shadow-xl shadow-black/20"
      aria-label={t.battle_plan_aria}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-xl font-semibold text-app-fg">
          {t.battle_plan_title}
        </h2>
        {!loading && (
          <button
            type="button"
            onClick={() => void fetchEvents()}
            className="text-xs text-app-muted hover:text-app-fg"
          >
            Refresh
          </button>
        )}
      </div>

      {loading ? (
        <div className="mt-8 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-app-muted" />
        </div>
      ) : (
        <>
          {needsGoogle && (
            <div className="mt-6 rounded-xl border border-amber-600/30 bg-amber-950/20 p-4">
              <p className="mb-3 text-sm text-app-muted">
                Connect Google Calendar to see your real schedule. Showing sample data below.
              </p>
              <button
                type="button"
                onClick={handleConnectGoogle}
                className="flex items-center gap-2 rounded-lg bg-amber-600/90 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-500"
              >
                <Calendar className="h-4 w-4" />
                Connect Google Calendar
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-950/40 px-3 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="relative mt-8">
            <div
              className="absolute left-[13px] top-3 bottom-3 w-px bg-app-border"
              aria-hidden
            />

            <ul className="space-y-0">
              {items.map((item) => (
                <li key={item.id} className="relative flex gap-5 pb-7 last:pb-0">
                  <div className="relative z-10 mt-1 flex shrink-0 items-center justify-center">
                    <Circle
                      className="h-6 w-6 fill-app-card stroke-app-border"
                      strokeWidth={2}
                    />
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <time
                        className="shrink-0 font-mono text-sm text-app-muted tabular-nums"
                        dateTime={item.time}
                      >
                        {item.time}
                      </time>
                      <h3 className="font-sans font-medium text-app-fg">
                        {item.title}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="mt-1.5 text-sm leading-relaxed text-app-muted">
                        {item.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {items.length === 0 && !needsGoogle && (
              <p className="py-8 text-center text-sm text-app-muted">
                No events for today.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
