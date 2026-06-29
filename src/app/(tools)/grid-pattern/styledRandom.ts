/**
 * Grid Pattern Generator - Styled Random
 * 风格化随机生成器 - 基于风格标签生成配置
 */

import type { GridPatternConfig, GridLayer, GridPatternType, BlendMode, AnimationType } from "./types";
import { createLayer } from "./utils";
import { DEFAULT_CONFIG } from "./types";

/**
 * 风格类型
 */
export type RandomStyle =
  | "minimal"     // 极简 - 干净、低饱和度、小尺寸
  | "bold"        // 粗犷 - 高对比、大尺寸、粗线条
  | "pastel"      // 柔和 - 粉彩、低透明度
  | "dark"        // 暗色 - 深色背景、霓虹色
  | "nature"      // 自然 - 绿/蓝/棕、有机图案
  | "gradient"    // 渐变 - 多色渐变、混合模式
  | "retro"       // 复古 - 高饱和、几何图案
  | "chaos";      // 混沌 - 随机所有参数

/**
 * 颜色调色板
 */
const PALETTES = {
  minimal: {
    backgrounds: ["#ffffff", "#f8fafc", "#fafafa", "#fcfcfc"],
    colors: ["#e5e5e5", "#d4d4d4", "#a3a3a3", "#737373", "#525252"],
    blendModes: ["normal"] as BlendMode[],
    opacityRange: [0.3, 0.6],
    sizeRange: [20, 50],
    strokeWidthRange: [0.5, 1.5],
  },
  bold: {
    backgrounds: ["#ffffff", "#000000", "#1a1a1a"],
    colors: ["#000000", "#ff0000", "#0000ff", "#ffff00", "#ff00ff"],
    blendModes: ["normal", "difference", "exclusion"] as BlendMode[],
    opacityRange: [0.6, 1],
    sizeRange: [40, 80],
    strokeWidthRange: [2, 6],
  },
  pastel: {
    backgrounds: ["#fef3c7", "#fce7f3", "#dbeafe", "#f0fdf4", "#fff1f2"],
    colors: [
      "#fca5a5", "#fdba74", "#fcd34d", "#86efac", "#67e8f9",
      "#93c5fd", "#c4b5fd", "#f0abfc", "#fda4af"
    ],
    blendModes: ["multiply", "soft-light", "overlay"] as BlendMode[],
    opacityRange: [0.4, 0.7],
    sizeRange: [30, 60],
    strokeWidthRange: [1, 3],
  },
  dark: {
    backgrounds: ["#0a0a0f", "#1a1a2e", "#0f172a", "#000000"],
    colors: ["#00ffff", "#ff00ff", "#00ff00", "#ffff00", "#ff006e", "#8b5cf6"],
    blendModes: ["screen", "lighten", "color-dodge", "overlay"] as BlendMode[],
    opacityRange: [0.5, 0.9],
    sizeRange: [30, 70],
    strokeWidthRange: [1, 4],
  },
  nature: {
    backgrounds: ["#f0fdf4", "#fefce8", "#ecfdf5", "#f0f9ff"],
    colors: ["#166534", "#15803d", "#047857", "#0d9488", "#0284c7", "#475569"],
    blendModes: ["multiply", "overlay"] as BlendMode[],
    opacityRange: [0.3, 0.6],
    sizeRange: [25, 55],
    strokeWidthRange: [1, 2],
  },
  gradient: {
    backgrounds: ["#ffffff", "#1a1a2e", "#000000"],
    colors: ["#8b5cf6", "#06b6d4", "#f97316", "#ec4899", "#14b8a6"],
    blendModes: ["screen", "overlay", "soft-light", "difference"] as BlendMode[],
    opacityRange: [0.4, 0.8],
    sizeRange: [40, 80],
    strokeWidthRange: [2, 5],
  },
  retro: {
    backgrounds: ["#2d2d2d", "#1a1a2e", "#fef3c7"],
    colors: ["#ff006e", "#ffbe0b", "#00ff00", "#00ffff", "#ff00ff"],
    blendModes: ["normal", "screen", "hard-light"] as BlendMode[],
    opacityRange: [0.6, 1],
    sizeRange: [20, 60],
    strokeWidthRange: [2, 4],
  },
  chaos: {
    backgrounds: ["#ffffff", "#000000", "#1a1a2e", "#fef3c7"],
    colors: [
      "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff",
      "#ff006e", "#8b5cf6", "#06b6d4", "#f97316"
    ],
    blendModes: [
      "normal", "multiply", "screen", "overlay", "difference",
      "exclusion", "hard-light", "soft-light"
    ] as BlendMode[],
    opacityRange: [0.2, 1],
    sizeRange: [10, 100],
    strokeWidthRange: [0.5, 8],
  },
};

/**
 * 图案类型权重（不同风格的图案倾向）
 */
const PATTERN_TYPE_WEIGHTS: Record<RandomStyle, Record<GridPatternType, number>> = {
  minimal: {
    linear: 3,
    dots: 2,
    checkerboard: 1,
    crosshatch: 0,
    isometric: 0,
    diamond: 1,
    wave: 0,
    hexagon: 0,
    radial: 0,
    custom: 0,
  },
  bold: {
    linear: 2,
    dots: 1,
    checkerboard: 3,
    crosshatch: 2,
    isometric: 1,
    diamond: 2,
    wave: 0,
    hexagon: 1,
    radial: 1,
    custom: 0,
  },
  pastel: {
    linear: 1,
    dots: 3,
    checkerboard: 1,
    crosshatch: 1,
    isometric: 1,
    diamond: 1,
    wave: 2,
    hexagon: 1,
    radial: 2,
    custom: 0,
  },
  dark: {
    linear: 2,
    dots: 1,
    checkerboard: 1,
    crosshatch: 2,
    isometric: 1,
    diamond: 1,
    wave: 1,
    hexagon: 1,
    radial: 1,
    custom: 0,
  },
  nature: {
    linear: 1,
    dots: 1,
    checkerboard: 0,
    crosshatch: 1,
    isometric: 1,
    diamond: 0,
    wave: 3,
    hexagon: 1,
    radial: 2,
    custom: 0,
  },
  gradient: {
    linear: 2,
    dots: 0,
    checkerboard: 1,
    crosshatch: 2,
    isometric: 1,
    diamond: 1,
    wave: 2,
    hexagon: 1,
    radial: 2,
    custom: 0,
  },
  retro: {
    linear: 3,
    dots: 1,
    checkerboard: 2,
    crosshatch: 1,
    isometric: 1,
    diamond: 2,
    wave: 0,
    hexagon: 1,
    radial: 1,
    custom: 0,
  },
  chaos: {
    linear: 1,
    dots: 1,
    checkerboard: 1,
    crosshatch: 1,
    isometric: 1,
    diamond: 1,
    wave: 1,
    hexagon: 1,
    radial: 1,
    custom: 1,
  },
};

/**
 * 从数组中随机选择一个元素
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 从范围中随机选择一个值
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 根据权重随机选择图案类型
 */
function randomPatternType(style: RandomStyle): GridPatternType {
  const weights = PATTERN_TYPE_WEIGHTS[style];
  const types = Object.keys(weights) as GridPatternType[];

  // 计算总权重
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

  // 随机选择
  let random = Math.random() * totalWeight;
  for (const type of types) {
    random -= weights[type];
    if (random <= 0) {
      return type;
    }
  }

  return types[0];
}

/**
 * 生成随机颜色停止点
 */
function randomColorStops(colors: string[]): Array<{ offset: number; color: string }> {
  const count = randomInRange(2, 4);
  const stops: Array<{ offset: number; color: string }> = [];

  for (let i = 0; i < count; i++) {
    stops.push({
      offset: Math.floor((i / (count - 1)) * 100),
      color: randomChoice(colors),
    });
  }

  return stops;
}

/**
 * 生成单层随机配置
 */
function generateRandomLayer(style: RandomStyle, index: number): GridLayer {
  const palette = PALETTES[style];

  const layer = createLayer(`图层 ${index + 1}`);

  // 背景色
  layer.color = randomChoice(palette.colors);

  // 颜色停止点（gradient 风格或随机）
  const useGradient = style === "gradient" || Math.random() > 0.7;
  layer.useGradient = useGradient;
  layer.colorStops = randomColorStops(palette.colors);

  // 尺寸
  layer.size = randomInRange(palette.sizeRange[0], palette.sizeRange[1]);

  // 间距
  layer.spacing = randomInRange(0, 20);

  // 线条粗细
  layer.strokeWidth = randomInRange(
    palette.strokeWidthRange[0] * 10,
    palette.strokeWidthRange[1] * 10
  ) / 10;

  // 透明度
  layer.opacity =
    Math.round(
      (Math.random() * (palette.opacityRange[1] - palette.opacityRange[0]) +
        palette.opacityRange[0]) * 100
    ) / 100;

  // 角度
  layer.angle = randomInRange(0, 90) * (Math.random() > 0.5 ? 1 : -1);

  // 混合模式
  layer.blendMode = randomChoice(palette.blendModes);

  // 动画（30% 概率）
  const animations: AnimationType[] = ["none", "scroll", "pulse", "rotate", "zoom"];
  layer.animation = Math.random() > 0.7 ? randomChoice(animations.slice(1)) : "none";
  layer.animationDuration = randomInRange(2, 8);

  // 偏移
  layer.offsetX = randomInRange(0, 20);
  layer.offsetY = randomInRange(0, 20);

  // 图案类型
  layer.type = randomPatternType(style);

  return layer;
}

/**
 * 生成风格化随机配置
 */
export function generateStyledRandom(
  style: RandomStyle,
  layerCount: number = 1
): GridPatternConfig {
  const palette = PALETTES[style];

  // 背景色
  const background = randomChoice(palette.backgrounds);

  // 图层数量（根据风格调整）
  const actualLayerCount = style === "chaos"
    ? randomInRange(1, 4)
    : Math.min(layerCount, style === "gradient" ? 3 : 2);

  // 生成图层
  const layers: GridLayer[] = [];
  for (let i = 0; i < actualLayerCount; i++) {
    layers.push(generateRandomLayer(style, i));
  }

  return {
    background,
    layers,
  };
}

/**
 * 风格标签
 */
export const RANDOM_STYLE_LABELS: Record<RandomStyle, string> = {
  minimal: "极简风格",
  bold: "粗犷风格",
  pastel: "柔和粉彩",
  dark: "暗色霓虹",
  nature: "自然有机",
  gradient: "渐变混合",
  retro: "复古怀旧",
  chaos: "完全随机",
};
