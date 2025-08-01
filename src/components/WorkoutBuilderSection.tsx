"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
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
const BarsIcon = () => (
  <svg
    className="w-4 h-4"
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
          : "bg-purple-100 border-purple-300"
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
        ) : (
          <BarsIcon />
        )}
        <span
          className={`text-sm font-semibold ${
            session.type === "normal"
              ? "text-gray-800"
              : session.type === "superset"
              ? "text-yellow-800"
              : "text-purple-800"
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

type SetType = "warmup" | "normal" | "dropset";

type ExerciseSet = {
  id: string;
  type: SetType;
  setNumber: number;
  time: number; // Duration in seconds
  rest: number; // Duration in seconds
  exercise?: Exercise; // Optional exercise for the set
  customName?: string; // Custom name for the set
};

type WorkoutExercise = {
  id: string;
  exercise: Exercise;
  sets: ExerciseSet[];
  instructions: string;
};

type SessionType = "normal" | "superset" | "circuit";

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

export default function WorkoutBuilderSection() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("Exercises");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [workoutName, setWorkoutName] = useState("Workout Name");

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
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeModalTarget, setTimeModalTarget] = useState<{
    type: "time" | "rest";
    setId: string;
    sessionId?: string;
    exerciseId?: string;
  } | null>(null);
  const [customDuration, setCustomDuration] = useState(5);

  // Duration options in minutes
  const durationOptions = [5, 10, 15, 30, 60];

  // Convert seconds to minutes for display
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  // Parse duration from "X min" format to seconds
  const parseDuration = (durationString: string): number => {
    const minutes = parseInt(durationString.replace(" min", ""));
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
          .order("name", { ascending: true });

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
    // TODO: Implement actual filtering based on exercise_type or other criteria
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
        instructions: exercise.instructions || exercise.cues_and_tips || "",
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
          instructions: exercise.instructions || exercise.cues_and_tips || "",
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
      time: type === "warmup" ? 30 : 60,
      rest: type === "warmup" ? 0 : 60,
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
        !(event.target as Element).closest(".dropdown-container")
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
      time: type === "warmup" ? 30 : 60,
      rest: type === "warmup" ? 0 : 60,
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

  return (
    <div className="flex h-[calc(100vh-0px)] bg-gray-50">
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
                      src={getThumbnailUrl(exercise.video_url_1)}
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
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 w-full"
                placeholder="Enter workout name..."
              />
              <p className="text-sm text-gray-600 mt-1">
                Avoid overstretching and make sure you get a deep stretch in the
                target muscle without having pain in surrounding joints...
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex p-6 overflow-y-auto">
          <div className="w-full max-w-3xl mx-auto space-y-6">
            {selectedWorkoutExercise ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-900 rounded-lg flex-shrink-0">
                    <img
                      className="w-full h-full object-cover rounded-lg"
                      src={getThumbnailUrl(
                        selectedWorkoutExercise.exercise.video_url_1
                      )}
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
                              Time
                            </th>
                            <th className="text-left py-2 text-gray-600">
                              Rest
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
                                  value={set.customName || ""}
                                  onChange={(e) =>
                                    updateSetCustomName(set.id, e.target.value)
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
                                      openTimeModal("time", set.id)
                                    }
                                  >
                                    {formatDuration(set.time)}
                                  </button>
                                </div>
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
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                        onClick={() => addSet("dropset")}
                      >
                        + Add Dropset
                      </button>
                  </div>

                    {/* Instructions */}
                    <div className="mb-3 mt-4">
                      <p className="text-sm text-gray-500 mb-2">
                        Workout-Specific Instructions (Exercise instructions are
                        displayed automatically)
                      </p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                      <textarea
                        value={selectedWorkoutExercise.instructions}
                        onChange={(e) => updateInstructions(e.target.value)}
                        className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm text-gray-600 resize-none"
                        rows={3}
                        placeholder="Add specific instructions for this exercise..."
                      />
                  </div>
                </div>
              </div>
            </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <p className="text-gray-500">
                  Select an exercise from the left panel to view details
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
                      src={getThumbnailUrl(
                        workoutExercise.exercise.video_url_1
                      )}
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
                    : "bg-purple-100 border-purple-300"
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
                  ) : (
                    <BarsIcon />
                  )}
                  <h2
                    className={`text-xl font-bold ${
                      session.type === "normal"
                        ? "text-gray-800"
                        : session.type === "superset"
                        ? "text-yellow-800"
                        : "text-purple-800"
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
                              src={getThumbnailUrl(
                                exercise.exercise.video_url_1
                              )}
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
                                      Time
                                    </th>
                                    <th className="text-left py-2 text-gray-600">
                                      Rest
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
                                          value={set.customName || ""}
                                          onChange={(e) =>
                                            updateSessionExerciseSetCustomName(
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
                                                "time",
                                                set.id,
                                                session.id,
                                                exercise.id
                                              );
                                            }}
                                          >
                                            {formatDuration(set.time)}
                                          </button>
                                        </div>
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
                            <div className="mb-3 mt-4">
                              <p className="text-sm text-gray-500 mb-2">
                                Workout-Specific Instructions (Exercise
                                instructions are displayed automatically)
                              </p>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                              <textarea
                                value={exercise.instructions}
                                onChange={(e) =>
                                  updateSessionExerciseInstructions(
                                    session.id,
                                    exercise.id,
                                    e.target.value
                                  )
                                }
                                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm text-gray-600 resize-none"
                                rows={3}
                                placeholder="Add specific instructions for this exercise..."
                                onClick={(e) => e.stopPropagation()}
                              />
                      </div>
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
        <div className="flex flex-col space-y-2 mb-6">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            onClick={() => addSession("normal")}
          >
            Normal
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            onClick={() => addSession("superset")}
          >
            <SupersetIcon />
            Superset
          </button>
          <button
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            onClick={() => addSession("circuit")}
          >
            <CircuitIcon />
            Circuit
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
                    {minutes} min
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
    </div>
  );
} 
