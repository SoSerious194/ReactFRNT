'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderSection } from "@/components/HeaderSection";
import { ProgramScheduleSection } from "@/components/ProgramScheduleSection";

// import { supabase } from "@/lib/supabaseClient"; // Uncomment when ready

export default function ProgramEditorPage() {
  const { programId } = useParams();
  const [programData, setProgramData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Placeholder useEffect — real data fetching coming soon
  useEffect(() => {
    if (programId) {
      // 👇 Uncomment and replace when Supabase is ready
      /*
      const fetchProgram = async () => {
        const { data, error } = await supabase
          .from("programs")
          .select("*")
          .eq("id", programId)
          .single();

        if (error) {
          console.error("Error fetching program:", error);
        } else {
          setProgramData(data);
        }

        setLoading(false);
      };

      fetchProgram();
      */
      
      // TEMPORARY: Simulate loading
      const timeout = setTimeout(() => {
        setProgramData({
          id: programId,
          name: "Placeholder Program",
          days: [], // Replace with actual structure later
        });
        setLoading(false);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [programId]);

  if (loading) {
    return <div className="p-8 text-gray-600">Loading program...</div>;
  }

  return (
    <div className="flex flex-col w-full">
      <HeaderSection />
      <ProgramScheduleSection mode="edit" program={programData} />
    </div>
  );
}
