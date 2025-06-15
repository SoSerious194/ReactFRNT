// app/training-hub/exercise-library/page.tsx
export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { ExerciseListSection } from '@/components/ExerciseListSection';

export default async function ExerciseLibraryPage() {
  const supabase = await createClient();

  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('id, name, muscles_trained, video_url_1')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading exercises: {error.message}
      </div>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <div className="p-6 text-gray-500">
        No exercises available yet.
      </div>
    );
  }

  return <ExerciseListSection exercises={exercises} />;
}
