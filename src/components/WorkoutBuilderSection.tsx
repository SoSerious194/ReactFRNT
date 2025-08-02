"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Tables, TablesInsert, TablesUpdate } from "@/types/database";
import { useToast } from "@/components/ui/toast";
import { PdfUploadModal } from "./PdfUploadModal";
import { ExerciseMatchingModal } from "./ExerciseMatchingModal";
import { ProcessedWorkout, UnmatchedExercise } from "@/types/workoutImport";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Database types
type Workout = Tables<"workouts">;
type WorkoutBlock = Tables<"workout_blocks">;
type DatabaseExerciseSet = Tables<"exercise_sets">;
type WorkoutInsert = TablesInsert<"workouts">;
type WorkoutBlockInsert = TablesInsert<"workout_blocks">;
type ExerciseSetInsert = TablesInsert<"exercise_sets">;
type WorkoutUpdate = TablesUpdate<"workouts">;
type WorkoutBlockUpdate = TablesUpdate<"workout_blocks">;
type ExerciseSetUpdate = TablesUpdate<"exercise_sets">;

// Supabase client
const supabase = createClient();

// SVG icon components for use in place of FontAwesome
const DumbbellIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 640 512"
  >
    <path
      fill="currentColor"
      d="M96 64c0-17.7 14.3-32 32-32h32c17.7 0 32 14.3 32 32V224v64V448c0 17.7-14.3 32-32 32H128c-17.7 0-32-14.3-32-32V384H64c-17.7 0-32-14.3-32-32V288c-17.7 0-32-14.3-32-32s14.3-32 32-32V160c0-17.7 14.3-32 32-32H96V64zm448 0v64h32c17.7 0 32 14.3 32 32v64c17.7 0 32 14.3 32 32s-14.3 32-32 32v64c0 17.7-14.3 32-32 32H544v64c0 17.7-14.3 32-32 32H480c-17.7 0-32-14.3-32-32V288 224 64c0-17.7 14.3-32 32-32h32c17.7 0 32 14.3 32 32zM416 224v64H224V224H416z"
    />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="white" viewBox="0 0 384 512">
    <path
      fill="white"
      d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
    />
  </svg>
);

const FilterIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 512 512"
  >
    <path
      fill="currentColor"
      d="M3.9 54.9C10.5 40.9 24.5 32 40 32H472c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9V448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6V320.9L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"
    />
  </svg>
);
const MagnifierIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 512 512"
  >
    <path
      fill="currentColor"
      d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
    />
  </svg>
);
const MinusIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M4 8h8" strokeWidth="2" />
  </svg>
);

const EllipsisIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 448 512"
  >
    <path
      fill="currentColor"
      d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"
    />
  </svg>
);

// Supersets icon
const SupersetIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
    />
  </svg>
);

// Circuits icon
const CircuitIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
    />
  </svg>
);

const WarmupIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const CooldownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const BarsIcon = () => (
  <svg
    className="w-4 h-4 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 448 512"
  >
    <path
      fill="currentColor"
      d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"
    />
  </svg>
);

// Sortable Session Component
const SortableSession = ({
  session,
  isSelected,
  onSelect,
  onDelete,
  children,
}: {
  session: Session;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `session-${session.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-3 cursor-pointer transition-all ${
        session.type === "normal"
          ? "bg-gray-100 border-gray-300"
          : session.type === "superset"
          ? "bg-yellow-100 border-yellow-300"
          : session.type === "circuit"
          ? "bg-purple-100 border-purple-300"
          : session.type === "warmup"
          ? "bg-orange-100 border-orange-300"
          : session.type === "cooldown"
          ? "bg-blue-100 border-blue-300"
          : "bg-gray-100 border-gray-300"
      } ${isSelected ? "ring-2 ring-blue-500 shadow-md" : "hover:shadow-sm"} ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center space-x-2 mb-3">
        {session.type === "superset" ? (
          <SupersetIcon />
        ) : session.type === "circuit" ? (
          <CircuitIcon />
        ) : session.type === "warmup" ? (
          <WarmupIcon />
        ) : session.type === "cooldown" ? (
          <CooldownIcon />
        ) : (
          <BarsIcon />
        )}
        <span
          className={`text-sm font-semibold ${
            session.type === "normal"
              ? "text-gray-800"
              : session.type === "superset"
              ? "text-yellow-800"
              : session.type === "circuit"
              ? "text-purple-800"
              : session.type === "warmup"
              ? "text-orange-800"
              : session.type === "cooldown"
              ? "text-blue-800"
              : "text-gray-800"
          }`}
        >
          {session.name}
        </span>
        {isSelected && (
          <span className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded">
            Active
          </span>
        )}
      </div>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
};

// Sortable Exercise Component
const SortableExercise = ({
  exercise,
  onDelete,
  sessionId,
  isWorkoutExercise = false,
}: {
  exercise: WorkoutExercise;
  onDelete: () => void;
  sessionId?: string;
  isWorkoutExercise?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `exercise-${exercise.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 p-2 bg-white rounded border border-gray-200 cursor-pointer ${
        isDragging ? "opacity-50" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <BarsIcon />
      <span className="text-sm text-gray-700 flex-1">
        {exercise.exercise.name}
      </span>
    </div>
  );
};

// Types
type Exercise = {
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
};

type ExerciseFilter = {
  label: string;
  active: boolean;
};

type SetType = "warmup" | "normal" | "dropset" | "burnout";

type ExerciseSet = {
  id: string;
  type: SetType;
  setNumber: number;
  rest: number; // Duration in seconds
  weight?: string; // Weight for the set
  reps?: number; // Reps for the set
  exercise?: Exercise; // Optional exercise for the set
  customName?: string; // Custom name for the set
  notes?: string; // Set name (stored in notes field)
};

type WorkoutExercise = {
  id: string;
  exercise: Exercise;
  sets: ExerciseSet[];
  instructions: string;
};

type SessionType = "normal" | "superset" | "circuit" | "warmup" | "cooldown";

type Session = {
  id: string;
  type: SessionType;
  name: string;
  exercises: WorkoutExercise[];
};

const exerciseFilters: ExerciseFilter[] = [
  { label: "Exercises", active: true },
  { label: "Circuits/Intervals", active: false },
  { label: "Warm-Ups", active: false },
  { label: "Cool-Downs", active: false },
];

const sessionArrangement = {
  day: "DAY 6",
  items: [
    { type: "single", name: "Calf Stretch" },
    {
      type: "superset",
      name: "Superset 1",
      exercises: ["Barbell Bench Press", "Dumbbell Pullover"],
    },
    {
      type: "circuit",
      name: "Circuit 1",
      exercises: [
        "Dynamic Crossbody Hamstring Stretch",
        "90/90 Pigeon",
        "Couch Stretch (Quads)",
      ],
    },
    { type: "single", name: "Pec Stretch" },
  ],
};

export default function WorkoutBuilderSection({
  editWorkoutId,
  duplicateWorkoutId,
}: {
  editWorkoutId?: string;
  duplicateWorkoutId?: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("Exercises");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [workoutName, setWorkoutName] = useState("Workout Name");
  const [workoutDifficulty, setWorkoutDifficulty] =
    useState<string>("Beginner");
  const [workoutEquipment, setWorkoutEquipment] = useState<string[]>([]);
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [workoutCoverPhoto, setWorkoutCoverPhoto] = useState<string | null>(
    null
  );
  const [workoutDuration, setWorkoutDuration] = useState({
    hours: 0,
    minutes: 0,
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Workout builder state
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    []
  );
  const [selectedWorkoutExercise, setSelectedWorkoutExercise] =
    useState<WorkoutExercise | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [selectedSessionExerciseId, setSelectedSessionExerciseId] = useState<
    string | null
  >(null);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openTimePicker, setOpenTimePicker] = useState<string | null>(null);
  const [isWorkoutDetailsExpanded, setIsWorkoutDetailsExpanded] =
    useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeModalTarget, setTimeModalTarget] = useState<{
    type: "time" | "rest";
    setId: string;
    sessionId?: string;
    exerciseId?: string;
  } | null>(null);
  const [customDuration, setCustomDuration] = useState(5);

  // State for PDF upload and exercise matching
  const [showPdfUpload, setShowPdfUpload] = useState(false);
  const [showExerciseMatching, setShowExerciseMatching] = useState(false);
  const [processedWorkout, setProcessedWorkout] =
    useState<ProcessedWorkout | null>(null);
  const [unmatchedExercises, setUnmatchedExercises] = useState<
    UnmatchedExercise[]
  >([]);

  // State for AI workout generation
  const [showAiWorkoutModal, setShowAiWorkoutModal] = useState(false);
  const [aiWorkoutText, setAiWorkoutText] = useState("");
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);

  // Workout state
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [workoutBlocks, setWorkoutBlocks] = useState<WorkoutBlock[]>([]);
  const [exerciseSets, setExerciseSets] = useState<DatabaseExerciseSet[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingWorkout, setLoadingWorkout] = useState(false);

  // Duration options in minutes
  const durationOptions = [5, 10, 15, 30, 60];

  // Convert seconds to minutes for display
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  };

  // Parse duration from "X minute(s)" format to seconds
  const parseDuration = (durationString: string): number => {
    const minutes = parseInt(durationString.replace(/ minute(s)?$/, ""));
    return minutes * 60;
  };

  // Open time modal
  const openTimeModal = (
    type: "time" | "rest",
    setId: string,
    sessionId?: string,
    exerciseId?: string
  ) => {
    setTimeModalTarget({ type, setId, sessionId, exerciseId });
    setShowTimeModal(true);
    setOpenTimePicker(null); // Close any open dropdown
  };

  // Update time/rest with selected duration
  const updateDuration = (minutes: number) => {
    if (!timeModalTarget) return;

    const { type, setId, sessionId, exerciseId } = timeModalTarget;
    const seconds = minutes * 60;

    if (sessionId && exerciseId) {
      // Update session exercise set
      updateSessionExerciseSet(sessionId, exerciseId, setId, {
        [type]: seconds,
      });
    } else {
      // Update main workout exercise set
      updateSet(setId, { [type]: seconds });
    }

    setShowTimeModal(false);
    setTimeModalTarget(null);
  };

  // Fetch exercises from Supabase
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase
          .from("exercise_library")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching exercises:", error);
          return;
        }

        setExercises(data || []);
        setFilteredExercises(data || []);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // Load workout for editing if editWorkoutId is provided
  useEffect(() => {
    if (editWorkoutId && exercises.length > 0) {
      loadWorkout(editWorkoutId);
    }
  }, [editWorkoutId, exercises]);

  // Load workout for duplication if duplicateWorkoutId is provided
  useEffect(() => {
    if (duplicateWorkoutId && exercises.length > 0) {
      loadWorkoutForDuplication(duplicateWorkoutId);
    }
  }, [duplicateWorkoutId, exercises]);

  // Filter exercises based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredExercises(exercises);
      return;
    }

    const filtered = exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredExercises(filtered);
  }, [searchQuery, exercises]);

  // Handle filter change
  const handleFilterChange = (filterLabel: string) => {
    setSelectedFilter(filterLabel);

    // Implement actual filtering based on exercise_type or other criteria
    if (filterLabel === "All") {
      setFilteredExercises(exercises);
    } else {
      const filtered = exercises.filter((exercise) => {
        switch (filterLabel) {
          case "Strength":
            return (
              exercise.exercise_type === "strength" ||
              exercise.exercise_type === "powerlifting"
            );
          case "Cardio":
            return (
              exercise.exercise_type === "cardio" ||
              exercise.exercise_type === "endurance"
            );
          case "Mobility":
            return (
              exercise.exercise_type === "mobility" ||
              exercise.exercise_type === "flexibility"
            );
          case "Bodyweight":
            return (
              exercise.equipment === "bodyweight" ||
              exercise.exercise_type === "calisthenics"
            );
          default:
            return true;
        }
      });
      setFilteredExercises(filtered);
    }
  };

  // Handle exercise selection from left panel
  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);

    // If a set is selected, assign the exercise to that set
    if (selectedSetId && selectedWorkoutExercise) {
      // Find the set and update it with the exercise
      setWorkoutExercises((prev) =>
        prev.map((we) =>
          we.id === selectedWorkoutExercise.id
            ? {
                ...we,
                sets: we.sets.map((set) =>
                  set.id === selectedSetId
                    ? { ...set, exercise: exercise }
                    : set
                ),
              }
            : we
        )
      );

      setSelectedWorkoutExercise((prev) =>
        prev
          ? {
              ...prev,
              sets: prev.sets.map((set) =>
                set.id === selectedSetId ? { ...set, exercise: exercise } : set
              ),
            }
          : null
      );

      setSelectedSetId(null); // Clear selection after assignment
    } else if (selectedSessionId) {
      // If a session is selected, add the exercise to that session
      const newWorkoutExercise: WorkoutExercise = {
        id: `we-${Date.now()}`,
        exercise: exercise,
        sets: [],
        instructions: exercise.instructions || "",
      };

      setSessions((prev) =>
        prev.map((session) =>
          session.id === selectedSessionId
            ? {
                ...session,
                exercises: [...session.exercises, newWorkoutExercise],
              }
            : session
        )
      );

      // Don't clear session selection - allow adding multiple exercises
    } else {
      // Add exercise to workout if not already present (normal behavior)
      const existingExercise = workoutExercises.find(
        (we) => we.exercise.id === exercise.id
      );
      if (!existingExercise) {
        const newWorkoutExercise: WorkoutExercise = {
          id: `we-${Date.now()}`,
          exercise: exercise,
          sets: [],
          instructions: exercise.instructions || "",
        };

        setWorkoutExercises((prev) => [...prev, newWorkoutExercise]);
        setSelectedWorkoutExercise(newWorkoutExercise);
      } else {
        setSelectedWorkoutExercise(existingExercise);
      }
    }
  };

  // Add new session (Normal, Superset, Circuit)
  const addSession = (type: SessionType) => {
    const newSession: Session = {
      id: `session-${Date.now()}`,
      type: type,
      name:
        type === "normal"
          ? "Normal Exercise"
          : `${type.charAt(0).toUpperCase() + type.slice(1)} 1`,
      exercises: [],
    };

    setSessions((prev) => [...prev, newSession]);
    // Automatically select the newly created session
    setSelectedSessionId(newSession.id);
    // Clear any other selections to avoid confusion
    setSelectedWorkoutExercise(null);
    setSelectedSetId(null);
    setSelectedSessionExerciseId(null);
  };

  // Add set to selected workout exercise
  const addSet = (type: SetType) => {
    if (!selectedWorkoutExercise) return;

    const newSet: ExerciseSet = {
      id: `set-${Date.now()}`,
      type: type,
      setNumber: 1, // This will be overridden by array index
      rest: type === "warmup" ? 0 : 60,
      weight: "",
      reps: 0,
    };

    setWorkoutExercises((prev) =>
      prev.map((we) =>
        we.id === selectedWorkoutExercise.id
          ? { ...we, sets: [...we.sets, newSet] }
          : we
      )
    );

    setSelectedWorkoutExercise((prev) =>
      prev ? { ...prev, sets: [...prev.sets, newSet] } : null
    );
  };

  // Update set
  const updateSet = (setId: string, updates: Partial<ExerciseSet>) => {
    if (!selectedWorkoutExercise) return;

    setWorkoutExercises((prev) =>
      prev.map((we) =>
        we.id === selectedWorkoutExercise.id
          ? {
              ...we,
              sets: we.sets.map((set) =>
                set.id === setId ? { ...set, ...updates } : set
              ),
            }
          : we
      )
    );

    setSelectedWorkoutExercise((prev) =>
      prev
        ? {
            ...prev,
            sets: prev.sets.map((set) =>
              set.id === setId ? { ...set, ...updates } : set
            ),
          }
        : null
    );
  };

  // Remove set
  const removeSet = (setId: string) => {
    if (!selectedWorkoutExercise) return;

    setWorkoutExercises((prev) =>
      prev.map((we) =>
        we.id === selectedWorkoutExercise.id
          ? {
              ...we,
              sets: we.sets.filter((set) => set.id !== setId),
            }
          : we
      )
    );

    setSelectedWorkoutExercise((prev) =>
      prev
        ? {
            ...prev,
            sets: prev.sets.filter((set) => set.id !== setId),
          }
        : null
    );
  };

  // Update instructions
  const updateInstructions = (instructions: string) => {
    if (!selectedWorkoutExercise) return;

    setWorkoutExercises((prev) =>
      prev.map((we) =>
        we.id === selectedWorkoutExercise.id ? { ...we, instructions } : we
      )
    );

    setSelectedWorkoutExercise((prev) =>
      prev ? { ...prev, instructions } : null
    );
  };

  // Update set custom name
  const updateSetCustomName = (setId: string, customName: string) => {
    if (!selectedWorkoutExercise) return;

    setWorkoutExercises((prev) =>
      prev.map((we) =>
        we.id === selectedWorkoutExercise.id
          ? {
              ...we,
              sets: we.sets.map((set) =>
                set.id === setId ? { ...set, customName } : set
              ),
            }
          : we
      )
    );

    setSelectedWorkoutExercise((prev) =>
      prev
        ? {
            ...prev,
            sets: prev.sets.map((set) =>
              set.id === setId ? { ...set, customName } : set
            ),
          }
        : null
    );
  };

  // Update set notes (set names)
  const updateSetNotes = (setId: string, notes: string) => {
    if (!selectedWorkoutExercise) return;

    setWorkoutExercises((prev) =>
      prev.map((we) =>
        we.id === selectedWorkoutExercise.id
          ? {
              ...we,
              sets: we.sets.map((set) =>
                set.id === setId ? { ...set, notes } : set
              ),
            }
          : we
      )
    );

    setSelectedWorkoutExercise((prev) =>
      prev
        ? {
            ...prev,
            sets: prev.sets.map((set) =>
              set.id === setId ? { ...set, notes } : set
            ),
          }
        : null
    );
  };

  // Update set weight
  const updateSetWeight = (setId: string, weight: string) => {
    if (!selectedWorkoutExercise) return;

    setWorkoutExercises((prev) =>
      prev.map((we) =>
        we.id === selectedWorkoutExercise.id
          ? {
              ...we,
              sets: we.sets.map((set) =>
                set.id === setId ? { ...set, weight } : set
              ),
            }
          : we
      )
    );

    setSelectedWorkoutExercise((prev) =>
      prev
        ? {
            ...prev,
            sets: prev.sets.map((set) =>
              set.id === setId ? { ...set, weight } : set
            ),
          }
        : null
    );
  };

  // Update set reps
  const updateSetReps = (setId: string, reps: number) => {
    if (!selectedWorkoutExercise) return;

    setWorkoutExercises((prev) =>
      prev.map((we) =>
        we.id === selectedWorkoutExercise.id
          ? {
              ...we,
              sets: we.sets.map((set) =>
                set.id === setId ? { ...set, reps } : set
              ),
            }
          : we
      )
    );

    setSelectedWorkoutExercise((prev) =>
      prev
        ? {
            ...prev,
            sets: prev.sets.map((set) =>
              set.id === setId ? { ...set, reps } : set
            ),
          }
        : null
    );
  };

  // Time picker helper - converts seconds to MM:SS format
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Parse time from MM:SS format to seconds
  const parseTime = (timeString: string): number => {
    const [minutes, seconds] = timeString.split(":").map(Number);
    return minutes * 60 + seconds;
  };

  // Close dropdown and time picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openDropdown &&
        !(event.target as Element).closest(".dropdown-container") &&
        !(event.target as Element).closest(".equipment-dropdown")
      ) {
        setOpenDropdown(null);
      }
      if (
        openTimePicker &&
        !(event.target as Element).closest(".time-picker-container")
      ) {
        setOpenTimePicker(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown, openTimePicker]);

  // Generate thumbnail URL from Cloudflare Stream URL
  const getThumbnailUrl = (videoUrl: string | null): string => {
    if (!videoUrl) {
      // Return a data URL for a simple placeholder SVG
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EExercise%3C/text%3E%3C/svg%3E";
    }

    // Convert Cloudflare Stream URL to thumbnail URL
    // Example: https://videodelivery.net/abc123/manifest/video.m3u8
    // To: https://videodelivery.net/abc123/thumbnails/thumbnail.jpg
    try {
      const urlParts = videoUrl.split("/");
      if (urlParts.length >= 4) {
        const videoId = urlParts[3]; // Extract video ID
        return `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`;
      }
    } catch (error) {
      console.error("Error parsing video URL:", error);
    }

    // Fallback to placeholder if URL parsing fails
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EExercise%3C/text%3E%3C/svg%3E";
  };

  // Add set to a specific session exercise
  const addSessionExerciseSet = (
    sessionId: string,
    exerciseId: string,
    type: SetType
  ) => {
    const newSet: ExerciseSet = {
      id: `set-${Date.now()}`,
      type: type,
      setNumber: 1, // Default set number for new sets
      rest: type === "warmup" ? 0 : 60,
      weight: "",
      reps: 0,
    };

    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              exercises: session.exercises.map((we) =>
                we.id === exerciseId
                  ? {
                      ...we,
                      sets: [...we.sets, newSet],
                    }
                  : we
              ),
            }
          : session
      )
    );
  };

  // Update set for a specific session exercise
  const updateSessionExerciseSet = (
    sessionId: string,
    exerciseId: string,
    setId: string,
    updates: Partial<ExerciseSet>
  ) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              exercises: session.exercises.map((we) =>
                we.id === exerciseId
                  ? {
                      ...we,
                      sets: we.sets.map((set) =>
                        set.id === setId ? { ...set, ...updates } : set
                      ),
                    }
                  : we
              ),
            }
          : session
      )
    );
  };

  // Remove set for a specific session exercise
  const removeSessionExerciseSet = (
    sessionId: string,
    exerciseId: string,
    setId: string
  ) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              exercises: session.exercises.map((we) =>
                we.id === exerciseId
                  ? {
                      ...we,
                      sets: we.sets.filter((set) => set.id !== setId),
                    }
                  : we
              ),
            }
          : session
      )
    );
  };

  // Update instructions for a specific session exercise
  const updateSessionExerciseInstructions = (
    sessionId: string,
    exerciseId: string,
    instructions: string
  ) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              exercises: session.exercises.map((we) =>
                we.id === exerciseId
                  ? {
                      ...we,
                      instructions: instructions,
                    }
                  : we
              ),
            }
          : session
      )
    );
  };

  // Update session exercise set custom name
  const updateSessionExerciseSetCustomName = (
    sessionId: string,
    exerciseId: string,
    setId: string,
    customName: string
  ) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              exercises: session.exercises.map((we) =>
                we.id === exerciseId
                  ? {
                      ...we,
                      sets: we.sets.map((set) =>
                        set.id === setId ? { ...set, customName } : set
                      ),
                    }
                  : we
              ),
            }
          : session
      )
    );
  };

  const updateSessionExerciseSetWeight = (
    sessionId: string,
    exerciseId: string,
    setId: string,
    weight: string
  ) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              exercises: session.exercises.map((we) =>
                we.id === exerciseId
                  ? {
                      ...we,
                      sets: we.sets.map((set) =>
                        set.id === setId ? { ...set, weight } : set
                      ),
                    }
                  : we
              ),
            }
          : session
      )
    );
  };

  const updateSessionExerciseSetReps = (
    sessionId: string,
    exerciseId: string,
    setId: string,
    reps: number
  ) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              exercises: session.exercises.map((we) =>
                we.id === exerciseId
                  ? {
                      ...we,
                      sets: we.sets.map((set) =>
                        set.id === setId ? { ...set, reps } : set
                      ),
                    }
                  : we
              ),
            }
          : session
      )
    );
  };

  // Update session exercise set notes (set names)
  const updateSessionExerciseSetNotes = (
    sessionId: string,
    exerciseId: string,
    setId: string,
    notes: string
  ) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              exercises: session.exercises.map((we) =>
                we.id === exerciseId
                  ? {
                      ...we,
                      sets: we.sets.map((set) =>
                        set.id === setId ? { ...set, notes } : set
                      ),
                    }
                  : we
              ),
            }
          : session
      )
    );
  };

  // Remove exercise from session
  const removeSessionExercise = (sessionId: string, exerciseId: string) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              exercises: session.exercises.filter((we) => we.id !== exerciseId),
            }
          : session
      )
    );
  };

  // Remove entire session
  const removeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
  };

  // Remove exercise from workout
  const removeWorkoutExercise = (exerciseId: string) => {
    setWorkoutExercises((prev) => prev.filter((we) => we.id !== exerciseId));
    if (selectedWorkoutExercise?.id === exerciseId) {
      setSelectedWorkoutExercise(null);
    }
  };

  // Handle session drag end
  const handleSessionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId.startsWith("session-") && overId.startsWith("session-")) {
      const activeSessionId = activeId.replace("session-", "");
      const overSessionId = overId.replace("session-", "");

      setSessions((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === activeSessionId);
        const newIndex = prev.findIndex((s) => s.id === overSessionId);

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(prev, oldIndex, newIndex);
        }
        return prev;
      });
    }
  };

  // Handle exercise drag end within sessions
  const handleSessionExerciseDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId.startsWith("exercise-") && overId.startsWith("exercise-")) {
      const activeExerciseId = activeId.replace("exercise-", "");
      const overExerciseId = overId.replace("exercise-", "");

      setSessions((prev) => {
        return prev.map((session) => {
          const exerciseIndex = session.exercises.findIndex(
            (e) => e.id === activeExerciseId
          );
          const overExerciseIndex = session.exercises.findIndex(
            (e) => e.id === overExerciseId
          );

          if (exerciseIndex !== -1 && overExerciseIndex !== -1) {
            const newExercises = arrayMove(
              session.exercises,
              exerciseIndex,
              overExerciseIndex
            );
            return { ...session, exercises: newExercises };
          }
          return session;
        });
      });
    }
  };

  // Handle workout exercise drag end
  const handleWorkoutExerciseDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    if (
      activeId.startsWith("workout-exercise-") &&
      overId.startsWith("workout-exercise-")
    ) {
      const activeExerciseId = activeId.replace("workout-exercise-", "");
      const overExerciseId = overId.replace("workout-exercise-", "");

      setWorkoutExercises((prev) => {
        const oldIndex = prev.findIndex((e) => e.id === activeExerciseId);
        const newIndex = prev.findIndex((e) => e.id === overExerciseId);

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(prev, oldIndex, newIndex);
        }
        return prev;
      });
    }
  };

  // ===== SUPABASE CRUD OPERATIONS =====

  // Calculate total workout duration and format it
  // Format manual workout duration
  const formatWorkoutDuration = (): string => {
    const { hours, minutes } = workoutDuration;
    if (hours === 0 && minutes === 0) {
      return "0 minutes";
    } else if (hours === 0) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    } else if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    } else {
      return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${
        minutes !== 1 ? "s" : ""
      }`;
    }
  };

  // Create a new workout
  const createWorkout = async (): Promise<string | null> => {
    if (!user) {
      console.error("User not authenticated");
      return null;
    }

    try {
      setSaving(true);

      const workoutData: WorkoutInsert = {
        name: workoutName,
        coach_id: user.id,
        lastModified: new Date().toISOString(),
        duration: formatWorkoutDuration(),
        difficulty: workoutDifficulty,
        equipment: workoutEquipment.join(", "),
      };

      const { data: workout, error } = await supabase
        .from("workouts")
        .insert(workoutData)
        .select()
        .single();

      if (error) {
        console.error("Error creating workout:", error);
        return null;
      }

      setCurrentWorkout(workout);
      return workout.id;
    } catch (error) {
      console.error("Error creating workout:", error);
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Save workout blocks and exercise sets
  const saveWorkoutStructure = async (workoutId: string) => {
    if (!user) {
      console.error("User not authenticated");
      return false;
    }

    try {
      setSaving(true);

      // Convert sessions to workout blocks
      console.log("Sessions to save:", sessions);
      console.log("Sessions length:", sessions.length);

      if (sessions.length === 0) {
        console.error(
          "No sessions to save - this will cause the database insert to fail"
        );
        return false;
      }

      const blocksToInsert: WorkoutBlockInsert[] = sessions.map(
        (session, index) => ({
          workout_id: workoutId,
          name: session.name,
          type: session.type,
          order_index: index,
        })
      );

      // Insert workout blocks
      console.log("Inserting workout blocks:", blocksToInsert);
      const { data: blocks, error: blocksError } = await supabase
        .from("workout_blocks")
        .insert(blocksToInsert)
        .select();

      if (blocksError) {
        console.error("Error creating workout blocks:", blocksError);
        console.error("Blocks that failed to insert:", blocksToInsert);
        return false;
      }

      console.log("Successfully inserted workout blocks:", blocks);

      // Convert exercise sets to database format
      const setsToInsert: ExerciseSetInsert[] = [];

      sessions.forEach((session, sessionIndex) => {
        const block = blocks?.find((b) => b.order_index === sessionIndex);
        if (!block) {
          console.error(`No block found for session index ${sessionIndex}`);
          return;
        }

        session.exercises.forEach((exercise, exerciseIndex) => {
          exercise.sets.forEach((set, setIndex) => {
            // Map set type to database enum values
            const mapSetTypeToDatabase = (type: SetType): string => {
              switch (type) {
                case "normal":
                  return "work";
                case "warmup":
                  return "warmup";
                case "burnout":
                  return "burnout";
                case "dropset":
                  return "dropset";
                default:
                  return "work"; // fallback
              }
            };

            // Store set names in the notes field
            const notes = set.notes || null;

            const setData: ExerciseSetInsert = {
              workout_block_id: block.id,
              exercise_id: exercise.exercise.id,
              exercise_name: exercise.exercise.name,
              set_number: setIndex + 1,
              set_type: mapSetTypeToDatabase(set.type),
              reps: set.reps || null,
              weight: set.weight || null,
              rest_seconds: set.rest,
              notes: notes,
            };

            // Validate required fields
            if (
              !setData.workout_block_id ||
              !setData.exercise_id ||
              !setData.exercise_name
            ) {
              console.error("Invalid set data:", setData);
              return;
            }

            setsToInsert.push(setData);
          });
        });
      });

      console.log("Prepared exercise sets for insertion:", setsToInsert);

      // Insert exercise sets
      if (setsToInsert.length > 0) {
        console.log("Inserting exercise sets:", setsToInsert);
        const { data: insertedSets, error: setsError } = await supabase
          .from("exercise_sets")
          .insert(setsToInsert)
          .select();

        if (setsError) {
          console.error("Error creating exercise sets:", setsError);
          console.error("Sets that failed to insert:", setsToInsert);
          return false;
        }

        console.log("Successfully inserted exercise sets:", insertedSets);
      }

      return true;
    } catch (error) {
      console.error("Error saving workout structure:", error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Load workout from database
  const loadWorkout = async (workoutId: string) => {
    if (!user) {
      console.error("User not authenticated");
      return false;
    }

    try {
      setLoadingWorkout(true);

      // Load workout
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .select("*")
        .eq("id", workoutId)
        .single();

      if (workoutError) {
        console.error("Error loading workout:", workoutError);
        return false;
      }

      setCurrentWorkout(workout);
      setWorkoutName(workout.name ?? "Workout Name");
      setWorkoutDifficulty(workout.difficulty ?? "Beginner");
      setWorkoutEquipment(
        workout.equipment
          ? workout.equipment
              .split(", ")
              .filter((item: string) => item.trim() !== "")
          : []
      );
      setWorkoutDescription(workout.description ?? "");
      setWorkoutCoverPhoto(workout.cover_photo);

      // Parse duration from database format (e.g., "1 hour 30 minutes")
      const durationMatch =
        workout.duration?.match(/(\d+)\s*hour(?:s)?\s*(\d+)\s*minute(?:s)?/) ||
        workout.duration?.match(/(\d+)\s*hour(?:s)?/) ||
        workout.duration?.match(/(\d+)\s*minute(?:s)?/) ||
        // Fallback for old format
        workout.duration?.match(/(\d+)\s*hr\s*(\d+)\s*min/) ||
        workout.duration?.match(/(\d+)\s*hr/) ||
        workout.duration?.match(/(\d+)\s*min/);
      if (durationMatch) {
        if (durationMatch[2]) {
          // Format: "1 hour 30 minutes" or "1 hr 30 min"
          setWorkoutDuration({
            hours: parseInt(durationMatch[1]),
            minutes: parseInt(durationMatch[2]),
          });
        } else if (
          workout.duration?.includes("hour") ||
          workout.duration?.includes("hr")
        ) {
          // Format: "1 hour" or "1 hr"
          setWorkoutDuration({ hours: parseInt(durationMatch[1]), minutes: 0 });
        } else {
          // Format: "30 minutes" or "30 min"
          setWorkoutDuration({ hours: 0, minutes: parseInt(durationMatch[1]) });
        }
      } else {
        setWorkoutDuration({ hours: 0, minutes: 0 });
      }

      // Load workout blocks
      const { data: blocks, error: blocksError } = await supabase
        .from("workout_blocks")
        .select("*")
        .eq("workout_id", workoutId)
        .order("order_index");

      if (blocksError) {
        console.error("Error loading workout blocks:", blocksError);
        return false;
      }

      setWorkoutBlocks(blocks || []);

      // Load exercise sets
      const { data: sets, error: setsError } = await supabase
        .from("exercise_sets")
        .select("*")
        .in("workout_block_id", blocks?.map((b) => b.id) || []);

      if (setsError) {
        console.error("Error loading exercise sets:", setsError);
        return false;
      }

      setExerciseSets(sets || []);

      // Convert database structure back to component state
      const loadedSessions: Session[] =
        blocks?.map((block) => {
          const blockSets =
            sets?.filter((s) => s.workout_block_id === block.id) || [];

          // Group sets by exercise
          const exerciseGroups = new Map<string, DatabaseExerciseSet[]>();
          blockSets.forEach((set) => {
            const exerciseId = set.exercise_id || "unknown";
            if (!exerciseGroups.has(exerciseId)) {
              exerciseGroups.set(exerciseId, []);
            }
            exerciseGroups.get(exerciseId)!.push(set);
          });

          const sessionExercises: WorkoutExercise[] = Array.from(
            exerciseGroups.entries()
          ).map(([exerciseId, exerciseSets]) => {
            const exercise = exercises.find((e) => e.id === exerciseId);
            if (!exercise) {
              // Create a placeholder exercise if not found
              const firstSet = exerciseSets[0];
              const placeholderExercise: Exercise = {
                id: exerciseId,
                name: firstSet.exercise_name || "Unknown Exercise",
                video_url_1: null,
                video_url_2: null,
                image: null,
                difficulty: null,
                equipment: null,
                exercise_type: null,
                muscles_trained: null,
                instructions: null,
                cues_and_tips: null,
                is_active: true,
                is_global: true,
                coach_id: null,
              };

              // Map database set type back to component type
              const mapDatabaseSetTypeToComponent = (
                dbType: string
              ): SetType => {
                switch (dbType) {
                  case "work":
                    return "normal";
                  case "warmup":
                    return "warmup";
                  case "burnout":
                    return "burnout";
                  case "dropset":
                    return "dropset";
                  default:
                    return "normal";
                }
              };

              return {
                id: exerciseId,
                exercise: placeholderExercise,
                sets: exerciseSets.map((set) => ({
                  id: set.id,
                  type: mapDatabaseSetTypeToComponent(set.set_type || "work"),
                  setNumber: set.set_number,
                  time: 0, // Not stored in database
                  rest: set.rest_seconds || 0,
                  weight: set.weight || undefined,
                  reps: set.reps || undefined,
                  notes: set.notes || undefined,
                })),
                instructions: "",
              };
            }

            // Get exercise instructions from the exercise library
            const exerciseInstructions = exercise.instructions || "";

            return {
              id: exerciseId,
              exercise,
              sets: exerciseSets.map((set) => ({
                id: set.id,
                type: (set.set_type as SetType) || "normal",
                setNumber: set.set_number,
                time: 0, // Not stored in database
                rest: set.rest_seconds || 0,
                weight: set.weight || undefined,
                reps: set.reps || undefined,
                notes: set.notes || undefined,
              })),
              instructions: exerciseInstructions,
            };
          });

          return {
            id: block.id,
            type: (block.type as SessionType) || "normal",
            name: block.name || "Session",
            exercises: sessionExercises,
          };
        }) || [];

      setSessions(loadedSessions);

      return true;
    } catch (error) {
      console.error("Error loading workout:", error);
      return false;
    } finally {
      setLoadingWorkout(false);
    }
  };

  // Load workout for duplication (same as loadWorkout but clears the current workout ID)
  const loadWorkoutForDuplication = async (workoutId: string) => {
    if (!user) {
      console.error("User not authenticated");
      return false;
    }

    try {
      setLoadingWorkout(true);

      // Load workout
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .select("*")
        .eq("id", workoutId)
        .single();

      if (workoutError) {
        console.error("Error loading workout:", workoutError);
        return false;
      }

      // Clear the current workout ID so it creates a new workout when saved
      setCurrentWorkout(null);
      setWorkoutName((workout.name ?? "Workout Name") + " (Copy)");
      setWorkoutDifficulty(workout.difficulty ?? "Beginner");
      setWorkoutEquipment(
        workout.equipment
          ? workout.equipment
              .split(", ")
              .filter((item: string) => item.trim() !== "")
          : []
      );
      setWorkoutDescription(workout.description ?? "");
      setWorkoutCoverPhoto(workout.cover_photo);

      // Parse duration from database format (e.g., "1 hour 30 minutes")
      const durationMatch =
        workout.duration?.match(/(\d+)\s*hour(?:s)?\s*(\d+)\s*minute(?:s)?/) ||
        workout.duration?.match(/(\d+)\s*hour(?:s)?/) ||
        workout.duration?.match(/(\d+)\s*minute(?:s)?/) ||
        // Fallback for old format
        workout.duration?.match(/(\d+)\s*hr\s*(\d+)\s*min/) ||
        workout.duration?.match(/(\d+)\s*hr/) ||
        workout.duration?.match(/(\d+)\s*min/);
      if (durationMatch) {
        if (durationMatch[2]) {
          // Format: "1 hour 30 minutes" or "1 hr 30 min"
          setWorkoutDuration({
            hours: parseInt(durationMatch[1]),
            minutes: parseInt(durationMatch[2]),
          });
        } else if (
          workout.duration?.includes("hour") ||
          workout.duration?.includes("hr")
        ) {
          // Format: "1 hour" or "1 hr"
          setWorkoutDuration({ hours: parseInt(durationMatch[1]), minutes: 0 });
        } else {
          // Format: "30 minutes" or "30 min"
          setWorkoutDuration({ hours: 0, minutes: parseInt(durationMatch[1]) });
        }
      } else {
        setWorkoutDuration({ hours: 0, minutes: 0 });
      }

      // Load workout blocks
      const { data: blocks, error: blocksError } = await supabase
        .from("workout_blocks")
        .select("*")
        .eq("workout_id", workoutId)
        .order("order_index");

      if (blocksError) {
        console.error("Error loading workout blocks:", blocksError);
        return false;
      }

      setWorkoutBlocks(blocks || []);

      // Load exercise sets
      const { data: sets, error: setsError } = await supabase
        .from("exercise_sets")
        .select("*")
        .in("workout_block_id", blocks?.map((b) => b.id) || []);

      if (setsError) {
        console.error("Error loading exercise sets:", setsError);
        return false;
      }

      setExerciseSets(sets || []);

      // Convert database structure back to component state (same as loadWorkout)
      const loadedSessions: Session[] =
        blocks?.map((block) => {
          const blockSets =
            sets?.filter((s) => s.workout_block_id === block.id) || [];

          // Group sets by exercise
          const exerciseGroups = new Map<string, DatabaseExerciseSet[]>();
          blockSets.forEach((set) => {
            const exerciseId = set.exercise_id || "unknown";
            if (!exerciseGroups.has(exerciseId)) {
              exerciseGroups.set(exerciseId, []);
            }
            exerciseGroups.get(exerciseId)!.push(set);
          });

          const sessionExercises: WorkoutExercise[] = Array.from(
            exerciseGroups.entries()
          ).map(([exerciseId, exerciseSets]) => {
            const exercise = exercises.find((e) => e.id === exerciseId);
            if (!exercise) {
              // Create a placeholder exercise if not found
              const firstSet = exerciseSets[0];
              const placeholderExercise: Exercise = {
                id: exerciseId,
                name: firstSet.exercise_name || "Unknown Exercise",
                video_url_1: null,
                video_url_2: null,
                image: null,
                difficulty: null,
                equipment: null,
                exercise_type: null,
                muscles_trained: null,
                instructions: null,
                cues_and_tips: null,
                is_active: true,
                is_global: true,
                coach_id: null,
              };

              // Map database set type back to component type
              const mapDatabaseSetTypeToComponent = (
                dbType: string
              ): SetType => {
                switch (dbType) {
                  case "work":
                    return "normal";
                  case "warmup":
                    return "warmup";
                  case "burnout":
                    return "burnout";
                  case "dropset":
                    return "dropset";
                  default:
                    return "normal";
                }
              };

              // For placeholder exercises, we don't have exercise instructions from the library
              // So we'll use empty instructions
              const exerciseInstructions = "";

              // Extract set-specific notes from the notes field
              const setNotes = exerciseSets.map(
                (set) => set.notes || undefined
              );

              return {
                id: exerciseId,
                exercise: placeholderExercise,
                sets: exerciseSets.map((set, setIndex) => ({
                  id: set.id,
                  type: mapDatabaseSetTypeToComponent(set.set_type || "work"),
                  setNumber: set.set_number,
                  time: 0, // Not stored in database
                  rest: set.rest_seconds || 0,
                  weight: set.weight || undefined,
                  reps: set.reps || undefined,
                  notes: set.notes || undefined,
                })),
                instructions: exerciseInstructions,
              };
            }

            // Get exercise instructions from the exercise library
            const exerciseInstructions = exercise.instructions || "";

            return {
              id: exerciseId,
              exercise,
              sets: exerciseSets.map((set) => ({
                id: set.id,
                type: (set.set_type as SetType) || "normal",
                setNumber: set.set_number,
                time: 0, // Not stored in database
                rest: set.rest_seconds || 0,
                weight: set.weight || undefined,
                reps: set.reps || undefined,
                notes: set.notes || undefined,
              })),
              instructions: exerciseInstructions,
            };
          });

          return {
            id: block.id,
            type: (block.type as SessionType) || "normal",
            name: block.name || "Session",
            exercises: sessionExercises,
          };
        }) || [];

      setSessions(loadedSessions);

      return true;
    } catch (error) {
      console.error("Error loading workout for duplication:", error);
      return false;
    } finally {
      setLoadingWorkout(false);
    }
  };

  // Save current workout
  const saveWorkout = async () => {
    if (!user) {
      console.error("User not authenticated");
      return false;
    }

    try {
      setSaving(true);

      let workoutId = currentWorkout?.id;

      // Create new workout if none exists
      if (!workoutId) {
        const newWorkoutId = await createWorkout();
        if (!newWorkoutId) return false;
        workoutId = newWorkoutId;
      }

      // Update workout name and duration
      const updateData: WorkoutUpdate = {
        name: workoutName || null,
        lastModified: new Date().toISOString(),
        duration: formatWorkoutDuration(),
        difficulty: workoutDifficulty,
        equipment: workoutEquipment.join(", "),
        description: workoutDescription || null,
        cover_photo: workoutCoverPhoto,
      };

      const { error } = await supabase
        .from("workouts")
        .update(updateData)
        .eq("id", workoutId);

      if (error) {
        console.error("Error updating workout:", error);
        return false;
      }

      // Delete existing blocks and sets
      if (currentWorkout) {
        const { error: deleteSetsError } = await supabase
          .from("exercise_sets")
          .delete()
          .in(
            "workout_block_id",
            workoutBlocks.map((b) => b.id)
          );

        const { error: deleteBlocksError } = await supabase
          .from("workout_blocks")
          .delete()
          .eq("workout_id", workoutId);

        if (deleteSetsError || deleteBlocksError) {
          console.error(
            "Error deleting existing workout structure:",
            deleteSetsError || deleteBlocksError
          );
          return false;
        }
      }

      // Save new structure
      const success = await saveWorkoutStructure(workoutId);

      if (success) {
        const message = editWorkoutId
          ? "Workout updated successfully!"
          : duplicateWorkoutId
          ? "Workout duplicated successfully!"
          : "Workout saved successfully!";
        addToast({
          type: "success",
          message,
          duration: 3000,
        });
      } else {
        addToast({
          type: "error",
          message: "Failed to save workout. Please try again.",
          duration: 4000,
        });
      }

      return success;
    } catch (error) {
      console.error("Error saving workout:", error);
      addToast({
        type: "error",
        message: "An error occurred while saving the workout.",
        duration: 4000,
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Delete workout
  // const deleteWorkout = async (workoutId: string) => {
  //   if (!user) {
  //     console.error("User not authenticated");
  //     return false;
  //   }

  //   try {
  //     setSaving(true);

  //     // Delete exercise sets
  //     const { error: deleteSetsError } = await supabase
  //       .from("exercise_sets")
  //       .delete()
  //       .in(
  //         "workout_block_id",
  //         workoutBlocks.map((b) => b.id)
  //       );

  //     // Delete workout blocks
  //     const { error: deleteBlocksError } = await supabase
  //       .from("workout_blocks")
  //       .delete()
  //       .eq("workout_id", workoutId);

  //     // Delete workout
  //     const { error: deleteWorkoutError } = await supabase
  //       .from("workouts")
  //       .delete()
  //       .eq("id", workoutId);

  //     if (deleteSetsError || deleteBlocksError || deleteWorkoutError) {
  //       console.error(
  //         "Error deleting workout:",
  //         deleteSetsError || deleteBlocksError || deleteWorkoutError
  //       );
  //       return false;
  //     }

  //     // Reset state
  //     setCurrentWorkout(null);
  //     setWorkoutBlocks([]);
  //     setExerciseSets([]);
  //     setSessions([]);
  //     setWorkoutName("Workout Name");

  //     return true;
  //   } catch (error) {
  //     console.error("Error deleting workout:", error);
  //     return false;
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  // Transform AI-processed workout data into workout builder format
  const populateWorkoutBuilder = (processedWorkout: ProcessedWorkout) => {
    try {
      // Set workout metadata
      if (processedWorkout.metadata.title) {
        setWorkoutName(processedWorkout.metadata.title);
      }
      if (processedWorkout.metadata.difficulty) {
        setWorkoutDifficulty(processedWorkout.metadata.difficulty);
      }
      if (processedWorkout.metadata.equipment) {
        setWorkoutEquipment(processedWorkout.metadata.equipment);
      }
      if (processedWorkout.metadata.description) {
        setWorkoutDescription(processedWorkout.metadata.description);
      }
      if (processedWorkout.metadata.duration) {
        // Parse duration and set workout duration
        const durationMatch =
          processedWorkout.metadata.duration.match(/(\d+)\s*min/);
        if (durationMatch) {
          const minutes = parseInt(durationMatch[1]);
          setWorkoutDuration({
            hours: Math.floor(minutes / 60),
            minutes: minutes % 60,
          });
        }
      }

      // Collect ALL exercises from all blocks (both matched and unmatched)
      const allExercisesList: UnmatchedExercise[] = [];
      const unmatchedExercisesList: UnmatchedExercise[] = [];
      const exerciseMapping = new Map<string, string>(); // exercise name -> exercise id
      const newExercisesMap = new Map<string, any>(); // exercise name -> new exercise data

      // Collect all exercises from all blocks
      processedWorkout.blocks.forEach((block) => {
        block.exercises.forEach((exercise) => {
          // Check if we haven't already added this exercise to the list
          if (!allExercisesList.find((u) => u.name === exercise.name)) {
            // Check if exercise exists in our library
            const matchedExercise = exercises.find(
              (e) =>
                e.name.toLowerCase().includes(exercise.name.toLowerCase()) ||
                exercise.name.toLowerCase().includes(e.name.toLowerCase())
            );

            // Add to all exercises list
            allExercisesList.push({
              name: exercise.name,
              instructions: exercise.instructions,
              suggestedMatches: exercises
                .filter(
                  (e) =>
                    e.name
                      .toLowerCase()
                      .includes(exercise.name.toLowerCase()) ||
                    exercise.name.toLowerCase().includes(e.name.toLowerCase())
                )
                .slice(0, 5),
            });

            if (!matchedExercise) {
              // Add to unmatched list
              unmatchedExercisesList.push({
                name: exercise.name,
                instructions: exercise.instructions,
                suggestedMatches: exercises
                  .filter(
                    (e) =>
                      e.name
                        .toLowerCase()
                        .includes(exercise.name.toLowerCase()) ||
                      exercise.name.toLowerCase().includes(e.name.toLowerCase())
                  )
                  .slice(0, 5),
              });
            } else {
              exerciseMapping.set(exercise.name, matchedExercise.id);
            }
          }
        });
      });

      // Show the matching modal with ALL exercises (we'll auto-match inside the modal)
      setUnmatchedExercises(allExercisesList);
      setProcessedWorkout(processedWorkout);
      setShowExerciseMatching(true);
    } catch (error) {
      console.error("Error populating workout builder:", error);
      addToast({
        type: "error",
        message: "Failed to import workout. Please try again.",
        duration: 4000,
      });
    }
  };

  const populateWorkoutWithMappings = (
    processedWorkout: ProcessedWorkout,
    exerciseMapping: Map<string, string>,
    newExercisesMap: Map<string, any>
  ) => {
    try {
      console.log("Exercise mapping:", Array.from(exerciseMapping.entries()));
      console.log("New exercises map:", Array.from(newExercisesMap.entries()));
      console.log("Processed workout blocks:", processedWorkout.blocks);
      // Transform blocks to sessions
      const transformedSessions: Session[] = processedWorkout.blocks
        .map((block, index) => {
          // Transform exercises to workout exercises, but only include matched ones
          const workoutExercises: WorkoutExercise[] = block.exercises
            .filter((exercise) => {
              // Only include exercises that have mappings (matched or newly created)
              const mappedExerciseId = exerciseMapping.get(exercise.name);
              const newExercise = newExercisesMap.get(exercise.name);
              const hasMapping = mappedExerciseId || newExercise;

              if (!hasMapping) {
                console.warn(
                  `Exercise "${exercise.name}" has no mapping and will be skipped`
                );
              }

              return hasMapping;
            })
            .map((exercise) => {
              // Get the mapped exercise or new exercise
              const mappedExerciseId = exerciseMapping.get(exercise.name);
              const newExercise = newExercisesMap.get(exercise.name);

              let matchedExercise: Exercise;

              if (mappedExerciseId) {
                // Use existing exercise from library
                matchedExercise = exercises.find(
                  (e) => e.id === mappedExerciseId
                )!;
              } else if (newExercise) {
                // Use newly created exercise - find it in the updated exercises list
                const createdExercise = exercises.find(
                  (e) => e.name === newExercise.name
                );
                if (createdExercise) {
                  matchedExercise = createdExercise;
                } else {
                  // Fallback to placeholder exercise
                  matchedExercise = {
                    id: `temp-${Date.now()}`,
                    name: newExercise.name,
                    video_url_1: null,
                    video_url_2: null,
                    image: null,
                    difficulty: newExercise.difficulty,
                    equipment: newExercise.equipment,
                    exercise_type: newExercise.exercise_type,
                    muscles_trained: null,
                    instructions: newExercise.instructions,
                    cues_and_tips: null,
                    is_active: true,
                    is_global: true,
                    coach_id: null,
                  };
                }
              } else {
                // This should never happen due to the filter above, but just in case
                throw new Error(
                  `No mapping found for exercise: ${exercise.name}`
                );
              }

              // Create exercise sets based on duration/rest
              const sets: ExerciseSet[] = [];

              if (exercise.duration) {
                // Parse reps from duration (e.g., "12 reps", "4 reps", "20 reps")
                const repsMatch = exercise.duration.match(/(\d+)\s*reps?/i);
                if (repsMatch) {
                  const reps = parseInt(repsMatch[1]);

                  // Parse weight if mentioned (e.g., "70% 1RM")
                  const weightMatch = exercise.duration.match(/(\d+%)\s*1RM/i);
                  const weight = weightMatch ? weightMatch[1] : "";

                  sets.push({
                    id: `set-${Date.now()}-${Math.random()}`,
                    type: "normal",
                    setNumber: 1,
                    rest: 60, // Default rest
                    weight: weight,
                    reps: reps,
                    notes: exercise.instructions || undefined,
                  });
                } else {
                  // Parse duration (e.g., "1 min", "40 sec")
                  const durationMatch =
                    exercise.duration.match(/(\d+)\s*(min|sec)/);
                  if (durationMatch) {
                    const value = parseInt(durationMatch[1]);
                    const unit = durationMatch[2];
                    const durationSeconds = unit === "min" ? value * 60 : value;

                    sets.push({
                      id: `set-${Date.now()}-${Math.random()}`,
                      type: "normal",
                      setNumber: 1,
                      rest: durationSeconds,
                      weight: "",
                      reps: 0,
                      notes: exercise.instructions || undefined,
                    });
                  }
                }
              }

              // If no duration, create a default set
              if (sets.length === 0) {
                sets.push({
                  id: `set-${Date.now()}-${Math.random()}`,
                  type: "normal",
                  setNumber: 1,
                  rest: 60,
                  weight: "",
                  reps: 0,
                  notes: exercise.instructions || undefined,
                });
              }

              return {
                id: `we-${Date.now()}-${Math.random()}`,
                exercise: matchedExercise,
                sets,
                instructions: exercise.instructions || "",
              };
            });

          // Only create session if it has exercises
          if (workoutExercises.length === 0) {
            console.warn(
              `Block "${block.name}" has no exercises after filtering, skipping`
            );
            return null;
          }

          // Map block type to valid database type
          const mapBlockTypeToValidType = (type: string): SessionType => {
            console.log(`Mapping block type: "${type}"`);

            switch (type.toLowerCase()) {
              case "normal":
              case "regular":
                console.log(`  → Mapped to "normal"`);
                return "normal";
              case "circuit":
              case "amrap":
                console.log(`  → Mapped to "circuit"`);
                return "circuit";
              case "interval":
                // Intervals can be either normal or circuit depending on context
                // For now, default to normal unless it's clearly a circuit
                console.log(`  → Mapped to "normal" (interval)`);
                return "normal";
              case "superset":
                console.log(`  → Mapped to "superset"`);
                return "superset";
              case "warmup":
              case "warm-up":
                console.log(`  → Mapped to "warmup"`);
                return "warmup";
              case "cooldown":
              case "cool-down":
                console.log(`  → Mapped to "cooldown"`);
                return "cooldown";
              default:
                console.warn(
                  `Unknown block type "${type}", defaulting to "normal"`
                );
                return "normal";
            }
          };

          console.log(
            `Creating session for block: "${block.name}" with type: "${block.type}"`
          );
          const mappedType = mapBlockTypeToValidType(block.type);
          console.log(`Final mapped type: "${mappedType}"`);

          return {
            id: `session-${Date.now()}-${index}`,
            type: mapBlockTypeToValidType(block.type),
            name: block.name,
            exercises: workoutExercises,
          };
        })
        .filter((session): session is Session => session !== null);

      // Set the sessions
      console.log("Transformed sessions:", transformedSessions);
      console.log("Transformed sessions length:", transformedSessions.length);

      if (transformedSessions.length === 0) {
        console.error(
          "No sessions created after filtering - all exercises were unmatched"
        );
        addToast({
          type: "error",
          message:
            "No exercises could be matched. Please try matching exercises manually.",
          duration: 4000,
        });
        return;
      }

      setSessions(transformedSessions);

      // Show success message
      addToast({
        type: "success",
        message: "Workout imported successfully!",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error populating workout builder:", error);
      addToast({
        type: "error",
        message: "Failed to import workout. Please try again.",
        duration: 4000,
      });
    }
  };

  const handleGenerateWorkout = async () => {
    if (!aiWorkoutText.trim()) return;

    try {
      setIsGeneratingWorkout(true);

      const response = await fetch("/api/generate-workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: aiWorkoutText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate workout");
      }

      const data = await response.json();

      if (data.success) {
        // Use the same workflow as PDF import
        populateWorkoutBuilder(data.data);
        setShowAiWorkoutModal(false);
        setAiWorkoutText("");
        addToast({
          type: "success",
          message:
            "Workout generated successfully! Please review and map exercises.",
          duration: 4000,
        });
      } else {
        throw new Error(data.error || "Failed to generate workout");
      }
    } catch (error) {
      console.error("Error generating workout:", error);
      addToast({
        type: "error",
        message: "Failed to generate workout. Please try again.",
        duration: 4000,
      });
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            {exerciseFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => handleFilterChange(filter.label)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedFilter === filter.label
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">
              <MagnifierIcon />
            </span>
            <input
              type="text"
              placeholder="Search for your Exercises"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="absolute right-3 top-3 text-gray-400">
              <FilterIcon />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className={`exercise-card bg-white border ${
                    selectedExercise?.id === exercise.id
                      ? "border-blue-500"
                      : "border-gray-200"
                  } rounded-lg p-2 cursor-pointer hover:border-blue-300 transition-colors`}
                  onClick={() => handleExerciseSelect(exercise)}
                >
                  <div className="w-full h-16 bg-gray-900 rounded relative mb-2 flex-shrink-0">
                    <img
                      className="w-full h-full object-cover rounded"
                      src={
                        exercise.video_url_1
                          ? getThumbnailUrl(exercise.video_url_1)
                          : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EExercise%3C/text%3E%3C/svg%3E"
                      }
                      alt={exercise.name}
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EExercise%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    {exercise.video_url_1 && (
                      <div className="absolute top-1 left-1 bg-black bg-opacity-50 rounded-full w-4 h-4 flex items-center justify-center">
                        <PlayIcon />
                      </div>
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-medium ${
                        selectedExercise?.id === exercise.id
                          ? "text-blue-600"
                          : "text-gray-900"
                      }`}
                    >
                      {exercise.name}
                    </p>
                    {exercise.difficulty && (
                      <p className="text-xs text-gray-400 capitalize">
                        {exercise.difficulty}
                      </p>
                    )}
                    {exercise.equipment && (
                      <p className="text-xs text-gray-400">
                        {exercise.equipment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {filteredExercises.length === 0 && !loading && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  {searchQuery
                    ? "No exercises found matching your search."
                    : "No exercises available."}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main workout area */}
      <main className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200">
          {/* Header with workout name and expand/collapse */}
          <div className="p-6 border-b border-gray-100">
            {/* First row: Workout title and action buttons */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 flex-1">
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 w-full"
                  placeholder="Enter workout name..."
                />
                {editWorkoutId && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Editing
                  </span>
                )}
                {duplicateWorkoutId && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Duplicating
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() =>
                    setIsWorkoutDetailsExpanded(!isWorkoutDetailsExpanded)
                  }
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span>
                    {isWorkoutDetailsExpanded ? "Hide Details" : "Show Details"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isWorkoutDetailsExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={saveWorkout}
                  disabled={saving}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {saving
                    ? "Saving..."
                    : editWorkoutId
                    ? "Update Workout"
                    : duplicateWorkoutId
                    ? "Save as New"
                    : "Save Workout"}
                </button>

                {/* {currentWorkout && (
                  <button
                    onClick={() => deleteWorkout(currentWorkout.id)}
                    disabled={saving}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {saving ? "Deleting..." : "Delete"}
                  </button>
                )} */}
              </div>
            </div>

            {/* Second row: AI-powered buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPdfUpload(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span>Import from PDF</span>
                <span className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full">
                  ✨ AI
                </span>
              </button>

              <button
                onClick={() => setShowAiWorkoutModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>Generate with AI</span>
                <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                  🎤 Voice
                </span>
              </button>
            </div>
          </div>

          {/* Expandable workout details */}
          {isWorkoutDetailsExpanded && (
            <div className="p-6 bg-gray-50">
              <div className="max-w-4xl mx-auto">
                {loadingWorkout ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="text-gray-600 text-sm">
                        Loading workout details...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left column */}
                    <div className="space-y-6">
                      {/* Difficulty */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Difficulty Level
                        </label>
                        <select
                          value={workoutDifficulty}
                          onChange={(e) => setWorkoutDifficulty(e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>

                      {/* Equipment */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Equipment Required
                        </label>
                        <div className="relative equipment-dropdown">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === "equipment"
                                  ? null
                                  : "equipment"
                              )
                            }
                            className="w-full text-sm border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex items-center justify-between transition-colors"
                          >
                            <span
                              className={
                                workoutEquipment.length === 0
                                  ? "text-gray-500"
                                  : "text-gray-900"
                              }
                            >
                              {workoutEquipment.length === 0
                                ? "Select equipment..."
                                : `${workoutEquipment.length} selected`}
                            </span>
                            <svg
                              className="w-4 h-4 ml-2 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {openDropdown === "equipment" && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              <div className="p-2">
                                {[
                                  "Dumbbells",
                                  "Barbell",
                                  "Kettlebell",
                                  "Resistance Bands",
                                  "Pull-up Bar",
                                  "Bench",
                                  "Squat Rack",
                                  "Cable Machine",
                                  "Treadmill",
                                  "Elliptical",
                                  "Rowing Machine",
                                  "Medicine Ball",
                                  "Foam Roller",
                                  "Yoga Mat",
                                  "None",
                                ].map((equipment) => (
                                  <label
                                    key={equipment}
                                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={workoutEquipment.includes(
                                        equipment
                                      )}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setWorkoutEquipment([
                                            ...workoutEquipment,
                                            equipment,
                                          ]);
                                        } else {
                                          setWorkoutEquipment(
                                            workoutEquipment.filter(
                                              (item) => item !== equipment
                                            )
                                          );
                                        }
                                      }}
                                      className="mr-3"
                                    />
                                    <span className="text-sm text-gray-700">
                                      {equipment}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cover Photo */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Cover Photo URL
                        </label>
                        <input
                          type="url"
                          value={workoutCoverPhoto || ""}
                          onChange={(e) =>
                            setWorkoutCoverPhoto(e.target.value || null)
                          }
                          placeholder="Enter image URL..."
                          className="w-full text-sm border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                        {workoutCoverPhoto && (
                          <div className="mt-2">
                            <img
                              src={workoutCoverPhoto}
                              alt="Workout cover preview"
                              className="w-full h-24 object-cover rounded-lg border border-gray-300"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Duration */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Workout Duration
                        </label>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <select
                              value={workoutDuration.hours}
                              onChange={(e) =>
                                setWorkoutDuration((prev) => ({
                                  ...prev,
                                  hours: parseInt(e.target.value),
                                }))
                              }
                              className="w-full text-sm border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              {Array.from({ length: 13 }, (_, i) => (
                                <option key={i} value={i}>
                                  {i} hour{i !== 1 ? "s" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <select
                              value={workoutDuration.minutes}
                              onChange={(e) =>
                                setWorkoutDuration((prev) => ({
                                  ...prev,
                                  minutes: parseInt(e.target.value),
                                }))
                              }
                              className="w-full text-sm border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              {Array.from({ length: 60 }, (_, i) => (
                                <option key={i} value={i}>
                                  {i} minute{i !== 1 ? "s" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                      {/* Description */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Workout Description
                        </label>
                        <textarea
                          value={workoutDescription}
                          onChange={(e) =>
                            setWorkoutDescription(e.target.value)
                          }
                          placeholder="Enter workout description..."
                          rows={8}
                          className="w-full text-sm border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 flex p-6 overflow-y-auto">
          <div className="w-full max-w-3xl mx-auto space-y-6 h-full">
            {loadingWorkout ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="text-gray-600 text-lg">
                    Loading workout...
                  </span>
                </div>
              </div>
            ) : selectedWorkoutExercise ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-900 rounded-lg flex-shrink-0">
                    <img
                      className="w-full h-full object-cover rounded-lg"
                      src={
                        selectedWorkoutExercise.exercise.video_url_1
                          ? getThumbnailUrl(
                              selectedWorkoutExercise.exercise.video_url_1
                            )
                          : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EExercise%3C/text%3E%3C/svg%3E"
                      }
                      alt={selectedWorkoutExercise.exercise.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EExercise%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedWorkoutExercise.exercise.name}
                      </h3>
                      <div className="relative dropdown-container">
                        <button
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === "main-exercise"
                                ? null
                                : "main-exercise"
                            )
                          }
                        >
                          <EllipsisIcon />
                        </button>
                        {openDropdown === "main-exercise" && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  removeWorkoutExercise(
                                    selectedWorkoutExercise.id
                                  );
                                  setOpenDropdown(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete Exercise
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sets Table */}
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 text-gray-600">#</th>
                            <th className="text-left py-2 text-gray-600">
                              Exercise
                            </th>
                            <th className="text-left py-2 text-gray-600">
                              Rest
                            </th>
                            <th className="text-left py-2 text-gray-600">
                              Weight
                            </th>
                            <th className="text-left py-2 text-gray-600">
                              Reps
                            </th>
                            <th className="text-left py-2 text-gray-600"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedWorkoutExercise.sets.map((set, index) => (
                            <tr
                              key={set.id}
                              className={`${
                                index % 2 === 0 ? "bg-gray-50" : ""
                              } ${
                                selectedSetId === set.id
                                  ? "ring-2 ring-blue-500 bg-blue-50"
                                  : ""
                              } cursor-pointer hover:bg-gray-100`}
                              onClick={() => setSelectedSetId(set.id)}
                            >
                              <td className="py-2">{index + 1}</td>
                              <td className="py-2">
                                <input
                                  type="text"
                                  value={set.notes || ""}
                                  onChange={(e) =>
                                    updateSetNotes(set.id, e.target.value)
                                  }
                                  placeholder="Enter set name..."
                                  className="w-full text-sm border-none outline-none focus:ring-0 bg-transparent px-2 py-1 rounded hover:bg-gray-100 focus:bg-white focus:border focus:border-blue-300"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </td>
                              <td className="py-2">
                                <div className="relative time-picker-container">
                                  <button
                                    className="bg-transparent border-none outline-none focus:ring-0 text-sm text-left w-full py-1 px-2 rounded hover:bg-gray-100"
                                    onClick={() =>
                                      openTimeModal("rest", set.id)
                                    }
                                  >
                                    {formatDuration(set.rest)}
                                  </button>
                                </div>
                              </td>
                              <td className="py-2">
                                <input
                                  type="text"
                                  value={set.weight || ""}
                                  onChange={(e) =>
                                    updateSetWeight(set.id, e.target.value)
                                  }
                                  placeholder="Enter weight..."
                                  className="w-20 text-sm border-none outline-none focus:ring-0 bg-transparent px-2 py-1 rounded hover:bg-gray-100 focus:bg-white focus:border focus:border-blue-300"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </td>
                              <td className="py-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={set.reps || ""}
                                  onChange={(e) =>
                                    updateSetReps(
                                      set.id,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  placeholder="Reps"
                                  className="w-16 text-sm border-none outline-none focus:ring-0 bg-transparent px-2 py-1 rounded hover:bg-gray-100 focus:bg-white focus:border focus:border-blue-300"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </td>
                              <td className="py-2">
                                <button
                                  className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeSet(set.id);
                                  }}
                                >
                                  <MinusIcon />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {selectedWorkoutExercise.sets.length === 0 && (
                            <tr>
                              <td
                                colSpan={4}
                                className="py-4 text-center text-gray-500"
                              >
                                No sets added yet. Use the buttons below to add
                                sets.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Add Set Buttons */}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        onClick={() => addSet("normal")}
                      >
                        + Add Set
                      </button>
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                        onClick={() => addSet("warmup")}
                      >
                        + Add Warm-Up Set
                      </button>
                      <button
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                        onClick={() => addSet("burnout")}
                      >
                        + Add Burnout Set
                      </button>
                      <button
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                        onClick={() => addSet("dropset")}
                      >
                        + Add Dropset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : sessions.length > 0 || workoutExercises.length > 0 ? null : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <p className="text-gray-500">
                  Select an exercise from the left panel to start building your
                  workout
                </p>
              </div>
            )}

            {/* Display all workout exercises */}
            {workoutExercises.map((workoutExercise) => (
              <div
                key={workoutExercise.id}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-900 rounded-lg flex-shrink-0">
                    <img
                      className="w-full h-full object-cover rounded-lg"
                      src={
                        workoutExercise.exercise.video_url_1
                          ? getThumbnailUrl(
                              workoutExercise.exercise.video_url_1
                            )
                          : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EExercise%3C/text%3E%3C/svg%3E"
                      }
                      alt={workoutExercise.exercise.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EExercise%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {workoutExercise.exercise.name}
                      </h3>
                      <div className="relative dropdown-container">
                        <button
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown ===
                                `workout-exercise-${workoutExercise.id}`
                                ? null
                                : `workout-exercise-${workoutExercise.id}`
                            )
                          }
                        >
                          <EllipsisIcon />
                        </button>
                        {openDropdown ===
                          `workout-exercise-${workoutExercise.id}` && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  removeWorkoutExercise(workoutExercise.id);
                                  setOpenDropdown(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete Exercise
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sets Summary */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        {workoutExercise.sets.length} set
                        {workoutExercise.sets.length !== 1 ? "s" : ""}
                        {workoutExercise.sets.length > 0 && (
                          <span className="ml-2">
                            (
                            {
                              workoutExercise.sets.filter(
                                (s) => s.type === "warmup"
                              ).length
                            }{" "}
                            warm-up,
                            {
                              workoutExercise.sets.filter(
                                (s) => s.type === "normal"
                              ).length
                            }{" "}
                            normal,
                            {
                              workoutExercise.sets.filter(
                                (s) => s.type === "dropset"
                              ).length
                            }{" "}
                            dropset)
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Instructions Preview */}
                    {workoutExercise.instructions && (
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-600">
                          {workoutExercise.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Display sessions in main area */}
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`rounded-lg border p-6 cursor-pointer transition-all ${
                  session.type === "normal"
                    ? "bg-white border-gray-200"
                    : session.type === "superset"
                    ? "bg-yellow-100 border-yellow-300"
                    : session.type === "circuit"
                    ? "bg-purple-100 border-purple-300"
                    : session.type === "warmup"
                    ? "bg-orange-100 border-orange-300"
                    : session.type === "cooldown"
                    ? "bg-blue-100 border-blue-300"
                    : "bg-white border-gray-200"
                } ${
                  selectedSessionId === session.id
                    ? "ring-2 ring-blue-500 shadow-lg"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedSessionId(session.id)}
              >
                <div className="flex items-center space-x-2 mb-4">
                  {session.type === "superset" ? (
                    <SupersetIcon />
                  ) : session.type === "circuit" ? (
                    <CircuitIcon />
                  ) : session.type === "warmup" ? (
                    <WarmupIcon />
                  ) : session.type === "cooldown" ? (
                    <CooldownIcon />
                  ) : (
                    <BarsIcon />
                  )}
                  <h2
                    className={`text-xl font-bold ${
                      session.type === "normal"
                        ? "text-gray-800"
                        : session.type === "superset"
                        ? "text-yellow-800"
                        : session.type === "circuit"
                        ? "text-purple-800"
                        : session.type === "warmup"
                        ? "text-orange-800"
                        : session.type === "cooldown"
                        ? "text-blue-800"
                        : "text-gray-800"
                    }`}
                  >
                    {session.name}
                  </h2>
                  {selectedSessionId === session.id && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                      Selected
                    </span>
                  )}
                  <div className="relative ml-auto dropdown-container">
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === `session-header-${session.id}`
                            ? null
                            : `session-header-${session.id}`
                        )
                      }
                    >
                      <EllipsisIcon />
                    </button>
                    {openDropdown === `session-header-${session.id}` && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              removeSession(session.id);
                              setOpenDropdown(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete Session
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  {session.exercises.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">
                        No exercises added to this session yet
                      </p>
                      <p className="text-xs mt-1">
                        {selectedSessionId === session.id
                          ? "Click exercises from the left panel to add them"
                          : "Click this session to select it, then choose exercises from the left panel"}
                      </p>
                    </div>
                  ) : (
                    session.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all ${
                          selectedSessionExerciseId === exercise.id
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setSelectedSessionExerciseId(exercise.id)
                        }
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gray-900 rounded-lg flex-shrink-0">
                            <img
                              className="w-full h-full object-cover rounded-lg"
                              src={
                                exercise.exercise &&
                                exercise.exercise.video_url_1
                                  ? getThumbnailUrl(
                                      exercise.exercise.video_url_1
                                    )
                                  : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EExercise%3C/text%3E%3C/svg%3E"
                              }
                              alt={exercise.exercise.name}
                              onError={(e) => {
                                e.currentTarget.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EExercise%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {exercise.exercise.name}
                              </h3>
                              <div className="relative dropdown-container">
                                <button
                                  className="text-gray-400 hover:text-gray-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdown(
                                      openDropdown ===
                                        `session-exercise-${exercise.id}`
                                        ? null
                                        : `session-exercise-${exercise.id}`
                                    );
                                  }}
                                >
                                  <EllipsisIcon />
                                </button>
                                {openDropdown ===
                                  `session-exercise-${exercise.id}` && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                    <div className="py-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeSessionExercise(
                                            session.id,
                                            exercise.id
                                          );
                                          setOpenDropdown(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                      >
                                        Delete Exercise
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeSession(session.id);
                                          setOpenDropdown(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                      >
                                        Delete Entire Session
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Sets Table for Session Exercise */}
                            <div className="overflow-x-auto mb-4">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 text-gray-600">
                                      #
                                    </th>
                                    <th className="text-left py-2 text-gray-600">
                                      Exercise
                                    </th>
                                    <th className="text-left py-2 text-gray-600">
                                      Rest
                                    </th>
                                    <th className="text-left py-2 text-gray-600">
                                      Weight
                                    </th>
                                    <th className="text-left py-2 text-gray-600">
                                      Reps
                                    </th>
                                    <th className="text-left py-2 text-gray-600"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {exercise.sets.map((set, index) => (
                                    <tr
                                      key={set.id}
                                      className={`${
                                        index % 2 === 0 ? "bg-gray-50" : ""
                                      } ${
                                        selectedSetId === set.id
                                          ? "ring-2 ring-blue-500 bg-blue-50"
                                          : ""
                                      } cursor-pointer hover:bg-gray-100`}
                                      onClick={() => setSelectedSetId(set.id)}
                                    >
                                      <td className="py-2">{index + 1}</td>
                                      <td className="py-2">
                                        <input
                                          type="text"
                                          value={set.notes || ""}
                                          onChange={(e) =>
                                            updateSessionExerciseSetNotes(
                                              session.id,
                                              exercise.id,
                                              set.id,
                                              e.target.value
                                            )
                                          }
                                          placeholder="Enter set name..."
                                          className="w-full text-sm border-none outline-none focus:ring-0 bg-transparent px-2 py-1 rounded hover:bg-gray-100 focus:bg-white focus:border focus:border-blue-300"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </td>
                                      <td className="py-2">
                                        <div className="relative time-picker-container">
                                          <button
                                            className="bg-transparent border-none outline-none focus:ring-0 text-sm text-left w-full py-1 px-2 rounded hover:bg-gray-100"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openTimeModal(
                                                "rest",
                                                set.id,
                                                session.id,
                                                exercise.id
                                              );
                                            }}
                                          >
                                            {formatDuration(set.rest)}
                                          </button>
                                        </div>
                                      </td>
                                      <td className="py-2">
                                        <input
                                          type="text"
                                          value={set.weight || ""}
                                          onChange={(e) =>
                                            updateSessionExerciseSetWeight(
                                              session.id,
                                              exercise.id,
                                              set.id,
                                              e.target.value
                                            )
                                          }
                                          placeholder="Enter weight..."
                                          className="w-20 text-sm border-none outline-none focus:ring-0 bg-transparent px-2 py-1 rounded hover:bg-gray-100 focus:bg-white focus:border focus:border-blue-300"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </td>
                                      <td className="py-2">
                                        <input
                                          type="number"
                                          min="0"
                                          value={set.reps || ""}
                                          onChange={(e) =>
                                            updateSessionExerciseSetReps(
                                              session.id,
                                              exercise.id,
                                              set.id,
                                              parseInt(e.target.value) || 0
                                            )
                                          }
                                          placeholder="Reps"
                                          className="w-16 text-sm border-none outline-none focus:ring-0 bg-transparent px-2 py-1 rounded hover:bg-gray-100 focus:bg-white focus:border focus:border-blue-300"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </td>
                                      <td className="py-2">
                                        <button
                                          className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeSessionExerciseSet(
                                              session.id,
                                              exercise.id,
                                              set.id
                                            );
                                          }}
                                        >
                                          <MinusIcon />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                  {exercise.sets.length === 0 && (
                                    <tr>
                                      <td
                                        colSpan={5}
                                        className="py-4 text-center text-gray-500"
                                      >
                                        No sets added yet. Use the buttons below
                                        to add sets.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>

                            {/* Add Set Buttons for Session Exercise */}
                            <div className="flex items-center space-x-2 mt-2">
                              <button
                                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addSessionExerciseSet(
                                    session.id,
                                    exercise.id,
                                    "normal"
                                  );
                                }}
                              >
                                + Add Set
                              </button>
                              <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addSessionExerciseSet(
                                    session.id,
                                    exercise.id,
                                    "warmup"
                                  );
                                }}
                              >
                                + Add Warm-Up Set
                              </button>
                              <button
                                className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addSessionExerciseSet(
                                    session.id,
                                    exercise.id,
                                    "burnout"
                                  );
                                }}
                              >
                                + Add Burnout Set
                              </button>
                              <button
                                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addSessionExerciseSet(
                                    session.id,
                                    exercise.id,
                                    "dropset"
                                  );
                                }}
                              >
                                + Add Dropset
                              </button>
                            </div>

                            {/* Instructions for Session Exercise */}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Right sidebar: Session Arrangement */}
      <aside className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <DumbbellIcon />
            <span className="font-semibold text-mint-600">
              Session Arrangement
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            onClick={() => addSession("normal")}
          >
            <BarsIcon />
            Normal
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            onClick={() => addSession("superset")}
          >
            <SupersetIcon />
            Superset
          </button>
          <button
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            onClick={() => addSession("circuit")}
          >
            <CircuitIcon />
            Circuit
          </button>
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            onClick={() => addSession("warmup")}
          >
            <WarmupIcon />
            Warmup
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            onClick={() => addSession("cooldown")}
          >
            <CooldownIcon />
            Cooldown
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSessionDragEnd}
        >
          <SortableContext
            items={sessions.map((s) => `session-${s.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {/* Display workout exercises as individual items */}
              {workoutExercises.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleWorkoutExerciseDragEnd}
                >
                  <SortableContext
                    items={workoutExercises.map(
                      (we) => `workout-exercise-${we.id}`
                    )}
                    strategy={verticalListSortingStrategy}
                  >
                    {workoutExercises.map((workoutExercise) => (
                      <SortableExercise
                        key={workoutExercise.id}
                        exercise={workoutExercise}
                        onDelete={() =>
                          removeWorkoutExercise(workoutExercise.id)
                        }
                        isWorkoutExercise={true}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}

              {/* Display sessions */}
              {sessions.map((session) => (
                <SortableSession
                  key={session.id}
                  session={session}
                  isSelected={selectedSessionId === session.id}
                  onSelect={() => setSelectedSessionId(session.id)}
                  onDelete={() => removeSession(session.id)}
                >
                  <div className="space-y-2">
                    {session.exercises.length === 0 ? (
                      <div className="text-center py-2 text-gray-500 text-xs">
                        {selectedSessionId === session.id
                          ? "Click exercises from left panel"
                          : "No exercises added yet"}
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleSessionExerciseDragEnd}
                      >
                        <SortableContext
                          items={session.exercises.map(
                            (e) => `exercise-${e.id}`
                          )}
                          strategy={verticalListSortingStrategy}
                        >
                          {session.exercises.map((exercise) => (
                            <SortableExercise
                              key={exercise.id}
                              exercise={exercise}
                              onDelete={() =>
                                removeSessionExercise(session.id, exercise.id)
                              }
                              sessionId={session.id}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </SortableSession>
              ))}

              {/* Placeholder for when no exercises are added */}
              {workoutExercises.length === 0 && sessions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No exercises added yet</p>
                  <p className="text-xs mt-1">
                    Select exercises from the left panel or add sessions above
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </aside>

      {/* Time Modal */}
      {showTimeModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => {
            setShowTimeModal(false);
            setTimeModalTarget(null);
          }}
        >
          <div
            className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4 shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Set Duration
              </h3>
              <button
                onClick={() => {
                  setShowTimeModal(false);
                  setTimeModalTarget(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Select
              </label>
              <div className="grid grid-cols-3 gap-2">
                {durationOptions.map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => updateDuration(minutes)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {minutes} minute{minutes !== 1 ? "s" : ""}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Duration
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customDuration}
                  onChange={(e) =>
                    setCustomDuration(parseInt(e.target.value) || 5)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter minutes"
                />
                <span className="text-sm text-gray-500">minutes</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowTimeModal(false);
                  setTimeModalTarget(null);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => updateDuration(customDuration)}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Set Duration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Upload Modal */}
      <PdfUploadModal
        isOpen={showPdfUpload}
        onClose={() => setShowPdfUpload(false)}
        onWorkoutProcessed={(workoutData) => {
          setProcessedWorkout(workoutData);
          setShowPdfUpload(false);
          // Process the workout and show exercise matching if needed
          populateWorkoutBuilder(workoutData);
        }}
      />

      {/* Exercise Matching Modal */}
      <ExerciseMatchingModal
        isOpen={showExerciseMatching}
        unmatchedExercises={unmatchedExercises}
        onMatch={(exerciseName, matchedExerciseId) => {
          // Handle exercise matching
          console.log(
            `Matched ${exerciseName} with exercise ID ${matchedExerciseId}`
          );
        }}
        onAddNew={(newExercise, exerciseId) => {
          // Handle adding new exercise
          console.log(
            "Adding new exercise:",
            newExercise,
            "with ID:",
            exerciseId
          );
          // Refresh the exercises list to include the new exercise
          const fetchExercises = async () => {
            try {
              const supabase = createClient();
              const { data, error } = await supabase
                .from("exercise_library")
                .select("*")
                .eq("is_active", true)
                .order("name", { ascending: true });

              if (error) {
                console.error("Error fetching exercises:", error);
                return;
              }

              setExercises(data || []);
              setFilteredExercises(data || []);
            } catch (error) {
              console.error("Error fetching exercises:", error);
            }
          };
          fetchExercises();
        }}
        onComplete={(exerciseMapping, newExercisesMap) => {
          setShowExerciseMatching(false);
          // Populate the workout builder with only matched exercises
          if (processedWorkout) {
            populateWorkoutWithMappings(
              processedWorkout,
              exerciseMapping,
              newExercisesMap
            );
          }
        }}
        onClose={() => {
          setShowExerciseMatching(false);
        }}
      />

      {/* AI Workout Generation Modal */}
      {showAiWorkoutModal && (
        <Dialog open={showAiWorkoutModal} onOpenChange={setShowAiWorkoutModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span>Generate Workout with AI</span>
                <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                  🎤 Voice
                </span>
              </DialogTitle>
              <DialogDescription>
                Describe your workout in natural language. For example: "Add
                pull-ups the first set is 20 reps the second set is 15 reps the
                third set is 10 reps"
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Description
                </label>
                <Textarea
                  value={aiWorkoutText}
                  onChange={(e) => setAiWorkoutText(e.target.value)}
                  placeholder="Describe your workout here... (e.g., 'Add pull-ups the first set is 20 reps the second set is 15 reps the third set is 10 reps')"
                  rows={6}
                  className="w-full"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  💡 Tips for better results:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Be specific about exercises, sets, and reps</li>
                  <li>• Include rest periods if needed</li>
                  <li>• Mention equipment or difficulty level</li>
                  <li>
                    • You can describe multiple exercises in one description
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAiWorkoutModal(false);
                  setAiWorkoutText("");
                }}
                disabled={isGeneratingWorkout}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateWorkout}
                disabled={!aiWorkoutText.trim() || isGeneratingWorkout}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGeneratingWorkout ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Generate Workout</span>
                    <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full text-gray-700">
                      ✨ AI
                    </span>
                  </div>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
