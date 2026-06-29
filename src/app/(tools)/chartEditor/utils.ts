/**
 * Chart Editor Utilities
 * Build ECharts option from editor config and generate export code
 */

import type * as echarts from 'echarts';
import type {
  ChartEditorConfig,
  ChartEditorSeries,
  ChartExportFormat,
} from './types';

let _idCounter = 0;

export function generateId(): string {
  _idCounter += 1;
  return `series-${_idCounter}`;
}

const PALETTE = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'];

export function createDefaultSeries(index: number): ChartEditorSeries {
  const sampleDataMap: Record<number, number[]> = {
    0: [820, 932, 901, 934, 1290, 1330, 1320],
    1: [620, 732, 710, 834, 1100, 1130, 1120],
    2: [420, 532, 601, 634, 800, 930, 920],
    3: [320, 432, 501, 534, 700, 830, 820],
  };

  return {
    id: generateId(),
    name: `Series ${index + 1}`,
    data: sampleDataMap[index] ?? Array.from({ length: 7 }, () => Math.round(Math.random() * 1000)),
    color: PALETTE[index % PALETTE.length],
    smooth: false,
    lineWidth: 2,
    symbolType: 'circle',
    symbolSize: 4,
    showArea: false,
    areaOpacity: 0.3,
    stack: '',
    step: '',
  };
}

export function createDefaultConfig(): ChartEditorConfig {
  return {
    title: { show: true, text: 'Line Chart', subtext: '' },
    series: [createDefaultSeries(0)],
    xAxis: {
      type: 'category',
      name: '',
      show: true,
      min: '',
      max: '',
      inverse: false,
      labelRotation: 0,
      showSplitLine: false,
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
      name: '',
      show: true,
      min: '',
      max: '',
      inverse: false,
      labelRotation: 0,
      showSplitLine: true,
      categories: [],
    },
    legend: { show: true, position: 'top', orient: 'horizontal' },
    tooltip: { show: true, trigger: 'axis' },
    grid: { top: 60, right: 30, bottom: 40, left: 50, containLabel: true },
  };
}

function buildSeriesItem(s: ChartEditorSeries): Record<string, unknown> {
  const item: Record<string, unknown> = {
    type: 'line',
    name: s.name,
    data: s.data,
    smooth: s.smooth,
    lineStyle: { width: s.lineWidth },
    symbol: s.symbolType === 'none' ? 'none' : s.symbolType,
    symbolSize: s.symbolSize,
  };

  if (s.color) {
    item.lineStyle = { ...(item.lineStyle as object), color: s.color };
    item.itemStyle = { color: s.color };
  }

  if (s.showArea) {
    item.areaStyle = { opacity: s.areaOpacity };
  }

  if (s.stack) {
    item.stack = s.stack;
  }

  if (s.step) {
    item.step = s.step;
  }

  return item;
}

const LEGEND_POSITION_MAP: Record<string, { left: string; top: string; right: string; bottom: string }> = {
  top: { left: 'center', top: 'top', right: '', bottom: '' },
  bottom: { left: 'center', top: '', right: '', bottom: 'bottom' },
  left: { left: 'left', top: 'middle', right: '', bottom: '' },
  right: { left: '', top: 'middle', right: 'right', bottom: '' },
};

export function buildEChartsOption(config: ChartEditorConfig): echarts.EChartsOption {
  const option: Record<string, unknown> = {};

  // Title
  if (config.title.show) {
    option.title = {
      text: config.title.text,
      subtext: config.title.subtext || undefined,
    };
  }

  // Tooltip
  if (config.tooltip.show) {
    option.tooltip = { trigger: config.tooltip.trigger };
  }

  // Legend
  if (config.legend.show) {
    const pos = LEGEND_POSITION_MAP[config.legend.position];
    option.legend = {
      orient: config.legend.orient,
      ...(pos.left ? { left: pos.left } : {}),
      ...(pos.top ? { top: pos.top } : {}),
      ...(pos.right ? { right: pos.right } : {}),
      ...(pos.bottom ? { bottom: pos.bottom } : {}),
    };
  }

  // Grid
  option.grid = {
    top: config.grid.top,
    right: config.grid.right,
    bottom: config.grid.bottom,
    left: config.grid.left,
    containLabel: config.grid.containLabel,
  };

  // X Axis
  const xAxis: Record<string, unknown> = {
    type: config.xAxis.type,
    show: config.xAxis.show,
    inverse: config.xAxis.inverse,
    axisLabel: { rotate: config.xAxis.labelRotation },
    splitLine: { show: config.xAxis.showSplitLine },
  };
  if (config.xAxis.name) xAxis.name = config.xAxis.name;
  if (config.xAxis.type === 'category' && config.xAxis.categories.length > 0) {
    xAxis.data = config.xAxis.categories;
  }
  if (config.xAxis.min) xAxis.min = Number(config.xAxis.min) || config.xAxis.min;
  if (config.xAxis.max) xAxis.max = Number(config.xAxis.max) || config.xAxis.max;

  // Y Axis
  const yAxis: Record<string, unknown> = {
    type: config.yAxis.type,
    show: config.yAxis.show,
    inverse: config.yAxis.inverse,
    axisLabel: { rotate: config.yAxis.labelRotation },
    splitLine: { show: config.yAxis.showSplitLine },
  };
  if (config.yAxis.name) yAxis.name = config.yAxis.name;
  if (config.yAxis.type === 'category' && config.yAxis.categories.length > 0) {
    yAxis.data = config.yAxis.categories;
  }
  if (config.yAxis.min) yAxis.min = Number(config.yAxis.min) || config.yAxis.min;
  if (config.yAxis.max) yAxis.max = Number(config.yAxis.max) || config.yAxis.max;

  option.xAxis = xAxis;
  option.yAxis = yAxis;

  // Series
  option.series = config.series.map(buildSeriesItem);

  // Use palette for series without explicit color
  const colors = config.series.map((s) => s.color || null);
  if (colors.some((c) => c)) {
    option.color = config.series.map((s) => s.color || undefined);
  }

  return option as echarts.EChartsOption;
}

export function generateExportCode(config: ChartEditorConfig, format: ChartExportFormat): string {
  const option = buildEChartsOption(config);

  switch (format) {
    case 'json':
      return JSON.stringify(option, null, 2);

    case 'typescript':
      return `import type { EChartsOption } from 'echarts';\n\nconst option: EChartsOption = ${JSON.stringify(option, null, 2)} as EChartsOption;\n\nexport default option;`;

    case 'react-component':
      return `import { Charts } from '@/components/ui/Charts';\nimport type { EChartsOption } from 'echarts';\n\nconst option: EChartsOption = ${JSON.stringify(option, null, 2)} as EChartsOption;\n\nexport default function MyChart() {\n  return <Charts option={option} height={400} />;\n}`;

    default:
      return JSON.stringify(option, null, 2);
  }
}
