'use client';
import { ArrowLeftIcon, PlusIcon, XIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

// Data for the days and their workouts
const days = [
  {
    day: 1,
    workouts: [
      {
        title: "Upper Body Strength",
        exercises: [
          "3x12 Bench Press",
          "4x8 Pull-ups",
          "3x10 Shoulder Press",
          "3x15 Dumbbell Rows",
        ],
        duration: "~45 min",
      },
    ],
  },
  {
    day: 2,
    workouts: [
      {
        title: "Lower Body Power",
        exercises: [
          "4x5 Deadlift",
          "3x8 Squats",
          "3x12 Bulgarian Split Squats",
          "4x10 Calf Raises",
        ],
        duration: "~50 min",
      },
    ],
  },
  { day: 3, workouts: [] },
  { day: 4, workouts: [] },
  {
    day: 5,
    workouts: [
      {
        title: "Full Body HIIT",
        exercises: [
          "5x30s Burpees",
          "4x45s Mountain Climbers",
          "3x20 Jump Squats",
          "4x15 Push-ups",
        ],
        duration: "~30 min",
      },
    ],
  },
  { day: 6, workouts: [] },
  { day: 7, workouts: [] },
];

// Quick add options
const quickAddOptions = [
  { label: "Add Cardio", color: "bg-green-100 text-green-700" },
  { label: "Add Mobility", color: "bg-purple-100 text-purple-700" },
  { label: "Add Activity", color: "bg-orange-100 text-orange-700" },
  {
    label: "Add Rest Day",
    color: "bg-red-100 text-red-700",
  },
];

export const ProgramScheduleSection: React.FC = () => {
  return (
    <section className="w-full p-6">
      <Card className="w-full rounded-lg border shadow-[0px_1px_2px_#0000000d]">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="p-0 h-6 gap-2" size="sm">
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                <span className="font-medium text-gray-600">Back</span>
              </Button>
              <h1 className="font-bold text-2xl text-gray-900">
                Program Builder
              </h1>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="h-[42px]">
                Save as Draft
              </Button>
              <Button className="h-10 bg-green-500 hover:bg-green-600">
                Save Program
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Program Schedule Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-normal text-gray-900">
                  Program Schedule
                </h2>
                <ToggleGroup
                  type="single"
                  defaultValue="7-Day"
                  className="bg-gray-100 rounded-lg"
                >
                  <ToggleGroupItem
                    value="5-Day"
                    className="h-7 px-3 text-sm text-gray-600 data-[state=on]:bg-green-500 data-[state=on]:text-white"
                  >
                    5-Day
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="7-Day"
                    className="h-7 px-3 text-sm data-[state=on]:bg-green-500 data-[state=on]:text-white"
                  >
                    7-Day
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="10-Day"
                    className="h-7 px-3 text-sm text-gray-600 data-[state=on]:bg-green-500 data-[state=on]:text-white"
                  >
                    10-Day
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="h-7 px-3 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                >
                  Clear All
                </Button>
                <Button
                  variant="ghost"
                  className="h-7 px-3 bg-green-100 text-green-700 text-sm hover:bg-green-200"
                >
                  Auto-Schedule
                </Button>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-4">
              {days.map((day) => (
                <div key={day.day} className="flex flex-col">
                  {/* Day Header */}
                  <div className="bg-green-500 text-white font-medium py-3 text-center rounded-t-lg">
                    Day {day.day}
                  </div>

                  {/* Day Content */}
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-b-lg p-[18px] flex flex-col gap-4">
                    {day.workouts.length > 0
                      ? day.workouts.map((workout, index) => (
                          <Card key={index} className="bg-white border">
                            <CardContent className="p-4">
                              <div className="flex justify-between mb-4">
                                <h3 className="font-normal text-base text-gray-900">
                                  {workout.title}
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 p-0"
                                >
                                  <XIcon className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="space-y-2 mb-4">
                                {workout.exercises.map((exercise, i) => (
                                  <p key={i} className="text-sm text-gray-600">
                                    {exercise}
                                  </p>
                                ))}
                              </div>

                              <p className="text-xs text-gray-500">
                                Duration: {workout.duration}
                              </p>
                            </CardContent>
                          </Card>
                        ))
                      : null}

                    {/* Add Workout Button */}
                    <Card className="border-blue-200">
                      <CardContent className="p-4 flex flex-col items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-blue-600 p-0"
                          >
                            <PlusIcon className="h-6 w-6" />
                          </Button>
                        </div>
                          <p className="text-sm text-blue-600 text-center">
                            Add Workout
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Add Options */}
                    <div className="flex flex-col gap-2">
                      {quickAddOptions.map((option, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className={`${option.color} text-xs justify-center h-8`}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};
