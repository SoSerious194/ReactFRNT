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

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* User Profile */}
        <Card className="p-4 mb-4">
          <div className="flex items-center mb-3">
            <Avatar className="h-12 w-12 mr-3">
              <AvatarImage
                src={selectedUser.profile_image_url || undefined}
                alt={selectedUser.full_name || "User"}
              />
              <AvatarFallback>
                {selectedUser.full_name?.charAt(0) ||
                  selectedUser.email?.charAt(0) ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-gray-900">
                {selectedUser.full_name || selectedUser.email || "Unknown User"}
              </h4>
              <p className="text-sm text-gray-500">{selectedUser.email}</p>
            </div>
          </div>

          {selectedUser.last_app_open && (
            <div className="text-sm text-gray-600">
              Last active:{" "}
              {new Date(selectedUser.last_app_open).toLocaleDateString()}
            </div>
          )}
        </Card>

        {/* Fitness Data */}
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading fitness data...</p>
          </div>
        ) : fitnessData ? (
          <div className="space-y-4">
            {/* Recent Workouts */}
            <Card className="p-4">
              <h5 className="font-medium text-gray-900 mb-3">
                Recent Workouts
              </h5>
              {fitnessData.completedWorkouts.length > 0 ? (
                <div className="space-y-2">
                  {fitnessData.completedWorkouts
                    .slice(0, 3)
                    .map((workout, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-gray-700">
                          Day {workout.day} -{" "}
                          {workout.completed_date
                            ? new Date(
                                workout.completed_date
                              ).toLocaleDateString()
                            : "No date"}
                        </div>
                        {workout.notes && (
                          <div className="text-gray-500 text-xs">
                            {workout.notes}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No completed workouts</p>
              )}
            </Card>

            {/* Exercise Logs */}
            <Card className="p-4">
              <h5 className="font-medium text-gray-900 mb-3">
                Recent Exercises
              </h5>
              {fitnessData.exerciseLogs.length > 0 ? (
                <div className="space-y-2">
                  {fitnessData.exerciseLogs.slice(0, 3).map((log, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium text-gray-700">
                        Set {log.set_number} - {log.reps} reps
                      </div>
                      {log.weight && (
                        <div className="text-gray-500 text-xs">
                          {log.weight} lbs
                        </div>
                      )}
                      {log.notes && (
                        <div className="text-gray-500 text-xs">{log.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No exercise logs</p>
              )}
            </Card>

            {/* Stats */}
            <Card className="p-4">
              <h5 className="font-medium text-gray-900 mb-3">Stats</h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500">Workouts</div>
                  <div className="font-medium text-gray-900">
                    {fitnessData.completedWorkouts.length}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Exercises</div>
                  <div className="font-medium text-gray-900">
                    {fitnessData.exerciseLogs.length}
                  </div>
                </div>
                {selectedUser.app_open_streak && (
                  <div>
                    <div className="text-gray-500">Streak</div>
                    <div className="font-medium text-gray-900">
                      {selectedUser.app_open_streak} days
                    </div>
                  </div>
                )}
                {selectedUser.habit_streak && (
                  <div>
                    <div className="text-gray-500">Habit Streak</div>
                    <div className="font-medium text-gray-900">
                      {selectedUser.habit_streak} days
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No fitness data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
