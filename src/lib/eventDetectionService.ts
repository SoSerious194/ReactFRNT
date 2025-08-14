import { createClient } from "@supabase/supabase-js";
import { AIMessageService } from "./aiMessageService";
import {
  EventType,
  EventData,
  CreateAIMessageEventRequest,
} from "@/types/aiMessaging";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export class EventDetectionService {
  private static supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Detect new PRs from completed exercise logs
  static async detectNewPRs(): Promise<void> {
    console.log("Detecting new PRs...");

    try {
      // Get recent exercise logs with weights
      const { data: recentLogs, error } = await this.supabase
        .from("completed_exercise_logs")
        .select(
          `
          id,
          client_id,
          exercise_id,
          weight,
          reps,
          created_at,
          exercise_library!inner(name)
        `
        )
        .not("weight", "is", null)
        .not("reps", "is", null)
        .gte(
          "created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        ) // Last 24 hours
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch recent exercise logs:", error);
        return;
      }

      if (!recentLogs || recentLogs.length === 0) {
        console.log("No recent exercise logs found");
        return;
      }

      // Group by client and exercise to find PRs
      const clientExerciseMap = new Map<string, any[]>();

      for (const log of recentLogs) {
        const key = `${log.client_id}_${log.exercise_id}`;
        if (!clientExerciseMap.has(key)) {
          clientExerciseMap.set(key, []);
        }
        clientExerciseMap.get(key)!.push(log);
      }

      // Check for new PRs
      for (const [key, logs] of clientExerciseMap) {
        if (logs.length < 2) continue; // Need at least 2 logs to compare

        const [clientId, exerciseId] = key.split("_");
        const sortedLogs = logs.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const latestLog = sortedLogs[0];
        const previousLogs = sortedLogs.slice(1);

        // Check if this is a new PR (higher weight for same or fewer reps)
        const isNewPR = previousLogs.some((prevLog) => {
          const weightIncrease = latestLog.weight > prevLog.weight;
          const sameOrFewerReps = latestLog.reps <= prevLog.reps;
          return weightIncrease && sameOrFewerReps;
        });

        if (isNewPR) {
          // Find the previous PR for comparison
          const previousPR = previousLogs.find(
            (prevLog) =>
              latestLog.weight > prevLog.weight &&
              latestLog.reps <= prevLog.reps
          );

          // Get coach ID (assuming client has a coach)
          const { data: client } = await this.supabase
            .from("users")
            .select("coach")
            .eq("id", clientId)
            .single();

          if (client?.coach) {
            const eventData: EventData = {
              exercise_name: latestLog.exercise_library?.name || "Exercise",
              weight: latestLog.weight,
              reps: latestLog.reps,
              previous_pr: previousPR?.weight,
            };

            const request: CreateAIMessageEventRequest = {
              client_id: clientId,
              coach_id: client.coach,
              event_type: "new_pr",
              event_data: eventData,
            };

            try {
              await AIMessageService.createEvent(request);
              console.log(
                `Created new PR event for client ${clientId}: ${eventData.exercise_name} - ${eventData.weight}lbs`
              );
            } catch (error) {
              console.error(
                `Failed to create new PR event for client ${clientId}:`,
                error
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error detecting new PRs:", error);
    }
  }

  // Detect workout completions
  static async detectWorkoutCompletions(): Promise<void> {
    console.log("Detecting workout completions...");

    try {
      // Get recent completed workouts
      const { data: recentWorkouts, error } = await this.supabase
        .from("completed_workouts")
        .select(
          `
          id,
          client_id,
          workout_id,
          completed_date,
          workouts!inner(name)
        `
        )
        .gte(
          "completed_date",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        ) // Last 24 hours
        .order("completed_date", { ascending: false });

      if (error) {
        console.error("Failed to fetch recent completed workouts:", error);
        return;
      }

      if (!recentWorkouts || recentWorkouts.length === 0) {
        console.log("No recent completed workouts found");
        return;
      }

      for (const workout of recentWorkouts) {
        // Get coach ID
        const { data: client } = await this.supabase
          .from("users")
          .select("coach")
          .eq("id", workout.client_id)
          .single();

        if (client?.coach) {
          // Count exercises in this workout
          const { data: exercises } = await this.supabase
            .from("completed_exercise_logs")
            .select("id")
            .eq("workout_id", workout.workout_id)
            .eq("client_id", workout.client_id);

          const eventData: EventData = {
            workout_name: (workout.workouts as any)?.name || "Workout",
            exercises_count: exercises?.length || 0,
          };

          const request: CreateAIMessageEventRequest = {
            client_id: workout.client_id,
            coach_id: client.coach,
            event_type: "workout_completed",
            event_data: eventData,
          };

          try {
            await AIMessageService.createEvent(request);
            console.log(
              `Created workout completion event for client ${workout.client_id}: ${eventData.workout_name}`
            );
          } catch (error) {
            console.error(
              `Failed to create workout completion event for client ${workout.client_id}:`,
              error
            );
          }
        }
      }
    } catch (error) {
      console.error("Error detecting workout completions:", error);
    }
  }

  // Detect streak milestones
  static async detectStreakMilestones(): Promise<void> {
    console.log("Detecting streak milestones...");

    try {
      // Get all clients with their streak data
      const { data: clients, error } = await this.supabase
        .from("users")
        .select(
          `
          id,
          coach,
          habit_streak,
          app_open_streak,
          last_habit_completion,
          last_app_open
        `
        )
        .not("coach", "is", null);

      if (error) {
        console.error("Failed to fetch clients:", error);
        return;
      }

      if (!clients || clients.length === 0) {
        console.log("No clients found");
        return;
      }

      for (const client of clients) {
        if (!client.coach) continue;

        // Check habit streak milestones (7, 14, 30, 60, 90 days)
        if (
          client.habit_streak &&
          [7, 14, 30, 60, 90].includes(client.habit_streak)
        ) {
          const eventData: EventData = {
            streak_type: "habit",
            streak_count: client.habit_streak,
          };

          const request: CreateAIMessageEventRequest = {
            client_id: client.id,
            coach_id: client.coach,
            event_type: "streak_milestone",
            event_data: eventData,
          };

          try {
            await AIMessageService.createEvent(request);
            console.log(
              `Created habit streak milestone event for client ${client.id}: ${client.habit_streak} days`
            );
          } catch (error) {
            console.error(
              `Failed to create habit streak milestone event for client ${client.id}:`,
              error
            );
          }
        }

        // Check app open streak milestones (7, 14, 30, 60, 90 days)
        if (
          client.app_open_streak &&
          [7, 14, 30, 60, 90].includes(client.app_open_streak)
        ) {
          const eventData: EventData = {
            streak_type: "login",
            streak_count: client.app_open_streak,
          };

          const request: CreateAIMessageEventRequest = {
            client_id: client.id,
            coach_id: client.coach,
            event_type: "streak_milestone",
            event_data: eventData,
          };

          try {
            await AIMessageService.createEvent(request);
            console.log(
              `Created login streak milestone event for client ${client.id}: ${client.app_open_streak} days`
            );
          } catch (error) {
            console.error(
              `Failed to create login streak milestone event for client ${client.id}:`,
              error
            );
          }
        }
      }
    } catch (error) {
      console.error("Error detecting streak milestones:", error);
    }
  }

  // Detect first workouts
  static async detectFirstWorkouts(): Promise<void> {
    console.log("Detecting first workouts...");

    try {
      // Get clients who completed their first workout in the last 24 hours
      const { data: firstWorkouts, error } = await this.supabase
        .from("completed_workouts")
        .select(
          `
          client_id,
          completed_date,
          program_id,
          programs!inner(name)
        `
        )
        .gte(
          "completed_date",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        )
        .order("completed_date", { ascending: false });

      if (error) {
        console.error("Failed to fetch first workouts:", error);
        return;
      }

      if (!firstWorkouts || firstWorkouts.length === 0) {
        console.log("No first workouts found");
        return;
      }

      for (const workout of firstWorkouts) {
        // Check if this is actually their first workout
        const { data: previousWorkouts } = await this.supabase
          .from("completed_workouts")
          .select("id")
          .eq("client_id", workout.client_id)
          .lt("completed_date", workout.completed_date)
          .limit(1);

        if (previousWorkouts && previousWorkouts.length === 0) {
          // This is their first workout
          const { data: client } = await this.supabase
            .from("users")
            .select("coach")
            .eq("id", workout.client_id)
            .single();

          if (client?.coach) {
            const eventData: EventData = {
              program_name: (workout.programs as any)?.name || "Program",
            };

            const request: CreateAIMessageEventRequest = {
              client_id: workout.client_id,
              coach_id: client.coach,
              event_type: "first_workout",
              event_data: eventData,
            };

            try {
              await AIMessageService.createEvent(request);
              console.log(
                `Created first workout event for client ${workout.client_id}`
              );
            } catch (error) {
              console.error(
                `Failed to create first workout event for client ${workout.client_id}:`,
                error
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error detecting first workouts:", error);
    }
  }

  // Run all event detection
  static async runAllDetection(): Promise<void> {
    console.log("Running all event detection...");

    await Promise.all([
      this.detectNewPRs(),
      this.detectWorkoutCompletions(),
      this.detectStreakMilestones(),
      this.detectFirstWorkouts(),
    ]);

    console.log("Event detection completed");
  }
}
