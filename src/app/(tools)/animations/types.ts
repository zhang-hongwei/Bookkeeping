/**
 * CSS Animation Types
 * Type definitions for animation generator
 */

export type AnimationType =
  | 'fadeIn'
  | 'fadeOut'
  | 'slideIn'
  | 'slideOut'
  | 'scale'
  | 'rotate'
  | 'bounce'
  | 'pulse'
  | 'shake'
  | 'wiggle'
  | 'swing'
  | 'tada'
  | 'wobble'
  | 'jello'
  | 'heartBeat'
  | 'flip'
  | 'rubberBand'
  | 'flash'
  | 'custom';

export type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
export type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both';
export type TimingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier';

export interface AnimationConfig {
  name: string;
  duration: number; // in seconds
  timingFunction: TimingFunction;
  delay: number; // in seconds
  iterationCount: number | 'infinite';
  direction: AnimationDirection;
  fillMode: AnimationFillMode;
  playState: 'running' | 'paused';
}

export interface KeyframeStep {
  offset: number; // 0-100
  properties: Record<string, string>;
}

export interface KeyframeDefinition {
  name: string;
  type: AnimationType;
  steps: KeyframeStep[];
  description?: string;
}

export interface AnimationPreset {
  name: string;
  type: AnimationType;
  description: string;
  config: AnimationConfig;
  keyframes: KeyframeDefinition;
}

export type AnimationExportFormat = 'css' | 'scss' | 'tailwind' | 'json';
