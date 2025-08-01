export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import { ProgramsSection } from "@/components/ProgramsSection";

export default async function ProgramLibraryPage() {
  const supabase = await createClient();

  const { data: programs, error } = await supabase
    .from("programs")
    .select("id, name, image, difficulty, equipment, lastModified, is_active")
    .order("lastModified", { ascending: false });

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading programs: {error.message}
      </div>
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <div className="p-6 text-gray-500">No programs available right now.</div>
    );
  }

  return <ProgramsSection programs={programs} />;
}
