import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/utils/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/** Stripe API still returns these; SDK types may omit them in some versions. */
type SubscriptionWithPeriod = Stripe.Subscription & {
  current_period_start: number;
  current_period_end: number;
};

async function setProfilePro(
  userId: string,
  updates: {
    plan: "pro";
    subscription_start?: string;
    subscription_end?: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
  }
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  if (error) throw error;
}

async function setProfileFree(userId: string, subscription_end?: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      plan: "free",
      subscription_end: subscription_end ?? null,
      stripe_subscription_id: null,
    })
    .eq("id", userId);
  if (error) throw error;
}

export async function POST(request: Request) {
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) {
          return NextResponse.json({ received: true });
        }
        const userId =
          session.client_reference_id ?? session.metadata?.user_id;
        if (!userId) {
          console.error("Webhook: no user id in session", session.id);
          return NextResponse.json({ received: true });
        }
        const subscription = (await stripe.subscriptions.retrieve(
          session.subscription as string
        )) as SubscriptionWithPeriod;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;
        await setProfilePro(userId, {
          plan: "pro",
          subscription_start: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          subscription_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          stripe_customer_id: customerId ?? undefined,
          stripe_subscription_id: subscription.id,
        });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;
        if (!subId) return NextResponse.json({ received: true });
        const subscription = (await stripe.subscriptions.retrieve(subId)) as SubscriptionWithPeriod;
        const admin = createAdminClient();
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("stripe_subscription_id", subId)
          .maybeSingle();
        if (profile) {
          await setProfilePro(profile.id, {
            plan: "pro",
            subscription_start: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            subscription_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as SubscriptionWithPeriod;
        const admin = createAdminClient();
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();
        if (profile) {
          const periodEnd = new Date(
            subscription.current_period_end * 1000
          ).toISOString();
          await setProfileFree(profile.id, periodEnd);
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
