'use client';
import {
  CopyIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon
} from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  ToggleGroup, ToggleGroupItem
} from "@/components/ui/toggle-group";

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

  return (
    <section className="w-full flex justify-center py-8 px-5">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-7xl space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-3xl text-gray-900">Workouts</h1>
          <Button className="bg-green-500 hover:bg-green-600" onClick={() => router.push('/training-hub/workout-builder')}>
            <PlusIcon className="h-3.5 w-3.5 mr-2" />
            Add New Workout
          </Button>
        </div>

        <div className="w-full max-w-[448px]">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-10 h-[50px] border-gray-300 bg-white" placeholder="Search workouts" />
          </div>
        </div>

        <div className="w-full max-w-[224px]">
          <ToggleGroup type="single" defaultValue="all" className="bg-gray-100 rounded-lg h-10 p-0.5 w-full">
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
              <TableHead className="py-4 pl-6 font-normal text-gray-900">Workout Name</TableHead>
              <TableHead className="py-4 pl-6 font-normal text-gray-900">Difficulty</TableHead>
              <TableHead className="py-4 pl-6 font-normal text-gray-900">Duration</TableHead>
              <TableHead className="py-4 pl-6 font-normal text-gray-900">Equipment Required</TableHead>
              <TableHead className="py-4 pl-6 font-normal text-gray-900">Last Modified</TableHead>
              <TableHead className="py-4 pl-6 font-normal text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workouts.map((workout) => (
              <TableRow key={workout.id} className="border-t border-gray-200 bg-white">
                <TableCell className="py-[18px] pl-6 font-medium text-gray-900">{workout.name}</TableCell>
                <TableCell className="py-[18px] pl-6">
                  <Badge className={`bg-${difficultyColorMap[workout.difficulty] ?? "gray"}-100 text-${difficultyColorMap[workout.difficulty] ?? "gray"}-800 font-medium text-xs px-2 py-1 rounded-full`}>
                    {workout.difficulty}
                  </Badge>
                </TableCell>
                <TableCell className="py-[18px] pl-6 text-gray-600">{workout.duration}</TableCell>
                <TableCell className="py-[18px] pl-6 text-gray-600">{workout.equipment}</TableCell>
                <TableCell className="py-[18px] pl-6 text-gray-600">{workout.lastModified}</TableCell>
                <TableCell className="py-[18px] pl-6">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="text-green-600 p-0 h-5"><PencilIcon className="h-3.5 w-3.5 mr-1.5" />Edit</Button>
                    <Button variant="ghost" size="sm" className="text-green-600 p-0 h-5"><CopyIcon className="h-3.5 w-3.5 mr-1.5" />Duplicate</Button>
                    <Button variant="ghost" size="sm" className="text-red-600 p-0 h-5"><TrashIcon className="h-3.5 w-3 mr-1.5" />Remove</Button>
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
