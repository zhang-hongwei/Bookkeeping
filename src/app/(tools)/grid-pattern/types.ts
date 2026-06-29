/**
 * Grid Pattern Generator Types - Custom Shape Version
 * 支持自定义形状的格子背景生成器
 */

export type GridPatternType =
  | "linear" // 线性网格
  | "dots" // 点阵网格
  | "checkerboard" // 棋盘格
  | "crosshatch" // 交叉网格
  | "isometric" // 等距网格
  | "diamond" // 菱形网格
  | "wave" // 波浪网格
  | "hexagon" // 六边形网格
  | "radial" // 放射网格
  | "custom"; // 自定义形状 ⭐ NEW

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion";

export type AnimationType =
  | "none" // 无动画
  | "scroll" // 滚动动画
  | "pulse" // 脉冲动画
  | "rotate" // 旋转动画
  | "zoom"; // 缩放动画

// 自定义形状类型
export type CustomShapeType =
  | "path" // 自定义路径
  | "rect" // 矩形
  | "circle" // 圆形
  | "ellipse" // 椭圆
  | "polygon" // 多边形
  | "star" // 星形
  | "heart" // 心形
  | "cross"; // 十字

// 形状参数接口
export interface ShapeParams {
  // 通用参数
  x?: number; // 位置 X
  y?: number; // 位置 Y
  rotation?: number; // 旋转角度

  // 矩形
  width?: number;
  height?: number;
  radius?: number; // 圆角

  // 圆形/椭圆
  radiusX?: number;
  radiusY?: number;

  // 多边形/星形
  sides?: number; // 边数
  points?: string; // 点坐标 (如 "50,0 100,100 0,100")
  innerRadius?: number; // 内半径 (星形)
  outerRadius?: number; // 外半径 (星形)

  // 自定义路径
  d?: string; // SVG path 数据
}

// 形状定义
export interface Shape {
  id: string;
  type: CustomShapeType;
  params: ShapeParams;
  fill: string; // 填充颜色
  stroke: string; // 描边颜色
  strokeWidth: number; // 描边宽度
  opacity: number; // 透明度
}

export interface ColorStop {
  offset: number; // 0-100
  color: string;
}

export interface GridLayer {
  id: string;
  name: string;
  visible: boolean;

  // 格子类型
  type: GridPatternType;

  // 自定义形状列表 (当 type = "custom" 时使用)
  shapes: Shape[];

  // 颜色（支持渐变）- 用于预设类型
  color: string;
  colorStops: ColorStop[];
  useGradient: boolean;

  // 尺寸
  size: number;
  // 间距
  spacing: number;
  // 线条粗细
  strokeWidth: number;
  // 透明度
  opacity: number;
  // 旋转角度
  angle: number;
  // 混合模式
  blendMode: BlendMode;
  // 动画
  animation: AnimationType;
  animationDuration: number;
  // 偏移
  offsetX: number;
  offsetY: number;
}

export interface GridPatternConfig {
  // 背景颜色
  background: string;
  // 图层列表
  layers: GridLayer[];
}

export interface PatternPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  config: GridPatternConfig;
}

export const PATTERN_TYPE_LABELS: Record<GridPatternType, string> = {
  linear: "线性网格",
  dots: "点阵网格",
  checkerboard: "棋盘格",
  crosshatch: "交叉网格",
  isometric: "等距网格",
  diamond: "菱形网格",
  wave: "波浪网格",
  hexagon: "六边形网格",
  radial: "放射网格",
  custom: "自定义形状 ✏️", // ⭐ NEW
};

export const BLEND_MODE_LABELS: Record<BlendMode, string> = {
  normal: "正常",
  multiply: "正片叠底",
  screen: "滤色",
  overlay: "叠加",
  darken: "变暗",
  lighten: "变亮",
  "color-dodge": "颜色减淡",
  "color-burn": "颜色加深",
  "hard-light": "强光",
  "soft-light": "柔光",
  difference: "差值",
  exclusion: "排除",
};

export const ANIMATION_TYPE_LABELS: Record<AnimationType, string> = {
  none: "无动画",
  scroll: "滚动",
  pulse: "脉冲",
  rotate: "旋转",
  zoom: "缩放",
};

export const SHAPE_TYPE_LABELS: Record<CustomShapeType, string> = {
  path: "自定义路径",
  rect: "矩形",
  circle: "圆形",
  ellipse: "椭圆",
  polygon: "多边形",
  star: "星形",
  heart: "心形",
  cross: "十字",
};

// 预设形状模板
export const SHAPE_PRESETS: Record<CustomShapeType, ShapeParams> = {
  path: { d: "M 10 10 L 40 10 L 50 50 L 20 50 Z" },
  rect: { x: 10, y: 10, width: 40, height: 40, radius: 0 },
  circle: { x: 30, y: 30, radius: 20 },
  ellipse: { x: 30, y: 30, radiusX: 30, radiusY: 15 },
  polygon: { points: "30,5 55,45 5,45", sides: 3 },
  star: { x: 30, y: 30, outerRadius: 25, innerRadius: 12, sides: 5 },
  heart: { d: "M 30 50 C 30 50, 10 35, 10 20 C 10 10, 20 5, 30 15 C 40 5, 50 10, 50 20 C 50 35, 30 50, 30 50 Z" },
  cross: { d: "M 25 10 L 35 10 L 35 25 L 50 25 L 50 35 L 35 35 L 35 50 L 25 50 L 25 35 L 10 35 L 10 25 L 25 25 Z" },
};

// 默认形状
export const DEFAULT_SHAPE: Shape = {
  id: "shape-1",
  type: "rect",
  params: { ...SHAPE_PRESETS.rect },
  fill: "transparent",
  stroke: "#cccccc",
  strokeWidth: 2,
  opacity: 1,
};

// 默认图层
export const DEFAULT_LAYER: Omit<GridLayer, "id"> = {
  name: "图层 1",
  visible: true,
  type: "custom", // 默认使用自定义形状
  shapes: [{ ...DEFAULT_SHAPE }],
  color: "#cccccc",
  colorStops: [
    { offset: 0, color: "#cccccc" },
    { offset: 100, color: "#999999" },
  ],
  useGradient: false,
  size: 60,
  spacing: 0,
  strokeWidth: 1,
  opacity: 1,
  angle: 0,
  blendMode: "normal",
  animation: "none",
  animationDuration: 3,
  offsetX: 0,
  offsetY: 0,
};

// 默认配置
export const DEFAULT_CONFIG: GridPatternConfig = {
  background: "#ffffff",
  layers: [{ ...DEFAULT_LAYER, id: "layer-1" }],
};
