/**
 * MUI Tabs Theme Designer - Presets
 * Pre-configured Tabs theme presets
 */

import type { TabsThemeConfig, TabsThemePreset } from "./types";

export const TABS_THEME_PRESETS: TabsThemePreset[] = [
  {
    name: "Default",
    description: "MUI Default Style",
    config: {
      root: {
        minHeight: 48,
        backgroundColor: 'transparent',
      },
      tab: {
        minHeight: 48,
        paddingX: 12,
        fontSize: 14,
        fontWeight: 500,
        textTransform: 'none',
        color: 'rgba(0, 0, 0, 0.6)',
        hoverColor: 'rgba(0, 0, 0, 0.87)',
        selectedColor: '#643DFF',
        selectedBackgroundColor: 'transparent',
        borderRadius: '4px',
      },
      indicator: {
        height: 2,
        backgroundColor: '#643DFF',
        borderRadius: '2px',
        transitionDuration: '250ms',
      },
      flexContainer: {
        gap: 0,
      },
      scrollButtons: {
        color: 'rgba(0, 0, 0, 0.6)',
      },
      orientation: 'horizontal',
      variant: 'standard',
    },
  },
  {
    name: "Pill",
    description: "Pill-shaped tabs with background",
    config: {
      root: {
        minHeight: 48,
        backgroundColor: '#F3F4F6',
      },
      tab: {
        minHeight: 48,
        paddingX: 20,
        fontSize: 14,
        fontWeight: 500,
        textTransform: 'none',
        color: 'rgba(0, 0, 0, 0.6)',
        hoverColor: 'rgba(0, 0, 0, 0.87)',
        selectedColor: '#fff',
        selectedBackgroundColor: '#22C55E',
        borderRadius: '24px',
      },
      indicator: {
        height: 0,
        backgroundColor: 'transparent',
        borderRadius: '0',
        transitionDuration: '200ms',
      },
      flexContainer: {
        gap: 8,
      },
      scrollButtons: {
        color: 'rgba(0, 0, 0, 0.5)',
      },
      orientation: 'horizontal',
      variant: 'standard',
    },
  },
  {
    name: "Underline Bold",
    description: "Bold underline indicator",
    config: {
      root: {
        minHeight: 56,
        backgroundColor: 'transparent',
      },
      tab: {
        minHeight: 56,
        paddingX: 16,
        fontSize: 15,
        fontWeight: 600,
        textTransform: 'none',
        color: 'rgba(0, 0, 0, 0.5)',
        hoverColor: 'rgba(0, 0, 0, 0.8)',
        selectedColor: '#111827',
        selectedBackgroundColor: 'transparent',
        borderRadius: '0',
      },
      indicator: {
        height: 4,
        backgroundColor: '#111827',
        borderRadius: '2px',
        transitionDuration: '200ms',
      },
      flexContainer: {
        gap: 0,
      },
      scrollButtons: {
        color: 'rgba(0, 0, 0, 0.5)',
      },
      orientation: 'horizontal',
      variant: 'standard',
    },
  },
  {
    name: "Neon",
    description: "Glowing neon effect",
    config: {
      root: {
        minHeight: 48,
        backgroundColor: 'transparent',
      },
      tab: {
        minHeight: 48,
        paddingX: 16,
        fontSize: 14,
        fontWeight: 500,
        textTransform: 'none',
        color: 'rgba(124, 58, 237, 0.6)',
        hoverColor: 'rgba(124, 58, 237, 0.9)',
        selectedColor: '#fff',
        selectedBackgroundColor: 'transparent',
        borderRadius: '4px',
      },
      indicator: {
        height: 3,
        backgroundColor: '#8B5CF6',
        borderRadius: '2px',
        transitionDuration: '250ms',
      },
      flexContainer: {
        gap: 4,
      },
      scrollButtons: {
        color: 'rgba(124, 58, 237, 0.7)',
      },
      orientation: 'horizontal',
      variant: 'standard',
    },
  },
  {
    name: "Minimal",
    description: "Clean minimal design",
    config: {
      root: {
        minHeight: 40,
        backgroundColor: 'transparent',
      },
      tab: {
        minHeight: 40,
        paddingX: 12,
        fontSize: 13,
        fontWeight: 400,
        textTransform: 'none',
        color: 'rgba(0, 0, 0, 0.4)',
        hoverColor: 'rgba(0, 0, 0, 0.7)',
        selectedColor: '#111827',
        selectedBackgroundColor: 'transparent',
        borderRadius: '0',
      },
      indicator: {
        height: 1,
        backgroundColor: '#111827',
        borderRadius: '0',
        transitionDuration: '150ms',
      },
      flexContainer: {
        gap: 0,
      },
      scrollButtons: {
        color: 'rgba(0, 0, 0, 0.4)',
      },
      orientation: 'horizontal',
      variant: 'standard',
    },
  },
];
