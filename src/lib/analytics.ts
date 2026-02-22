"use client";

import Plausible from "plausible-tracker";

/** Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN in env (e.g. your-domain.com) or leave empty to use current hostname. */
const DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "";

let plausible: ReturnType<typeof Plausible> | null = null;

function getPlausible() {
  if (typeof window === "undefined") return null;
  if (!plausible) {
    plausible = Plausible({
      domain: DOMAIN || window.location.hostname,
      trackLocalhost: process.env.NODE_ENV === "development",
    });
  }
  return plausible;
}

/** Track a page view (optional; use enableAutoPageviews() for automatic). */
export function trackPageview() {
  getPlausible()?.trackPageview();
}

/** Enable automatic page view tracking on route change (SPA). */
export function enableAutoPageviews() {
  getPlausible()?.enableAutoPageviews();
}

/** Generic custom event. */
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
) {
  getPlausible()?.trackEvent(eventName, props ? { props } : undefined);
}

export function trackSignupCompleted() {
  trackEvent("signup_completed");
}

export function trackOnboardingCompleted() {
  trackEvent("onboarding_completed");
}

export function trackPaymentCompleted() {
  trackEvent("payment_completed");
}

export function trackProtocolCompleted() {
  trackEvent("protocol_completed");
}

export function trackConstitutionRead() {
  trackEvent("constitution_read");
}

export function trackKeystoneSet() {
  trackEvent("keystone_set");
}

/** Call when user hits a streak milestone (e.g. 7, 14, 30 days). */
export function trackStreakMilestone(days: number) {
  trackEvent("streak_milestone", { days });
}
