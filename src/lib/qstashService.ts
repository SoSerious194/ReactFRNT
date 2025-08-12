import { Client } from "@upstash/qstash";

// Initialize QStash client
const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export class QStashService {
  /**
   * Schedule a message to be sent at a specific time
   */
  static async scheduleMessage(
    messageId: string,
    scheduledTime: Date,
    coachId: string
  ): Promise<string> {
    try {
      // Calculate delay in seconds
      const now = new Date();
      const delayInSeconds = Math.max(0, Math.floor((scheduledTime.getTime() - now.getTime()) / 1000));

      // Schedule the message using publish with delay
      const result = await qstash.publishJSON({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/process-scheduled-messages`,
        body: {
          messageId,
          coachId,
          scheduledTime: scheduledTime.toISOString(),
        },
        delay: delayInSeconds,
        headers: {
          "Authorization": `Bearer ${process.env.SCHEDULER_API_KEY}`,
        },
      });

      return result.messageId || 'unknown';
    } catch (error) {
      console.error("Error scheduling message with QStash:", error);
      throw new Error("Failed to schedule message");
    }
  }

  /**
   * Schedule a recurring message
   */
  static async scheduleRecurringMessage(
    messageId: string,
    cronExpression: string,
    coachId: string
  ): Promise<string> {
    try {
      const result = await qstash.schedules.create({
        destination: `${process.env.NEXT_PUBLIC_APP_URL}/api/process-scheduled-messages`,
        cron: cronExpression,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.SCHEDULER_API_KEY}`,
        },
        body: JSON.stringify({
          messageId,
          coachId,
          recurring: true,
        }),
      });

      return result.scheduleId;
    } catch (error) {
      console.error("Error scheduling recurring message with QStash:", error);
      throw new Error("Failed to schedule recurring message");
    }
  }

  /**
   * Cancel a scheduled message
   */
  static async cancelScheduledMessage(scheduleId: string): Promise<void> {
    try {
      await qstash.schedules.delete(scheduleId);
    } catch (error) {
      console.error("Error canceling scheduled message:", error);
      throw new Error("Failed to cancel scheduled message");
    }
  }

  /**
   * Get all scheduled messages for a coach
   */
  static async getScheduledMessages(coachId: string): Promise<any[]> {
    try {
      const schedules = await qstash.schedules.list();
      
      // Filter schedules for this coach
      return schedules.filter(schedule => {
        try {
          const body = JSON.parse(schedule.body as string);
          return body.coachId === coachId;
        } catch {
          return false;
        }
      });
    } catch (error) {
      console.error("Error getting scheduled messages:", error);
      throw new Error("Failed to get scheduled messages");
    }
  }
}
