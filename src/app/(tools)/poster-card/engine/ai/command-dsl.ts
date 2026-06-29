/**
 * AI Command DSL
 * Structured commands that AI can emit, with converters to engine Commands.
 */

import type { Command } from '../commands/types';
import type { PosterNode, Background } from '../node-tree/types';
import { Transaction } from '../commands/transaction';
import { AddNodeCommand } from '../commands/commands/add-node';
import { UpdateNodeCommand } from '../commands/commands/update-node';
import { RemoveNodeCommand } from '../commands/commands/remove-node';
import { ChangeBackgroundCommand } from '../commands/commands/change-background';
import { createMatrix, decomposeMatrix } from '../matrix-utils';

export type AICommandAction =
  | { type: 'add-node'; nodeType: PosterNode['type']; position: { x: number; y: number }; props: Record<string, unknown> }
  | { type: 'update-node'; nodeId: string; updates: Record<string, unknown> }
  | { type: 'remove-node'; nodeId: string }
  | { type: 'move-node'; nodeId: string; position: { x: number; y: number } }
  | { type: 'change-background'; background: Background };

export interface AICommand {
  commands: AICommandAction[];
  description: string;
}

export function convertAICommand(
  aiCommand: AICommand,
  currentNodes: Record<string, PosterNode>,
  rootNodeId: string,
): Command | null {
  const tx = new Transaction();

  for (const action of aiCommand.commands) {
    switch (action.type) {
      case 'add-node': {
        const localMatrix = createMatrix({ x: action.position.x, y: action.position.y });
        const baseNode = {
          type: action.nodeType,
          parentId: rootNodeId,
          childrenIds: [],
          localMatrix,
          width: (action.props.width as number) ?? 200,
          height: (action.props.height as number) ?? 200,
          opacity: 100,
          visible: true,
          locked: false,
          ...action.props,
        } as Omit<PosterNode, 'id'>;
        delete (baseNode as Record<string, unknown>).id;
        tx.add(new AddNodeCommand(baseNode, rootNodeId, undefined, `AI: Add ${action.nodeType}`));
        break;
      }

      case 'update-node': {
        const node = currentNodes[action.nodeId];
        if (!node) break;
        const oldFields: Record<string, unknown> = {};
        for (const key of Object.keys(action.updates)) {
          oldFields[key] = (node as Record<string, unknown>)[key];
        }
        tx.add(
          new UpdateNodeCommand(
            action.nodeId,
            oldFields as Partial<PosterNode>,
            action.updates as Partial<PosterNode>,
            `AI: Update ${action.nodeId}`,
          ),
        );
        break;
      }

      case 'remove-node': {
        tx.add(new RemoveNodeCommand(action.nodeId, currentNodes, `AI: Remove ${action.nodeId}`));
        break;
      }

      case 'move-node': {
        const node = currentNodes[action.nodeId];
        if (!node) break;
        const { rotation, scaleX, scaleY } = decomposeMatrix(node.localMatrix);
        const oldMatrix = node.localMatrix;
        const newMatrix = createMatrix({ x: action.position.x, y: action.position.y, rotation, scaleX, scaleY });
        tx.add(
          new UpdateNodeCommand(
            action.nodeId,
            { localMatrix: oldMatrix } as Partial<PosterNode>,
            { localMatrix: newMatrix } as Partial<PosterNode>,
            `AI: Move ${action.nodeId}`,
          ),
        );
        break;
      }

      case 'change-background': {
        const root = currentNodes[rootNodeId];
        if (root?.type === 'canvas') {
          const oldBg = (root as { background: Background }).background;
          tx.add(new ChangeBackgroundCommand(rootNodeId, oldBg, action.background, 'AI: Change background'));
        }
        break;
      }
    }
  }

  if (tx.size === 0) return null;
  return tx.commit(aiCommand.description);
}
