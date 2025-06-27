"use client";

import { Loader2 } from "lucide-react";
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { ClientType } from "@/types/client";
import { createClient } from "@/utils/supabase/client";
import MessageInputSection from "../MassageInputSection/MessageInputSection";
import MessageHeaderSection from "../MessageHeaderSection/MessageHeaderSection";
import MessageDisplaySection from "./MessageDisplaySection";
import { MessageType as MessageTypeEnum } from "@/types";

export interface MessageContentType {
  id: string;
  sender_id: string;
  content: string;
  file_path: string | null;
  file_name: string | null;
  message_type: MessageTypeEnum;
  created_at: string;
  isCurrentUser?: boolean;
}

interface PaginationState {
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
}

// Constants
const MESSAGES_PER_PAGE = 20;
const SCROLL_THRESHOLD = 100;
const NEAR_BOTTOM_THRESHOLD = 100;
const SCROLL_DEBOUNCE_MS = 150;

// Custom hooks
const useScrollPosition = () => {
  const [isNearBottom, setIsNearBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkScrollPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const nearBottom = scrollHeight - scrollTop - clientHeight <= NEAR_BOTTOM_THRESHOLD;

    setIsNearBottom(nearBottom);
    return nearBottom;
  }, []);

  return { containerRef, isNearBottom, checkScrollPosition };
};

const useMessagePagination = (conversationId: string) => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    hasMore: true,
    isLoading: false,
    isInitialLoading: true,
  });

  const updatePagination = useCallback((updates: Partial<PaginationState>) => {
    setPagination((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination({
      page: 0,
      hasMore: true,
      isLoading: false,
      isInitialLoading: true,
    });
  }, []);

  return { pagination, updatePagination, resetPagination };
};

export default function MessageSection({ client, conversationId, userId }: { client: ClientType; conversationId: string; userId: string }) {
  // Memoize supabase client to prevent recreating on every render
  const supabase = useMemo(() => createClient(), []);

  const [messages, setMessages] = useState<MessageContentType[]>([]);

  const { containerRef, isNearBottom, checkScrollPosition } = useScrollPosition();
  const { pagination, updatePagination, resetPagination } = useMessagePagination(conversationId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef(0);
  const shouldScrollToBottom = useRef(true);
  const retryCount = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoized values
  const hasMessages = messages.length > 0;
  const isLoadingAny = pagination.isLoading || pagination.isInitialLoading;

  // Utility functions
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Fetch messages with better error handling and abort support
  const fetchMessages = useCallback(
    async (pageNumber: number, isInitial: boolean, retryAttempt = 0) => {
      if (!conversationId) return;

      // Abort previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      updatePagination({
        isLoading: true,
        isInitialLoading: isInitial,
      });

      try {
        const from = pageNumber * MESSAGES_PER_PAGE;
        const to = from + MESSAGES_PER_PAGE - 1;

        const { data, error, count } = await supabase
          .from("messages")
          .select("id, sender_id, content, file_path, file_name, message_type, created_at", { count: "exact" })
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .range(from, to)
          .abortSignal(abortControllerRef.current.signal);

        if (error) throw error;

        const newMessages = (data || []).reverse();
        const totalMessages = count || 0;
        const hasMoreMessages = from + newMessages.length < totalMessages;

        if (isInitial) {
          setMessages(newMessages);
          shouldScrollToBottom.current = true;
        } else {
          setMessages((prev) => [...newMessages, ...prev]);
        }

        updatePagination({
          page: pageNumber,
          hasMore: hasMoreMessages,
          isLoading: false,
          isInitialLoading: false,
        });

        retryCount.current = 0;
      } catch (error: any) {
        if (error.name === "AbortError") return;

        // Retry logic for transient errors
        if (retryAttempt < 3 && error.message?.includes("network")) {
          setTimeout(() => {
            fetchMessages(pageNumber, isInitial, retryAttempt + 1);
          }, Math.pow(2, retryAttempt) * 1000);
          return;
        }

        updatePagination({
          isLoading: false,
          isInitialLoading: false,
        });
      }
    },
    [conversationId, supabase, updatePagination]
  );

  // Load more messages
  const loadMoreMessages = useCallback(() => {
    if (pagination.hasMore && !pagination.isLoading) {
      fetchMessages(pagination.page + 1, false);
    }
  }, [fetchMessages, pagination.hasMore, pagination.isLoading, pagination.page]);

  // Handle scroll event (non-debounced version)
  const handleScroll = useMemo(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        const container = containerRef.current;
        if (!container || pagination.isLoading || !pagination.hasMore) return;

        checkScrollPosition();

        if (container.scrollTop <= SCROLL_THRESHOLD) {
          previousScrollHeight.current = container.scrollHeight;
          loadMoreMessages();
        }
      }, SCROLL_DEBOUNCE_MS);
    };
  }, [loadMoreMessages, pagination.isLoading, pagination.hasMore, checkScrollPosition]);

  // Effects
  useEffect(() => {
    if (conversationId) {
      resetPagination();
      setMessages([]);
      fetchMessages(0, true);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [conversationId, resetPagination]); // Removed fetchMessages from deps

  // Separate effect for initial fetch when pagination resets
  useEffect(() => {
    if (conversationId && pagination.isInitialLoading && messages.length === 0) {
      fetchMessages(0, true);
    }
  }, [conversationId, pagination.isInitialLoading, messages.length, fetchMessages]);

  // Maintain scroll position after pagination
  useEffect(() => {
    if (isLoadingAny || !previousScrollHeight.current || !containerRef.current) return;

    const container = containerRef.current;
    const newScrollTop = container.scrollHeight - previousScrollHeight.current + container.scrollTop;
    container.scrollTop = newScrollTop;
    previousScrollHeight.current = 0;
  }, [messages, isLoadingAny]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!pagination.isInitialLoading && shouldScrollToBottom.current && hasMessages) {
      const timeoutId = setTimeout(() => {
        scrollToBottom("auto");
        shouldScrollToBottom.current = false;
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [messages, pagination.isInitialLoading, scrollToBottom, hasMessages]);

  // Scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // Real-time message subscription
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
          const newMessage = payload.new as MessageContentType;

          // Avoid duplicate messages from optimistic updates
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) return prev;

            // Remove any temporary messages with same content
            const filtered = prev.filter((msg) => {
              // Keep the message if it's NOT a temporary message that matches our criteria
              if (!msg.id.startsWith("temp-")) {
                return true; // Keep all non-temporary messages
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
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase, isNearBottom]);

  return (
    <div className="flex flex-col h-full w-full border-l bg-white">
      <MessageHeaderSection client={client} />
      <div className="h-full p-6 overflow-y-scroll rounded-md border" ref={containerRef}>
        {/* Loading indicator for pagination */}
        {pagination.isLoading && !pagination.isInitialLoading && (
          <div className="flex justify-center py-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-green-500" />
              <span className="text-sm text-gray-500">Loading older messages...</span>
            </div>
          </div>
        )}

        {/* No more messages indicator */}
        {!pagination.hasMore && hasMessages && (
          <div className="flex justify-center py-4">
            <span className="text-sm text-gray-400">No more messages</span>
          </div>
        )}

        {/* Empty state */}
        {!hasMessages && !pagination.isInitialLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg">No messages yet</p>
              <p className="text-gray-400 text-sm mt-2">Start a conversation!</p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => {
          const isMe = message.sender_id === userId;
          const isOptimistic = message.id.startsWith("temp-");

          return (
            <div key={message.id} className={`flex   mb-8 ${isMe ? "justify-end" : ""} ${isOptimistic ? "opacity-70" : ""}`}>
              {!isMe && (
                <Avatar className="h-10 w-10 mr-3">
                  <img src={client?.profile_image_url || "https://c.animaapp.com/mbtb1be13lPm2M/img/img-4.png"} alt="Sender" className="h-full w-full object-cover" />
                </Avatar>
              )}
              <div className={`flex flex-col ${isMe ? "items-end" : ""}`}>
                <div className="flex items-center mb-1">
                  {!isMe ? (
                    <>
                      <span className="font-normal text-base text-gray-900">{client?.full_name}</span>
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
                      <span className="font-normal text-base text-gray-900">You</span>
                    </>
                  )}
                </div>

                <MessageDisplaySection message={message} isMe={isMe} isOptimistic={isOptimistic} />
              </div>
              {isMe && (
                <Avatar className="h-10 w-10 ml-3">
                  <img src="https://c.animaapp.com/mbtb1be13lPm2M/img/img-10.png" alt="You" className="h-full w-full object-cover" />
                </Avatar>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <MessageInputSection
        isLoadingAny={isLoadingAny}
        userId={userId}
        setMessages={setMessages}
        shouldScrollToBottom={shouldScrollToBottom}
        conversationId={conversationId}
        isNearBottom={isNearBottom}
      />
    </div>
  );
}
