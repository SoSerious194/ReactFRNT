'use client';
import { PlayIcon, PlusIcon, SearchIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Video data for mapping
const videoCategories = [
  { id: "workouts", label: "Follow-Along Workouts", isActive: true },
  { id: "stretching", label: "Follow-Along Stretching", isActive: false },
  { id: "recipes", label: "Follow-Along Video Recipes", isActive: false },
  { id: "education", label: "Principles & Education", isActive: false },
];

const videoCards = [
  {
    id: 1,
    title: "HIIT Full Body Workout",
    description: "High-intensity interval training for maximum results",
    duration: "45 min",
    time: "45:30",
    level: "Advanced",
    thumbnail: "https://c.animaapp.com/mbs2ysbx6IQtQX/img/img.png",
  },
  {
    id: 2,
    title: "Strength & Flow Yoga",
    description: "Build strength while improving flexibility",
    duration: "30 min",
    time: "30:15",
    level: "Intermediate",
    thumbnail: "https://c.animaapp.com/mbs2ysbx6IQtQX/img/img-1.png",
  },
  {
    id: 3,
    title: "Cardio Dance Party",
    description: "Fun dance workout to burn calories",
    duration: "25 min",
    time: "25:45",
    level: "Beginner",
    thumbnail: "https://c.animaapp.com/mbs2ysbx6IQtQX/img/img-2.png",
  },
  {
    id: 4,
    title: "Core Blast Workout",
    description: "Targeted core strengthening routine",
    duration: "20 min",
    time: "20:00",
    level: "Intermediate",
    thumbnail: "https://c.animaapp.com/mbs2ysbx6IQtQX/img/img-3.png",
  },
];

export const VideoContentSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("workouts");

  return (
    <section className="w-full flex justify-center py-8 px-4">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-7xl space-y-8">
        {/* Header with title and add button */}
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-3xl text-gray-900 font-sans">
            Video On-Demand
          </h1>

          <Button className="bg-green-500 hover:bg-green-600 text-white">
            <PlusIcon className="h-3.5 w-3.5 mr-2" />
            Add New Section
          </Button>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-[448px]">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 h-[50px] border-gray-300 bg-white"
              placeholder="Search videos"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="w-full max-w-[802px] flex bg-gray-100 h-11 p-1 rounded-lg mb-6">
          {videoCategories.map((category) => (
            <button
              key={category.id}
              className={
                "h-9 px-4 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 data-[state=on]:bg-white data-[state=on]:text-green-700 data-[state=on]:shadow-sm mr-1 last:mr-0" +
                (activeCategory === category.id ? "" : "")
              }
              data-state={activeCategory === category.id ? "on" : undefined}
              onClick={() => setActiveCategory(category.id)}
              type="button"
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videoCards.map((video) => (
            <Card
              key={video.id}
              className="overflow-hidden border shadow-[0px_1px_2px_#0000000d] w-full"
            >
              <div className="relative">
                <div
                  className="h-48 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${video.thumbnail})` }}
                >
                  <div className="absolute inset-0 bg-[#00000033] flex items-center justify-center">
                    <div className="w-12 h-12 bg-[#ffffffe6] rounded-full flex items-center justify-center">
                      <PlayIcon className="h-[18px] w-[13.5px] text-black" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-[#000000b2] rounded px-2 py-1">
                    <span className="text-white text-xs">{video.time}</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-normal text-gray-900 text-base mb-2">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {video.description}
                </p>
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>{video.duration}</span>
                  <span
                    className={
                      "px-2 py-1 font-medium rounded-full text-xs " +
                      (video.level === "Beginner"
                        ? "bg-green-100 text-green-800"
                        : video.level === "Intermediate"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800")
                    }
                  >
                    {video.level}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
