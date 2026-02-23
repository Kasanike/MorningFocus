import { createClient } from "@/utils/supabase/client";

export interface Principle {
  id: string;
  text: string;
  subtitle?: string;
  order_index: number;
}

export interface ProtocolStep {
  id: string;
  label: string;
  minutes: number;
  order_index: number;
}

// ── Principles ──────────────────────────────────────────

export async function fetchPrinciples(): Promise<Principle[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("principles")
    .select("id, text, subtitle, order_index")
    .order("order_index");
  if (error) throw error;
  return data ?? [];
}

export async function upsertPrinciple(p: Principle): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase.from("principles").upsert({
    id: p.id,
    user_id: user.id,
    text: p.text,
    subtitle: p.subtitle ?? null,
    order_index: p.order_index,
  });
  if (error) throw error;
}

export async function deletePrinciple(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("principles").delete().eq("id", id);
  if (error) throw error;
}

// ── Protocol Steps ───────────────────────────────────────

export async function fetchProtocolSteps(): Promise<ProtocolStep[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("protocol_steps")
    .select("id, label, minutes, order_index")
    .order("order_index");
  if (error) throw error;
  return data ?? [];
}

export async function upsertProtocolStep(s: ProtocolStep): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase.from("protocol_steps").upsert({
    id: s.id,
    user_id: user.id,
    label: s.label,
    minutes: s.minutes,
    order_index: s.order_index,
  });
  if (error) throw error;
}

export async function deleteProtocolStep(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("protocol_steps")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Keystone (history table: one_thing_history) ────────────

export interface KeystoneEntry {
  id: string;
  date: string;
  text: string;
  completed: boolean;
}

export async function fetchKeystone(date: string): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase
    .from("one_thing_history")
    .select("text")
    .eq("date", date)
    .maybeSingle();
  return data?.text ?? "";
}

export async function saveKeystoneDb(
  text: string,
  date: string
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("one_thing_history")
    .upsert(
      {
        user_id: user.id,
        text: text.trim(),
        date,
      },
      { onConflict: "user_id,date" }
    );
  if (error) throw error;
}

/** Last 7 days (including today), most recent first. */
export async function fetchKeystoneHistory(): Promise<KeystoneEntry[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const { data, error } = await supabase
    .from("one_thing_history")
    .select("id, date, text, completed")
    .eq("user_id", user.id)
    .gte("date", sevenDaysAgo)
    .lte("date", today)
    .order("date", { ascending: false });

  if (error) return [];
  return (data ?? []).map((row) => ({
    id: row.id,
    date: row.date,
    text: row.text,
    completed: row.completed,
  }));
}

export async function setKeystoneCompleted(
  date: string,
  completed: boolean
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("one_thing_history")
    .update({ completed })
    .eq("user_id", user.id)
    .eq("date", date);
  if (error) throw error;
}

// ── Timer Sessions ──────────────────────────────────────

export async function saveTimerSession(results: {
  completedSteps: { id: string; title: string; plannedDuration: number; actualDuration: number; skipped: boolean }[];
  totalTime: number;
  completionRate: number;
}): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("timer_sessions").insert({
    user_id: user.id,
    total_time_seconds: results.totalTime,
    steps_completed: results.completedSteps.filter((s) => !s.skipped).length,
    steps_total: results.completedSteps.length,
    completion_rate: results.completionRate,
    step_details: results.completedSteps,
  });

  if (error) throw new Error(`Failed to save timer session: ${error.message}`);
}

// ── Streak data ─────────────────────────────────────────

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  totalMornings: number;
  /** ISO date strings (YYYY-MM-DD) of completed days for the current week */
  weekCompletions: Set<string>;
}

export async function fetchStreakData(): Promise<StreakData> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { currentStreak: 0, bestStreak: 0, totalMornings: 0, weekCompletions: new Set() };

  const [sessionsRes, keystoneRes] = await Promise.all([
    supabase
      .from("timer_sessions")
      .select("date")
      .eq("user_id", user.id),
    supabase
      .from("one_thing_history")
      .select("date, text")
      .eq("user_id", user.id),
  ]);

  const activeDates = new Set<string>();
  for (const r of sessionsRes.data ?? []) {
    if (r.date) activeDates.add(r.date);
  }
  for (const r of keystoneRes.data ?? []) {
    if (r.date && (r.text ?? "").trim() !== "") activeDates.add(r.date);
  }

  const totalMornings = activeDates.size;

  let currentStreak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (activeDates.has(d.toISOString().slice(0, 10))) currentStreak++;
    else break;
  }

  let bestStreak = 0;
  let runningStreak = 0;
  const sorted = Array.from(activeDates).sort();
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      runningStreak = 1;
    } else {
      const prev = new Date(sorted[i - 1] + "T12:00:00");
      const curr = new Date(sorted[i] + "T12:00:00");
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      runningStreak = diffDays === 1 ? runningStreak + 1 : 1;
    }
    if (runningStreak > bestStreak) bestStreak = runningStreak;
  }

  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekCompletions = new Set<string>();
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() - mondayOffset + i);
    const key = d.toISOString().slice(0, 10);
    if (activeDates.has(key)) weekCompletions.add(key);
  }

  return { currentStreak, bestStreak, totalMornings, weekCompletions };
}

// ── Paywall stats (for trial-expired screen) ─────────────

export interface PaywallStats {
  streak: number;
  stepsCompleted: number;
  keystonesDone: number;
}

/** Streak = consecutive days up to today with at least one timer_session. */
export async function fetchPaywallStats(): Promise<PaywallStats | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [sessionsRes, keystoneRes] = await Promise.all([
    supabase
      .from("timer_sessions")
      .select("date, steps_completed")
      .eq("user_id", user.id)
      .order("date", { ascending: false }),
    supabase
      .from("one_thing_history")
      .select("date, text")
      .eq("user_id", user.id),
  ]);

  const sessions = sessionsRes.data ?? [];
  const keystones = keystoneRes.data ?? [];

  const stepsCompleted = sessions.reduce((sum, r) => sum + (r.steps_completed ?? 0), 0);
  const keystonesDone = keystones.filter((r) => (r.text ?? "").trim() !== "").length;

  const sessionDates = new Set(sessions.map((r) => r.date));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (sessionDates.has(key)) streak++;
    else break;
  }

  return { streak, stepsCompleted, keystonesDone };
}

// ── Recent activity (Progress tab) ───────────────────────

export interface RecentActivityItem {
  date: string;
  stepsLabel: string;
  keystoneText: string;
}

/** Last 5 completed days (with at least one of protocol/constitution/keystone done), most recent first. */
export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: completions, error: compError } = await supabase
    .from("daily_completions")
    .select("completed_date, protocol_done, constitution_done, keystone_done")
    .eq("user_id", user.id)
    .or("protocol_done.eq.true,constitution_done.eq.true,keystone_done.eq.true")
    .order("completed_date", { ascending: false })
    .limit(5);

  if (compError || !completions?.length) return [];

  const dates = completions.map((r) => r.completed_date as string);

  const [sessionsRes, keystoneRes] = await Promise.all([
    supabase
      .from("timer_sessions")
      .select("date, steps_completed, steps_total")
      .eq("user_id", user.id)
      .in("date", dates),
    supabase
      .from("one_thing_history")
      .select("date, text")
      .eq("user_id", user.id)
      .in("date", dates),
  ]);

  const sessionsByDate = new Map<string, { steps_completed: number; steps_total: number }>();
  for (const row of sessionsRes.data ?? []) {
    const d = row.date as string;
    const existing = sessionsByDate.get(d);
    const steps = row.steps_completed ?? 0;
    const total = row.steps_total ?? 0;
    if (!existing || steps > existing.steps_completed) {
      sessionsByDate.set(d, { steps_completed: steps, steps_total: total });
    }
  }
  const keystoneByDate = new Map<string, string>();
  for (const row of keystoneRes.data ?? []) {
    keystoneByDate.set(row.date as string, (row.text ?? "").trim());
  }

  return dates.map((date) => {
    const session = sessionsByDate.get(date);
    const stepsLabel =
      session && session.steps_total > 0
        ? `${session.steps_completed}/${session.steps_total} protocol`
        : "—";
    const keystoneText = keystoneByDate.get(date) ?? "";
    return { date, stepsLabel, keystoneText };
  });
}

// ── Reflections ─────────────────────────────────────────

export interface ReflectionEntry {
  id: string;
  date: string;
  did_complete: boolean | null;
  reflection_note: string | null;
  keystone_text: string | null;
  keystone_id?: string | null;
  entry: string | null;
  mood: string | null;
  created_at: string;
  updated_at: string | null;
}

export async function fetchReflection(date: string): Promise<ReflectionEntry | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("reflections")
    .select("id, date, did_complete, reflection_note, keystone_text, keystone_id, entry, mood, created_at, updated_at")
    .eq("date", date)
    .maybeSingle();
  return data ?? null;
}

export async function fetchPastReflections(limit = 14): Promise<ReflectionEntry[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("reflections")
    .select("id, date, did_complete, reflection_note, keystone_text, entry, mood, created_at, updated_at")
    .eq("user_id", user.id)
    .lt("date", today)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}

/** Set today's did_complete (yes/no). Creates or updates reflection row. */
export async function setReflectionDidComplete(
  didComplete: boolean,
  keystoneText: string | null
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const date = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from("reflections").upsert(
    {
      user_id: user.id,
      date,
      did_complete: didComplete,
      keystone_text: keystoneText,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date" }
  );
  if (error) {
    const msg = error.message || error.code || String(error);
    throw new Error(`Reflection save failed: ${msg}. Run migration 011 to add did_complete and updated_at.`);
  }
}

/** Update today's reflection_note (e.g. when the field loses focus). Max 280 chars. Row must already exist (user has answered did_complete). */
export async function updateReflectionNote(note: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const date = new Date().toISOString().slice(0, 10);
  const trimmed = note.slice(0, 280).trim();
  const { error } = await supabase
    .from("reflections")
    .update({
      reflection_note: trimmed || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("date", date);
  if (error) throw error;
}

/** Legacy: save full reflection (entry, mood, keystone_text). Kept for backward compat. */
export async function saveReflection(
  entry: string,
  mood: string | null,
  keystoneText: string | null
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const date = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from("reflections").upsert(
    {
      user_id: user.id,
      date,
      entry: entry.trim() || null,
      mood,
      keystone_text: keystoneText,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date" }
  );
  if (error) throw error;
}

// ── Plan (subscription) ─────────────────────────────────

export type Plan = "free" | "pro";

export interface ProfilePlan {
  plan: Plan;
  subscription_end: string | null;
}

export async function fetchPlan(): Promise<Plan> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "free";
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  const plan = data?.plan;
  return plan === "pro" ? "pro" : "free";
}

export async function fetchProfilePlan(): Promise<ProfilePlan | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("plan, subscription_end")
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;
  return {
    plan: data.plan === "pro" ? "pro" : "free",
    subscription_end: data.subscription_end ?? null,
  };
}

/** Trial banner: plan + trial_start, trial_ends. Returns null if not on trial. */
export interface TrialInfo {
  plan: string;
  trial_start: string | null;
  trial_ends: string | null;
}

export async function fetchTrialInfo(): Promise<TrialInfo | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("plan, trial_start, trial_ends")
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;
  return {
    plan: data.plan ?? "trial",
    trial_start: data.trial_start ?? null,
    trial_ends: data.trial_ends ?? null,
  };
}

// ── Onboarding ──────────────────────────────────────────

export interface OnboardingStatus {
  onboardingCompleted: boolean;
  hasPrinciples: boolean;
  hasProtocol: boolean;
}

/** Single round-trip: user + profile (plan, onboarding) + principle/protocol counts. */
export interface BootstrapData {
  profile: ProfilePlan | null;
  onboardingStatus: OnboardingStatus | null;
}

export async function fetchBootstrap(): Promise<BootstrapData> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { profile: null, onboardingStatus: null };
  }

  const [profileRes, principlesRes, stepsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarding_completed, plan, subscription_end")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("principles")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("protocol_steps")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const row = profileRes.data;
  const profile: ProfilePlan | null = row
    ? {
        plan: row.plan === "pro" ? "pro" : "free",
        subscription_end: row.subscription_end ?? null,
      }
    : null;
  // If we have no profile row for a signed-in user (e.g. RLS/network on mobile), don't force onboarding
  const onboardingCompleted = row ? row.onboarding_completed === true : true;
  const hasPrinciples = (principlesRes.count ?? 0) > 0;
  const hasProtocol = (stepsRes.count ?? 0) > 0;
  const onboardingStatus: OnboardingStatus = {
    onboardingCompleted,
    hasPrinciples,
    hasProtocol,
  };

  return { profile, onboardingStatus };
}

export async function fetchOnboardingStatus(): Promise<OnboardingStatus | null> {
  const { onboardingStatus } = await fetchBootstrap();
  return onboardingStatus;
}

export async function setOnboardingCompleted(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);
  if (error) throw error;
}

export async function saveOnboardingFlow(data: {
  age_range: string;
  profession: string;
}): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("profiles")
    .update({
      age_range: data.age_range,
      profession: data.profession,
      onboarding_completed: true,
    })
    .eq("id", user.id);
  if (error) throw error;
}
