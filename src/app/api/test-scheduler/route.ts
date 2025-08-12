import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { MessageSchedulerServices } from "@/lib/messageSchedulerServices";

export async function POST(request: NextRequest) {
  try {
    // For local testing, we'll get the user from the request body
    const body = await request.json();
    const { coachId } = body;
    
    if (!coachId) {
      return NextResponse.json({ error: "coachId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Get all active scheduled messages for this coach
    const { data: scheduledMessages, error } = await supabase
      .from("scheduled_messages")
      .select("*")
      .eq("coach_id", coachId)
      .eq("status", "active")
      .eq("is_active", true);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch scheduled messages" }, { status: 500 });
    }

    if (!scheduledMessages || scheduledMessages.length === 0) {
      return NextResponse.json({ message: "No active scheduled messages found" });
    }

    let processedCount = 0;
    const results = [];

    for (const message of scheduledMessages) {
      try {
        // Determine target users
        let targetUsers: any[] = [];
        
        if (message.target_type === 'all') {
          // Get all users assigned to this coach
          const { data: users } = await supabase
            .from("users")
            .select("id")
            .eq("coach", coachId);
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
        for (const targetUser of targetUsers) {
          try {
            await MessageSchedulerServices.sendScheduledMessage(message.id, targetUser.id);
            processedCount++;
            results.push({
              messageId: message.id,
              userId: targetUser.id,
              status: 'sent'
            });
          } catch (sendError) {
            console.error(`Failed to send message ${message.id} to user ${targetUser.id}:`, sendError);
            results.push({
              messageId: message.id,
              userId: targetUser.id,
              error: sendError instanceof Error ? sendError.message : 'Unknown error'
            });
          }
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
      message: "Test processing completed",
      processed: processedCount,
      total: scheduledMessages.length,
      results: results
    });

  } catch (error) {
    console.error("Error in test scheduler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
