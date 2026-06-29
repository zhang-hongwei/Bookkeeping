/**
 * Easing Presets
 * Common cubic-bezier easing functions
 */

import type { EasingPreset } from './types';

export const EASING_PRESETS: EasingPreset[] = [
  {
    name: 'linear',
    description: 'Constant speed',
    config: {
      name: 'linear',
      p1: { x: 0, y: 0 },
      p2: { x: 1, y: 1 },
    },
    cssValue: 'linear',
  },
  {
    name: 'ease',
    description: 'Default CSS easing',
    config: {
      name: 'ease',
      p1: { x: 0.25, y: 0.1 },
      p2: { x: 0.25, y: 1 },
    },
    cssValue: 'ease',
  },
  {
    name: 'ease-in',
    description: 'Slow start, then fast',
    config: {
      name: 'ease-in',
      p1: { x: 0.42, y: 0 },
      p2: { x: 1, y: 1 },
    },
    cssValue: 'ease-in',
  },
  {
    name: 'ease-out',
    description: 'Fast start, then slow',
    config: {
      name: 'ease-out',
      p1: { x: 0, y: 0 },
      p2: { x: 0.58, y: 1 },
    },
    cssValue: 'ease-out',
  },
  {
    name: 'ease-in-out',
    description: 'Slow start and end',
    config: {
      name: 'ease-in-out',
      p1: { x: 0.42, y: 0 },
      p2: { x: 0.58, y: 1 },
    },
    cssValue: 'ease-in-out',
  },
  {
    name: 'ease-in-quad',
    description: 'Quadratic acceleration',
    config: {
      name: 'ease-in-quad',
      p1: { x: 0.55, y: 0.085 },
      p2: { x: 0.68, y: 0.53 },
    },
    cssValue: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  },
  {
    name: 'ease-in-cubic',
    description: 'Cubic acceleration',
    config: {
      name: 'ease-in-cubic',
      p1: { x: 0.55, y: 0.055 },
      p2: { x: 0.675, y: 0.19 },
    },
    cssValue: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  },
  {
    name: 'ease-in-expo',
    description: 'Exponential acceleration',
    config: {
      name: 'ease-in-expo',
      p1: { x: 0.7, y: 0 },
      p2: { x: 0.84, y: 0.19 },
    },
    cssValue: 'cubic-bezier(0.7, 0, 0.84, 0.19)',
  },
  {
    name: 'ease-out-quad',
    description: 'Quadratic deceleration',
    config: {
      name: 'ease-out-quad',
      p1: { x: 0.25, y: 0.46 },
      p2: { x: 0.45, y: 0.94 },
    },
    cssValue: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  {
    name: 'ease-out-cubic',
    description: 'Cubic deceleration',
    config: {
      name: 'ease-out-cubic',
      p1: { x: 0.215, y: 0.61 },
      p2: { x: 0.355, y: 1 },
    },
    cssValue: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  },
  {
    name: 'ease-out-expo',
    description: 'Exponential deceleration',
    config: {
      name: 'ease-out-expo',
      p1: { x: 0.16, y: 0.84 },
      p2: { x: 0.44, y: 1 },
    },
    cssValue: 'cubic-bezier(0.16, 0.84, 0.44, 1)',
  },
  {
    name: 'ease-in-out-quad',
    description: 'Quadratic smooth',
    config: {
      name: 'ease-in-out-quad',
      p1: { x: 0.455, y: 0.03 },
      p2: { x: 0.515, y: 0.955 },
    },
    cssValue: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  },
  {
    name: 'ease-in-out-cubic',
    description: 'Cubic smooth',
    config: {
      name: 'ease-in-out-cubic',
      p1: { x: 0.645, y: 0.045 },
      p2: { x: 0.355, y: 1 },
    },
    cssValue: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  },
  {
    name: 'ease-in-out-back',
    description: 'Overshoot both ends',
    config: {
      name: 'ease-in-out-back',
      p1: { x: 0.68, y: -0.55 },
      p2: { x: 0.27, y: 1.55 },
    },
    cssValue: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
  },
  {
    name: 'spring',
    description: 'Spring-like bounce',
    config: {
      name: 'spring',
      p1: { x: 0.5, y: 1.5 },
      p2: { x: 0.5, y: 0.8 },
    },
    cssValue: 'cubic-bezier(0.5, 1.5, 0.5, 0.8)',
  },
];

export const getPresetByName = (name: string): EasingPreset | undefined => {
  return EASING_PRESETS.find((preset) => preset.name === name);
};
