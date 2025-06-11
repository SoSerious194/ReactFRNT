'use client';

import React from "react";
import { ExerciseFormSection } from "@/components/ExerciseFormSection";
import { HeaderSection } from "@/components/HeaderSection";

export default function ExerciseBuilderPage() {
  return (
    <div className="flex flex-col w-full h-full">
      <HeaderSection />
      <div className="flex-1 px-8">
        <ExerciseFormSection />
      </div>
    </div>
  );
}

