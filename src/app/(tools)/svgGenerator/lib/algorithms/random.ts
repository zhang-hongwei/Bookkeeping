/**
 * Seeded Random Number Generator
 * Using Mulberry32 algorithm for reproducible random sequences
 */

/**
 * Mulberry32 seeded random number generator
 * Fast, simple, and produces good quality random numbers
 *
 * @param seed - Initial seed value
 * @returns Function that returns random number between 0 and 1
 */
export function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Create a seeded random number generator with utility methods
 */
export interface SeededRandom {
  /** Get next random number between 0 and 1 */
  next: () => number;
  /** Get random number between min and max */
  range: (min: number, max: number) => number;
  /** Get random integer between min and max (inclusive) */
  int: (min: number, max: number) => number;
  /** Get random boolean with optional probability */
  bool: (probability?: number) => boolean;
  /** Pick random item from array */
  pick: <T>(array: T[]) => T;
  /** Shuffle array in place */
  shuffle: <T>(array: T[]) => T[];
  /** Get random angle in radians */
  angle: () => number;
  /** Get random point within bounds */
  point: (width: number, height: number) => { x: number; y: number };
  /** Gaussian random (normal distribution) */
  gaussian: (mean?: number, stdDev?: number) => number;
}

export function createSeededRandom(seed: number): SeededRandom {
  const next = mulberry32(seed);

  return {
    next,

    range: (min: number, max: number): number => {
      return min + next() * (max - min);
    },

    int: (min: number, max: number): number => {
      return Math.floor(min + next() * (max - min + 1));
    },

    bool: (probability: number = 0.5): boolean => {
      return next() < probability;
    },

    pick: <T>(array: T[]): T => {
      return array[Math.floor(next() * array.length)];
    },

    shuffle: <T>(array: T[]): T[] => {
      const result = [...array];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    },

    angle: (): number => {
      return next() * Math.PI * 2;
    },

    point: (width: number, height: number): { x: number; y: number } => {
      return {
        x: next() * width,
        y: next() * height,
      };
    },

    gaussian: (mean: number = 0, stdDev: number = 1): number => {
      // Box-Muller transform
      const u1 = next();
      const u2 = next();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      return z0 * stdDev + mean;
    },
  };
}

/**
 * Generate a random seed (for initial randomization)
 */
export function randomSeed(): number {
  return Math.floor(Math.random() * 2147483647);
}
