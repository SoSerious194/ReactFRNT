'use client';
import { ArrowLeftIcon, PlusIcon, XIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { useRouter } from "next/navigation";
import { WorkoutSelectModal } from './ui/WorkoutSelectModal';
import { createClient } from '@/utils/supabase/client';

// Data for the days and their workouts
const days = [
  { day: 1, workouts: [] },
  { day: 2, workouts: [] },
  { day: 3, workouts: [] },
  { day: 4, workouts: [] },
  { day: 5, workouts: [] },
  { day: 6, workouts: [] },
  { day: 7, workouts: [] },
  { day: 8, workouts: [] },
  { day: 9, workouts: [] },
  { day: 10, workouts: [] },
];

// Quick add options
const quickAddOptions = [
  { label: "Add Cardio", color: "bg-green-100 text-green-700" },
  { label: "Add Mobility", color: "bg-purple-100 text-purple-700" },
  { label: "Add Activity", color: "bg-orange-100 text-orange-700" },
  { label: "Add Rest Day", color: "bg-red-100 text-red-700" },
];

type Workout = {
  id: string;
  name: string;
  difficulty: string;
  duration: string;
  equipment: string;
  lastModified: string;
};

export const ProgramScheduleSection = () => {
  const router = useRouter();
  const [scheduleLength, setScheduleLength] = useState(7);
  const [selectedToggle, setSelectedToggle] = useState('7-Day');
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [dayWorkouts, setDayWorkouts] = useState<{ [day: number]: Workout[] }>({});
  const [openMenu, setOpenMenu] = useState<{ day: number, index: number } | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('workouts')
        .select('id, name, difficulty, equipment, duration, lastModified')
        .order('lastModified', { ascending: false });
      if (!error && data) setWorkouts(data);
    };
    fetchWorkouts();
  }, []);

  const handleToggle = (value: string) => {
    setSelectedToggle(value);
    if (value === "5-Day") setScheduleLength(5);
    else if (value === "6-Day") setScheduleLength(6);
    else if (value === "7-Day") setScheduleLength(7);
    else if (value === "8-Day") setScheduleLength(8);
    else if (value === "10-Day") setScheduleLength(10);
  };

  return (
    <>
      <section className="w-full p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            className="p-0 h-6 gap-2"
            size="sm"
            onClick={() => router.push("/training-hub/program-library")}
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span className="font-medium text-gray-600">Back</span>
          </Button>
          <h1 className="font-bold text-2xl text-gray-900">Program Builder</h1>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-lg font-normal text-gray-900">Program Schedule</h2>
          <ToggleGroup
            type="single"
            value={selectedToggle}
            className="bg-gray-100 rounded-lg"
            onValueChange={handleToggle}
          >
            <ToggleGroupItem value="5-Day" className="h-7 px-3 text-sm data-[state=on]:bg-green-500 data-[state=on]:text-white">5-Day</ToggleGroupItem>
            <ToggleGroupItem value="6-Day" className="h-7 px-3 text-sm data-[state=on]:bg-green-500 data-[state=on]:text-white">6-Day</ToggleGroupItem>
            <ToggleGroupItem value="7-Day" className="h-7 px-3 text-sm data-[state=on]:bg-green-500 data-[state=on]:text-white">7-Day</ToggleGroupItem>
            <ToggleGroupItem value="8-Day" className="h-7 px-3 text-sm data-[state=on]:bg-green-500 data-[state=on]:text-white">8-Day</ToggleGroupItem>
            <ToggleGroupItem value="10-Day" className="h-7 px-3 text-sm data-[state=on]:bg-green-500 data-[state=on]:text-white">10-Day</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className={`grid gap-4 ${
          scheduleLength === 5
            ? 'grid-cols-5'
            : scheduleLength === 6
            ? 'grid-cols-6'
            : scheduleLength === 7
            ? 'grid-cols-7'
            : scheduleLength === 8
            ? 'grid-cols-4'
            : 'grid-cols-5'
        }`}>
          {Array.from({ length: scheduleLength }).map((_, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="bg-green-500 text-white font-medium py-3 text-center rounded-t-lg">
                Day {idx + 1}
              </div>
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-b-lg p-[18px] flex flex-col gap-4">
                {/* Render added workouts for this day */}
                {(dayWorkouts[idx + 1] || []).map((workout, i) => (
                  <Card key={i} className="mb-2 border-green-200 relative">
                    <CardContent className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{workout.name}</div>
                      {/* Options button */}
                      <button
                        className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu && openMenu.day === idx + 1 && openMenu.index === i ? null : { day: idx + 1, index: i });
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008Z" />
                        </svg>
                      </button>
                      {/* Dropdown menu */}
                      {openMenu && openMenu.day === idx + 1 && openMenu.index === i && (
                        <div className="absolute top-8 right-2 bg-white border rounded shadow z-10 w-28">
                          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm" onClick={() => {/* Edit logic here */}}>Edit</button>
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                            onClick={() => {
                              setDayWorkouts(prev => ({
                                ...prev,
                                [idx + 1]: prev[idx + 1].filter((_, j) => j !== i)
                              }));
                              setOpenMenu(null);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      {/* Vertical preview */}
                      <div className="text-xs text-gray-400 mt-2">
                        <div>3x12 Bench Press</div>
                        <div>4x8 Squats</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Card
                  className="border-blue-200 group hover:bg-blue-600 transition-colors cursor-pointer"
                  onClick={() => { setShowModal(true); setSelectedDay(idx + 1); }}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 group-hover:bg-white">
                        <PlusIcon className="h-6 w-6 text-blue-600 group-hover:text-black" />
                      </div>
                      <p className="text-sm text-blue-600 group-hover:text-white text-center">
                        Add Workout
                      </p>
                    </div>
                  </CardContent>
                </Card>
                {/* Quick Add Options */}
                <div className="flex flex-col gap-2">
                  {quickAddOptions.map((option, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className={`${option.color} text-xs justify-center h-8`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <WorkoutSelectModal
        show={showModal}
        onClose={() => setShowModal(false)}
        workouts={workouts}
        dayNumber={selectedDay}
        onAddWorkout={(workout) => {
          if (selectedDay) {
            setDayWorkouts(prev => ({
              ...prev,
              [selectedDay]: [...(prev[selectedDay] || []), workout]
            }));
          }
          setShowModal(false);
        }}
      />
    </>
  );
};
