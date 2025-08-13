// Message Scheduler Types

export interface MessageTemplate {
  id: string;
  coach_id: string;
  title: string;
  content: string;
  category: "sales" | "check-in" | "motivation" | "reminder" | "general";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledMessage {
  id: string;
  coach_id: string;
  title: string;
  content: string;
  template_id?: string;

  // Scheduling options
  schedule_type: "once" | "daily" | "weekly" | "monthly";
  start_date: string;
  end_date?: string;
  start_time: string;
  timezone?: string;

  // Frequency options
  frequency_config?: {
    dayOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number; // 1-31
    weekOfMonth?: number; // 1-5
  };

  // Targeting options
  target_type: "all" | "specific";
  target_user_ids: string[];

  // Status
  status: "active" | "paused" | "completed" | "cancelled";
  is_active: boolean;

  // Metadata
  created_at: string;
  updated_at: string;
  last_sent_at?: string;
  next_send_at?: string;

  // Computed fields
  calculated_next_send?: string;
}

export interface MessageDelivery {
  id: string;
  scheduled_message_id: string;
  user_id: string;
  stream_message_id?: string;
  sent_at: string;
  status: "sent" | "failed" | "pending";
  error_message?: string;
}

export interface CreateMessageTemplateRequest {
  title: string;
  content: string;
  category: MessageTemplate["category"];
}

export interface UpdateMessageTemplateRequest {
  title?: string;
  content?: string;
  category?: MessageTemplate["category"];
  is_active?: boolean;
}

export interface CreateScheduledMessageRequest {
  title: string;
  content: string;
  template_id?: string;

  // Scheduling
  schedule_type: ScheduledMessage["schedule_type"];
  start_date: string;
  end_date?: string;
  start_time: string;
  timezone?: string;

  // Frequency
  frequency_config?: ScheduledMessage["frequency_config"];

  // Targeting
  target_type: ScheduledMessage["target_type"];
  target_user_ids?: string[];
}

export interface UpdateScheduledMessageRequest {
  title?: string;
  content?: string;
  template_id?: string;

  // Scheduling
  schedule_type?: ScheduledMessage["schedule_type"];
  start_date?: string;
  end_date?: string;
  start_time?: string;
  timezone?: string;

  // Frequency
  frequency_config?: ScheduledMessage["frequency_config"];

  // Targeting
  target_type?: ScheduledMessage["target_type"];
  target_user_ids?: string[];

  // Status
  status?: ScheduledMessage["status"];
  is_active?: boolean;
}

export interface ScheduledMessageWithDetails extends ScheduledMessage {
  template?: MessageTemplate;
  deliveries?: MessageDelivery[];
  target_users?: Array<{
    id: string;
    full_name: string;
    email: string;
  }>;
}

export interface MessageSchedulerStats {
  total_scheduled: number;
  active_scheduled: number;
  completed_scheduled: number;
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  templates_count: number;
}

// OpenAI Template Generation
export interface TemplateGenerationRequest {
  category: MessageTemplate["category"];
  context?: string;
  tone?: "professional" | "friendly" | "motivational" | "casual";
  target_audience?: string;
  specific_goals?: string[];
}

export interface TemplateGenerationResponse {
  title: string;
  content: string;
  suggestions: string[];
}

// Frequency configuration helpers
export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const MESSAGE_CATEGORIES = [
  "sales",
  "check-in",
  "motivation",
  "reminder",
  "general",
] as const;

export const SCHEDULE_TYPES = ["once", "daily", "weekly", "monthly"] as const;

export const MESSAGE_STATUSES = [
  "active",
  "paused",
  "completed",
  "cancelled",
] as const;
