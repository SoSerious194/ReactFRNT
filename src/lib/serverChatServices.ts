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

      // First, ensure both users exist in GetStream
      await serverStreamClient.upsertUser({
        id: coachId,
        name: "Coach",
      });

      await serverStreamClient.upsertUser({
        id: clientId,
        name: "Client",
      });

      // Create a channel ID using the same hash-based approach as the client-side
      const combinedIds = [coachId, clientId].sort().join("-");
      const hash = combinedIds.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
      const channelId = `chat_${Math.abs(hash).toString(36)}`;

      // Get or create the channel
      const channel = serverStreamClient.channel("messaging", channelId, {
        members: [coachId, clientId],
        created_by_id: coachId,
      });

      // Initialize the channel (this is crucial!)
      await channel.watch();

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

      // Create a channel ID using the same hash-based approach as the client-side
      const combinedIds = [coachId, clientId].sort().join("-");
      const hash = combinedIds.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
      const channelId = `chat_${Math.abs(hash).toString(36)}`;

      // Get or create the channel
      const channel = serverStreamClient.channel("messaging", channelId, {
        members: [coachId, clientId],
        created_by_id: coachId,
      });

      // Initialize the channel (this is crucial!)
      await channel.watch();

      return channel;
    } catch (error) {
      console.error("Error creating GetStream channel:", error);
      return null;
    }
  }
}
