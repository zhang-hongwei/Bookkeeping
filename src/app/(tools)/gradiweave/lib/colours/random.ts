import type { OklchColour, ColourStop } from '../types/gradient';
import { oklchToHex } from './conversion';

export function randomOklch(): OklchColour {
  return {
    l: 0.3 + Math.random() * 0.5,
    c: 0.05 + Math.random() * 0.25,
    h: Math.random() * 360,
    a: 1,
  };
}

function makeColourStop(oklch: OklchColour): ColourStop {
  return {
    id: crypto.randomUUID(),
    oklch,
    hex: oklchToHex(oklch),
    displayFormat: 'oklch',
    locked: false,
  };
}

export function generateRandomPalette(count: number): ColourStop[] {
  return Array.from({ length: count }, () => makeColourStop(randomOklch()));
}

type Harmony = 'complementary' | 'triadic' | 'analogous' | 'split';

const HARMONY_OFFSETS: Record<Harmony, number[]> = {
  complementary: [0, 180],
  triadic: [0, 120, 240],
  analogous: [-30, 0, 30],
  split: [0, 150, 210],
};

export function generateHarmoniousPalette(
  baseHue: number,
  count: number,
  harmony: Harmony,
): ColourStop[] {
  const offsets = HARMONY_OFFSETS[harmony];
  return Array.from({ length: count }, (_, i) => {
    const offset = offsets[i % offsets.length];
    const oklch: OklchColour = {
      l: 0.4 + (i / count) * 0.3,
      c: 0.15 + Math.random() * 0.1,
      h: ((baseHue + offset + (Math.random() - 0.5) * 20) % 360 + 360) % 360,
      a: 1,
    };
    return makeColourStop(oklch);
  });
}
