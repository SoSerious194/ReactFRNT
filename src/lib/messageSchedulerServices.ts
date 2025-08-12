import { createClient } from "@/utils/supabase/client";
import { ChatServices } from "./chatServices";
import {
  MessageTemplate,
  ScheduledMessage,
  MessageDelivery,
  CreateMessageTemplateRequest,
  UpdateMessageTemplateRequest,
  CreateScheduledMessageRequest,
  UpdateScheduledMessageRequest,
  ScheduledMessageWithDetails,
  MessageSchedulerStats,
  TemplateGenerationRequest,
  TemplateGenerationResponse,
} from "@/types/messageScheduler";

const supabase = createClient();

export class MessageSchedulerServices {
  // Message Templates
  static async createTemplate(
    coachId: string,
    request: CreateMessageTemplateRequest
  ): Promise<MessageTemplate> {
    const { data, error } = await supabase
      .from("message_templates")
      .insert({
        coach_id: coachId,
        title: request.title,
        content: request.content,
        category: request.category,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create template: ${error.message}`);
    return data;
  }

  static async getTemplates(coachId: string): Promise<MessageTemplate[]> {
    const { data, error } = await supabase
      .from("message_templates")
      .select("*")
      .eq("coach_id", coachId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch templates: ${error.message}`);
    return data || [];
  }

  static async getTemplateById(
    coachId: string,
    templateId: string
  ): Promise<MessageTemplate> {
    const { data, error } = await supabase
      .from("message_templates")
      .select("*")
      .eq("id", templateId)
      .eq("coach_id", coachId)
      .single();

    if (error) throw new Error(`Failed to fetch template: ${error.message}`);
    return data;
  }

  static async updateTemplate(
    coachId: string,
    templateId: string,
    request: UpdateMessageTemplateRequest
  ): Promise<MessageTemplate> {
    const { data, error } = await supabase
      .from("message_templates")
      .update(request)
      .eq("id", templateId)
      .eq("coach_id", coachId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update template: ${error.message}`);
    return data;
  }

  static async deleteTemplate(
    coachId: string,
    templateId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("message_templates")
      .delete()
      .eq("id", templateId)
      .eq("coach_id", coachId);

    if (error) throw new Error(`Failed to delete template: ${error.message}`);
  }

  // Scheduled Messages
  static async createScheduledMessage(
    coachId: string,
    request: CreateScheduledMessageRequest
  ): Promise<ScheduledMessage> {
    // Create the scheduled message in database
    const { data, error } = await supabase
      .from("scheduled_messages")
      .insert({
        coach_id: coachId,
        title: request.title,
        content: request.content,
        template_id: request.template_id,
        schedule_type: request.schedule_type,
        start_date: request.start_date,
        end_date: request.end_date,
        start_time: request.start_time,
        timezone: request.timezone || "UTC",
        frequency_config: request.frequency_config,
        target_type: request.target_type,
        target_user_ids: request.target_user_ids || [],
      })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to create scheduled message: ${error.message}`);

    // Schedule the message with QStash via API
    try {
      const scheduledDateTime = new Date(
        `${request.start_date}T${request.start_time}`
      );
      const cronExpression =
        request.schedule_type !== "once"
          ? this.createCronExpression(request)
          : null;

      const response = await fetch("/api/qstash-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: data.id,
          scheduledTime: scheduledDateTime.toISOString(),
          coachId,
          scheduleType: request.schedule_type,
          cronExpression,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Update the message with QStash ID
        await supabase
          .from("scheduled_messages")
          .update({ qstash_id: result.qstashId })
          .eq("id", data.id);
      } else {
        console.error(
          "Failed to schedule with QStash API:",
          await response.text()
        );
      }
    } catch (qstashError) {
      console.error("Failed to schedule with QStash:", qstashError);
      // Continue without QStash - will use manual processing
    }

    return data;
  }

  private static createCronExpression(
    request: CreateScheduledMessageRequest
  ): string {
    const [hours, minutes] = request.start_time.split(":").map(Number);

    switch (request.schedule_type) {
      case "daily":
        return `${minutes} ${hours} * * *`;
      case "weekly":
        const dayOfWeek = request.frequency_config?.dayOfWeek?.[0] || 1;
        return `${minutes} ${hours} * * ${dayOfWeek}`;
      case "monthly":
        const dayOfMonth = request.frequency_config?.dayOfMonth || 1;
        return `${minutes} ${hours} ${dayOfMonth} * *`;
      default:
        return `${minutes} ${hours} * * *`; // Default to daily
    }
  }

  static async getScheduledMessages(
    coachId: string
  ): Promise<ScheduledMessage[]> {
    const { data, error } = await supabase
      .from("scheduled_messages")
      .select("*")
      .eq("coach_id", coachId)
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(`Failed to fetch scheduled messages: ${error.message}`);
    return data || [];
  }

  static async getScheduledMessageById(
    coachId: string,
    messageId: string
  ): Promise<ScheduledMessageWithDetails> {
    // Get the scheduled message
    const { data: message, error: messageError } = await supabase
      .from("scheduled_messages")
      .select("*")
      .eq("id", messageId)
      .eq("coach_id", coachId)
      .single();

    if (messageError)
      throw new Error(
        `Failed to fetch scheduled message: ${messageError.message}`
      );

    // Get template if exists
    let template: MessageTemplate | undefined;
    if (message.template_id) {
      try {
        template = await this.getTemplateById(coachId, message.template_id);
      } catch (error) {
        console.warn("Template not found:", error);
      }
    }

    // Get target users if specific targeting
    let targetUsers:
      | Array<{ id: string; full_name: string; email: string }>
      | undefined;
    if (
      message.target_type === "specific" &&
      message.target_user_ids.length > 0
    ) {
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, full_name, email")
        .in("id", message.target_user_ids);

      if (!usersError) {
        targetUsers = users || [];
      }
    }

    // Get delivery history
    const { data: deliveries, error: deliveriesError } = await supabase
      .from("message_deliveries")
      .select("*")
      .eq("scheduled_message_id", messageId)
      .order("sent_at", { ascending: false });

    if (deliveriesError) {
      console.warn("Failed to fetch deliveries:", deliveriesError);
    }

    return {
      ...message,
      template,
      target_users: targetUsers,
      deliveries: deliveries || [],
    };
  }

  static async updateScheduledMessage(
    coachId: string,
    messageId: string,
    request: UpdateScheduledMessageRequest
  ): Promise<ScheduledMessage> {
    const { data, error } = await supabase
      .from("scheduled_messages")
      .update(request)
      .eq("id", messageId)
      .eq("coach_id", coachId)
      .select()
      .single();

    if (error)
      throw new Error(`Failed to update scheduled message: ${error.message}`);
    return data;
  }

  static async deleteScheduledMessage(
    coachId: string,
    messageId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("scheduled_messages")
      .delete()
      .eq("id", messageId)
      .eq("coach_id", coachId);

    if (error)
      throw new Error(`Failed to delete scheduled message: ${error.message}`);
  }

  static async pauseScheduledMessage(
    coachId: string,
    messageId: string
  ): Promise<ScheduledMessage> {
    return this.updateScheduledMessage(coachId, messageId, {
      status: "paused",
    });
  }

  static async resumeScheduledMessage(
    coachId: string,
    messageId: string
  ): Promise<ScheduledMessage> {
    return this.updateScheduledMessage(coachId, messageId, {
      status: "active",
    });
  }

  // Message Delivery
  static async sendScheduledMessage(
    scheduledMessageId: string,
    userId: string
  ): Promise<MessageDelivery> {
    try {
      // Get the scheduled message
      const { data: message, error: messageError } = await supabase
        .from("scheduled_messages")
        .select("*")
        .eq("id", scheduledMessageId)
        .single();

      if (messageError)
        throw new Error(
          `Failed to fetch scheduled message: ${messageError.message}`
        );

      // Get user details
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError)
        throw new Error(`Failed to fetch user: ${userError.message}`);

      // Send message via GetStream
      let streamMessageId: string | undefined;
      try {
        const streamClient = ChatServices.getStreamClient();
        if (streamClient && streamClient.userID) {
          // Create or get channel
          const channel = await ChatServices.getOrCreateChannel(
            message.coach_id,
            userId,
            user.full_name || user.email || "User"
          );

          // Send the message
          const sentMessage = await channel.sendMessage({
            text: message.content,
          });

          streamMessageId = sentMessage.message?.id;
        }
      } catch (streamError) {
        console.error("Failed to send message via GetStream:", streamError);
        // Continue to record delivery even if GetStream fails
      }

      // Record the delivery
      const { data: delivery, error: deliveryError } = await supabase
        .from("message_deliveries")
        .insert({
          scheduled_message_id: scheduledMessageId,
          user_id: userId,
          stream_message_id: streamMessageId,
          status: streamMessageId ? "sent" : "failed",
          error_message: streamMessageId
            ? undefined
            : "GetStream delivery failed",
        })
        .select()
        .single();

      if (deliveryError)
        throw new Error(`Failed to record delivery: ${deliveryError.message}`);

      // Update last_sent_at on scheduled message
      await supabase
        .from("scheduled_messages")
        .update({ last_sent_at: new Date().toISOString() })
        .eq("id", scheduledMessageId);

      return delivery;
    } catch (error) {
      console.error("Error sending scheduled message:", error);
      throw error;
    }
  }

  // Statistics
  static async getStats(coachId: string): Promise<MessageSchedulerStats> {
    // Get scheduled messages count
    const { count: totalScheduled } = await supabase
      .from("scheduled_messages")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", coachId);

    const { count: activeScheduled } = await supabase
      .from("scheduled_messages")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", coachId)
      .eq("status", "active");

    const { count: completedScheduled } = await supabase
      .from("scheduled_messages")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", coachId)
      .eq("status", "completed");

    // Get deliveries count
    const { count: totalDeliveries } = await supabase
      .from("message_deliveries")
      .select("*", { count: "exact", head: true })
      .eq(
        "scheduled_message_id",
        supabase.from("scheduled_messages").select("id").eq("coach_id", coachId)
      );

    const { count: successfulDeliveries } = await supabase
      .from("message_deliveries")
      .select("*", { count: "exact", head: true })
      .eq("status", "sent")
      .eq(
        "scheduled_message_id",
        supabase.from("scheduled_messages").select("id").eq("coach_id", coachId)
      );

    const { count: failedDeliveries } = await supabase
      .from("message_deliveries")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed")
      .eq(
        "scheduled_message_id",
        supabase.from("scheduled_messages").select("id").eq("coach_id", coachId)
      );

    // Get templates count
    const { count: templatesCount } = await supabase
      .from("message_templates")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", coachId)
      .eq("is_active", true);

    return {
      total_scheduled: totalScheduled || 0,
      active_scheduled: activeScheduled || 0,
      completed_scheduled: completedScheduled || 0,
      total_deliveries: totalDeliveries || 0,
      successful_deliveries: successfulDeliveries || 0,
      failed_deliveries: failedDeliveries || 0,
      templates_count: templatesCount || 0,
    };
  }

  // OpenAI Template Generation
  static async generateTemplate(
    request: TemplateGenerationRequest
  ): Promise<TemplateGenerationResponse> {
    try {
      const response = await fetch("/api/generate-message-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error("Failed to generate template");
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating template:", error);
      throw error;
    }
  }

  // Get assigned users for targeting
  static async getAssignedUsers(coachId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("coach", coachId)
      .order("full_name");

    if (error)
      throw new Error(`Failed to fetch assigned users: ${error.message}`);
    return data || [];
  }
}
