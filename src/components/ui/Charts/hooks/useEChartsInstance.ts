import { useRef, useCallback, useEffect, RefObject } from 'react';
import * as echarts from 'echarts';
import { ECHARTS_CUSTOM_THEME, ECHARTS_THEME_NAME } from '@/config/echarts';
import { themeManager } from '../lib';
import type {
  EChartsTheme,
  UseEChartsInstanceOptions,
  UseEChartsInstanceReturn,
} from '../types';

// 使用主题管理器注册主题（避免重复注册）
if (typeof window !== 'undefined') {
  themeManager.registerTheme(ECHARTS_THEME_NAME, ECHARTS_CUSTOM_THEME);

  // 开发环境下输出主题统计信息
  if (process.env.NODE_ENV === 'development') {
    const stats = themeManager.getStats();
    console.log('📊 Theme Manager Stats:', stats);
  }
}

/**
 * ECharts 实例管理 Hook
 * 负责实例的创建、销毁和配置更新
 */
export function useEChartsInstance(
  containerRef: RefObject<HTMLDivElement | null>,
  options: UseEChartsInstanceOptions = {}
): UseEChartsInstanceReturn {
  const { theme = "auto", onInit, onDispose } = options;
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  // 获取当前主题
  const getCurrentTheme = useCallback((): EChartsTheme | undefined => {
    if (typeof theme === "object") {
      return theme;
    }

    if (typeof theme === "string") {
      if (theme === "auto" || theme === "light" || theme === "dark") {
        return ECHARTS_THEME_NAME;
      }
      return theme;
    }

    return ECHARTS_THEME_NAME;
  }, [theme]);

  // 销毁 ECharts 实例
  const destroyChart = useCallback(() => {
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.dispose();
      } catch (error) {
        console.warn("Error disposing chart:", error);
      } finally {
        chartInstanceRef.current = null;
      }
    }
  }, []);

  // 渲染图表
  const renderChart = useCallback((
    option: echarts.EChartsOption,
    opts: {
      notMerge?: boolean;
      replaceMerge?: string | string[];
      lazyUpdate?: boolean;
    } = {}
  ) => {
    if (!containerRef.current) return;

    try {
      // 如果实例不存在，创建新实例
      if (!chartInstanceRef.current) {
        const currentTheme = getCurrentTheme();
        if (process.env.NODE_ENV === 'development') {
          console.log('🎨 Initializing chart with theme:', currentTheme);
        }

        chartInstanceRef.current = echarts.init(containerRef.current, currentTheme, {
          renderer: "svg",
          devicePixelRatio: window.devicePixelRatio || 1,
        });

        // 调用 onInit 回调
        if (onInit && chartInstanceRef.current) {
          onInit(chartInstanceRef.current);
        }
      }

      // 设置选项
      if (chartInstanceRef.current) {
        const finalOption = {
          backgroundColor: "transparent",
          ...option,
        };

        if (process.env.NODE_ENV === 'development' && option.series && Array.isArray(option.series)) {
          console.log('📊 Chart option color:', option.color || '(using theme)');
          console.log('📊 Series type:', option.series[0]?.type);
        }

        chartInstanceRef.current.setOption(finalOption, {
          notMerge: opts.notMerge ?? false,
          replaceMerge: opts.replaceMerge,
          lazyUpdate: opts.lazyUpdate ?? false,
        });
      }
    } catch (error) {
      console.error("Error rendering chart:", error);
    }
  }, [containerRef, getCurrentTheme, onInit]);

  // 主题变化时重新初始化（优化版：减少闪烁）
  useEffect(() => {
    if (!chartInstanceRef.current || !containerRef.current) return;

    // 保存当前配置
    const currentOption = chartInstanceRef.current.getOption();

    // 使用 requestAnimationFrame 优化渲染时机
    requestAnimationFrame(() => {
      if (!containerRef.current) return;

      // 快速销毁
      chartInstanceRef.current?.dispose();

      // 重新初始化
      const newTheme = getCurrentTheme();
      if (process.env.NODE_ENV === 'development') {
        console.log('🎨 Theme changed, reinitializing chart with:', newTheme);
      }

      chartInstanceRef.current = echarts.init(containerRef.current, newTheme, {
        renderer: "svg",
        devicePixelRatio: window.devicePixelRatio || 1,
      });

      // 恢复配置（静默模式 + 不触发动画）
      if (currentOption && chartInstanceRef.current) {
        chartInstanceRef.current.setOption(currentOption, {
          notMerge: true,
          silent: true,
          lazyUpdate: false, // 立即更新，减少延迟
        });
      }

      // 调用 onInit 回调
      if (onInit && chartInstanceRef.current) {
        onInit(chartInstanceRef.current);
      }
    });
  }, [theme, getCurrentTheme, containerRef, onInit]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (onDispose) {
        onDispose();
      }
      destroyChart();
    };
  }, [destroyChart, onDispose]);

  return {
    chartInstanceRef,
    renderChart,
    destroyChart,
    getCurrentTheme,
  };
}
