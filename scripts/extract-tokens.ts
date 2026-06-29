import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { parseDesignFile } from '../src/features/design-tokens/lib/parser';
import { normalizeBrand } from '../src/features/design-tokens/lib/normalizer';
import type { BrandDesignSystem } from '../src/features/design-tokens/types';

const BRANDS_DIR = resolve(__dirname, '../awesome-design-md/design-md');
const OUTPUT_FILE = resolve(__dirname, '../src/data/brand-tokens.json');

interface ExtractionStats {
  total: number;
  yaml: number;
  markdown: number;
  failed: string[];
  avgColors: number;
  avgTypography: number;
  avgSpacing: number;
  avgRadius: number;
  avgComponents: number;
  totalCustomTokens: number;
}

function extractAllBrands(): { brands: BrandDesignSystem[]; stats: ExtractionStats } {
  const brands: BrandDesignSystem[] = [];
  const failed: string[] = [];
  const stats = {
    total: 0, yaml: 0, markdown: 0, failed: [],
    avgColors: 0, avgTypography: 0, avgSpacing: 0, avgRadius: 0, avgComponents: 0,
    totalCustomTokens: 0,
  };

  const dirs = readdirSync(BRANDS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const dir of dirs) {
    const designFile = join(BRANDS_DIR, dir, 'DESIGN.md');
    if (!existsSync(designFile)) {
      failed.push(`${dir}: DESIGN.md not found`);
      continue;
    }

    try {
      const content = readFileSync(designFile, 'utf-8');
      const raw = parseDesignFile(content, dir);
      const brand = normalizeBrand(raw);

      if (raw.sourceFormat === 'yaml') stats.yaml++;
      else stats.markdown++;

      stats.avgColors += raw.colors.length;
      stats.avgTypography += raw.typography.length;
      stats.avgSpacing += raw.spacing.length;
      stats.avgRadius += raw.rounded.length;
      stats.avgComponents += raw.components.length;
      stats.totalCustomTokens += brand.customTokens.length;

      brands.push(brand);
      stats.total++;
    } catch (err) {
      failed.push(`${dir}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (stats.total > 0) {
    stats.avgColors = Math.round(stats.avgColors / stats.total);
    stats.avgTypography = Math.round(stats.avgTypography / stats.total);
    stats.avgSpacing = Math.round(stats.avgSpacing / stats.total);
    stats.avgRadius = Math.round(stats.avgRadius / stats.total);
    stats.avgComponents = Math.round(stats.avgComponents / stats.total);
  }
  stats.failed = failed;

  return { brands, stats };
}

function main(): void {
  console.log('Extracting design tokens from all brand files...');
  console.log(`Source: ${BRANDS_DIR}`);

  const { brands, stats } = extractAllBrands();

  writeFileSync(OUTPUT_FILE, JSON.stringify(brands, null, 2), 'utf-8');

  console.log('\n=== Extraction Results ===');
  console.log(`Total brands: ${stats.total}`);
  console.log(`  YAML (Type A): ${stats.yaml}`);
  console.log(`  Markdown (Type B): ${stats.markdown}`);
  console.log(`  Failed: ${stats.failed.length}`);
  console.log(`\nAverage tokens per brand:`);
  console.log(`  Colors: ${stats.avgColors}`);
  console.log(`  Typography: ${stats.avgTypography}`);
  console.log(`  Spacing: ${stats.avgSpacing}`);
  console.log(`  Radius: ${stats.avgRadius}`);
  console.log(`  Components: ${stats.avgComponents}`);
  console.log(`  Custom (unmapped): ${stats.totalCustomTokens}`);

  if (stats.failed.length > 0) {
    console.log('\nFailed brands:');
    for (const f of stats.failed) console.log(`  ✗ ${f}`);
  }

  console.log(`\nOutput: ${OUTPUT_FILE}`);
  console.log(`File size: ${(Buffer.byteLength(JSON.stringify(brands)) / 1024).toFixed(1)} KB`);
}

main();
