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

/** Free tier limits */
export const FREE_PRINCIPLES_LIMIT = 3;
export const FREE_PROTOCOL_STEPS_LIMIT = 5;

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
 * Returns true if the user can add more principles (under limit or Pro).
 */
export function canAddPrinciple(
  currentCount: number,
  profile: ProfileWithPlan | null | undefined
): boolean {
  return isPro(profile) || currentCount < FREE_PRINCIPLES_LIMIT;
}

/**
 * Returns true if the user can add more protocol steps (under limit or Pro).
 */
export function canAddProtocolStep(
  currentCount: number,
  profile: ProfileWithPlan | null | undefined
): boolean {
  return isPro(profile) || currentCount < FREE_PROTOCOL_STEPS_LIMIT;
}
