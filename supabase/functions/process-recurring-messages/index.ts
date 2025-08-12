import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Helper function to determine if a message should be sent based on its schedule
function shouldSendMessage(message: any, now: Date): boolean {
  const lastSentAt = message.last_sent_at
    ? new Date(message.last_sent_at)
    : null;

  switch (message.schedule_type) {
    case "5min":
      // For 5-minute schedules, send if:
      // 1. Never sent before, OR
      // 2. Last sent more than 5 minutes ago
      if (!lastSentAt) return true;
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      return lastSentAt <= fiveMinutesAgo;

    case "daily":
      // For daily schedules, send if:
      // 1. Never sent before, OR
      // 2. Last sent more than 24 hours ago
      if (!lastSentAt) return true;
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return lastSentAt <= oneDayAgo;

    case "weekly":
      // For weekly schedules, send if:
      // 1. Never sent before, OR
      // 2. Last sent more than 7 days ago
      if (!lastSentAt) return true;
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return lastSentAt <= oneWeekAgo;

    case "monthly":
      // For monthly schedules, send if:
      // 1. Never sent before, OR
      // 2. Last sent more than 30 days ago
      if (!lastSentAt) return true;
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return lastSentAt <= oneMonthAgo;

    default:
      return false;
  }
}

serve(async (req) => {
  try {
    console.log("Processing recurring messages at:", new Date().toISOString());

    // Authentication is handled by Supabase Edge Functions automatically
    // The request comes from pg_cron with the anon key
    
    // Check if we have the required environment variables
    const appUrl = Deno.env.get('NEXT_PUBLIC_APP_URL');
    const schedulerKey = Deno.env.get('SCHEDULER_API_KEY');
    
    if (!appUrl || !schedulerKey) {
      console.error("Missing environment variables:", {
        appUrl: appUrl ? "SET" : "NOT SET",
        schedulerKey: schedulerKey ? "SET" : "NOT SET"
      });
      return new Response(JSON.stringify({ error: "Missing environment variables" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SERVER_URL")!;
    const supabaseServiceKey = Deno.env.get("SERVER_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.log("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ error: "Missing Supabase credentials" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active recurring messages
    const { data: allScheduledMessages, error } = await supabase
      .from("scheduled_messages")
      .select("*")
      .eq("status", "active")
      .eq("is_active", true)
      .in("schedule_type", ["5min", "daily", "weekly", "monthly"]);

    if (error) {
      console.error("Error fetching scheduled messages:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch scheduled messages" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!allScheduledMessages || allScheduledMessages.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No recurring messages to process",
          processed: 0,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Filter messages that need to be sent based on their schedule
    const now = new Date();
    const messagesToProcess = allScheduledMessages.filter((message) => {
      return shouldSendMessage(message, now);
    });

    if (messagesToProcess.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No messages due for sending",
          processed: 0,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    let processedCount = 0;
    const results = [];

    for (const message of messagesToProcess) {
      try {
        console.log(
          `Processing message: ${message.id} (${message.schedule_type})`
        );

        // Determine target users
        let targetUsers: any[] = [];

        if (message.target_type === "all") {
          // Get all users assigned to this coach
          const { data: users } = await supabase
            .from("users")
            .select("id")
            .eq("coach", message.coach_id);
          targetUsers = users || [];
        } else if (
          message.target_type === "specific" &&
          message.target_user_ids
        ) {
          // Get specific users
          const { data: users } = await supabase
            .from("users")
            .select("id")
            .in("id", message.target_user_ids);
          targetUsers = users || [];
        }

        console.log(`Sending message to ${targetUsers.length} users`);

        // Send message to each target user via Next.js API
        for (const user of targetUsers) {
          try {
            console.log(`Sending message ${message.id} to user ${user.id}`);

            // Call the Next.js API to send the message
            const appUrl = Deno.env.get('NEXT_PUBLIC_APP_URL');
            const apiUrl = appUrl?.startsWith('http') ? `${appUrl}/api/send-scheduled-message` : `https://${appUrl}/api/send-scheduled-message`;
            
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SCHEDULER_API_KEY')}`
              },
              body: JSON.stringify({
                messageId: message.id,
                userId: user.id
              })
            });

            if (response.ok) {
              processedCount++;
              console.log(`Successfully sent message to user ${user.id}`);
            } else {
              const errorData = await response.json();
              throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
            }
          } catch (sendError) {
            console.error(
              `Failed to send message ${message.id} to user ${user.id}:`,
              sendError
            );

            // Record failed delivery
            await supabase.from("message_deliveries").insert({
              scheduled_message_id: message.id,
              user_id: user.id,
              sent_at: new Date().toISOString(),
              status: "failed",
              error_message:
                sendError instanceof Error
                  ? sendError.message
                  : "Unknown error",
            });

            results.push({
              messageId: message.id,
              userId: user.id,
              error:
                sendError instanceof Error
                  ? sendError.message
                  : "Unknown error",
            });
          }
        }

        // Update last sent time for recurring messages
        await supabase
          .from("scheduled_messages")
          .update({
            last_sent_at: new Date().toISOString(),
          })
          .eq("id", message.id);

        console.log(`Updated last_sent_at for message ${message.id}`);
      } catch (messageError) {
        console.error(`Error processing message ${message.id}:`, messageError);
        results.push({
          messageId: message.id,
          error:
            messageError instanceof Error
              ? messageError.message
              : "Unknown error",
        });
      }
    }

    console.log(
      `Edge function completed. Processed: ${processedCount}, Errors: ${results.length}`
    );

    return new Response(
      JSON.stringify({
        message: "Recurring messages processed",
        processed: processedCount,
        total: messagesToProcess.length,
        errors: results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in edge function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
