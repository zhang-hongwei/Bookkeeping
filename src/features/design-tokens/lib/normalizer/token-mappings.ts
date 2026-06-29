import type { ColorRoleName, TypographyRoleName, SpacingScaleName, RadiusScaleName } from '../universal-schema';

export interface ColorMappingRule {
  pattern: string | RegExp;
  target: ColorRoleName;
}

export interface TypographyMappingRule {
  pattern: string | RegExp;
  target: TypographyRoleName;
}

export interface SpacingMappingRule {
  pattern: string | RegExp;
  target: SpacingScaleName;
}

export interface RadiusMappingRule {
  pattern: string | RegExp;
  target: RadiusScaleName;
}

export const COLOR_MAPPINGS: ColorMappingRule[] = [
  // Brand
  { pattern: 'primary', target: 'primary' },
  { pattern: 'on-primary', target: 'onPrimary' },
  { pattern: 'onPrimary', target: 'onPrimary' },
  { pattern: 'secondary', target: 'secondary' },
  { pattern: 'on-secondary', target: 'onSecondary' },
  // Surface / Background
  { pattern: 'canvas', target: 'background' },
  { pattern: 'background', target: 'background' },
  { pattern: /^bg$/, target: 'background' },
  { pattern: 'page', target: 'background' },
  { pattern: /^ink$/, target: 'textPrimary' },
  { pattern: /^body$/, target: 'textPrimary' },
  { pattern: /^text$/, target: 'textPrimary' },
  { pattern: 'foreground', target: 'onBackground' },
  { pattern: 'surface-card', target: 'surface' },
  { pattern: 'surface-soft', target: 'surface' },
  { pattern: /^card$/, target: 'surface' },
  { pattern: 'hairline', target: 'border' },
  { pattern: /^border$/, target: 'border' },
  { pattern: /^stroke$/, target: 'border' },
  { pattern: /^divider$/, target: 'border' },
  { pattern: 'hairline-soft', target: 'borderVariant' },
  { pattern: 'hairline-light', target: 'borderVariant' },
  { pattern: 'border-subtle', target: 'borderVariant' },
  // Text
  { pattern: 'ink-deep', target: 'onSurface' },
  { pattern: 'body-strong', target: 'onSurface' },
  { pattern: 'text-strong', target: 'onSurface' },
  { pattern: 'muted', target: 'textSecondary' },
  { pattern: 'ink-secondary', target: 'textSecondary' },
  { pattern: 'body-secondary', target: 'textSecondary' },
  { pattern: 'text-secondary', target: 'textSecondary' },
  { pattern: 'muted-soft', target: 'textDisabled' },
  { pattern: 'ink-faint', target: 'textDisabled' },
  { pattern: 'ink-muted', target: 'textDisabled' },
  // Status
  { pattern: 'success', target: 'statusSuccess' },
  { pattern: 'semantic-success', target: 'statusSuccess' },
  { pattern: /^green$/, target: 'statusSuccess' },
  { pattern: 'positive', target: 'statusSuccess' },
  { pattern: 'warning', target: 'statusWarning' },
  { pattern: 'semantic-warning', target: 'statusWarning' },
  { pattern: 'caution', target: 'statusWarning' },
  { pattern: 'error', target: 'statusError' },
  { pattern: 'danger', target: 'statusError' },
  { pattern: 'semantic-error', target: 'statusError' },
  { pattern: 'destructive', target: 'statusError' },
  { pattern: 'info', target: 'statusInfo' },
  // Inverse / Dark
  { pattern: 'surface-dark', target: 'inverse' },
  { pattern: 'inverse-canvas', target: 'inverse' },
  { pattern: 'canvas-dark', target: 'inverse' },
  { pattern: /^on-dark$/, target: 'onInverse' },
  { pattern: 'on-dark-mute', target: 'onInverse' },
  { pattern: 'on-dark-soft', target: 'onInverse' },
];

export const TYPOGRAPHY_MAPPINGS: TypographyMappingRule[] = [
  { pattern: /^hero/, target: 'hero' },
  { pattern: 'display-xxl', target: 'hero' },
  { pattern: 'mega', target: 'hero' },
  { pattern: /^display-xl$/, target: 'display' },
  { pattern: /^display-lg$/, target: 'display' },
  { pattern: /^display-1$/, target: 'display' },
  { pattern: /^display-md$/, target: 'headline' },
  { pattern: 'heading-lg', target: 'headline' },
  { pattern: 'heading-1', target: 'headline' },
  { pattern: /^heading$/, target: 'headline' },
  { pattern: /^h1$/, target: 'headline' },
  { pattern: 'heading-sm', target: 'title' },
  { pattern: /^title$/, target: 'title' },
  { pattern: 'heading-2', target: 'title' },
  { pattern: /^h2$/, target: 'title' },
  { pattern: /^body-lg$/, target: 'bodyLarge' },
  { pattern: /^lead$/, target: 'bodyLarge' },
  { pattern: /^body-strong$/, target: 'bodyLarge' },
  { pattern: /^body-md$/, target: 'body' },
  { pattern: /^body$/, target: 'body' },
  { pattern: /^paragraph$/, target: 'body' },
  { pattern: /^body-sm$/, target: 'bodySmall' },
  { pattern: /^small$/, target: 'bodySmall' },
  { pattern: /^caption$/, target: 'caption' },
  { pattern: /^micro$/, target: 'caption' },
  { pattern: 'fine-print', target: 'caption' },
  { pattern: /^button/, target: 'button' },
  { pattern: /^cta$/, target: 'button' },
  { pattern: /^code$/, target: 'code' },
  { pattern: /^mono/, target: 'code' },
  { pattern: 'overline', target: 'overline' },
  { pattern: 'uppercase-tag', target: 'overline' },
  { pattern: /^label$/, target: 'overline' },
  { pattern: /^tag$/, target: 'overline' },
  { pattern: 'eyebrow', target: 'overline' },
];

export const SPACING_MAPPINGS: SpacingMappingRule[] = [
  { pattern: 'xxs', target: 'xxs' },
  { pattern: 'hair', target: 'xxs' },
  { pattern: 'micro', target: 'xxs' },
  { pattern: '2xs', target: 'xs' },
  { pattern: /^xs$/, target: 'xs' },
  { pattern: /^sm$/, target: 'sm' },
  { pattern: 'small', target: 'sm' },
  { pattern: /^base$/, target: 'sm' },
  { pattern: /^md$/, target: 'md' },
  { pattern: 'medium', target: 'md' },
  { pattern: /^default$/, target: 'md' },
  { pattern: /^lg$/, target: 'lg' },
  { pattern: 'large', target: 'lg' },
  { pattern: /^xl$/, target: 'xl' },
  { pattern: 'xlarge', target: 'xl' },
  { pattern: /^xxl$/, target: 'xxl' },
  { pattern: '2xl', target: 'xxl' },
  { pattern: /^huge$/, target: 'xxl' },
  { pattern: 'xxxl', target: 'xxxl' },
  { pattern: '3xl', target: 'xxxl' },
  { pattern: 'massive', target: 'xxxl' },
  { pattern: 'section', target: 'section' },
  { pattern: 'page', target: 'section' },
];

export const RADIUS_MAPPINGS: RadiusMappingRule[] = [
  { pattern: 'none', target: 'none' },
  { pattern: 'sharp', target: 'none' },
  { pattern: /^xs$/, target: 'xs' },
  { pattern: 'subtle', target: 'xs' },
  { pattern: 'micro', target: 'xs' },
  { pattern: 'tight', target: 'xs' },
  { pattern: /^sm$/, target: 'sm' },
  { pattern: 'small', target: 'sm' },
  { pattern: 'soft', target: 'sm' },
  { pattern: /^md$/, target: 'md' },
  { pattern: 'medium', target: 'md' },
  { pattern: 'standard', target: 'md' },
  { pattern: /^lg$/, target: 'lg' },
  { pattern: 'large', target: 'lg' },
  { pattern: 'rounded', target: 'lg' },
  { pattern: /^xl$/, target: 'xl' },
  { pattern: 'xlarge', target: 'xl' },
  { pattern: 'spacious', target: 'xl' },
  { pattern: 'full', target: 'full' },
  { pattern: 'pill', target: 'full' },
  { pattern: 'round', target: 'full' },
  { pattern: 'circle', target: 'full' },
];
