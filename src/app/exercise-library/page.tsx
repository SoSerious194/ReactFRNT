'use client';
import React from "react";
import { ExerciseListSection } from "@/components/ExerciseListSection";
import { HeaderSection } from "@/components/HeaderSection";

export default function ExerciseLibraryPage() {
  return (
    <main className="flex flex-col w-full bg-white" data-model-id="53:1932">
      <div className="w-full bg-gray-50">
        <HeaderSection />
        <ExerciseListSection />
      </div>
    </main>
  );
};
