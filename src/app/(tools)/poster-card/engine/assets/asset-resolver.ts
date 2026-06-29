/**
 * Poster Card Editor - Asset Resolver
 *
 * Based on: 10-asset-system.md section "Node -> Asset References"
 * Resolves node asset references to concrete rendering data.
 */

import type { ImageNode, TextNode, ShapeNode } from '../node-tree/types';
import type {
  Asset,
  ResolvedImageAsset,
  ResolvedFontAsset,
  ResolvedShapeAsset,
  ResolvedTypography,
  ResolvedColor,
} from './types';
import { isImageAsset, isFontAsset, isShapeAsset, isStyleTokenAsset } from './types';

export interface AssetResolver {
  resolveImage(node: ImageNode): ResolvedImageAsset | null;
  resolveFont(node: TextNode): ResolvedFontAsset | null;
  resolveShape(node: ShapeNode): ResolvedShapeAsset | null;
  resolveTypography(node: TextNode): ResolvedTypography;
  resolveColor(node: TextNode): ResolvedColor;
}

/**
 * Create an asset resolver bound to an asset lookup function.
 */
export function createAssetResolver(
  getAsset: (id: string) => Asset | undefined,
  isFontLoaded: (fontFamily: string) => boolean,
): AssetResolver {
  return {
    resolveImage(node: ImageNode): ResolvedImageAsset | null {
      if (!node.assetId) {
        // Fallback to inline src for backward compatibility
        return node.src
          ? { src: node.src, width: node.width, height: node.height }
          : null;
      }
      const asset = getAsset(node.assetId);
      if (!asset || !isImageAsset(asset)) return null;
      return {
        src: asset.src,
        width: asset.width,
        height: asset.height,
        dominantColor: asset.dominantColor,
        alt: asset.alt,
      };
    },

    resolveFont(node: TextNode): ResolvedFontAsset | null {
      if (!node.fontAssetId) {
        // Fallback to inline fontFamily
        return {
          fontFamily: node.fontFamily,
          loaded: true,
          fontWeightRange: [node.fontWeight],
        };
      }
      const asset = getAsset(node.fontAssetId);
      if (!asset || !isFontAsset(asset)) return null;
      return {
        fontFamily: asset.fontFamily,
        fontUrl: asset.fontUrl,
        fontWeightRange: asset.fontWeightRange,
        loaded: isFontLoaded(asset.fontFamily),
      };
    },

    resolveShape(node: ShapeNode): ResolvedShapeAsset | null {
      if (!node.assetId) return null;
      const asset = getAsset(node.assetId);
      if (!asset || !isShapeAsset(asset)) return null;
      return {
        svgContent: asset.svgContent,
        viewBox: asset.viewBox,
        defaultFill: asset.defaultFill,
        defaultStroke: asset.defaultStroke,
      };
    },

    resolveTypography(node: TextNode): ResolvedTypography {
      const base: ResolvedTypography = {
        fontSize: node.fontSize,
        fontWeight: node.fontWeight,
        lineHeight: node.lineHeight,
        letterSpacing: node.letterSpacing,
      };

      if (!node.typographyId) return base;

      const asset = getAsset(node.typographyId);
      if (!asset || !isStyleTokenAsset(asset) || asset.tokenType !== 'typography') return base;

      const v = asset.value;
      return {
        fontSize: v.fontSize ?? base.fontSize,
        fontWeight: v.fontWeight ?? base.fontWeight,
        lineHeight: v.lineHeight ?? base.lineHeight,
        letterSpacing: v.letterSpacing ?? base.letterSpacing,
        textTransform: v.textTransform,
      };
    },

    resolveColor(node: TextNode): ResolvedColor {
      const base: ResolvedColor = { color: node.color, opacity: 1 };

      if (!node.colorId) return base;

      const asset = getAsset(node.colorId);
      if (!asset || !isStyleTokenAsset(asset) || asset.tokenType !== 'color') return base;

      const v = asset.value;
      return {
        color: v.color ?? base.color,
        opacity: v.opacity ?? base.opacity,
      };
    },
  };
}
