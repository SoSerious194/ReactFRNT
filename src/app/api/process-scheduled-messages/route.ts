import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { MessageSchedulerServices } from "@/lib/messageSchedulerServices";

export async function POST(request: NextRequest) {
  try {
    console.log("=== PROCESS SCHEDULED MESSAGES ENDPOINT CALLED ===");
    console.log("Headers:", Object.fromEntries(request.headers.entries()));

    // Check for API key to secure this endpoint
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.SCHEDULER_API_KEY;

    console.log("Auth check:", {
      hasAuthHeader: !!authHeader,
      hasExpectedKey: !!expectedKey,
      authMatches: authHeader === `Bearer ${expectedKey}`,
    });

    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      console.log("Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Parse request body for QStash integration
    const body = await request.json();
    const { messageId, coachId, recurring } = body;

    console.log("Processing scheduled message request:", {
      messageId,
      coachId,
      recurring,
      body,
    });

    let messagesToProcess: any[] = [];

    if (messageId) {
      // Process specific message (from QStash)
      console.log(
        `Processing specific message: ${messageId} for coach: ${coachId}`
      );

      const { data: message, error } = await supabase
        .from("scheduled_messages")
        .select("*")
        .eq("id", messageId)
        .eq("coach_id", coachId)
        .eq("status", "active")
        .eq("is_active", true)
        .single();

      if (error || !message) {
        console.error("Message not found or inactive:", messageId, error);
        return NextResponse.json(
          { error: "Message not found" },
          { status: 404 }
        );
      }

      console.log("Found message to process:", message);

      // Check if message should be processed based on start date
      // Convert local time to UTC for comparison
      const timezone = message.timezone || "UTC";
      const [localHours, localMinutes] = message.start_time
        .split(":")
        .map(Number);
      const [year, month, day] = message.start_date.split("-").map(Number);

      // Create local date
      const localDate = new Date(
        year,
        month - 1,
        day,
        localHours,
        localMinutes,
        0,
        0
      );
      const localOffset = localDate.getTimezoneOffset();
      const startDateTimeUTC = new Date(
        localDate.getTime() + localOffset * 60 * 1000
      );
      const now = new Date();

      console.log(
        `Message start date (local): ${message.start_date}T${message.start_time} ${timezone}`,
        `Message start date (UTC): ${startDateTimeUTC.toISOString()}`,
        `Current time (UTC): ${now.toISOString()}`
      );

      if (startDateTimeUTC > now) {
        console.log(
          `Message ${messageId} is scheduled for future, skipping processing`
        );
        return NextResponse.json({
          message: "Message scheduled for future",
          startDateLocal: `${message.start_date}T${message.start_time}`,
          startDateUTC: startDateTimeUTC.toISOString(),
          currentTime: now.toISOString(),
        });
      }

      messagesToProcess = [message];
    } else {
      // Fallback: Process all messages (for manual testing)
      const { data: allScheduledMessages, error } = await supabase
        .from("scheduled_messages")
        .select("*")
        .eq("status", "active")
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching scheduled messages:", error);
        return NextResponse.json(
          { error: "Failed to fetch scheduled messages" },
          { status: 500 }
        );
      }

      if (!allScheduledMessages || allScheduledMessages.length === 0) {
        return NextResponse.json({
          message: "No messages to process",
          processed: 0,
        });
      }

      // Filter messages that need to be sent
      const now = new Date();
      messagesToProcess = allScheduledMessages.filter((message) => {
        try {
          const scheduledDateTime = new Date(
            `${message.start_date}T${message.start_time}`
          );
          const scheduledInTimezone = new Date(
            scheduledDateTime.toLocaleString("en-US", {
              timeZone: message.timezone || "UTC",
            })
          );
          return scheduledInTimezone <= now;
        } catch (error) {
          console.error("Error processing message time:", error);
          return false;
        }
      });

      if (messagesToProcess.length === 0) {
        return NextResponse.json({
          message: "No messages to process",
          processed: 0,
        });
      }
    }

    let processedCount = 0;
    const results = [];

    for (const message of messagesToProcess) {
      try {
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

        // Update message status and next send time
        if (message.schedule_type === "once") {
          // Mark one-time messages as completed
          await supabase
            .from("scheduled_messages")
            .update({
              status: "completed",
              last_sent_at: new Date().toISOString(),
            })
            .eq("id", message.id);
        } else {
          // For recurring messages, update last sent time
          // QStash handles the next execution via cron
          await supabase
            .from("scheduled_messages")
            .update({
              last_sent_at: new Date().toISOString(),
            })
            .eq("id", message.id);
        }
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

    return NextResponse.json({
      message: "Scheduled messages processed",
      processed: processedCount,
      total: messagesToProcess.length,
      errors: results,
    });
  } catch (error) {
    console.error("Error processing scheduled messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
