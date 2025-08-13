import { NextRequest, NextResponse } from "next/server";
import { StreamChat } from "stream-chat";
import { createClient } from "@supabase/supabase-js";

// Helper function to determine if a message should be sent based on its schedule
function shouldSendMessage(message: any, now: Date): boolean {
  const lastSentAt = message.last_sent_at
    ? new Date(message.last_sent_at)
    : null;

  switch (message.schedule_type) {
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

export async function POST(request: NextRequest) {
  try {
    console.log("Processing scheduled messages at:", new Date().toISOString());

    // Check for API key to secure this endpoint
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.SCHEDULER_API_KEY;

    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      console.log("Unauthorized request to process-scheduled-messages");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize clients
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const streamKey = process.env.NEXT_PUBLIC_STREAM_KEY;
    const streamSecret = process.env.STREAM_SECRET;

    if (!supabaseUrl || !supabaseServiceKey || !streamKey || !streamSecret) {
      console.error("Missing environment variables");
      return NextResponse.json(
        { error: "Missing environment variables" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const streamClient = StreamChat.getInstance(streamKey, streamSecret);

    // Get all active recurring messages
    const { data: allScheduledMessages, error } = await supabase
      .from("scheduled_messages")
      .select("*")
      .eq("status", "active")
      .eq("is_active", true)
      .in("schedule_type", ["daily", "weekly", "monthly"]);

    if (error) {
      console.error("Error fetching scheduled messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch scheduled messages" },
        { status: 500 }
      );
    }

    if (!allScheduledMessages || allScheduledMessages.length === 0) {
      return NextResponse.json({
        message: "No recurring messages to process",
        processed: 0,
        status: "success",
        timestamp: new Date().toISOString(),
      });
    }

    // Filter messages that need to be sent based on their schedule
    const now = new Date();
    const messagesToProcess = allScheduledMessages.filter((message) => {
      return shouldSendMessage(message, now);
    });

    if (messagesToProcess.length === 0) {
      return NextResponse.json({
        message: "No messages due for sending",
        processed: 0,
        status: "success",
        timestamp: new Date().toISOString(),
      });
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
            .select("id, full_name")
            .eq("coach", message.coach_id);
          targetUsers = users || [];
        } else if (
          message.target_type === "specific" &&
          message.target_user_ids
        ) {
          // Get specific users
          const { data: users } = await supabase
            .from("users")
            .select("id, full_name")
            .in("id", message.target_user_ids);
          targetUsers = users || [];
        }

        console.log(`Sending message to ${targetUsers.length} users`);

        // Send message to each target user
        for (const user of targetUsers) {
          try {
            console.log(`Sending message ${message.id} to user ${user.id}`);

            // Get coach details
            const { data: coach, error: coachError } = await supabase
              .from("users")
              .select("id, full_name")
              .eq("id", message.coach_id)
              .single();

            if (coachError || !coach) {
              throw new Error("Coach not found");
            }

            // Create channel ID (same logic as your inbox page)
            const combinedIds = [coach.id, user.id].sort().join("-");
            const hash = combinedIds.split("").reduce((a, b) => {
              a = (a << 5) - a + b.charCodeAt(0);
              return a & a;
            }, 0);
            const channelId = `chat_${Math.abs(hash).toString(36)}`;

            console.log(
              "Creating channel with ID:",
              channelId,
              "Length:",
              channelId.length
            );

            // Get or create channel
            const channel = streamClient.channel("messaging", channelId, {
              members: [coach.id, user.id],
            });

            // Initialize the channel (same as your inbox page)
            await channel.watch();

            // Upsert users
            await streamClient.upsertUser({
              id: coach.id,
              name: coach.full_name,
            });

            await streamClient.upsertUser({
              id: user.id,
              name: user.full_name || "User",
            });

            // Send message
            await channel.sendMessage({
              text: message.content,
              user_id: coach.id,
            });

            // Record delivery in database
            await supabase.from("message_deliveries").insert({
              scheduled_message_id: message.id,
              user_id: user.id,
              sent_at: new Date().toISOString(),
              status: "sent",
            });

            processedCount++;
            console.log(`Successfully sent message to user ${user.id}`);
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
      `API completed. Processed: ${processedCount}, Errors: ${results.length}`
    );

    return NextResponse.json({
      message: "Scheduled messages processed",
      processed: processedCount,
      total: messagesToProcess.length,
      errors: results,
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
      }
    );
  }
}
