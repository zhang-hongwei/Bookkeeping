/**
 * Curves Generator - Generates flowing curve patterns similar to WickedBackgrounds
 * Creates smooth, organic curves that flow across the canvas
 */

import { BaseGenerator, DEFAULT_CONFIG } from '../BaseGenerator';
import type { CurvesConfig, GeneratorConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { createSvg } from '../../lib/svg/svgBuilder';
import { moveTo, curveTo, Point } from '../../lib/svg/pathUtils';

// =============================================================================
// Curves Generator Implementation
// =============================================================================

export class CurvesGenerator extends BaseGenerator<CurvesConfig> {
  readonly type = 'curves';
  readonly name = 'Curves';
  readonly description = 'Generate flowing curve patterns';
  readonly icon = 'ShowChart';
  readonly category = 'waves';

  readonly defaultConfig: Partial<CurvesConfig> = {
    curves: 5,
    complexity: 5,
    flow: 50,
    thickness: 3,
    opacity: 70,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Flowing Lines',
      config: {
        curves: 6,
        complexity: 4,
        flow: 30,
        thickness: 2,
        opacity: 80,
      },
    },
    {
      name: 'Organic Waves',
      config: {
        curves: 4,
        complexity: 7,
        flow: 60,
        thickness: 4,
        opacity: 60,
      },
    },
    {
      name: 'Thin Ribbons',
      config: {
        curves: 8,
        complexity: 5,
        flow: 45,
        thickness: 1.5,
        opacity: 90,
      },
    },
    {
      name: 'Bold Strokes',
      config: {
        curves: 3,
        complexity: 6,
        flow: 70,
        thickness: 8,
        opacity: 50,
      },
    },
  ];

  readonly controls: GeneratorControl[] = [
    {
      key: 'curves',
      label: 'Curves',
      type: 'slider',
      min: 1,
      max: 12,
      step: 1,
      defaultValue: 5,
    },
    {
      key: 'complexity',
      label: 'Complexity',
      type: 'slider',
      min: 2,
      max: 10,
      step: 1,
      defaultValue: 5,
    },
    {
      key: 'flow',
      label: 'Flow',
      type: 'slider',
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 50,
    },
    {
      key: 'thickness',
      label: 'Thickness',
      type: 'slider',
      min: 1,
      max: 20,
      step: 0.5,
      defaultValue: 3,
    },
    {
      key: 'opacity',
      label: 'Opacity',
      type: 'slider',
      min: 10,
      max: 100,
      step: 5,
      defaultValue: 70,
    },
  ];

  generate(config: CurvesConfig): string {
    const { width, height } = config.canvas;
    const { background, fills } = config.colors;
    const random = this.getRandom(config);

    const svg = createSvg(width, height);

    // Background
    svg.background(background);

    // Generate flowing curves
    const curvePaths = this.generateFlowingCurves(
      width,
      height,
      config.curves,
      config.complexity,
      config.flow,
      random
    );

    // Draw each curve
    curvePaths.forEach((pathData, index) => {
      const colorIndex = index % fills.length;
      const stroke = fills[colorIndex];
      const opacity = (config.opacity / 100) * (1 - index * 0.05);

      svg.path(pathData, {
        fill: 'none',
        stroke,
        'stroke-width': config.thickness,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        opacity,
      });
    });

    return svg.build();
  }

  /**
   * Generate flowing curves across the canvas
   */
  private generateFlowingCurves(
    width: number,
    height: number,
    curveCount: number,
    complexity: number,
    flow: number,
    random: ReturnType<typeof this.getRandom>
  ): string[] {
    const paths: string[] = [];
    const flowFactor = flow / 100;

    for (let i = 0; i < curveCount; i++) {
      const curvePath = this.generateSingleCurve(
        width,
        height,
        complexity,
        flowFactor,
        i,
        curveCount,
        random
      );
      paths.push(curvePath);
    }

    return paths;
  }

  /**
   * Generate a single flowing curve
   */
  private generateSingleCurve(
    width: number,
    height: number,
    complexity: number,
    flowFactor: number,
    curveIndex: number,
    totalCurves: number,
    random: ReturnType<typeof this.getRandom>
  ): string {
    // Starting point based on flow direction
    const startY = (height / (totalCurves + 1)) * (curveIndex + 1);
    const startOffset = random.range(-height * 0.1, height * 0.1);

    // Generate control points for a smooth curve
    const points: Point[] = [];
    const numPoints = Math.floor(complexity * 2) + 2;

    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      const x = t * width;

      // Y position flows based on flowFactor and randomness
      const baseY = startY + startOffset;
      const flowDrift = Math.sin(t * Math.PI * 2 + curveIndex * 0.5) * height * 0.15 * flowFactor;
      const randomDrift = random.range(-height * 0.1, height * 0.1) * (1 - flowFactor * 0.5);

      const y = baseY + flowDrift + randomDrift;

      points.push({ x, y });
    }

    // Convert points to smooth Bezier curve path
    return this.pointsToSmoothPath(points);
  }

  /**
   * Convert points to a smooth Bezier curve path
   */
  private pointsToSmoothPath(points: Point[]): string {
    if (points.length < 2) return '';

    const pathParts: string[] = [moveTo(points[0])];

    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];

      if (i === points.length - 1) {
        // Last point - simple curve to end
        const cp = {
          x: p0.x + (p1.x - p0.x) * 0.5,
          y: p0.y + (p1.y - p0.y) * 0.5,
        };
        pathParts.push(curveTo(p1, cp, { x: p1.x, y: p1.y }));
      } else {
        // Calculate control points for smooth curve
        const tension = 0.4;
        const cp1 = {
          x: p0.x + (p1.x - (points[i - 2] || p0).x) * tension,
          y: p0.y + (p1.y - (points[i - 2] || p0).y) * tension,
        };
        const cp2 = {
          x: p1.x - (p2.x - p0.x) * tension,
          y: p1.y - (p2.y - p0.y) * tension,
        };

        pathParts.push(curveTo(p1, cp1, cp2));
      }
    }

    return pathParts.join(' ');
  }
}

// Export singleton instance
export const curvesGenerator = new CurvesGenerator();
