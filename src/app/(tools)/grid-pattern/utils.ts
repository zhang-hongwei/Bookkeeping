/**
 * Grid Pattern Generator Utilities - Custom Shape Version
 * 支持自定义形状的格子背景生成工具
 */

import type {
  GridLayer,
  GridPatternConfig,
  GridPatternType,
  BlendMode,
  AnimationType,
  ColorStop,
  Shape,
  CustomShapeType,
  ShapeParams,
} from "./types";
import { SHAPE_PRESETS, DEFAULT_LAYER } from "./types";

/**
 * Convert hex color to rgba with opacity
 */
export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Generate gradient string from color stops
 */
function generateGradient(colorStops: ColorStop[], opacity: number): string {
  if (colorStops.length < 2) {
    return hexToRgba(colorStops[0]?.color || "#000000", opacity);
  }

  const stops = colorStops
    .map((stop) => `${hexToRgba(stop.color, opacity)} ${stop.offset}%`)
    .join(", ");

  return `linear-gradient(90deg, ${stops})`;
}

/**
 * Get effective color (solid or gradient)
 */
function getEffectiveColor(layer: GridLayer): string {
  if (layer.useGradient && layer.colorStops.length >= 2) {
    return generateGradient(layer.colorStops, layer.opacity);
  }
  return hexToRgba(layer.color, layer.opacity);
}

// ============================================================================
// CUSTOM SHAPE GENERATION
// ============================================================================

/**
 * Generate SVG element for a shape
 */
export function generateShapeElement(shape: Shape, tileSize: number): string {
  const { type, params, fill, stroke, strokeWidth, opacity } = shape;
  const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, "0");
  const strokeWithOpacity = stroke + opacityHex;

  const commonAttrs = `fill="${fill === "transparent" ? "none" : fill}" stroke="${strokeWithOpacity}" stroke-width="${strokeWidth}"`;

  switch (type) {
    case "rect": {
      const x = params.x ?? 10;
      const y = params.y ?? 10;
      const w = params.width ?? 40;
      const h = params.height ?? 40;
      const r = params.radius ?? 0;
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${commonAttrs} />`;
    }

    case "circle": {
      const cx = params.x ?? 30;
      const cy = params.y ?? 30;
      const r = params.radius ?? 20;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" ${commonAttrs} />`;
    }

    case "ellipse": {
      const cx = params.x ?? 30;
      const cy = params.y ?? 30;
      const rx = params.radiusX ?? 30;
      const ry = params.radiusY ?? 15;
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${commonAttrs} />`;
    }

    case "polygon": {
      const points = params.points || "30,5 55,45 5,45";
      return `<polygon points="${points}" ${commonAttrs} />`;
    }

    case "star": {
      return generateStarElement(params, commonAttrs);
    }

    case "heart": {
      return `<path d="${params.d || SHAPE_PRESETS.heart.d}" ${commonAttrs} />`;
    }

    case "cross": {
      return `<path d="${params.d || SHAPE_PRESETS.cross.d}" ${commonAttrs} />`;
    }

    case "path": {
      return `<path d="${params.d || ""}" ${commonAttrs} />`;
    }

    default:
      return "";
  }
}

/**
 * Generate star polygon points
 */
function generateStarElement(params: ShapeParams, attrs: string): string {
  const cx = params.x ?? 30;
  const cy = params.y ?? 30;
  const outerR = params.outerRadius ?? 25;
  const innerR = params.innerRadius ?? 12;
  const sides = params.sides ?? 5;

  let points = "";
  for (let i = 0; i < sides * 2; i++) {
    const radius = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / sides) * i - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points += `${x.toFixed(1)},${y.toFixed(1)} `;
  }

  return `<polygon points="${points.trim()}" ${attrs} />`;
}

/**
 * Generate custom shape SVG pattern
 */
function generateCustomShapePattern(layer: GridLayer): string {
  const tileSize = layer.size + layer.spacing;
  const opacityHex = Math.round(layer.opacity * 255).toString(16).padStart(2, "0");

  // Generate all shapes in the layer
  const shapeElements = layer.shapes
    .filter((s) => s.type !== "path" || (s.params.d && s.params.d.length > 0))
    .map((shape) => generateShapeElement(shape, tileSize))
    .join("\n    ");

  return `
    <pattern id="custom-${layer.id}" patternUnits="userSpaceOnUse" width="${tileSize}" height="${tileSize}">
      ${shapeElements}
    </pattern>
    <rect width="100%" height="100%" fill="url(#custom-${layer.id})" />`;
}

// ============================================================================
// PRESET PATTERN GENERATION
// ============================================================================

/**
 * Generate background-image for a preset pattern layer
 */
function generatePresetBackground(layer: GridLayer): string {
  const color = getEffectiveColor(layer);
  const cellSize = layer.size + layer.spacing;

  switch (layer.type) {
    case "linear":
      return `linear-gradient(${layer.angle}deg, ${color} ${layer.strokeWidth}px, transparent ${layer.strokeWidth}px), linear-gradient(${layer.angle + 90}deg, ${color} ${layer.strokeWidth}px, transparent ${layer.strokeWidth}px)`;

    case "dots":
      return `radial-gradient(${color} ${layer.strokeWidth}px, transparent ${layer.strokeWidth}px)`;

    case "checkerboard":
      return `linear-gradient(${layer.angle}deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%, ${color}), linear-gradient(${-layer.angle}deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%, ${color})`;

    case "crosshatch":
      return `linear-gradient(${layer.angle}deg, ${color} ${layer.strokeWidth}px, transparent ${layer.strokeWidth}px), linear-gradient(${layer.angle + 90}deg, ${color} ${layer.strokeWidth}px, transparent ${layer.strokeWidth}px), linear-gradient(${layer.angle + 45}deg, ${color} ${layer.strokeWidth}px, transparent ${layer.strokeWidth}px), linear-gradient(${layer.angle - 45}deg, ${color} ${layer.strokeWidth}px, transparent ${layer.strokeWidth}px)`;

    case "diamond":
      return `linear-gradient(${layer.angle + 45}deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%, ${color}), linear-gradient(${layer.angle - 45}deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%, ${color})`;

    default:
      return `linear-gradient(${layer.angle}deg, ${color} ${layer.strokeWidth}px, transparent ${layer.strokeWidth}px), linear-gradient(${layer.angle + 90}deg, ${color} ${layer.strokeWidth}px, transparent ${layer.strokeWidth}px)`;
  }
}

/**
 * Get background size for layer type
 */
function getBackgroundSize(layer: GridLayer): string {
  const cellSize = layer.size + layer.spacing;

  switch (layer.type) {
    case "checkerboard":
    case "diamond":
      return `${layer.size * 2}px ${layer.size * 2}px`;
    case "custom":
      return `${cellSize}px ${cellSize}px`;
    default:
      return `${cellSize}px ${cellSize}px`;
  }
}

/**
 * Get background position for layer type
 */
function getBackgroundPosition(layer: GridLayer): string {
  const offsetX = layer.offsetX ? `${layer.offsetX}px ` : "";
  const offsetY = layer.offsetY ? `${layer.offsetY}px` : "";

  switch (layer.type) {
    case "checkerboard":
      return `0 0, ${layer.size}px ${layer.size}px`;
    case "diamond":
      return `0 0, 0 ${layer.size}px`;
    default:
      return `${offsetX}${offsetX ? "" : "0"} ${offsetY}${offsetY ? "" : "0"}`;
  }
}

/**
 * Generate animation CSS
 */
function generateAnimationCSS(layer: GridLayer): string {
  if (layer.animation === "none") return "";

  const animations: Record<AnimationType, string> = {
    none: "",
    scroll: `gridScroll ${layer.animationDuration}s linear infinite`,
    pulse: `gridPulse ${layer.animationDuration}s ease-in-out infinite`,
    rotate: `gridRotate ${layer.animationDuration * 2}s linear infinite`,
    zoom: `gridZoom ${layer.animationDuration}s ease-in-out infinite`,
  };

  return animations[layer.animation] || "";
}

/**
 * Generate keyframes for animations
 */
export function generateKeyframes(): string {
  return `
@keyframes gridScroll {
  0% { background-position: 0 0; }
  100% { background-position: 20px 20px; }
}

@keyframes gridPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes gridRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes gridZoom {
  0%, 100% { background-size: var(--bg-size); }
  50% { background-size: calc(var(--bg-size) * 1.1); }
}
`;
}

/**
 * Generate SVG for custom shape layer
 */
function generateCustomSVG(layer: GridLayer): string {
  const tileSize = layer.size + layer.spacing;
  const svgContent = generateCustomShapePattern(layer);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize}" height="${tileSize}" viewBox="0 0 ${tileSize} ${tileSize}">
  ${svgContent.trim()}
</svg>`;
}

/**
 * Generate complete CSS for a layer
 */
function generateLayerCSS(layer: GridLayer, index: number): string {
  if (!layer.visible) return "/* Hidden layer */";

  // Custom shape: use SVG data URL
  if (layer.type === "custom") {
    const svg = generateCustomSVG(layer);
    const encoded = encodeURIComponent(svg);
    const dataUrl = `url("data:image/svg+xml,${encoded}")`;

    return `/* Layer ${index + 1}: ${layer.name} (Custom Shape) */
background-image: ${dataUrl};
background-size: ${getBackgroundSize(layer)};
background-position: ${getBackgroundPosition(layer)};
background-blend-mode: ${layer.blendMode};`;
  }

  // Preset patterns
  const bgImage = generatePresetBackground(layer);
  const bgSize = getBackgroundSize(layer);
  const bgPosition = getBackgroundPosition(layer);
  const animation = generateAnimationCSS(layer);
  const animationProp = animation ? `\n  animation: ${animation};` : "";

  return `/* Layer ${index + 1}: ${layer.name} */`;
}

/**
 * Generate multi-layer CSS
 */
export function generateCSS(config: GridPatternConfig): string {
  if (config.layers.length === 0) {
    return `background-color: ${config.background};`;
  }

  const visibleLayers = config.layers.filter((l) => l.visible);
  if (visibleLayers.length === 0) {
    return `background-color: ${config.background};`;
  }

  let css = `/* Grid Pattern Background */
background-color: ${config.background};`;

  if (visibleLayers.length === 1) {
    const layer = visibleLayers[0];
    if (layer.type === "custom") {
      const svg = generateCustomSVG(layer);
      const encoded = encodeURIComponent(svg);
      const dataUrl = `url("data:image/svg+xml,${encoded}")`;

      css += `
background-image: ${dataUrl};
background-size: ${getBackgroundSize(layer)};
background-position: ${getBackgroundPosition(layer)};`;
    } else {
      const bgImage = generatePresetBackground(layer);
      css += `
background-image: ${bgImage};
background-size: ${getBackgroundSize(layer)};
background-position: ${getBackgroundPosition(layer)};`;
    }
  } else {
    // Multi-layer
    const allBgImages = visibleLayers.map((layer) => {
      if (layer.type === "custom") {
        const svg = generateCustomSVG(layer);
        const encoded = encodeURIComponent(svg);
        return `url("data:image/svg+xml,${encoded}")`;
      }
      return generatePresetBackground(layer);
    }).join(",\n  ");

    const allBgSizes = visibleLayers.map((l) => getBackgroundSize(l)).join(", ");
    const allBgPositions = visibleLayers.map((l) => getBackgroundPosition(l)).join(", ");

    css += `
background-image:
  ${allBgImages};
background-size: ${allBgSizes};
background-position: ${allBgPositions};
background-blend-mode: ${visibleLayers.map((l) => l.blendMode).join(", ")};`;
  }

  return css;
}

/**
 * Generate React style object for preview
 */
export function generateStyleObject(config: GridPatternConfig): React.CSSProperties {
  const visibleLayers = config.layers.filter((l) => l.visible);
  if (visibleLayers.length === 0) {
    return { backgroundColor: config.background };
  }

  const style: React.CSSProperties = {
    backgroundColor: config.background,
  };

  if (visibleLayers.length === 1) {
    const layer = visibleLayers[0];
    if (layer.type === "custom") {
      const svg = generateCustomSVG(layer);
      const encoded = encodeURIComponent(svg);
      style.backgroundImage = `url("data:image/svg+xml,${encoded}")`;
    } else {
      style.backgroundImage = generatePresetBackground(layer);
    }
    style.backgroundSize = getBackgroundSize(layer);
    style.backgroundPosition = getBackgroundPosition(layer);
    style.mixBlendMode = layer.blendMode as any;

    if (layer.animation !== "none") {
      style.animation = generateAnimationCSS(layer);
    }
  } else {
    style.backgroundImage = visibleLayers.map((layer) => {
      if (layer.type === "custom") {
        const svg = generateCustomSVG(layer);
        const encoded = encodeURIComponent(svg);
        return `url("data:image/svg+xml,${encoded}")`;
      }
      return generatePresetBackground(layer);
    }).join(", ");
    style.backgroundSize = visibleLayers.map((l) => getBackgroundSize(l)).join(", ");
    style.backgroundPosition = visibleLayers.map((l) => getBackgroundPosition(l)).join(", ");
  }

  return style;
}

/**
 * Create a new layer
 */
export function createLayer(name: string): GridLayer {
  return {
    ...DEFAULT_LAYER,
    id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
  };
}

/**
 * Duplicate a layer
 */
export function duplicateLayer(layer: GridLayer): GridLayer {
  return {
    ...layer,
    id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${layer.name} 副本`,
    shapes: layer.shapes.map((s) => ({
      ...s,
      id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    })),
  };
}

/**
 * Create a new shape
 */
export function createShape(type: CustomShapeType): Shape {
  const presetParams = SHAPE_PRESETS[type];

  return {
    id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    params: { ...presetParams },
    fill: "transparent",
    stroke: "#cccccc",
    strokeWidth: 2,
    opacity: 1,
  };
}

/**
 * Duplicate a shape
 */
export function duplicateShape(shape: Shape): Shape {
  return {
    ...shape,
    id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}
