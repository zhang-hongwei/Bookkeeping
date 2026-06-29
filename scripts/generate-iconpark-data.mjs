#!/usr/bin/env node

/**
 * Generates per-category JSON files from IconPark icons.json.
 * Outputs to public/icons/iconpark/ for runtime fetch.
 * Also generates a lightweight TS index with category catalog + loader.
 *
 * Usage: node scripts/generate-iconpark-data.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const ICONS_JSON = resolve(ROOT, 'IconPark-master/source/icons.json');
const JSON_OUT = resolve(ROOT, 'public/icons/iconpark');
const TS_INDEX = resolve(ROOT, 'src/app/(tools)/poster-card/engine/assets/iconpark/index.ts');

// ── Helpers ──

function kebabToTitle(kebab) {
  return kebab
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function extractSvgContent(svg) {
  const match = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  return match ? match[1].trim() : svg;
}

function extractViewBox(svg) {
  const match = svg.match(/viewBox="([^"]+)"/);
  return match ? match[1] : '0 0 48 48';
}

function cleanDir(dir) {
  mkdirSync(dir, { recursive: true });
  const files = readdirSync(dir);
  for (const f of files) {
    unlinkSync(resolve(dir, f));
  }
}

// ── Main ──

console.log('Reading icons.json...');
const raw = JSON.parse(readFileSync(ICONS_JSON, 'utf-8'));
console.log(`Total icons: ${raw.length}`);

// Group by category
const grouped = new Map();
for (const icon of raw) {
  const cat = icon.category;
  if (!grouped.has(cat)) grouped.set(cat, []);
  grouped.get(cat).push(icon);
}

console.log(`Categories: ${grouped.size}`);

// Ensure output dirs
cleanDir(JSON_OUT);
mkdirSync(resolve(ROOT, 'src/app/(tools)/poster-card/engine/assets/iconpark'), { recursive: true });

const catalog = [];

// Generate per-category JSON files
for (const [category, icons] of grouped) {
  const fileName = category.charAt(0).toLowerCase() + category.slice(1);

  catalog.push({ category, fileName, count: icons.length });

  const entries = icons.map((icon) => {
    let svgContent = extractSvgContent(icon.svg);
    // Wrap in <g fill="none"> to preserve IconPark's default fill=none behavior
    svgContent = `<g fill="none">${svgContent}</g>`;
    return {
      id: `iconpark-${icon.name}`,
      name: kebabToTitle(icon.name),
      svgContent,
      viewBox: extractViewBox(icon.svg),
      tags: ['icon', ...icon.name.split('-'), category.toLowerCase()],
    };
  });

  writeFileSync(
    resolve(JSON_OUT, `${fileName}.json`),
    JSON.stringify({ category, icons: entries }),
    'utf-8',
  );
  console.log(`  ${category}: ${icons.length} icons → ${fileName}.json`);
}

// Generate lightweight TS index
const indexTs = `/**
 * IconPark icons - Category catalog + lazy loader
 * Auto-generated. DO NOT EDIT.
 */

import type { ShapeAsset } from '../types';

export interface IconParkCategoryInfo {
  category: string;
  fileName: string;
  count: number;
}

export const ICONPARK_CATEGORIES: IconParkCategoryInfo[] = [
${catalog.map((c) => `  { category: '${c.category}', fileName: '${c.fileName}', count: ${c.count} },`).join('\n')}
];

const cache = new Map<string, ShapeAsset[]>();

export async function loadIconParkCategory(category: string): Promise<ShapeAsset[]> {
  if (cache.has(category)) return cache.get(category)!;

  const info = ICONPARK_CATEGORIES.find((c) => c.category === category);
  if (!info) return [];

  const res = await fetch(\`/icons/iconpark/\${info.fileName}.json\`);
  const data = await res.json();

  const icons: ShapeAsset[] = data.icons.map((i: any) => ({
    id: i.id,
    type: 'shape' as const,
    name: i.name,
    tags: i.tags,
    createdAt: 0,
    updatedAt: 0,
    source: { type: 'preset' as const },
    svgContent: i.svgContent,
    viewBox: i.viewBox,
    category: 'icon' as const,
    iconparkCategory: category,
    resizable: true,
  }));

  cache.set(category, icons);
  return icons;
}
`;

writeFileSync(TS_INDEX, indexTs, 'utf-8');

console.log(`\nGenerated ${catalog.length} JSON files → ${JSON_OUT}`);
console.log(`Generated TS index → ${TS_INDEX}`);
