/**
 * Poster Card Editor - ChangeBackgroundCommand
 */

import { nanoid } from 'nanoid';

import type { Background } from '../../node-tree/types';
import type { Command, StatePatch } from '../types';

export class ChangeBackgroundCommand implements Command {
  readonly id = nanoid(10);
  readonly type = 'change-background' as const;
  readonly timestamp = Date.now();

  constructor(
    private canvasNodeId: string,
    private oldBackground: Background,
    private newBackground: Background,
    readonly description = 'Change background',
  ) {}

  execute(): StatePatch {
    return (draft) => {
      const node = draft[this.canvasNodeId];
      if (node && node.type === 'canvas') {
        node.background = this.newBackground;
      }
    };
  }

  undo(): StatePatch {
    return (draft) => {
      const node = draft[this.canvasNodeId];
      if (node && node.type === 'canvas') {
        node.background = this.oldBackground;
      }
    };
  }

  merge(other: Command): Command | null {
    if (!(other instanceof ChangeBackgroundCommand)) return null;
    if (other.canvasNodeId !== this.canvasNodeId) return null;
    return new ChangeBackgroundCommand(
      this.canvasNodeId,
      this.oldBackground,
      other.newBackground,
    );
  }

  serialize() {
    return { type: 'change-background', canvasNodeId: this.canvasNodeId };
  }
}
