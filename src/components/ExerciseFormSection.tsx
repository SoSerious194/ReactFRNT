'use client';
import { ArrowLeftIcon, Search, SparklesIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect, OptionType } from "@/components/ui/MultiSelect";
import { createClient } from '@/utils/supabase/client';

// Dropdown options
const musclesTrainedOptions = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps",
  "Core", "Obliques", "Glutes", "Hamstrings", "Quads",
  "Calves", "Hip Flexors", "Forearms", "Neck",
  "Full Body", "Cardiovascular", "Mobility"
];
const exerciseTypeOptions = [
  "Strength", "Mobility", "Warm-Up", "Cool-Down",
  "Plyometric", "Isometric", "Stretching", "Cardio",
  "Rehab", "Balance"
];
const defaultUnitsOptions = [
  "reps", "time", "weight", "distance", "calories"
];
const targetGoalsOptions = [
  "Hypertrophy", "Strength", "Endurance", "Explosiveness",
  "Mobility", "Stability", "Rehab", "Fat Loss", "Cardiovascular Conditioning"
];
const difficultyLevelsOptions = [
  "Beginner", "Intermediate", "Advanced", "Elite"
];
const equipmentOptions = [
  "Bodyweight", "Barbell", "Dumbbell", "Kettlebell", "Resistance Band",
  "Cable Machine", "Smith Machine", "Trap Bar", "EZ Bar", "Bench",
  "Foam Roller", "Box", "Step", "Medicine Ball", "TRX / Rings",
  "Treadmill", "Bike", "Rower", "Sled", "Other"
];

const mapToOptions = (options: string[]): OptionType[] => options.map(option => ({ label: option, value: option }));

export const ExerciseFormSection = () => {
  // State for dropdowns
  const [musclesTrained, setMusclesTrained] = React.useState<string[]>([]);
  const [exerciseType, setExerciseType] = React.useState("");
  const [defaultUnit, setDefaultUnit] = React.useState<string[]>([]);
  const [targetGoal, setTargetGoal] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("");
  const [equipment, setEquipment] = React.useState<string[]>([]);
  const [exerciseName, setExerciseName] = React.useState("");
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    };
    fetchUser();
  }, []);

  const handleSave = async (asDraft: boolean) => {
    if (!userId) return alert('User not found');
    const supabase = createClient();
    // Collect form data here (add more fields as needed)
    const exercise = {
      name: exerciseName,
      muscles_trained: [], // TODO: get from state
      video_url_1: '', // TODO: get from input
      is_draft: asDraft,
      is_active: !asDraft,
      coach_id: userId,
      is_global: false,
      // ... add other fields as needed
    };
    const { error } = await supabase.from('exercises').insert([exercise]);
    if (!error) {
      alert(asDraft ? 'Saved as draft!' : 'Exercise saved!');
    } else {
      alert('Error saving exercise');
    }
  };

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <Card className="w-full rounded-lg border shadow-sm">
        <div className="relative">
          {/* Header */}
          <div className="flex items-center h-[82px] border-b">
            <Button
              variant="ghost"
              className="ml-6 flex items-center gap-2 text-gray-600"
              onClick={() => window.location.href = '/training-hub/exercise-library'}
            >
              <ArrowLeftIcon size={15} />
              <span className="font-medium text-[17px]">Back</span>
            </Button>
            <h1 className="ml-8 font-bold text-gray-900 text-3xl">
              Exercise Builder
            </h1>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <div className="flex gap-9">
              {/* Left Column */}
              <div className="w-1/3 bg-green-50 rounded-lg p-7 space-y-7">
                {/* Exercise Name */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-[15.7px]">Exercise Name</label>
                  <Input
                    className="h-[47px] bg-white"
                    placeholder="Enter exercise name"
                    value={exerciseName}
                    onChange={e => setExerciseName(e.target.value)}
                  />
                </div>
                {/* Video URL 1 */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-[15.7px]">Video URL 1</label>
                  <p className="text-gray-500 text-[13.5px]">Paste YouTube or Vimeo URL</p>
                  <Input className="h-[47px] bg-white" placeholder="Paste video URL" />
                </div>
                {/* Video URL 2 */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-[15.7px]">Video URL 2</label>
                  <p className="text-gray-500 text-[13.5px]">Paste YouTube or Vimeo URL (optional)</p>
                  <Input className="h-[47px] bg-white" placeholder="Paste video URL (optional)" />
                </div>
                {/* AI Autofill Card */}
                <Card className="border-green-200 bg-white">
                  <CardContent className="p-7 space-y-5">
                    <h3 className="font-medium text-gray-900 text-[20px]">
                      AI Autofill
                    </h3>
                    <p className="font-normal text-gray-600 text-[15.7px]">
                      Add exercise data in seconds
                    </p>
                    <Button className="h-[45px] w-[164px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      <SparklesIcon size={18} className="mr-2" />
                      AI Autofill
                    </Button>
                    <div className="space-y-1">
                      <p className="font-bold text-gray-500 text-[13.5px]">
                        RECOMMENDED FLOW:
                      </p>
                      <p className="font-medium text-gray-500 text-[13.5px]">
                        Enter Exercise Name and/or Video
                      </p>
                      <p className="font-medium text-gray-500 text-[13.5px]">
                        URL and let our AI fill in the rest.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Middle Column */}
              <div className="w-1/3 space-y-[26px]">
                {/* Muscles Trained */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-[15.7px]">Muscles Trained</label>
                  <MultiSelect
                    options={mapToOptions(musclesTrainedOptions)}
                    selected={musclesTrained}
                    onChange={setMusclesTrained}
                    placeholder="Select up to 3"
                    limit={3}
                    className="h-[47px] bg-white"
                  />
                </div>
                {/* Exercise Type */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-[15.7px]">Exercise Type</label>
                  <Select value={exerciseType} onValueChange={setExerciseType}>
                    <SelectTrigger className="h-[47px] bg-white">
                      <SelectValue placeholder="Select exercise type" />
                    </SelectTrigger>
                    <SelectContent>
                      {exerciseTypeOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Default Unit(s) */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-[15.7px]">Default Unit(s)</label>
                  <MultiSelect
                    options={mapToOptions(defaultUnitsOptions)}
                    selected={defaultUnit}
                    onChange={setDefaultUnit}
                    placeholder="Select up to 2"
                    limit={2}
                    className="h-[47px] bg-white"
                  />
                </div>
                {/* Target Goal */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-[15.7px]">Target Goal</label>
                  <Select value={targetGoal} onValueChange={setTargetGoal}>
                    <SelectTrigger className="h-[47px] bg-white">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {targetGoalsOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Difficulty */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-[15.7px]">Difficulty</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="h-[47px] bg-white">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevelsOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Equipment */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-[15.7px]">Equipment</label>
                  <MultiSelect
                    options={mapToOptions(equipmentOptions)}
                    selected={equipment}
                    onChange={setEquipment}
                    placeholder="Select up to 3"
                    limit={3}
                    className="h-[47px] bg-white"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="w-1/3 space-y-[26px]">
                {/* Exercise Progressions */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-[15.7px]">
                    Exercise Progressions
                  </label>
                  <p className="text-gray-500 text-[13.5px]">
                    Harder variations of this exercise
                  </p>
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-[18px] w-[18px] text-gray-400" />
                    <Input
                      className="h-[47px] pl-12 bg-white"
                      placeholder="Search exercise library"
                    />
                  </div>
                </div>

                {/* Exercise Regressions */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-[15.7px]">
                    Exercise Regressions
                  </label>
                  <p className="text-gray-500 text-[13.5px]">
                    Easier variations of this exercise
                  </p>
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-[18px] w-[18px] text-gray-400" />
                    <Input
                      className="h-[47px] pl-12 bg-white"
                      placeholder="Search exercise library"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-[15.7px]">
                    Instructions
                  </label>
                  <Textarea className="h-[236px] bg-white" />
                </div>

                {/* Save Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    className="h-[74px] w-[160px] flex flex-col py-2.5 text-gray-700 font-bold"
                    onClick={() => handleSave(true)}
                  >
                    <span>Save as</span>
                    <span>Draft</span>
                  </Button>
                  <Button className="h-[72px] w-[163px] flex flex-col py-2.5 bg-green-500 hover:bg-green-600 font-bold"
                    onClick={() => handleSave(false)}
                  >
                    <span>Save</span>
                    <span>Exercise</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
