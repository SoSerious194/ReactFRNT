'use client';

import React from "react";
import { HeaderSection } from "@/components/HeaderSection";
import { VideoContentSection } from "@/components/VideoContentSection";

export default function VideoOnDemandPage() {
  return (
    <div className="flex flex-col w-full bg-gray-50">
      <HeaderSection />
      <VideoContentSection />
    </div>
  );
}
