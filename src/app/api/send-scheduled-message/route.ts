import { NextRequest, NextResponse } from "next/server";
import { StreamChat } from "stream-chat";
import { createClient } from "@supabase/supabase-js";

// Hash function for creating channel IDs (same as your app)
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

export async function POST(request: NextRequest) {
  try {
    // Check for API key to secure this endpoint
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.SCHEDULER_API_KEY;

    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      console.log("Unauthorized request to send-scheduled-message");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize clients inside the function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const streamKey = process.env.NEXT_PUBLIC_STREAM_KEY;
    const streamSecret = process.env.STREAM_SECRET;

    if (!supabaseUrl || !supabaseServiceKey || !streamKey || !streamSecret) {
      console.error("Missing environment variables");
      return NextResponse.json({ error: "Missing environment variables" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const streamClient = StreamChat.getInstance(streamKey, streamSecret);

    const { messageId, userId } = await request.json();

    if (!messageId || !userId) {
      return NextResponse.json(
        { error: "Missing messageId or userId" },
        { status: 400 }
      );
    }

    console.log(`Sending scheduled message ${messageId} to user ${userId}`);

    // Get the scheduled message from database
    const { data: message, error: messageError } = await supabase
      .from("scheduled_messages")
      .select("*")
      .eq("id", messageId)
      .single();

    if (messageError || !message) {
      throw new Error(`Message not found: ${messageId}`);
    }

    // Get coach details
    const { data: coach, error: coachError } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("id", message.coach_id)
      .single();

    if (coachError || !coach) {
      throw new Error("Coach not found");
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      throw new Error("User not found");
    }

    // Create channel ID (same logic as your app)
    const channelId = `chat_${Math.abs(hashCode(`${coach.id}_${user.id}`)).toString(36)}`;

    // Get or create channel
    const channel = streamClient.channel("messaging", channelId, {
      members: [coach.id, user.id],
    });

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

    console.log(`Successfully sent message ${messageId} to user ${userId}`);

    return NextResponse.json({
      success: true,
      messageId,
      userId,
    });
  } catch (error) {
    console.error("Error sending scheduled message:", error);
    return NextResponse.json(
      {
        error: "Failed to send message",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
