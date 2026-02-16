import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "00:00";
  const d = new Date(dateStr);
  return d.toTimeString().slice(0, 5);
}

export async function GET() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { ok: false, error: "api_error", message: "Supabase is not configured." },
      { status: 500 }
    );
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "unauthenticated" },
      { status: 401 }
    );
  }

  const session = await supabase.auth.getSession();
  const providerToken = session.data.session?.provider_token;

  if (!providerToken) {
    return NextResponse.json({
      ok: false,
      error: "no_google_token",
      message: "Sign in with Google to see your calendar events.",
    });
  }

  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
  const timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${providerToken}` },
  });

  if (res.status === 401) {
    return NextResponse.json({
      ok: false,
      error: "token_expired",
      message: "Your Google session expired. Sign out and sign in with Google again.",
    });
  }

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({
      ok: false,
      error: "api_error",
      message: err || `Google Calendar API error: ${res.status}`,
    });
  }

  const data = (await res.json()) as {
    items?: Array<{
      id: string;
      summary?: string;
      description?: string;
      start?: { dateTime?: string; date?: string };
      end?: { dateTime?: string; date?: string };
    }>;
  };

  const items = data.items ?? [];
  const events = items.map((item) => {
    const start = item.start;
    const end = item.end;
    const isAllDay = !start?.dateTime && !!start?.date;
    const startTime = start?.dateTime ?? start?.date ?? null;
    const endTime = end?.dateTime ?? end?.date ?? null;

    return {
      id: item.id,
      title: item.summary ?? "(No title)",
      start_time: formatTime(startTime),
      end_time: formatTime(endTime),
      is_all_day: isAllDay,
      description: item.description,
    };
  });

  events.sort((a, b) => a.start_time.localeCompare(b.start_time));

  return NextResponse.json({ ok: true, events });
}
