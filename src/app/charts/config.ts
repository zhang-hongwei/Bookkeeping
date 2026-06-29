// Chart type configuration
export const chartTypes = [
  { value: "bar", label: "Bar Chart", icon: "📊" },
  { value: "line", label: "Line Chart", icon: "📈" },
  { value: "pie", label: "Pie Chart", icon: "🥧" },
  { value: "scatter", label: "Scatter Plot", icon: "⚡" },
  { value: "area", label: "Area Chart", icon: "📉" },
  { value: "radar", label: "Radar Chart", icon: "🎯" },
] as const;

// Color scheme configuration
export const colorSchemes = [
  {
    name: "Default",
    colors: [
      "#5470c6",
      "#91cc75",
      "#fac858",
      "#ee6666",
      "#73c0de",
      "#3ba272",
      "#fc8452",
      "#9a60b4",
      "#ea7ccc",
    ],
  },
  {
    name: "Blue",
    colors: [
      "#5470c6",
      "#2f7ed8",
      "#0d233a",
      "#1aadce",
      "#492970",
      "#8bbc8f",
      "#2f7ed8",
      "#0d233a",
    ],
  },
  {
    name: "Warm",
    colors: [
      "#f45b5b",
      "#8085e9",
      "#8d4654",
      "#7798bf",
      "#aaeeee",
      "#ff0066",
      "#eeaaee",
      "#55bf3b",
    ],
  },
  {
    name: "Green",
    colors: [
      "#91cc75",
      "#3ba272",
      "#61a0a8",
      "#d48265",
      "#c4ccd3",
      "#749f83",
      "#ca8622",
      "#bda29a",
    ],
  },
] as const;

export type ChartType = typeof chartTypes[number]["value"];
export type ColorScheme = typeof colorSchemes[number];