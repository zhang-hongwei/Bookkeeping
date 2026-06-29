/**
 * Seeded Random Number Generator
 * Provides deterministic random numbers based on a seed
 */

export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Get next random value between 0 and 1
   */
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Get random number in range [min, max)
   */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Get random integer in range [min, max]
   */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Get random boolean with optional probability
   */
  bool(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * Pick random item from array
   */
  pick<T>(array: T[]): T {
    return array[this.int(0, array.length - 1)];
  }

  /**
   * Shuffle array in place (Fisher-Yates)
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Gaussian (normal) distribution random number using Box-Muller transform
   */
  gaussian(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  /**
   * Get current seed
   */
  getSeed(): number {
    return this.seed;
  }

  /**
   * Set seed
   */
  setSeed(seed: number): void {
    this.seed = seed;
  }
}

/**
 * Create a new seeded random generator
 */
export function createSeededRandom(seed: number): SeededRandom {
  return new SeededRandom(seed);
}

/**
 * Generate a random seed
 */
export function randomSeed(): number {
  return Math.floor(Math.random() * 1000000);
}
