/**
 * Flexbox Utilities
 * Helper functions for generating flexbox CSS
 */

import type {
  FlexContainerConfig,
  FlexItemConfig,
  FlexDirection,
  JustifyContent,
  AlignItems,
  FlexWrap,
  FlexExportFormat,
} from './types';

/**
 * Generate container CSS
 */
export function generateContainerCSS(config: FlexContainerConfig): string {
  const lines: string[] = [];

  lines.push(`display: flex;`);

  if (config.direction) {
    lines.push(`flex-direction: ${config.direction};`);
  }
  if (config.wrap) {
    lines.push(`flex-wrap: ${config.wrap};`);
  }
  if (config.justifyContent) {
    lines.push(`justify-content: ${config.justifyContent};`);
  }
  if (config.alignItems) {
    lines.push(`align-items: ${config.alignItems};`);
  }
  if (config.gap) {
    lines.push(`gap: ${config.gap}px;`);
  }

  return lines.join('\n');
}

/**
 * Generate item CSS
 */
export function generateItemCSS(config: FlexItemConfig): string {
  const lines: string[] = [];

  if (config.flex) {
    lines.push(`flex: ${config.flex};`);
  }
  if (config.flexGrow !== undefined) {
    lines.push(`flex-grow: ${config.flexGrow};`);
  }
  if (config.flexShrink !== undefined) {
    lines.push(`flex-shrink: ${config.flexShrink};`);
  }
  if (config.flexBasis) {
    lines.push(`flex-basis: ${config.flexBasis};`);
  }
  if (config.alignSelf) {
    lines.push(`align-self: ${config.alignSelf};`);
  }
  if (config.order !== undefined) {
    lines.push(`order: ${config.order};`);
  }

  return lines.join('\n');
}

/**
 * Generate complete CSS
 */
export function generateCSS(
  containerConfig: FlexContainerConfig,
  itemConfigs?: FlexItemConfig[]
): string {
  const containerCSS = generateContainerCSS(containerConfig);

  let result = `.flex-container {\n  ${containerCSS.replace(/\n/g, '\n  ')}\n}`;

  if (itemConfigs && itemConfigs.length > 0) {
    result += '\n.flex-item {\n';
    itemConfigs.forEach((item, index) => {
      const itemCSS = generateItemCSS(item);
      if (itemCSS) {
        result += `  /* Item ${index + 1} */\n  ${itemCSS.replace(/\n/g, '\n  ')}\n`;
      }
    });
    result += '}\n';
  }

  return result;
}

/**
 * Generate MUI sx prop
 */
export function generateMUI(config: FlexContainerConfig): string {
  const props: string[] = [];

  props.push('display: "flex"');
  if (config.direction) props.push(`flexDirection: "${config.direction}"`);
  if (config.wrap) props.push(`flexWrap: "${config.wrap}"`);
  if (config.justifyContent) props.push(`justifyContent: "${config.justifyContent}"`);
  if (config.alignItems) props.push(`alignItems: "${config.alignItems}"`);
  if (config.gap) props.push(`gap: ${config.gap}`);

  return `<Box
  sx={{
    ${props.join(',\n    ')},
  }}
>
  {/* Items */}
</Box>`;
}

/**
 * Generate Tailwind classes
 */
export function generateTailwind(config: FlexContainerConfig): string {
  const classes: string[] = ['flex'];

  // Direction
  if (config.direction === 'row') classes.push('flex-row');
  else if (config.direction === 'row-reverse') classes.push('flex-row-reverse');
  else if (config.direction === 'column') classes.push('flex-col');
  else if (config.direction === 'column-reverse') classes.push('flex-col-reverse');

  // Wrap
  if (config.wrap === 'wrap') classes.push('flex-wrap');
  else if (config.wrap === 'nowrap') classes.push('flex-nowrap');
  else if (config.wrap === 'wrap-reverse') classes.push('flex-wrap-reverse');

  // Justify
  const justifyMap: Record<JustifyContent, string> = {
    'flex-start': 'justify-start',
    'flex-end': 'justify-end',
    center: 'justify-center',
    'space-between': 'justify-between',
    'space-around': 'justify-around',
    'space-evenly': 'justify-evenly',
  };
  if (config.justifyContent) {
    classes.push(justifyMap[config.justifyContent] || 'justify-start');
  }

  // Align
  const alignMap: Record<AlignItems, string> = {
    'flex-start': 'items-start',
    'flex-end': 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };
  if (config.alignItems) {
    classes.push(alignMap[config.alignItems] || 'items-stretch');
  }

  // Gap
  if (config.gap) {
    classes.push(`gap-${config.gap}`);
  }

  return classes.join(' ');
}

/**
 * Generate JSON output
 */
export function generateJSON(config: FlexContainerConfig): string {
  return JSON.stringify(
    {
      container: {
        display: 'flex',
        ...config,
      },
      css: generateContainerCSS(config),
    },
    null,
    2
  );
}

/**
 * Generate code by format
 */
export function generateCode(
  config: FlexContainerConfig,
  format: FlexExportFormat,
  itemConfigs?: FlexItemConfig[]
): string {
  switch (format) {
    case 'css':
      return generateCSS(config, itemConfigs);
    case 'scss':
      return `$flex-container: (\n  ${generateContainerCSS(config).replace(/\n/g, ',\n  ')}\n);\n\n.container {\n  @include flex-container;\n}`;
    case 'tailwind':
      return `<div class="${generateTailwind(config)}">\n  {/* Items */}\n</div>`;
    case 'mui':
      return generateMUI(config);
    case 'json':
      return generateJSON(config);
    default:
      return generateCSS(config, itemConfigs);
  }
}
