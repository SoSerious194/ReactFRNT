import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

interface PricingPlan {
  name: string;
  price: number;
  enabled: boolean;
}

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

    const { formId, formData, selectedPlan } = await request.json();

    // Get the form details to get pricing and coach information
    const supabase = await createClient();

    const { data: form, error: formError } = await supabase
      .from("signup_forms")
      .select("pricing_plans, coach_id, title")
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

    // Validate selected plan
    if (!selectedPlan) {
      console.error("No plan selected");
      return NextResponse.json(
        { error: "Please select a pricing plan" },
        { status: 400 }
      );
    }

    // Validate that the selected plan exists and is enabled
    const pricingPlans = (form.pricing_plans || []) as PricingPlan[];
    const planExists = pricingPlans.find(
      (plan: PricingPlan) =>
        plan.name === selectedPlan.name &&
        plan.price === selectedPlan.price &&
        plan.enabled
    );

    if (!planExists) {
      console.error("Selected plan not found or not enabled:", selectedPlan);
      return NextResponse.json(
        { error: "Invalid pricing plan selected" },
        { status: 400 }
      );
    }

    // For free plans, we'll handle user creation after data extraction
    const isFreePlan = selectedPlan.price === 0;

    // Extract essential user data from form data using form element types
    const extractedData = {
      email: null as string | null,
      password: null as string | null,
      fullName: null as string | null,
    };

    console.log("Raw form data:", formData);

    // Get the form structure to understand field types
    const { data: formStructure, error: formStructureError } = await supabase
      .from("signup_forms")
      .select("elements")
      .eq("id", formId)
      .single();

    if (formStructureError) {
      console.error("Error getting form structure:", formStructureError);
      return NextResponse.json(
        { error: "Failed to get form structure" },
        { status: 500 }
      );
    }

    if (!formStructure?.elements) {
      console.error("No form elements found");
      return NextResponse.json(
        { error: "Form structure not found" },
        { status: 400 }
      );
    }

    const elements = formStructure.elements as any[];
    console.log("Form elements:", elements);

    // Map form elements to form data using their types
    elements.forEach((element) => {
      const fieldValue = formData[element.id];
      if (fieldValue) {
        if (element.type === "email") {
          extractedData.email = String(fieldValue);
          console.log("Found email from form type:", extractedData.email);
        } else if (element.type === "password") {
          extractedData.password = String(fieldValue);
          console.log("Found password from form type:", extractedData.password);
        } else if (element.type === "full_name") {
          extractedData.fullName = String(fieldValue);
          console.log("Found name from form type:", extractedData.fullName);
        }
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
      console.error("Available form data:", formData);
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

    console.log("Email is available, proceeding with user creation/payment");

    // For free plans, create user account directly
    if (isFreePlan) {
      console.log("Free plan selected, creating user account directly");

      // Create user account with plan information
      const { data: newUser, error: userCreateError } = await supabase
        .from("users")
        .insert({
          id: crypto.randomUUID(),
          email: extractedData.email,
          full_name: extractedData.fullName,
          coach: form.coach_id,
          role: "Client",
          selected_plan_name: selectedPlan.name,
          selected_plan_price: selectedPlan.price,
          plan_active: true,
          subscription_status: "active",
        })
        .select()
        .single();

      if (userCreateError) {
        console.error("Error creating user account:", userCreateError);
        return NextResponse.json(
          { error: "Failed to create user account" },
          { status: 500 }
        );
      }

      console.log("User account created successfully:", newUser.id);
      return NextResponse.json({
        checkoutUrl: `${request.nextUrl.origin}/signup/${formId}/success?plan=free&user_id=${newUser.id}`,
        isFreePlan: true,
        userId: newUser.id,
      });
    }

    // Create a Stripe Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${form.title} - ${selectedPlan.name}`,
              description: `${selectedPlan.name} plan for ${form.title}`,
            },
            unit_amount: Math.round(selectedPlan.price * 100), // Convert to cents
            recurring: {
              interval: "month", // Always monthly
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
        selectedPlan: selectedPlan.name,
        planPrice: selectedPlan.price.toString(),
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
