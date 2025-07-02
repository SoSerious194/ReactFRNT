"use client";

import { Loader2 } from "lucide-react";
import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { ClientType } from "@/types/client";
import { createClient } from "@/utils/supabase/client";
import MessageInputSection from "./MassageInputSection";
import MessageHeaderSection from "./MessageHeaderSection";
import { MessageContentType } from "@/types";
import MessageDisplaySection from "./MessageDisplaySection";
import { cn } from "@/lib/utils";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { formatMessageTime } from "@/lib/helper";
import { useMessages } from "@/hooks/useMessages";

// Constants
const MESSAGES_PER_PAGE = 20;
const SCROLL_THRESHOLD = 100;
const SCROLL_DEBOUNCE_MS = 150;
const MESSAGE_GROUP_TIME_THRESHOLD = 5 * 60 * 1000;

// Message grouping utility
const shouldGroupWithPrevious = (
  currentMessage: MessageContentType,
  previousMessage: MessageContentType | undefined
): boolean => {
  if (!previousMessage) return false;

  if (currentMessage.sender_id !== previousMessage.sender_id) return false;
  const currentTime = new Date(currentMessage.created_at).getTime();
  const previousTime = new Date(previousMessage.created_at).getTime();
  const timeDiff = currentTime - previousTime;

  return timeDiff <= MESSAGE_GROUP_TIME_THRESHOLD;
};

export default function MessageSection({
  client,
  conversationId,
  userId,
}: {
  client: ClientType;
  conversationId: string;
  userId: string;
}) {
  const supabase = useMemo(() => createClient(), []);

  const shouldScrollToBottom = useRef(true);

  const { messages, setMessages, loadMoreMessages, pagination } = useMessages(conversationId);

  const { containerRef, messagesEndRef, isNearBottom, handleScroll, scrollToBottom } = useScrollPosition({
    loadMoreMessages,
    isLoading: pagination.isLoading,
    hasMore: pagination.hasMore,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (!pagination.isInitialLoading && shouldScrollToBottom.current && messages.length > 0) {
      const timeoutId = setTimeout(() => {
        scrollToBottom("auto");
        shouldScrollToBottom.current = false;
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [messages, pagination.isInitialLoading, scrollToBottom, shouldScrollToBottom.current]);

  // Real-time message subscription
  useEffect(() => {
    if (!conversationId) return;

    const container = containerRef.current;

    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }

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
          const newMessage = payload.new as MessageContentType;

          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) return prev;

            const filtered = prev.filter((msg) => {
              if (!msg.id.startsWith("temp-")) {
                return true;
              }

              return msg.content !== newMessage.content && msg.file_path !== newMessage.file_path;
            });

            return [...filtered, newMessage];
          });

          if (isNearBottom) {
            shouldScrollToBottom.current = true;
          }
        }
      )
      .subscribe();

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase, isNearBottom, handleScroll]);

  const renderMessage = (message: MessageContentType, index: number) => {
    const isMe = message.sender_id === userId;
    const isOptimistic = message.id.startsWith("temp-");

    const isGrouped = shouldGroupWithPrevious(message, messages[index - 1]);
    const showMessageHeader = !isGrouped;
    const messageSpacing = isGrouped ? "mt-5" : "mt-8";

    return (
      <div
        key={message.id + message.created_at}
        className={cn(
          "flex",
          messageSpacing,
          isMe && "justify-end",
          isOptimistic && "opacity-70",
          index === 0 && "mt-2",
          index === messages.length - 1 && "mb-6"
        )}
      >
        {/* Left avatar */}
        {!isMe && (
          <div className="mr-3">
            {showMessageHeader ? (
              <Avatar className="h-10 w-10">
                <img
                  src={client?.profile_image_url || "https://c.animaapp.com/mbtb1be13lPm2M/img/img-4.png"}
                  alt="Sender"
                  className="h-full w-full object-cover"
                />
              </Avatar>
            ) : (
              <div className="h-10 w-10" />
            )}
          </div>
        )}

        {/* Message content */}
        <div className={`flex flex-col ${isMe ? "items-end" : ""}`}>
          {showMessageHeader && renderMessageHeader(message, isMe, client)}

          <MessageDisplaySection message={message} isMe={isMe} isOptimistic={isOptimistic} />

          {isOptimistic && (
            <div className={cn("mt-2 text-xs text-gray-400 flex items-center space-x-1")}>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Sending...</span>
            </div>
          )}
        </div>

        {/* Right avatar */}
        {isMe && (
          <div className="ml-3">
            {showMessageHeader ? (
              <Avatar className="h-10 w-10">
                <img
                  src="https://c.animaapp.com/mbtb1be13lPm2M/img/img-10.png"
                  alt="You"
                  className="h-full w-full object-cover"
                />
              </Avatar>
            ) : (
              <div className="h-10 w-10" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full border-l bg-white">
      <MessageHeaderSection client={client} />
      <div className="h-full p-6 overflow-y-scroll rounded-md" ref={containerRef}>
        {pagination.isLoading && !pagination.isInitialLoading && (
          <div className="flex justify-center py-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-green-500" />
              <span className="text-sm text-gray-500">Loading older messages...</span>
            </div>
          </div>
        )}

        {!pagination.hasMore && messages.length > 0 && messages.length > MESSAGES_PER_PAGE && (
          <div className="flex justify-center py-4">
            <span className="text-sm text-gray-400">No more messages</span>
          </div>
        )}

        {pagination.isInitialLoading && renderLoadingState()}

        {messages.length === 0 && !pagination.isInitialLoading && renderEmptyState()}
        {messages.length > 0 && messages.map(renderMessage)}

        <div ref={messagesEndRef} />
      </div>
      <MessageInputSection
        isLoadingAny={pagination.isLoading || pagination.isInitialLoading}
        userId={userId}
        setMessages={setMessages}
        shouldScrollToBottom={shouldScrollToBottom}
        conversationId={conversationId}
        isNearBottom={isNearBottom}
      />
    </div>
  );
}
const renderMessageHeader = (message: MessageContentType, isMe: boolean, client: ClientType) => (
  <div className="flex items-center mb-1">
    {isMe ? (
      <>
        <span className="mr-2 text-xs text-gray-500">{formatMessageTime(message.created_at)}</span>
        <span className="font-normal text-base text-gray-900">You</span>
      </>
    ) : (
      <>
        <span className="font-normal text-base text-gray-900">{client?.full_name || "Client"}</span>
        <span className="ml-2 text-xs text-gray-500">{formatMessageTime(message.created_at)}</span>
      </>
    )}
  </div>
);

const renderLoadingState = () => (
  <div className="h-full flex flex-col">
    <div className="flex-1 p-6">
      <div className="flex flex-col justify-center items-center h-full space-y-4">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-green-500" />
          <span className="text-lg font-medium text-gray-600">Loading conversation...</span>
        </div>
        <p className="text-sm text-gray-500">Please wait while we fetch your messages</p>
      </div>
    </div>
  </div>
);

const renderEmptyState = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <p className="text-gray-500 text-lg">No messages yet</p>
      <p className="text-gray-400 text-sm mt-2">Start a conversation!</p>
    </div>
  </div>
);
