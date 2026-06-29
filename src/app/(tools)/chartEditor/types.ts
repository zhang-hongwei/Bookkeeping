/**
 * Chart Editor Types
 * Type definitions for the visual ECharts editor
 */

// ─── Series ──────────────────────────────────────────────────────────────

export type SymbolType = 'circle' | 'rect' | 'triangle' | 'diamond' | 'none';

export interface ChartEditorSeries {
  id: string;
  name: string;
  data: number[];
  /** Override theme color; empty string means use palette */
  color: string;
  smooth: boolean;
  lineWidth: number;
  symbolType: SymbolType;
  symbolSize: number;
  showArea: boolean;
  areaOpacity: number;
  /** For stacked charts */
  stack: string;
  /** Step line: 'start' | 'middle' | 'end' | '' (disabled) */
  step: string;
}

// ─── Axis ────────────────────────────────────────────────────────────────

export type AxisType = 'category' | 'value';

export interface ChartEditorAxis {
  type: AxisType;
  name: string;
  show: boolean;
  /** Only for value axis */
  min: string;
  /** Only for value axis */
  max: string;
  inverse: boolean;
  labelRotation: number;
  showSplitLine: boolean;
  /** Category data for x-axis */
  categories: string[];
}

// ─── Legend ──────────────────────────────────────────────────────────────

export type LegendPosition = 'top' | 'bottom' | 'left' | 'right';
export type LegendOrient = 'horizontal' | 'vertical';

export interface ChartEditorLegend {
  show: boolean;
  position: LegendPosition;
  orient: LegendOrient;
}

// ─── Tooltip ─────────────────────────────────────────────────────────────

export type TooltipTrigger = 'axis' | 'item';

export interface ChartEditorTooltip {
  show: boolean;
  trigger: TooltipTrigger;
}

// ─── Grid ────────────────────────────────────────────────────────────────

export interface ChartEditorGrid {
  top: number;
  right: number;
  bottom: number;
  left: number;
  containLabel: boolean;
}

// ─── Title ───────────────────────────────────────────────────────────────

export interface ChartEditorTitle {
  show: boolean;
  text: string;
  subtext: string;
}

// ─── Config ──────────────────────────────────────────────────────────────

export interface ChartEditorConfig {
  title: ChartEditorTitle;
  series: ChartEditorSeries[];
  xAxis: ChartEditorAxis;
  yAxis: ChartEditorAxis;
  legend: ChartEditorLegend;
  tooltip: ChartEditorTooltip;
  grid: ChartEditorGrid;
}

// ─── Preset ──────────────────────────────────────────────────────────────

export interface LineChartPreset {
  name: string;
  description: string;
  icon: string;
  config: Partial<ChartEditorConfig>;
}

// ─── Export ──────────────────────────────────────────────────────────────

export type ChartExportFormat = 'json' | 'typescript' | 'react-component';
