import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
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

    // Create Supabase client with service role key for admin operations
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Test database connection and permissions
    console.log("=== DATABASE CONNECTION TEST ===");
    console.log("Supabase URL:", supabaseUrl);
    console.log("Service key configured:", !!supabaseServiceKey);

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return NextResponse.json(
        { error: "Supabase configuration missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Debug Supabase client configuration
    console.log("Supabase client created successfully with service role key");
    console.log("Supabase URL configured:", !!supabaseUrl);
    console.log("Supabase service role key configured:", !!supabaseServiceKey);

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
        const {
          formId,
          coachId,
          email,
          password,
          fullName,
          selectedPlan,
          planPrice,
        } = session.metadata || {};

        console.log("Extracted metadata:", {
          formId,
          coachId,
          email: email ? "present" : "missing",
          password: password ? "present" : "missing",
          fullName: fullName ? "present" : "missing",
        });

        if (!coachId || !email || !password) {
          console.error("Missing required metadata for user creation");
          console.error("Missing metadata details:", {
            coachId: coachId ? "present" : "missing",
            email: email ? "present" : "missing",
            password: password ? "present" : "missing",
            fullName: fullName ? "present" : "missing",
            formId: formId ? "present" : "missing",
          });
          return NextResponse.json(
            {
              error: "Missing required metadata",
              details: {
                coachId: !!coachId,
                email: !!email,
                password: !!password,
                fullName: !!fullName,
                formId: !!formId,
              },
            },
            { status: 400 }
          );
        }

        // FIRST: Save form submission with "converted" status (payment succeeded)
        console.log("Saving form submission with 'converted' status...");
        const { error: submissionError } = await supabase
          .from("signup_form_submissions")
          .insert({
            form_id: formId,
            coach_id: coachId,
            form_data: { email, fullName },
            submitted_at: new Date().toISOString(),
            status: "converted", // Payment succeeded
            stripe_session_id: session.id,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          });

        if (submissionError) {
          console.error("Error saving form submission:", submissionError);
          console.error("Submission error details:", {
            message: submissionError.message,
            code: submissionError.code,
            details: submissionError.details,
            hint: submissionError.hint,
          });
          // Continue with user creation even if submission save fails
        } else {
          console.log(
            "Form submission saved successfully with 'converted' status"
          );
        }

        // Check if user already exists (in case webhook is called multiple times)
        console.log("Checking if user already exists in webhook:", email);
        const { data: existingUser, error: userCheckError } = await supabase
          .from("users")
          .select("id, email, role, coach")
          .eq("email", email)
          .single();

        if (existingUser) {
          console.log("User already exists:", existingUser);

          // Check if role and coach are missing and update them
          if (!existingUser.role || !existingUser.coach) {
            console.log("User exists but missing role/coach, updating...");
            const { error: updateError } = await supabase
              .from("users")
              .update({
                role: "client",
                coach: coachId,
              })
              .eq("id", existingUser.id);

            if (updateError) {
              console.error("Error updating existing user:", updateError);
            } else {
              console.log(
                "Successfully updated existing user with role and coach"
              );
            }
          } else {
            console.log("User already has role and coach, skipping update");
          }

          return NextResponse.json({ received: true });
        }

        // Create user in Supabase Auth
        console.log("Creating user with email:", email);
        const { data: authData, error: authError } =
          await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              coach_id: coachId,
              form_id: formId,
            },
            app_metadata: {
              role: "client",
              coach: coachId,
            },
          });

        if (authError) {
          console.error("Error creating auth user:", authError);
          console.error("Auth error details:", {
            message: authError.message,
            status: authError.status,
            name: authError.name,
            stack: authError.stack,
          });

          // Update form submission status to "failed" if user creation fails
          await supabase
            .from("signup_form_submissions")
            .update({
              status: "failed",
              notes: `User creation failed: ${authError.message} (Status: ${authError.status})`,
            })
            .eq("stripe_session_id", session.id);

          return NextResponse.json(
            {
              error: "Failed to create user",
              details: {
                message: authError.message,
                status: authError.status,
                name: authError.name,
              },
            },
            { status: 500 }
          );
        }

        const userId = authData.user.id;
        console.log("User created successfully with ID:", userId);

        // Save user data to users table
        console.log("Saving user data to users table...");
        // First, try inserting basic user data
        const basicUserData = {
          id: userId,
          email,
          full_name: fullName,
          coach: coachId,
          role: "client",
          selected_plan_name: selectedPlan,
          selected_plan_price: planPrice ? parseFloat(planPrice) : null,
          plan_active: true,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          subscription_status: "active",
          created_at: new Date().toISOString(),
        };

        console.log("Inserting basic user data:", basicUserData);

        const { data: insertedUser, error: userError } = await supabase
          .from("users")
          .insert(basicUserData)
          .select()
          .single();

        if (userError) {
          console.error("Error saving user data:", userError);
          console.error("User data error details:", {
            message: userError.message,
            code: userError.code,
            details: userError.details,
            hint: userError.hint,
          });

          // If it's a duplicate key error, try to update the existing user
          if (userError.code === "23505") {
            console.log(
              "User already exists in users table, attempting to update..."
            );
            const { error: updateError } = await supabase
              .from("users")
              .update({
                email,
                full_name: fullName,
                role: "client",
                coach: coachId,
                selected_plan_name: selectedPlan,
                selected_plan_price: planPrice ? parseFloat(planPrice) : null,
                plan_active: true,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                subscription_status: "active",
                created_at: new Date().toISOString(),
              })
              .eq("id", userId);

            if (updateError) {
              console.error(
                "Error updating existing user in users table:",
                updateError
              );
              // Update form submission with error note
              await supabase
                .from("signup_form_submissions")
                .update({
                  notes: `User data update failed: ${updateError.message} (Code: ${updateError.code})`,
                })
                .eq("stripe_session_id", session.id);
            } else {
              console.log("Successfully updated existing user in users table");
            }
          } else {
            // Update form submission with error note for other errors
            await supabase
              .from("signup_form_submissions")
              .update({
                notes: `User data save failed: ${userError.message} (Code: ${userError.code})`,
              })
              .eq("stripe_session_id", session.id);
          }
        } else {
          console.log("Basic user data saved successfully to users table");
          console.log("Inserted user data:", insertedUser);

          // Now try to update with role and coach
          console.log("Attempting to update user with role and coach...");
          console.log("Update data:", { role: "client", coach: coachId });
          console.log("User ID to update:", userId);

          const { data: updateResult, error: updateError } = await supabase
            .from("users")
            .update({
              role: "client",
              coach: coachId,
            })
            .eq("id", userId)
            .select();

          if (updateError) {
            console.error("Error updating user role/coach:", updateError);
            console.error("Update error details:", {
              message: updateError.message,
              code: updateError.code,
              details: updateError.details,
              hint: updateError.hint,
            });
          } else {
            console.log("Successfully updated user role and coach");
            console.log("Update result:", updateResult);

            // Verify the final user data
            const { data: finalUser, error: verifyError } = await supabase
              .from("users")
              .select("id, email, full_name, coach, role, created_at")
              .eq("id", userId)
              .single();

            if (verifyError) {
              console.error("Error verifying final user data:", verifyError);
            } else {
              console.log("Final user data in database:", finalUser);

              // Check if role and coach are actually saved
              if (!finalUser.role) {
                console.error("❌ ROLE IS STILL MISSING after update!");
              } else {
                console.log("✅ Role saved successfully:", finalUser.role);
              }

              if (!finalUser.coach) {
                console.error("❌ COACH IS STILL MISSING after update!");
              } else {
                console.log("✅ Coach saved successfully:", finalUser.coach);
              }
            }
          }
        }

        console.log(`Successfully created user ${userId} for form ${formId}`);
        break;

      case "checkout.session.expired":
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        console.log("=== CHECKOUT SESSION EXPIRED ===");
        console.log("Session ID:", expiredSession.id);
        console.log("Session metadata:", expiredSession.metadata);

        const {
          formId: expiredFormId,
          coachId: expiredCoachId,
          email: expiredEmail,
          fullName: expiredFullName,
        } = expiredSession.metadata || {};

        if (expiredFormId && expiredCoachId && expiredEmail) {
          console.log("Saving expired form submission...");
          await supabase.from("signup_form_submissions").insert({
            form_id: expiredFormId,
            coach_id: expiredCoachId,
            form_data: { email: expiredEmail, fullName: expiredFullName },
            submitted_at: new Date().toISOString(),
            status: "expired", // Session expired
            stripe_session_id: expiredSession.id,
          });
          console.log("Expired form submission saved");
        }
        break;

      case "checkout.session.async_payment_failed":
        const failedSession = event.data.object as Stripe.Checkout.Session;
        console.log("=== CHECKOUT SESSION PAYMENT FAILED ===");
        console.log("Session ID:", failedSession.id);
        console.log("Session metadata:", failedSession.metadata);

        const {
          formId: failedFormId,
          coachId: failedCoachId,
          email: failedEmail,
          fullName: failedFullName,
        } = failedSession.metadata || {};

        if (failedFormId && failedCoachId && failedEmail) {
          console.log("Saving failed payment form submission...");
          await supabase.from("signup_form_submissions").insert({
            form_id: failedFormId,
            coach_id: failedCoachId,
            form_data: { email: failedEmail, fullName: failedFullName },
            submitted_at: new Date().toISOString(),
            status: "payment_failed", // Payment failed
            stripe_session_id: failedSession.id,
          });
          console.log("Failed payment form submission saved");
        }
        break;

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object as Stripe.Subscription;
        console.log("=== SUBSCRIPTION UPDATED ===");
        console.log("Subscription ID:", updatedSubscription.id);
        console.log("Customer ID:", updatedSubscription.customer);
        console.log("Status:", updatedSubscription.status);
        console.log("Metadata:", updatedSubscription.metadata);

        // Update user's subscription status
        const updateData: any = {
          subscription_status: updatedSubscription.status,
          plan_active: updatedSubscription.status === "active",
        };

        // Update plan details if available in metadata
        if (updatedSubscription.metadata.plan_name) {
          updateData.selected_plan_name = updatedSubscription.metadata.plan_name;
          updateData.selected_plan_price = parseFloat(updatedSubscription.metadata.plan_price || "0");
        }

        await supabase
          .from("users")
          .update(updateData)
          .eq("stripe_subscription_id", updatedSubscription.id);
        console.log("Status:", updatedSubscription.status);

        // Update user's subscription status
        const { error: updateError } = await supabase
          .from("users")
          .update({
            subscription_status: updatedSubscription.status,
            plan_active: updatedSubscription.status === "active",
          })
          .eq("stripe_subscription_id", updatedSubscription.id);

        if (updateError) {
          console.error("Error updating subscription status:", updateError);
        } else {
          console.log("Subscription status updated successfully");
        }
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log("=== SUBSCRIPTION DELETED ===");
        console.log("Subscription ID:", deletedSubscription.id);

        // Update user's subscription status to inactive
        const { error: deleteError } = await supabase
          .from("users")
          .update({
            subscription_status: "canceled",
            plan_active: false,
          })
          .eq("stripe_subscription_id", deletedSubscription.id);

        if (deleteError) {
          console.error(
            "Error updating deleted subscription status:",
            deleteError
          );
        } else {
          console.log("Subscription deletion status updated successfully");
        }
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

        // Update user's subscription status to past_due
        const subscriptionId = (failedInvoice as any).subscription;
        if (subscriptionId && typeof subscriptionId === "string") {
          const { error: failedError } = await supabase
            .from("users")
            .update({
              subscription_status: "past_due",
              plan_active: false,
            })
            .eq("stripe_subscription_id", subscriptionId);

          if (failedError) {
            console.error("Error updating failed payment status:", failedError);
          } else {
            console.log("Failed payment status updated successfully");
          }
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    console.error("Webhook error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: {
          message: error instanceof Error ? error.message : "Unknown error",
          name: error instanceof Error ? error.name : "Unknown",
        },
      },
      { status: 500 }
    );
  }
}
