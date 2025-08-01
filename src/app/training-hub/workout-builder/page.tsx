import WorkoutBuilderSection from "@/components/WorkoutBuilderSection";

export default async function WorkoutBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; duplicate?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="h-full">
      <WorkoutBuilderSection
        editWorkoutId={params.edit}
        duplicateWorkoutId={params.duplicate}
      />
    </div>
  );
}
