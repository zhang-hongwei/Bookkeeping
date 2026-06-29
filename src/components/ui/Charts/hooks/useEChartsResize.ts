import { useEffect, useCallback, RefObject } from 'react';
import * as echarts from 'echarts';

/**
 * ECharts 响应式 Hook
 * 监听容器尺寸变化并自动调用 resize
 */
export function useEChartsResize(
  containerRef: RefObject<HTMLDivElement | null>,
  chartInstanceRef: RefObject<echarts.ECharts | null>
) {
  const resize = useCallback(() => {
    chartInstanceRef.current?.resize();
  }, [chartInstanceRef]);

  // 使用 ResizeObserver 监听容器尺寸变化
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });

    resizeObserver.observe(containerRef.current);

    // 也保留 window resize 监听作为备用
    window.addEventListener("resize", resize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [containerRef, resize]);
}
