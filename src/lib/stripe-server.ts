import Stripe from "stripe";

const STRIPE_API_VERSION = "2026-01-28.clover" as const;

let stripeInstance: Stripe | null = null;

/**
 * Lazily create Stripe only at request time. Avoids "Neither apiKey nor
 * config.authenticator provided" during `next build` when env vars are not set.
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeInstance = new Stripe(key, {
      apiVersion: STRIPE_API_VERSION,
    });
  }
  return stripeInstance;
}

export function getStripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET;
}
