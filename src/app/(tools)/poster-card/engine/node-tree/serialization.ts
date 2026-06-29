/**
 * Poster Card Editor - Tree Serialization
 *
 * Based on: 01-node-tree.md section 5, 10-asset-system.md (Serialization v3)
 * Serialize/deserialize the node tree with versioning.
 * Supports v2 (nodes only) and v3 (nodes + assets).
 */

import type { PosterNode } from './types';
import type { Asset } from '../assets/types';
import { validateTreeInvariants } from './validators';

// ── v2 Format ──

export interface SerializedDocumentV2 {
  version: '2.0';
  schema: 'poster-card-editor';
  nodes: Record<string, PosterNode>;
  rootNodeId: string;
  metadata: {
    createdAt: number;
    updatedAt: number;
    name: string;
  };
}

// ── v3 Format ──

export interface SerializedDocument {
  version: '3.0';
  schema: 'poster-card-editor';
  assets: Record<string, Asset>;
  nodes: Record<string, PosterNode>;
  rootNodeId: string;
  metadata: {
    createdAt: number;
    updatedAt: number;
    name: string;
    author?: string;
  };
}

/** @deprecated Use serializeTreeV3 for full asset support */
export function serializeTree(
  nodes: Record<string, PosterNode>,
  rootNodeId: string,
  name = 'Untitled',
): string {
  const doc: SerializedDocumentV2 = {
    version: '2.0',
    schema: 'poster-card-editor',
    nodes,
    rootNodeId,
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      name,
    },
  };
  return JSON.stringify(doc);
}

export function serializeTreeV3(
  nodes: Record<string, PosterNode>,
  rootNodeId: string,
  assets: Record<string, Asset>,
  name = 'Untitled',
  author?: string,
): string {
  const doc: SerializedDocument = {
    version: '3.0',
    schema: 'poster-card-editor',
    assets,
    nodes,
    rootNodeId,
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      name,
      author,
    },
  };
  return JSON.stringify(doc);
}

export interface DeserializedDocument {
  nodes: Record<string, PosterNode>;
  rootNodeId: string;
  assets?: Record<string, Asset>;
}

export function deserializeTree(json: string): DeserializedDocument {
  const doc = JSON.parse(json) as SerializedDocumentV2 | SerializedDocument;

  if (doc.schema !== 'poster-card-editor') {
    throw new Error(`Unknown schema: ${doc.schema}`);
  }

  if (doc.version !== '2.0' && doc.version !== '3.0') {
    throw new Error(`Unsupported version: ${doc.version}`);
  }

  // Validate invariants in dev
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    const errors = validateTreeInvariants(doc.nodes, doc.rootNodeId);
    if (errors.length > 0) {
      console.warn('[deserializeTree] Invariant violations:', errors);
    }
  }

  const result: DeserializedDocument = {
    nodes: doc.nodes,
    rootNodeId: doc.rootNodeId,
  };

  if (doc.version === '3.0') {
    result.assets = (doc as SerializedDocument).assets;
  }

  return result;
}
