export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import { WorkoutsSection } from "@/components/WorkoutsSection";

export default async function WorkoutLibraryPage() {
  const supabase = await createClient();

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("id, name, difficulty, equipment, duration, lastModified, cover_photo")
    .order("lastModified", { ascending: false });

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading workouts: {error.message}
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return <div className="p-6 text-gray-500">No workouts available yet.</div>;
  }

  return <WorkoutsSection workouts={workouts} />;
}
