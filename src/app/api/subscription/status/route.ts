import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
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
