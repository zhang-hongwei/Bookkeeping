export const UNIVERSAL_COLOR_ROLES = {
  primary: { group: 'brand' as const, patterns: ['primary', 'brand-blue', 'accent'] },
  onPrimary: { group: 'brand' as const, patterns: ['on-primary', 'onPrimary', 'on-brand', 'on-primary'] },
  secondary: { group: 'brand' as const, patterns: ['secondary', 'accent-teal', 'accent-color'] },
  onSecondary: { group: 'brand' as const, patterns: ['on-secondary', 'onSecondary'] },
  background: { group: 'surface' as const, patterns: ['canvas', 'background', 'bg', 'page'] },
  onBackground: { group: 'text' as const, patterns: ['ink', 'body', 'text', 'foreground'] },
  surface: { group: 'surface' as const, patterns: ['surface-card', 'surface-soft', 'card', 'surface'] },
  onSurface: { group: 'text' as const, patterns: ['ink-deep', 'body-strong', 'text-strong'] },
  surfaceVariant: { group: 'surface' as const, patterns: ['surface-elevated', 'surface-dark', 'surface-hard', 'surface-bone'] },
  border: { group: 'border' as const, patterns: ['hairline', 'border', 'stroke', 'divider'] },
  borderVariant: { group: 'border' as const, patterns: ['hairline-soft', 'border-subtle', 'hairline-light'] },
  textPrimary: { group: 'text' as const, patterns: ['ink', 'body', 'text-primary'] },
  textSecondary: { group: 'text' as const, patterns: ['muted', 'body-secondary', 'ink-secondary', 'text-secondary'] },
  textDisabled: { group: 'text' as const, patterns: ['muted-soft', 'ink-faint', 'text-disabled', 'ink-muted'] },
  statusSuccess: { group: 'status' as const, patterns: ['success', 'semantic-success', 'positive', 'green'] },
  statusWarning: { group: 'status' as const, patterns: ['warning', 'semantic-warning', 'caution', 'yellow'] },
  statusError: { group: 'status' as const, patterns: ['error', 'danger', 'semantic-error', 'destructive', 'red'] },
  statusInfo: { group: 'status' as const, patterns: ['info', 'accent-blue', 'notice'] },
  inverse: { group: 'inverse' as const, patterns: ['surface-dark', 'inverse-canvas', 'canvas-dark', 'surface-dark-elevated'] },
  onInverse: { group: 'inverse' as const, patterns: ['on-dark', 'on-dark-mute', 'on-dark-soft'] },
} as const;

export const UNIVERSAL_TYPOGRAPHY_ROLES = {
  hero: { sizeRange: [48, 136] as [number, number], patterns: ['hero', 'hero-display', 'display-xxl', 'mega'] },
  display: { sizeRange: [36, 56] as [number, number], patterns: ['display-xl', 'display-lg', 'display', 'display-1'] },
  headline: { sizeRange: [24, 36] as [number, number], patterns: ['display-md', 'heading-lg', 'heading-1', 'heading', 'h1'] },
  title: { sizeRange: [18, 24] as [number, number], patterns: ['heading-sm', 'title', 'heading-2', 'heading-3', 'h2', 'h3'] },
  body: { sizeRange: [15, 17] as [number, number], patterns: ['body', 'body-md', 'paragraph', 'p'] },
  bodyLarge: { sizeRange: [18, 22] as [number, number], patterns: ['body-lg', 'lead', 'lead-airy', 'body-strong'] },
  bodySmall: { sizeRange: [13, 14] as [number, number], patterns: ['body-sm', 'small', 'body-secondary'] },
  caption: { sizeRange: [11, 13] as [number, number], patterns: ['caption', 'micro', 'fine-print', 'caption-sm', 'footnote'] },
  button: { sizeRange: [14, 17] as [number, number], patterns: ['button-md', 'button', 'button-lg', 'cta', 'button-utility'] },
  code: { sizeRange: [13, 16] as [number, number], patterns: ['code', 'mono', 'code-block', 'mono-label'] },
  overline: { sizeRange: [10, 13] as [number, number], patterns: ['overline', 'uppercase-tag', 'label', 'tag', 'eyebrow'] },
} as const;

export const UNIVERSAL_SPACING_SCALE = {
  xxs: { valueRange: [2, 4] as [number, number], patterns: ['xxs', 'hair', 'micro', 'tiny'] },
  xs: { valueRange: [4, 6] as [number, number], patterns: ['xs', 'tiny', '2xs'] },
  sm: { valueRange: [6, 10] as [number, number], patterns: ['sm', 'small', 'base'] },
  md: { valueRange: [10, 16] as [number, number], patterns: ['md', 'medium', 'default'] },
  lg: { valueRange: [16, 24] as [number, number], patterns: ['lg', 'large', 'regular'] },
  xl: { valueRange: [24, 36] as [number, number], patterns: ['xl', 'xlarge', 'wide'] },
  xxl: { valueRange: [36, 56] as [number, number], patterns: ['xxl', '2xl', 'huge'] },
  xxxl: { valueRange: [56, 80] as [number, number], patterns: ['xxxl', '3xl', 'massive'] },
  section: { valueRange: [80, 128] as [number, number], patterns: ['section', 'hero', 'page', 'section-sm', 'section-lg'] },
} as const;

export const UNIVERSAL_RADIUS_SCALE = {
  none: { value: 0, patterns: ['none', 'sharp', '0'] },
  xs: { valueRange: [2, 4] as [number, number], patterns: ['xs', 'subtle', 'micro', 'tight'] },
  sm: { valueRange: [4, 6] as [number, number], patterns: ['sm', 'small', 'soft'] },
  md: { valueRange: [6, 12] as [number, number], patterns: ['md', 'medium', 'standard', 'default'] },
  lg: { valueRange: [12, 16] as [number, number], patterns: ['lg', 'large', 'rounded'] },
  xl: { valueRange: [16, 24] as [number, number], patterns: ['xl', 'xlarge', 'spacious'] },
  full: { value: 9999, patterns: ['full', 'pill', 'round', 'circle'] },
} as const;

export type ColorRoleName = keyof typeof UNIVERSAL_COLOR_ROLES;
export type TypographyRoleName = keyof typeof UNIVERSAL_TYPOGRAPHY_ROLES;
export type SpacingScaleName = keyof typeof UNIVERSAL_SPACING_SCALE;
export type RadiusScaleName = keyof typeof UNIVERSAL_RADIUS_SCALE;
