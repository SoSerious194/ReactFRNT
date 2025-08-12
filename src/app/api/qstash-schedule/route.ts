import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";

// Initialize QStash client on server side
const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { messageId, scheduledTime, coachId, scheduleType, cronExpression } =
      await request.json();

    if (!messageId || !coachId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let qstashId: string;

    if (scheduleType === "once") {
      // One-time message with delay
      const scheduledDateTime = new Date(scheduledTime);
      const now = new Date();
      const delayInSeconds = Math.max(
        0,
        Math.floor((scheduledDateTime.getTime() - now.getTime()) / 1000)
      );

      const result = await qstash.publishJSON({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/process-scheduled-messages`,
        body: {
          messageId,
          coachId,
          scheduledTime: scheduledDateTime.toISOString(),
        },
        delay: delayInSeconds,
        headers: {
          Authorization: `Bearer ${process.env.SCHEDULER_API_KEY}`,
        },
      });

      qstashId = result.messageId || "unknown";
    } else {
      // Recurring message with cron
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

      qstashId = result.scheduleId;
    }

    return NextResponse.json({
      success: true,
      qstashId,
      message: "Message scheduled successfully",
    });
  } catch (error) {
    console.error("Error scheduling with QStash:", error);
    return NextResponse.json(
      {
        error: "Failed to schedule message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
