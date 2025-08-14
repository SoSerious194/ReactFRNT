import { createClient } from "@supabase/supabase-js";
import { StreamChat } from "stream-chat";
import crypto from "crypto";
import {
  AIMessageEvent,
  AIGeneratedMessage,
  AIMessageSettings,
  EventType,
  EventData,
  CreateAIMessageEventRequest,
  UpdateAIMessageSettingsRequest,
  AIContextData,
  AIGenerationRequest,
  AIGenerationResponse,
} from "@/types/aiMessaging";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const streamKey = process.env.STREAM_API_KEY!;
const streamSecret = process.env.STREAM_API_SECRET!;

export class AIMessageService {
  private static supabase = createClient(supabaseUrl, supabaseServiceKey);
  private static streamClient = StreamChat.getInstance(streamKey, streamSecret);

  // Generate unique hash for event to prevent duplicates
  private static generateEventHash(
    clientId: string,
    eventType: EventType,
    eventData: EventData
  ): string {
    const dataString = JSON.stringify({ clientId, eventType, eventData });
    return crypto.createHash("sha256").update(dataString).digest("hex");
  }

  // Create AI message event
  static async createEvent(
    request: CreateAIMessageEventRequest
  ): Promise<AIMessageEvent> {
    const eventHash = this.generateEventHash(
      request.client_id,
      request.event_type,
      request.event_data
    );

    // Check if event already exists
    const { data: existingEvent } = await this.supabase
      .from("ai_message_events")
      .select("*")
      .eq("client_id", request.client_id)
      .eq("event_hash", eventHash)
      .single();

    if (existingEvent) {
      throw new Error("Event already exists");
    }

    const { data, error } = await this.supabase
      .from("ai_message_events")
      .insert({
        client_id: request.client_id,
        coach_id: request.coach_id,
        event_type: request.event_type,
        event_data: request.event_data,
        event_hash: eventHash,
        status: "pending",
      })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to create AI message event: ${error.message}`);
    return data;
  }

  // Get AI message settings for coach
  static async getSettings(coachId: string): Promise<AIMessageSettings | null> {
    const { data, error } = await this.supabase
      .from("ai_message_settings")
      .select("*")
      .eq("coach_id", coachId)
      .single();

    if (error && error.code !== "PGRST116")
      throw new Error(`Failed to get AI message settings: ${error.message}`);
    return data;
  }

  // Create or update AI message settings
  static async upsertSettings(
    coachId: string,
    settings: UpdateAIMessageSettingsRequest
  ): Promise<AIMessageSettings> {
    const { data, error } = await this.supabase
      .from("ai_message_settings")
      .upsert({
        coach_id: coachId,
        ...settings,
      })
      .select()
      .single();

    if (error)
      throw new Error(`Failed to upsert AI message settings: ${error.message}`);
    return data;
  }

  // Get pending events for processing
  static async getPendingEvents(): Promise<AIMessageEvent[]> {
    const { data, error } = await this.supabase
      .from("ai_message_events")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error)
      throw new Error(`Failed to get pending events: ${error.message}`);
    return data || [];
  }

  // Check if client has received too many messages this week
  static async checkMessageLimit(
    clientId: string,
    coachId: string,
    maxPerWeek: number
  ): Promise<boolean> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data, error } = await this.supabase
      .from("ai_generated_messages")
      .select("id")
      .eq("client_id", clientId)
      .eq("coach_id", coachId)
      .gte("sent_at", oneWeekAgo.toISOString())
      .eq("delivery_status", "sent");

    if (error)
      throw new Error(`Failed to check message limit: ${error.message}`);
    return (data?.length || 0) < maxPerWeek;
  }

  // Generate AI message content
  static async generateMessage(
    request: AIGenerationRequest
  ): Promise<AIGenerationResponse> {
    const prompt = this.buildPrompt(request);

    try {
      // Use absolute URL for server-side requests
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/generate-ai-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("AI message generation failed:", error);
      throw error;
    }
  }

  // Build AI prompt based on context and settings
  private static buildPrompt(request: AIGenerationRequest): string {
    const { context_data, ai_tone, personalization_level } = request;
    const { event_type, event_data } = context_data;

    let prompt = `You are a personal trainer sending a personalized message to a client. `;
    prompt += `Tone: ${ai_tone}. Personalization level: ${personalization_level}. `;
    prompt += `Keep the message concise (1-2 sentences) and authentic. `;

    switch (event_type) {
      case "new_pr":
        prompt += `The client just set a new personal record: ${event_data.exercise_name} - ${event_data.weight}lbs for ${event_data.reps} reps. `;
        prompt += `Previous PR was ${event_data.previous_pr}lbs. `;
        prompt += `Celebrate their achievement and encourage them to keep pushing.`;
        break;

      case "workout_completed":
        prompt += `The client just completed a workout: ${event_data.workout_name}. `;
        prompt += `Duration: ${event_data.duration} minutes, ${event_data.exercises_count} exercises. `;
        prompt += `Acknowledge their effort and consistency.`;
        break;

      case "streak_milestone":
        prompt += `The client reached a ${event_data.streak_type} streak milestone: ${event_data.streak_count} days! `;
        prompt += `Celebrate their consistency and dedication.`;
        break;

      case "weight_goal":
        prompt += `The client achieved a weight goal: ${event_data.goal_type}. `;
        prompt += `Current: ${event_data.current_value}, Target: ${event_data.target_value}. `;
        prompt += `Congratulate them on their progress.`;
        break;

      default:
        prompt += `The client achieved something noteworthy. Send an encouraging message.`;
    }

    return prompt;
  }

  // Send AI message via GetStream
  static async sendMessage(message: AIGeneratedMessage): Promise<string> {
    try {
      // Check if we have proper API keys
      if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
        console.warn(
          "GetStream API keys not configured, skipping message send"
        );
        return "demo_message_id";
      }

      const apiKey = process.env.STREAM_API_KEY;
      const apiSecret = process.env.STREAM_API_SECRET;

      console.log("Creating StreamChat instance...");

      // Use server-side authentication with hardcoded values
      const serverClient = StreamChat.getInstance(apiKey, apiSecret);
      console.log("StreamChat instance created successfully");

      // Create users first (same as working test)
      console.log("Creating users...");
      await serverClient.upsertUser({
        id: message.coach_id,
        name: "Coach",
      });
      await serverClient.upsertUser({
        id: message.client_id,
        name: "Client",
      });
      console.log("Users created successfully");

      // Generate channel ID using the same logic as frontend
      const combinedIds = [message.coach_id, message.client_id]
        .sort()
        .join("-");
      const hash = combinedIds.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
      const channelId = `chat_${Math.abs(hash).toString(36)}`;

      console.log("Creating channel with ID:", channelId);

      // Create or get the channel (same as working test)
      const channel = serverClient.channel("messaging", channelId, {
        members: [message.coach_id, message.client_id],
        created_by_id: message.coach_id, // Required for server-side auth
      });

      console.log("Channel created, watching...");
      await channel.watch();
      console.log("Channel watched successfully");

      // Send message as the coach
      console.log("Sending message...");
      const response = await channel.sendMessage({
        text: message.content,
        user_id: message.coach_id,
      });

      console.log("Message sent successfully:", response.message?.id);
      return response.message?.id || "";
    } catch (error) {
      console.error("Failed to send AI message:", error);
      throw error;
    }
  }

  // Process pending events and generate/send messages
  static async processPendingEvents(): Promise<{
    processed: number;
    errors: number;
  }> {
    const pendingEvents = await this.getPendingEvents();
    let processed = 0;
    let errors = 0;

    for (const event of pendingEvents) {
      try {
        // Get coach settings
        const settings = await this.getSettings(event.coach_id);
        if (!settings || !settings.is_enabled) {
          await this.updateEventStatus(
            event.id,
            "skipped",
            "AI messaging disabled"
          );
          continue;
        }

        // Check if event type is enabled
        if (!settings.message_types.includes(event.event_type)) {
          await this.updateEventStatus(
            event.id,
            "skipped",
            "Event type not enabled"
          );
          continue;
        }

        // Check message limit
        const withinLimit = await this.checkMessageLimit(
          event.client_id,
          event.coach_id,
          settings.max_messages_per_week
        );
        if (!withinLimit) {
          await this.updateEventStatus(
            event.id,
            "skipped",
            "Weekly message limit reached"
          );
          continue;
        }

        // Generate AI message
        const contextData = await this.buildContextData(event);
        const aiResponse = await this.generateMessage({
          context_data: contextData,
          ai_tone: settings.ai_tone,
          personalization_level: settings.personalization_level,
        });

        // Create AI message record
        const aiMessage = await this.createAIMessage({
          client_id: event.client_id,
          coach_id: event.coach_id,
          content: aiResponse.content,
          title: aiResponse.title,
          message_type: "contextual",
          context_data: contextData,
          event_type: event.event_type,
        });

        // Send message
        const streamMessageId = await this.sendMessage(aiMessage);

        // Update AI message with delivery info
        await this.updateAIMessage(aiMessage.id, {
          stream_message_id: streamMessageId,
          sent_at: new Date().toISOString(),
          delivery_status: "sent",
        });

        // Update event status
        await this.updateEventStatus(event.id, "sent", undefined, aiMessage.id);

        processed++;
      } catch (error) {
        console.error(`Failed to process event ${event.id}:`, error);
        await this.updateEventStatus(
          event.id,
          "failed",
          error instanceof Error ? error.message : "Unknown error"
        );
        errors++;
      }
    }

    return { processed, errors };
  }

  // Build context data for AI generation
  private static async buildContextData(
    event: AIMessageEvent
  ): Promise<AIContextData> {
    // Get client and coach info
    const { data: client } = await this.supabase
      .from("users")
      .select("full_name, email")
      .eq("id", event.client_id)
      .single();

    const { data: coach } = await this.supabase
      .from("users")
      .select("full_name")
      .eq("id", event.coach_id)
      .single();

    // Get recent workouts
    const { data: recentWorkouts } = await this.supabase
      .from("completed_workouts")
      .select("completed_date, workout_id")
      .eq("client_id", event.client_id)
      .order("completed_date", { ascending: false })
      .limit(5);

    // Get recent PRs
    const { data: recentPRs } = await this.supabase
      .from("completed_exercise_logs")
      .select("created_at, exercise_id, weight, reps")
      .eq("client_id", event.client_id)
      .not("weight", "is", null)
      .order("created_at", { ascending: false })
      .limit(10);

    return {
      client_name: client?.full_name || "Client",
      client_email: client?.email || "",
      coach_name: coach?.full_name || "Coach",
      event_type: event.event_type,
      event_data: event.event_data,
      recent_workouts: recentWorkouts?.map((w) => ({
        date: w.completed_date || "",
        workout_name: "Workout", // Could fetch actual workout name
        exercises: [],
      })),
      recent_prs: recentPRs?.map((pr) => ({
        exercise_name: "Exercise", // Could fetch actual exercise name
        weight: pr.weight || 0,
        reps: pr.reps || 0,
        date: pr.created_at || "",
      })),
    };
  }

  // Update event status
  private static async updateEventStatus(
    eventId: string,
    status: AIMessageEvent["status"],
    errorMessage?: string,
    aiMessageId?: string
  ): Promise<void> {
    const updateData: any = { status };
    if (errorMessage) updateData.error_message = errorMessage;
    if (aiMessageId) updateData.ai_message_id = aiMessageId;
    if (status === "sent")
      updateData.message_sent_at = new Date().toISOString();

    const { error } = await this.supabase
      .from("ai_message_events")
      .update(updateData)
      .eq("id", eventId);

    if (error)
      throw new Error(`Failed to update event status: ${error.message}`);
  }

  // Create AI message record
  private static async createAIMessage(data: {
    client_id: string;
    coach_id: string;
    content: string;
    title?: string;
    message_type: AIGeneratedMessage["message_type"];
    context_data?: any;
    event_type?: EventType;
  }): Promise<AIGeneratedMessage> {
    const { data: message, error } = await this.supabase
      .from("ai_generated_messages")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Failed to create AI message: ${error.message}`);
    return message;
  }

  // Update AI message
  private static async updateAIMessage(
    messageId: string,
    updates: Partial<AIGeneratedMessage>
  ): Promise<void> {
    const { error } = await this.supabase
      .from("ai_generated_messages")
      .update(updates)
      .eq("id", messageId);

    if (error) throw new Error(`Failed to update AI message: ${error.message}`);
  }

  // Get AI message statistics
  static async getStats(coachId: string): Promise<{
    total_events: number;
    sent_messages: number;
    failed_messages: number;
    skipped_messages: number;
    this_week_messages: number;
  }> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [eventsResult, messagesResult, weekMessagesResult] =
      await Promise.all([
        this.supabase
          .from("ai_message_events")
          .select("status")
          .eq("coach_id", coachId),
        this.supabase
          .from("ai_generated_messages")
          .select("delivery_status")
          .eq("coach_id", coachId),
        this.supabase
          .from("ai_generated_messages")
          .select("id")
          .eq("coach_id", coachId)
          .gte("sent_at", oneWeekAgo.toISOString())
          .eq("delivery_status", "sent"),
      ]);

    const events = eventsResult.data || [];
    const messages = messagesResult.data || [];
    const weekMessages = weekMessagesResult.data || [];

    return {
      total_events: events.length,
      sent_messages: events.filter((e) => e.status === "sent").length,
      failed_messages: events.filter((e) => e.status === "failed").length,
      skipped_messages: events.filter((e) => e.status === "skipped").length,
      this_week_messages: weekMessages.length,
    };
  }
}
