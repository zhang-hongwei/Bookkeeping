/**
 * Clip Path Presets
 * Common clip path shapes organized by category
 */

import type { ClipPathPreset } from "./types";

export const POLYGON_PRESETS: ClipPathPreset[] = [
  {
    name: "Triangle",
    description: "Equilateral triangle",
    config: {
      type: "polygon",
      points: [
        { x: 50, y: 5 },
        { x: 95, y: 95 },
        { x: 5, y: 95 },
      ],
    },
  },
  {
    name: "Trapezoid",
    description: "Trapezoid shape",
    config: {
      type: "polygon",
      points: [
        { x: 20, y: 0 },
        { x: 80, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
    },
  },
  {
    name: "Parallelogram",
    description: "Parallelogram shape",
    config: {
      type: "polygon",
      points: [
        { x: 25, y: 0 },
        { x: 100, y: 0 },
        { x: 75, y: 100 },
        { x: 0, y: 100 },
      ],
    },
  },
  {
    name: "Rhombus",
    description: "Diamond/rhombus shape",
    config: {
      type: "polygon",
      points: [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ],
    },
  },
  {
    name: "Pentagon",
    description: "5-sided polygon",
    config: {
      type: "polygon",
      points: [
        { x: 50, y: 0 },
        { x: 100, y: 38 },
        { x: 82, y: 100 },
        { x: 18, y: 100 },
        { x: 0, y: 38 },
      ],
    },
  },
  {
    name: "Hexagon",
    description: "6-sided polygon",
    config: {
      type: "polygon",
      points: [
        { x: 25, y: 0 },
        { x: 75, y: 0 },
        { x: 100, y: 50 },
        { x: 75, y: 100 },
        { x: 25, y: 100 },
        { x: 0, y: 50 },
      ],
    },
  },
  {
    name: "Heptagon",
    description: "7-sided polygon",
    config: {
      type: "polygon",
      points: [
        { x: 50, y: 0 },
        { x: 90, y: 20 },
        { x: 100, y: 60 },
        { x: 75, y: 100 },
        { x: 25, y: 100 },
        { x: 0, y: 60 },
        { x: 10, y: 20 },
      ],
    },
  },
  {
    name: "Octagon",
    description: "8-sided polygon",
    config: {
      type: "polygon",
      points: [
        { x: 30, y: 0 },
        { x: 70, y: 0 },
        { x: 100, y: 30 },
        { x: 100, y: 70 },
        { x: 70, y: 100 },
        { x: 30, y: 100 },
        { x: 0, y: 70 },
        { x: 0, y: 30 },
      ],
    },
  },
  {
    name: "Nonagon",
    description: "9-sided polygon",
    config: {
      type: "polygon",
      points: Array.from({ length: 9 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 9 - Math.PI / 2;
        return { x: +(50 + 50 * Math.cos(angle)).toFixed(1), y: +(50 + 50 * Math.sin(angle)).toFixed(1) };
      }),
    },
  },
  {
    name: "Decagon",
    description: "10-sided polygon",
    config: {
      type: "polygon",
      points: Array.from({ length: 10 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
        return { x: +(50 + 50 * Math.cos(angle)).toFixed(1), y: +(50 + 50 * Math.sin(angle)).toFixed(1) };
      }),
    },
  },
  {
    name: "Bevel",
    description: "Beveled corners",
    config: {
      type: "polygon",
      points: [
        { x: 15, y: 0 },
        { x: 85, y: 0 },
        { x: 100, y: 15 },
        { x: 100, y: 85 },
        { x: 85, y: 100 },
        { x: 15, y: 100 },
        { x: 0, y: 85 },
        { x: 0, y: 15 },
      ],
    },
  },
  {
    name: "Rabbet",
    description: "Rabbet (notched) corners",
    config: {
      type: "polygon",
      points: [
        { x: 0, y: 0 },
        { x: 85, y: 0 },
        { x: 100, y: 15 },
        { x: 100, y: 100 },
        { x: 15, y: 100 },
        { x: 0, y: 85 },
      ],
    },
  },
  {
    name: "Left Arrow",
    description: "Arrow pointing left",
    config: {
      type: "polygon",
      points: [
        { x: 0, y: 50 },
        { x: 40, y: 0 },
        { x: 40, y: 20 },
        { x: 100, y: 20 },
        { x: 100, y: 80 },
        { x: 40, y: 80 },
        { x: 40, y: 100 },
      ],
    },
  },
  {
    name: "Right Arrow",
    description: "Arrow pointing right",
    config: {
      type: "polygon",
      points: [
        { x: 0, y: 20 },
        { x: 60, y: 20 },
        { x: 60, y: 0 },
        { x: 100, y: 50 },
        { x: 60, y: 100 },
        { x: 60, y: 80 },
        { x: 0, y: 80 },
      ],
    },
  },
  {
    name: "Left Point",
    description: "Pointed left side",
    config: {
      type: "polygon",
      points: [
        { x: 0, y: 50 },
        { x: 40, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 40, y: 100 },
      ],
    },
  },
  {
    name: "Right Point",
    description: "Pointed right side",
    config: {
      type: "polygon",
      points: [
        { x: 0, y: 0 },
        { x: 60, y: 0 },
        { x: 100, y: 50 },
        { x: 60, y: 100 },
        { x: 0, y: 100 },
      ],
    },
  },
  {
    name: "Left Chevron",
    description: "Chevron pointing left",
    config: {
      type: "polygon",
      points: [
        { x: 40, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 40, y: 100 },
        { x: 0, y: 50 },
      ],
    },
  },
  {
    name: "Right Chevron",
    description: "Chevron pointing right",
    config: {
      type: "polygon",
      points: [
        { x: 0, y: 0 },
        { x: 60, y: 0 },
        { x: 100, y: 50 },
        { x: 60, y: 100 },
        { x: 0, y: 100 },
      ],
    },
  },
  {
    name: "Star",
    description: "5-pointed star",
    config: {
      type: "polygon",
      points: [
        { x: 50, y: 0 },
        { x: 61, y: 35 },
        { x: 98, y: 35 },
        { x: 68, y: 57 },
        { x: 79, y: 91 },
        { x: 50, y: 70 },
        { x: 21, y: 91 },
        { x: 32, y: 57 },
        { x: 2, y: 35 },
        { x: 39, y: 35 },
      ],
    },
  },
  {
    name: "Cross",
    description: "Plus sign shape",
    config: {
      type: "polygon",
      points: [
        { x: 35, y: 0 },
        { x: 65, y: 0 },
        { x: 65, y: 35 },
        { x: 100, y: 35 },
        { x: 100, y: 65 },
        { x: 65, y: 65 },
        { x: 65, y: 100 },
        { x: 35, y: 100 },
        { x: 35, y: 65 },
        { x: 0, y: 65 },
        { x: 0, y: 35 },
        { x: 35, y: 35 },
      ],
    },
  },
  {
    name: "Message",
    description: "Chat bubble shape",
    config: {
      type: "polygon",
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 70 },
        { x: 70, y: 70 },
        { x: 50, y: 100 },
        { x: 50, y: 70 },
        { x: 0, y: 70 },
      ],
    },
  },
  {
    name: "Close",
    description: "Close/X shape",
    config: {
      type: "polygon",
      points: [
        { x: 0, y: 0 },
        { x: 40, y: 0 },
        { x: 50, y: 10 },
        { x: 60, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 40 },
        { x: 90, y: 50 },
        { x: 100, y: 60 },
        { x: 100, y: 100 },
        { x: 60, y: 100 },
        { x: 50, y: 90 },
        { x: 40, y: 100 },
        { x: 0, y: 100 },
        { x: 0, y: 60 },
        { x: 10, y: 50 },
        { x: 0, y: 40 },
      ],
    },
  },
  {
    name: "Frame",
    description: "Frame/border shape",
    config: {
      type: "polygon",
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
        { x: 0, y: 0 },
        { x: 15, y: 15 },
        { x: 15, y: 85 },
        { x: 85, y: 85 },
        { x: 85, y: 15 },
        { x: 15, y: 15 },
      ],
    },
  },
  {
    name: "Heart",
    description: "Heart shape",
    config: {
      type: "polygon",
      points: [
        { x: 50, y: 15 },
        { x: 65, y: 0 },
        { x: 85, y: 0 },
        { x: 100, y: 15 },
        { x: 100, y: 35 },
        { x: 50, y: 100 },
        { x: 0, y: 35 },
        { x: 0, y: 15 },
        { x: 15, y: 0 },
        { x: 35, y: 0 },
      ],
    },
  },
];

// All presets including basic shapes
export const CLIP_PATH_PRESETS: ClipPathPreset[] = [
  {
    name: "None",
    description: "No clipping",
    config: { type: "none" },
  },
  {
    name: "Circle",
    description: "Perfect circle",
    config: {
      type: "circle",
      radius: 50,
      positionX: 50,
      positionY: 50,
    },
  },
  {
    name: "Ellipse",
    description: "Oval shape",
    config: {
      type: "ellipse",
      radiusX: 40,
      radiusY: 50,
      positionX: 50,
      positionY: 50,
    },
  },
  ...POLYGON_PRESETS,
];

export const getPresetByName = (name: string): ClipPathPreset | undefined => {
  return CLIP_PATH_PRESETS.find((preset) => preset.name === name);
};
