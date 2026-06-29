/**
 * Simplex Noise Implementation
 * Used for generating organic patterns in topography generator
 */

import { createNoise2D } from 'simplex-noise';
import { createSeededRandom, type SeededRandom } from './random';

export interface SimplexNoise {
  noise2D: (x: number, y: number) => number;
  octave2D: (x: number, y: number, octaves: number, persistence: number) => number;
}

/**
 * Create a simplex noise generator with optional seed
 */
export function createSimplexNoise(seed?: number): SimplexNoise {
  const random: SeededRandom | (() => number) = seed !== undefined
    ? createSeededRandom(seed)
    : Math.random;

  const noise2D = createNoise2D(typeof random === 'function' ? random : () => random.next());

  /**
   * Fractal Brownian Motion - multiple octaves for more natural terrain
   */
  function octave2D(x: number, y: number, octaves: number, persistence: number): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }

  return {
    noise2D,
    octave2D,
  };
}

/**
 * Normalize noise value from [-1, 1] to [0, 1]
 */
export function normalizeNoise(value: number): number {
  return (value + 1) / 2;
}

/**
 * Generate a height map using simplex noise
 */
export function generateHeightMap(
  width: number,
  height: number,
  noise: SimplexNoise,
  options: {
    scale?: number;
    octaves?: number;
    persistence?: number;
  } = {}
): Float32Array {
  const { scale = 0.01, octaves = 4, persistence = 0.5 } = options;
  const map = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      map[index] = noise.octave2D(x * scale, y * scale, octaves, persistence);
    }
  }

  return map;
}
