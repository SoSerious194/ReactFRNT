import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { MessageSchedulerServices } from "@/lib/messageSchedulerServices";

// Helper function to determine if a message should be sent based on its schedule
function shouldSendMessage(message: any, now: Date): boolean {
  const lastSentAt = message.last_sent_at ? new Date(message.last_sent_at) : null;
  
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

export async function GET(request: NextRequest) {
  try {
    console.log("=== CRON: PROCESSING RECURRING MESSAGES ===");
    console.log("Time:", new Date().toISOString());

    // Check for API key to secure this endpoint
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.SCHEDULER_API_KEY;

    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      console.log("Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get all active recurring messages
    const { data: allScheduledMessages, error } = await supabase
      .from("scheduled_messages")
      .select("*")
      .eq("status", "active")
      .eq("is_active", true)
      .in("schedule_type", ["5min", "daily", "weekly", "monthly"]);

    if (error) {
      console.error("Error fetching scheduled messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch scheduled messages" },
        { status: 500 }
      );
    }

    if (!allScheduledMessages || allScheduledMessages.length === 0) {
      console.log("No recurring messages to process");
      return NextResponse.json({
        message: "No recurring messages to process",
        processed: 0,
      });
    }

    console.log(`Found ${allScheduledMessages.length} active recurring messages`);

    // Filter messages that need to be sent based on their schedule
    const now = new Date();
    const messagesToProcess = allScheduledMessages.filter((message) => {
      return shouldSendMessage(message, now);
    });

    if (messagesToProcess.length === 0) {
      console.log("No messages due for sending");
      return NextResponse.json({
        message: "No messages due for sending",
        processed: 0,
      });
    }

    console.log(`Processing ${messagesToProcess.length} messages`);

    let processedCount = 0;
    const results = [];

    for (const message of messagesToProcess) {
      try {
        console.log(`Processing message: ${message.id} (${message.schedule_type})`);
        
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

        // Send message to each target user
        for (const user of targetUsers) {
          try {
            console.log(`Sending message ${message.id} to user ${user.id}`);
            await MessageSchedulerServices.sendScheduledMessage(
              message.id,
              user.id
            );
            processedCount++;
            console.log(`Successfully sent message to user ${user.id}`);
          } catch (sendError) {
            console.error(
              `Failed to send message ${message.id} to user ${user.id}:`,
              sendError
            );
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

    console.log(`Cron job completed. Processed: ${processedCount}, Errors: ${results.length}`);

    return NextResponse.json({
      message: "Recurring messages processed",
      processed: processedCount,
      total: messagesToProcess.length,
      errors: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
