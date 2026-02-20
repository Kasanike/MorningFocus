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

// ── One Thing (history table) ─────────────────────────────

export interface OneThingEntry {
  id: string;
  date: string;
  text: string;
  completed: boolean;
}

export async function fetchOneThing(date: string): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase
    .from("one_thing_history")
    .select("text")
    .eq("date", date)
    .maybeSingle();
  return data?.text ?? "";
}

export async function saveOneThingDb(
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
export async function fetchOneThingHistory(): Promise<OneThingEntry[]> {
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

export async function setOneThingCompleted(
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

  if (error) console.error("Failed to save timer session:", error);
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
  const onboardingCompleted = row?.onboarding_completed === true;
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
