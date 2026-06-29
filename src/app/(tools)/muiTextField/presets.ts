/**
 * MUI TextField Theme Designer - Presets
 * Pre-configured TextField theme presets
 */

import type { TextFieldThemeConfig, TextFieldThemePreset } from "./types";

export const TEXTFIELD_THEME_PRESETS: TextFieldThemePreset[] = [
  {
    name: "Default",
    description: "MUI Default Style",
    config: {
      root: {
        backgroundColor: 'transparent',
        borderRadius: '4px',
      },
      inputBase: {
        height: 56,
        padding: 16.5,
        fontSize: 16,
        fontWeight: 400,
        color: 'rgba(0, 0, 0, 0.87)',
      },
      outlined: {
        borderColor: 'rgba(0, 0, 0, 0.23)',
        borderWidth: 1,
        borderRadius: '4px',
        hoverBorderColor: 'rgba(0, 0, 0, 0.87)',
        focusBorderColor: '#643DFF',
        errorBorderColor: '#d32f2f',
      },
      filled: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        hoverBackgroundColor: 'rgba(0, 0, 0, 0.09)',
        focusBackgroundColor: 'rgba(0, 0, 0, 0.13)',
        borderRadius: '4px',
      },
      standard: {
        borderBottomColor: 'rgba(0, 0, 0, 0.42)',
        borderBottomWidth: 1,
        hoverBorderBottomColor: 'rgba(0, 0, 0, 0.87)',
        focusBorderBottomColor: '#643DFF',
      },
      label: {
        fontSize: 16,
        fontWeight: 400,
        color: 'rgba(0, 0, 0, 0.6)',
        focusColor: '#643DFF',
        errorColor: '#d32f2f',
        shrinkOffset: 9,
      },
      helperText: {
        fontSize: 12,
        color: 'rgba(0, 0, 0, 0.6)',
        errorColor: '#d32f2f',
      },
      adornment: {
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: 24,
      },
      variant: 'outlined',
    },
  },
  {
    name: "Rounded",
    description: "Fully rounded pill shape",
    config: {
      root: {
        backgroundColor: 'transparent',
        borderRadius: '24px',
      },
      inputBase: {
        height: 56,
        padding: 16.5,
        fontSize: 16,
        fontWeight: 400,
        color: 'rgba(0, 0, 0, 0.87)',
      },
      outlined: {
        borderColor: '#22C55E',
        borderWidth: 2,
        borderRadius: '24px',
        hoverBorderColor: '#16A34A',
        focusBorderColor: '#15803D',
        errorBorderColor: '#d32f2f',
      },
      filled: {
        backgroundColor: '#F0FDF4',
        hoverBackgroundColor: '#DCFCE7',
        focusBackgroundColor: '#BBF7D0',
        borderRadius: '24px',
      },
      standard: {
        borderBottomColor: '#22C55E',
        borderBottomWidth: 2,
        hoverBorderBottomColor: '#16A34A',
        focusBorderBottomColor: '#15803D',
      },
      label: {
        fontSize: 15,
        fontWeight: 500,
        color: '#22C55E',
        focusColor: '#15803D',
        errorColor: '#d32f2f',
        shrinkOffset: 9,
      },
      helperText: {
        fontSize: 12,
        color: 'rgba(34, 197, 94, 0.7)',
        errorColor: '#d32f2f',
      },
      adornment: {
        color: '#22C55E',
        fontSize: 22,
      },
      variant: 'outlined',
    },
  },
  {
    name: "Minimal",
    description: "Clean and minimal border",
    config: {
      root: {
        backgroundColor: 'transparent',
        borderRadius: '2px',
      },
      inputBase: {
        height: 48,
        padding: 12,
        fontSize: 14,
        fontWeight: 400,
        color: 'rgba(0, 0, 0, 0.87)',
      },
      outlined: {
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: '2px',
        hoverBorderColor: '#9CA3AF',
        focusBorderColor: '#111827',
        errorBorderColor: '#EF4444',
      },
      filled: {
        backgroundColor: '#F9FAFB',
        hoverBackgroundColor: '#F3F4F6',
        focusBackgroundColor: '#E5E7EB',
        borderRadius: '2px',
      },
      standard: {
        borderBottomColor: '#E5E7EB',
        borderBottomWidth: 1,
        hoverBorderBottomColor: '#9CA3AF',
        focusBorderBottomColor: '#111827',
      },
      label: {
        fontSize: 14,
        fontWeight: 400,
        color: 'rgba(0, 0, 0, 0.5)',
        focusColor: '#111827',
        errorColor: '#EF4444',
        shrinkOffset: 7,
      },
      helperText: {
        fontSize: 11,
        color: 'rgba(0, 0, 0, 0.5)',
        errorColor: '#EF4444',
      },
      adornment: {
        color: 'rgba(0, 0, 0, 0.4)',
        fontSize: 20,
      },
      variant: 'outlined',
    },
  },
  {
    name: "Dark",
    description: "Dark mode optimized",
    config: {
      root: {
        backgroundColor: 'transparent',
        borderRadius: '8px',
      },
      inputBase: {
        height: 56,
        padding: 16.5,
        fontSize: 16,
        fontWeight: 400,
        color: '#E5E7EB',
      },
      outlined: {
        borderColor: '#374151',
        borderWidth: 1,
        borderRadius: '8px',
        hoverBorderColor: '#4B5563',
        focusBorderColor: '#8B5CF6',
        errorBorderColor: '#F87171',
      },
      filled: {
        backgroundColor: '#1F2937',
        hoverBackgroundColor: '#374151',
        focusBackgroundColor: '#4B5563',
        borderRadius: '8px',
      },
      standard: {
        borderBottomColor: '#374151',
        borderBottomWidth: 1,
        hoverBorderBottomColor: '#4B5563',
        focusBorderBottomColor: '#8B5CF6',
      },
      label: {
        fontSize: 16,
        fontWeight: 400,
        color: '#9CA3AF',
        focusColor: '#A78BFA',
        errorColor: '#F87171',
        shrinkOffset: 9,
      },
      helperText: {
        fontSize: 12,
        color: '#9CA3AF',
        errorColor: '#F87171',
      },
      adornment: {
        color: '#9CA3AF',
        fontSize: 24,
      },
      variant: 'outlined',
    },
  },
  {
    name: "Neon",
    description: "Glowing neon effect",
    config: {
      root: {
        backgroundColor: 'transparent',
        borderRadius: '8px',
      },
      inputBase: {
        height: 56,
        padding: 16.5,
        fontSize: 16,
        fontWeight: 500,
        color: '#E5E7EB',
      },
      outlined: {
        borderColor: '#7C3AED',
        borderWidth: 2,
        borderRadius: '8px',
        hoverBorderColor: '#8B5CF6',
        focusBorderColor: '#A78BFA',
        errorBorderColor: '#F87171',
      },
      filled: {
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        hoverBackgroundColor: 'rgba(124, 58, 237, 0.15)',
        focusBackgroundColor: 'rgba(124, 58, 237, 0.2)',
        borderRadius: '8px',
      },
      standard: {
        borderBottomColor: '#7C3AED',
        borderBottomWidth: 2,
        hoverBorderBottomColor: '#8B5CF6',
        focusBorderBottomColor: '#A78BFA',
      },
      label: {
        fontSize: 15,
        fontWeight: 500,
        color: '#A78BFA',
        focusColor: '#C4B5FD',
        errorColor: '#F87171',
        shrinkOffset: 9,
      },
      helperText: {
        fontSize: 12,
        color: '#A78BFA',
        errorColor: '#F87171',
      },
      adornment: {
        color: '#A78BFA',
        fontSize: 22,
      },
      variant: 'outlined',
    },
  },
];
