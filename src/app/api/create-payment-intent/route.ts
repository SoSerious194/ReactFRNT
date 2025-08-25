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

    const { formId, formData } = await request.json();

    // Get the form details to get pricing and coach information
    const supabase = await createClient();

    const { data: form, error: formError } = await supabase
      .from("signup_forms")
      .select("price, pricing_type, coach_id, title")
      .eq("id", formId)
      .single();

    if (formError) {
      console.error("Form lookup error:", formError);
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (!form) {
      console.error("Form not found for ID:", formId);
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Validate amount
    if (!form.price || form.price <= 0) {
      console.error("Invalid price:", form.price);
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    // Determine the interval based on pricing type
    const interval = form.pricing_type === "yearly" ? "year" : "month";

    // Extract essential user data from form data
    const extractedData = {
      email: null as string | null,
      password: null as string | null,
      fullName: null as string | null,
    };

    // Look through form data to find email, password, and name
    Object.entries(formData).forEach(([key, value]) => {
      const stringValue = String(value);

      // Check if this looks like an email
      if (
        stringValue.includes("@") &&
        stringValue.includes(".") &&
        !extractedData.email
      ) {
        extractedData.email = stringValue;
      }

      // Check if this looks like a password (not email, reasonable length)
      if (
        !stringValue.includes("@") &&
        !stringValue.includes(".") &&
        stringValue.length >= 6 &&
        stringValue.length <= 50 &&
        !extractedData.password
      ) {
        extractedData.password = stringValue;
      }

      // Check if this looks like a name (not email, not password, reasonable length)
      if (
        !stringValue.includes("@") &&
        !stringValue.includes(".") &&
        stringValue.length >= 2 &&
        stringValue.length <= 50 &&
        !extractedData.fullName &&
        stringValue !== extractedData.password
      ) {
        extractedData.fullName = stringValue;
      }
    });

    console.log("Extracted user data:", {
      email: extractedData.email ? "present" : "missing",
      password: extractedData.password ? "present" : "missing",
      fullName: extractedData.fullName ? "present" : "missing",
    });

    // Validate that we have the required data
    if (!extractedData.email || !extractedData.password) {
      console.error("Missing required user data:", extractedData);
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    console.log(
      "Checking if user with email already exists:",
      extractedData.email
    );
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", extractedData.email)
      .single();

    if (userCheckError && userCheckError.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is what we want
      console.error("Error checking existing user:", userCheckError);
      return NextResponse.json(
        { error: "Error checking user existence" },
        { status: 500 }
      );
    }

    if (existingUser) {
      console.error("User with email already exists:", extractedData.email);
      return NextResponse.json(
        {
          error:
            "A user with this email address already exists. Please use a different email or try logging in.",
        },
        { status: 400 }
      );
    }

    console.log("Email is available, proceeding with payment creation");

    // Create a Stripe Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: form.title,
              description: `Subscription for ${form.title}`,
            },
            unit_amount: Math.round(form.price * 100), // Convert to cents
            recurring: {
              interval: interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${request.nextUrl.origin}/signup/${formId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/signup/${formId}`,
      metadata: {
        formId,
        coachId: form.coach_id,
        email: extractedData.email,
        password: extractedData.password,
        fullName: extractedData.fullName || "",
        formTitle: form.title,
        pricingType: form.pricing_type,
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
