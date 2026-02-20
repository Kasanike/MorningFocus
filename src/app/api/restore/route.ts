import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payment is not configured" },
        { status: 503 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    const customerId = profile?.stripe_customer_id;
    if (!customerId) {
      return NextResponse.json(
        {
          restored: false,
          message: "No subscription found for this account.",
        },
        { status: 200 }
      );
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        {
          restored: false,
          message: "No active subscription found.",
        },
        { status: 200 }
      );
    }

    const sub = subscriptions.data[0];
    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({
        plan: "pro",
        subscription_start: new Date(sub.current_period_start * 1000).toISOString(),
        subscription_end: new Date(sub.current_period_end * 1000).toISOString(),
        stripe_subscription_id: sub.id,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Restore: failed to update profile", error);
      return NextResponse.json(
        { error: "Failed to restore subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({ restored: true });
  } catch (err) {
    console.error("Restore error:", err);
    return NextResponse.json(
      { error: "Restore failed" },
      { status: 500 }
    );
  }
}
