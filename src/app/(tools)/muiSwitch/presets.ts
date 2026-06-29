/**
 * MUI Switch Theme Presets
 * Pre-configured switch themes for common design patterns
 */

import type { SwitchThemePreset } from "./types";
import { MUI_DEFAULTS } from "./types";

export const SWITCH_THEME_PRESETS: SwitchThemePreset[] = [
  {
    name: "iOS",
    description: "Apple iOS style switch with smooth transitions",
    config: {
      root: {
        // Legacy
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        transitionDuration: "300ms",
        // New unified
        width: 51,
        height: 31,
        padding: 2,
        switchBasePadding: 0,
        translateX: 20,
      },
      thumb: {
        width: 27,
        height: 27,
        color: "#fff",
        checkedColor: "#fff",
        borderRadius: "50%",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      },
      track: {
        width: 51,
        height: 31,
        backgroundColor: "#E9E9EA",
        borderRadius: "15.5px",
        opacity: 1,
      },
      trackChecked: {
        width: 51,
        height: 31,
        backgroundColor: "#34C759",
        borderRadius: "15.5px",
        opacity: 1,
      },
      size: { thumbWidth: 27, thumbHeight: 27, trackWidth: 51, trackHeight: 31 },
    },
  },
  {
    name: "Android",
    description: "Material Design 3 style with icon indicators",
    config: {
      root: {
        // Legacy
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 8,
        paddingRight: 8,
        transitionDuration: "200ms",
        // New unified
        width: 52,
        height: 32,
        padding: 10,
        switchBasePadding: 10,
        translateX: 20,
      },
      thumb: {
        width: 16,
        height: 16,
        color: "#fff",
        checkedColor: "#fff",
        borderRadius: "50%",
        boxShadow: "none",
      },
      track: {
        width: 52,
        height: 32,
        backgroundColor: "#919EAB",
        borderRadius: "16px",
        opacity: 1,
      },
      trackChecked: {
        width: 52,
        height: 32,
        backgroundColor: "#643DFF",
        borderRadius: "16px",
        opacity: 1,
      },
      size: { thumbWidth: 16, thumbHeight: 16, trackWidth: 52, trackHeight: 32 },
    },
  },
  {
    name: "Minimal",
    description: "Clean, minimal design with subtle colors",
    config: {
      root: {
        // Legacy
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        transitionDuration: "150ms",
        // New unified
        width: 58,
        height: 32,
        padding: 8,
        switchBasePadding: 8,
        translateX: 22,
      },
      thumb: {
        width: 16,
        height: 16,
        color: "#ffffff",
        checkedColor: "#ffffff",
        borderRadius: "50%",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      },
      track: {
        width: 42,
        height: 26,
        backgroundColor: "#E0E0E0",
        borderRadius: "13px",
        opacity: 1,
      },
      trackChecked: {
        width: 42,
        height: 26,
        backgroundColor: "#757575",
        borderRadius: "13px",
        opacity: 1,
      },
      size: { thumbWidth: 16, thumbHeight: 16, trackWidth: 42, trackHeight: 26 },
    },
  },
  {
    name: "Bold",
    description: "Large, bold switch with high contrast",
    config: {
      root: {
        // Legacy
        paddingTop: 14,
        paddingBottom: 14,
        paddingLeft: 14,
        paddingRight: 14,
        transitionDuration: "250ms",
        // New unified
        width: 84,
        height: 48,
        padding: 10,
        switchBasePadding: 10,
        translateX: 32,
      },
      thumb: {
        width: 28,
        height: 28,
        color: "#fff",
        checkedColor: "#fff",
        borderRadius: "50%",
        boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
      },
      track: {
        width: 64,
        height: 38,
        backgroundColor: "#637381",
        borderRadius: "19px",
        opacity: 1,
      },
      trackChecked: {
        width: 64,
        height: 38,
        backgroundColor: "#29CCB0",
        borderRadius: "19px",
        opacity: 1,
      },
      size: { thumbWidth: 28, thumbHeight: 28, trackWidth: 64, trackHeight: 38 },
    },
  },
  {
    name: "Pill",
    description: "Pill-shaped switch with flat design",
    config: {
      root: {
        // Legacy
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 6,
        paddingRight: 6,
        transitionDuration: "200ms",
        // New unified
        width: 60,
        height: 34,
        padding: 6,
        switchBasePadding: 6,
        translateX: 26,
      },
      thumb: {
        width: 22,
        height: 22,
        color: "#fff",
        checkedColor: "#fff",
        borderRadius: "11px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      },
      track: {
        width: 48,
        height: 28,
        backgroundColor: "#DFE3E8",
        borderRadius: "14px",
        opacity: 1,
      },
      trackChecked: {
        width: 48,
        height: 28,
        backgroundColor: "#1890ff",
        borderRadius: "14px",
        opacity: 1,
      },
      size: { thumbWidth: 22, thumbHeight: 22, trackWidth: 48, trackHeight: 28 },
    },
  },
  {
    name: "Neon",
    description: "Glowing neon style switch",
    config: {
      root: {
        // Legacy
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        transitionDuration: "300ms",
        // New unified
        width: 64,
        height: 36,
        padding: 8,
        switchBasePadding: 8,
        translateX: 24,
      },
      thumb: {
        width: 20,
        height: 20,
        color: "#fff",
        checkedColor: "#fff",
        borderRadius: "50%",
        boxShadow: "0 0 10px rgba(99, 102, 241, 0.5)",
      },
      track: {
        width: 48,
        height: 28,
        backgroundColor: "#1e1b4b",
        borderRadius: "14px",
        opacity: 1,
      },
      trackChecked: {
        width: 48,
        height: 28,
        backgroundColor: "#6366f1",
        borderRadius: "14px",
        opacity: 1,
      },
      size: { thumbWidth: 20, thumbHeight: 20, trackWidth: 48, trackHeight: 28 },
    },
  },
  {
    name: "Default",
    description: "Standard MUI Switch appearance",
    config: MUI_DEFAULTS,
  },
];

export function getPresetByName(name: string): SwitchThemePreset | undefined {
  return SWITCH_THEME_PRESETS.find((preset) => preset.name === name);
}
