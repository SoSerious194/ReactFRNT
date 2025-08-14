// AI Messaging Types

export interface AIMessageEvent {
  id: string;
  client_id: string;
  coach_id: string;
  event_type: EventType;
  event_data: EventData;
  event_hash: string;
  ai_message_id?: string;
  message_sent_at?: string;
  status: "pending" | "sent" | "skipped" | "failed";
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface AIGeneratedMessage {
  id: string;
  client_id: string;
  coach_id: string;
  title?: string;
  content: string;
  message_type: "contextual" | "milestone" | "motivational";
  context_data?: any;
  event_type?: EventType;
  stream_message_id?: string;
  sent_at?: string;
  delivery_status: "pending" | "sent" | "failed";
  created_at: string;
  updated_at: string;
}

export interface AIMessageSettings {
  id: string;
  coach_id: string;
  is_enabled: boolean;
  max_messages_per_week: number;
  message_types: EventType[];
  ai_tone: "friendly" | "motivational" | "professional" | "casual";
  personalization_level: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

export type EventType =
  | "new_pr"
  | "workout_completed"
  | "streak_milestone"
  | "weight_goal"
  | "consistency_milestone"
  | "first_workout"
  | "program_completion"
  | "exercise_milestone";

export interface EventData {
  // New PR Event
  exercise_name?: string;
  weight?: number;
  reps?: number;
  previous_pr?: number;

  // Workout Completed Event
  workout_name?: string;
  duration?: number;
  exercises_count?: number;

  // Streak Milestone Event
  streak_type?: "workout" | "login" | "habit";
  streak_count?: number;

  // Weight Goal Event
  goal_type?: "weight_loss" | "weight_gain" | "strength";
  current_value?: number;
  target_value?: number;

  // Consistency Milestone Event
  days_consistent?: number;
  consistency_type?: "workout" | "nutrition" | "overall";

  // First Workout Event
  program_name?: string;

  // Program Completion Event
  program_duration?: number;
  total_workouts?: number;

  // Exercise Milestone Event
  exercise_count?: number;
  milestone_type?: "volume" | "frequency" | "variety";
}

export interface CreateAIMessageEventRequest {
  client_id: string;
  coach_id: string;
  event_type: EventType;
  event_data: EventData;
}

export interface UpdateAIMessageSettingsRequest {
  is_enabled?: boolean;
  max_messages_per_week?: number;
  message_types?: EventType[];
  ai_tone?: AIMessageSettings["ai_tone"];
  personalization_level?: AIMessageSettings["personalization_level"];
}

export interface AIContextData {
  client_name: string;
  client_email: string;
  coach_name: string;
  event_type: EventType;
  event_data: EventData;
  recent_workouts?: Array<{
    date: string;
    workout_name: string;
    exercises: string[];
  }>;
  recent_prs?: Array<{
    exercise_name: string;
    weight: number;
    reps: number;
    date: string;
  }>;
  current_streaks?: {
    workout_streak?: number;
    login_streak?: number;
  };
  goals?: Array<{
    type: string;
    current: number;
    target: number;
  }>;
}

export interface AIGenerationRequest {
  context_data: AIContextData;
  ai_tone: AIMessageSettings["ai_tone"];
  personalization_level: AIMessageSettings["personalization_level"];
}

export interface AIGenerationResponse {
  title?: string;
  content: string;
  context_used: string[];
}

// Event detection functions
export interface EventDetector {
  event_type: EventType;
  detect: (clientId: string, coachId: string) => Promise<EventData[]>;
  shouldTrigger: (eventData: EventData, lastEvent?: AIMessageEvent) => boolean;
}

// Constants
export const EVENT_TYPES: EventType[] = [
  "new_pr",
  "workout_completed",
  "streak_milestone",
  "weight_goal",
  "consistency_milestone",
  "first_workout",
  "program_completion",
  "exercise_milestone",
];

export const AI_TONES = [
  "friendly",
  "motivational",
  "professional",
  "casual",
] as const;

export const PERSONALIZATION_LEVELS = ["low", "medium", "high"] as const;
