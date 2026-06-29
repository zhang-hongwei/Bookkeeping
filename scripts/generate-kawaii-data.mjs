#!/usr/bin/env node

/**
 * Converts react-kawaii TSX components to static SVG JSON data.
 * Renders each character with "blissful" mood and default color.
 *
 * Usage: node scripts/generate-kawaii-data.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const COMPONENTS_DIR = resolve(ROOT, 'react-kawaii-main/packages/react-kawaii/src/components');
const PATHS_FILE = resolve(ROOT, 'react-kawaii-main/packages/react-kawaii/src/components/common/paths.ts');
const OUT_JSON = resolve(ROOT, 'public/icons/iconpark/kawaii.json');

// ── Face SVG for "blissful" mood (static) ──

function extractPathsObject() {
  const content = readFileSync(PATHS_FILE, 'utf-8');
  const paths = {};
  // Extract each path value
  const regex = /(\w+):\s*'([^']*)'/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    paths[match[1]] = match[2];
  }
  return paths;
}

function buildBlissfulFaceSvg(transform) {
  return `
  <g id="kawaii-face" transform="${transform}">
    <defs>
      <path d="M1.45656876,3.14684877 C1.45656876,3.14684877 1.45656876,3.14684877 1.45656876,3.14684877 L0,3.14685315 C0,2.31818182 0.346033696,1.50734266 0.949429952,0.922027972 C1.55390756,0.335664336 2.38979521,0 3.2440659,0 L25.9525272,0 C26.8067979,0 27.6416041,0.335664336 28.2460818,0.922027972 C28.8505594,1.50734266 29.1965931,2.31818182 29.1965931,3.14685315 C29.1890236,5.85734266 28.240675,8.44825175 26.7127199,10.6814685 C25.1771954,12.9104895 23.0317865,14.8122378 20.4040931,16.0227273 C18.6544603,16.8251748 16.6809868,17.3087413 14.5982965,17.3076923 C11.4666916,17.3076923 8.61299495,16.2241259 6.33025392,14.5951049 C4.0399434,12.9587413 2.264358,10.779021 1.16245695,8.33811189 C0.431460764,6.70909091 0.0010813553,4.95314685 0,3.14685315 L1.45656896,3.14685315 Z" id="kawaii-face__path-1" />
    </defs>
    <g id="kawaii-face__mouth" transform="translate(18.000000, 16.000000)">
      <g id="kawaii-face__mouth__joy" transform="translate(0.000000, 1.000000)">
        <mask id="kawaii-face__mask-2" fill="white">
          <use xlinkHref="#kawaii-face__path-1" />
        </mask>
        <use id="Combined-Shape" fill="#000000" xlinkHref="#kawaii-face__path-1" />
      </g>
    </g>
    <g id="kawaii-face__blush" transform="translate(0.000000, 15.000000)" fill="#000000" opacity="0.2">
      <circle cx="3" cy="3" r="3" />
      <circle cx="63" cy="3" r="3" />
    </g>
    <g id="kawaii-face__eyes" transform="translate(2.000000, 0.000000)" fill="#000000">
      <g id="kawaii-face__eyes__arc" transform="translate(1.000000, 0.000000)">
        <path d="M11.3298651,9.72876106 C9.83321993,9.72876106 8.62018766,8.55758439 8.62018766,7.11258087 C8.62018766,6.27104292 7.91115541,5.58647579 7.03954249,5.58647579 C6.16883282,5.58647579 5.45889734,6.27104292 5.45889734,7.11258087 C5.45889734,8.55758439 4.2467683,9.72876106 2.74921991,9.72876106 C1.25257476,9.72876106 0.0395424927,8.55758439 0.0395424927,7.11258087 C0.0395424927,3.38626826 3.18005862,0.354115435 7.03954249,0.354115435 C10.8999296,0.354115435 14.0395425,3.38626826 14.0395425,7.11258087 C14.0395425,8.55758439 12.8274135,9.72876106 11.3298651,9.72876106" />
        <path d="M57.3298651,9.72876106 C55.8332199,9.72876106 54.6201877,8.55758439 54.6201877,7.11258087 C54.6201877,6.27104292 53.9111554,5.58647579 53.0395425,5.58647579 C52.1688328,5.58647579 51.4588973,6.27104292 51.4588973,7.11258087 C51.4588973,8.55758439 50.2467683,9.72876106 48.7492199,9.72876106 C47.2525748,9.72876106 46.0395425,8.55758439 46.0395425,7.11258087 C46.0395425,3.38626826 49.1800586,0.354115435 53.0395425,0.354115435 C56.8999296,0.354115435 60.0395425,3.38626826 60.0395425,7.11258087 C60.0395425,8.55758439 58.8274135,9.72876106 57.3298651,9.72876106" />
      </g>
    </g>
  </g>`;
}

// ── Extract body SVG from component ──

function extractComponentData(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const name = resolve(dirname(filePath), filePath).split('/').pop().replace('.tsx', '');

  // Extract face transform
  const scaleMatch = content.match(/figmaFaceScale\s*=\s*getFaceScale\(([^)]+)\)/);
  const xyMatch = content.match(/figmaFaceXYPosition\s*=\s*'([^']+)'/);

  if (!scaleMatch || !xyMatch) return null;

  const scaleVal = scaleMatch[1];
  const xyVal = xyMatch[1];

  // getFaceScale(x) = x / 68
  const faceScale = parseFloat(scaleVal) / 68;
  const faceTransform = `translate(${xyVal}) scale(${faceScale})`;

  // Extract everything between <svg...> and <Face (the body paths)
  const svgMatch = content.match(/<svg[^>]*>([\s\S]*?)<Face/);
  if (!svgMatch) return null;

  let body = svgMatch[1].trim();

  // Convert JSX to SVG: replace {color} with default, handle other JSX specifics
  body = body
    .replace(/\{color\}/g, '#FFD882')
    .replace(/\{size\}/g, '240')
    .replace(/\{...rest\}/g, '')
    .replace(/\{...props\}/g, '')
    .replace(/\{uniqueId\}/g, 'kawaii')
    .replace(/=\{([^}]+)\}/g, (match, expr) => {
      // Handle simple expressions like opacity={0.2}, x={134}, etc.
      if (/^[\d.]+$/.test(expr)) return `="${expr}"`;
      if (/^true$/.test(expr)) return '';
      if (/^false$/.test(expr)) return '';
      if (/^"[^"]*"$/.test(expr)) return `=${expr}`;
      return '';
    })
    // Remove JSX style objects
    .replace(/style=\{\{[^}]*\}\}/g, '')
    // Remove JSX className
    .remove?.(/className="[^"]*"/g) || body;

  // Clean up extra whitespace
  body = body.replace(/\n\s*\n/g, '\n').trim();

  // Build complete SVG
  const faceSvg = buildBlissfulFaceSvg(faceTransform);
  const svgContent = `${body}\n${faceSvg}`;

  return {
    id: `kawaii-${name.toLowerCase()}`,
    name,
    svgContent,
    viewBox: '0 0 240 240',
    tags: ['icon', 'kawaii', name.toLowerCase()],
  };
}

// ── Main ──

console.log('Scanning react-kawaii components...');

const files = readdirSync(COMPONENTS_DIR)
  .filter((f) => f.endsWith('.tsx') && f.charAt(0) === f.charAt(0).toUpperCase())
  .map((f) => resolve(COMPONENTS_DIR, f));

const icons = [];

for (const file of files) {
  const data = extractComponentData(file);
  if (data) {
    icons.push(data);
    console.log(`  ${data.name}: OK`);
  } else {
    console.log(`  ${file.split('/').pop()}: SKIPPED (could not extract)`);
  }
}

// Write JSON
mkdirSync(dirname(OUT_JSON), { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify({ category: 'Kawaii', icons }, null, 2), 'utf-8');

console.log(`\nGenerated ${icons.length} kawaii icons → ${OUT_JSON}`);

// Also update the iconpark index.ts to include Kawaii category
const indexFile = resolve(ROOT, 'src/app/(tools)/poster-card/engine/assets/iconpark/index.ts');
let indexContent = readFileSync(indexFile, 'utf-8');

if (!indexContent.includes('Kawaii')) {
  // Add Kawaii to categories array
  indexContent = indexContent.replace(
    /\];\n\nconst cache/,
    `  { category: 'Kawaii', fileName: 'kawaii', count: ${icons.length} },\n];\n\nconst cache`,
  );
  writeFileSync(indexFile, indexContent, 'utf-8');
  console.log('Added Kawaii category to iconpark/index.ts');
}
