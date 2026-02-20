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

    const sessions = await stripe.checkout.sessions.list({
      status: "complete",
      limit: 100,
    });

    const completedForUser = sessions.data.find(
      (s) => s.client_reference_id === user.id
    );

    if (!completedForUser) {
      return NextResponse.json(
        { restored: false, message: "No purchase found for this account." },
        { status: 200 }
      );
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ plan: "paid" })
      .eq("id", user.id);

    if (error) {
      console.error("Restore: failed to update profile", error);
      return NextResponse.json(
        { error: "Failed to restore purchase" },
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
