import { useEffect, useRef, useCallback, useMemo, RefObject } from 'react';
import * as echarts from 'echarts';
import type { AutoFeatureConfig, DataInfo } from '../types';

/**
 * 获取数据信息的工具函数
 */
function getDataInfo(option: echarts.EChartsOption): DataInfo {
  const series = (option as any).series;
  if (!Array.isArray(series) || series.length === 0) {
    return { maxLength: 0, seriesCount: 0 };
  }

  const maxLength = Math.max(
    ...series.map((s: any) => (Array.isArray(s.data) ? s.data.length : 0))
  );

  return { maxLength, seriesCount: series.length };
}

/**
 * 自动高亮 Hook
 * 自动循环高亮数据点
 */
export function useAutoHighlight(
  chartInstanceRef: RefObject<echarts.ECharts | null>,
  option: echarts.EChartsOption,
  config?: AutoFeatureConfig
) {
  const enabled = config?.enabled ?? false;
  const interval = config?.interval ?? 2000;

  const indexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dataInfo = useMemo(() => getDataInfo(option), [option]);

  // 清除高亮
  const clearHighlight = useCallback(() => {
    const { maxLength, seriesCount } = dataInfo;
    if (maxLength === 0 || !chartInstanceRef.current) return;

    try {
      const targetIndex =
        indexRef.current - 1 >= 0 ? indexRef.current - 1 : maxLength - 1;

      // 对所有系列清除高亮
      for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
        chartInstanceRef.current.dispatchAction({
          type: "downplay",
          seriesIndex,
          dataIndex: targetIndex,
        });
      }
    } catch (error) {
      console.warn("Error clearing highlight:", error);
    }
  }, [chartInstanceRef, dataInfo]);

  // 高亮下一个数据点
  const highlightNext = useCallback(() => {
    const { maxLength, seriesCount } = dataInfo;
    if (maxLength === 0 || !chartInstanceRef.current) return;

    try {
      clearHighlight();

      // 对所有系列进行高亮
      for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
        chartInstanceRef.current.dispatchAction({
          type: "highlight",
          seriesIndex,
          dataIndex: indexRef.current,
        });
      }

      if (indexRef.current < maxLength - 1) {
        indexRef.current += 1;
      } else {
        indexRef.current = 0;
      }
    } catch (error) {
      console.warn("Error highlighting next:", error);
    }
  }, [chartInstanceRef, dataInfo, clearHighlight]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    highlightNext();
    timerRef.current = setInterval(() => {
      highlightNext();
    }, interval);
  }, [clearTimer, highlightNext, interval]);

  useEffect(() => {
    if (enabled) {
      startTimer();
    }

    return () => {
      clearTimer();
      clearHighlight();
    };
  }, [enabled, startTimer, clearTimer, clearHighlight]);

  return {
    start: startTimer,
    stop: clearTimer,
    clear: clearHighlight,
  };
}
