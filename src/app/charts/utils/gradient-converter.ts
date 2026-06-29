/**
 * CSS 渐变色转换为 ECharts 格式工具
 *
 * ECharts 不支持 CSS gradient 字符串，需要转换为 echarts.graphic.LinearGradient 对象
 */

import { graphic } from 'echarts';

/**
 * react-best-gradient-color-picker 返回的渐变对象类型
 */
export interface GradientObject {
  isGradient: boolean;
  gradientType: 'linear-gradient' | 'radial-gradient';
  degrees: string; // 例如: "90deg"
  colors: Array<{
    value: string; // rgba 字符串
    left: number; // 0-100
  }>;
}

/**
 * 解析 CSS linear-gradient 字符串
 *
 * @example
 * parseLinearGradient("linear-gradient(90deg, rgba(168,84,198,0.64) 0%, rgba(255,0,0,1) 100%)")
 * // Returns: {
 * //   angle: 90,
 * //   colorStops: [
 * //     { offset: 0, color: "rgba(168,84,198,0.64)" },
 * //     { offset: 1, color: "rgba(255,0,0,1)" }
 * //   ]
 * // }
 */
/**
 * 智能分割渐变字符串，考虑括号内的逗号
 * 例如: "90deg, RGBA(175, 51, 242, 1) 37%, rgba(84,112,198,1) 100%"
 * 应该分割为: ["90deg", "RGBA(175, 51, 242, 1) 37%", "rgba(84,112,198,1) 100%"]
 */
function smartSplit(str: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0; // 括号深度

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      // 只在括号外的逗号处分割
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // 添加最后一部分
  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

function parseLinearGradient(cssGradient: string): {
  angle: number;
  colorStops: Array<{ offset: number; color: string }>;
} | null {
  console.log('[Parse Gradient] Input:', cssGradient);

  // 匹配 linear-gradient(angle, color1 offset1, color2 offset2, ...)
  const match = cssGradient.match(/linear-gradient\((.*)\)/);
  if (!match) {
    console.error('[Parse Gradient] Failed to match linear-gradient pattern');
    return null;
  }

  console.log('[Parse Gradient] Matched content:', match[1]);

  // 使用智能分割，考虑括号内的逗号
  const parts = smartSplit(match[1]);
  console.log('[Parse Gradient] Smart split parts:', parts);

  if (parts.length < 2) {
    console.error('[Parse Gradient] Not enough parts, need at least 2, got:', parts.length);
    return null;
  }

  // 解析角度
  let angle = 90; // 默认 90deg
  let startIndex = 0;

  const firstPart = parts[0];
  if (firstPart.includes('deg')) {
    angle = parseFloat(firstPart);
    startIndex = 1;
  } else if (firstPart === 'to right') {
    angle = 90;
    startIndex = 1;
  } else if (firstPart === 'to left') {
    angle = 270;
    startIndex = 1;
  } else if (firstPart === 'to bottom') {
    angle = 180;
    startIndex = 1;
  } else if (firstPart === 'to top') {
    angle = 0;
    startIndex = 1;
  }

  // 解析颜色停止点
  const colorStops: Array<{ offset: number; color: string }> = [];

  for (let i = startIndex; i < parts.length; i++) {
    const part = parts[i].trim();
    console.log(`[Parse Gradient] Processing part ${i}:`, part);

    // 匹配颜色和位置
    // 支持格式: "rgba(168,84,198,0.64) 0%", "#5470c6 50%", "rgb(255,0,0) 100%"
    // 使用 case-insensitive 匹配，支持 RGBA、rgba、RGB、rgb
    const colorMatch = part.match(/([Rr][Gg][Bb][Aa]?\([^)]+\)|#[0-9a-fA-F]{3,8})\s+(\d+(?:\.\d+)?)%/);

    if (colorMatch) {
      const color = colorMatch[1];
      const offset = parseFloat(colorMatch[2]) / 100;
      console.log(`[Parse Gradient] Matched color stop:`, { color, offset });
      colorStops.push({ offset, color });
    } else {
      console.warn(`[Parse Gradient] Failed to match color stop in:`, part);
    }
  }

  console.log(`[Parse Gradient] Total color stops found:`, colorStops.length, colorStops);

  // 如果没有解析到颜色停止点，尝试简单匹配（没有百分比）
  if (colorStops.length === 0) {
    for (let i = startIndex; i < parts.length; i++) {
      const part = parts[i].trim();
      const simpleMatch = part.match(/([Rr][Gg][Bb][Aa]?\([^)]+\)|#[0-9a-fA-F]{3,8})/);
      if (simpleMatch) {
        const color = simpleMatch[1];
        // 均匀分布
        const offset = (i - startIndex) / (parts.length - startIndex - 1);
        colorStops.push({ offset, color });
      }
    }
  }

  return { angle, colorStops };
}

/**
 * 从 GradientObject 转换为 ECharts LinearGradient
 *
 * 这是推荐的转换方法，使用 react-best-gradient-color-picker 的 getGradientObject() 结果
 *
 * @param gradientObj - getGradientObject() 返回的对象
 * @returns ECharts LinearGradient 对象，如果不是渐变返回 null
 *
 * @example
 * const { getGradientObject } = useColorPicker(color, setColor);
 * const gradientObj = getGradientObject();
 * const echartsGradient = convertGradientObjectToECharts(gradientObj);
 */
export function convertGradientObjectToECharts(
  gradientObj: GradientObject | null | undefined
): InstanceType<typeof graphic.LinearGradient> | null {
  if (!gradientObj || !gradientObj.isGradient) {
    console.log('[Gradient Converter] Not a gradient, returning null');
    return null;
  }

  // 只处理 linear-gradient
  if (gradientObj.gradientType !== 'linear-gradient') {
    console.log('[Gradient Converter] Radial gradient not supported yet');
    return null;
  }

  // 解析角度 "90deg" -> 90
  const angle = parseInt(gradientObj.degrees) || 90;

  // 转换为 ECharts 坐标
  const [x0, y0, x1, y1] = angleToCoordinates(angle);

  // 转换颜色停止点
  const colorStops = gradientObj.colors.map(color => ({
    offset: color.left / 100, // 0-100 -> 0-1
    color: color.value        // 已经是 "rgba(...)" 格式
  }));

  console.log('[Gradient Converter] Converted from GradientObject:', {
    angle,
    coordinates: [x0, y0, x1, y1],
    colorStops
  });

  return new graphic.LinearGradient(x0, y0, x1, y1, colorStops);
}

/**
 * 将角度转换为 ECharts LinearGradient 坐标
 *
 * @param angle - CSS 角度 (0-360)
 * @returns ECharts 渐变坐标 [x0, y0, x1, y1]
 */
function angleToCoordinates(angle: number): [number, number, number, number] {
  // 标准化角度到 0-360
  const normalizedAngle = ((angle % 360) + 360) % 360;

  // CSS 渐变角度: 0deg = 向上, 90deg = 向右, 180deg = 向下, 270deg = 向左
  // ECharts: [x0, y0, x1, y1] 其中 0-1 表示相对位置

  if (normalizedAngle === 0) {
    return [0, 1, 0, 0]; // 向上: 从下到上
  } else if (normalizedAngle === 90) {
    return [0, 0, 1, 0]; // 向右: 从左到右
  } else if (normalizedAngle === 180) {
    return [0, 0, 0, 1]; // 向下: 从上到下
  } else if (normalizedAngle === 270) {
    return [1, 0, 0, 0]; // 向左: 从右到左
  }

  // 对于其他角度，计算对角线渐变
  // 简化处理：大部分情况使用横向或纵向渐变
  if (normalizedAngle < 45 || normalizedAngle >= 315) {
    return [0, 1, 0, 0]; // 接近垂直向上
  } else if (normalizedAngle < 135) {
    return [0, 0, 1, 0]; // 接近水平向右
  } else if (normalizedAngle < 225) {
    return [0, 0, 0, 1]; // 接近垂直向下
  } else {
    return [1, 0, 0, 0]; // 接近水平向左
  }
}

/**
 * 将 CSS linear-gradient 字符串转换为 ECharts LinearGradient 对象
 *
 * @param cssGradient - CSS 渐变字符串，例如: "linear-gradient(90deg, rgba(168,84,198,0.64) 0%, rgba(255,0,0,1) 100%)"
 * @returns ECharts LinearGradient 对象，如果解析失败返回 null
 *
 * @example
 * const gradient = convertCSSGradientToECharts("linear-gradient(90deg, #5470c6 0%, #91cc75 100%)");
 * // 用于 ECharts lineStyle.color:
 * lineStyle: {
 *   color: gradient
 * }
 */
export function convertCSSGradientToECharts(
  cssGradient: string
): InstanceType<typeof graphic.LinearGradient> | null {
  if (!cssGradient || typeof cssGradient !== 'string') {
    console.warn('[Gradient Converter] Invalid input:', cssGradient);
    return null;
  }

  // 只处理 linear-gradient
  if (!cssGradient.includes('linear-gradient')) {
    console.log('[Gradient Converter] Not a linear-gradient, skipping:', cssGradient);
    return null;
  }

  const parsed = parseLinearGradient(cssGradient);
  if (!parsed || parsed.colorStops.length < 2) {
    console.error('[Gradient Converter] Failed to parse gradient:', {
      input: cssGradient,
      parsed,
      colorStopsCount: parsed?.colorStops.length || 0
    });
    return null;
  }

  const { angle, colorStops } = parsed;
  const [x0, y0, x1, y1] = angleToCoordinates(angle);

  console.log('[Gradient Converter] Successfully converted:', {
    input: cssGradient,
    angle,
    coordinates: [x0, y0, x1, y1],
    colorStops
  });

  // 创建 ECharts LinearGradient
  return new graphic.LinearGradient(x0, y0, x1, y1, colorStops);
}

/**
 * 检测颜色值是否是渐变色
 */
export function isGradientColor(color: string): boolean {
  if (!color || typeof color !== 'string') {
    return false;
  }

  return (
    color.includes('linear-gradient') ||
    color.includes('radial-gradient') ||
    color.includes('conic-gradient')
  );
}

/**
 * 自动转换颜色值
 *
 * 如果是渐变色字符串，转换为 ECharts 格式
 * 如果是普通颜色，直接返回
 *
 * @param color - 颜色值（CSS 字符串或已经是 ECharts 对象）
 * @returns 处理后的颜色值
 */
export function processColorValue(color: any): any {
  // 如果已经是对象（可能已经是 ECharts gradient 对象），直接返回
  if (typeof color !== 'string') {
    console.log('[Process Color] Already an object, returning as-is:', typeof color);
    return color;
  }

  // 如果是渐变色字符串，转换为 ECharts 格式
  if (isGradientColor(color)) {
    console.log('[Process Color] Detected gradient color, converting:', color);
    const converted = convertCSSGradientToECharts(color);
    if (converted) {
      console.log('[Process Color] Conversion successful');
      return converted;
    } else {
      console.error('[Process Color] Conversion failed, returning original value');
      return color;
    }
  }

  // 普通颜色直接返回
  console.log('[Process Color] Solid color, returning as-is:', color);
  return color;
}
