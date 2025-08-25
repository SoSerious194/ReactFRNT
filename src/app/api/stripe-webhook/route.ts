import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  console.log("=== WEBHOOK RECEIVED ===");
  console.log("Request URL:", request.url);
  console.log("Request method:", request.method);

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.error("STRIPE_SECRET_KEY is not configured");
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured" },
      { status: 500 }
    );
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured" },
      { status: 500 }
    );
  }

  console.log("Environment variables configured successfully");

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-07-30.basil",
  });

  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  console.log("Webhook signature:", sig ? "present" : "missing");
  console.log("Body length:", body.length);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
    console.log("Webhook signature verification successful");
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    console.log("Processing webhook event:", event.type);
    const supabase = await createClient();

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("=== CHECKOUT SESSION COMPLETED ===");
        console.log("Session ID:", session.id);
        console.log("Session metadata:", session.metadata);
        console.log("Session customer:", session.customer);
        console.log("Session subscription:", session.subscription);

        // Extract metadata
        const { formId, coachId, email, password, fullName } =
          session.metadata || {};

        console.log("Extracted metadata:", {
          formId,
          coachId,
          email: email ? "present" : "missing",
          password: password ? "present" : "missing",
          fullName: fullName ? "present" : "missing",
        });

        if (!coachId || !email || !password) {
          console.error("Missing required metadata for user creation");
          return NextResponse.json(
            { error: "Missing required metadata" },
            { status: 400 }
          );
        }

        // Check if user already exists (in case webhook is called multiple times)
        console.log("Checking if user already exists in webhook:", email);
        const { data: existingUser, error: userCheckError } = await supabase
          .from("users")
          .select("id, email")
          .eq("email", email)
          .single();

        if (existingUser) {
          console.log("User already exists, skipping creation:", email);
          return NextResponse.json({ received: true });
        }

        // Log the user data for debugging
        console.log("Creating user with email:", email);

        // Create user in Supabase Auth
        const { data: authData, error: authError } =
          await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });

        if (authError) {
          console.error("Error creating auth user:", authError);
          return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
          );
        }

        const userId = authData.user.id;
        console.log("User created successfully with ID:", userId);

        // Save user data to users table
        console.log("Saving user data to users table...");
        const { error: userError } = await supabase.from("users").insert({
          id: userId,
          email,
          full_name: fullName,
          coach: coachId,
          role: "client",
          created_at: new Date().toISOString(),
        });

        if (userError) {
          console.error("Error saving user data:", userError);
          // Note: We don't want to fail the webhook if this fails, as the auth user is already created
        } else {
          console.log("User data saved successfully to users table");
        }

        // Save form submission
        console.log("Saving form submission...");
        const { error: submissionError } = await supabase
          .from("signup_form_submissions")
          .insert({
            form_id: formId,
            coach_id: coachId,
            form_data: { email, fullName }, // Store essential data only
            submitted_at: new Date().toISOString(),
            status: "converted", // Mark as converted since payment succeeded
          });

        if (submissionError) {
          console.error("Error saving form submission:", submissionError);
        } else {
          console.log("Form submission saved successfully");
        }

        console.log(`Successfully created user ${userId} for form ${formId}`);
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice;
        console.log(
          `Subscription payment succeeded for invoice: ${invoice.id}`
        );
        break;

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log(
          `Subscription payment failed for invoice: ${failedInvoice.id}`
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
