import { useEffect, RefObject } from 'react';
import * as echarts from 'echarts';
import type { LoadingConfig } from '../types';

/**
 * ECharts 加载状态 Hook
 * 管理图表的加载动画显示/隐藏
 */
export function useEChartsLoading(
  chartInstanceRef: RefObject<echarts.ECharts | null>,
  loading?: LoadingConfig
) {
  const loadingEnabled = loading?.enabled ?? false;
  const loadingOption = {
    text: loading?.text,
    color: loading?.color,
    spinnerRadius: loading?.spinnerRadius,
    lineWidth: loading?.lineWidth,
  };

  useEffect(() => {
    if (!chartInstanceRef.current) return;

    try {
      if (loadingEnabled) {
        chartInstanceRef.current.showLoading("default", loadingOption);
      } else {
        chartInstanceRef.current.hideLoading();
      }
    } catch (error) {
      console.warn("Error handling loading state:", error);
    }
  }, [chartInstanceRef, loadingEnabled, loadingOption]);
}
