/**
 * MUI ToggleButton Theme Designer - Presets
 * Pre-configured ToggleButton theme presets
 */

import type { ToggleButtonThemeConfig, ToggleButtonThemePreset } from "./types";

export const TOGGLEBUTTON_THEME_PRESETS: ToggleButtonThemePreset[] = [
  {
    name: "Default",
    description: "MUI Default Style",
    config: {
      root: {
        minHeight: 48,
        gap: 0,
        backgroundColor: 'transparent',
        borderRadius: '4px',
      },
      button: {
        minHeight: 48,
        paddingX: 12,
        fontSize: 14,
        fontWeight: 500,
        textTransform: 'none',
        borderRadius: '4px',
        defaultColor: 'rgba(0, 0, 0, 0.6)',
        defaultBackgroundColor: 'transparent',
        hoverColor: 'rgba(0, 0, 0, 0.87)',
        hoverBackgroundColor: 'rgba(0, 0, 0, 0.04)',
        selectedColor: '#643DFF',
        selectedBackgroundColor: 'rgba(100, 61, 255, 0.08)',
        borderColor: 'rgba(0, 0, 0, 0.23)',
        borderWidth: 1,
      },
      group: {
        gap: 0,
        backgroundColor: 'transparent',
        borderRadius: '4px',
      },
    },
  },
  {
    name: "Pill",
    description: "Pill-shaped toggle buttons",
    config: {
      root: {
        minHeight: 48,
        gap: 0,
        backgroundColor: '#F3F4F6',
        borderRadius: '24px',
      },
      button: {
        minHeight: 48,
        paddingX: 20,
        fontSize: 14,
        fontWeight: 500,
        textTransform: 'none',
        borderRadius: '20px',
        defaultColor: 'rgba(0, 0, 0, 0.6)',
        defaultBackgroundColor: 'transparent',
        hoverColor: 'rgba(0, 0, 0, 0.87)',
        hoverBackgroundColor: 'rgba(0, 0, 0, 0.04)',
        selectedColor: '#fff',
        selectedBackgroundColor: '#22C55E',
        borderColor: 'transparent',
        borderWidth: 0,
      },
      group: {
        gap: 4,
        backgroundColor: '#F3F4F6',
        borderRadius: '24px',
      },
    },
  },
  {
    name: "Rounded Block",
    description: "Rounded block style with solid background",
    config: {
      root: {
        minHeight: 40,
        gap: 0,
        backgroundColor: 'transparent',
        borderRadius: '8px',
      },
      button: {
        minHeight: 40,
        paddingX: 16,
        fontSize: 13,
        fontWeight: 600,
        textTransform: 'none',
        borderRadius: '8px',
        defaultColor: 'rgba(0, 0, 0, 0.5)',
        defaultBackgroundColor: '#F3F4F6',
        hoverColor: 'rgba(0, 0, 0, 0.7)',
        hoverBackgroundColor: '#E5E7EB',
        selectedColor: '#fff',
        selectedBackgroundColor: '#111827',
        borderColor: 'transparent',
        borderWidth: 0,
      },
      group: {
        gap: 0,
        backgroundColor: 'transparent',
        borderRadius: '8px',
      },
    },
  },
  {
    name: "Neon",
    description: "Glowing neon effect",
    config: {
      root: {
        minHeight: 48,
        gap: 0,
        backgroundColor: 'transparent',
        borderRadius: '8px',
      },
      button: {
        minHeight: 48,
        paddingX: 16,
        fontSize: 14,
        fontWeight: 500,
        textTransform: 'none',
        borderRadius: '8px',
        defaultColor: 'rgba(124, 58, 237, 0.6)',
        defaultBackgroundColor: 'transparent',
        hoverColor: 'rgba(124, 58, 237, 0.9)',
        hoverBackgroundColor: 'rgba(124, 58, 237, 0.08)',
        selectedColor: '#fff',
        selectedBackgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
        borderWidth: 2,
      },
      group: {
        gap: 4,
        backgroundColor: 'transparent',
        borderRadius: '8px',
      },
    },
  },
  {
    name: "Minimal",
    description: "Clean minimal outlined style",
    config: {
      root: {
        minHeight: 36,
        gap: 0,
        backgroundColor: 'transparent',
        borderRadius: '4px',
      },
      button: {
        minHeight: 36,
        paddingX: 12,
        fontSize: 13,
        fontWeight: 400,
        textTransform: 'none',
        borderRadius: '4px',
        defaultColor: 'rgba(0, 0, 0, 0.5)',
        defaultBackgroundColor: 'transparent',
        hoverColor: 'rgba(0, 0, 0, 0.7)',
        hoverBackgroundColor: 'transparent',
        selectedColor: '#111827',
        selectedBackgroundColor: 'transparent',
        borderColor: '#E5E7EB',
        borderWidth: 1,
      },
      group: {
        gap: 0,
        backgroundColor: 'transparent',
        borderRadius: '4px',
      },
    },
  },
];
