/**
 * CSS Animation Presets
 * Common animation configurations with keyframes
 */

import type { AnimationPreset } from './types';

export const ANIMATION_PRESETS: AnimationPreset[] = [
  {
    name: 'Fade In',
    type: 'fadeIn',
    description: 'Smooth fade in from transparent',
    config: {
      name: 'fadeIn',
      duration: 0.5,
      timingFunction: 'ease-out',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
    },
    keyframes: {
      name: 'fadeIn',
      type: 'fadeIn',
      steps: [
        { offset: 0, properties: { opacity: '0' } },
        { offset: 100, properties: { opacity: '1' } },
      ],
    },
  },
  {
    name: 'Fade Out',
    type: 'fadeOut',
    description: 'Smooth fade out to transparent',
    config: {
      name: 'fadeOut',
      duration: 0.5,
      timingFunction: 'ease-in',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
    },
    keyframes: {
      name: 'fadeOut',
      type: 'fadeOut',
      steps: [
        { offset: 0, properties: { opacity: '1' } },
        { offset: 100, properties: { opacity: '0' } },
      ],
    },
  },
  {
    name: 'Slide In Left',
    type: 'slideIn',
    description: 'Slide in from the left',
    config: {
      name: 'slideInLeft',
      duration: 0.5,
      timingFunction: 'ease-out',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
    },
    keyframes: {
      name: 'slideInLeft',
      type: 'slideIn',
      steps: [
        { offset: 0, properties: { transform: 'translateX(-100%)', opacity: '0' } },
        { offset: 100, properties: { transform: 'translateX(0)', opacity: '1' } },
      ],
    },
  },
  {
    name: 'Slide In Right',
    type: 'slideIn',
    description: 'Slide in from the right',
    config: {
      name: 'slideInRight',
      duration: 0.5,
      timingFunction: 'ease-out',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
    },
    keyframes: {
      name: 'slideInRight',
      type: 'slideIn',
      steps: [
        { offset: 0, properties: { transform: 'translateX(100%)', opacity: '0' } },
        { offset: 100, properties: { transform: 'translateX(0)', opacity: '1' } },
      ],
    },
  },
  {
    name: 'Slide In Up',
    type: 'slideIn',
    description: 'Slide in from below',
    config: {
      name: 'slideInUp',
      duration: 0.5,
      timingFunction: 'ease-out',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
    },
    keyframes: {
      name: 'slideInUp',
      type: 'slideIn',
      steps: [
        { offset: 0, properties: { transform: 'translateY(100%)', opacity: '0' } },
        { offset: 100, properties: { transform: 'translateY(0)', opacity: '1' } },
      ],
    },
  },
  {
    name: 'Slide In Down',
    type: 'slideIn',
    description: 'Slide in from above',
    config: {
      name: 'slideInDown',
      duration: 0.5,
      timingFunction: 'ease-out',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
    },
    keyframes: {
      name: 'slideInDown',
      type: 'slideIn',
      steps: [
        { offset: 0, properties: { transform: 'translateY(-100%)', opacity: '0' } },
        { offset: 100, properties: { transform: 'translateY(0)', opacity: '1' } },
      ],
    },
  },
  {
    name: 'Scale Up',
    type: 'scale',
    description: 'Scale from small to normal size',
    config: {
      name: 'scaleUp',
      duration: 0.4,
      timingFunction: 'ease-out',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
    },
    keyframes: {
      name: 'scaleUp',
      type: 'scale',
      steps: [
        { offset: 0, properties: { transform: 'scale(0)', opacity: '0' } },
        { offset: 100, properties: { transform: 'scale(1)', opacity: '1' } },
      ],
    },
  },
  {
    name: 'Scale Down',
    type: 'scale',
    description: 'Scale from large to normal size',
    config: {
      name: 'scaleDown',
      duration: 0.4,
      timingFunction: 'ease-out',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
    },
    keyframes: {
      name: 'scaleDown',
      type: 'scale',
      steps: [
        { offset: 0, properties: { transform: 'scale(1.5)', opacity: '0' } },
        { offset: 100, properties: { transform: 'scale(1)', opacity: '1' } },
      ],
    },
  },
  {
    name: 'Rotate In',
    type: 'rotate',
    description: 'Rotate in from negative angle',
    config: {
      name: 'rotateIn',
      duration: 0.5,
      timingFunction: 'ease-out',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
    },
    keyframes: {
      name: 'rotateIn',
      type: 'rotate',
      steps: [
        { offset: 0, properties: { transform: 'rotate(-200deg)', opacity: '0' } },
        { offset: 100, properties: { transform: 'rotate(0)', opacity: '1' } },
      ],
    },
  },
  {
    name: 'Bounce',
    type: 'bounce',
    description: 'Bouncing animation',
    config: {
      name: 'bounce',
      duration: 1,
      timingFunction: 'ease',
      delay: 0,
      iterationCount: 'infinite',
      direction: 'normal',
      fillMode: 'both',
      playState: 'running',
    },
    keyframes: {
      name: 'bounce',
      type: 'bounce',
      steps: [
        { offset: 0, properties: { transform: 'translateY(0)' } },
        { offset: 20, properties: { transform: 'translateY(0)' } },
        { offset: 40, properties: { transform: 'translateY(-30px)' } },
        { offset: 50, properties: { transform: 'translateY(0)' } },
        { offset: 60, properties: { transform: 'translateY(-15px)' } },
        { offset: 80, properties: { transform: 'translateY(0)' } },
        { offset: 100, properties: { transform: 'translateY(0)' } },
      ],
    },
  },
  {
    name: 'Pulse',
    type: 'pulse',
    description: 'Pulsating scale animation',
    config: {
      name: 'pulse',
      duration: 1,
      timingFunction: 'ease-in-out',
      delay: 0,
      iterationCount: 'infinite',
      direction: 'normal',
      fillMode: 'both',
      playState: 'running',
    },
    keyframes: {
      name: 'pulse',
      type: 'pulse',
      steps: [
        { offset: 0, properties: { transform: 'scale(1)' } },
        { offset: 50, properties: { transform: 'scale(1.1)' } },
        { offset: 100, properties: { transform: 'scale(1)' } },
      ],
    },
  },
  {
    name: 'Shake',
    type: 'shake',
    description: 'Horizontal shake animation',
    config: {
      name: 'shake',
      duration: 0.5,
      timingFunction: 'ease-in-out',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'both',
      playState: 'running',
    },
    keyframes: {
      name: 'shake',
      type: 'shake',
      steps: [
        { offset: 0, properties: { transform: 'translateX(0)' } },
        { offset: 10, properties: { transform: 'translateX(-10px)' } },
        { offset: 20, properties: { transform: 'translateX(10px)' } },
        { offset: 30, properties: { transform: 'translateX(-10px)' } },
        { offset: 40, properties: { transform: 'translateX(10px)' } },
        { offset: 50, properties: { transform: 'translateX(-10px)' } },
        { offset: 60, properties: { transform: 'translateX(10px)' } },
        { offset: 70, properties: { transform: 'translateX(-10px)' } },
        { offset: 80, properties: { transform: 'translateX(10px)' } },
        { offset: 90, properties: { transform: 'translateX(-10px)' } },
        { offset: 100, properties: { transform: 'translateX(0)' } },
      ],
    },
  },
  {
    name: 'Wiggle',
    type: 'wiggle',
    description: 'Playful wiggle animation',
    config: {
      name: 'wiggle',
      duration: 0.5,
      timingFunction: 'ease-in-out',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'both',
      playState: 'running',
    },
    keyframes: {
      name: 'wiggle',
      type: 'wiggle',
      steps: [
        { offset: 0, properties: { transform: 'rotate(0)' } },
        { offset: 20, properties: { transform: 'rotate(3deg)' } },
        { offset: 40, properties: { transform: 'rotate(-3deg)' } },
        { offset: 60, properties: { transform: 'rotate(3deg)' } },
        { offset: 80, properties: { transform: 'rotate(-3deg)' } },
        { offset: 100, properties: { transform: 'rotate(0)' } },
      ],
    },
  },
  {
    name: 'Heart Beat',
    type: 'heartBeat',
    description: 'Heartbeat-like pulsing animation',
    config: {
      name: 'heartBeat',
      duration: 1.3,
      timingFunction: 'ease-in-out',
      delay: 0,
      iterationCount: 'infinite',
      direction: 'normal',
      fillMode: 'both',
      playState: 'running',
    },
    keyframes: {
      name: 'heartBeat',
      type: 'heartBeat',
      steps: [
        { offset: 0, properties: { transform: 'scale(1)' } },
        { offset: 14, properties: { transform: 'scale(1.3)' } },
        { offset: 28, properties: { transform: 'scale(1)' } },
        { offset: 42, properties: { transform: 'scale(1.3)' } },
        { offset: 70, properties: { transform: 'scale(1)' } },
        { offset: 100, properties: { transform: 'scale(1)' } },
      ],
    },
  },
  {
    name: 'Flip',
    type: 'flip',
    description: '3D flip animation on X axis',
    config: {
      name: 'flip',
      duration: 0.6,
      timingFunction: 'ease-out',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
    },
    keyframes: {
      name: 'flip',
      type: 'flip',
      steps: [
        { offset: 0, properties: { transform: 'perspective(400px) rotateX(90deg)', opacity: '0' } },
        { offset: 40, properties: { transform: 'perspective(400px) rotateX(-20deg)' } },
        { offset: 60, properties: { transform: 'perspective(400px) rotateX(10deg)' } },
        { offset: 80, properties: { transform: 'perspective(400px) rotateX(-5deg)' } },
        { offset: 100, properties: { transform: 'perspective(400px) rotateX(0)', opacity: '1' } },
      ],
    },
  },
];

export const getPresetByType = (type: string): AnimationPreset | undefined => {
  return ANIMATION_PRESETS.find((preset) => preset.type === type);
};

export const getPresetByName = (name: string): AnimationPreset | undefined => {
  return ANIMATION_PRESETS.find((preset) => preset.name === name);
};
