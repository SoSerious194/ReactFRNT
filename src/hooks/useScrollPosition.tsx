import { useState, useRef, useCallback, useMemo, useEffect } from "react";

const NEAR_BOTTOM_THRESHOLD = 1000;
const SCROLL_THRESHOLD = 100;
const SCROLL_DEBOUNCE_MS = 150;

export const useScrollPosition = ({
  loadMoreMessages,
  isLoading,
  hasMore,
}: {
  loadMoreMessages: () => void;
  isLoading: boolean;
  hasMore: boolean;
}) => {
  const [isNearBottom, setIsNearBottom] = useState(true);
  const previousScrollHeight = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const checkScrollPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const nearBottom = scrollHeight - scrollTop - clientHeight <= NEAR_BOTTOM_THRESHOLD;

    setIsNearBottom(nearBottom);
    return nearBottom;
  }, []);

  // Utility functions
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Handle scroll event (non-debounced version)
  useEffect(() => {
    if (isLoading || !previousScrollHeight.current || !containerRef.current) return;

    const container = containerRef.current;
    const newScrollTop = container.scrollHeight - previousScrollHeight.current + container.scrollTop;
    container.scrollTop = newScrollTop;
    previousScrollHeight.current = 0;
  }, [isLoading]);

  const handleScroll = useMemo(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        const container = containerRef.current;
        if (!container || isLoading || !hasMore) return;

        checkScrollPosition();

        if (container.scrollTop <= SCROLL_THRESHOLD) {
          previousScrollHeight.current = container.scrollHeight;
          loadMoreMessages();
        }
      }, SCROLL_DEBOUNCE_MS);
    };
  }, [loadMoreMessages, isLoading, hasMore, checkScrollPosition]);

  return {
    containerRef,
    isNearBottom,
    checkScrollPosition,
    handleScroll,
    messagesEndRef,
    scrollToBottom,
    previousScrollHeight,
  };
};
