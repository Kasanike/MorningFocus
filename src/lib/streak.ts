/**
 * STEP 5 — Streak calculation logic
 * - Streak increments ONLY when fully_completed = true in daily_completions
 * - If user misses a day, streak resets to 0
 * - On each full completion, check if today already counted; if not, increment and update
 * - Update longest_streak when current_streak > longest_streak
 */

import { createClient } from "@/utils/supabase/client";

const TODAY = () => new Date().toISOString().slice(0, 10);

/**
 * Returns the date string for N days before the given date (YYYY-MM-DD).
 */
function dateBefore(dateStr: string, daysBack: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

/**
 * Compute current streak: consecutive days ending at refDate where
 * fully_completed = true. If refDate is not completed, returns 0.
 */
export function computeCurrentStreak(
  completedDates: string[],
  refDate: string = TODAY()
): number {
  const set = new Set(completedDates);
  if (!set.has(refDate)) return 0;
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = dateBefore(refDate, i);
    if (set.has(d)) streak++;
    else break;
  }
  return streak;
}

/**
 * Fetch all completed_date values where fully_completed = true for the current user.
 */
export async function getFullyCompletedDates(
  refDate?: string
): Promise<string[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("daily_completions")
    .select("completed_date")
    .eq("user_id", user.id)
    .eq("fully_completed", true)
    .order("completed_date", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r) => r.completed_date);
}

/**
 * Check if today is already recorded as fully completed for the current user.
 */
export async function isTodayAlreadyCounted(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const today = TODAY();
  const { data, error } = await supabase
    .from("daily_completions")
    .select("id")
    .eq("user_id", user.id)
    .eq("completed_date", today)
    .eq("fully_completed", true)
    .maybeSingle();

  if (error) throw error;
  return data != null;
}

export interface RecordFullCompletionInput {
  protocol_done: boolean;
  constitution_done: boolean;
  keystone_done: boolean;
}

/**
 * Record a full completion for today (all three done).
 * - If today is already fully_completed, does not double-count; only syncs user_streaks.
 * - If not, upserts daily_completions for today with fully_completed = true,
 *   then recalculates current_streak (consecutive from today), updates longest_streak
 *   if needed, and upserts user_streaks.
 */
export async function recordFullCompletion(
  input: RecordFullCompletionInput
): Promise<void> {
  const { protocol_done, constitution_done, keystone_done } = input;
  const fully_completed = protocol_done && constitution_done && keystone_done;
  if (!fully_completed) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const today = TODAY();

  const alreadyCounted = await isTodayAlreadyCounted();
  if (!alreadyCounted) {
    const { error: upsertError } = await supabase
      .from("daily_completions")
      .upsert(
        {
          user_id: user.id,
          completed_date: today,
          protocol_done,
          constitution_done,
          keystone_done,
          fully_completed: true,
        },
        { onConflict: "user_id,completed_date" }
      );
    if (upsertError) throw upsertError;
  }

  const completedDates = await getFullyCompletedDates();
  const current_streak = computeCurrentStreak(completedDates, today);
  const total_completions = completedDates.length;

  const { data: existing } = await supabase
    .from("user_streaks")
    .select("longest_streak")
    .eq("user_id", user.id)
    .maybeSingle();

  const longest_streak = Math.max(
    existing?.longest_streak ?? 0,
    current_streak
  );

  const { error: streakError } = await supabase.from("user_streaks").upsert(
    {
      user_id: user.id,
      current_streak,
      longest_streak,
      last_completed_date: today,
      total_completions,
    },
    { onConflict: "user_id" }
  );

  if (streakError) throw streakError;
}

export type DayStatus = "full" | "partial" | "none";

/**
 * Fetch daily_completions for a given month. Returns a map of date string -> status.
 */
export async function getMonthDailyCompletions(
  year: number,
  month: number
): Promise<Record<string, DayStatus>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("daily_completions")
    .select("completed_date, protocol_done, constitution_done, keystone_done, fully_completed")
    .eq("user_id", user.id)
    .gte("completed_date", startStr)
    .lte("completed_date", endStr);

  if (error) throw error;

  const map: Record<string, DayStatus> = {};
  for (const row of data ?? []) {
    const d = row.completed_date;
    if (row.fully_completed) map[d] = "full";
    else if (row.protocol_done || row.constitution_done || row.keystone_done) map[d] = "partial";
    else map[d] = "none";
  }
  return map;
}

/**
 * Fetch daily_completions for the last N days (today and N-1 days back).
 * Returns a map of date string -> status for the strip view.
 */
export async function getLast14DaysCompletions(
  days: number = 14
): Promise<Record<string, DayStatus>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("daily_completions")
    .select("completed_date, protocol_done, constitution_done, keystone_done, fully_completed")
    .eq("user_id", user.id)
    .gte("completed_date", startStr)
    .lte("completed_date", endStr);

  if (error) throw error;

  const map: Record<string, DayStatus> = {};
  for (const row of data ?? []) {
    const d = row.completed_date;
    if (row.fully_completed) map[d] = "full";
    else if (row.protocol_done || row.constitution_done || row.keystone_done) map[d] = "partial";
    else map[d] = "none";
  }
  return map;
}

export interface TodayCompletionDetail {
  protocol_done: boolean;
  constitution_done: boolean;
  keystone_done: boolean;
  fully_completed: boolean;
}

/**
 * Fetch today's completion detail (step-level) for the current user.
 * Returns null if no row exists for today.
 */
export async function getTodayCompletionDetail(): Promise<TodayCompletionDetail | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = TODAY();
  const { data, error } = await supabase
    .from("daily_completions")
    .select("protocol_done, constitution_done, keystone_done, fully_completed")
    .eq("user_id", user.id)
    .eq("completed_date", today)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return {
    protocol_done: data.protocol_done ?? false,
    constitution_done: data.constitution_done ?? false,
    keystone_done: data.keystone_done ?? false,
    fully_completed: data.fully_completed ?? false,
  };
}

/**
 * Set protocol_done = true for today. Creates daily_completions row if none exists.
 */
export async function setProtocolDoneForToday(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const today = TODAY();
  const existing = await getTodayCompletionDetail();
  const constitution_done = existing?.constitution_done ?? false;
  const keystone_done = existing?.keystone_done ?? false;
  const fully_completed = true && constitution_done && keystone_done;
  const payload = {
    user_id: user.id,
    completed_date: today,
    protocol_done: true,
    constitution_done,
    keystone_done,
    fully_completed,
  };

  const { error } = await supabase
    .from("daily_completions")
    .upsert(payload, { onConflict: "user_id,completed_date" });
  if (error) throw error;
}

/**
 * Set protocol_done = false for today (e.g. "redo" protocol).
 */
export async function setProtocolUndoneForToday(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const today = TODAY();
  const existing = await getTodayCompletionDetail();
  if (!existing) return;

  const { error } = await supabase
    .from("daily_completions")
    .update({
      protocol_done: false,
      fully_completed: false,
    })
    .eq("user_id", user.id)
    .eq("completed_date", today);
  if (error) throw error;
}

/**
 * Set constitution_done = true for today. Creates daily_completions row if none exists.
 */
export async function setConstitutionDoneForToday(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const today = TODAY();
  const existing = await getTodayCompletionDetail();
  const protocol_done = existing?.protocol_done ?? false;
  const keystone_done = existing?.keystone_done ?? false;
  const fully_completed = protocol_done && true && keystone_done;
  const payload = {
    user_id: user.id,
    completed_date: today,
    protocol_done,
    constitution_done: true,
    keystone_done,
    fully_completed,
  };

  const { error } = await supabase
    .from("daily_completions")
    .upsert(payload, { onConflict: "user_id,completed_date" });
  if (error) throw error;
}

/**
 * Set constitution_done = false for today (e.g. "review" then re-complete).
 */
export async function setConstitutionUndoneForToday(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const today = TODAY();
  const existing = await getTodayCompletionDetail();
  if (!existing) return;

  const { error } = await supabase
    .from("daily_completions")
    .update({
      constitution_done: false,
      fully_completed: false,
    })
    .eq("user_id", user.id)
    .eq("completed_date", today);
  if (error) throw error;
}

/**
 * Get current user_streaks row for the authenticated user (for display).
 */
export async function getUserStreaks(): Promise<{
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  last_completed_date: string | null;
} | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_streaks")
    .select("current_streak, longest_streak, total_completions, last_completed_date")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    return {
      current_streak: 0,
      longest_streak: 0,
      total_completions: 0,
      last_completed_date: null,
    };
  }
  return {
    current_streak: data.current_streak ?? 0,
    longest_streak: data.longest_streak ?? 0,
    total_completions: data.total_completions ?? 0,
    last_completed_date: data.last_completed_date ?? null,
  };
}
