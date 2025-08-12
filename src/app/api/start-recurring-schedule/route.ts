import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";

// Initialize QStash client on server side
const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    console.log("=== START RECURRING SCHEDULE ENDPOINT CALLED ===");
    console.log("Time:", new Date().toISOString());

    // Check for API key to secure this endpoint
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.SCHEDULER_API_KEY;

    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      console.log("Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, coachId, cronExpression } = await request.json();

    console.log(
      `Starting recurring schedule for message: ${messageId}, coach: ${coachId}`
    );
    console.log(`Cron expression: ${cronExpression}`);

    if (!messageId || !coachId || !cronExpression) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the actual recurring schedule now that it's time to start
    const result = await qstash.schedules.create({
      destination: `${process.env.NEXT_PUBLIC_APP_URL}/api/process-scheduled-messages`,
      cron: cronExpression,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SCHEDULER_API_KEY}`,
      },
      body: JSON.stringify({
        messageId,
        coachId,
        recurring: true,
      }),
    });

    console.log(`Created recurring schedule with ID: ${result.scheduleId}`);

    // Send the first message immediately since we're at the scheduled time
    console.log(`Sending first message immediately`);
    try {
      const firstMessageResult = await qstash.publishJSON({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/process-scheduled-messages`,
        body: {
          messageId,
          coachId,
          recurring: true,
          isFirstMessage: true,
        },
        headers: {
          Authorization: `Bearer ${process.env.SCHEDULER_API_KEY}`,
        },
      });

      console.log(
        `First message sent with ID: ${firstMessageResult.messageId}`
      );
    } catch (error) {
      console.error("Error sending first message:", error);
    }

    return NextResponse.json({
      success: true,
      scheduleId: result.scheduleId,
      message: "Recurring schedule started successfully and first message sent",
    });
  } catch (error) {
    console.error("Error starting recurring schedule:", error);
    return NextResponse.json(
      {
        error: "Failed to start recurring schedule",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
