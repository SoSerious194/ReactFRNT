'use client';
import React from "react";
import { HeaderSection } from "@/components/HeaderSection";
import { WorkoutsSection } from "@/components/WorkoutsSection";

export const WorkoutLibrary = () => {
  return (
    <main className="flex flex-col w-full bg-white" data-model-id="50:6">
      <div className="w-full bg-gray-50">
        <HeaderSection />
        <WorkoutsSection />
      </div>
    </main>
  );
};
