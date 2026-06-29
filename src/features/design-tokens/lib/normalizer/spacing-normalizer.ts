import type { SpacingTokenSet, SpacingToken, CustomToken } from '../../types';
import { SPACING_MAPPINGS } from './token-mappings';
import type { SpacingScaleName } from '../universal-schema';

export function normalizeSpacing(
  rawSpacing: { name: string; value: number }[],
): { spacing: SpacingTokenSet; unmapped: CustomToken[] } {
  const spacing: Partial<SpacingTokenSet> = {};
  const unmapped: CustomToken[] = [];
  const usedNames = new Set<SpacingScaleName>();

  for (const raw of rawSpacing) {
    const mapped = resolveMapping(raw.name, raw.value);
    if (mapped && !usedNames.has(mapped)) {
      usedNames.add(mapped);
      (spacing as Record<string, SpacingToken>)[mapped] = {
        universalName: mapped,
        originalName: raw.name,
        value: raw.value,
      };
    } else if (!mapped) {
      unmapped.push({
        category: 'spacing',
        originalName: raw.name,
        value: `${raw.value}px`,
        reason: 'no-matching-role',
      });
    }
  }

  return { spacing: spacing as SpacingTokenSet, unmapped };
}

function resolveMapping(name: string, value: number): SpacingScaleName | null {
  for (const rule of SPACING_MAPPINGS) {
    if (rule.pattern instanceof RegExp) {
      if (rule.pattern.test(name)) return rule.target;
    } else if (name === rule.pattern) {
      return rule.target;
    }
  }

  const scaleMap: [number, SpacingScaleName][] = [
    [4, 'xxs'], [8, 'xs'], [12, 'sm'], [16, 'md'], [24, 'lg'],
    [32, 'xl'], [48, 'xxl'], [64, 'xxxl'], [96, 'section'],
  ];

  let closest: SpacingScaleName | null = null;
  let minDiff = Infinity;
  for (const [targetVal, targetName] of scaleMap) {
    const diff = Math.abs(value - targetVal);
    if (diff < minDiff) {
      minDiff = diff;
      closest = targetName;
    }
  }
  return closest;
}
