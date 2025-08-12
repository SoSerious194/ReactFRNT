import { StreamChat } from "stream-chat";

// Server-side Stream Chat client with proper authentication
const serverStreamClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);

export class ServerChatServices {
  /**
   * Send a message from coach to client using server-side authentication
   */
  static async sendMessageFromCoach(
    coachId: string,
    clientId: string,
    messageText: string
  ): Promise<string | null> {
    try {
      // Check if API keys are configured
      if (
        !process.env.NEXT_PUBLIC_STREAM_API_KEY ||
        !process.env.STREAM_API_SECRET
      ) {
        console.error(
          "GetStream API keys not configured for server-side operations"
        );
        return null;
      }

      // Create a channel ID for the coach-client conversation
      // Remove any special characters and use a safe format
      const safeCoachId = coachId.replace(/[^a-zA-Z0-9]/g, '');
      const safeClientId = clientId.replace(/[^a-zA-Z0-9]/g, '');
      const channelId = `${safeCoachId}_${safeClientId}`;
      
      // Get or create the channel
      const channel = serverStreamClient.channel("messaging", channelId, {
        members: [coachId, clientId],
        created_by_id: coachId,
      });

      // Send the message as the coach
      const response = await channel.sendMessage({
        text: messageText,
        user_id: coachId,
      });

      console.log(
        `Message sent successfully via GetStream. Message ID: ${response.message?.id}`
      );
      return response.message?.id || null;
    } catch (error) {
      console.error("Error sending message via GetStream:", error);
      return null;
    }
  }

  /**
   * Create or update a user in GetStream (server-side)
   */
  static async createOrUpdateUser(
    userId: string,
    userName: string
  ): Promise<boolean> {
    try {
      if (
        !process.env.NEXT_PUBLIC_STREAM_API_KEY ||
        !process.env.STREAM_API_SECRET
      ) {
        console.error("GetStream API keys not configured");
        return false;
      }

      await serverStreamClient.upsertUser({
        id: userId,
        name: userName,
        role: "user",
      });

      console.log(`User ${userName} (${userId}) created/updated in GetStream`);
      return true;
    } catch (error) {
      console.error("Error creating/updating user in GetStream:", error);
      return false;
    }
  }

  /**
   * Get or create a channel between coach and client
   */
  static async getOrCreateChannel(
    coachId: string,
    clientId: string,
    clientName: string
  ) {
    try {
      if (
        !process.env.NEXT_PUBLIC_STREAM_API_KEY ||
        !process.env.STREAM_API_SECRET
      ) {
        console.error("GetStream API keys not configured");
        return null;
      }

            // Create a unique channel ID
      // Remove any special characters and use a safe format
      const safeCoachId = coachId.replace(/[^a-zA-Z0-9]/g, '');
      const safeClientId = clientId.replace(/[^a-zA-Z0-9]/g, '');
      const channelId = `${safeCoachId}_${safeClientId}`;
      
      // Get or create the channel
      const channel = serverStreamClient.channel("messaging", channelId, {
        members: [coachId, clientId],
        created_by_id: coachId,
      });

      // Create the channel if it doesn't exist
      await channel.create();

      return channel;
    } catch (error) {
      console.error("Error creating GetStream channel:", error);
      return null;
    }
  }
}
