import React from "react";
import { HeaderSection } from "./HeaderSection";
import { ProgramsSection } from "./ProgramsSection";

const ProgramLibrary: React.FC = () => {
  return (
    <main className="flex flex-col w-full bg-background" data-model-id="39:4">
      <div className="w-full bg-gray-50">
        <HeaderSection />
        <ProgramsSection />
      </div>
    </main>
  );
};

export default ProgramLibrary;
