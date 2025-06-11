import {
  CopyIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import React from "react";
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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

// Workout data for mapping
const workouts = [
  {
    name: "Full Body Strength Circuit",
    difficulty: { level: "Beginner", color: "green" },
    duration: "45 min",
    equipment: "Dumbbells, Resistance Bands",
    lastModified: "2024-01-15",
  },
  {
    name: "HIIT Tabata Blast",
    difficulty: { level: "Advanced", color: "red" },
    duration: "20 min",
    equipment: "No Equipment",
    lastModified: "2024-01-14",
  },
  {
    name: "Morning Yoga Flow",
    difficulty: { level: "Beginner", color: "green" },
    duration: "30 min",
    equipment: "Yoga Mat",
    lastModified: "2024-01-13",
  },
  {
    name: "Upper Body Power",
    difficulty: { level: "Intermediate", color: "yellow" },
    duration: "35 min",
    equipment: "Dumbbells, Pull-up Bar",
    lastModified: "2024-01-12",
  },
  {
    name: "Cardio Kickboxing",
    difficulty: { level: "Intermediate", color: "yellow" },
    duration: "40 min",
    equipment: "No Equipment",
    lastModified: "2024-01-11",
  },
];

export const WorkoutsSection = () => {
  return (
    <section className="w-full max-w-[1280px] mx-auto py-8 px-5">
      <div className="space-y-8">
        {/* Header with title and add button */}
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-3xl text-gray-900">Workouts</h1>
          <Button className="bg-green-500 hover:bg-green-600">
            <PlusIcon className="h-3.5 w-3.5 mr-2" />
            <span>Add New Workout</span>
          </Button>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-[448px]">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 h-[50px] border-gray-300 bg-white"
              placeholder="Search workouts"
            />
          </div>
        </div>

        {/* Filter toggle */}
        <div className="w-full max-w-[224px]">
          <ToggleGroup
            type="single"
            defaultValue="All"
            className="bg-gray-100 rounded-lg h-10 p-0.5 w-full"
          >
            <ToggleGroupItem
              value="All"
              className="rounded-md h-9 px-3 flex-1 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-green-700"
            >
              All
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Active"
              className="rounded-md h-9 px-3 flex-1 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-green-700 text-gray-600"
            >
              Active
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Archived"
              className="rounded-md h-9 px-3 flex-1 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-green-700 text-gray-600"
            >
              Archived
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Workouts table */}
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
            {workouts.map((workout, index) => (
              <TableRow key={index} className="border-t border-gray-200 bg-white">
                <TableCell className="py-[18px] pl-6 font-medium text-gray-900">
                  {workout.name}
                </TableCell>
                <TableCell className="py-[18px] pl-6">
                  <Badge
                    className={`
                      ${
                        workout.difficulty.color === "green"
                          ? "bg-green-100 text-green-800"
                          : workout.difficulty.color === "yellow"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      } 
                      font-medium text-xs px-2 py-1 rounded-full
                    `}
                  >
                    {workout.difficulty.level}
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
                    >
                      <PencilIcon className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 p-0 h-5"
                    >
                      <CopyIcon className="h-3.5 w-3.5 mr-1.5" />
                      Duplicate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 p-0 h-5"
                    >
                      <TrashIcon className="h-3.5 w-3 mr-1.5" />
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};
