export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      client_meal_plans: {
        Row: {
          assigned_at: string | null
          client_id: string
          coach_id: string
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          meal_plan_id: string
          start_date: string
        }
        Insert: {
          assigned_at?: string | null
          client_id: string
          coach_id: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          meal_plan_id: string
          start_date: string
        }
        Update: {
          assigned_at?: string | null
          client_id?: string
          coach_id?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          meal_plan_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_meal_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "client_meal_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_meal_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "client_meal_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_program_days: {
        Row: {
          client_id: string
          created_at: string | null
          day: number
          id: string
          is_rest_day: boolean | null
          notes: string | null
          position: number | null
          program_id: string
          tags: string[] | null
          workout_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          day: number
          id?: string
          is_rest_day?: boolean | null
          notes?: string | null
          position?: number | null
          program_id: string
          tags?: string[] | null
          workout_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          day?: number
          id?: string
          is_rest_day?: boolean | null
          notes?: string | null
          position?: number | null
          program_id?: string
          tags?: string[] | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_program_days_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "client_program_days_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_program_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_program_days_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "full_program_structure"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "client_program_days_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      client_schedule: {
        Row: {
          client_id: string
          created_at: string | null
          date: string
          id: string
          is_rest_day: boolean | null
          notes: string | null
          workout_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          date: string
          id?: string
          is_rest_day?: boolean | null
          notes?: string | null
          workout_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          date?: string
          id?: string
          is_rest_day?: boolean | null
          notes?: string | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_schedule_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "client_schedule_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_schedule_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "full_program_structure"
            referencedColumns: ["workout_id"]
          },
          {
            foreignKeyName: "client_schedule_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
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
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
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
          completed_date: string | null
          day: number
          id: string
          notes: string | null
          program_id: string
          workout_id: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          completed_date?: string | null
          day: number
          id?: string
          notes?: string | null
          program_id: string
          workout_id: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          completed_date?: string | null
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
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
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
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
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
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
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
          cues_and_tips: string | null
          default_unit: string | null
          difficulty: string | null
          equipment: string | null
          exercise_type: string | null
          id: string
          image: string | null
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
          cues_and_tips?: string | null
          default_unit?: string | null
          difficulty?: string | null
          equipment?: string | null
          exercise_type?: string | null
          id?: string
          image?: string | null
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
          cues_and_tips?: string | null
          default_unit?: string | null
          difficulty?: string | null
          equipment?: string | null
          exercise_type?: string | null
          id?: string
          image?: string | null
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
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
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
      exercise_library_backup: {
        Row: {
          coach_id: string | null
          created_at: string | null
          cues_and_tips: string | null
          default_unit: string | null
          difficulty: string | null
          equipment: string | null
          exercise_type: string | null
          id: string | null
          image: string | null
          instructions: string | null
          is_active: boolean | null
          is_draft: boolean | null
          is_global: boolean | null
          muscles_trained: string[] | null
          name: string | null
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
          cues_and_tips?: string | null
          default_unit?: string | null
          difficulty?: string | null
          equipment?: string | null
          exercise_type?: string | null
          id?: string | null
          image?: string | null
          instructions?: string | null
          is_active?: boolean | null
          is_draft?: boolean | null
          is_global?: boolean | null
          muscles_trained?: string[] | null
          name?: string | null
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
          cues_and_tips?: string | null
          default_unit?: string | null
          difficulty?: string | null
          equipment?: string | null
          exercise_type?: string | null
          id?: string | null
          image?: string | null
          instructions?: string | null
          is_active?: boolean | null
          is_draft?: boolean | null
          is_global?: boolean | null
          muscles_trained?: string[] | null
          name?: string | null
          progression_id?: string | null
          regression_id?: string | null
          target_goal?: string | null
          updated_at?: string | null
          video_url_1?: string | null
          video_url_2?: string | null
        }
        Relationships: []
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
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
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
      favorite_exercises: {
        Row: {
          created_at: string
          exercise_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          exercise_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          exercise_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      food_items: {
        Row: {
          brand_name: string | null
          calories_per_serving: number | null
          carbs_grams: number | null
          created_at: string | null
          fat_grams: number | null
          fiber_grams: number | null
          full_nutrients: Json | null
          id: string
          name: string
          nutritionix_id: string
          protein_grams: number | null
          serving_unit: string | null
          serving_weight_grams: number | null
          sodium_mg: number | null
          sugar_grams: number | null
          updated_at: string | null
        }
        Insert: {
          brand_name?: string | null
          calories_per_serving?: number | null
          carbs_grams?: number | null
          created_at?: string | null
          fat_grams?: number | null
          fiber_grams?: number | null
          full_nutrients?: Json | null
          id?: string
          name: string
          nutritionix_id: string
          protein_grams?: number | null
          serving_unit?: string | null
          serving_weight_grams?: number | null
          sodium_mg?: number | null
          sugar_grams?: number | null
          updated_at?: string | null
        }
        Update: {
          brand_name?: string | null
          calories_per_serving?: number | null
          carbs_grams?: number | null
          created_at?: string | null
          fat_grams?: number | null
          fiber_grams?: number | null
          full_nutrients?: Json | null
          id?: string
          name?: string
          nutritionix_id?: string
          protein_grams?: number | null
          serving_unit?: string | null
          serving_weight_grams?: number | null
          sodium_mg?: number | null
          sugar_grams?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      form_elements: {
        Row: {
          created_at: string | null
          css_class: string | null
          default_value: string | null
          description: string | null
          element_type: string
          form_id: string | null
          help_text: string | null
          id: string
          label: string
          max_length: number | null
          max_value: number | null
          min_length: number | null
          min_value: number | null
          options: Json | null
          order_index: number
          placeholder: string | null
          required: boolean | null
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          css_class?: string | null
          default_value?: string | null
          description?: string | null
          element_type: string
          form_id?: string | null
          help_text?: string | null
          id?: string
          label: string
          max_length?: number | null
          max_value?: number | null
          min_length?: number | null
          min_value?: number | null
          options?: Json | null
          order_index: number
          placeholder?: string | null
          required?: boolean | null
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          css_class?: string | null
          default_value?: string | null
          description?: string | null
          element_type?: string
          form_id?: string | null
          help_text?: string | null
          id?: string
          label?: string
          max_length?: number | null
          max_value?: number | null
          min_length?: number | null
          min_value?: number | null
          options?: Json | null
          order_index?: number
          placeholder?: string | null
          required?: boolean | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_elements_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_responses: {
        Row: {
          client_id: string | null
          form_id: string | null
          id: string
          responses: Json
          submitted_at: string | null
        }
        Insert: {
          client_id?: string | null
          form_id?: string | null
          id?: string
          responses: Json
          submitted_at?: string | null
        }
        Update: {
          client_id?: string | null
          form_id?: string | null
          id?: string
          responses?: Json
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_responses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "form_responses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          coach_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "forms_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          bg_color: string
          created_at: string
          icon: string
          icon_color: string
          id: string
          subtitle: string
          title: string
        }
        Insert: {
          bg_color?: string
          created_at?: string
          icon: string
          icon_color?: string
          id?: string
          subtitle: string
          title: string
        }
        Update: {
          bg_color?: string
          created_at?: string
          icon?: string
          icon_color?: string
          id?: string
          subtitle?: string
          title?: string
        }
        Relationships: []
      }
      help_and_support: {
        Row: {
          category: string | null
          created_at: string
          id: string
          message: string | null
          subject: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          message?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          message?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      meadow_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meadow_chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "meadow_chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_days: {
        Row: {
          created_at: string | null
          day_number: number
          id: string
          meal_plan_id: string
          week_number: number
        }
        Insert: {
          created_at?: string | null
          day_number: number
          id?: string
          meal_plan_id: string
          week_number: number
        }
        Update: {
          created_at?: string | null
          day_number?: number
          id?: string
          meal_plan_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_days_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_complete"
            referencedColumns: ["meal_plan_id"]
          },
          {
            foreignKeyName: "meal_plan_days_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_days_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["meal_plan_id"]
          },
        ]
      }
      meal_plan_meals: {
        Row: {
          created_at: string | null
          id: string
          meal_plan_day_id: string
          meal_type: string
          recipe_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meal_plan_day_id: string
          meal_type: string
          recipe_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meal_plan_day_id?: string
          meal_type?: string
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_meals_meal_plan_day_id_fkey"
            columns: ["meal_plan_day_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_meals_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          coach_id: string
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
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
      mobility_videos: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration: number | null
          id: string
          is_favorite: boolean | null
          thumbnail_url: string | null
          title: string
          video_url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: number | null
          id?: string
          is_favorite?: boolean | null
          thumbnail_url?: string | null
          title: string
          video_url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: number | null
          id?: string
          is_favorite?: boolean | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string
        }
        Relationships: []
      }
      mobilityassessments: {
        Row: {
          created_at: string | null
          date: string
          email: string
          id: number
          joint: string
          min_angle: number
          name: string
          side: string
        }
        Insert: {
          created_at?: string | null
          date: string
          email: string
          id?: never
          joint: string
          min_angle: number
          name: string
          side: string
        }
        Update: {
          created_at?: string | null
          date?: string
          email?: string
          id?: never
          joint?: string
          min_angle?: number
          name?: string
          side?: string
        }
        Relationships: []
      }
      nutrition_logs: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string | null
          food_items: Json
          id: string
          log_date: string
          logged_at: string | null
          meal_type: string
          notes: string | null
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_protein: number | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string | null
          food_items: Json
          id?: string
          log_date: string
          logged_at?: string | null
          meal_type: string
          notes?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string | null
          food_items?: Json
          id?: string
          log_date?: string
          logged_at?: string | null
          meal_type?: string
          notes?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "nutrition_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_logs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "nutrition_logs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_targets: {
        Row: {
          calories: number
          carbs: number
          client_id: string | null
          created_at: string | null
          fats: number
          id: string
          protein: number
          updated_at: string | null
        }
        Insert: {
          calories?: number
          carbs?: number
          client_id?: string | null
          created_at?: string | null
          fats?: number
          id?: string
          protein?: number
          updated_at?: string | null
        }
        Update: {
          calories?: number
          carbs?: number
          client_id?: string | null
          created_at?: string | null
          fats?: number
          id?: string
          protein?: number
          updated_at?: string | null
        }
        Relationships: []
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
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
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
          is_global: boolean | null
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
          is_global?: boolean | null
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
          is_global?: boolean | null
          lastModified?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "programs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          coach_id: string
          cook_time: number | null
          cover_photo: string | null
          created_at: string | null
          description: string | null
          dietary_tag: Database["public"]["Enums"]["dietary_tag"] | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          id: string
          image_url: string | null
          ingredients: Json | null
          instructions: string[] | null
          is_public: boolean | null
          meal_type: Database["public"]["Enums"]["meal_type"] | null
          name: string
          prep_time: number | null
          servings: number
          short_description: string | null
          tags: string[] | null
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_protein: number | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          coach_id: string
          cook_time?: number | null
          cover_photo?: string | null
          created_at?: string | null
          description?: string | null
          dietary_tag?: Database["public"]["Enums"]["dietary_tag"] | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: string[] | null
          is_public?: boolean | null
          meal_type?: Database["public"]["Enums"]["meal_type"] | null
          name: string
          prep_time?: number | null
          servings?: number
          short_description?: string | null
          tags?: string[] | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          coach_id?: string
          cook_time?: number | null
          cover_photo?: string | null
          created_at?: string | null
          description?: string | null
          dietary_tag?: Database["public"]["Enums"]["dietary_tag"] | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: string[] | null
          is_public?: boolean | null
          meal_type?: Database["public"]["Enums"]["meal_type"] | null
          name?: string
          prep_time?: number | null
          servings?: number
          short_description?: string | null
          tags?: string[] | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: number
          price_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_email: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: number
          price_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_email?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: number
          price_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_email?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_email_fkey"
            columns: ["user_email"]
            isOneToOne: false
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["email"]
          },
          {
            foreignKeyName: "subscriptions_user_email_fkey"
            columns: ["user_email"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["email"]
          },
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      substitutions: {
        Row: {
          created_at: string | null
          current_exercise_id: string
          id: string
          substituted_exercise_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_exercise_id: string
          id?: string
          substituted_exercise_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_exercise_id?: string
          id?: string
          substituted_exercise_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_meal_plans: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          id: string
          is_active: boolean | null
          meal_plan_id: string
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          id?: string
          is_active?: boolean | null
          meal_plan_id: string
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          id?: string
          is_active?: boolean | null
          meal_plan_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_meal_plans_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_complete"
            referencedColumns: ["meal_plan_id"]
          },
          {
            foreignKeyName: "user_meal_plans_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_meal_plans_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["meal_plan_id"]
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
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
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
          app_open_streak: number | null
          coach: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          habit_streak: number | null
          habits: string[] | null
          id: string
          last_app_open: string | null
          last_habit_completion: string | null
          login_streak_start_date: string | null
          profile_image_url: string | null
          role: string | null
          streak_start_date: string | null
          stream_user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          app_open_streak?: number | null
          coach?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          habit_streak?: number | null
          habits?: string[] | null
          id: string
          last_app_open?: string | null
          last_habit_completion?: string | null
          login_streak_start_date?: string | null
          profile_image_url?: string | null
          role?: string | null
          streak_start_date?: string | null
          stream_user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          app_open_streak?: number | null
          coach?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          habit_streak?: number | null
          habits?: string[] | null
          id?: string
          last_app_open?: string | null
          last_habit_completion?: string | null
          login_streak_start_date?: string | null
          profile_image_url?: string | null
          role?: string | null
          streak_start_date?: string | null
          stream_user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_ml: number
          client_id: string
          coach_id: string
          created_at: string | null
          id: string
          log_date: string
          logged_at: string | null
        }
        Insert: {
          amount_ml: number
          client_id: string
          coach_id: string
          created_at?: string | null
          id?: string
          log_date: string
          logged_at?: string | null
        }
        Update: {
          amount_ml?: number
          client_id?: string
          coach_id?: string
          created_at?: string | null
          id?: string
          log_date?: string
          logged_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "water_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "water_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "water_logs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "water_logs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          cover_photo: string | null
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
          cover_photo?: string | null
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
          cover_photo?: string | null
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
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string | null
          owner_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          owner_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_active_meal_plan"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "workspaces_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      meal_plan_complete: {
        Row: {
          coach_id: string | null
          created_at: string | null
          day_number: number | null
          description: string | null
          meal_plan_id: string | null
          meal_type: string | null
          recipe_id: string | null
          recipe_name: string | null
          title: string | null
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_protein: number | null
          updated_at: string | null
          week_number: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_meals_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_active_meal_plan: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          description: string | null
          email: string | null
          full_name: string | null
          meal_plan_id: string | null
          title: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      clear_day: {
        Args: { day: string; client_id: string }
        Returns: undefined
      }
      create_full_workout: {
        Args: { workout_data: Json }
        Returns: undefined
      }
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      get_client_schedule: {
        Args: { client: string; start: string; days: number }
        Returns: {
          date: string
          workout_id: string
          workout_name: string
          is_rest_day: boolean
          notes: string
        }[]
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
      get_max_weight: {
        Args: { p_exercise_name: string; p_client_uuid: string }
        Returns: {
          client_name: string
          queried_exercise_name: string
          max_weight: number
        }[]
      }
      get_max_weight_for_user: {
        Args: { exercise_name_input: string; client_name_input: string }
        Returns: {
          client_name: string
          exercise_name: string
          max_weight: number
        }[]
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
      maintain_12_week_schedule: {
        Args: { p_client_id: string }
        Returns: undefined
      }
      move_day: {
        Args: { from_date: string; to_date: string; client_id: string }
        Returns: undefined
      }
      populate_4_week_schedule: {
        Args:
          | { p_client_id: string }
          | { p_client_id: string; p_start_date: string }
        Returns: undefined
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
      swap_days: {
        Args: { date1: string; date2: string; client_id: string }
        Returns: undefined
      }
    }
    Enums: {
      dietary_tag:
        | "High Protein"
        | "Antioxidants"
        | "Low Carb"
        | "Heart Healthy"
        | "Anti-Inflammatory"
        | "Fiber Rich"
      difficulty_level: "Beginner" | "Intermediate" | "Advanced"
      meal_type: "breakfast" | "lunch" | "dinner" | "snack"
      message_type: "text" | "image" | "file" | "voice" | "video"
      role_type: "Client" | "Coach"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      dietary_tag: [
        "High Protein",
        "Antioxidants",
        "Low Carb",
        "Heart Healthy",
        "Anti-Inflammatory",
        "Fiber Rich",
      ],
      difficulty_level: ["Beginner", "Intermediate", "Advanced"],
      meal_type: ["breakfast", "lunch", "dinner", "snack"],
      message_type: ["text", "image", "file", "voice", "video"],
      role_type: ["Client", "Coach"],
    },
  },
} as const
