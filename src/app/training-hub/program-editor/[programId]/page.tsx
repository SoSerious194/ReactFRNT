'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { HeaderSection } from "@/components/HeaderSection";
import { ProgramScheduleSection } from "@/components/ProgramScheduleSection";

export default function ProgramEditorPage() {
  const { programId } = useParams();
  const [programData, setProgramData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgramData = async () => {
      const supabase = createClient();

      // 1. Fetch program info
      const { data: program, error: programError } = await supabase
        .from("programs")
        .select("*")
        .eq("id", programId)
        .single();

      if (programError || !program) {
        console.error("Error fetching program:", programError);
        return;
      }

      // 2. Fetch program_days
      const { data: days, error: daysError } = await supabase
        .from("program_days")
        .select("day, workout_id, is_rest_day, notes, workouts (id, name, duration, difficulty)")
        .eq("program_id", programId)
        .order("day", { ascending: true })
        .order("position", { ascending: true });

      if (daysError) {
        console.error("Error fetching days:", daysError);
        return;
      }

      // 3. Convert day data into format builder wants
      const dayWorkouts: { [key: number]: any[] } = {};
      let maxDay = 0;
      
      days.forEach(day => {
        if (!dayWorkouts[day.day]) {
          dayWorkouts[day.day] = [];
        }
        if (day.workouts && !day.is_rest_day) {
          dayWorkouts[day.day].push(day.workouts);
        }
        maxDay = Math.max(maxDay, day.day);
      });

      setProgramData({
        id: program.id,
        name: program.name,
        scheduleLength: maxDay || 7, // Calculate from actual days or default to 7
        dayWorkouts,
      });

      setLoading(false);
    };

    if (programId) fetchProgramData();
  }, [programId]);

  if (loading) {
    return <div className="p-8 text-gray-600">Loading program...</div>;
  }

  return (
    <div className="flex flex-col w-full">
      <ProgramScheduleSection mode="edit" program={programData} />
    </div>
  );
}
