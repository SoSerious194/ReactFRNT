'use client';
import React from "react";
import { HeaderSection } from "@/components/HeaderSection";
import { ProgramScheduleSection } from "@/components/ProgramScheduleSection";

export default function ProgramBuilderPage() {
  return (
    <main className="flex flex-col w-full bg-white" data-model-id="87:3518">
      <HeaderSection />
      <div className="ml-[6%] w-[89%]">
        <ProgramScheduleSection />
      </div>
    </main>
  );
};
