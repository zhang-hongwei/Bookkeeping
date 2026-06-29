/**
 * Background Presets
 * Pre-configured settings for quick background generation
 */

import type { GeneratorPreset } from './types';

// Color palettes
export const COLOR_PALETTES = {
  // Nature inspired
  forest: ['#2d5a27', '#4a7c31', '#6b8e23', '#8fbc8f'],
  ocean: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'],
  sunset: ['#ff7e5f', '#feb47b', '#ff6a88', '#ff99ac'],
  aurora: ['#00ff88', '#00ccff', '#9d4edd', '#ff006e'],

  // Dark & moody
  midnight: ['#0c0c1e', '#1a1a3e', '#2d2d5a', '#4a4a8a'],
  cyberpunk: ['#ff00ff', '#00ffff', '#ff6600', '#ffff00'],
  noir: ['#1a1a1a', '#2d2d2d', '#404040', '#595959'],

  // Light & clean
  minimal: ['#ffffff', '#f5f5f5', '#e0e0e0', '#bdbdbd'],
  pastel: ['#ffd1dc', '#aec6cf', '#c3b1e1', '#fffacd'],
  cream: ['#f5f5dc', '#faebd7', '#ffe4c4', '#ffefd5'],

  // Vibrant
  neon: ['#ff0080', '#00ff00', '#00ffff', '#ff00ff'],
  candy: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3'],
  prism: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'],

  // Professional
  corporate: ['#1e3a5f', '#3d5a80', '#98c1d9', '#e0fbfc'],
  startup: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
};

// Canvas size presets
export const getCanvasPresets = () => [
  { width: 1920, height: 1080, label: 'Full HD (1920×1080)', category: 'desktop' },
  { width: 2560, height: 1440, label: '2K QHD (2560×1440)', category: 'desktop' },
  { width: 3840, height: 2160, label: '4K UHD (3840×2160)', category: 'desktop' },
  { width: 1280, height: 720, label: 'HD (1280×720)', category: 'desktop' },
  { width: 1366, height: 768, label: 'Laptop (1366×768)', category: 'desktop' },
  { width: 1200, height: 630, label: 'OG Image (1200×630)', category: 'social' },
  { width: 1500, height: 500, label: 'Twitter Banner (1500×500)', category: 'social' },
  { width: 820, height: 312, label: 'Facebook Cover (820×312)', category: 'social' },
  { width: 1080, height: 1920, label: 'Phone (1080×1920)', category: 'mobile' },
  { width: 1080, height: 1080, label: 'Square (1080×1080)', category: 'social' },
  { width: 800, height: 600, label: '4:3 (800×600)', category: 'desktop' },
  { width: 600, height: 800, label: '3:4 (600×800)', category: 'mobile' },
];

// Trianglify presets
export const TRIANGLIFY_PRESETS: GeneratorPreset[] = [
  {
    name: 'Classic',
    config: { cellSize: 75, variance: 50 },
  },
  {
    name: 'Fine Mesh',
    config: { cellSize: 40, variance: 30 },
  },
  {
    name: 'Large Cells',
    config: { cellSize: 120, variance: 40 },
  },
  {
    name: 'Chaos',
    config: { cellSize: 60, variance: 90 },
  },
  {
    name: 'Ordered',
    config: { cellSize: 80, variance: 10 },
  },
];

// Particles presets
export const PARTICLES_PRESETS: GeneratorPreset[] = [
  {
    name: 'Sparse',
    config: { count: 50, minSize: 2, maxSize: 10 },
  },
  {
    name: 'Dense',
    config: { count: 300, minSize: 1, maxSize: 5 },
  },
  {
    name: 'Large',
    config: { count: 30, minSize: 20, maxSize: 60 },
  },
  {
    name: 'Uniform',
    config: { count: 100, minSize: 10, maxSize: 10 },
  },
  {
    name: 'Varied',
    config: { count: 80, minSize: 2, maxSize: 40 },
  },
];

// Topography presets
export const TOPOGRAPHY_PRESETS: GeneratorPreset[] = [
  {
    name: 'Gentle Hills',
    config: { layers: 6, amplitude: 30, frequency: 2 },
  },
  {
    name: 'Mountains',
    config: { layers: 12, amplitude: 80, frequency: 4 },
  },
  {
    name: 'Rolling',
    config: { layers: 8, amplitude: 40, frequency: 1.5 },
  },
  {
    name: 'Sharp Peaks',
    config: { layers: 10, amplitude: 60, frequency: 6 },
  },
  {
    name: 'Minimal',
    config: { layers: 4, amplitude: 20, frequency: 1 },
  },
];

// Gradient presets
export const GRADIENT_PRESETS: GeneratorPreset[] = [
  {
    name: 'Diagonal',
    config: { type: 'linear', angle: 135 },
  },
  {
    name: 'Vertical',
    config: { type: 'linear', angle: 180 },
  },
  {
    name: 'Horizontal',
    config: { type: 'linear', angle: 90 },
  },
  {
    name: 'Radial Center',
    config: { type: 'radial', centerX: 50, centerY: 50 },
  },
  {
    name: 'Radial Corner',
    config: { type: 'radial', centerX: 0, centerY: 0 },
  },
];

// Unsplash query presets
export const UNSPLASH_PRESETS: GeneratorPreset[] = [
  {
    name: 'Nature',
    config: { query: 'nature' },
  },
  {
    name: 'Abstract',
    config: { query: 'abstract' },
  },
  {
    name: 'Technology',
    config: { query: 'technology' },
  },
  {
    name: 'Architecture',
    config: { query: 'architecture' },
  },
  {
    name: 'Space',
    config: { query: 'galaxy stars' },
  },
  {
    name: 'Texture',
    config: { query: 'texture pattern' },
  },
  {
    name: 'Minimal',
    config: { query: 'minimal' },
  },
  {
    name: 'Dark',
    config: { query: 'dark moody' },
  },
];
