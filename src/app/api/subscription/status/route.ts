import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription info
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        `
        selected_plan_name,
        selected_plan_price,
        plan_active,
        subscription_status,
        stripe_subscription_id,
        stripe_customer_id
      `
      )
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return NextResponse.json(
        { error: "Failed to fetch subscription data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscription: {
        planName: userData.selected_plan_name,
        planPrice: userData.selected_plan_price,
        isActive: userData.plan_active,
        status: userData.subscription_status,
        hasSubscription: !!userData.stripe_subscription_id,
        hasCustomer: !!userData.stripe_customer_id,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch subscription status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
