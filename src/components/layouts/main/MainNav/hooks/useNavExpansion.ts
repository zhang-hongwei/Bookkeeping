import { useState, useCallback } from "react";

export function useNavExpansion() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback((path: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);

  const isExpanded = useCallback(
    (path: string) => expandedItems.has(path),
    [expandedItems]
  );

  return {
    expandedItems,
    toggleExpand,
    isExpanded,
  };
}
