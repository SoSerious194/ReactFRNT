import { MessageContentType } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { useState, useCallback, useRef, useMemo, useEffect } from "react";

type PaginationType = {
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
};

const CONFIG = {
  MESSAGES_PER_PAGE: 20,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 1000,
} as const;

const useMessagePagination = () => {
  const [pagination, setPagination] = useState<PaginationType>({
    page: 0,
    hasMore: true,
    isLoading: false,
    isInitialLoading: true,
  });

  const updatePagination = useCallback((updates: Partial<PaginationType>) => {
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

export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<MessageContentType[]>([]);
  const { pagination, updatePagination, resetPagination } = useMessagePagination();
  const supabase = useMemo(() => createClient(), []);
  const isMountedRef = useRef(true);
  const currentRequestRef = useRef<string | null>(null);

  const fetchMessages = useCallback(
    async (pageNumber: number, isInitial = false, retryAttempt = 0): Promise<void> => {
      if (!conversationId || !isMountedRef.current) return;

      // Create a unique request ID to track this specific request
      const requestId = `${conversationId}-${pageNumber}-${Date.now()}`;
      currentRequestRef.current = requestId;

      updatePagination({
        isLoading: true,
        isInitialLoading: isInitial,
      });

      try {
        const from = pageNumber * CONFIG.MESSAGES_PER_PAGE;
        const to = from + CONFIG.MESSAGES_PER_PAGE - 1;

        const { data, error, count } = await supabase
          .from("messages")
          .select("*", { count: "exact" })
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .range(from, to);

        // Check if this request is still the current one and component is mounted
        if (!isMountedRef.current || currentRequestRef.current !== requestId) {
          return;
        }

        if (error) throw error;

        const newMessages = (data || []).reverse();
        const totalMessages = count || 0;
        const hasMoreMessages = from + newMessages.length < totalMessages;

        setMessages((prev) => (isInitial ? newMessages : [...newMessages, ...prev]));

        updatePagination({
          page: pageNumber,
          hasMore: hasMoreMessages,
          isLoading: false,
          isInitialLoading: false,
        });
      } catch (error: any) {
        // Don't handle errors if component is unmounted or this isn't the current request
        if (!isMountedRef.current || currentRequestRef.current !== requestId) {
          return;
        }

        // Retry logic for network errors
        if (retryAttempt < CONFIG.MAX_RETRY_ATTEMPTS && error.message?.includes("network")) {
          const delay = CONFIG.RETRY_DELAY_BASE * Math.pow(2, retryAttempt);
          setTimeout(() => {
            if (isMountedRef.current && currentRequestRef.current === requestId) {
              fetchMessages(pageNumber, isInitial, retryAttempt + 1);
            }
          }, delay);
          return;
        }

        console.error("Failed to fetch messages:", error);

        // Only update state if component is still mounted and this is the current request
        if (isMountedRef.current && currentRequestRef.current === requestId) {
          updatePagination({
            isLoading: false,
            isInitialLoading: false,
          });
        }
      }
    },
    [conversationId, supabase, updatePagination]
  );

  const loadMoreMessages = useCallback(() => {
    if (pagination.hasMore && !pagination.isLoading && isMountedRef.current) {
      fetchMessages(pagination.page + 1, false);
    }
  }, [fetchMessages, pagination]);

  // Initialize messages when conversation changes
  useEffect(() => {
    isMountedRef.current = true;

    if (conversationId) {
      resetPagination();
      setMessages([]);
      fetchMessages(0, true);
    }

    return () => {
      isMountedRef.current = false;
      currentRequestRef.current = null;
    };
  }, [conversationId, fetchMessages, resetPagination]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      currentRequestRef.current = null;
    };
  }, []);

  return {
    messages,
    setMessages,
    pagination,
    loadMoreMessages,
  };
};
