import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY is not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-07-30.basil",
    });

    const supabase = await createClient();

    // Check authentication - handle both web (cookies) and mobile (headers)
    let user = null;
    let authError = null;

    // First try to get user from cookies (web app)
    const { data: cookieData, error: cookieError } =
      await supabase.auth.getUser();
    if (cookieData?.user) {
      user = cookieData.user;
    } else {
      // Try to get user from Authorization header (mobile app)
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const { data: headerData, error: headerError } =
          await supabase.auth.getUser(token);
        if (headerData?.user) {
          user = headerData.user;
        } else {
          authError = headerError;
        }
      } else {
        authError = new Error("No authentication token provided");
      }
    }

    if (authError || !user) {
      console.error("Authentication failed:", authError);
      return NextResponse.json(
        {
          error: "Unauthorized",
          details: "Please provide a valid authentication token",
        },
        { status: 401 }
      );
    }

    // Get user's subscription info
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("stripe_subscription_id")
      .eq("id", user.id)
      .single();

    if (userError || !userData.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    // Cancel the subscription at period end
    const subscription = (await stripe.subscriptions.update(
      userData.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    )) as Stripe.Subscription;

    // Update user's subscription status
    await supabase
      .from("users")
      .update({
        subscription_status: "canceled",
        plan_active: false,
      })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      message: "Subscription will be canceled at the end of the current period",
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
      },
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      {
        error: "Failed to cancel subscription",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
