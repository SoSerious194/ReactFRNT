import { useState, useRef, useCallback } from "react";

const NEAR_BOTTOM_THRESHOLD = 100;

export const useScrollPosition = () => {
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
