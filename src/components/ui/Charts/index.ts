export { default as Charts } from "./components/base";
// export { default as LineChart } from "./components/line"; // TODO: Implement LineChart component
export { default as DonutChart } from "./components/donut";
export { default as GaugeChart } from "./components/gauge";
export { default as SankeyChart } from "./components/sankey";

// Export all types from the unified types file
export type {
  // Common Types
  EChartsTheme,
  EventHandler,
  EventMap,

  // Feature Config Types
  AutoFeatureConfig,
  LoadingConfig,
  MergeConfig,
  ExportImageOptions,
  DataInfo,

  // Base Chart Types
  ChartsProps,
  ChartsRef,

  // Chart Component Props
  DonutChartProps,
  GaugeChartProps,
  SankeyNode,
  SankeyLink,
  RequirementMappingData,
  SankeyChartProps,

  // Hook Types
  UseEChartsInstanceOptions,
  UseEChartsInstanceReturn,
} from "./types";
