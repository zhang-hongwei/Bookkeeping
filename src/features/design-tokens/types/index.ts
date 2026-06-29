export type TokenCategory = 'colors' | 'typography' | 'spacing' | 'radius' | 'components';

export type ExportFormat = 'mui' | 'shadcn' | 'tailwind' | 'css-variables';

export interface ColorToken {
  universalName: string;
  originalName: string;
  value: string;
  group: 'brand' | 'surface' | 'text' | 'border' | 'status' | 'inverse';
}

export interface ColorTokenSet {
  primary?: ColorToken;
  onPrimary?: ColorToken;
  secondary?: ColorToken;
  onSecondary?: ColorToken;
  background?: ColorToken;
  onBackground?: ColorToken;
  surface?: ColorToken;
  onSurface?: ColorToken;
  surfaceVariant?: ColorToken;
  border?: ColorToken;
  borderVariant?: ColorToken;
  textPrimary?: ColorToken;
  textSecondary?: ColorToken;
  textDisabled?: ColorToken;
  statusSuccess?: ColorToken;
  statusWarning?: ColorToken;
  statusError?: ColorToken;
  statusInfo?: ColorToken;
  inverse?: ColorToken;
  onInverse?: ColorToken;
}

export interface TypographyToken {
  universalName: string;
  originalName: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: string;
  textTransform?: 'uppercase' | 'lowercase' | 'none';
  fontFeature?: string;
}

export interface TypographyTokenSet {
  hero?: TypographyToken;
  display?: TypographyToken;
  headline?: TypographyToken;
  title?: TypographyToken;
  body?: TypographyToken;
  bodyLarge?: TypographyToken;
  bodySmall?: TypographyToken;
  caption?: TypographyToken;
  button?: TypographyToken;
  code?: TypographyToken;
  overline?: TypographyToken;
}

export interface SpacingToken {
  universalName: string;
  originalName: string;
  value: number;
}

export interface SpacingTokenSet {
  xxs?: SpacingToken;
  xs?: SpacingToken;
  sm?: SpacingToken;
  md?: SpacingToken;
  lg?: SpacingToken;
  xl?: SpacingToken;
  xxl?: SpacingToken;
  xxxl?: SpacingToken;
  section?: SpacingToken;
}

export interface RadiusToken {
  universalName: string;
  originalName: string;
  value: number;
}

export interface RadiusTokenSet {
  none?: RadiusToken;
  xs?: RadiusToken;
  sm?: RadiusToken;
  md?: RadiusToken;
  lg?: RadiusToken;
  xl?: RadiusToken;
  full?: RadiusToken;
}

export interface ComponentToken {
  universalName: string;
  originalName: string;
  backgroundColor?: string;
  textColor?: string;
  typography?: string;
  rounded?: string;
  padding?: string;
  height?: string;
  size?: string;
}

export interface CustomToken {
  category: 'color' | 'typography' | 'spacing' | 'radius';
  originalName: string;
  value: string;
  reason: 'no-matching-role' | 'brand-specific' | 'ambiguous';
}

export interface BrandDesignSystem {
  slug: string;
  displayName: string;
  sourceFormat: 'yaml' | 'markdown';
  description: string;
  primaryColor: string;
  primaryFont: string;
  isDarkMode: boolean;
  colors: ColorTokenSet;
  typography: TypographyTokenSet;
  spacing: SpacingTokenSet;
  radius: RadiusTokenSet;
  components: ComponentToken[];
  customTokens: CustomToken[];
  missingCategories: TokenCategory[];
}
