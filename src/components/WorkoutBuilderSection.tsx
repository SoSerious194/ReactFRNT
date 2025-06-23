"use client";

import React from "react";
import { useRouter } from "next/navigation";

// SVG icon components for use in place of FontAwesome
const DumbbellIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 640 512"><path fill="currentColor" d="M96 64c0-17.7 14.3-32 32-32h32c17.7 0 32 14.3 32 32V224v64V448c0 17.7-14.3 32-32 32H128c-17.7 0-32-14.3-32-32V384H64c-17.7 0-32-14.3-32-32V288c-17.7 0-32-14.3-32-32s14.3-32 32-32V160c0-17.7 14.3-32 32-32H96V64zm448 0v64h32c17.7 0 32 14.3 32 32v64c17.7 0 32 14.3 32 32s-14.3 32-32 32v64c0 17.7-14.3 32-32 32H544v64c0 17.7-14.3 32-32 32H480c-17.7 0-32-14.3-32-32V288 224 64c0-17.7 14.3-32 32-32h32c17.7 0 32 14.3 32 32zM416 224v64H224V224H416z"/></svg>
);
const PlayIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 384 512"><path fill="currentColor" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>
);
const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 512 512"><path fill="currentColor" d="M3.9 54.9C10.5 40.9 24.5 32 40 32H472c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9V448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6V320.9L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"/></svg>
);
const MagnifierIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 512 512"><path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
);
const MinusIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 16 16"><path d="M4 8h8" strokeWidth="2"/></svg>
);
const EllipsisIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 448 512"><path fill="currentColor" d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/></svg>
);
// Supersets icon
const SupersetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
  </svg>
);
// Circuits icon
const CircuitIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
  </svg>
);
const BarsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 448 512"><path fill="currentColor" d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/></svg>
);

const exerciseFilters = [
  { label: "Exercises", active: true },
  { label: "Circuits/Intervals", active: false },
  { label: "Warm-Ups", active: false },
  { label: "Cool-Downs", active: false },
];

const exerciseCards = [
  {
    name: "Dumbbell Goblet Cossack Squat",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/637bb5a8d2-a94cc1b90202d22b7fcb.png",
    custom: false,
    selected: false,
  },
  {
    name: "Seated Chest Press Machine",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/af0dc728c8-35dd0c81651a70cb0ce1.png",
    custom: false,
    selected: true,
  },
  {
    name: "Toe Rotation",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/01399341cd-3f5ffbec8dc12b64365c.png",
    custom: true,
    selected: false,
  },
  {
    name: "Dumbbell Reverse Wrist Curl",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/ef4e4631eb-99fae3737b488b1f7081.png",
    custom: false,
    selected: false,
  },
  {
    name: "Towel Curls",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/28ae41f464-a064e1ac05324c1fb414.png",
    custom: true,
    selected: false,
  },
  {
    name: "Cat Stretch",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/7a0efec4bd-b9412b7ddd4793007fca.png",
    custom: false,
    selected: false,
  },
  {
    name: "Shoulder Stretch",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/17a0a02b79-2d6cfba82e9808800067.png",
    custom: false,
    selected: false,
  },
];

const sessionArrangement = {
  day: "DAY 6",
  items: [
    { type: "single", name: "Calf Stretch" },
    { type: "superset", name: "Superset 1", exercises: ["Barbell Bench Press", "Dumbbell Pullover"] },
    { type: "circuit", name: "Circuit 1", exercises: ["Dynamic Crossbody Hamstring Stretch", "90/90 Pigeon", "Couch Stretch (Quads)"] },
    { type: "single", name: "Pec Stretch" },
  ],
};

export default function WorkoutBuilderSection() {
  const router = useRouter();

  return (
    <div className="flex h-[calc(100vh-0px)] bg-gray-50">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium text-sm">Exercises</button>
            <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-200">Circuits/Intervals</button>
            <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-200">Warm-Ups</button>
            <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-200">Cool-Downs</button>
          </div>
        </div>
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400"><MagnifierIcon /></span>
            <input type="text" placeholder="Search for your Exercises" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled />
            <button className="absolute right-3 top-3 text-gray-400"><FilterIcon /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {exerciseCards.map((ex, i) => (
              <div
                key={ex.name}
                className={`exercise-card bg-white border ${ex.selected ? "border-blue-500" : "border-gray-200"} rounded-lg p-2 cursor-pointer`}
              >
                <div className="w-full h-16 bg-gray-900 rounded relative mb-2 flex-shrink-0">
                  <img className="w-full h-full object-cover rounded" src={ex.image} alt={ex.name} />
                  <div className="absolute top-1 left-1 bg-black bg-opacity-50 rounded-full w-4 h-4 flex items-center justify-center">
                    <PlayIcon />
                  </div>
                </div>
                <div>
                  <p className={`text-xs font-medium ${ex.selected ? "text-blue-600" : "text-gray-900"}`}>{ex.name}</p>
                  {ex.custom && <p className="text-xs text-gray-400">Custom</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main workout area */}
      <main className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6">
          <button className="flex items-center text-gray-600 hover:text-mint-600 mb-4 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 448 512"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workout Name</h1>
              <p className="text-sm text-gray-600 mt-1">Avoid overstretching and make sure you get a deep stretch in the target muscle without having pain in surrounding joints...</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600"><EllipsisIcon /></button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex p-6 overflow-y-auto">
          <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Calf Stretch Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-900 rounded-lg flex-shrink-0">
                  <img className="w-full h-full object-cover rounded-lg" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/3f2c480691-4390b45c2f550cedc43f.png" alt="person doing calf stretch exercise" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Calf Stretch</h3>
                    <button className="text-gray-400 hover:text-gray-600"><EllipsisIcon /></button>
                  </div>
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-600">Set</th>
                          <th className="text-left py-2 text-gray-600">Time</th>
                          <th className="text-left py-2 text-gray-600">Rest</th>
                          <th className="text-left py-2 text-gray-600"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-gray-50">
                          <td className="py-2">Warm-Up</td>
                          <td className="py-2">00:00:30</td>
                          <td className="py-2">00:00</td>
                          <td className="py-2">
                            <button className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center transition-colors"><MinusIcon /></button>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2">1</td>
                          <td className="py-2">00:01:00</td>
                          <td className="py-2">00:15</td>
                          <td className="py-2">
                            <button className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center transition-colors"><MinusIcon /></button>
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2">2</td>
                          <td className="py-2">00:01:00</td>
                          <td className="py-2">00:15</td>
                          <td className="py-2">
                            <button className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center transition-colors"><MinusIcon /></button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">+ Add Set</button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">+ Add Warm-Up Set</button>
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">+ Add Dropset</button>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-2">Workout-Specific Instructions (Exercise instructions are displayed automatically)</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-600">40 seconds per side. There is a double legged version shown in the video, but I would like for you to do this one at a time because the ankles are a bit stiff.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Superset 1 Card */}
            <div className="bg-yellow-100 rounded-lg border border-yellow-300 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <SupersetIcon />
                <h2 className="text-xl font-bold text-yellow-800">Superset 1</h2>
              </div>
              <div className="space-y-6">
                {/* Barbell Bench Press */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-900 rounded-lg flex-shrink-0">
                      <img className="w-full h-full object-cover rounded-lg" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/61e9b90778-a6a7c4067725f29d3794.png" alt="person doing adductor stretch exercise" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Barbell Bench Press</h3>
                        <button className="text-gray-400 hover:text-gray-600"><EllipsisIcon /></button>
                      </div>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 text-gray-600">Set</th>
                              <th className="text-left py-2 text-gray-600">Reps</th>
                              <th className="text-left py-2 text-gray-600">Weight (lb)</th>
                              <th className="text-left py-2 text-gray-600">Rest</th>
                              <th className="text-left py-2 text-gray-600"></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-gray-50">
                              <td className="py-2">Warm-Up</td>
                              <td className="py-2">8</td>
                              <td className="py-2">-</td>
                              <td className="py-2">00:00</td>
                              <td className="py-2"><button className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center transition-colors"><MinusIcon /></button></td>
                            </tr>
                            <tr>
                              <td className="py-2">1</td>
                              <td className="py-2">12</td>
                              <td className="py-2">15</td>
                              <td className="py-2">00:15</td>
                              <td className="py-2"><button className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center transition-colors"><MinusIcon /></button></td>
                            </tr>
                            <tr className="bg-orange-100">
                              <td className="py-2">2</td>
                              <td className="py-2">12</td>
                              <td className="py-2">15</td>
                              <td className="py-2">00:15</td>
                              <td className="py-2"><button className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center transition-colors"><MinusIcon /></button></td>
                            </tr>
                            <tr className="bg-orange-100">
                              <td className="py-2">2DD</td>
                              <td className="py-2">10</td>
                              <td className="py-2">15%</td>
                              <td className="py-2">1:30</td>
                              <td className="py-2"><button className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center transition-colors"><MinusIcon /></button></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">+ Add Set</button>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">+ Add Warm-Up Set</button>
                        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">+ Add Dropset</button>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-2">Workout-Specific Instructions (Exercise instructions are displayed automatically)</p>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Hold the stretch for the prescribed time and focus on breathing deeply. Maintain proper form throughout the exercise.</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Dumbbell Pullover */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-900 rounded-lg flex-shrink-0">
                      <img className="w-full h-full object-cover rounded-lg" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/f2d3d167c8-a7404bdd5d5b56b6d3b1.png" alt="person doing dumbbell pullover exercise on bench in gym" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Dumbbell Pullover</h3>
                        <button className="text-gray-400 hover:text-gray-600"><EllipsisIcon /></button>
                      </div>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 text-gray-600">Set</th>
                              <th className="text-left py-2 text-gray-600">Reps</th>
                              <th className="text-left py-2 text-gray-600">Weight (lb)</th>
                              <th className="text-left py-2 text-gray-600">Rest</th>
                              <th className="text-left py-2 text-gray-600"></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-gray-50">
                              <td className="py-2">Warm-Up</td>
                              <td className="py-2">8</td>
                              <td className="py-2">-</td>
                              <td className="py-2">00:00</td>
                              <td className="py-2"><button className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center transition-colors"><MinusIcon /></button></td>
                            </tr>
                            <tr>
                              <td className="py-2">1</td>
                              <td className="py-2">10</td>
                              <td className="py-2">20</td>
                              <td className="py-2">00:30</td>
                              <td className="py-2"><button className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center transition-colors"><MinusIcon /></button></td>
                            </tr>
                            <tr className="bg-orange-100">
                              <td className="py-2">2</td>
                              <td className="py-2">10</td>
                              <td className="py-2">20</td>
                              <td className="py-2">00:30</td>
                              <td className="py-2"><button className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center transition-colors"><MinusIcon /></button></td>
                            </tr>
                            <tr className="bg-orange-100">
                              <td className="py-2">2DD</td>
                              <td className="py-2">8</td>
                              <td className="py-2">15%</td>
                              <td className="py-2">1:30</td>
                              <td className="py-2"><button className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center transition-colors"><MinusIcon /></button></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">+ Add Set</button>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">+ Add Warm-Up Set</button>
                        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">+ Add Dropset</button>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-2">Workout-Specific Instructions (Exercise instructions are displayed automatically)</p>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Focus on controlled movement and proper breathing. Keep your core engaged throughout the exercise.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Right sidebar: Session Arrangement */}
      <aside className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <DumbbellIcon />
            <span className="font-semibold text-mint-600">Session Arrangement</span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">DAY 6</span>
        </div>
        <div className="flex space-x-2 mb-6">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 flex items-center justify-center"><SupersetIcon />Superset</button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 flex items-center justify-center"><CircuitIcon />Circuit</button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
            <BarsIcon />
            <span className="text-sm text-gray-700">Calf Stretch</span>
          </div>
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-3">
              <SupersetIcon />
              <span className="text-sm font-semibold text-yellow-800">Superset 1</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-2 bg-white rounded border border-gray-200 cursor-pointer"><BarsIcon /><span className="text-sm text-gray-700">Barbell Bench Press</span></div>
              <div className="flex items-center space-x-3 p-2 bg-white rounded border border-gray-200 cursor-pointer"><BarsIcon /><span className="text-sm text-gray-700">Dumbbell Pullover</span></div>
            </div>
          </div>
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-3">
              <CircuitIcon />
              <span className="text-sm font-semibold text-purple-800">Circuit 1</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-2 bg-white rounded border border-gray-200 cursor-pointer"><BarsIcon /><span className="text-sm text-gray-700">Dynamic Crossbody Hamstring Stretch</span></div>
              <div className="flex items-center space-x-3 p-2 bg-white rounded border border-gray-200 cursor-pointer"><BarsIcon /><span className="text-sm text-gray-700">90/90 Pigeon</span></div>
              <div className="flex items-center space-x-3 p-2 bg-white rounded border border-gray-200 cursor-pointer"><BarsIcon /><span className="text-sm text-gray-700">Couch Stretch (Quads)</span></div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
            <BarsIcon />
            <span className="text-sm text-gray-700">Pec Stretch</span>
          </div>
        </div>
      </aside>
    </div>
  );
} 