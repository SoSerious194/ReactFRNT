"use client";
import React from "react";
import { useChat } from "@/lib/chatContext";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

export default function MessageSection() {
  const { selectedUser, selectedChannel, streamClient } = useChat();

  if (!selectedUser) {
    return (
      <div className="flex flex-col h-full w-full bg-white overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a client to start chatting
            </h3>
            <p className="text-gray-500">
              Choose a client from the list to view your conversation
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!streamClient) {
    return (
      <div className="flex flex-col h-full w-full bg-white overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Connecting to GetStream...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!streamClient.userID) {
    return (
      <div className="flex flex-col h-full w-full bg-white overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Not connected to GetStream
            </h3>
            <p className="text-gray-500">
              Please check your GetStream configuration and try again
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedChannel) {
    return (
      <div className="flex flex-col h-full w-full bg-white overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Creating chat channel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      <Chat client={streamClient} theme="messaging light">
        <Channel channel={selectedChannel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
        </Channel>
      </Chat>
    </div>
  );
}
