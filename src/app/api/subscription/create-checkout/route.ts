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

    const { planName, planPrice, isUpgrade = false } = await request.json();

    if (!planName || planPrice === undefined) {
      return NextResponse.json(
        { error: "Plan name and price are required" },
        { status: 400 }
      );
    }

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

    // Get user's current subscription info
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        "stripe_customer_id, stripe_subscription_id, selected_plan_name, selected_plan_price, subscription_status, plan_active"
      )
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }

    // Determine if this is actually an upgrade based on current plan
    const currentPlanPrice = userData.selected_plan_price || 0;
    const isActuallyUpgrade =
      isUpgrade && currentPlanPrice > 0 && planPrice > currentPlanPrice;
    const isDowngrade =
      isUpgrade && currentPlanPrice > 0 && planPrice < currentPlanPrice;

    // For upgrades, check if user already has an active subscription
    // Only block upgrades if user has an active subscription that's not free
    if (
      isUpgrade &&
      userData.stripe_subscription_id &&
      userData.selected_plan_price &&
      userData.selected_plan_price > 0 &&
      userData.subscription_status === "active" &&
      userData.plan_active === true
    ) {
      return NextResponse.json(
        {
          error:
            "You already have an active paid subscription. Please cancel your current subscription first.",
        },
        { status: 400 }
      );
    }

    // Handle different subscription scenarios
    let subscriptionMode = "new";
    if (isActuallyUpgrade) {
      subscriptionMode = "upgrade";
    } else if (isDowngrade) {
      subscriptionMode = "downgrade";
    } else if (currentPlanPrice === 0 && planPrice > 0) {
      subscriptionMode = "upgrade_from_free";
    }

    // Create or get Stripe customer
    let customerId = userData.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Update user with customer ID
      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `PTFlow - ${planName}`,
              description: `${planName} plan subscription`,
            },
            unit_amount: Math.round(planPrice * 100), // Convert to cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${request.nextUrl.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/subscription/cancel`,
      metadata: {
        user_id: user.id,
        plan_name: planName,
        plan_price: planPrice.toString(),
        is_upgrade: isUpgrade.toString(),
        current_plan: userData.selected_plan_name || "none",
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_name: planName,
          plan_price: planPrice.toString(),
        },
      },
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
