import { parseYamlDesign } from './yaml-parser';
import { parseMarkdownDesign } from './markdown-parser';
import type { RawParsedBrand } from './yaml-parser';

export type { RawParsedBrand, RawColorToken, RawTypographyToken, RawComponentToken } from './yaml-parser';

export function parseDesignFile(content: string, slug: string): RawParsedBrand {
  const trimmed = content.trim();

  if (trimmed.startsWith('---')) {
    const result = parseYamlDesign(trimmed, slug);
    if (result) return result;
  }

  return parseMarkdownDesign(trimmed, slug);
}
