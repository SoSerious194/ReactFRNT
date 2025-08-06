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
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';

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

type ProgramScheduleSectionProps = {
  mode: "create" | "edit";
  program?: {
    id: string;
    name: string;
    scheduleLength: number;
    dayWorkouts: { [day: number]: Workout[] };
  };
};

// DraggableWorkout component
function DraggableWorkout({ id, data, children, onDragStart, ...props }: any) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onMouseDown={onDragStart}
      style={{
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 50 : 'auto',
        boxShadow: isDragging ? '0 4px 24px 0 rgba(34,197,94,0.25)' : undefined,
        transform: isDragging ? 'scale(1.04)' : 'scale(1)',
        transition: 'box-shadow 0.15s, transform 0.15s, opacity 0.15s',
        borderRadius: '0.5rem',
        outline: isDragging ? '3px solid #22c55e' : undefined,
        outlineOffset: isDragging ? '2px' : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// DroppableDay component
function DroppableDay({ id, children }: any) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="flex flex-col">
      {children}
    </div>
  );
}

export const ProgramScheduleSection = ({ mode, program }: ProgramScheduleSectionProps) => {
  const router = useRouter();
  const [scheduleLength, setScheduleLength] = useState<number>(program?.scheduleLength ?? 7);
  const [selectedToggle, setSelectedToggle] = useState(
    `${program?.scheduleLength ?? 7}-Day`
  );
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [dayWorkouts, setDayWorkouts] = useState<{ [day: number]: Workout[] }>(
    program?.dayWorkouts ?? {}
  );
  const [openMenu, setOpenMenu] = useState<{ day: number, index: number } | null>(null);
  const [activeDrag, setActiveDrag] = useState<null | { day: number; index: number; workout: Workout }>(null);
  const [overDay, setOverDay] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

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
    const len = parseInt(value.split("-")[0]);
    setScheduleLength(len);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    if (over && typeof over.id === 'string' && over.id.startsWith('day-')) {
      setOverDay(parseInt(over.id.replace('day-', '')));
    } else {
      setOverDay(null);
    }
  };

  const handleDragEnd = (event: any) => {
    const { over } = event;
    if (activeDrag && over && over.id && typeof over.id === 'string' && over.id.startsWith('day-')) {
      const targetDay = parseInt(over.id.replace('day-', ''));
      if (targetDay !== activeDrag.day) {
        setDayWorkouts(prev => {
          const sourceList = [...(prev[activeDrag.day] || [])];
          const [movedWorkout] = sourceList.splice(activeDrag.index, 1);
          const targetList = [...(prev[targetDay] || []), movedWorkout];
          return {
            ...prev,
            [activeDrag.day]: sourceList,
            [targetDay]: targetList,
          };
        });
      }
    }
    setActiveDrag(null);
    setOverDay(null);
  };

  // Save handlers
  const handleSave = async (asDraft = false) => {
    if (!program?.id) {
      console.error('No program ID available for saving');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      // Update the program's lastModified timestamp
      await supabase
        .from('programs')
        .update({ 
          lastModified: new Date().toISOString()
        })
        .eq('id', program.id);

      // Delete existing program_days for this program
      await supabase
        .from('program_days')
        .delete()
        .eq('program_id', program.id);

      // Insert new program_days based on current dayWorkouts
      const programDaysToInsert = [];
      
      for (let day = 1; day <= scheduleLength; day++) {
        const dayWorkoutsList = dayWorkouts[day] || [];
        
        if (dayWorkoutsList.length === 0) {
          // Insert rest day
          programDaysToInsert.push({
            program_id: program.id,
            day: day,
            is_rest_day: true,
            position: 0
          });
        } else {
          // Insert workouts for this day
          dayWorkoutsList.forEach((workout, index) => {
            programDaysToInsert.push({
              program_id: program.id,
              day: day,
              workout_id: workout.id,
              is_rest_day: false,
              position: index
            });
          });
        }
      }

      if (programDaysToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('program_days')
          .insert(programDaysToInsert);

        if (insertError) {
          console.error('Error inserting program days:', insertError);
          alert('Error saving program: ' + insertError.message);
          return;
        }
      }

      alert(asDraft ? 'Program saved as draft!' : 'Program saved successfully!');
      
      // Optionally redirect back to program library
      if (!asDraft) {
        router.push('/training-hub/program-library');
      }

    } catch (error) {
      console.error('Error saving program:', error);
      alert('Error saving program. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Auto-schedule handler (simple round-robin from available workouts)
  const handleAutoSchedule = () => {
    if (workouts.length === 0) return;
    setDayWorkouts(() => {
      const newSchedule: { [day: number]: Workout[] } = {};
      for (let d = 1; d <= scheduleLength; d++) {
        newSchedule[d] = [workouts[(d - 1) % workouts.length]];
      }
      return newSchedule;
    });
  };

  // Clear all handler
  const handleClearAll = () => {
    setDayWorkouts({});
  };

  return (
    <>
      <div className="flex justify-between items-center px-6 pt-6">
        <div></div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleSave(true)} 
            className="border-gray-300"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white" 
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Program'}
          </Button>
        </div>
      </div>
      <DndContext onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
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
            <h1 className="font-bold text-2xl text-gray-900">
              {mode === "edit" ? "Edit Program" : "Program Builder"}
            </h1>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg font-normal text-gray-900">Program Schedule</h2>
            <ToggleGroup
              type="single"
              value={selectedToggle}
              className="bg-gray-100 rounded-lg"
              onValueChange={handleToggle}
            >
              {[5, 6, 7, 8, 10].map((n) => (
                <ToggleGroupItem
                  key={n}
                  value={`${n}-Day`}
                  className="h-7 px-3 text-sm data-[state=on]:bg-green-500 data-[state=on]:text-white"
                >
                  {n}-Day
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="flex-1" />
            <Button variant="ghost" className="text-gray-600" onClick={handleClearAll}>Clear All</Button>
            <Button variant="outline" className="border-green-500 text-green-600" onClick={handleAutoSchedule}>Auto-Schedule</Button>
          </div>

          <div className={`grid gap-4 ${scheduleLength <= 5 ? 'grid-cols-5' : scheduleLength <= 6 ? 'grid-cols-6' : scheduleLength <= 7 ? 'grid-cols-7' : scheduleLength === 8 ? 'grid-cols-4' : 'grid-cols-5'}`}>
            {Array.from({ length: scheduleLength }).map((_, idx) => {
              const dayNum = idx + 1;
              return (
                <DroppableDay key={idx} id={`day-${dayNum}`}>
                  <div className="bg-green-500 text-white font-medium py-3 text-center rounded-t-lg">
                    Day {dayNum}
                  </div>
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-b-lg p-[18px] flex flex-col gap-4 min-h-[60px]">
                    {(dayWorkouts[dayNum] || []).map((workout, i) => {
                      const isActive = activeDrag && activeDrag.day === dayNum && activeDrag.index === i;
                      return (
                        <DraggableWorkout
                          key={i}
                          id={`workout-${dayNum}-${i}`}
                          data={{ day: dayNum, index: i, workout }}
                          onDragStart={() => setActiveDrag({ day: dayNum, index: i, workout })}
                          style={{ visibility: isActive ? 'hidden' : undefined }}
                        >
                          <Card className="mb-2 border-green-200 relative cursor-move">
                            <CardContent className="py-3 px-4">
                              <div className="font-semibold text-gray-900">{workout.name}</div>
                              <button
                                className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100"
                                onClick={e => {
                                  e.stopPropagation();
                                  setOpenMenu(openMenu && openMenu.day === dayNum && openMenu.index === i ? null : { day: dayNum, index: i });
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008Z" />
                                </svg>
                              </button>
                              {openMenu && openMenu.day === dayNum && openMenu.index === i && (
                                <div className="absolute top-8 right-2 bg-white border rounded shadow z-10 w-28">
                                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Edit</button>
                                  <button
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                                    onClick={() => {
                                      setDayWorkouts(prev => ({
                                        ...prev,
                                        [dayNum]: prev[dayNum].filter((_, j) => j !== i)
                                      }));
                                      setOpenMenu(null);
                                    }}
                                  >Remove</button>
                                </div>
                              )}
                              <div className="text-xs text-gray-400 mt-2">
                                <div>3x12 Bench Press</div>
                                <div>4x8 Squats</div>
                              </div>
                            </CardContent>
                          </Card>
                        </DraggableWorkout>
                      );
                    })}
                    {overDay === dayNum && activeDrag && (
                      <div className="h-12 bg-gray-200 rounded-lg border-2 border-gray-400 border-dashed flex items-center justify-center mb-2 animate-pulse">
                        <span className="text-gray-500 text-sm">Drop here</span>
                      </div>
                    )}
                    <Card
                      className="border-blue-200 group hover:bg-blue-600 transition-colors cursor-pointer"
                      onClick={() => { setShowModal(true); setSelectedDay(dayNum); }}
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
                </DroppableDay>
              );
            })}
          </div>
        </section>
        <DragOverlay>
          {activeDrag ? (
            <Card className="mb-2 border-green-200 relative cursor-move scale-105 shadow-2xl ring-4 ring-green-400">
              <CardContent className="py-3 px-4">
                <div className="font-semibold text-gray-900">{activeDrag.workout.name}</div>
                <div className="text-xs text-gray-400 mt-2">
                  <div>3x12 Bench Press</div>
                  <div>4x8 Squats</div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

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
