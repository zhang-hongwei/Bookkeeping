/**
 * Grid Pattern Generator - Presets Library
 * 预设库 - 精心设计的风格化背景预设
 */

import type { PatternPreset, GridPatternConfig } from "./types";

/**
 * 预设分类
 */
export type PresetCategory =
  | "minimal"     // 极简风格
  | "cyberpunk"   // 赛博朋克
  | "nature"      // 自然风格
  | "geometric"   // 几何风格
  | "gradient"    // 渐变风格
  | "retro"       // 复古风格
  | "glass";      // 玻璃拟态

/**
 * 预设库
 */
export const PATTERN_PRESETS: PatternPreset[] = [
  // ============================================================================
  // MINIMAL - 极简风格
  // ============================================================================
  {
    id: "apple-style",
    name: "Apple Style",
    description: "苹果官网风格的简洁网格",
    category: "minimal",
    config: {
      background: "#ffffff",
      layers: [
        {
          id: "layer-1",
          name: "主网格",
          visible: true,
          type: "linear",
          shapes: [],
          color: "#e5e5e5",
          colorStops: [{ offset: 0, color: "#e5e5e5" }],
          useGradient: false,
          size: 40,
          spacing: 0,
          strokeWidth: 1,
          opacity: 0.5,
          angle: 90,
          blendMode: "normal",
          animation: "none",
          animationDuration: 3,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },
  {
    id: "clean-dots",
    name: "Clean Dots",
    description: "简洁的点阵图案",
    category: "minimal",
    config: {
      background: "#fafafa",
      layers: [
        {
          id: "layer-1",
          name: "点阵",
          visible: true,
          type: "dots",
          shapes: [],
          color: "#d1d5db",
          colorStops: [{ offset: 0, color: "#d1d5db" }],
          useGradient: false,
          size: 20,
          spacing: 8,
          strokeWidth: 2,
          opacity: 0.6,
          angle: 0,
          blendMode: "normal",
          animation: "none",
          animationDuration: 3,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },
  {
    id: "subtle-grid",
    name: "Subtle Grid",
    description: "微妙的背景网格",
    category: "minimal",
    config: {
      background: "#f8fafc",
      layers: [
        {
          id: "layer-1",
          name: "细网格",
          visible: true,
          type: "linear",
          shapes: [],
          color: "#cbd5e1",
          colorStops: [{ offset: 0, color: "#cbd5e1" }],
          useGradient: false,
          size: 24,
          spacing: 0,
          strokeWidth: 0.5,
          opacity: 0.4,
          angle: 90,
          blendMode: "normal",
          animation: "none",
          animationDuration: 3,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },

  // ============================================================================
  // CYBERPUNK - 赛博朋克
  // ============================================================================
  {
    id: "neon-mesh",
    name: "Neon Mesh",
    description: "霓虹网格风格",
    category: "cyberpunk",
    config: {
      background: "#0a0a0f",
      layers: [
        {
          id: "layer-1",
          name: "品红网格",
          visible: true,
          type: "linear",
          shapes: [],
          color: "#ff00ff",
          colorStops: [{ offset: 0, color: "#ff00ff" }],
          useGradient: false,
          size: 50,
          spacing: 0,
          strokeWidth: 2,
          opacity: 0.4,
          angle: 45,
          blendMode: "screen",
          animation: "none",
          animationDuration: 3,
          offsetX: 0,
          offsetY: 0,
        },
        {
          id: "layer-2",
          name: "青色网格",
          visible: true,
          type: "linear",
          shapes: [],
          color: "#00ffff",
          colorStops: [{ offset: 0, color: "#00ffff" }],
          useGradient: false,
          size: 50,
          spacing: 0,
          strokeWidth: 2,
          opacity: 0.4,
          angle: 135,
          blendMode: "screen",
          animation: "pulse",
          animationDuration: 4,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },
  {
    id: "glitch-grid",
    name: "Glitch Grid",
    description: "故障艺术网格",
    category: "cyberpunk",
    config: {
      background: "#1a1a2e",
      layers: [
        {
          id: "layer-1",
          name: "主网格",
          visible: true,
          type: "checkerboard",
          shapes: [],
          color: "#00ff00",
          colorStops: [{ offset: 0, color: "#00ff00" }],
          useGradient: false,
          size: 8,
          spacing: 2,
          strokeWidth: 1,
          opacity: 0.3,
          angle: 0,
          blendMode: "normal",
          animation: "pulse",
          animationDuration: 2,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },
  {
    id: "matrix-rain",
    name: "Matrix Rain",
    description: "矩阵数字雨风格",
    category: "cyberpunk",
    config: {
      background: "#000000",
      layers: [
        {
          id: "layer-1",
          name: "绿色代码流",
          visible: true,
          type: "linear",
          shapes: [],
          color: "#00ff00",
          colorStops: [{ offset: 0, color: "#00ff00" }],
          useGradient: false,
          size: 20,
          spacing: 15,
          strokeWidth: 2,
          opacity: 0.6,
          angle: 90,
          blendMode: "normal",
          animation: "scroll",
          animationDuration: 5,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },

  // ============================================================================
  // NATURE - 自然风格
  // ============================================================================
  {
    id: "wave-gradient",
    name: "Wave Gradient",
    description: "波浪渐变效果",
    category: "nature",
    config: {
      background: "#f0f9ff",
      layers: [
        {
          id: "layer-1",
          name: "蓝色波浪",
          visible: true,
          type: "wave",
          shapes: [],
          color: "#0ea5e9",
          colorStops: [
            { offset: 0, color: "#0ea5e9" },
            { offset: 100, color: "#38bdf8" },
          ],
          useGradient: true,
          size: 60,
          spacing: 0,
          strokeWidth: 3,
          opacity: 0.4,
          angle: 0,
          blendMode: "multiply",
          animation: "none",
          animationDuration: 3,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },
  {
    id: "organic-flow",
    name: "Organic Flow",
    description: "有机流动图案",
    category: "nature",
    config: {
      background: "#fdf4ff",
      layers: [
        {
          id: "layer-1",
          name: "流动线条",
          visible: true,
          type: "custom",
          shapes: [
            {
              id: "shape-1",
              type: "ellipse",
              params: { x: 30, y: 30, radiusX: 25, radiusY: 8 },
              fill: "transparent",
              stroke: "#d946ef",
              strokeWidth: 2,
              opacity: 0.5,
            },
          ],
          color: "#d946ef",
          colorStops: [{ offset: 0, color: "#d946ef" }],
          useGradient: false,
          size: 60,
          spacing: 10,
          strokeWidth: 1,
          opacity: 1,
          angle: 0,
          blendMode: "multiply",
          animation: "none",
          animationDuration: 3,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },

  // ============================================================================
  // GEOMETRIC - 几何风格
  // ============================================================================
  {
    id: "isometric",
    name: "Isometric",
    description: "等距立方体网格",
    category: "geometric",
    config: {
      background: "#1e293b",
      layers: [
        {
          id: "layer-1",
          name: "等距图案",
          visible: true,
          type: "isometric",
          shapes: [],
          color: "#64748b",
          colorStops: [{ offset: 0, color: "#64748b" }],
          useGradient: false,
          size: 40,
          spacing: 4,
          strokeWidth: 2,
          opacity: 0.5,
          angle: 0,
          blendMode: "normal",
          animation: "none",
          animationDuration: 3,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },
  {
    id: "hex-tiles",
    name: "Hex Tiles",
    description: "六边形瓷砖图案",
    category: "geometric",
    config: {
      background: "#fef3c7",
      layers: [
        {
          id: "layer-1",
          name: "六边形网格",
          visible: true,
          type: "hexagon",
          shapes: [],
          color: "#f59e0b",
          colorStops: [{ offset: 0, color: "#f59e0b" }],
          useGradient: false,
          size: 30,
          spacing: 2,
          strokeWidth: 2,
          opacity: 0.4,
          angle: 0,
          blendMode: "multiply",
          animation: "none",
          animationDuration: 3,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },
  {
    id: "diamond-field",
    name: "Diamond Field",
    description: "菱形田野图案",
    category: "geometric",
    config: {
      background: "#ecfdf5",
      layers: [
        {
          id: "layer-1",
          name: "菱形网格",
          visible: true,
          type: "diamond",
          shapes: [],
          color: "#10b981",
          colorStops: [{ offset: 0, color: "#10b981" }],
          useGradient: false,
          size: 24,
          spacing: 4,
          strokeWidth: 1,
          opacity: 0.3,
          angle: 0,
          blendMode: "multiply",
          animation: "none",
          animationDuration: 3,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },

  // ============================================================================
  // GRADIENT - 渐变风格
  // ============================================================================
  {
    id: "aurora",
    name: "Aurora",
    description: "极光渐变网格",
    category: "gradient",
    config: {
      background: "#0f172a",
      layers: [
        {
          id: "layer-1",
          name: "紫色层",
          visible: true,
          type: "linear",
          shapes: [],
          color: "#8b5cf6",
          colorStops: [
            { offset: 0, color: "#8b5cf6" },
            { offset: 100, color: "#a78bfa" },
          ],
          useGradient: true,
          size: 80,
          spacing: 0,
          strokeWidth: 4,
          opacity: 0.4,
          angle: 45,
          blendMode: "screen",
          animation: "pulse",
          animationDuration: 6,
          offsetX: 0,
          offsetY: 0,
        },
        {
          id: "layer-2",
          name: "青色层",
          visible: true,
          type: "linear",
          shapes: [],
          color: "#06b6d4",
          colorStops: [
            { offset: 0, color: "#06b6d4" },
            { offset: 100, color: "#22d3ee" },
          ],
          useGradient: true,
          size: 80,
          spacing: 0,
          strokeWidth: 4,
          opacity: 0.3,
          angle: 135,
          blendMode: "screen",
          animation: "pulse",
          animationDuration: 8,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },
  {
    id: "sunset-mesh",
    name: "Sunset Mesh",
    description: "日落渐变网格",
    category: "gradient",
    config: {
      background: "#fff7ed",
      layers: [
        {
          id: "layer-1",
          name: "橙色网格",
          visible: true,
          type: "crosshatch",
          shapes: [],
          color: "#f97316",
          colorStops: [
            { offset: 0, color: "#f97316" },
            { offset: 50, color: "#fb923c" },
            { offset: 100, color: "#fdba74" },
          ],
          useGradient: true,
          size: 40,
          spacing: 8,
          strokeWidth: 2,
          opacity: 0.35,
          angle: 0,
          blendMode: "multiply",
          animation: "none",
          animationDuration: 3,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },

  // ============================================================================
  // RETRO - 复古风格
  // ============================================================================
  {
    id: "retro-wave",
    name: "Retro Wave",
    description: "复古波浪风格",
    category: "retro",
    config: {
      background: "#1a1a2e",
      layers: [
        {
          id: "layer-1",
          name: "品红网格",
          visible: true,
          type: "linear",
          shapes: [],
          color: "#ff006e",
          colorStops: [{ offset: 0, color: "#ff006e" }],
          useGradient: false,
          size: 30,
          spacing: 0,
          strokeWidth: 2,
          opacity: 0.5,
          angle: 90,
          blendMode: "normal",
          animation: "none",
          animationDuration: 3,
          offsetX: 0,
          offsetY: 0,
        },
        {
          id: "layer-2",
          name: "黄色网格",
          visible: true,
          type: "linear",
          shapes: [],
          color: "#ffbe0b",
          colorStops: [{ offset: 0, color: "#ffbe0b" }],
          useGradient: false,
          size: 30,
          spacing: 0,
          strokeWidth: 2,
          opacity: 0.4,
          angle: 0,
          blendMode: "screen",
          animation: "none",
          animationDuration: 3,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },
  {
    id: "pixel-grid",
    name: "Pixel Grid",
    description: "像素网格风格",
    category: "retro",
    config: {
      background: "#2d2d2d",
      layers: [
        {
          id: "layer-1",
          name: "像素点",
          visible: true,
          type: "dots",
          shapes: [],
          color: "#00ff00",
          colorStops: [{ offset: 0, color: "#00ff00" }],
          useGradient: false,
          size: 8,
          spacing: 4,
          strokeWidth: 4,
          opacity: 0.7,
          angle: 0,
          blendMode: "normal",
          animation: "none",
          animationDuration: 3,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },

  // ============================================================================
  // GLASS - 玻璃拟态
  // ============================================================================
  {
    id: "glass-morphism",
    name: "Glass Morphism",
    description: "玻璃拟态背景",
    category: "glass",
    config: {
      background: "#e0e5ec",
      layers: [
        {
          id: "layer-1",
          name: "微妙网格",
          visible: true,
          type: "dots",
          shapes: [],
          color: "#ffffff",
          colorStops: [{ offset: 0, color: "#ffffff" }],
          useGradient: false,
          size: 4,
          spacing: 20,
          strokeWidth: 1,
          opacity: 0.5,
          angle: 0,
          blendMode: "normal",
          animation: "none",
          animationDuration: 3,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },
  {
    id: "frosted-pattern",
    name: "Frosted Pattern",
    description: "磨砂玻璃图案",
    category: "glass",
    config: {
      background: "#f1f5f9",
      layers: [
        {
          id: "layer-1",
          name: "磨砂纹理",
          visible: true,
          type: "crosshatch",
          shapes: [],
          color: "#94a3b8",
          colorStops: [{ offset: 0, color: "#94a3b8" }],
          useGradient: false,
          size: 10,
          spacing: 2,
          strokeWidth: 0.5,
          opacity: 0.2,
          angle: 45,
          blendMode: "multiply",
          animation: "none",
          animationDuration: 3,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  },
];

/**
 * 按分类获取预设
 */
export function getPresetsByCategory(category: PresetCategory): PatternPreset[] {
  return PATTERN_PRESETS.filter((p) => p.category === category);
}

/**
 * 获取所有分类
 */
export function getPresetCategories(): PresetCategory[] {
  return ["minimal", "cyberpunk", "nature", "geometric", "gradient", "retro", "glass"];
}

/**
 * 分类标签
 */
export const PRESET_CATEGORY_LABELS: Record<PresetCategory, string> = {
  minimal: "极简风格",
  cyberpunk: "赛博朋克",
  nature: "自然风格",
  geometric: "几何风格",
  gradient: "渐变风格",
  retro: "复古风格",
  glass: "玻璃拟态",
};

/**
 * 根据 ID 获取预设
 */
export function getPresetById(id: string): PatternPreset | undefined {
  return PATTERN_PRESETS.find((p) => p.id === id);
}
