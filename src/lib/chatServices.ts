import { StreamChat } from "stream-chat";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/database";

type User = Database["public"]["Tables"]["users"]["Row"];

const supabase = createClient();

// Initialize Stream Chat client
const streamClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_API_KEY || "demo_key"
);

export class ChatServices {
  // Connect coach to Stream Chat
  static async connectCoach(coachId: string, coachName: string) {
    try {
      // Check if we have proper API keys
      if (
        !process.env.NEXT_PUBLIC_STREAM_API_KEY ||
        process.env.NEXT_PUBLIC_STREAM_API_KEY === "demo_key"
      ) {
        console.warn("GetStream API key not configured, using demo mode");
        // For demo mode, we'll just return the client without connecting
        return streamClient;
      }

      // Generate a token for the coach (in production, this should come from your backend)
      const response = await fetch("/api/stream-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: coachId,
          userName: coachName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get Stream token");
      }

      const { token } = await response.json();

      // Connect the coach to Stream
      await streamClient.connectUser(
        {
          id: coachId,
          name: coachName,
        },
        token
      );

      console.log(`Coach ${coachName} connected to GetStream`);

      return streamClient;
    } catch (error) {
      console.error("Error connecting coach to Stream:", error);
      throw error;
    }
  }

  // Create or update user in GetStream
  static async createOrUpdateUser(userId: string, userName: string) {
    try {
      // Check if we're in demo mode
      if (
        !process.env.NEXT_PUBLIC_STREAM_API_KEY ||
        process.env.NEXT_PUBLIC_STREAM_API_KEY === "demo_key"
      ) {
        console.warn(
          "GetStream API key not configured, skipping user creation"
        );
        return;
      }

      // Use server-side API to create user instead of client-side
      const response = await fetch("/api/stream-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          userName: userName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error creating user via API:", error);
        return;
      }

      console.log(`User ${userName} (${userId}) created/updated in GetStream`);
    } catch (error) {
      console.error("Error creating/updating user in GetStream:", error);
      // Don't throw error, just log it
    }
  }

  // Get all assigned users for a coach
  static async getAssignedUsers(coachId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("coach", coachId)
      .order("full_name");

    if (error) {
      console.error("Error fetching assigned users:", error);
      throw error;
    }

    return data || [];
  }

  // Get or create channel between coach and user
  static async getOrCreateChannel(
    coachId: string,
    userId: string,
    userName: string
  ) {
    try {
      // Check if we're in demo mode
      if (
        !process.env.NEXT_PUBLIC_STREAM_API_KEY ||
        process.env.NEXT_PUBLIC_STREAM_API_KEY === "demo_key"
      ) {
        console.warn(
          "GetStream API key not configured, cannot create channels in demo mode"
        );
        throw new Error("GetStream not configured - please set up API keys");
      }

      // Check if client is connected
      if (!streamClient.userID) {
        console.warn("Stream client not connected, cannot create channel");
        throw new Error("Stream client not connected - please connect first");
      }

      // Create a shorter, unique channel ID using simple hash
      const combinedIds = [coachId, userId].sort().join("-");
      const hash = combinedIds.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
      const channelId = `chat_${Math.abs(hash).toString(36)}`;

      console.log(
        "Creating channel with ID:",
        channelId,
        "Length:",
        channelId.length
      );

      // Create or get the channel
      const channel = streamClient.channel("messaging", channelId, {
        members: [coachId, userId],
      });

      // Initialize the channel
      await channel.watch();

      return channel;
    } catch (error) {
      console.error("Error getting or creating channel:", error);
      throw error;
    }
  }

  // Get all channels for a coach
  static async getCoachChannels(coachId: string) {
    try {
      const filter = { members: { $in: [coachId] } };
      const sort = [{ last_message_at: -1 }];

      const channels = await streamClient.queryChannels(filter, sort, {
        limit: 50,
      });

      return channels;
    } catch (error) {
      console.error("Error fetching coach channels:", error);
      throw error;
    }
  }

  // Get user's fitness data for context (still using Supabase)
  static async getUserFitnessData(userId: string) {
    const { data: completedWorkouts, error: workoutsError } = await supabase
      .from("completed_workouts")
      .select("*")
      .eq("client_id", userId)
      .order("completed_date", { ascending: false })
      .limit(5);

    const { data: exerciseLogs, error: logsError } = await supabase
      .from("completed_exercise_logs")
      .select("*")
      .eq("client_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (workoutsError || logsError || userError) {
      console.error("Error fetching user fitness data:", {
        workoutsError,
        logsError,
        userError,
      });
      throw new Error("Failed to fetch user fitness data");
    }

    return {
      user,
      completedWorkouts: completedWorkouts || [],
      exerciseLogs: exerciseLogs || [],
    };
  }

  // Disconnect from Stream
  static async disconnect() {
    try {
      await streamClient.disconnectUser();
    } catch (error) {
      console.error("Error disconnecting from Stream:", error);
    }
  }

  // Get Stream client instance
  static getStreamClient() {
    return streamClient;
  }
}
