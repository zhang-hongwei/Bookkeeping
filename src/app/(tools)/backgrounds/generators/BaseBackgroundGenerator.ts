/**
 * Base Background Generator
 * Abstract base class for all background generators
 */

import type {
  BackgroundGeneratorType,
  BackgroundConfig,
  GeneratorPreset,
  GeneratorControl,
  CanvasSize,
  ColorPalette,
  BaseBackgroundConfig,
} from '../types';
import { createSeededRandom, randomSeed, type SeededRandom } from '../lib/algorithms/random';

// =============================================================================
// Default Configuration
// =============================================================================

export const DEFAULT_CANVAS: CanvasSize = {
  width: 1920,
  height: 1080,
  label: '16:9 Desktop (1920×1080)',
};

export const DEFAULT_COLORS: ColorPalette = {
  background: '#1a1a2e',
  palette: ['#16213e', '#0f3460', '#e94560', '#533483'],
};

export const DEFAULT_BASE_CONFIG: BaseBackgroundConfig = {
  canvas: DEFAULT_CANVAS,
  seed: randomSeed(),
  colors: DEFAULT_COLORS,
};

// =============================================================================
// Base Generator Class
// =============================================================================

export abstract class BaseBackgroundGenerator<TConfig extends BackgroundConfig = BackgroundConfig> {
  abstract readonly type: BackgroundGeneratorType;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly icon: string;
  abstract readonly supportsSVG: boolean;
  abstract readonly controls: GeneratorControl[];
  abstract readonly defaultConfig: Partial<TConfig>;
  abstract readonly presets: GeneratorPreset[];

  /**
   * Generate background on canvas
   */
  abstract generateCanvas(config: TConfig, canvas: HTMLCanvasElement): void | Promise<void>;

  /**
   * Generate SVG (optional - only if supportsSVG is true)
   */
  generateSVG?(config: TConfig): string;

  /**
   * Get seeded random from config
   */
  protected getRandom(config: TConfig): SeededRandom {
    return createSeededRandom(config.seed);
  }

  /**
   * Get canvas dimensions
   */
  protected getCanvas(config: TConfig): CanvasSize {
    return config.canvas;
  }

  /**
   * Get color palette
   */
  protected getColors(config: TConfig): ColorPalette {
    return config.colors;
  }

  /**
   * Pick color from palette
   */
  protected pickColor(config: TConfig, random: SeededRandom): string {
    return random.pick(config.colors.palette);
  }

  /**
   * Clear canvas with background color
   */
  protected clearCanvas(canvas: HTMLCanvasElement, color: string): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Merge user config with defaults
   */
  mergeConfig(userConfig: Partial<TConfig>): TConfig {
    const baseConfig = {
      ...DEFAULT_BASE_CONFIG,
      ...this.defaultConfig,
      ...userConfig,
    } as TConfig;

    // Deep merge nested objects
    if (userConfig.canvas || this.defaultConfig?.canvas) {
      baseConfig.canvas = {
        ...DEFAULT_BASE_CONFIG.canvas,
        ...this.defaultConfig?.canvas,
        ...userConfig?.canvas,
      };
    }

    if (userConfig.colors || this.defaultConfig?.colors) {
      baseConfig.colors = {
        ...DEFAULT_BASE_CONFIG.colors,
        ...this.defaultConfig?.colors,
        ...userConfig?.colors,
      };
    }

    return baseConfig;
  }
}

// =============================================================================
// Generator Registry
// =============================================================================

const generatorRegistry = new Map<BackgroundGeneratorType, BaseBackgroundGenerator>();

export function registerBackgroundGenerator(generator: BaseBackgroundGenerator): void {
  generatorRegistry.set(generator.type, generator);
}

export function getBackgroundGenerator(
  type: BackgroundGeneratorType
): BaseBackgroundGenerator | undefined {
  return generatorRegistry.get(type);
}

export function getAllBackgroundGenerators(): BaseBackgroundGenerator[] {
  return Array.from(generatorRegistry.values());
}

export function hasGenerator(type: BackgroundGeneratorType): boolean {
  return generatorRegistry.has(type);
}
