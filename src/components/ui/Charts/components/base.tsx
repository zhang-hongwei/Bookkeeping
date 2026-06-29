"use client";

import {
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import * as echarts from "echarts";

// 导入所有hooks
import {
  useEChartsInstance,
  useEChartsResize,
  useEChartsEvents,
  useEChartsLoading,
  useAutoTooltip,
  useAutoHighlight,
  useAutoRender,
} from "../hooks";

// 导入类型
import type {
  ChartsProps,
  ChartsRef,
  ExportImageOptions,
} from "../types";

const Charts = forwardRef<ChartsRef, ChartsProps>((props, ref) => {
  const {
    width = "100%",
    height = "100%",
    option = {},
    theme = "auto",
    onEvents = {},
    onInit,
    onDispose,
    auto,
    loading,
    merge,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  // 使用 useMemo 来优化 option 的深度比较
  const optionString = useMemo(() => JSON.stringify(option), [option]);

  // 1. 实例管理
  const { chartInstanceRef, renderChart } = useEChartsInstance(containerRef, {
    theme,
    onInit,
    onDispose,
  });

  // 2. 渲染图表（当 option 变化时）
  useEffect(() => {
    renderChart(option, {
      notMerge: merge?.notMerge,
      replaceMerge: merge?.replaceMerge,
      lazyUpdate: merge?.lazyUpdate,
    });
  }, [optionString, merge?.notMerge, merge?.replaceMerge, merge?.lazyUpdate, renderChart]);

  // 3. 响应式
  useEChartsResize(containerRef, chartInstanceRef);

  // 4. 事件系统
  useEChartsEvents(chartInstanceRef, onEvents);

  // 5. 加载状态
  useEChartsLoading(chartInstanceRef, loading);

  // 6. 自动化功能
  const tooltipControls = useAutoTooltip(chartInstanceRef, option, auto?.tooltip);
  const highlightControls = useAutoHighlight(chartInstanceRef, option, auto?.highlight);
  const renderControls = useAutoRender(chartInstanceRef, auto?.render);

  // 7. 鼠标悬停时暂停自动化功能
  const handleMouseEnter = useCallback(() => {
    tooltipControls.stop();
    highlightControls.stop();
    highlightControls.clear();
  }, [tooltipControls, highlightControls]);

  const handleMouseLeave = useCallback(() => {
    if (auto?.tooltip?.enabled) {
      tooltipControls.start();
    }
    if (auto?.highlight?.enabled) {
      highlightControls.start();
    }
  }, [auto?.tooltip?.enabled, auto?.highlight?.enabled, tooltipControls, highlightControls]);

  // 8. 对外接口
  useImperativeHandle(ref, () => ({
    // 实例访问
    getInstance: () => chartInstanceRef.current,

    // 常用控制方法
    resize: () => {
      chartInstanceRef.current?.resize();
    },

    clear: () => {
      chartInstanceRef.current?.clear();
    },

    refresh: () => {
      if (chartInstanceRef.current) {
        const currentOption = chartInstanceRef.current.getOption();
        chartInstanceRef.current.setOption(currentOption, { notMerge: true });
      }
    },

    // 导出功能
    exportImage: (options: ExportImageOptions = {}) => {
      if (!chartInstanceRef.current) return '';
      return chartInstanceRef.current.getDataURL({
        type: options.type || 'png',
        pixelRatio: options.pixelRatio || 2,
        backgroundColor: options.backgroundColor || '#ffffff',
      });
    },

    // 配置更新
    updateOption: (newOption: echarts.EChartsOption, opts = {}) => {
      chartInstanceRef.current?.setOption(newOption, opts);
    },

    // 事件控制
    on: (eventName: string, handler: (params: any) => void) => {
      chartInstanceRef.current?.on(eventName, handler);
    },

    off: (eventName: string, handler?: (params: any) => void) => {
      chartInstanceRef.current?.off(eventName, handler);
    },
  }), [chartInstanceRef]);

  return (
    <div
      ref={containerRef}
      style={{ height, width, backgroundColor: "transparent" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
});

Charts.displayName = "Charts";

export default Charts;
