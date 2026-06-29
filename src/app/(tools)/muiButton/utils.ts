import type { ButtonThemeConfig, ButtonThemeExportFormat, SizeTokens, RootTokens, ElevationTokens } from './types';
import { MUI_DEFAULTS } from './types';

function isDefaultRoot(root: RootTokens): boolean {
  const d = MUI_DEFAULTS.root;
  return root.borderRadius === d.borderRadius && root.textTransform === d.textTransform && root.fontWeight === d.fontWeight && root.minWidth === d.minWidth && root.letterSpacing === d.letterSpacing;
}

function isDefaultSize(size: SizeTokens, defaults: SizeTokens): boolean {
  return size.containedPadding === defaults.containedPadding && size.outlinedPadding === defaults.outlinedPadding && size.textPadding === defaults.textPadding && size.fontSize === defaults.fontSize && size.iconSize === defaults.iconSize;
}

function isDefaultElevation(elev: ElevationTokens): boolean {
  return elev.boxShadow === MUI_DEFAULTS.elevation.boxShadow && elev.hoverBoxShadow === MUI_DEFAULTS.elevation.hoverBoxShadow;
}

/** Generate full createTheme() code */
export function generateCreateTheme(config: ButtonThemeConfig): string {
  const lines: string[] = ["import { createTheme } from '@mui/material/styles';", '', 'const theme = createTheme({', '  components: {', '    MuiButton: {', '      styleOverrides: {'];

  // Root
  if (!isDefaultRoot(config.root)) {
    const d = MUI_DEFAULTS.root;
    lines.push('        root: {');
    if (config.root.borderRadius !== d.borderRadius) lines.push(`          borderRadius: ${config.root.borderRadius},`);
    if (config.root.textTransform !== d.textTransform) lines.push(`          textTransform: '${config.root.textTransform}',`);
    if (config.root.fontWeight !== d.fontWeight) lines.push(`          fontWeight: ${config.root.fontWeight},`);
    if (config.root.minWidth !== d.minWidth) lines.push(`          minWidth: ${config.root.minWidth},`);
    if (config.root.letterSpacing !== d.letterSpacing) lines.push(`          letterSpacing: '${config.root.letterSpacing}',`);
    lines.push('        },');
  }

  // sizeSmall
  if (!isDefaultSize(config.small, MUI_DEFAULTS.small)) {
    lines.push('        sizeSmall: {');
    if (config.small.fontSize !== MUI_DEFAULTS.small.fontSize) lines.push(`          fontSize: '${config.small.fontSize}',`);
    if (config.small.containedPadding !== MUI_DEFAULTS.small.containedPadding) lines.push(`          '&.MuiButton-contained': { padding: '${config.small.containedPadding}' },`);
    if (config.small.outlinedPadding !== MUI_DEFAULTS.small.outlinedPadding) lines.push(`          '&.MuiButton-outlined': { padding: '${config.small.outlinedPadding}' },`);
    if (config.small.textPadding !== MUI_DEFAULTS.small.textPadding) lines.push(`          '&.MuiButton-text': { padding: '${config.small.textPadding}' },`);
    lines.push('        },');
  }

  // sizeMedium
  if (!isDefaultSize(config.medium, MUI_DEFAULTS.medium)) {
    lines.push('        sizeMedium: {');
    if (config.medium.fontSize !== MUI_DEFAULTS.medium.fontSize) lines.push(`          fontSize: '${config.medium.fontSize}',`);
    if (config.medium.containedPadding !== MUI_DEFAULTS.medium.containedPadding) lines.push(`          '&.MuiButton-contained': { padding: '${config.medium.containedPadding}' },`);
    if (config.medium.outlinedPadding !== MUI_DEFAULTS.medium.outlinedPadding) lines.push(`          '&.MuiButton-outlined': { padding: '${config.medium.outlinedPadding}' },`);
    if (config.medium.textPadding !== MUI_DEFAULTS.medium.textPadding) lines.push(`          '&.MuiButton-text': { padding: '${config.medium.textPadding}' },`);
    lines.push('        },');
  }

  // sizeLarge
  if (!isDefaultSize(config.large, MUI_DEFAULTS.large)) {
    lines.push('        sizeLarge: {');
    if (config.large.fontSize !== MUI_DEFAULTS.large.fontSize) lines.push(`          fontSize: '${config.large.fontSize}',`);
    if (config.large.containedPadding !== MUI_DEFAULTS.large.containedPadding) lines.push(`          '&.MuiButton-contained': { padding: '${config.large.containedPadding}' },`);
    if (config.large.outlinedPadding !== MUI_DEFAULTS.large.outlinedPadding) lines.push(`          '&.MuiButton-outlined': { padding: '${config.large.outlinedPadding}' },`);
    if (config.large.textPadding !== MUI_DEFAULTS.large.textPadding) lines.push(`          '&.MuiButton-text': { padding: '${config.large.textPadding}' },`);
    lines.push('        },');
  }

  // Icon sizes
  const iconSizes: [string, SizeTokens][] = [
    ['iconSizeSmall', config.small],
    ['iconSizeMedium', config.medium],
    ['iconSizeLarge', config.large],
  ];
  const hasIconOverride = iconSizes.some(([, s]) => {
    const d = MUI_DEFAULTS[s === config.small ? 'small' : s === config.medium ? 'medium' : 'large'];
    return s.iconSize !== d.iconSize;
  });
  if (hasIconOverride) {
    lines.push('        // Icon sizes');
    if (config.small.iconSize !== MUI_DEFAULTS.small.iconSize)
      lines.push(`        iconSizeSmall: { '& > *:nth-of-type(1)': { fontSize: ${config.small.iconSize} } },`);
    if (config.medium.iconSize !== MUI_DEFAULTS.medium.iconSize)
      lines.push(`        iconSizeMedium: { '& > *:nth-of-type(1)': { fontSize: ${config.medium.iconSize} } },`);
    if (config.large.iconSize !== MUI_DEFAULTS.large.iconSize)
      lines.push(`        iconSizeLarge: { '& > *:nth-of-type(1)': { fontSize: ${config.large.iconSize} } },`);
  }

  // Elevation
  if (!isDefaultElevation(config.elevation)) {
    lines.push('        // Contained elevation');
    lines.push('        contained: {');
    if (config.elevation.boxShadow !== MUI_DEFAULTS.elevation.boxShadow)
      lines.push(`          boxShadow: '${config.elevation.boxShadow}',`);
    if (config.elevation.hoverBoxShadow !== MUI_DEFAULTS.elevation.hoverBoxShadow)
      lines.push(`          '&:hover': { boxShadow: '${config.elevation.hoverBoxShadow}' },`);
    lines.push('        },');
  }

  lines.push('      },');
  lines.push('    },');
  lines.push('  },');
  lines.push('});');
  lines.push('');
  lines.push('export default theme;');

  return lines.join('\n');
}

/** Generate only the components.MuiButton section */
export function generateThemeComponents(config: ButtonThemeConfig): string {
  const lines: string[] = ['components: {', '  MuiButton: {', '    styleOverrides: {'];

  // Always output all values for the standalone format
  lines.push('      root: {');
  lines.push(`        borderRadius: ${config.root.borderRadius},`);
  lines.push(`        textTransform: '${config.root.textTransform}',`);
  lines.push(`        fontWeight: ${config.root.fontWeight},`);
  lines.push(`        minWidth: ${config.root.minWidth},`);
  lines.push(`        letterSpacing: '${config.root.letterSpacing}',`);
  lines.push('      },');

  for (const [label, size] of [['sizeSmall', config.small], ['sizeMedium', config.medium], ['sizeLarge', config.large]] as const) {
    lines.push(`      ${label}: {`);
    lines.push(`        fontSize: '${size.fontSize}',`);
    lines.push(`        '&.MuiButton-contained': { padding: '${size.containedPadding}' },`);
    lines.push(`        '&.MuiButton-outlined': { padding: '${size.outlinedPadding}' },`);
    lines.push(`        '&.MuiButton-text': { padding: '${size.textPadding}' },`);
    lines.push('      },');
  }

  lines.push('      iconSizeSmall: { fontSize: ' + config.small.iconSize + ' },');
  lines.push('      iconSizeMedium: { fontSize: ' + config.medium.iconSize + ' },');
  lines.push('      iconSizeLarge: { fontSize: ' + config.large.iconSize + ' },');

  lines.push('      contained: {');
  lines.push(`        boxShadow: '${config.elevation.boxShadow}',`);
  lines.push(`        '&:hover': { boxShadow: '${config.elevation.hoverBoxShadow}' },`);
  lines.push('      },');

  lines.push('    },');
  lines.push('  },');
  lines.push('}');

  return lines.join('\n');
}

/** Generate CSS */
export function generateCSS(config: ButtonThemeConfig): string {
  return `/* MUI Button Theme Overrides */
/* Add to your global CSS or theme stylesheet */

.MuiButton-root {
  border-radius: ${config.root.borderRadius}px;
  text-transform: ${config.root.textTransform};
  font-weight: ${config.root.fontWeight};
  min-width: ${config.root.minWidth}px;
  letter-spacing: ${config.root.letterSpacing};
}

/* Small */
.MuiButton-sizeSmall {
  font-size: ${config.small.fontSize};
}
.MuiButton-sizeSmall.MuiButton-contained { padding: ${config.small.containedPadding}; }
.MuiButton-sizeSmall.MuiButton-outlined { padding: ${config.small.outlinedPadding}; }
.MuiButton-sizeSmall.MuiButton-text     { padding: ${config.small.textPadding}; }
.MuiButton-sizeSmall .MuiButton-icon   { font-size: ${config.small.iconSize}px; }

/* Medium */
.MuiButton-sizeMedium {
  font-size: ${config.medium.fontSize};
}
.MuiButton-sizeMedium.MuiButton-contained { padding: ${config.medium.containedPadding}; }
.MuiButton-sizeMedium.MuiButton-outlined { padding: ${config.medium.outlinedPadding}; }
.MuiButton-sizeMedium.MuiButton-text     { padding: ${config.medium.textPadding}; }
.MuiButton-sizeMedium .MuiButton-icon   { font-size: ${config.medium.iconSize}px; }

/* Large */
.MuiButton-sizeLarge {
  font-size: ${config.large.fontSize};
}
.MuiButton-sizeLarge.MuiButton-contained { padding: ${config.large.containedPadding}; }
.MuiButton-sizeLarge.MuiButton-outlined { padding: ${config.large.outlinedPadding}; }
.MuiButton-sizeLarge.MuiButton-text     { padding: ${config.large.textPadding}; }
.MuiButton-sizeLarge .MuiButton-icon   { font-size: ${config.large.iconSize}px; }

/* Contained elevation */
.MuiButton-contained {
  box-shadow: ${config.elevation.boxShadow};
}
.MuiButton-contained:hover {
  box-shadow: ${config.elevation.hoverBoxShadow};
}`;
}

/** Generate JSON */
export function generateJSON(config: ButtonThemeConfig): string {
  return JSON.stringify(
    {
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: config.root.borderRadius,
              textTransform: config.root.textTransform,
              fontWeight: config.root.fontWeight,
              minWidth: config.root.minWidth,
              letterSpacing: config.root.letterSpacing,
            },
            sizeSmall: {
              fontSize: config.small.fontSize,
              '&.MuiButton-contained': { padding: config.small.containedPadding },
              '&.MuiButton-outlined': { padding: config.small.outlinedPadding },
              '&.MuiButton-text': { padding: config.small.textPadding },
            },
            sizeMedium: {
              fontSize: config.medium.fontSize,
              '&.MuiButton-contained': { padding: config.medium.containedPadding },
              '&.MuiButton-outlined': { padding: config.medium.outlinedPadding },
              '&.MuiButton-text': { padding: config.medium.textPadding },
            },
            sizeLarge: {
              fontSize: config.large.fontSize,
              '&.MuiButton-contained': { padding: config.large.containedPadding },
              '&.MuiButton-outlined': { padding: config.large.outlinedPadding },
              '&.MuiButton-text': { padding: config.large.textPadding },
            },
            contained: {
              boxShadow: config.elevation.boxShadow,
              '&:hover': { boxShadow: config.elevation.hoverBoxShadow },
            },
          },
        },
      },
    },
    null,
    2,
  );
}

/** Master dispatcher */
export function generateCode(config: ButtonThemeConfig, format: ButtonThemeExportFormat): string {
  switch (format) {
    case 'createTheme':
      return generateCreateTheme(config);
    case 'theme-components':
      return generateThemeComponents(config);
    case 'css':
      return generateCSS(config);
    case 'json':
      return generateJSON(config);
    default:
      return generateCreateTheme(config);
  }
}
