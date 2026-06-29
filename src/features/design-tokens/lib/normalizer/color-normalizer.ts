import type { RawColorToken } from '../parser';
import type { ColorTokenSet, ColorToken, CustomToken } from '../../types';
import { COLOR_MAPPINGS } from './token-mappings';
import type { ColorRoleName } from '../universal-schema';

function hexToLightness(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return ((max + min) / 2) * 100;
}

function resolveMapping(name: string): ColorRoleName | null {
  for (const rule of COLOR_MAPPINGS) {
    if (rule.pattern instanceof RegExp) {
      if (rule.pattern.test(name)) return rule.target;
    } else if (name === rule.pattern) {
      return rule.target;
    }
  }
  return null;
}

export function normalizeColors(
  rawColors: RawColorToken[],
): { colors: ColorTokenSet; unmapped: CustomToken[]; isDarkMode: boolean; primaryColor: string } {
  const colors: Partial<ColorTokenSet> = {};
  const unmapped: CustomToken[] = [];
  const usedRoles = new Set<ColorRoleName>();

  for (const raw of rawColors) {
    const role = resolveMapping(raw.name);
    if (role && !usedRoles.has(role)) {
      usedRoles.add(role);
      const group = getGroupForRole(role);
      (colors as Record<string, ColorToken>)[role] = {
        universalName: role,
        originalName: raw.name,
        value: raw.value,
        group,
      };
    } else if (!role) {
      unmapped.push({
        category: 'color',
        originalName: raw.name,
        value: raw.value,
        reason: 'no-matching-role',
      });
    }
  }

  if (!colors.primary && rawColors.length > 0) {
    const first = rawColors[0];
    colors.primary = {
      universalName: 'primary',
      originalName: first.name,
      value: first.value,
      group: 'brand',
    };
  }

  const bgColor = colors.background?.value ?? colors.surface?.value ?? '#ffffff';
  const isDarkMode = hexToLightness(bgColor) < 40;
  const primaryColor = colors.primary?.value ?? rawColors[0]?.value ?? '#000000';

  return {
    colors: colors as ColorTokenSet,
    unmapped,
    isDarkMode,
    primaryColor,
  };
}

function getGroupForRole(role: ColorRoleName): ColorToken['group'] {
  const groupMap: Record<string, ColorToken['group']> = {
    primary: 'brand', onPrimary: 'brand', secondary: 'brand', onSecondary: 'brand',
    background: 'surface', onBackground: 'text', surface: 'surface', onSurface: 'text',
    surfaceVariant: 'surface', border: 'border', borderVariant: 'border',
    textPrimary: 'text', textSecondary: 'text', textDisabled: 'text',
    statusSuccess: 'status', statusWarning: 'status', statusError: 'status', statusInfo: 'status',
    inverse: 'inverse', onInverse: 'inverse',
  };
  return groupMap[role] ?? 'brand';
}
