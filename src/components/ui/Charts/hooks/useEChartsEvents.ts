import { useEffect, useRef, RefObject } from 'react';
import * as echarts from 'echarts';
import type { EventHandler, EventMap } from '../types';

/**
 * ECharts 事件管理 Hook
 * 使用差异更新策略，避免内存泄漏
 */
export function useEChartsEvents(
  chartInstanceRef: RefObject<echarts.ECharts | null>,
  onEvents?: EventMap
) {
  const prevEventsRef = useRef<EventMap>({});

  useEffect(() => {
    if (!chartInstanceRef.current) return;

    const prevEvents = prevEventsRef.current;
    const currentEvents = onEvents || {};

    // 1. 移除不再存在的事件
    Object.keys(prevEvents).forEach(eventName => {
      if (!(eventName in currentEvents)) {
        chartInstanceRef.current?.off(eventName, prevEvents[eventName]);
      }
    });

    // 2. 更新变化的事件（先移除旧的，再添加新的）
    Object.entries(currentEvents).forEach(([eventName, handler]) => {
      if (prevEvents[eventName] !== handler) {
        // 先移除旧监听器
        if (prevEvents[eventName]) {
          chartInstanceRef.current?.off(eventName, prevEvents[eventName]);
        }
        // 添加新监听器
        chartInstanceRef.current?.on(eventName, handler);
      }
    });

    prevEventsRef.current = currentEvents;

    // 清理函数：组件卸载时移除所有事件
    return () => {
      Object.entries(currentEvents).forEach(([eventName, handler]) => {
        chartInstanceRef.current?.off(eventName, handler);
      });
    };
  }, [chartInstanceRef, onEvents]);
}
