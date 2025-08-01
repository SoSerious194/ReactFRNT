// src/components/ExerciseListSection.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EditIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";

function getVideoThumbnail(url: string): string {
  if (!url) {
    // Return a data URL for a simple placeholder SVG
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EExercise%3C/text%3E%3C/svg%3E";
  }

  // Convert Cloudflare Stream URL to thumbnail URL
  // Example: https://videodelivery.net/abc123/manifest/video.m3u8
  // To: https://videodelivery.net/abc123/thumbnails/thumbnail.jpg
  try {
    const urlParts = url.split("/");
    if (urlParts.length >= 4) {
      const videoId = urlParts[3]; // Extract video ID
      return `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`;
    }
  } catch (error) {
    console.error("Error parsing video URL:", error);
  }

  // Fallback to placeholder if URL parsing fails
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EExercise%3C/text%3E%3C/svg%3E";
}

interface Exercise {
  id: string;
  name: string;
  muscles_trained: string[] | null;
  video_url_1: string | null;
  video_url_2: string | null;
  exercise_type: string | null;
  default_unit: string | null;
  target_goal: string | null;
  difficulty: string | null;
  equipment: string | null;
  instructions: string | null;
  cues_and_tips: string | null;
  image: string | null;
  is_draft: boolean;
  is_active: boolean;
}

interface ExerciseListSectionProps {
  exercises?: Exercise[];
}

export const ExerciseListSection: React.FC<ExerciseListSectionProps> = ({
  exercises: initialExercises = [],
}) => {
  const router = useRouter();
  const [exerciseTab, setExerciseTab] = useState("all");
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [filteredExercises, setFilteredExercises] =
    useState<Exercise[]>(initialExercises);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    };
    fetchUser();
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

  useEffect(() => {
    if (!userId) return;
    const fetchExercises = async () => {
      setLoading(true);
      const supabase = createClient();
      let query = supabase.from("exercise_library").select("*");
      if (exerciseTab === "all") {
        query = query
          .eq("is_active", true)
          .eq("is_draft", false)
          .or(`is_global.eq.true,coach_id.eq.${userId}`);
      } else if (exerciseTab === "mine") {
        query = query
          .eq("is_global", false)
          .eq("coach_id", userId)
          .eq("is_active", true)
          .eq("is_draft", false);
      } else if (exerciseTab === "drafts") {
        query = query.eq("is_draft", true).eq("coach_id", userId);
      } else if (exerciseTab === "archived") {
        query = query
          .eq("is_active", false)
          .eq("is_draft", false)
          .eq("coach_id", userId);
      }
      const { data, error } = await query.order("name");
      if (!error && data) {
        setExercises(data);
        setFilteredExercises(data);
      }
      setLoading(false);
    };
    fetchExercises();
  }, [exerciseTab, userId]);

  const handleEdit = (exercise: Exercise) => {
    // Store exercise data in localStorage for the edit form
    localStorage.setItem("editExercise", JSON.stringify(exercise));
    router.push("/training-hub/exercise-builder");
  };

  const handleDelete = (exercise: Exercise) => {
    setExerciseToDelete(exercise);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!exerciseToDelete) return;

    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("exercise_library")
      .delete()
      .eq("id", exerciseToDelete.id);

    if (!error) {
      // Remove from local state
      setExercises(exercises.filter((ex) => ex.id !== exerciseToDelete.id));
      setFilteredExercises(
        filteredExercises.filter((ex) => ex.id !== exerciseToDelete.id)
      );
      alert("Exercise deleted successfully!");
    } else {
      alert("Error deleting exercise");
    }

    setDeleting(false);
    setDeleteModalOpen(false);
    setExerciseToDelete(null);
  };

  return (
    <section className="w-full flex justify-center py-8 px-5">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-7xl space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-3xl text-gray-900">Exercises</h1>
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => router.push("/training-hub/exercise-builder")}
          >
            <PlusIcon className="h-4 w-4 mr-2" /> Add New Exercise
          </Button>
        </div>

        <div className="w-fit mb-4">
          <ToggleGroup
            type="single"
            value={exerciseTab}
            onValueChange={(v) => v && setExerciseTab(v)}
            className="bg-gray-100 rounded-lg p-1"
          >
            <ToggleGroupItem
              value="all"
              className="rounded-md h-9 px-4 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-green-700"
            >
              All exercises
            </ToggleGroupItem>
            <ToggleGroupItem
              value="mine"
              className="rounded-md h-9 px-4 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-green-700"
            >
              My Exercises
            </ToggleGroupItem>
            <ToggleGroupItem
              value="drafts"
              className="rounded-md h-9 px-4 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-green-700"
            >
              Drafts
            </ToggleGroupItem>
            <ToggleGroupItem
              value="archived"
              className="rounded-md h-9 px-4 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-green-700"
            >
              Archive
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="w-full max-w-[448px]">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 h-[50px] border-gray-300 bg-white"
              placeholder="Search exercises"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredExercises.map((exercise: Exercise) => (
              <Card
                key={exercise.id}
                className="overflow-hidden border shadow-[0px_1px_2px_#0000000d]"
              >
                <div className="relative h-40">
                  <img
                    src={getVideoThumbnail(exercise.video_url_1 || "")}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3EExercise%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button
                      className="w-8 h-8 bg-[#ffffffe6] rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      onClick={() => handleEdit(exercise)}
                    >
                      <EditIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="w-8 h-8 bg-[#ffffffe6] rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      onClick={() => handleDelete(exercise)}
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-normal text-base text-gray-900">
                    {exercise.name}
                  </h3>
                  <p className="font-normal text-sm text-gray-600">
                    {(exercise.muscles_trained || []).join(", ")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="bg-white border border-gray-200">
            <DialogHeader>
              <DialogTitle>Delete Exercise</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{exerciseToDelete?.name}"? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  backgroundColor: "#FF0000",
                  color: "#ffffff",
                  fontWeight: "bold",
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
