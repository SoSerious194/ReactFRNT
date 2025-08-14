import { NextRequest, NextResponse } from "next/server";
import { AIMessageService } from "@/lib/aiMessageService";

export async function POST(request: NextRequest) {
  try {
    console.log("=== PROCESSING AI MESSAGES ===");
    console.log("Time:", new Date().toISOString());

    // Check for API key to secure this endpoint
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.SCHEDULER_API_KEY;

    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      console.log("Unauthorized request to process-ai-messages");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process pending AI message events
    const result = await AIMessageService.processPendingEvents();

    console.log(
      `AI message processing completed. Processed: ${result.processed}, Errors: ${result.errors}`
    );

    return NextResponse.json({
      message: "AI message processing completed",
      processed: result.processed,
      errors: result.errors,
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI message processing failed:", error);
    return NextResponse.json(
      { error: "Failed to process AI messages" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== AI MESSAGE PROCESSING STATUS ===");

    // Check for API key
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.SCHEDULER_API_KEY;

    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pending events count
    const pendingEvents = await AIMessageService.getPendingEvents();

    return NextResponse.json({
      message: "AI message processing status",
      pending_events: pendingEvents.length,
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to get AI message status:", error);
    return NextResponse.json(
      { error: "Failed to get AI message status" },
      { status: 500 }
    );
  }
}
