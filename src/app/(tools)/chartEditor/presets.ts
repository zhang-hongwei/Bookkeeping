/**
 * Line Chart Presets
 */

import type { LineChartPreset } from './types';
import { createDefaultSeries } from './utils';

export const LINE_CHART_PRESETS: LineChartPreset[] = [
  {
    name: 'Basic Line',
    description: 'Simple single-series line chart',
    icon: '📈',
    config: {
      title: { show: true, text: 'Basic Line Chart', subtext: '' },
      series: [createDefaultSeries(0)],
      xAxis: {
        type: 'category', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: false,
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yAxis: {
        type: 'value', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: true, categories: [],
      },
      legend: { show: false, position: 'top', orient: 'horizontal' },
      tooltip: { show: true, trigger: 'axis' },
      grid: { top: 60, right: 30, bottom: 40, left: 50, containLabel: true },
    },
  },
  {
    name: 'Smooth Line',
    description: 'Smooth curved line chart',
    icon: '🌊',
    config: {
      title: { show: true, text: 'Smooth Line Chart', subtext: '' },
      series: [{ ...createDefaultSeries(0), smooth: true, symbolType: 'none' as const, lineWidth: 3 }],
      xAxis: {
        type: 'category', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: false,
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yAxis: {
        type: 'value', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: true, categories: [],
      },
      legend: { show: false, position: 'top', orient: 'horizontal' },
      tooltip: { show: true, trigger: 'axis' },
      grid: { top: 60, right: 30, bottom: 40, left: 50, containLabel: true },
    },
  },
  {
    name: 'Multi-Series',
    description: 'Multiple series with legend',
    icon: '📊',
    config: {
      title: { show: true, text: 'Multi-Series Chart', subtext: 'Revenue comparison' },
      series: [
        createDefaultSeries(0),
        createDefaultSeries(1),
        createDefaultSeries(2),
      ],
      xAxis: {
        type: 'category', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: false,
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yAxis: {
        type: 'value', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: true, categories: [],
      },
      legend: { show: true, position: 'top', orient: 'horizontal' },
      tooltip: { show: true, trigger: 'axis' },
      grid: { top: 60, right: 30, bottom: 40, left: 50, containLabel: true },
    },
  },
  {
    name: 'Area Chart',
    description: 'Line chart with gradient area fill',
    icon: '🏔️',
    config: {
      title: { show: true, text: 'Area Chart', subtext: '' },
      series: [{
        ...createDefaultSeries(0),
        showArea: true,
        areaOpacity: 0.4,
        smooth: true,
        symbolType: 'none' as const,
        lineWidth: 2,
      }],
      xAxis: {
        type: 'category', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: false,
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yAxis: {
        type: 'value', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: true, categories: [],
      },
      legend: { show: false, position: 'top', orient: 'horizontal' },
      tooltip: { show: true, trigger: 'axis' },
      grid: { top: 60, right: 30, bottom: 40, left: 50, containLabel: true },
    },
  },
  {
    name: 'Stacked Area',
    description: 'Stacked area chart with multiple series',
    icon: '📚',
    config: {
      title: { show: true, text: 'Stacked Area Chart', subtext: '' },
      series: [
        { ...createDefaultSeries(0), showArea: true, areaOpacity: 0.5, stack: 'total', smooth: true, symbolType: 'none' as const },
        { ...createDefaultSeries(1), showArea: true, areaOpacity: 0.5, stack: 'total', smooth: true, symbolType: 'none' as const },
        { ...createDefaultSeries(2), showArea: true, areaOpacity: 0.5, stack: 'total', smooth: true, symbolType: 'none' as const },
      ],
      xAxis: {
        type: 'category', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: false,
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yAxis: {
        type: 'value', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: true, categories: [],
      },
      legend: { show: true, position: 'top', orient: 'horizontal' },
      tooltip: { show: true, trigger: 'axis' },
      grid: { top: 60, right: 30, bottom: 40, left: 50, containLabel: true },
    },
  },
  {
    name: 'Step Line',
    description: 'Step-style line chart',
    icon: '🪜',
    config: {
      title: { show: true, text: 'Step Line Chart', subtext: '' },
      series: [{ ...createDefaultSeries(0), step: 'middle' }],
      xAxis: {
        type: 'category', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: false,
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yAxis: {
        type: 'value', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: true, categories: [],
      },
      legend: { show: false, position: 'top', orient: 'horizontal' },
      tooltip: { show: true, trigger: 'axis' },
      grid: { top: 60, right: 30, bottom: 40, left: 50, containLabel: true },
    },
  },
  {
    name: 'Dashboard Metric',
    description: 'Compact metric chart for dashboards',
    icon: '📊',
    config: {
      title: { show: true, text: 'Weekly Revenue', subtext: 'Updated just now' },
      series: [{
        ...createDefaultSeries(0),
        smooth: true,
        symbolType: 'none' as const,
        lineWidth: 3,
        showArea: true,
        areaOpacity: 0.2,
        data: [120, 200, 150, 350, 280, 420, 390],
      }],
      xAxis: {
        type: 'category', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: false,
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yAxis: {
        type: 'value', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: false, categories: [],
      },
      legend: { show: false, position: 'top', orient: 'horizontal' },
      tooltip: { show: true, trigger: 'axis' },
      grid: { top: 50, right: 20, bottom: 30, left: 40, containLabel: true },
    },
  },
  {
    name: 'Thick Colored Line',
    description: 'Bold colored line with large symbols',
    icon: '🎨',
    config: {
      title: { show: true, text: 'Thick Line Chart', subtext: '' },
      series: [{
        ...createDefaultSeries(0),
        lineWidth: 4,
        symbolSize: 8,
        symbolType: 'circle' as const,
        color: '#ee6666',
        data: [320, 450, 380, 520, 410, 580, 490],
      }],
      xAxis: {
        type: 'category', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: false,
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yAxis: {
        type: 'value', name: '', show: true, min: '', max: '',
        inverse: false, labelRotation: 0, showSplitLine: true, categories: [],
      },
      legend: { show: false, position: 'top', orient: 'horizontal' },
      tooltip: { show: true, trigger: 'axis' },
      grid: { top: 60, right: 30, bottom: 40, left: 50, containLabel: true },
    },
  },
];

export function getPresetByName(name: string): LineChartPreset | undefined {
  return LINE_CHART_PRESETS.find((p) => p.name === name);
}
