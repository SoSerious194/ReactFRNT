"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { HeaderSection } from "@/components/HeaderSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface Exercise {
  id: string;
  name: string;
  video_url_1?: string;
  video_url_2?: string;
  image?: string;
  difficulty?: string;
  equipment?: string;
  exercise_type?: string;
  muscles_trained?: string;
  instructions?: string;
  cues_and_tips?: string;
  is_active: boolean;
  is_global: boolean;
  coach_id?: string;
}

export default function ExerciseDetailPage() {
  const { exerciseId } = useParams();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchExercise = async () => {
      if (!exerciseId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("exercises")
          .select("*")
          .eq("id", exerciseId)
          .single();

        if (error) {
          console.error("Error fetching exercise:", error);
          setError("Failed to load exercise");
          return;
        }

        setExercise(data);
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load exercise");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId, supabase]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Exercise Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The exercise could not be found."}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderSection />

      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Exercise Media */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {exercise.name}
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        exercise.difficulty === "Advanced"
                          ? "destructive"
                          : exercise.difficulty === "Intermediate"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {exercise.difficulty || "Beginner"}
                    </Badge>
                    {exercise.is_global && (
                      <Badge variant="outline">Global</Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exercise.image && (
                  <div className="mb-4">
                    <img
                      src={exercise.image}
                      alt={exercise.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                {exercise.video_url_1 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Video Tutorial
                    </h3>
                    <video
                      controls
                      className="w-full rounded-lg"
                      poster={exercise.image}
                    >
                      <source src={exercise.video_url_1} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {exercise.video_url_2 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Alternative Video
                    </h3>
                    <video controls className="w-full rounded-lg">
                      <source src={exercise.video_url_2} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Exercise Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exercise Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {exercise.equipment && (
                  <div>
                    <h4 className="font-semibold text-gray-700">Equipment</h4>
                    <p className="text-gray-600">{exercise.equipment}</p>
                  </div>
                )}

                {exercise.exercise_type && (
                  <div>
                    <h4 className="font-semibold text-gray-700">
                      Exercise Type
                    </h4>
                    <p className="text-gray-600">{exercise.exercise_type}</p>
                  </div>
                )}

                {exercise.muscles_trained && (
                  <div>
                    <h4 className="font-semibold text-gray-700">
                      Muscles Trained
                    </h4>
                    <p className="text-gray-600">{exercise.muscles_trained}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {exercise.instructions && (
              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {exercise.instructions}
                  </p>
                </CardContent>
              </Card>
            )}

            {exercise.cues_and_tips && (
              <Card>
                <CardHeader>
                  <CardTitle>Cues & Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {exercise.cues_and_tips}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  router.push(
                    `/training-hub/exercise-builder?edit=${exercise.id}`
                  )
                }
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Exercise
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
