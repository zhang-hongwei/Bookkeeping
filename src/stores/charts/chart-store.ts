import { create } from 'zustand'
import { default as echarts } from 'echarts'
import { processColorValue } from '@/app/charts/utils/gradient-converter'

interface ChartState {
  option: echarts.EChartsOption
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar'
  setOption: (option: echarts.EChartsOption) => void
  updateChartType: (type: ChartState['chartType']) => void
  updateTitle: (title: string, subtitle?: string) => void
  updateSeriesData: (data: any[]) => void
  updateSeries: (index: number, config: Partial<any>) => void
  addSeries: (series: any) => void
  removeSeries: (index: number) => void
  updateXAxisData: (data: string[]) => void
  updateColors: (colors: string[]) => void
  updateLegend: (config: Partial<echarts.LegendComponentOption>) => void
  updateGrid: (config: Partial<echarts.GridComponentOption>) => void
  updateTooltip: (config: Partial<echarts.TooltipComponentOption>) => void
  updateXAxis: (config: Partial<echarts.XAXisComponentOption>) => void
  updateYAxis: (config: Partial<echarts.YAXisComponentOption>) => void
  updateAnimation: (enabled: boolean, duration?: number) => void
  exportConfig: () => string
  importConfig: (jsonString: string) => boolean
}

// 默认模板
const defaultTemplates: Record<ChartState['chartType'], echarts.EChartsOption> = {
  bar: {
    title: { text: '柱状图示例', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['销售额'], bottom: 10 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', data: ['一月', '二月', '三月', '四月', '五月', '六月'] },
    yAxis: { type: 'value' },
    series: [{
      name: '销售额',
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110],
      itemStyle: { borderRadius: [4, 4, 0, 0] }
    }],
    color: ['#5470c6']
  },
  line: {
    title: { text: '折线图示例', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['访问量'], bottom: 10 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value' },
    series: [{
      name: '访问量',
      type: 'line',
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      smooth: true,
      areaStyle: { opacity: 0.3 }
    }],
    color: ['#91cc75']
  },
  pie: {
    title: { text: '饼图示例', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left', data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎'] },
    series: [{
      name: '访问来源',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 335, name: '直接访问' },
        { value: 310, name: '邮件营销' },
        { value: 234, name: '联盟广告' },
        { value: 135, name: '视频广告' },
        { value: 1548, name: '搜索引擎' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }],
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
  },
  scatter: {
    title: { text: '散点图示例', left: 'center' },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (!params?.value || !Array.isArray(params.value)) return '';
        return `${params.value[0]}, ${params.value[1]}`;
      }
    },
    xAxis: { type: 'value', scale: true },
    yAxis: { type: 'value', scale: true },
    series: [{
      type: 'scatter',
      data: [
        [10.0, 8.04], [8.0, 6.95], [13.0, 7.58], [9.0, 8.81],
        [11.0, 8.33], [14.0, 9.96], [6.0, 7.24], [4.0, 4.26],
        [12.0, 10.84], [7.0, 4.82], [5.0, 5.68]
      ]
    }],
    color: ['#ee6666']
  },
  area: {
    title: { text: '面积图示例', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['邮件营销', '联盟广告'], bottom: 10 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
    yAxis: { type: 'value' },
    series: [
      {
        name: '邮件营销',
        type: 'line',
        stack: 'Total',
        data: [120, 132, 101, 134, 90, 230, 210],
        areaStyle: {}
      },
      {
        name: '联盟广告',
        type: 'line',
        stack: 'Total',
        data: [220, 182, 191, 234, 290, 330, 310],
        areaStyle: {}
      }
    ],
    color: ['#5470c6', '#91cc75']
  },
  radar: {
    title: { text: '雷达图示例', left: 'center' },
    tooltip: {},
    legend: { data: ['预算分配', '实际支出'], bottom: 10 },
    radar: {
      indicator: [
        { name: '销售', max: 6500 },
        { name: '管理', max: 16000 },
        { name: '信息技术', max: 30000 },
        { name: '客服', max: 38000 },
        { name: '研发', max: 52000 },
        { name: '市场', max: 25000 }
      ]
    },
    series: [{
      name: '预算 vs 支出',
      type: 'radar',
      data: [
        { value: [4200, 3000, 20000, 35000, 50000, 18000], name: '预算分配' },
        { value: [5000, 14000, 28000, 31000, 42000, 21000], name: '实际支出' }
      ]
    }],
    color: ['#5470c6', '#91cc75']
  }
}

export const useChartStore = create<ChartState>((set, get) => ({
  option: defaultTemplates.bar,
  chartType: 'bar',

  setOption: (option) => set({ option }),

  updateChartType: (type) => set((state) => {
    const currentTitle = (state.option.title && !Array.isArray(state.option.title) ? state.option.title.text : '') || ''
    const newTemplate = { ...defaultTemplates[type] }
    // 保持标题
    if (currentTitle && currentTitle !== '柱状图示例') {
      newTemplate.title = { ...newTemplate.title, text: currentTitle }
    }
    return { option: newTemplate, chartType: type }
  }),

  updateTitle: (title, subtitle) => set((state) => {
    const newOption = JSON.parse(JSON.stringify(state.option))
    newOption.title = {
      ...(state.option.title && !Array.isArray(state.option.title) ? state.option.title : {}),
      text: title,
      subtext: subtitle
    }
    return { option: newOption }
  }),

  updateSeriesData: (data) => set((state) => {
    const newOption = { ...state.option }
    if (newOption.series && Array.isArray(newOption.series)) {
      // 更新第一个系列的数据
      newOption.series[0] = { ...newOption.series[0], data }
    }
    return { option: newOption }
  }),

  updateSeries: (index, config) => set((state) => {
    const newOption = JSON.parse(JSON.stringify(state.option))
    if (newOption.series && Array.isArray(newOption.series) && newOption.series[index]) {
      // 处理渐变色转换
      const processedConfig = { ...config }

      // 转换 lineStyle.color（如果是 CSS 字符串）
      if (processedConfig.lineStyle?.color) {
        processedConfig.lineStyle.color = processColorValue(processedConfig.lineStyle.color)
      }

      // 转换 itemStyle.color（如果是 CSS 字符串）
      if (processedConfig.itemStyle?.color) {
        processedConfig.itemStyle.color = processColorValue(processedConfig.itemStyle.color)
      }

      // 转换 areaStyle.color（如果是 CSS 字符串）
      if (processedConfig.areaStyle?.color) {
        processedConfig.areaStyle.color = processColorValue(processedConfig.areaStyle.color)
      }

      // 注意：SmartColorPicker 现在直接提交 ECharts 对象，
      // processColorValue 会检测到对象并原样返回，不会重复转换

      newOption.series[index] = { ...newOption.series[index], ...processedConfig }
    }
    return { option: newOption }
  }),

  addSeries: (series) => set((state) => {
    const newOption = JSON.parse(JSON.stringify(state.option))
    if (!newOption.series) {
      newOption.series = []
    }
    if (Array.isArray(newOption.series)) {
      newOption.series.push(series)
    }
    return { option: newOption }
  }),

  removeSeries: (index) => set((state) => {
    const newOption = JSON.parse(JSON.stringify(state.option))
    if (newOption.series && Array.isArray(newOption.series)) {
      newOption.series.splice(index, 1)
    }
    return { option: newOption }
  }),

  updateXAxisData: (data) => set((state) => {
    const newOption = { ...state.option }
    if (newOption.xAxis && Array.isArray(newOption.xAxis)) {
      newOption.xAxis[0] = { ...newOption.xAxis[0], data }
    } else if (newOption.xAxis) {
      newOption.xAxis = { ...newOption.xAxis, data }
    }
    return { option: newOption }
  }),

  updateColors: (colors) => set((state) => {
    const newOption = JSON.parse(JSON.stringify(state.option))
    newOption.color = colors
    return { option: newOption }
  }),

  updateLegend: (config) => set((state) => {
    const newOption = JSON.parse(JSON.stringify(state.option))
    newOption.legend = Array.isArray(state.option.legend)
      ? state.option.legend
      : { ...(state.option.legend || {}), ...config }
    return { option: newOption }
  }),

  updateGrid: (config) => set((state) => {
    const newOption = JSON.parse(JSON.stringify(state.option))
    newOption.grid = Array.isArray(state.option.grid)
      ? state.option.grid
      : { ...(state.option.grid || {}), ...config }
    return { option: newOption }
  }),

  updateTooltip: (config) => set((state) => {
    const newOption = JSON.parse(JSON.stringify(state.option))
    newOption.tooltip = Array.isArray(state.option.tooltip)
      ? state.option.tooltip
      : { ...(state.option.tooltip || {}), ...config }
    return { option: newOption }
  }),

  updateXAxis: (config) => set((state) => {
    const newOption = { ...state.option }
    if (Array.isArray(newOption.xAxis)) {
      newOption.xAxis[0] = { ...newOption.xAxis[0], ...config }
    } else if (newOption.xAxis) {
      newOption.xAxis = { ...newOption.xAxis, ...config }
    }
    return { option: newOption }
  }),

  updateYAxis: (config) => set((state) => {
    const newOption = { ...state.option }
    if (Array.isArray(newOption.yAxis)) {
      newOption.yAxis[0] = { ...newOption.yAxis[0], ...config }
    } else if (newOption.yAxis) {
      newOption.yAxis = { ...newOption.yAxis, ...config }
    }
    return { option: newOption }
  }),

  updateAnimation: (enabled, duration) => set((state) => {
    const newOption = JSON.parse(JSON.stringify(state.option))
    newOption.animation = enabled
    if (duration !== undefined) {
      newOption.animationDuration = duration
    }
    return { option: newOption }
  }),

  exportConfig: () => {
    try {
      return JSON.stringify(get().option, null, 2)
    } catch (error) {
      console.error('Export config error:', error)
      return '{}'
    }
  },

  importConfig: (jsonString) => {
    try {
      const config = JSON.parse(jsonString)
      set({ option: config })
      return true
    } catch (error) {
      console.error('Import config error:', error)
      return false
    }
  }
}))