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
      console.log(`Creating recurring schedule with cron: ${cronExpression}`);
      console.log(`Scheduled time: ${scheduledTime}`);

      // Special handling for 5-minute schedules - start immediately
      if (scheduleType === "5min") {
        console.log(`Creating 5-minute recurring schedule - starting immediately`);
        
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
        console.log(`Created 5-minute QStash schedule with ID: ${qstashId}`);
        
        // Send first message immediately - no delays, no timezone issues
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
          console.log(`First 5-minute message sent with ID: ${firstMessageResult.messageId}`);
        } catch (error) {
          console.error("Error sending first 5-minute message:", error);
        }
      } else {
        // Calculate delay until start date for other recurring schedules
        const startDateTime = new Date(scheduledTime);
        const now = new Date();
        const delayInSeconds = Math.max(
          0,
          Math.floor((startDateTime.getTime() - now.getTime()) / 1000)
        );

        console.log(
          `Start date: ${startDateTime.toISOString()}, Delay: ${delayInSeconds} seconds`
        );

        if (delayInSeconds > 0) {
          // If the start date is in the future, create a delayed one-time message
          // that will trigger the recurring schedule at the correct time
          console.log(
            `Creating delayed one-time message to start recurring schedule`
          );

          const delayedResult = await qstash.publishJSON({
            url: `${process.env.NEXT_PUBLIC_APP_URL}/api/start-recurring-schedule`,
            body: {
              messageId,
              coachId,
              cronExpression,
              recurring: true,
            },
            delay: delayInSeconds,
            headers: {
              Authorization: `Bearer ${process.env.SCHEDULER_API_KEY}`,
            },
          });

          qstashId = delayedResult.messageId || "delayed-start";
          console.log(`Created delayed start message with ID: ${qstashId}`);
        } else {
          // If the start date is now or in the past, create the recurring schedule immediately
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
          console.log(`Created QStash schedule with ID: ${qstashId}`);
        }
      }
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
