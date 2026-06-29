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
 * 自动 Tooltip Hook
 * 自动循环显示 tooltip
 */
export function useAutoTooltip(
  chartInstanceRef: RefObject<echarts.ECharts | null>,
  option: echarts.EChartsOption,
  config?: AutoFeatureConfig
) {
  const enabled = config?.enabled ?? false;
  const interval = config?.interval ?? 2000;

  const indexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dataInfo = useMemo(() => getDataInfo(option), [option]);

  const dispatchTooltipAction = useCallback(() => {
    const { maxLength, seriesCount } = dataInfo;
    if (maxLength === 0 || !chartInstanceRef.current) return;

    try {
      // 对所有系列显示 tooltip
      for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
        chartInstanceRef.current.dispatchAction({
          type: "showTip",
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
      console.warn("Error dispatching tooltip action:", error);
    }
  }, [chartInstanceRef, dataInfo]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    dispatchTooltipAction();
    timerRef.current = setInterval(() => {
      dispatchTooltipAction();
    }, interval);
  }, [clearTimer, dispatchTooltipAction, interval]);

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
  };
}
