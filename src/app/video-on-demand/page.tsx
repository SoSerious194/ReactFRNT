'use client';
import React from "react";
import { HeaderSection } from "@/components/HeaderSection";
import { Card } from "../../components/ui/card";
import { VideoContentSection } from "@/components/VideoContentSection";

export default function VideoOnDemandPage() {
  return (
    <Card
      className="flex flex-col w-full bg-white border-2 border-solid border-[#ced4da] overflow-hidden"
      data-model-id="53:2922"
    >
      <div className="w-full bg-gray-50">
        <HeaderSection />
        <VideoContentSection />
      </div>
    </Card>
  );
}
