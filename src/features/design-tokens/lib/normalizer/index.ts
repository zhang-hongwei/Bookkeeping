import type { RawParsedBrand } from '../parser';
import type { BrandDesignSystem, ComponentToken, CustomToken, TokenCategory } from '../../types';
import { normalizeColors } from './color-normalizer';
import { normalizeTypography } from './typo-normalizer';
import { normalizeSpacing } from './spacing-normalizer';
import { normalizeRadius } from './radius-normalizer';

function normalizeComponents(raw: RawParsedBrand, colors: Record<string, string>): ComponentToken[] {
  return raw.components.map((c) => ({
    universalName: c.name,
    originalName: c.name,
    backgroundColor: resolveRef(c.backgroundColor, colors) ?? c.backgroundColor,
    textColor: resolveRef(c.textColor, colors) ?? c.textColor,
    typography: c.typography?.replace(/^\{typography\.(.+)\}$/, '$1'),
    rounded: c.rounded?.replace(/^\{rounded\.(.+)\}$/, '$1'),
    padding: c.padding,
    height: c.height,
    size: c.size,
  }));
}

function resolveRef(value: string | undefined, colors: Record<string, string>): string | undefined {
  if (!value) return undefined;
  if (value === 'transparent') return 'transparent';
  const match = value.match(/^\{colors\.(.+)\}$/);
  if (match) return colors[match[1]];
  return undefined;
}

export function normalizeBrand(raw: RawParsedBrand): BrandDesignSystem {
  const colorResult = normalizeColors(raw.colors);
  const typoResult = normalizeTypography(raw.typography);
  const spacingResult = normalizeSpacing(raw.spacing);
  const radiusResult = normalizeRadius(raw.rounded);

  const colorMap: Record<string, string> = {};
  for (const c of raw.colors) {
    colorMap[c.name] = c.value;
  }

  const components = normalizeComponents(raw, colorMap);

  const customTokens: CustomToken[] = [
    ...colorResult.unmapped,
    ...typoResult.unmapped,
    ...spacingResult.unmapped,
    ...radiusResult.unmapped,
  ];

  const missingCategories: TokenCategory[] = [];
  if (raw.colors.length === 0) missingCategories.push('colors');
  if (raw.typography.length === 0) missingCategories.push('typography');
  if (raw.spacing.length === 0) missingCategories.push('spacing');
  if (raw.rounded.length === 0) missingCategories.push('radius');
  if (raw.components.length === 0) missingCategories.push('components');

  return {
    slug: raw.slug,
    displayName: raw.displayName,
    sourceFormat: raw.sourceFormat,
    description: raw.description,
    primaryColor: colorResult.primaryColor,
    primaryFont: typoResult.primaryFont,
    isDarkMode: colorResult.isDarkMode,
    colors: colorResult.colors,
    typography: typoResult.typography,
    spacing: spacingResult.spacing,
    radius: radiusResult.radius,
    components,
    customTokens,
    missingCategories,
  };
}
