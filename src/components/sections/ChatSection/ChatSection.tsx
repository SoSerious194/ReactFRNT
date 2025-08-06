"use client";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useChat } from "@/lib/chatContext";
import { ChatServices } from "@/lib/chatServices";

interface UserFitnessData {
  user: any;
  completedWorkouts: any[];
  exerciseLogs: any[];
}

export default function ChatSection() {
  const { selectedUser } = useChat();
  const [fitnessData, setFitnessData] = useState<UserFitnessData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      loadUserFitnessData();
    } else {
      setFitnessData(null);
    }
  }, [selectedUser]);

  const loadUserFitnessData = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const data = await ChatServices.getUserFitnessData(selectedUser.id);
      setFitnessData(data);
    } catch (error) {
      console.error("Error loading user fitness data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="w-80 h-full border-l border-solid flex flex-col">
        <div className="p-6 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Client Information
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-gray-500">
            <p>Select a client to view their information</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full border-l border-solid flex flex-col overflow-hidden">
      <div className="p-6 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Client Information
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
        {/* User Profile */}
        <Card className="p-4 border-gray-200 shadow-sm">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-3 border-2 border-gray-100">
              <AvatarImage
                src={selectedUser.profile_image_url || undefined}
                alt={selectedUser.full_name || "User"}
              />
              <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                {selectedUser.full_name?.charAt(0) ||
                  selectedUser.email?.charAt(0) ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-base leading-tight">
                {selectedUser.full_name || selectedUser.email || "Unknown User"}
              </h4>
              <p className="text-sm text-gray-500 truncate">
                {selectedUser.email}
              </p>
            </div>
          </div>
        </Card>

        {/* Fitness Data */}
        {loading ? (
          <Card className="p-6 border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">Loading fitness data...</p>
            </div>
          </Card>
        ) : fitnessData ? (
          <>
            {/* Recent Workouts */}
            <Card className="p-4 border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-gray-900 text-base">
                  Recent Workouts
                </h5>
                <Badge variant="secondary" className="text-xs">
                  {fitnessData.completedWorkouts.length}
                </Badge>
              </div>
              {fitnessData.completedWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {fitnessData.completedWorkouts
                    .slice(0, 3)
                    .map((workout, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-green-500 pl-3"
                      >
                        <div className="font-medium text-gray-900 text-sm">
                          Day {workout.day} -{" "}
                          {workout.completed_date
                            ? new Date(
                                workout.completed_date
                              ).toLocaleDateString()
                            : "No date"}
                        </div>
                        {workout.notes && (
                          <div className="text-gray-500 text-xs mt-1 italic">
                            "{workout.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No completed workouts
                </p>
              )}
            </Card>

            {/* Exercise Logs */}
            <Card className="p-4 border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-gray-900 text-base">
                  Recent Exercises
                </h5>
                <Badge variant="secondary" className="text-xs">
                  {fitnessData.exerciseLogs.length}
                </Badge>
              </div>
              {fitnessData.exerciseLogs.length > 0 ? (
                <div className="space-y-3">
                  {fitnessData.exerciseLogs.slice(0, 3).map((log, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-blue-500 pl-3"
                    >
                      <div className="font-medium text-gray-900 text-sm">
                        Set {log.set_number} - {log.reps} reps
                      </div>
                      {log.weight && (
                        <div className="text-gray-600 text-xs font-medium">
                          {log.weight} lbs
                        </div>
                      )}
                      {log.notes && (
                        <div className="text-gray-500 text-xs mt-1 italic">
                          "{log.notes}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No exercise logs</p>
              )}
            </Card>

            {/* Stats */}
            <Card className="p-4 border-gray-200 shadow-sm">
              <h5 className="font-semibold text-gray-900 text-base mb-3">
                Stats
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {fitnessData.completedWorkouts.length}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Workouts
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {fitnessData.exerciseLogs.length}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Exercises
                  </div>
                </div>
                {selectedUser.app_open_streak && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedUser.app_open_streak}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Day Streak
                    </div>
                  </div>
                )}
                {selectedUser.habit_streak && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedUser.habit_streak}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Habit Streak
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-6 border-gray-200 shadow-sm">
            <div className="text-center text-gray-500">
              <p className="text-sm">No fitness data available</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
