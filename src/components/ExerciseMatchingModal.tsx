"use client";

import React, { useState, useEffect } from "react";
import { SearchIcon, PlusIcon, CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MultiSelect, OptionType } from "@/components/ui/MultiSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UnmatchedExercise,
  Exercise,
  NewExercise,
} from "@/types/workoutImport";
import { createClient } from "@/utils/supabase/client";

interface ExerciseMatchingModalProps {
  isOpen: boolean;
  unmatchedExercises: UnmatchedExercise[];
  onMatch: (exerciseName: string, matchedExerciseId: string) => void;
  onAddNew: (exercise: NewExercise, exerciseId?: string) => void;
  onComplete: (
    exerciseMapping: Map<string, string>,
    newExercisesMap: Map<string, any>
  ) => void;
  onClose: () => void;
}

export const ExerciseMatchingModal: React.FC<ExerciseMatchingModalProps> = ({
  isOpen,
  unmatchedExercises,
  onMatch,
  onAddNew,
  onComplete,
  onClose,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [matchedExercises, setMatchedExercises] = useState<Map<string, string>>(
    new Map()
  );
  const [newExercises, setNewExercises] = useState<Map<string, NewExercise>>(
    new Map()
  );
  const [showAddNew, setShowAddNew] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  // Fetch exercises from database
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("exercise_library")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching exercises:", error);
          return;
        }

        console.log("Fetched exercises:", data?.length || 0);
        console.log("Exercise names:", data?.map((e) => e.name) || []);
        setExercises(data || []);
        setFilteredExercises(data || []);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen, supabase]);

  // Matching strategies function
  const findMatches = (exerciseName: string): Exercise[] => {
    const normalizedName = exerciseName.toLowerCase().trim();
    const matches: Exercise[] = [];

    console.log("Looking for matches for:", exerciseName);
    console.log("Normalized name:", normalizedName);
    console.log("Available exercises:", exercises.length);

    exercises.forEach((exercise) => {
      const exerciseNameLower = exercise.name.toLowerCase();

      // 1. Exact Match
      if (exerciseNameLower === normalizedName) {
        matches.unshift(exercise); // Prioritize exact matches
        return;
      }

      // 2. Fuzzy Match (contains)
      if (
        exerciseNameLower.includes(normalizedName) ||
        normalizedName.includes(exerciseNameLower)
      ) {
        matches.push(exercise);
        return;
      }

      // 3. Synonym Match - handle common abbreviations
      const synonyms = {
        bb: "barbell",
        db: "dumbbell",
        bw: "bodyweight",
        assisted: "assisted",
        "single leg": "single leg",
        "right leg": "right leg",
        "left leg": "left leg",
      };

      let processedName = normalizedName;
      Object.entries(synonyms).forEach(([abbr, full]) => {
        processedName = processedName.replace(new RegExp(abbr, "gi"), full);
      });

      if (
        exerciseNameLower.includes(processedName) ||
        processedName.includes(exerciseNameLower)
      ) {
        matches.push(exercise);
        return;
      }

      // 4. Equipment Match - check if exercise name without equipment matches
      const equipmentTerms = [
        "barbell",
        "dumbbell",
        "bodyweight",
        "assisted",
        "machine",
        "cable",
        "kettlebell",
      ];
      const nameWithoutEquipment = exerciseNameLower
        .replace(new RegExp(`\\b(${equipmentTerms.join("|")})\\b`, "gi"), "")
        .trim();
      const exerciseWithoutEquipment = exerciseNameLower
        .replace(new RegExp(`\\b(${equipmentTerms.join("|")})\\b`, "gi"), "")
        .trim();

      if (
        nameWithoutEquipment &&
        exerciseWithoutEquipment &&
        (nameWithoutEquipment.includes(exerciseWithoutEquipment) ||
          exerciseWithoutEquipment.includes(nameWithoutEquipment))
      ) {
        matches.push(exercise);
        return;
      }
    });

    // Remove duplicates and return top matches
    return [...new Map(matches.map((item) => [item.id, item])).values()].slice(
      0,
      5
    );
  };

  // Auto-match exercises on initial load
  useEffect(() => {
    if (exercises.length > 0 && unmatchedExercises.length > 0) {
      unmatchedExercises.forEach((unmatchedExercise) => {
        // Skip if already matched
        if (isExerciseMatched(unmatchedExercise.name)) {
          return;
        }

        // Find matches for this exercise
        const suggestedMatches = findMatches(unmatchedExercise.name);

        // Auto-select exact matches
        const exactMatch = suggestedMatches.find(
          (match) =>
            match.name.toLowerCase() === unmatchedExercise.name.toLowerCase()
        );

        if (exactMatch) {
          console.log(
            "Auto-selecting exact match:",
            exactMatch.name,
            "for",
            unmatchedExercise.name
          );
          handleMatch(unmatchedExercise.name, exactMatch.id);
        }
      });
    }
  }, [exercises, unmatchedExercises]);

  // Filter exercises based on search query and current unmatched exercise
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Show suggested matches for the current exercise
      if (unmatchedExercises.length > 0) {
        const currentExercise = unmatchedExercises[0];
        const suggestedMatches = findMatches(currentExercise.name);
        setFilteredExercises(suggestedMatches);
      } else {
        setFilteredExercises(exercises);
      }
      return;
    }

    const filtered = exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredExercises(filtered);
  }, [searchQuery, exercises, unmatchedExercises]);

  const handleMatch = (
    unmatchedExerciseName: string,
    matchedExerciseId: string
  ) => {
    setMatchedExercises(
      (prev) => new Map(prev.set(unmatchedExerciseName, matchedExerciseId))
    );
    setSelectedExercise(null);
    setSearchQuery("");
  };

  const handleAddNew = (
    unmatchedExerciseName: string,
    newExercise: NewExercise,
    exerciseId?: string
  ) => {
    setNewExercises(
      (prev) => new Map(prev.set(unmatchedExerciseName, newExercise))
    );
    setShowAddNew(null);

    // Automatically match the newly created exercise with the original exercise name
    if (exerciseId) {
      setMatchedExercises(
        (prev) => new Map(prev.set(unmatchedExerciseName, exerciseId))
      );
    }
  };

  const handleComplete = () => {
    // Process all matches
    matchedExercises.forEach((exerciseId, exerciseName) => {
      onMatch(exerciseName, exerciseId);
    });

    // Process all new exercises
    newExercises.forEach((newExercise, exerciseName) => {
      onAddNew(newExercise);
    });

    // Pass the mappings to onComplete so only matched exercises are included
    onComplete(matchedExercises, newExercises);
  };

  const getMatchedExercise = (exerciseName: string) => {
    const matchedId = matchedExercises.get(exerciseName);
    if (matchedId) {
      return exercises.find((e) => e.id === matchedId);
    }
    return null;
  };

  const getNewExercise = (exerciseName: string) => {
    return newExercises.get(exerciseName);
  };

  const isExerciseMatched = (exerciseName: string) => {
    return matchedExercises.has(exerciseName) || newExercises.has(exerciseName);
  };

  const getUnmatchedCount = () => {
    return unmatchedExercises.filter((ex) => !isExerciseMatched(ex.name))
      .length;
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Match Exercises</span>
              <span className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full">
                ✨ AI-Matched
              </span>
            </div>
            <Badge variant="secondary">{getUnmatchedCount()} unmatched</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {unmatchedExercises.map((unmatchedExercise) => {
            const matchedExercise = getMatchedExercise(unmatchedExercise.name);
            const newExercise = getNewExercise(unmatchedExercise.name);
            const isMatched = isExerciseMatched(unmatchedExercise.name);

            return (
              <div
                key={unmatchedExercise.name}
                className={`p-4 border rounded-lg ${
                  isMatched
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {unmatchedExercise.name}
                    </h3>
                    {unmatchedExercise.instructions && (
                      <p className="text-sm text-gray-600 mt-1">
                        {unmatchedExercise.instructions}
                      </p>
                    )}
                    {isMatched && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Auto-matched with existing exercise
                      </p>
                    )}
                  </div>
                  {isMatched && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckIcon className="h-3 w-3 mr-1" />
                      Matched
                    </Badge>
                  )}
                </div>

                {!isMatched ? (
                  <div className="space-y-3">
                    {/* Search existing exercises */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search existing exercises:
                      </label>
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search exercises..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Exercise suggestions */}
                    <div className="max-h-40 overflow-y-auto border rounded-lg">
                      {loading ? (
                        <div className="p-4 text-center text-gray-500">
                          Loading exercises...
                        </div>
                      ) : filteredExercises.length > 0 ? (
                        <div>
                          {!searchQuery && (
                            <div className="p-2 bg-blue-50 border-b text-xs text-blue-700">
                              💡 Suggested matches for "{unmatchedExercise.name}
                              "
                            </div>
                          )}
                          <div className="divide-y">
                            {filteredExercises.slice(0, 5).map((exercise) => (
                              <div
                                key={exercise.id}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                              >
                                <button
                                  onClick={() =>
                                    handleMatch(
                                      unmatchedExercise.name,
                                      exercise.id
                                    )
                                  }
                                  className="flex-1 text-left"
                                >
                                  <div className="font-medium text-gray-900 flex items-center">
                                    {exercise.name}
                                    {exercise.name.toLowerCase() ===
                                      unmatchedExercise.name.toLowerCase() && (
                                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        Exact Match
                                      </span>
                                    )}
                                  </div>
                                  {exercise.equipment && (
                                    <div className="text-sm text-gray-500">
                                      {exercise.equipment}
                                    </div>
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    handleMatch(
                                      unmatchedExercise.name,
                                      exercise.id
                                    )
                                  }
                                  className="ml-2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                >
                                  Map
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          {searchQuery
                            ? "No exercises found"
                            : "No suggested matches found"}
                        </div>
                      )}
                    </div>

                    {/* Add new exercise option */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddNew(unmatchedExercise.name)}
                        className="flex items-center gap-2"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add New Exercise
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-3 rounded border">
                    {matchedExercise ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            Matched with: {matchedExercise.name}
                          </div>
                          {matchedExercise.equipment && (
                            <div className="text-sm text-gray-500">
                              Equipment: {matchedExercise.equipment}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            // Clear the match to show suggestions again
                            setMatchedExercises((prev) => {
                              const newMap = new Map(prev);
                              newMap.delete(unmatchedExercise.name);
                              return newMap;
                            });
                            setSearchQuery("");
                          }}
                          className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                        >
                          Replace
                        </button>
                      </div>
                    ) : newExercise ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            New exercise: {newExercise.name}
                          </div>
                          {newExercise.equipment && (
                            <div className="text-sm text-gray-500">
                              Equipment: {newExercise.equipment}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            // Clear the new exercise to show suggestions again
                            setNewExercises((prev) => {
                              const newMap = new Map(prev);
                              newMap.delete(unmatchedExercise.name);
                              return newMap;
                            });
                            setSearchQuery("");
                          }}
                          className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                        >
                          Replace
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add New Exercise Modal */}
        {showAddNew && (
          <AddNewExerciseModal
            exerciseName={showAddNew}
            onAdd={(newExercise, exerciseId) => {
              handleAddNew(showAddNew, newExercise, exerciseId);
            }}
            onCancel={() => setShowAddNew(null)}
          />
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              // Skip all unmatched exercises, only keep the currently matched ones
              onComplete(matchedExercises, newExercises);
            }}
          >
            Skip All
          </Button>
          <Button onClick={handleComplete}>Complete Matching</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Add New Exercise Modal Component
interface AddNewExerciseModalProps {
  exerciseName: string;
  onAdd: (exercise: NewExercise, exerciseId?: string) => void;
  onCancel: () => void;
}

// All options from exercise builder
const musclesTrainedOptions = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Core",
  "Obliques",
  "Glutes",
  "Hamstrings",
  "Quads",
  "Calves",
  "Hip Flexors",
  "Forearms",
  "Neck",
  "Full Body",
  "Cardiovascular",
  "Mobility",
];

const exerciseTypeOptions = [
  "Strength",
  "Mobility",
  "Warm-Up",
  "Cool-Down",
  "Plyometric",
  "Isometric",
  "Stretching",
  "Cardio",
  "Rehab",
  "Balance",
];

const defaultUnitsOptions = ["reps", "time", "weight", "distance", "calories"];

const targetGoalsOptions = [
  "Hypertrophy",
  "Strength",
  "Endurance",
  "Explosiveness",
  "Mobility",
  "Stability",
  "Rehab",
  "Fat Loss",
  "Cardiovascular Conditioning",
];

const difficultyLevelsOptions = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Elite",
];

const equipmentOptions = [
  "Bodyweight",
  "Barbell",
  "Dumbbell",
  "Kettlebell",
  "Resistance Band",
  "Cable Machine",
  "Smith Machine",
  "Trap Bar",
  "EZ Bar",
  "Bench",
  "Foam Roller",
  "Box",
  "Step",
  "Medicine Ball",
  "TRX / Rings",
  "Treadmill",
  "Bike",
  "Rower",
  "Sled",
  "Other",
];

const mapToOptions = (options: string[]): OptionType[] =>
  options.map((option) => ({ label: option, value: option }));

const AddNewExerciseModal: React.FC<AddNewExerciseModalProps> = ({
  exerciseName,
  onAdd,
  onCancel,
}) => {
  const [formData, setFormData] = useState<NewExercise>({
    name: exerciseName,
    equipment: "",
    difficulty: "Beginner",
    exercise_type: "Strength",
    instructions: "",
    video_url_1: "",
    video_url_2: "",
    image: "",
    muscles_trained: [],
    target_goal: "",
    default_unit: [],
    cues_and_tips: "",
  });
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save the exercise to the database
      const supabase = createClient();

      const exerciseData = {
        name: formData.name,
        muscles_trained: selectedMuscles.length > 0 ? selectedMuscles : null,
        video_url_1: formData.video_url_1 || null,
        video_url_2: formData.video_url_2 || null,
        exercise_type: formData.exercise_type,
        default_unit: selectedUnits.length > 0 ? selectedUnits.join(",") : null,
        target_goal: formData.target_goal || null,
        difficulty: formData.difficulty,
        equipment:
          selectedEquipment.length > 0 ? selectedEquipment.join(",") : null,
        instructions: formData.instructions || null,
        cues_and_tips: formData.cues_and_tips || null,
        image: formData.image || null,
        progression_id: null,
        regression_id: null,
        is_draft: false,
        is_active: true,
        coach_id: null, // Will be set by the user's context
        is_global: true,
      };

      const result = await supabase
        .from("exercise_library")
        .insert([exerciseData])
        .select();

      if (result.error) {
        console.error("Error saving exercise:", result.error);
        alert("Error saving exercise. Please try again.");
        return;
      }

      // Add the new exercise to the local exercises list
      if (result.data && result.data[0]) {
        const newExercise = result.data[0] as any;
        onAdd(formData, newExercise.id);
      }
    } catch (error) {
      console.error("Error saving exercise:", error);
      alert("Error saving exercise. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Exercise</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment
                </label>
                <MultiSelect
                  options={mapToOptions(equipmentOptions)}
                  selected={selectedEquipment}
                  onChange={setSelectedEquipment}
                  placeholder="Select equipment..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, difficulty: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevelsOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Type
                </label>
                <Select
                  value={formData.exercise_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, exercise_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exercise type" />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseTypeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL 1
                </label>
                <p className="text-xs text-gray-500 mb-1">
                  Paste YouTube or Vimeo URL
                </p>
                <Input
                  value={formData.video_url_1}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      video_url_1: e.target.value,
                    }))
                  }
                  placeholder="Paste video URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL 2
                </label>
                <p className="text-xs text-gray-500 mb-1">
                  Paste YouTube or Vimeo URL (optional)
                </p>
                <Input
                  value={formData.video_url_2}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      video_url_2: e.target.value,
                    }))
                  }
                  placeholder="Paste video URL (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, image: e.target.value }))
                  }
                  placeholder="Paste image URL (optional)"
                />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Muscles Trained
                </label>
                <MultiSelect
                  options={mapToOptions(musclesTrainedOptions)}
                  selected={selectedMuscles}
                  onChange={setSelectedMuscles}
                  placeholder="Select up to 3"
                  limit={3}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Goal
                </label>
                <Select
                  value={formData.target_goal}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, target_goal: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetGoalsOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Unit(s)
                </label>
                <MultiSelect
                  options={mapToOptions(defaultUnitsOptions)}
                  selected={selectedUnits}
                  onChange={setSelectedUnits}
                  placeholder="Select up to 2"
                  limit={2}
                  className="w-full"
                />
              </div>
            </TabsContent>

            <TabsContent value="instructions" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <Textarea
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      instructions: e.target.value,
                    }))
                  }
                  rows={6}
                  placeholder="Exercise instructions..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cues & Tips
                </label>
                <Textarea
                  value={formData.cues_and_tips}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cues_and_tips: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Exercise cues and tips..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add Exercise"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
