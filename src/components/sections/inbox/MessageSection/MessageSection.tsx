"use client";

import {
  MoreHorizontalIcon,
  PaperclipIcon,
  PhoneIcon,
  SendIcon,
  VideoIcon,
  Loader2,
} from "lucide-react";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ClientType } from "@/types/client";
import { sendMessage } from "@/app/inbox/action";
import { createClient } from "@/utils/supabase/client";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  isCurrentUser?: boolean;
}

interface PaginationState {
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
}

const MESSAGES_PER_PAGE = 10;
const SCROLL_THRESHOLD = 100; // pixels from top to trigger load

export default function MessageSection({
  client,
  conversationId,
  userId,
}: {
  client: ClientType;
  conversationId: string;
  userId: string;
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    hasMore: true,
    isLoading: false,
    isInitialLoading: true,
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const previousScrollHeight = useRef(0);
  const shouldScrollToBottom = useRef(true);
  const isUserNearBottom = useRef(true);

  // Utility function to check if user is near bottom
  const checkIfNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return false;
    const threshold = 100;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold;
    isUserNearBottom.current = isNearBottom;
    return isNearBottom;
  }, []);

  // Scroll to bottom function
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior });
      }
    },
    []
  );

  // Fetch messages
  const fetchMessages = useCallback(
    async (pageNumber: number, isInitial: boolean) => {
      if (!conversationId || pagination.isLoading) return;

      setPagination((prev) => ({
        ...prev,
        isLoading: true,
        isInitialLoading: isInitial,
      }));

      try {
        const from = pageNumber * MESSAGES_PER_PAGE;
        const to = from + MESSAGES_PER_PAGE - 1;

        const { data, error, count } = await supabase
          .from("messages")
          .select(
            `
            id,
            sender_id,
            content,
            created_at
        `,
            { count: "exact" }
          )
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) {
          console.error("Error fetching messages:", error);
          setPagination((prev) => ({
            ...prev,
            isLoading: false,
            isInitialLoading: false,
          }));
          return;
        }

        const newMessages = data.reverse() || [];
        const totalMessages = count || 0;
        const hasMoreMessages = from + newMessages.length < totalMessages;

        if (isInitial) {
          setMessages(newMessages.reverse());
          shouldScrollToBottom.current = true;
        } else {
          setMessages((prev) => [...newMessages, ...prev]);
        }

        setPagination((prev) => ({
          ...prev,
          page: pageNumber,
          hasMore: hasMoreMessages,
          isLoading: false,
          isInitialLoading: false,
        }));
      } catch (error) {
        console.error("Error in fetchMessages:", error);
        setPagination((prev) => ({
          ...prev,
          isLoading: false,
          isInitialLoading: false,
        }));
      }
    },
    [conversationId, pagination.isLoading, supabase]
  );

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(() => {
    if (pagination.hasMore && !pagination.isLoading) {
      fetchMessages(pagination.page + 1, false);
    }
  }, [fetchMessages, pagination.hasMore, pagination.isLoading, pagination.page]);

  // Scroll handler with throttling
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || pagination.isLoading || !pagination.hasMore) return;

    checkIfNearBottom();

    // Check if user scrolled near the top for pagination
    if (container.scrollTop <= SCROLL_THRESHOLD) {
      previousScrollHeight.current = container.scrollHeight;
      loadMoreMessages();
    }
  }, [loadMoreMessages, pagination.isLoading, pagination.hasMore, checkIfNearBottom]);

  // Initial load
  useEffect(() => {
    if (conversationId && isInitialMount.current) {
      fetchMessages(0, true);
      isInitialMount.current = false;
    }
  }, [conversationId, fetchMessages]);

  // Maintain scroll position after pagination (loading older messages)
  useEffect(() => {
    if (pagination.isLoading || pagination.isInitialLoading) return;
    // If we just loaded older messages (pagination)
    if (previousScrollHeight.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      // Calculate the new scrollTop so the view stays at the same message
      const newScrollTop =
        container.scrollHeight -
        previousScrollHeight.current +
        container.scrollTop;
      container.scrollTop = newScrollTop;
      previousScrollHeight.current = 0; // Reset
    }
  }, [messages, pagination.isLoading, pagination.isInitialLoading]);

  // Scroll to bottom after initial messages load or new message (if user is near bottom)
  useEffect(() => {
    // Only scroll to bottom on initial load or when sending/receiving a new message if user is near bottom
    if (
      !pagination.isInitialLoading &&
      shouldScrollToBottom.current &&
      messages.length > 0
    ) {
      setTimeout(() => {
        scrollToBottom("auto");
        shouldScrollToBottom.current = false;
      }, 50);
    }
  }, [messages, pagination.isInitialLoading, scrollToBottom]);

  // Setup scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Throttle scroll events
    let timeoutId: NodeJS.Timeout;
    const throttledScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    container.addEventListener("scroll", throttledScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", throttledScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`realtime_messages_${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);

          // Only scroll if user is near bottom
          if (isUserNearBottom.current) {
            shouldScrollToBottom.current = true;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const { success } = await sendMessage(conversationId, newMessage);
      if (success) {
        setNewMessage("");
        // Only scroll if user is near bottom
        if (isUserNearBottom.current) {
          shouldScrollToBottom.current = true;
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (pagination.isInitialLoading) {
    return (
      <div className="flex flex-col h-full w-full border-l bg-white">
        {/* ... loading UI ... */}
        <header className="flex items-center justify-between p-6 bg-white border-b" style={{ minHeight: 97 }}>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
              <img className="w-5 h-4" alt="Profile" src={client?.profile_image_url || "https://c.animaapp.com/mbtb1be13lPm2M/img/frame-2.svg"} />
            </div>
            <div className="ml-4">
              <h2 className="font-bold text-xl text-gray-900">{client?.full_name}</h2>
              <p className="text-sm text-gray-500">24 members • 15 online</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="h-10 w-8">
              <PhoneIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-[34px]">
              <VideoIcon className="h-4 w-[18px]" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-8">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-green-500" />
            <span className="text-gray-600">Loading messages...</span>
          </div>
        </div>
        <footer className="p-6 bg-white border-t pb-24">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-10 w-[30px] mr-4">
              <PaperclipIcon className="h-4 w-3.5" />
            </Button>
            <div className="flex-1">
              <Input className="h-[50px] border-gray-300" placeholder="Type a message..." disabled />
            </div>
            <Button size="icon" className="h-12 w-10 ml-4 bg-green-500 hover:bg-green-600" disabled>
              <SendIcon className="h-4 w-4 text-white" />
            </Button>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full border-l bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-white border-b" style={{ minHeight: 97 }}>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
            <img className="w-5 h-4" alt="Profile" src={client?.profile_image_url || "https://c.animaapp.com/mbtb1be13lPm2M/img/frame-2.svg"} />
          </div>
          <div className="ml-4">
            <h2 className="font-bold text-xl text-gray-900">{client?.full_name}</h2>
            <p className="text-sm text-gray-500">24 members • 15 online</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="h-10 w-8">
            <PhoneIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-[34px]">
            <VideoIcon className="h-4 w-[18px]" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-8">
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-6 overflow-y-auto"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* Loading indicator for pagination */}
        {pagination.isLoading && !pagination.isInitialLoading && (
          <div className="flex justify-center py-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-green-500" />
              <span className="text-sm text-gray-500">
                Loading older messages...
              </span>
            </div>
          </div>
        )}

        {/* No more messages indicator */}
        {!pagination.hasMore && messages.length > 0 && (
          <div className="flex justify-center py-4">
            <span className="text-sm text-gray-400">No more messages</span>
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && !pagination.isInitialLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg">No messages yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Start a conversation!
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => {
          const isMe = message.sender_id === userId;
          return (
            <div
              key={message.id}
              className={`flex mb-8 ${isMe ? "justify-end" : ""}`}
            >
              {!isMe && (
                <Avatar className="h-10 w-10 mr-3">
                  <img
                    src={
                      client?.profile_image_url ||
                      "https://c.animaapp.com/mbtb1be13lPm2M/img/img-4.png"
                    }
                    alt="Sender"
                    className="h-full w-full object-cover"
                  />
                </Avatar>
              )}
              <div className={`flex flex-col ${isMe ? "items-end" : ""}`}>
                <div className="flex items-center mb-1">
                  {!isMe ? (
                    <>
                      <span className="font-normal text-base text-gray-900">
                        {client?.full_name}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="mr-2 text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="font-normal text-base text-gray-900">
                        You
                      </span>
                    </>
                  )}
                </div>
                <Card
                  className={`p-3 max-w-[448px] border-0 ${
                    isMe
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-base whitespace-pre-wrap">
                    {message.content}
                  </p>
                </Card>
              </div>
              {isMe && (
                <Avatar className="h-10 w-10 ml-3">
                  <img
                    src="https://c.animaapp.com/mbtb1be13lPm2M/img/img-10.png"
                    alt="You"
                    className="h-full w-full object-cover"
                  />
                </Avatar>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <footer className="p-6 bg-white border-t pb-24">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-[30px] mr-4"
          >
            <PaperclipIcon className="h-4 w-3.5" />
          </Button>
          <div className="flex-1">
            <Input
              type="text"
              className="h-[50px] border-gray-300"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button
            size="icon"
            className="h-12 w-10 ml-4 bg-green-500 hover:bg-green-600"
            onClick={handleSend}
            disabled={!newMessage.trim()}
          >
            <SendIcon className="h-4 w-4 text-white" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
