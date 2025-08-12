import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { MessageSchedulerServices } from "@/lib/messageSchedulerServices";

export async function POST(request: NextRequest) {
  try {
    // Check for API key to secure this endpoint
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.SCHEDULER_API_KEY;
    
    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    
    // Parse request body for QStash integration
    const body = await request.json();
    const { messageId, coachId, recurring } = body;

    let messagesToProcess: any[] = [];

    if (messageId) {
      // Process specific message (from QStash)
      const { data: message, error } = await supabase
        .from("scheduled_messages")
        .select("*")
        .eq("id", messageId)
        .eq("coach_id", coachId)
        .eq("status", "active")
        .eq("is_active", true)
        .single();

      if (error || !message) {
        console.error("Message not found or inactive:", messageId);
        return NextResponse.json({ error: "Message not found" }, { status: 404 });
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
        return NextResponse.json({ error: "Failed to fetch scheduled messages" }, { status: 500 });
      }

      if (!allScheduledMessages || allScheduledMessages.length === 0) {
        return NextResponse.json({ message: "No messages to process", processed: 0 });
      }

      // Filter messages that need to be sent
      const now = new Date();
      messagesToProcess = allScheduledMessages.filter(message => {
        try {
          const scheduledDateTime = new Date(`${message.start_date}T${message.start_time}`);
          const scheduledInTimezone = new Date(scheduledDateTime.toLocaleString("en-US", { 
            timeZone: message.timezone || "UTC" 
          }));
          return scheduledInTimezone <= now;
        } catch (error) {
          console.error("Error processing message time:", error);
          return false;
        }
      });

      if (messagesToProcess.length === 0) {
        return NextResponse.json({ message: "No messages to process", processed: 0 });
      }
    }

    let processedCount = 0;
    const results = [];

    for (const message of messagesToProcess) {
      try {
        // Determine target users
        let targetUsers: any[] = [];
        
        if (message.target_type === 'all') {
          // Get all users assigned to this coach
          const { data: users } = await supabase
            .from("users")
            .select("id")
            .eq("coach", message.coach_id);
          targetUsers = users || [];
        } else if (message.target_type === 'specific' && message.target_user_ids) {
          // Get specific users
          const { data: users } = await supabase
            .from("users")
            .select("id")
            .in("id", message.target_user_ids);
          targetUsers = users || [];
        }

        // Send message to each target user
        for (const user of targetUsers) {
          try {
            await MessageSchedulerServices.sendScheduledMessage(message.id, user.id);
            processedCount++;
          } catch (sendError) {
            console.error(`Failed to send message ${message.id} to user ${user.id}:`, sendError);
            results.push({
              messageId: message.id,
              userId: user.id,
              error: sendError instanceof Error ? sendError.message : 'Unknown error'
            });
          }
        }

        // Update next send time for recurring messages
        if (message.schedule_type !== 'once') {
          const nextSendTime = calculateNextSendTime(message);
          if (nextSendTime) {
            await supabase
              .from("scheduled_messages")
              .update({ next_send_at: nextSendTime })
              .eq("id", message.id);
          }
        } else {
          // Mark one-time messages as completed
          await supabase
            .from("scheduled_messages")
            .update({ status: 'completed' })
            .eq("id", message.id);
        }

      } catch (messageError) {
        console.error(`Error processing message ${message.id}:`, messageError);
        results.push({
          messageId: message.id,
          error: messageError instanceof Error ? messageError.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: "Scheduled messages processed",
      processed: processedCount,
      total: messagesToProcess.length,
      errors: results
    });

  } catch (error) {
    console.error("Error processing scheduled messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateNextSendTime(message: any): string | null {
  const now = new Date();
  
  switch (message.schedule_type) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      
    case 'weekly':
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return nextWeek.toISOString();
      
    case 'monthly':
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      return nextMonth.toISOString();
      
    default:
      return null;
  }
}
