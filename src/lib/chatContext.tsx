"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ChatServices } from "./chatServices";
import { Database } from "@/types/database";
import { StreamChat, Channel } from "stream-chat";

type User = Database["public"]["Tables"]["users"]["Row"];

interface ChatContextType {
  // State
  selectedUser: User | null;
  selectedChannel: Channel | null;
  users: User[];
  isLoading: boolean;
  isSending: boolean;
  streamClient: StreamChat | null;

  // Actions
  selectUser: (user: User) => void;
  sendMessage: (content: string, file?: File) => Promise<void>;
  loadUsers: () => Promise<void>;
  connectToStream: (coachId: string, coachName: string) => Promise<void>;

  // Current user (coach)
  currentUserId: string | null;
  setCurrentUserId: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
  coachId: string;
  selectedClientId?: string;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  coachId,
  selectedClientId,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(coachId);
  const [streamClient, setStreamClient] = useState<StreamChat | null>(null);

  // Connect to Stream Chat
  const connectToStream = async (coachId: string, coachName: string) => {
    try {
      // Connect the coach first (this will create the user and connect)
      const client = await ChatServices.connectCoach(coachId, coachName);
      setStreamClient(client);

      console.log("Successfully connected to GetStream");
    } catch (error) {
      console.error("Error connecting to Stream:", error);
    }
  };

  // Load assigned users
  const loadUsers = async () => {
    if (!currentUserId) return;

    try {
      setIsLoading(true);
      const assignedUsers = await ChatServices.getAssignedUsers(currentUserId);
      setUsers(assignedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Select a user and load their channel
  const selectUser = async (user: User) => {
    if (!currentUserId || !streamClient) {
      console.warn("Cannot select user: missing currentUserId or streamClient");
      return;
    }

    setSelectedUser(user);

    try {
      // First, ensure both users exist in GetStream
      await ChatServices.createOrUpdateUser(
        currentUserId,
        "Coach"
      );
      await ChatServices.createOrUpdateUser(
        user.id,
        user.full_name || user.email || "User"
      );

      // Then create the channel
      const channel = await ChatServices.getOrCreateChannel(
        currentUserId,
        user.id,
        user.full_name || user.email || "User"
      );
      setSelectedChannel(channel);

      console.log(
        `Successfully created channel with user: ${
          user.full_name || user.email
        }`
      );
    } catch (error) {
      console.error("Error selecting user:", error);
      // Reset selected user on error
      setSelectedUser(null);
    }
  };

  // Send a message
  const sendMessage = async (content: string, file?: File) => {
    if (!selectedChannel || !streamClient) return;

    try {
      setIsSending(true);

      if (file) {
        // Upload file and send message with attachment
        await selectedChannel.sendImage(file);
      } else {
        // Send text message
        await selectedChannel.sendMessage({
          text: content,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Connect to Stream on mount
  useEffect(() => {
    if (currentUserId) {
      // Get user data from Supabase to get the name
      const getUserData = async () => {
        try {
          const fitnessData = await ChatServices.getUserFitnessData(
            currentUserId
          );
          if (fitnessData.user) {
            await connectToStream(
              currentUserId,
              fitnessData.user.full_name || fitnessData.user.email || "Coach"
            );
          }
        } catch (error) {
          console.error("Error getting user data:", error);
        }
      };

      getUserData();
      loadUsers();
    }
  }, [currentUserId]);

  // Auto-select client if selectedClientId is provided
  useEffect(() => {
    if (selectedClientId && users.length > 0 && streamClient) {
      const targetUser = users.find(user => user.id === selectedClientId);
      if (targetUser) {
        selectUser(targetUser);
      }
    }
  }, [selectedClientId, users, streamClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamClient) {
        ChatServices.disconnect();
      }
    };
  }, [streamClient]);

  const value: ChatContextType = {
    selectedUser,
    selectedChannel,
    users,
    isLoading,
    isSending,
    streamClient,
    selectUser,
    sendMessage,
    loadUsers,
    connectToStream,
    currentUserId,
    setCurrentUserId,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
