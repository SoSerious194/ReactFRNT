export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      completed_exercise_logs: {
        Row: {
          client_id: string
          created_at: string | null
          day: number
          exercise_id: string
          id: string
          notes: string | null
          program_id: string
          reps: number | null
          set_number: number
          weight: number | null
          workout_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          day: number
          exercise_id: string
          id?: string
          notes?: string | null
          program_id: string
          reps?: number | null
          set_number: number
          weight?: number | null
          workout_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          day?: number
          exercise_id?: string
          id?: string
          notes?: string | null
          program_id?: string
          reps?: number | null
          set_number?: number
          weight?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completed_exercise_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_exercise_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_exercise_logs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_exercise_logs_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "full_program_structure"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "completed_exercise_logs_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      completed_workouts: {
        Row: {
          client_id: string
          completed_at: string | null
          day: number
          id: string
          notes: string | null
          program_id: string
          workout_id: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          day: number
          id?: string
          notes?: string | null
          program_id: string
          workout_id: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          day?: number
          id?: string
          notes?: string | null
          program_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completed_workouts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_workouts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_workouts_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "full_program_structure"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "completed_workouts_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_one_id: string
          user_two_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_one_id: string
          user_two_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_one_id?: string
          user_two_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_conversations_user_one_id_fkey"
            columns: ["user_one_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_conversations_user_two_id_fkey"
            columns: ["user_two_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_library: {
        Row: {
          coach_id: string | null
          created_at: string | null
          default_unit: string | null
          difficulty: string | null
          equipment: string | null
          exercise_type: string | null
          id: string
          instructions: string | null
          is_active: boolean | null
          is_draft: boolean | null
          is_global: boolean | null
          muscles_trained: string[] | null
          name: string
          progression_id: string | null
          regression_id: string | null
          target_goal: string | null
          updated_at: string | null
          video_url_1: string | null
          video_url_2: string | null
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          default_unit?: string | null
          difficulty?: string | null
          equipment?: string | null
          exercise_type?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          is_draft?: boolean | null
          is_global?: boolean | null
          muscles_trained?: string[] | null
          name: string
          progression_id?: string | null
          regression_id?: string | null
          target_goal?: string | null
          updated_at?: string | null
          video_url_1?: string | null
          video_url_2?: string | null
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          default_unit?: string | null
          difficulty?: string | null
          equipment?: string | null
          exercise_type?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          is_draft?: boolean | null
          is_global?: boolean | null
          muscles_trained?: string[] | null
          name?: string
          progression_id?: string | null
          regression_id?: string | null
          target_goal?: string | null
          updated_at?: string | null
          video_url_1?: string | null
          video_url_2?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_library_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_library_progression_id_fkey"
            columns: ["progression_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_library_regression_id_fkey"
            columns: ["regression_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_overrides: {
        Row: {
          coach_id: string | null
          created_at: string | null
          custom_instructions: string | null
          custom_video_url: string | null
          exercise_id: string | null
          id: string
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          custom_instructions?: string | null
          custom_video_url?: string | null
          exercise_id?: string | null
          id?: string
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          custom_instructions?: string | null
          custom_video_url?: string | null
          exercise_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_overrides_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_overrides_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_sets: {
        Row: {
          exercise_id: string | null
          exercise_name: string | null
          id: string
          notes: string | null
          reps: number | null
          rest_seconds: number | null
          set_number: number
          set_type: string | null
          weight: string | null
          workout_block_id: string | null
        }
        Insert: {
          exercise_id?: string | null
          exercise_name?: string | null
          id?: string
          notes?: string | null
          reps?: number | null
          rest_seconds?: number | null
          set_number: number
          set_type?: string | null
          weight?: string | null
          workout_block_id?: string | null
        }
        Update: {
          exercise_id?: string | null
          exercise_name?: string | null
          id?: string
          notes?: string | null
          reps?: number | null
          rest_seconds?: number | null
          set_number?: number
          set_type?: string | null
          weight?: string | null
          workout_block_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_sets_workout_block_id_fkey"
            columns: ["workout_block_id"]
            isOneToOne: false
            referencedRelation: "full_program_structure"
            referencedColumns: ["workout_block_id"]
          },
          {
            foreignKeyName: "exercise_sets_workout_block_id_fkey"
            columns: ["workout_block_id"]
            isOneToOne: false
            referencedRelation: "workout_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          file_name: string | null
          file_path: string | null
          id: string
          message_type: Database["public"]["Enums"]["message_type"]
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "direct_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      program_assignments: {
        Row: {
          assigned_at: string | null
          client_id: string | null
          id: string
          program_id: string | null
          repeat: boolean
          start_date: string
        }
        Insert: {
          assigned_at?: string | null
          client_id?: string | null
          id?: string
          program_id?: string | null
          repeat?: boolean
          start_date?: string
        }
        Update: {
          assigned_at?: string | null
          client_id?: string | null
          id?: string
          program_id?: string | null
          repeat?: boolean
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_assignments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_days: {
        Row: {
          created_at: string | null
          day: number
          id: string
          is_rest_day: boolean | null
          notes: string | null
          position: number | null
          program_id: string | null
          tags: string[] | null
          workout_id: string | null
        }
        Insert: {
          created_at?: string | null
          day: number
          id?: string
          is_rest_day?: boolean | null
          notes?: string | null
          position?: number | null
          program_id?: string | null
          tags?: string[] | null
          workout_id?: string | null
        }
        Update: {
          created_at?: string | null
          day?: number
          id?: string
          is_rest_day?: boolean | null
          notes?: string | null
          position?: number | null
          program_id?: string | null
          tags?: string[] | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_days_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "full_program_structure"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "program_days_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          coach_id: string | null
          difficulty: string | null
          equipment: string | null
          id: string
          image: string | null
          is_active: boolean | null
          lastModified: string
          name: string | null
        }
        Insert: {
          coach_id?: string | null
          difficulty?: string | null
          equipment?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          lastModified?: string
          name?: string | null
        }
        Update: {
          coach_id?: string | null
          difficulty?: string | null
          equipment?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          lastModified?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: number
          role: Database["public"]["Enums"]["role_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          role: Database["public"]["Enums"]["role_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          role?: Database["public"]["Enums"]["role_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          profile_image_url: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          profile_image_url?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          profile_image_url?: string | null
          role?: string | null
        }
        Relationships: []
      }
      workout_blocks: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          order_index: number | null
          type: string | null
          workout_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          order_index?: number | null
          type?: string | null
          workout_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          order_index?: number | null
          type?: string | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_blocks_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "full_program_structure"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "workout_blocks_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          coach_id: string | null
          description: string | null
          difficulty: string | null
          duration: string | null
          equipment: string | null
          id: string
          lastModified: string
          name: string | null
        }
        Insert: {
          coach_id?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          equipment?: string | null
          id?: string
          lastModified?: string
          name?: string | null
        }
        Update: {
          coach_id?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          equipment?: string | null
          id?: string
          lastModified?: string
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      full_program_structure: {
        Row: {
          block_name: string | null
          block_order: number | null
          block_type: string | null
          day: number | null
          exercise_name: string | null
          exercise_set_id: string | null
          notes: string | null
          program_id: string | null
          program_name: string | null
          reps: number | null
          rest_seconds: number | null
          set_number: number | null
          set_type: string | null
          weight: string | null
          workout_block_id: string | null
          workout_id: string | null
          workout_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_full_workout: {
        Args: { workout_data: Json }
        Returns: undefined
      }
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      get_current_program_day: {
        Args: { client_uuid: string }
        Returns: {
          program_id: string
          workout_id: string
          day: number
          is_rest_day: boolean
          workout_name: string
        }[]
      }
      get_day_workout: {
        Args: { client_uuid: string; target_day: number }
        Returns: {
          program_id: string
          workout_id: string
          workout_name: string
          workout_notes: string
          day: number
        }[]
      }
      get_day_workouts: {
        Args: { client_uuid: string; target_day: number }
        Returns: {
          day: number
          workout_id: string
          workout_name: string
        }[]
      }
      get_exercise_id_by_name: {
        Args: { exercise_name: string }
        Returns: string
      }
      get_or_create_conversation: {
        Args: { user_a: string; user_b: string }
        Returns: string
      }
      get_workout_preview: {
        Args: { workout_uuid: string }
        Returns: {
          block_name: string
          block_type: string
          order_index: number
          set_number: number
          set_type: string
          reps: number
          exercise_id: string
          exercise_name: string
          muscles_trained: string
        }[]
      }
      send_message: {
        Args: {
          p_conversation_id: string
          p_content: string
          p_message_type?: Database["public"]["Enums"]["message_type"]
          p_file_path?: string
          p_file_name?: string
        }
        Returns: string
      }
    }
    Enums: {
      message_type: "text" | "image" | "file" | "voice" | "video"
      role_type: "Client" | "Coach"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      message_type: ["text", "image", "file", "voice", "video"],
      role_type: ["Client", "Coach"],
    },
  },
} as const
