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
        formData: JSON.stringify(formData),
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
