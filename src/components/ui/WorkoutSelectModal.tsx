// components/WorkoutSelectModal.tsx
import React from 'react';

type Workout = {
  id: string;
  name: string;
  difficulty: string;
  duration: string;
  equipment: string;
  lastModified: string;
};

interface WorkoutSelectModalProps {
  show: boolean;
  onClose: () => void;
  workouts: Workout[];
  dayNumber: number | null;
  onAddWorkout: (workout: Workout) => void;
}

export const WorkoutSelectModal = ({ show, onClose, workouts = [], dayNumber, onAddWorkout }: WorkoutSelectModalProps) => {
  const [selectedWorkoutId, setSelectedWorkoutId] = React.useState<string | null>(null);
  if (!show) return null;

  const selectedWorkout = workouts.find(w => w.id === selectedWorkoutId) || null;

  // Clear selection when modal closes
  const handleClose = () => {
    setSelectedWorkoutId(null);
    onClose();
  };

  // Hard-coded exercise details for preview
  const exerciseDetails = [
    { sets: 3, reps: 12, name: 'Bench Press' },
    { sets: 4, reps: 8, name: 'Squats' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="text-xl font-semibold mb-4">Select Workout</div>

        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          onClick={handleClose}
        >
          ✕
        </button>

        {/* Modal Content: List of Workouts */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {workouts.length === 0 ? (
            <p className="text-sm text-gray-600">No workouts found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {workouts.map((workout) => (
                <li
                  key={workout.id}
                  onClick={() => setSelectedWorkoutId(workout.id)}
                  className={`py-2 px-3 flex flex-col rounded cursor-pointer transition-colors border ${selectedWorkoutId === workout.id ? 'bg-blue-100 border-blue-500' : 'border-transparent hover:bg-gray-50'}`}
                >
                  <span className="font-medium text-gray-900">{workout.name}</span>
                  <span className="text-xs text-gray-500">{workout.difficulty} • {workout.duration} • {workout.equipment}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedWorkout && dayNumber && (
          <button
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors"
            onClick={() => onAddWorkout(selectedWorkout)}
          >
            Add workout to Day {dayNumber}
          </button>
        )}

        {/* Side panel for workout details */}
        {selectedWorkout && (
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 p-6 flex flex-col border-l border-gray-200">
            <button className="self-end mb-4 text-2xl text-gray-500 hover:text-black" onClick={() => setSelectedWorkoutId(null)}>✕</button>
            <h2 className="font-bold text-lg mb-4">{selectedWorkout.name}</h2>
            <div className="space-y-4">
              {exerciseDetails.map((ex, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="font-semibold text-sm">{ex.sets} sets x {ex.reps} reps</span>
                  <span className="text-gray-600 text-sm">{ex.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
