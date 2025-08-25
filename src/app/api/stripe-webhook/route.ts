import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured" },
      { status: 500 }
    );
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-07-30.basil",
  });

  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
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

        // Extract metadata
        const { formId, coachId, formData } = session.metadata || {};

        if (!coachId) {
          console.error("Missing required metadata for user creation");
          return NextResponse.json(
            { error: "Missing required metadata" },
            { status: 400 }
          );
        }

        // Parse form data
        const parsedFormData = JSON.parse(formData || "{}");

        // Extract email and password from form data
        const email = parsedFormData.email || parsedFormData.email_address;
        const password = parsedFormData.password;

        if (!email || !password) {
          console.error("Email or password not found in form data");
          return NextResponse.json(
            { error: "Email and password are required" },
            { status: 400 }
          );
        }

        // Log the form data for debugging
        console.log("Form data received:", Object.keys(parsedFormData));

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

        // Extract additional user data from form
        const fullName =
          parsedFormData.full_name || parsedFormData.name || null;

        // Save user data to users table
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
        }

        // Save form submission
        const { error: submissionError } = await supabase
          .from("signup_form_submissions")
          .insert({
            form_id: formId,
            coach_id: coachId,
            form_data: parsedFormData,
            submitted_at: new Date().toISOString(),
            status: "converted", // Mark as converted since payment succeeded
          });

        if (submissionError) {
          console.error("Error saving form submission:", submissionError);
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
