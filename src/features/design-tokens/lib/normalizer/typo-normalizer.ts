import type { RawTypographyToken } from '../parser';
import type { TypographyTokenSet, TypographyToken, CustomToken } from '../../types';
import { TYPOGRAPHY_MAPPINGS } from './token-mappings';
import { UNIVERSAL_TYPOGRAPHY_ROLES } from '../universal-schema';
import type { TypographyRoleName } from '../universal-schema';

function resolveMapping(name: string): TypographyRoleName | null {
  for (const rule of TYPOGRAPHY_MAPPINGS) {
    if (rule.pattern instanceof RegExp) {
      if (rule.pattern.test(name)) return rule.target;
    } else if (name === rule.pattern) {
      return rule.target;
    }
  }
  return null;
}

function resolveBySize(fontSize: number): TypographyRoleName {
  for (const [role, config] of Object.entries(UNIVERSAL_TYPOGRAPHY_ROLES)) {
    const [min, max] = config.sizeRange;
    if (fontSize >= min && fontSize <= max) {
      return role as TypographyRoleName;
    }
  }
  if (fontSize > 48) return 'hero';
  return 'body';
}

export function normalizeTypography(
  rawTokens: RawTypographyToken[],
): { typography: TypographyTokenSet; unmapped: CustomToken[]; primaryFont: string } {
  const typography: Partial<TypographyTokenSet> = {};
  const unmapped: CustomToken[] = [];
  const usedRoles = new Set<TypographyRoleName>();
  const fontFrequencies = new Map<string, number>();

  for (const raw of rawTokens) {
    const fontName = raw.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    fontFrequencies.set(fontName, (fontFrequencies.get(fontName) ?? 0) + 1);

    let role = resolveMapping(raw.name);
    if (!role) {
      const sizeMatch = raw.fontSize.match(/(\d+(?:\.\d+)?)/);
      if (sizeMatch) {
        role = resolveBySize(parseFloat(sizeMatch[1]));
      }
    }

    if (role && !usedRoles.has(role)) {
      usedRoles.add(role);
      (typography as Record<string, TypographyToken>)[role] = {
        universalName: role,
        originalName: raw.name,
        fontFamily: raw.fontFamily,
        fontSize: raw.fontSize,
        fontWeight: raw.fontWeight,
        lineHeight: raw.lineHeight,
        letterSpacing: raw.letterSpacing,
        textTransform: raw.textTransform as TypographyToken['textTransform'],
        fontFeature: raw.fontFeature,
      };
    } else if (!role) {
      unmapped.push({
        category: 'typography',
        originalName: raw.name,
        value: `${raw.fontFamily} ${raw.fontSize}/${raw.lineHeight}`,
        reason: 'ambiguous',
      });
    }
  }

  let primaryFont = 'system-ui, sans-serif';
  let maxCount = 0;
  for (const [font, count] of fontFrequencies) {
    if (count > maxCount) {
      maxCount = count;
      primaryFont = font;
    }
  }

  return { typography: typography as TypographyTokenSet, unmapped, primaryFont };
}
