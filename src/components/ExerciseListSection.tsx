'use client';
import { EditIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Exercise data for mapping
const exercises = [
  {
    id: 1,
    name: "Push-ups",
    muscles: "Chest, Shoulders, Triceps",
    image: "https://c.animaapp.com/mbs2dbzz5Zo2OL/img/img.png",
  },
  {
    id: 2,
    name: "Squats",
    muscles: "Quadriceps, Glutes, Hamstrings",
    image: "https://c.animaapp.com/mbs2dbzz5Zo2OL/img/img-1.png",
  },
  {
    id: 3,
    name: "Deadlifts",
    muscles: "Hamstrings, Glutes, Lower Back",
    image: "https://c.animaapp.com/mbs2dbzz5Zo2OL/img/img-2.png",
  },
  {
    id: 4,
    name: "Plank",
    muscles: "Core, Shoulders, Back",
    image: "https://c.animaapp.com/mbs2dbzz5Zo2OL/img/img-3.png",
  },
  {
    id: 5,
    name: "Pull-ups",
    muscles: "Lats, Biceps, Rhomboids",
    image: "https://c.animaapp.com/mbs2dbzz5Zo2OL/img/img-4.png",
  },
  {
    id: 6,
    name: "Lunges",
    muscles: "Quadriceps, Glutes, Calves",
    image: "https://c.animaapp.com/mbs2dbzz5Zo2OL/img/img-5.png",
  },
  {
    id: 7,
    name: "Bench Press",
    muscles: "Chest, Shoulders, Triceps",
    image: "https://c.animaapp.com/mbs2dbzz5Zo2OL/img/img-6.png",
  },
  {
    id: 8,
    name: "Mountain Climbers",
    muscles: "Core, Shoulders, Legs",
    image: "https://c.animaapp.com/mbs2dbzz5Zo2OL/img/img-7.png",
  },
  {
    id: 9,
    name: "Burpees",
    muscles: "Full Body, Cardio",
    image: "https://c.animaapp.com/mbs2dbzz5Zo2OL/img/img-8.png",
  },
  {
    id: 10,
    name: "Bicep Curls",
    muscles: "Biceps, Forearms",
    image: "https://c.animaapp.com/mbs2dbzz5Zo2OL/img/img-9.png",
  },
];

// Filter categories
const bodyFilters = [
  { id: "all", label: "All", active: true },
  { id: "upper", label: "Upper Body", active: false },
  { id: "lower", label: "Lower Body", active: false },
  { id: "core", label: "Core", active: false },
];

const typeFilters = [
  { id: "all", label: "All Exercises", active: true },
  { id: "my", label: "My Exercises", active: false },
];

export const ExerciseListSection: React.FC = () => {
  const [activeBodyFilter, setActiveBodyFilter] = useState("all");
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");

  return (
    <section className="w-full max-w-[1280px] mx-auto py-8 px-5">
      <div className="space-y-8">
        {/* Header with title and add button */}
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-3xl text-gray-900 font-['Inter',Helvetica]">
            Exercises
          </h1>

          <Button className="bg-green-500 hover:bg-green-600 text-white">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New Exercise
          </Button>
        </div>

        {/* SearchIcon bar */}
        <div className="w-full max-w-[448px]">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 h-[50px] border-gray-300 bg-white font-['Inter',Helvetica]"
              placeholder="Search exercises"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex justify-between">
          {/* Body area filters */}
          <div className="bg-gray-100 rounded-lg flex">
            {bodyFilters.map((filter) => (
              <button
                key={filter.id}
                className={
                  "px-4 py-2 rounded-md m-1 text-sm font-medium text-gray-600 hover:bg-gray-50 data-[state=on]:bg-white data-[state=on]:text-green-700 data-[state=on]:shadow-sm" +
                  (activeBodyFilter === filter.id ? "" : "")
                }
                data-state={activeBodyFilter === filter.id ? "on" : undefined}
                onClick={() => setActiveBodyFilter(filter.id)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Exercise type filters */}
          <div className="bg-gray-100 rounded-lg flex">
            {typeFilters.map((filter) => (
              <button
                key={filter.id}
                className={
                  "px-4 py-2 rounded-md m-1 text-sm font-medium text-gray-600 hover:bg-gray-50 data-[state=on]:bg-white data-[state=on]:text-green-700 data-[state=on]:shadow-sm" +
                  (activeTypeFilter === filter.id ? "" : "")
                }
                data-state={activeTypeFilter === filter.id ? "on" : undefined}
                onClick={() => setActiveTypeFilter(filter.id)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {exercises.map((exercise) => (
            <Card
              key={exercise.id}
              className="overflow-hidden border shadow-[0px_1px_2px_#0000000d]"
            >
              <div className="relative h-40">
                <img
                  src={exercise.image}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button className="w-8 h-8 bg-[#ffffffe6] rounded-full flex items-center justify-center">
                    <EditIcon className="h-3.5 w-3.5" />
                  </button>
                  <button className="w-8 h-8 bg-[#ffffffe6] rounded-full flex items-center justify-center">
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-normal text-base text-gray-900 font-['Inter',Helvetica] mb-2">
                  {exercise.name}
                </h3>
                <p className="font-normal text-sm text-gray-600 font-['Inter',Helvetica]">
                  {exercise.muscles}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
