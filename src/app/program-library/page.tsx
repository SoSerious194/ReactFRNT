'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { HeaderSection } from "@/components/HeaderSection";
import { ProgramsSection } from "@/components/ProgramsSection";

export default function ProgramLibraryPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col w-full bg-gray-50">
      <HeaderSection />

      <ProgramsSection />
    </main>
  );
}
