/**
 * Component types for saveable, reusable node groups.
 */

import type { PosterNode } from '../node-tree/types';

export interface ComponentAsset {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  nodes: Record<string, PosterNode>;
  rootNodeId: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
