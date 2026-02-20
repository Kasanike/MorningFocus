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

// ── One Thing ────────────────────────────────────────────

export async function fetchOneThing(date: string): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase
    .from("one_thing")
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
    .from("one_thing")
    .upsert(
      {
        user_id: user.id,
        text,
        date,
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

// ── Onboarding ──────────────────────────────────────────

export interface OnboardingStatus {
  onboardingCompleted: boolean;
  hasPrinciples: boolean;
  hasProtocol: boolean;
}

export async function fetchOnboardingStatus(): Promise<OnboardingStatus | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, principlesRes, stepsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarding_completed")
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

  const onboardingCompleted =
    profileRes.data?.onboarding_completed === true ?? false;
  const hasPrinciples = (principlesRes.count ?? 0) > 0;
  const hasProtocol = (stepsRes.count ?? 0) > 0;

  return {
    onboardingCompleted,
    hasPrinciples,
    hasProtocol,
  };
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
