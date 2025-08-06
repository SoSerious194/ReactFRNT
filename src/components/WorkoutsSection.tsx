"use client";
import {
  CopyIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createClient } from "@/utils/supabase/client";

type Workout = {
  id: string;
  name: string;
  difficulty: string;
  duration: string;
  equipment: string;
  lastModified: string;
};

export const WorkoutsSection = ({ workouts }: { workouts: Workout[] }) => {
  const router = useRouter();
  const supabase = createClient();
  const [deleteWorkoutId, setDeleteWorkoutId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>(workouts);
  const [activeFilter, setActiveFilter] = useState("all");

  const difficultyColorMap: Record<string, string> = {
    Beginner: "green",
    Intermediate: "yellow",
    Advanced: "red",
  };

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  // Filter workouts based on search query and active filter
  React.useEffect(() => {
    let filtered = workouts;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (workout) =>
          workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          workout.difficulty
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          workout.equipment.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter (placeholder for future implementation)
    if (activeFilter === "active") {
      // For now, show all workouts as active
      // This can be enhanced when workout status is implemented
    } else if (activeFilter === "archived") {
      // For now, show no workouts as archived
      // This can be enhanced when workout status is implemented
      filtered = [];
    }

    setFilteredWorkouts(filtered);
  }, [workouts, searchQuery, activeFilter]);

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      setIsDeleting(true);

      // Delete exercise sets first
      const { error: deleteSetsError } = await supabase
        .from("exercise_sets")
        .delete()
        .in(
          "workout_block_id",
          (
            await supabase
              .from("workout_blocks")
              .select("id")
              .eq("workout_id", workoutId)
          ).data?.map((b) => b.id) || []
        );

      if (deleteSetsError) {
        console.error("Error deleting exercise sets:", deleteSetsError);
        return;
      }

      // Delete workout blocks
      const { error: deleteBlocksError } = await supabase
        .from("workout_blocks")
        .delete()
        .eq("workout_id", workoutId);

      if (deleteBlocksError) {
        console.error("Error deleting workout blocks:", deleteBlocksError);
        return;
      }

      // Delete the workout
      const { error: deleteWorkoutError } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);

      if (deleteWorkoutError) {
        console.error("Error deleting workout:", deleteWorkoutError);
        return;
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error deleting workout:", error);
    } finally {
      setIsDeleting(false);
      setDeleteWorkoutId(null);
    }
  };

  const handleDuplicateWorkout = (workoutId: string) => {
    router.push(`/training-hub/workout-builder?duplicate=${workoutId}`);
  };

  return (
    <section className="w-full flex justify-center py-8 px-5">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-7xl space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-3xl text-gray-900">Workouts</h1>
          <Button
            className="bg-green-500 hover:bg-green-600"
            onClick={() => router.push("/training-hub/workout-builder")}
          >
            <PlusIcon className="h-3.5 w-3.5 mr-2" />
            Add New Workout
          </Button>
        </div>

        <div className="w-full max-w-[448px]">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 h-[50px] border-gray-300 bg-white"
              placeholder="Search workouts by name, difficulty, or equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full max-w-[224px]">
          <ToggleGroup
            type="single"
            value={activeFilter}
            onValueChange={(value) => value && setActiveFilter(value)}
            className="bg-gray-100 rounded-lg h-10 p-0.5 w-full"
          >
            {filterOptions.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="rounded-md h-9 px-3 flex-1 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-green-700"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <Table className="border rounded-lg shadow-sm overflow-hidden">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="py-4 pl-6 font-normal text-gray-900">
                Workout Name
              </TableHead>
              <TableHead className="py-4 pl-6 font-normal text-gray-900">
                Difficulty
              </TableHead>
              <TableHead className="py-4 pl-6 font-normal text-gray-900">
                Duration
              </TableHead>
              <TableHead className="py-4 pl-6 font-normal text-gray-900">
                Equipment Required
              </TableHead>
              <TableHead className="py-4 pl-6 font-normal text-gray-900">
                Last Modified
              </TableHead>
              <TableHead className="py-4 pl-6 font-normal text-gray-900">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkouts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-gray-500"
                >
                  {searchQuery.trim()
                    ? `No workouts found matching "${searchQuery}"`
                    : activeFilter === "archived"
                    ? "No archived workouts found"
                    : "No workouts available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredWorkouts.map((workout) => (
                <TableRow
                  key={workout.id}
                  className="border-t border-gray-200 bg-white"
                >
                  <TableCell className="py-[18px] pl-6 font-medium text-gray-900">
                    {workout.name}
                  </TableCell>
                  <TableCell className="py-[18px] pl-6">
                    <Badge
                      className={`bg-${
                        difficultyColorMap[workout.difficulty] ?? "gray"
                      }-100 text-${
                        difficultyColorMap[workout.difficulty] ?? "gray"
                      }-800 font-medium text-xs px-2 py-1 rounded-full`}
                    >
                      {workout.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-[18px] pl-6 text-gray-600">
                    {workout.duration}
                  </TableCell>
                  <TableCell className="py-[18px] pl-6 text-gray-600">
                    {workout.equipment}
                  </TableCell>
                  <TableCell className="py-[18px] pl-6 text-gray-600">
                    {workout.lastModified}
                  </TableCell>
                  <TableCell className="py-[18px] pl-6">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 p-0 h-5"
                        onClick={() =>
                          router.push(
                            `/training-hub/workout-builder?edit=${workout.id}`
                          )
                        }
                      >
                        <PencilIcon className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 p-0 h-5"
                        onClick={() => handleDuplicateWorkout(workout.id)}
                      >
                        <CopyIcon className="h-3.5 w-3.5 mr-1.5" />
                        Duplicate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 p-0 h-5"
                        onClick={() => setDeleteWorkoutId(workout.id)}
                      >
                        <TrashIcon className="h-3.5 w-3 mr-1.5" />
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteWorkoutId && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Workout
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this workout? This action cannot
              be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteWorkoutId(null)}
                disabled={isDeleting}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteWorkout(deleteWorkoutId)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
