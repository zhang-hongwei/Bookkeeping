import type { RawParsedBrand, RawColorToken, RawTypographyToken } from './yaml-parser';

const HEX_PATTERN = /`?(#[0-9a-fA-F]{3,8})`?/g;
const PX_PATTERN = /(\d+(?:\.\d+)?)\s*px/gi;
const TABLE_ROW_PATTERN = /\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]*)\|/g;
const FONT_FAMILY_PATTERN = /(?:font[- ]?family|typeface|font)\s*[:\-—]\s*(.+)/i;
const QUOTED_FONT = /["']([^"']+)["']/g;

function extractColorsFromSection(section: string): RawColorToken[] {
  const colors: RawColorToken[] = [];
  const seen = new Set<string>();
  const lines = section.split('\n');

  for (const line of lines) {
    // Match: **Bold Name** (`#hex`) or **Bold Name** (#hex)
    const boldMatch = line.match(/\*\*([^*]+)\*\*\s*\(?\s*`?(#[0-9a-fA-F]{3,8})`?\s*\)?/);
    if (boldMatch) {
      const name = boldMatch[1].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const value = boldMatch[2];
      if (!seen.has(value)) {
        seen.add(value);
        colors.push({ name, value });
      }
      continue;
    }

    // Match: Label: `#hex` or Label — #hex
    const labelMatch = line.match(/([A-Za-z][A-Za-z0-9\s&-]+?)[\s:—\-]*\(?\s*`?(#[0-9a-fA-F]{3,8})`?\s*\)?/);
    if (labelMatch && labelMatch[1].length < 30) {
      const name = labelMatch[1].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const value = labelMatch[2];
      if (!seen.has(value) && name.length > 0) {
        seen.add(value);
        colors.push({ name, value });
      }
      continue;
    }

    // Fallback: bare hex values
    let hexMatch: RegExpExecArray | null;
    HEX_PATTERN.lastIndex = 0;
    while ((hexMatch = HEX_PATTERN.exec(line)) !== null) {
      const value = hexMatch[1];
      if (!seen.has(value)) {
        seen.add(value);
        colors.push({ name: `color-${colors.length}`, value });
      }
    }
  }

  return colors;
}

function extractTypographyFromSection(section: string): RawTypographyToken[] {
  const tokens: RawTypographyToken[] = [];
  const lines = section.split('\n');

  // Find table rows (lines starting with | that contain px)
  const tableRows = lines.filter((l) => l.startsWith('|') && l.includes('px') && !l.match(/^\|[\s\-|:]+\|$/));

  for (const row of tableRows) {
    const cells = row.split('|').map((c) => c.trim()).filter(Boolean);
    if (cells.length < 3) continue;

    const role = cells[0].replace(/\*\*/g, '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const fontCell = cells.length > 1 ? cells[1] : '';
    const sizeCell = cells.length > 2 ? cells[2] : '';
    const weightCell = cells.length > 3 ? cells[3] : '';
    const lineHeightCell = cells.length > 4 ? cells[4] : '';

    const sizeMatch = sizeCell.match(/(\d+(?:\.\d+)?)\s*px/);
    const size = sizeMatch ? `${sizeMatch[1]}px` : '16px';

    const weightMatch = weightCell.match(/(\d{2,3})/);
    const weight = weightMatch ? parseInt(weightMatch[1], 10) : 400;

    const lhMatch = lineHeightCell.match(/(\d+(?:\.\d+)?)/);
    const lineHeight = lhMatch ? parseFloat(lhMatch[1]) : 1.5;

    const fontFamily = fontCell.replace(/`/g, '').trim() || 'system-ui, sans-serif';

    if (role && sizeMatch) {
      tokens.push({
        name: role,
        fontFamily,
        fontSize: size,
        fontWeight: weight,
        lineHeight,
      });
    }
  }

  // Also look for bullet-point typography definitions
  for (const line of lines) {
    if (line.startsWith('|') || !line.includes('px')) continue;
    const bulletMatch = line.match(/[-*]\s+\*\*([^*]+)\*\*[\s:]+\d+/);
    if (!bulletMatch) continue;
    const sizeMatch = line.match(/(\d+(?:\.\d+)?)\s*px/);
    const weightMatch = line.match(/weight\s*(\d{2,3})/i);
    if (sizeMatch) {
      const role = bulletMatch[1].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (!tokens.some((t) => t.name === role)) {
        tokens.push({
          name: role,
          fontFamily: 'system-ui, sans-serif',
          fontSize: `${sizeMatch[1]}px`,
          fontWeight: weightMatch ? parseInt(weightMatch[1], 10) : 400,
          lineHeight: 1.5,
        });
      }
    }
  }

  return tokens;
}

function extractSpacingFromSection(section: string): { name: string; value: number }[] {
  const spacing: { name: string; value: number }[] = [];
  const seen = new Set<number>();

  const baseMatch = section.match(/base\s*(?:unit)?\s*[:\-—]?\s*(\d+)\s*px/i);
  const baseUnit = baseMatch ? parseInt(baseMatch[1], 10) : 4;

  const scalePattern = /(\d+(?:\.\d+)?)\s*px/g;
  let match: RegExpExecArray | null;
  const values: number[] = [];

  while ((match = scalePattern.exec(section)) !== null) {
    const v = parseFloat(match[1]);
    if (v > 0 && v <= 200 && !seen.has(v)) {
      seen.add(v);
      values.push(v);
    }
  }

  values.sort((a, b) => a - b);

  const scaleNames = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl', 'section'];
  for (let i = 0; i < values.length && i < scaleNames.length; i++) {
    spacing.push({ name: scaleNames[i], value: values[i] });
  }

  if (spacing.length === 0 && baseUnit > 0) {
    const multipliers = [1, 2, 3, 4, 6, 8, 12, 16, 24];
    for (let i = 0; i < multipliers.length && i < scaleNames.length; i++) {
      spacing.push({ name: scaleNames[i], value: baseUnit * multipliers[i] });
    }
  }

  return spacing;
}

function extractRadiusFromSection(section: string): { name: string; value: number }[] {
  const radius: { name: string; value: number }[] = [];
  const seen = new Set<number>();

  const patterns = [
    /(?:none|sharp|no)\s*[\(:]?\s*(\d+)\s*px/gi,
    /(?:micro|tiny|xs)\s*[\(:]?\s*(\d+(?:\.\d+)?)\s*px/gi,
    /(?:small|subtle|sm|soft)\s*[\(:]?\s*(\d+(?:\.\d+)?)\s*px/gi,
    /(?:medium|standard|md|default)\s*[\(:]?\s*(\d+(?:\.\d+)?)\s*px/gi,
    /(?:large|rounded|lg)\s*[\(:]?\s*(\d+(?:\.\d+)?)\s*px/gi,
    /(?:extra|xl|spacious)\s*[\(:]?\s*(\d+(?:\.\d+)?)\s*px/gi,
    /(?:full|pill|round|circle)\s*[\(:]?\s*(\d+(?:\.\d+)?|9999)\s*px/gi,
  ];

  const scaleNames = ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'full'];
  const fallbackValues = [0, 2, 4, 6, 8, 12, 9999];

  for (let i = 0; i < patterns.length; i++) {
    let match: RegExpExecArray | null;
    while ((match = patterns[i].exec(section)) !== null) {
      const v = parseFloat(match[1]);
      if (!seen.has(v)) {
        seen.add(v);
        radius.push({ name: scaleNames[i], value: v });
      }
    }
    if (radius.length === 0 && i === patterns.length - 1) {
      for (let j = 0; j < scaleNames.length; j++) {
        radius.push({ name: scaleNames[j], value: fallbackValues[j] });
      }
    }
  }

  if (radius.length === 0) {
    for (let j = 0; j < scaleNames.length; j++) {
      radius.push({ name: scaleNames[j], value: fallbackValues[j] });
    }
  }

  return radius;
}

function extractPrimaryFont(content: string): string {
  const section = content.match(/##?\s*3\.?\s*Typography/i)?.[0]
    ? content.slice(content.indexOf(RegExp.lastMatch))
    : content;

  const familyMatch = section.match(FONT_FAMILY_PATTERN);
  if (familyMatch) {
    const fonts: string[] = [];
    let qMatch: RegExpExecArray | null;
    QUOTED_FONT.lastIndex = 0;
    while ((qMatch = QUOTED_FONT.exec(familyMatch[1])) !== null) {
      fonts.push(qMatch[1]);
    }
    if (fonts.length > 0) return fonts.join(', ');
    return familyMatch[1].replace(/[`"]/g, '').trim().split(/[,;]/)[0].trim();
  }

  return 'system-ui, sans-serif';
}

function splitMajorSections(content: string): string[] {
  // Split on ## (h2) headings but NOT ### (h3) by using negative lookahead
  return content.split(/\n(?=##(?!\#)\s)/);
}

export function parseMarkdownDesign(content: string, slug: string): RawParsedBrand {
  const sections = splitMajorSections(content);

  let colorSection = '';
  let typoSection = '';
  let layoutSection = '';
  let componentSection = '';

  for (const section of sections) {
    // Match only the heading line, not the full body (avoids false positives)
    const heading = section.split('\n')[0].toLowerCase();
    if (heading.includes('2.') || heading.includes('color')) {
      colorSection = section;
    } else if (heading.includes('3.') || heading.includes('typography')) {
      typoSection = section;
    } else if (heading.includes('5.') || heading.includes('layout')) {
      layoutSection = section;
    } else if (heading.includes('4.') || heading.includes('component')) {
      componentSection = section;
    }
  }

  const colors = extractColorsFromSection(colorSection);
  const typography = extractTypographyFromSection(typoSection);
  const spacing = extractSpacingFromSection(layoutSection);
  const rounded = extractRadiusFromSection(componentSection);

  const displayName = slug
    .replace(/[-.]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    slug,
    displayName,
    description: sections[1]?.slice(0, 200) ?? '',
    sourceFormat: 'markdown' as const,
    colors,
    typography,
    spacing,
    rounded,
    components: [],
  };
}
