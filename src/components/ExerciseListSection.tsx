// src/components/ExerciseListSection.tsx
'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EditIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createClient } from '@/utils/supabase/client';

function getVideoThumbnail(url: string): string {
  if (!url) return "/default-thumbnail.png";

  try {
    const youtubeMatch = url.match(
      /(?:youtube\.com\/.*v=|youtu\.be\/)([\w-]{11})/
    );
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
    }

    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
    }
  } catch (err) {
    console.error("Error extracting thumbnail:", err);
  }

  return "/default-thumbnail.png";
}

export const ExerciseListSection: React.FC = () => {
  const router = useRouter();
  const [exerciseTab, setExerciseTab] = useState("all");
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchExercises = async () => {
      setLoading(true);
      const supabase = createClient();
      let query = supabase.from('exercise_library').select('*');
      if (exerciseTab === 'all') {
        query = query
          .eq('is_active', true)
          .eq('is_draft', false)
          .or(`is_global.eq.true,coach_id.eq.${userId}`);
      } else if (exerciseTab === 'mine') {
        query = query
          .eq('is_global', false)
          .eq('coach_id', userId)
          .eq('is_active', true)
          .eq('is_draft', false);
      } else if (exerciseTab === 'drafts') {
        query = query
          .eq('is_draft', true)
          .eq('coach_id', userId);
      } else if (exerciseTab === 'archived') {
        query = query
          .eq('is_active', false)
          .eq('is_draft', false)
          .eq('coach_id', userId);
      }
      const { data, error } = await query.order('name');
      if (!error && data) setExercises(data);
      setLoading(false);
    };
    fetchExercises();
  }, [exerciseTab, userId]);

  return (
    <section className="w-full flex justify-center py-8 px-5">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-7xl space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-3xl text-gray-900">Exercises</h1>
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => router.push("/training-hub/exercise-builder")}
          >
            <PlusIcon className="h-4 w-4 mr-2" /> Add New Exercise
          </Button>
        </div>

        <div className="w-fit mb-4">
          <ToggleGroup
            type="single"
            value={exerciseTab}
            onValueChange={v => v && setExerciseTab(v)}
            className="bg-gray-100 rounded-lg p-1"
          >
            <ToggleGroupItem value="all" className="rounded-md h-9 px-4 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-green-700">All exercises</ToggleGroupItem>
            <ToggleGroupItem value="mine" className="rounded-md h-9 px-4 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-green-700">My Exercises</ToggleGroupItem>
            <ToggleGroupItem value="drafts" className="rounded-md h-9 px-4 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-green-700">Drafts</ToggleGroupItem>
            <ToggleGroupItem value="archived" className="rounded-md h-9 px-4 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-green-700">Archive</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="w-full max-w-[448px]">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 h-[50px] border-gray-300 bg-white"
              placeholder="Search exercises"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {exercises.map((exercise: any) => (
              <Card key={exercise.id} className="overflow-hidden border shadow-[0px_1px_2px_#0000000d]">
                <div className="relative h-40">
                  <img
                    src={getVideoThumbnail(exercise.video_url_1 || '')}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button className="w-8 h-8 bg-[#ffffffe6] rounded-full flex items-center justify-center">
                      <EditIcon className="h-3.5 w-3.5" />
                    </button>
                    <button className="w-8 h-8 bg-[#ffffffe6] rounded-full flex items-center justify-center">
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-normal text-base text-gray-900">{exercise.name}</h3>
                  <p className="font-normal text-sm text-gray-600">
                    {(exercise.muscles_trained || []).join(", ")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
