import { themeConfig } from '@/components/providers/ThemeProvider/themeConfig';

/**
 * ECharts default color palette
 * Colors are derived from the theme configuration for consistency
 */
export const ECHARTS_COLOR_PALETTE = [
  themeConfig.palette.primary.main, // #643DFF - Purple
  themeConfig.palette.info.main, // #00A6FF - Blue
  themeConfig.palette.success.main, // #29CCB0 - Green
  themeConfig.palette.warning.main, // #FC9532 - Orange
  themeConfig.palette.error.main, // #EC3131 - Red
  themeConfig.palette.secondary.main, // #8E33FF - Secondary Purple
  // Light variants for additional series
  themeConfig.palette.primary.light, // #C684FF
  themeConfig.palette.info.light, // #61F3F3
  themeConfig.palette.success.light, // #77ED8B
  themeConfig.palette.warning.light, // #FFD666
  themeConfig.palette.error.light, // #FFAC82
  themeConfig.palette.secondary.light, // #C684FF
  // Dark variants for even more variety
  themeConfig.palette.primary.dark, // #5119B7
  themeConfig.palette.info.dark, // #006C9C
  themeConfig.palette.success.dark, // #118D57
  themeConfig.palette.warning.dark, // #B76E00
  themeConfig.palette.error.dark, // #B71D18
  themeConfig.palette.secondary.dark, // #5119B7
];





/**
 * Custom ECharts theme object
 * This theme will be registered with echarts.registerTheme()
 */
export const ECHARTS_CUSTOM_THEME = {
  color: ECHARTS_COLOR_PALETTE,
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: themeConfig.fontFamily.primary,
  },
  title: {
    textStyle: {
      color: themeConfig.palette.grey['800'],
      fontWeight: 'bold' as const,
    },
    subtextStyle: {
      color: themeConfig.palette.grey['600'],
    },
  },
  line: {
    itemStyle: {
      borderWidth: 1,
    },
    lineStyle: {
      width: 2,
    },
    symbolSize: 4,
    symbol: 'circle',
    smooth: false,
  },
  radar: {
    itemStyle: {
      borderWidth: 1,
    },
    lineStyle: {
      width: 2,
    },
    symbolSize: 4,
    symbol: 'circle',
    smooth: false,
  },
  bar: {
    itemStyle: {
      barBorderWidth: 0,
      barBorderColor: themeConfig.palette.grey['400'],
    },
  },
  pie: {
    itemStyle: {
      borderWidth: 0,
      borderColor: themeConfig.palette.grey['400'],
    },
  },
  scatter: {
    itemStyle: {
      borderWidth: 0,
      borderColor: themeConfig.palette.grey['400'],
    },
  },
  boxplot: {
    itemStyle: {
      borderWidth: 0,
      borderColor: themeConfig.palette.grey['400'],
    },
  },
  parallel: {
    itemStyle: {
      borderWidth: 0,
      borderColor: themeConfig.palette.grey['400'],
    },
  },
  sankey: {
    itemStyle: {
      borderWidth: 0,
      borderColor: themeConfig.palette.grey['400'],
    },
  },
  funnel: {
    itemStyle: {
      borderWidth: 0,
      borderColor: themeConfig.palette.grey['400'],
    },
  },
  gauge: {
    itemStyle: {
      borderWidth: 0,
      borderColor: themeConfig.palette.grey['400'],
    },
  },
  candlestick: {
    itemStyle: {
      color: themeConfig.palette.success.main,
      color0: themeConfig.palette.error.main,
      borderColor: themeConfig.palette.success.dark,
      borderColor0: themeConfig.palette.error.dark,
      borderWidth: 1,
    },
  },
  graph: {
    itemStyle: {
      borderWidth: 0,
      borderColor: themeConfig.palette.grey['400'],
    },
    lineStyle: {
      width: 1,
      color: themeConfig.palette.grey['400'],
    },
    symbolSize: 4,
    symbol: 'circle',
    smooth: false,
    color: ECHARTS_COLOR_PALETTE,
    label: {
      color: themeConfig.palette.grey['100'],
    },
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: themeConfig.palette.grey['300'],
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: themeConfig.palette.grey['300'],
      },
    },
    axisLabel: {
      show: true,
      color: themeConfig.palette.grey['600'],
    },
    splitLine: {
      show: false,
      lineStyle: {
        color: [themeConfig.palette.grey['200']],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: [themeConfig.palette.grey['100']],
      },
    },
  },
  valueAxis: {
    axisLine: {
      show: false,
      lineStyle: {
        color: themeConfig.palette.grey['300'],
      },
    },
    axisTick: {
      show: false,
      lineStyle: {
        color: themeConfig.palette.grey['300'],
      },
    },
    axisLabel: {
      show: true,
      color: themeConfig.palette.grey['600'],
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: [themeConfig.palette.grey['200']],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: [themeConfig.palette.grey['100']],
      },
    },
  },
  logAxis: {
    axisLine: {
      show: false,
      lineStyle: {
        color: themeConfig.palette.grey['300'],
      },
    },
    axisTick: {
      show: false,
      lineStyle: {
        color: themeConfig.palette.grey['300'],
      },
    },
    axisLabel: {
      show: true,
      color: themeConfig.palette.grey['600'],
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: [themeConfig.palette.grey['200']],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: [themeConfig.palette.grey['100']],
      },
    },
  },
  timeAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: themeConfig.palette.grey['300'],
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: themeConfig.palette.grey['300'],
      },
    },
    axisLabel: {
      show: true,
      color: themeConfig.palette.grey['600'],
    },
    splitLine: {
      show: false,
      lineStyle: {
        color: [themeConfig.palette.grey['200']],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: [themeConfig.palette.grey['100']],
      },
    },
  },
  toolbox: {
    iconStyle: {
      borderColor: themeConfig.palette.grey['600'],
    },
    emphasis: {
      iconStyle: {
        borderColor: themeConfig.palette.grey['800'],
      },
    },
  },
  legend: {
    textStyle: {
      color: themeConfig.palette.grey['800'],
    },
  },
  tooltip: {
    axisPointer: {
      lineStyle: {
        color: themeConfig.palette.grey['300'],
        width: 1,
      },
      crossStyle: {
        color: themeConfig.palette.grey['300'],
        width: 1,
      },
    },
  },
  timeline: {
    lineStyle: {
      color: themeConfig.palette.grey['300'],
      width: 1,
    },
    itemStyle: {
      color: themeConfig.palette.primary.main,
      borderWidth: 1,
    },
    controlStyle: {
      color: themeConfig.palette.grey['600'],
      borderColor: themeConfig.palette.grey['600'],
      borderWidth: 0.5,
    },
    checkpointStyle: {
      color: themeConfig.palette.primary.main,
      borderColor: themeConfig.palette.primary.light,
    },
    label: {
      color: themeConfig.palette.grey['600'],
    },
    emphasis: {
      itemStyle: {
        color: themeConfig.palette.primary.dark,
      },
      controlStyle: {
        color: themeConfig.palette.grey['600'],
        borderColor: themeConfig.palette.grey['600'],
        borderWidth: 0.5,
      },
      label: {
        color: themeConfig.palette.grey['600'],
      },
    },
  },
  visualMap: {
    textStyle: {
      color: themeConfig.palette.grey['800'],
    },
  },
  dataZoom: {
    backgroundColor: 'rgba(0,0,0,0)',
    dataBackgroundColor: themeConfig.palette.grey['200'],
    fillerColor: 'rgba(0,0,0,0.2)',
    handleColor: themeConfig.palette.grey['600'],
    handleSize: '100%',
    textStyle: {
      color: themeConfig.palette.grey['800'],
    },
  },
  markPoint: {
    label: {
      color: themeConfig.palette.grey['100'],
    },
    emphasis: {
      label: {
        color: themeConfig.palette.grey['100'],
      },
    },
  },
};

/**
 * Theme name constant
 */
export const ECHARTS_THEME_NAME = 'customTheme';

/**
 * Common ECharts grid configuration
 */
export const ECHARTS_GRID_CONFIG = {
  left: '3%',
  right: '4%',
  bottom: '3%',
  top: '3%',
  containLabel: true,
};

/**
 * Common ECharts axis configuration
 */
export const ECHARTS_AXIS_CONFIG = {
  axisLine: {
    lineStyle: {
      color: themeConfig.palette.grey['300'],
    },
  },
  axisLabel: {
    color: themeConfig.palette.grey['600'],
    fontSize: 11,
  },
  splitLine: {
    lineStyle: {
      color: themeConfig.palette.grey['200'],
    },
  },
};

/**
 * Base ECharts configuration
 * Can be merged with specific chart options
 */
export const ECHARTS_BASE_CONFIG = {
  color: ECHARTS_COLOR_PALETTE,
  backgroundColor: 'transparent',
  grid: ECHARTS_GRID_CONFIG,
  textStyle: {
    fontFamily: themeConfig.fontFamily.primary,
  },
};

/**
 * Tooltip configuration
 */
export const ECHARTS_TOOLTIP_CONFIG = {
  trigger: 'axis' as const,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderColor: 'transparent',
  textStyle: {
    color: '#fff',
    fontSize: 12,
  },
  axisPointer: {
    type: 'shadow' as const,
  },
};
