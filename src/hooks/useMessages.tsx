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
    isInitialLoading: false,
  });

  const updatePagination = useCallback((updates: Partial<PaginationType>) => {
    setPagination((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination({
      page: 0,
      hasMore: true,
      isLoading: false,
      isInitialLoading: false,
    });
  }, []);

  return { pagination, updatePagination, resetPagination };
};

export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<MessageContentType[]>([]);
  const supabase = useMemo(() => createClient(), []);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { pagination, updatePagination, resetPagination } = useMessagePagination();

  const fetchMessages = useCallback(
    async (pageNumber: number, isInitial = false, retryAttempt = 0): Promise<void> => {
      if (!conversationId) return;

      // Cancel previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

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
          .range(from, to)
          .abortSignal(abortControllerRef.current.signal);

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
        if (error.name === "AbortError") return;

        // Retry logic for network errors
        if (retryAttempt < CONFIG.MAX_RETRY_ATTEMPTS && error.message?.includes("network")) {
          const delay = CONFIG.RETRY_DELAY_BASE * Math.pow(2, retryAttempt);
          setTimeout(() => fetchMessages(pageNumber, isInitial, retryAttempt + 1), delay);
          return;
        }

        console.error("Failed to fetch messages:", error);
        updatePagination({
          isLoading: false,
          isInitialLoading: false,
        });
      }
    },
    [conversationId, supabase, updatePagination]
  );

  const loadMoreMessages = useCallback(() => {
    if (pagination.hasMore && !pagination.isLoading) {
      fetchMessages(pagination.page + 1, false);
    }
  }, [fetchMessages, pagination]);

  // Initialize messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      resetPagination();
      setMessages([]);
      fetchMessages(0, true);
    }

    return () => abortControllerRef.current?.abort();
  }, [conversationId, fetchMessages, resetPagination]);

  return {
    messages,
    setMessages,
    pagination,
    loadMoreMessages,
    supabase,
  };
};
