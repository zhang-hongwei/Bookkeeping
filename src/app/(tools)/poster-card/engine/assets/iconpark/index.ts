/**
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
  { category: 'Clothes', fileName: 'clothes', count: 72 },
  { category: 'Health', fileName: 'health', count: 70 },
  { category: 'Office', fileName: 'office', count: 215 },
  { category: 'Travel', fileName: 'travel', count: 101 },
  { category: 'Music', fileName: 'music', count: 57 },
  { category: 'Charts', fileName: 'charts', count: 68 },
  { category: 'Character', fileName: 'character', count: 33 },
  { category: 'Abstract', fileName: 'abstract', count: 121 },
  { category: 'Hardware', fileName: 'hardware', count: 223 },
  { category: 'Edit', fileName: 'edit', count: 364 },
  { category: 'Money', fileName: 'money', count: 80 },
  { category: 'Others', fileName: 'others', count: 67 },
  { category: 'Peoples', fileName: 'peoples', count: 50 },
  { category: 'Brand', fileName: 'brand', count: 83 },
  { category: 'Arrows', fileName: 'arrows', count: 137 },
  { category: 'Makeups', fileName: 'makeups', count: 46 },
  { category: 'Base', fileName: 'base', count: 55 },
  { category: 'Sports', fileName: 'sports', count: 84 },
  { category: 'Safe', fileName: 'safe', count: 18 },
  { category: 'Time', fileName: 'time', count: 17 },
  { category: 'Connect', fileName: 'connect', count: 52 },
  { category: 'Emoji', fileName: 'emoji', count: 37 },
  { category: 'Foods', fileName: 'foods', count: 121 },
  { category: 'Build', fileName: 'build', count: 70 },
  { category: 'Constellation', fileName: 'constellation', count: 12 },
  { category: 'Game', fileName: 'game', count: 36 },
  { category: 'Baby', fileName: 'baby', count: 47 },
  { category: 'Hands', fileName: 'hands', count: 66 },
  { category: 'Animals', fileName: 'animals', count: 36 },
  { category: 'Energy', fileName: 'energy', count: 32 },
  { category: 'Life', fileName: 'life', count: 25 },
  { category: 'Operate', fileName: 'operate', count: 31 },
  { category: 'Components', fileName: 'components', count: 8 },
  { category: 'Weather', fileName: 'weather', count: 16 },
  { category: 'Measurement', fileName: 'measurement', count: 13 },
  { category: 'Communicate', fileName: 'communicate', count: 27 },
  { category: 'Datas', fileName: 'datas', count: 24 },
  { category: 'Graphics', fileName: 'graphics', count: 18 },
  { category: 'Industry', fileName: 'industry', count: 26 },
];

const cache = new Map<string, ShapeAsset[]>();

export async function loadIconParkCategory(category: string): Promise<ShapeAsset[]> {
  if (cache.has(category)) return cache.get(category)!;

  const info = ICONPARK_CATEGORIES.find((c) => c.category === category);
  if (!info) return [];

  const res = await fetch(`/icons/iconpark/${info.fileName}.json`);
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
