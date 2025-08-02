// Types for workout import functionality

export interface ProcessedWorkout {
  metadata: WorkoutMetadata;
  blocks: ProcessedWorkoutBlock[];
  unmatchedExercises: UnmatchedExercise[];
}

export interface WorkoutMetadata {
  title: string;
  creator?: string;
  date?: string;
  description?: string;
  difficulty?: string;
  equipment?: string[];
  duration?: string;
}

export interface ProcessedWorkoutBlock {
  name: string;
  type: "interval" | "amrap" | "regular" | "superset" | "circuit";
  duration?: string;
  exercises: ProcessedExercise[];
}

export interface ProcessedExercise {
  name: string;
  duration?: string;
  instructions?: string;
  rest?: string;
  matchedExerciseId?: string;
  isMatched: boolean;
}

export interface UnmatchedExercise {
  name: string;
  instructions?: string;
  suggestedMatches: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  video_url_1: string | null;
  video_url_2: string | null;
  image: string | null;
  difficulty: string | null;
  equipment: string | null;
  exercise_type: string | null;
  muscles_trained: string[] | null;
  instructions: string | null;
  cues_and_tips: string | null;
  is_active: boolean | null;
  is_global: boolean | null;
  coach_id: string | null;
}

export interface NewExercise {
  name: string;
  equipment?: string;
  difficulty?: string;
  exercise_type?: string;
  instructions?: string;
  video_url_1?: string;
  video_url_2?: string;
  image?: string;
  muscles_trained?: string[];
  target_goal?: string;
  default_unit?: string[];
  cues_and_tips?: string;
}

// API Response types
export interface ProcessWorkoutPdfResponse {
  success: boolean;
  data?: {
    metadata: WorkoutMetadata;
    blocks: ProcessedWorkoutBlock[];
  };
  error?: string;
  details?: string;
}

// PDF Upload states
export type PdfUploadState =
  | "idle"
  | "uploading"
  | "processing"
  | "matching"
  | "preview"
  | "creating"
  | "error";

// Exercise matching states
export type ExerciseMatchingState = "unmatched" | "matched" | "new_exercise";

// Duration parsing utilities
export interface ParsedDuration {
  hours: number;
  minutes: number;
  seconds: number;
}

// Equipment mapping
export interface EquipmentMapping {
  [key: string]: string;
}

// Exercise name variations
export interface ExerciseVariation {
  original: string;
  normalized: string;
  equipment?: string;
  modifier?: string;
}
