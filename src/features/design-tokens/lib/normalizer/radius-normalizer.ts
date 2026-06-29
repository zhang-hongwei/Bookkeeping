import type { RadiusTokenSet, RadiusToken, CustomToken } from '../../types';
import { RADIUS_MAPPINGS } from './token-mappings';
import type { RadiusScaleName } from '../universal-schema';

export function normalizeRadius(
  rawRadius: { name: string; value: number }[],
): { radius: RadiusTokenSet; unmapped: CustomToken[] } {
  const radius: Partial<RadiusTokenSet> = {};
  const unmapped: CustomToken[] = [];
  const usedNames = new Set<RadiusScaleName>();

  for (const raw of rawRadius) {
    const mapped = resolveMapping(raw.name, raw.value);
    if (mapped && !usedNames.has(mapped)) {
      usedNames.add(mapped);
      (radius as Record<string, RadiusToken>)[mapped] = {
        universalName: mapped,
        originalName: raw.name,
        value: raw.value,
      };
    } else if (!mapped) {
      unmapped.push({
        category: 'radius',
        originalName: raw.name,
        value: `${raw.value}px`,
        reason: 'no-matching-role',
      });
    }
  }

  return { radius: radius as RadiusTokenSet, unmapped };
}

function resolveMapping(name: string, value: number): RadiusScaleName | null {
  if (value >= 9999 || value === 9999) return 'full';
  if (value === 0) return 'none';

  for (const rule of RADIUS_MAPPINGS) {
    if (rule.pattern instanceof RegExp) {
      if (rule.pattern.test(name)) return rule.target;
    } else if (name === rule.pattern) {
      return rule.target;
    }
  }

  const scaleMap: [number, RadiusScaleName][] = [
    [0, 'none'], [2, 'xs'], [4, 'sm'], [8, 'md'], [12, 'lg'], [16, 'xl'],
  ];

  let closest: RadiusScaleName = 'md';
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
