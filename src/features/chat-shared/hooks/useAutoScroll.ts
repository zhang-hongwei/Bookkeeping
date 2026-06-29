import { useEffect, useRef } from "react";
import type { VirtuosoHandle } from "react-virtuoso";

interface UseAutoScrollOptions {
  messages: Array<{ id: string }>;
  virtuosoRef: React.RefObject<VirtuosoHandle>;
}

export function useAutoScroll({ messages, virtuosoRef }: UseAutoScrollOptions) {
  const prevMsgCountRef = useRef(0);

  useEffect(() => {
    if (messages.length === 0) return;
    const isNewMessage = messages.length !== prevMsgCountRef.current;
    prevMsgCountRef.current = messages.length;
    virtuosoRef.current?.scrollToIndex({
      index: messages.length - 1,
      behavior: isNewMessage ? "smooth" : "auto",
      align: "end",
    });
  }, [messages, virtuosoRef]);
}
