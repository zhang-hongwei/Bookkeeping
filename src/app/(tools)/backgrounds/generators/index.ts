/**
 * Background Generators Index
 * Export all background generators
 */

// Re-export base types and utilities
export {
  BaseBackgroundGenerator,
  registerBackgroundGenerator,
  getBackgroundGenerator,
  getAllBackgroundGenerators,
  hasGenerator,
  DEFAULT_CANVAS,
  DEFAULT_COLORS,
} from './BaseBackgroundGenerator';

// Export individual generators
export { gradientGenerator, GradientGenerator } from './gradient';
export { particlesGenerator, ParticlesGenerator } from './particles';
export { topographyGenerator, TopographyGenerator } from './topography';
export { trianglifyGenerator, TrianglifyGenerator } from './trianglify';
export { unsplashGenerator, UnsplashGenerator } from './unsplash';
export { waveGenerator, WaveGenerator } from './wave';

// Type exports
export type { BackgroundGeneratorDefinition } from '../types';
