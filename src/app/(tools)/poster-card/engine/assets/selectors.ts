/**
 * Poster Card Editor - Asset Store Selectors
 *
 * Based on: 10-asset-system.md
 * Optimized React hooks for fine-grained asset subscriptions.
 */

import { useShallow } from 'zustand/react/shallow';
import { useAssetStore } from './asset-store';
import type {
  Asset,
  AssetType,
  ImageAsset,
  FontAsset,
  ShapeAsset,
  TemplateAsset,
  StyleTokenAsset,
  AssetRuntimeState,
  ResolvedTypography,
  ResolvedColor,
} from './types';
import type { TextNode } from '../node-tree/types';

// ── Basic Selectors ──

export function useAsset(id: string | null): Asset | null {
  return useAssetStore(
    useShallow((s) => (id ? s.assets[id] ?? null : null)),
  );
}

export function useAssetsByType(type: AssetType): Asset[] {
  return useAssetStore(
    useShallow((s) =>
      (s.assetIdsByType[type] ?? [])
        .map((id) => s.assets[id])
        .filter(Boolean),
    ),
  );
}

export function useImageAssets(): ImageAsset[] {
  return useAssetsByType('image') as ImageAsset[];
}

export function useFontAssets(): FontAsset[] {
  return useAssetsByType('font') as FontAsset[];
}

export function useShapeAssets(): ShapeAsset[] {
  return useAssetsByType('shape') as ShapeAsset[];
}

export function useTemplateAssets(): TemplateAsset[] {
  return useAssetsByType('template') as TemplateAsset[];
}

export function useIconAssets(): ShapeAsset[] {
  return useAssetStore(
    useShallow((s) =>
      (s.assetIdsByType['shape'] ?? [])
        .map((id) => s.assets[id])
        .filter((a): a is ShapeAsset => a?.type === 'shape' && a.category === 'icon'),
    ),
  );
}

// ── Style Token Selectors ──

export function useStylesByType(tokenType: StyleTokenAsset['tokenType']): StyleTokenAsset[] {
  return useAssetStore(
    useShallow((s) =>
      (s.assetIdsByType['style-token'] ?? [])
        .map((id) => s.assets[id])
        .filter((a): a is StyleTokenAsset => a?.type === 'style-token' && (a as StyleTokenAsset).tokenType === tokenType),
    ),
  );
}

export function useTypographyTokens(): StyleTokenAsset[] {
  return useStylesByType('typography');
}

export function useColorTokens(): StyleTokenAsset[] {
  return useStylesByType('color');
}

// ── Resolved Data Hooks ──

export function useResolvedTypography(node: TextNode | null): ResolvedTypography | null {
  const typographyId = node?.typographyId;
  const tokenAsset = useAssetStore(
    useShallow((s) =>
      typographyId ? s.assets[typographyId] : undefined,
    ),
  ) as StyleTokenAsset | undefined;

  if (!node) return null;

  const base: ResolvedTypography = {
    fontSize: node.fontSize,
    fontWeight: node.fontWeight,
    lineHeight: node.lineHeight,
    letterSpacing: node.letterSpacing,
  };

  if (!tokenAsset || tokenAsset.tokenType !== 'typography') return base;

  const v = tokenAsset.value;
  return {
    fontSize: v.fontSize ?? base.fontSize,
    fontWeight: v.fontWeight ?? base.fontWeight,
    lineHeight: v.lineHeight ?? base.lineHeight,
    letterSpacing: v.letterSpacing ?? base.letterSpacing,
    textTransform: v.textTransform,
  };
}

export function useResolvedColor(node: TextNode | null): ResolvedColor | null {
  const colorId = node?.colorId;
  const tokenAsset = useAssetStore(
    useShallow((s) => (colorId ? s.assets[colorId] : undefined)),
  ) as StyleTokenAsset | undefined;

  if (!node) return null;

  const base: ResolvedColor = { color: node.color, opacity: 1 };

  if (!tokenAsset || tokenAsset.tokenType !== 'color') return base;

  const v = tokenAsset.value;
  return {
    color: v.color ?? base.color,
    opacity: v.opacity ?? base.opacity,
  };
}

// ── Runtime State ──

export function useFontLoaded(fontFamily: string): boolean {
  return useAssetStore(
    useShallow((s) => s.loadedFonts.includes(fontFamily)),
  );
}

export function useAssetRuntime(assetId: string | null): AssetRuntimeState | null {
  return useAssetStore(
    useShallow((s) => (assetId ? s.assetRuntime[assetId] ?? null : null)),
  );
}

// ── Search ──

export function useAssetSearchResults(type?: AssetType): Asset[] {
  const query = useAssetStore((s) => s.searchQuery);
  const store = useAssetStore.getState();
  return store.searchAssets(query, type);
}

// ── Panel Mode ──

export function useAssetPanelMode(): {
  mode: 'insert' | 'replace';
  targetAssetType: AssetType | null;
  targetAssetId: string | null;
  selectedNodeId: string | null;
} {
  // Dynamic import to avoid circular dependency at module level
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useEditorStore } = require('../store') as typeof import('../store');
  const selectedIds = useEditorStore((s: { selectedIds: Set<string> }) => s.selectedIds);
  const nodes = useEditorStore((s: { nodes: Record<string, import('../node-tree/types').PosterNode> }) => s.nodes);

  const selectedId = selectedIds.size === 1 ? [...selectedIds][0] : null;
  const node = selectedId ? nodes[selectedId] : null;

  if (!node || !selectedId) {
    return { mode: 'insert', targetAssetType: null, targetAssetId: null, selectedNodeId: null };
  }

  switch (node.type) {
    case 'image':
      return {
        mode: 'replace',
        targetAssetType: 'image',
        targetAssetId: (node as import('../node-tree/types').ImageNode).assetId ?? null,
        selectedNodeId: selectedId,
      };
    case 'text':
      return {
        mode: 'replace',
        targetAssetType: 'font',
        targetAssetId: (node as import('../node-tree/types').TextNode).fontAssetId ?? null,
        selectedNodeId: selectedId,
      };
    case 'shape':
      return {
        mode: 'replace',
        targetAssetType: 'shape',
        targetAssetId: (node as import('../node-tree/types').ShapeNode).assetId ?? null,
        selectedNodeId: selectedId,
      };
    default:
      return { mode: 'insert', targetAssetType: null, targetAssetId: null, selectedNodeId: null };
  }
}
