import { parse, formatHex, converter } from 'culori';
import type { OklchColour } from '../types/gradient';

const toOklch = converter('oklch');
const toRgb = converter('rgb');

export function hexToOklch(hex: string): OklchColour {
  const colour = toOklch(parse(hex));
  if (!colour) {
    return { l: 0, c: 0, h: 0, a: 1 };
  }
  return {
    l: colour.l,
    c: colour.c,
    h: colour.h ?? 0,
    a: colour.alpha ?? 1,
  };
}

export function oklchToHex(oklch: OklchColour): string {
  const rgb = toRgb({ mode: 'oklch', l: oklch.l, c: oklch.c, h: oklch.h });
  if (!rgb) return '#000000';

  const clamped = {
    mode: 'rgb' as const,
    r: Math.max(0, Math.min(1, rgb.r)),
    g: Math.max(0, Math.min(1, rgb.g)),
    b: Math.max(0, Math.min(1, rgb.b)),
  };

  return formatHex(clamped);
}

export function isInGamut(oklch: OklchColour): boolean {
  const rgb = toRgb({ mode: 'oklch', l: oklch.l, c: oklch.c, h: oklch.h });
  if (!rgb) return false;
  return (
    rgb.r >= 0 && rgb.r <= 1 &&
    rgb.g >= 0 && rgb.g <= 1 &&
    rgb.b >= 0 && rgb.b <= 1
  );
}

export function oklchToCssString(oklch: OklchColour): string {
  const l = oklch.l.toFixed(3);
  const c = oklch.c.toFixed(3);
  const h = oklch.h.toFixed(1);
  if (oklch.a < 1) {
    return `oklch(${l} ${c} ${h} / ${oklch.a.toFixed(2)})`;
  }
  return `oklch(${l} ${c} ${h})`;
}
