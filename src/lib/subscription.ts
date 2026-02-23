/**
 * Subscription / plan helpers for paywall gating.
 */

export type Plan = "free" | "pro";

export interface ProfileWithPlan {
  plan: Plan;
  subscription_end?: string | null;
}

/** Profile shape for trial/expired/pro plan (after trial migration). */
export interface Profile {
  plan: "trial" | "expired" | "pro";
  trial_ends: string;
}

export function getAccessStatus(profile: Profile) {
  if (profile.plan === "pro") return "pro";

  const trialEnd = new Date(profile.trial_ends);
  const now = new Date();

  if (now < trialEnd) {
    const daysLeft = Math.ceil(
      (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return { status: "trial", daysLeft };
  }

  return { status: "expired" };
}

export function isTrialExpiring(profile: Profile) {
  const trialEnd = new Date(profile.trial_ends);
  const now = new Date();
  const hoursLeft =
    (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursLeft > 0 && hoursLeft < 24;
}

/**
 * Returns true if the user has an active Pro subscription.
 * If subscription_end is set, it must be in the future.
 */
export function isPro(profile: ProfileWithPlan | null | undefined): boolean {
  if (!profile || profile.plan !== "pro") return false;
  if (!profile.subscription_end) return true;
  return new Date(profile.subscription_end) > new Date();
}

/**
 * Returns true if the user can add more principles (no limit).
 */
export function canAddPrinciple(
  _currentCount: number,
  _profile: ProfileWithPlan | null | undefined
): boolean {
  return true;
}

/**
 * Returns true if the user can add more protocol steps (no limit).
 */
export function canAddProtocolStep(
  _currentCount: number,
  _profile: ProfileWithPlan | null | undefined
): boolean {
  return true;
}
