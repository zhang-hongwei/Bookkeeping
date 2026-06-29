import * as echarts from "echarts";
import { RefObject } from "react";

// ==================== Common Types ====================

/**
 * ECharts 主题类型
 */
export type EChartsTheme = string | object;

/**
 * 事件处理器类型
 */
export type EventHandler = (params: any) => void;

/**
 * 事件映射类型
 */
export type EventMap = Record<string, EventHandler>;

// ==================== Feature Config Types ====================

/**
 * 自动化功能配置接口
 */
export interface AutoFeatureConfig {
  enabled: boolean;
  interval?: number;
}

/**
 * 加载配置接口
 */
export interface LoadingConfig {
  enabled: boolean;
  text?: string;
  color?: string;
  spinnerRadius?: number;
  lineWidth?: number;
}

/**
 * 合并策略配置接口
 */
export interface MergeConfig {
  notMerge?: boolean;
  replaceMerge?: string | string[];
  lazyUpdate?: boolean;
}

/**
 * 导出图片配置接口
 */
export interface ExportImageOptions {
  type?: 'png' | 'jpeg' | 'svg';
  pixelRatio?: number;
  backgroundColor?: string;
}

/**
 * 数据信息接口（用于 hooks）
 */
export interface DataInfo {
  maxLength: number;
  seriesCount: number;
}

// ==================== Base Chart Types ====================

/**
 * Charts 基础组件 Props 接口
 */
export interface ChartsProps {
  // 基础配置
  width?: string | number;
  height?: string | number;
  option?: echarts.EChartsOption;
  theme?: string | object | "light" | "dark" | "auto";

  // 自动化功能配置
  auto?: {
    tooltip?: AutoFeatureConfig;
    highlight?: AutoFeatureConfig;
    render?: AutoFeatureConfig;
  };

  // 加载配置
  loading?: LoadingConfig;

  // 合并策略配置
  merge?: MergeConfig;

  // 事件回调
  onEvents?: EventMap;

  // 生命周期钩子
  onInit?: (instance: echarts.ECharts) => void;
  onDispose?: () => void;
}

/**
 * Charts 基础组件 Ref 接口
 */
export interface ChartsRef {
  // 实例访问
  getInstance: () => echarts.ECharts | null;

  // 常用控制方法
  resize: () => void;
  clear: () => void;
  refresh: () => void;

  // 导出功能
  exportImage: (options?: ExportImageOptions) => string;

  // 配置更新
  updateOption: (
    option: echarts.EChartsOption,
    opts?: { notMerge?: boolean; lazyUpdate?: boolean }
  ) => void;

  // 事件控制
  on: (eventName: string, handler: (params: any) => void) => void;
  off: (eventName: string, handler?: (params: any) => void) => void;
}

// ==================== Chart Component Props ====================

/**
 * 环形图组件 Props 接口
 */
export interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  centerText?: string;
  centerSubText?: string;
  width?: string | number;
  height?: string | number;
  radius?: [string, string];
  colors?: string[];
  showLabel?: boolean;
  showLegend?: boolean;
  legendPosition?: "top" | "bottom" | "left" | "right";
  onEvents?: EventMap;
  theme?: "light" | "dark" | "auto";
}

/**
 * 仪表盘组件 Props 接口
 */
export interface GaugeChartProps {
  value: number;
  max?: number;
  title?: string;
  unit?: string;
  width?: string | number;
  height?: string | number;
  color?: string | string[];
  showPointer?: boolean;
  showDetail?: boolean;
  onEvents?: EventMap;
  theme?: "light" | "dark" | "auto";
}

/**
 * 桑基图节点接口
 */
export interface SankeyNode {
  id: string;
  name: string;
  value?: number;
  category?: number;
  itemStyle?: {
    color?: string;
  };
}

/**
 * 桑基图链接接口
 */
export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  label?: {
    show?: boolean;
    formatter?: string;
  };
}

/**
 * 需求映射数据接口
 */
export interface RequirementMappingData {
  nodes: SankeyNode[];
  links: SankeyLink[];
  categories?: Array<{
    name: string;
    itemStyle?: {
      color?: string;
    };
  }>;
}

/**
 * 桑基图组件 Props 接口
 */
export interface SankeyChartProps {
  data: RequirementMappingData;
  width?: string | number;
  height?: string | number;
  theme?: "light" | "dark" | "auto";
  title?: string;
  nodeWidth?: number;
  nodeGap?: number;
  layoutIterations?: number;
  orient?: "horizontal" | "vertical";
  draggable?: boolean;
  focusNodeAdjacency?: boolean | "inEdges" | "outEdges" | "allEdges";
  levels?: Array<{
    depth: number;
    itemStyle?: {
      color?: string;
    };
    lineStyle?: {
      color?: string;
      opacity?: number;
    };
  }>;
  onNodeClick?: (params: any) => void;
  onLinkClick?: (params: any) => void;
}

// ==================== Hook Types ====================

/**
 * useEChartsInstance Hook 配置接口
 */
export interface UseEChartsInstanceOptions {
  theme?: EChartsTheme | "light" | "dark" | "auto";
  onInit?: (instance: echarts.ECharts) => void;
  onDispose?: () => void;
}

/**
 * useEChartsInstance Hook 返回值接口
 */
export interface UseEChartsInstanceReturn {
  chartInstanceRef: RefObject<echarts.ECharts | null>;
  renderChart: (option: echarts.EChartsOption, opts?: {
    notMerge?: boolean;
    replaceMerge?: string | string[];
    lazyUpdate?: boolean;
  }) => void;
  destroyChart: () => void;
  getCurrentTheme: () => EChartsTheme | undefined;
}
