/**
 * Base Generator - Abstract base class for all SVG generators
 */

import type {
  GeneratorType,
  GeneratorConfig,
  GeneratorPreset,
  GeneratorControl,
  CanvasSize,
  ColorConfig,
} from '../types';
import { createSeededRandom, randomSeed } from '../lib/algorithms/random';

// =============================================================================
// Default Configuration
// =============================================================================

export const DEFAULT_CANVAS: CanvasSize = {
  width: 900,
  height: 600,
  label: '3:2 (900×600)',
};

export const DEFAULT_COLORS: ColorConfig = {
  background: '#ffffff',
  fills: ['#643DFF', '#8E33FF', '#B57BFF'],
};

export const DEFAULT_CONFIG = {
  canvas: DEFAULT_CANVAS,
  colors: DEFAULT_COLORS,
  seed: randomSeed(),
  variant: 'solid' as const,
};

// =============================================================================
// Base Generator Class
// =============================================================================

export abstract class BaseGenerator<TConfig extends GeneratorConfig = GeneratorConfig> {
  abstract readonly type: GeneratorType;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly icon: string;
  abstract readonly category: 'shapes' | 'waves' | 'scatters' | 'scenes';
  abstract readonly controls: GeneratorControl[];

  /**
   * Default configuration for this generator
   */
  abstract readonly defaultConfig: Partial<TConfig>;

  /**
   * Preset configurations
   */
  abstract readonly presets: GeneratorPreset[];

  /**
   * Generate SVG string from configuration
   */
  abstract generate(config: TConfig): string;

  /**
   * Get a seeded random instance from config
   */
  protected getRandom(config: TConfig) {
    return createSeededRandom(config.seed);
  }

  /**
   * Get canvas dimensions from config
   */
  protected getCanvas(config: TConfig) {
    return config.canvas;
  }

  /**
   * Get colors from config
   */
  protected getColors(config: TConfig) {
    return config.colors;
  }

  /**
   * Pick a fill color from the palette
   */
  protected pickFill(config: TConfig, index: number = 0): string {
    const fills = config.colors.fills;
    return fills[index % fills.length];
  }

  /**
   * Merge user config with defaults
   */
  mergeConfig(userConfig: Partial<TConfig>): TConfig {
    return {
      ...DEFAULT_CONFIG,
      ...this.defaultConfig,
      ...userConfig,
      canvas: {
        ...DEFAULT_CONFIG.canvas,
        ...this.defaultConfig?.canvas,
        ...userConfig?.canvas,
      },
      colors: {
        ...DEFAULT_CONFIG.colors,
        ...this.defaultConfig?.colors,
        ...userConfig?.colors,
      },
    } as TConfig;
  }

  /**
   * Generate a new seed and return updated config
   */
  randomize(config: TConfig): TConfig {
    return {
      ...config,
      seed: randomSeed(),
    };
  }
}

// =============================================================================
// Generator Registry
// =============================================================================

const generatorRegistry = new Map<GeneratorType, BaseGenerator>();

export function registerGenerator(generator: BaseGenerator): void {
  generatorRegistry.set(generator.type, generator);
}

export function getGenerator(type: GeneratorType): BaseGenerator | undefined {
  return generatorRegistry.get(type);
}

export function getAllGenerators(): BaseGenerator[] {
  return Array.from(generatorRegistry.values());
}

export function getGeneratorsByCategory(category: BaseGenerator['category']): BaseGenerator[] {
  return getAllGenerators().filter((g) => g.category === category);
}
