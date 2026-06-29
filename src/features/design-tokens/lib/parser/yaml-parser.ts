import { parse as parseYaml } from 'yaml';

export interface RawColorToken {
  name: string;
  value: string;
}

export interface RawTypographyToken {
  name: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: string;
  textTransform?: string;
  fontFeature?: string;
}

export interface RawComponentToken {
  name: string;
  backgroundColor?: string;
  textColor?: string;
  typography?: string;
  rounded?: string;
  padding?: string;
  height?: string;
  size?: string;
}

export interface RawParsedBrand {
  slug: string;
  displayName: string;
  description: string;
  sourceFormat: 'yaml' | 'markdown';
  colors: RawColorToken[];
  typography: RawTypographyToken[];
  spacing: { name: string; value: number }[];
  rounded: { name: string; value: number }[];
  components: RawComponentToken[];
}

function parsePxValue(val: unknown): number {
  if (typeof val === 'number') return val;
  const str = String(val).replace(/px$/i, '');
  const num = parseFloat(str);
  return Number.isNaN(num) ? 0 : num;
}

function sanitizeYamlFrontmatter(yaml: string): string {
  return yaml
    .split('\n')
    .map((line) => {
      // Quote unquoted description values that contain colons
      const descMatch = line.match(/^(description|属于)\s*:\s*(.+)$/);
      if (descMatch) {
        const value = descMatch[2].trim();
        if (!value.startsWith('"') && !value.startsWith("'") && !value.startsWith('|') && !value.startsWith('>') && value.includes(':')) {
          return `${descMatch[1]}: "${value.replace(/"/g, '\\"')}"`;
        }
      }
      return line;
    })
    .join('\n');
}

export function parseYamlDesign(content: string, slug: string): RawParsedBrand | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const data = parseYaml(sanitizeYamlFrontmatter(match[1]));
  if (!data || typeof data !== 'object') return null;

  const colors: RawColorToken[] = [];
  if (data.colors && typeof data.colors === 'object') {
    for (const [name, value] of Object.entries(data.colors)) {
      if (typeof value === 'string') {
        colors.push({ name, value });
      }
    }
  }

  const typography: RawTypographyToken[] = [];
  if (data.typography && typeof data.typography === 'object') {
    for (const [name, token] of Object.entries(data.typography)) {
      if (token && typeof token === 'object') {
        const t = token as Record<string, unknown>;
        typography.push({
          name,
          fontFamily: String(t.fontFamily ?? ''),
          fontSize: String(t.fontSize ?? '16px'),
          fontWeight: typeof t.fontWeight === 'number' ? t.fontWeight : 400,
          lineHeight: typeof t.lineHeight === 'number' ? t.lineHeight : 1.5,
          letterSpacing: t.letterSpacing != null ? String(t.letterSpacing) : undefined,
          textTransform: typeof t.textTransform === 'string' ? t.textTransform : undefined,
          fontFeature: t.fontFeature != null ? String(t.fontFeature) : undefined,
        });
      }
    }
  }

  const spacing: { name: string; value: number }[] = [];
  if (data.spacing && typeof data.spacing === 'object') {
    for (const [name, value] of Object.entries(data.spacing)) {
      spacing.push({ name, value: parsePxValue(value) });
    }
  }

  const rounded: { name: string; value: number }[] = [];
  if (data.rounded && typeof data.rounded === 'object') {
    for (const [name, value] of Object.entries(data.rounded)) {
      rounded.push({ name, value: parsePxValue(value) });
    }
  }

  const components: RawComponentToken[] = [];
  if (data.components && typeof data.components === 'object') {
    for (const [name, token] of Object.entries(data.components)) {
      if (token && typeof token === 'object') {
        const c = token as Record<string, unknown>;
        components.push({
          name,
          backgroundColor: c.backgroundColor != null ? String(c.backgroundColor) : undefined,
          textColor: c.textColor != null ? String(c.textColor) : undefined,
          typography: c.typography != null ? String(c.typography) : undefined,
          rounded: c.rounded != null ? String(c.rounded) : undefined,
          padding: c.padding != null ? String(c.padding) : undefined,
          height: c.height != null ? String(c.height) : undefined,
          size: c.size != null ? String(c.size) : undefined,
        });
      }
    }
  }

  return {
    slug,
    displayName: typeof data.name === 'string' ? data.name.replace(/\s*Inspired\s*$/i, '').trim() : slug,
    description: typeof data.description === 'string' ? data.description : '',
    sourceFormat: 'yaml',
    colors,
    typography,
    spacing,
    rounded,
    components,
  };
}
