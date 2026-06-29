/**
 * Font loading utility using the FontFace API.
 */

import type { FontAsset } from './types';

export async function loadFontAsset(asset: FontAsset): Promise<void> {
  if (!asset.fontUrl) return;

  const font = new FontFace(asset.fontFamily, `url(${asset.fontUrl})`, {
    style: asset.isItalic ? 'italic' : 'normal',
    weight: asset.fontWeightRange.length > 0
      ? String(asset.fontWeightRange[0])
      : '400',
  });

  await font.load();
  document.fonts.add(font);
}
