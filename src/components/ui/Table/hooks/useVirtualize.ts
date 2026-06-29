import { useMemo, useState, useEffect, useRef, useCallback } from 'react';

interface VirtualizeOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // 预渲染的额外项数
  enabled?: boolean; // 是否启用虚拟化
}

interface VirtualizeResult<T> {
  virtualItems: Array<{
    index: number;
    item: T;
    style: React.CSSProperties;
  }>;
  totalHeight: number;
  scrollElementProps: {
    onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
    ref: React.RefObject<HTMLDivElement>;
    style: React.CSSProperties;
  };
  isVirtualizing: boolean;
}

export function useVirtualize<T>(
  items: T[],
  options: VirtualizeOptions
): VirtualizeResult<T> {
  const {
    itemHeight,
    containerHeight,
    overscan = 3,
    enabled = true
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // 是否应该启用虚拟化
  const shouldVirtualize = useMemo(() => {
    return enabled && items.length > 20 && containerHeight > 0;
  }, [enabled, items.length, containerHeight]);

  // 计算虚拟化参数
  const virtualizeData = useMemo(() => {
    if (!shouldVirtualize) {
      return {
        startIndex: 0,
        endIndex: items.length - 1,
        totalHeight: items.length * itemHeight,
        offsetY: 0,
      };
    }

    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      startIndex + visibleItemCount + overscan * 2
    );
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    return {
      startIndex,
      endIndex,
      totalHeight,
      offsetY,
    };
  }, [shouldVirtualize, items.length, itemHeight, containerHeight, scrollTop, overscan]);

  // 生成虚拟项
  const virtualItems = useMemo(() => {
    const result = [];
    const { startIndex, endIndex, offsetY } = virtualizeData;

    for (let i = startIndex; i <= endIndex; i++) {
      if (i >= 0 && i < items.length) {
        result.push({
          index: i,
          item: items[i],
          style: {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            right: 0,
            height: itemHeight,
            transform: `translateY(${offsetY + (i - startIndex) * itemHeight}px)`,
          },
        });
      }
    }

    return result;
  }, [items, virtualizeData, itemHeight]);

  // 滚动处理
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    setScrollTop(target.scrollTop);
  }, []);

  // 滚动容器属性
  const scrollElementProps = useMemo(() => ({
    onScroll: handleScroll,
    ref: scrollElementRef,
    style: {
      height: containerHeight,
      overflow: 'auto' as const,
      position: 'relative' as const,
    },
  }), [handleScroll, containerHeight]);

  return {
    virtualItems,
    totalHeight: virtualizeData.totalHeight,
    scrollElementProps,
    isVirtualizing: shouldVirtualize,
  };
}

// 为表格优化的虚拟化Hook
export function useTableVirtualize<T>(
  dataSource: T[],
  options: {
    rowHeight?: number;
    containerHeight?: number;
    enabled?: boolean;
  } = {}
) {
  const {
    rowHeight = 48, // 默认行高
    containerHeight = 400,
    enabled = dataSource.length > 100, // 超过100行才启用虚拟化
  } = options;

  return useVirtualize(dataSource, {
    itemHeight: rowHeight,
    containerHeight,
    enabled,
    overscan: 5, // 表格多预渲染一些行以提供更好的滚动体验
  });
}