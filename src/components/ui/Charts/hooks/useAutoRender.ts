import { useEffect, useRef, useCallback, RefObject } from 'react';
import * as echarts from 'echarts';
import type { AutoFeatureConfig } from '../types';

/**
 * 自动渲染 Hook
 * 定时刷新图表（优化版：使用 resize 而非完全重新渲染）
 */
export function useAutoRender(
  chartInstanceRef: RefObject<echarts.ECharts | null>,
  config?: AutoFeatureConfig
) {
  const enabled = config?.enabled ?? false;
  const interval = config?.interval ?? 8000;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(() => {
    if (!chartInstanceRef.current) return;

    try {
      // 优化：只刷新视图，不重新创建实例
      chartInstanceRef.current.resize();

      // 如果需要重新计算，使用 lazyUpdate
      const currentOption = chartInstanceRef.current.getOption();
      chartInstanceRef.current.setOption(currentOption, {
        lazyUpdate: true,
      });
    } catch (error) {
      console.warn("Error auto-refreshing chart:", error);
    }
  }, [chartInstanceRef]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      refresh();
    }, interval);
  }, [clearTimer, refresh, interval]);

  useEffect(() => {
    if (enabled) {
      startTimer();
    }

    return () => {
      clearTimer();
    };
  }, [enabled, startTimer, clearTimer]);

  return {
    start: startTimer,
    stop: clearTimer,
    refresh,
  };
}
