/**
 * Poster Card Editor - Transaction & CompositeCommand
 *
 * Based on: 02-command-system.md section 4
 * Combines multiple commands into a single undo step.
 */

import { nanoid } from 'nanoid';

import type { Command, StatePatch } from './types';

export class CompositeCommand implements Command {
  readonly id = nanoid(10);
  readonly type = 'composite' as const;
  readonly timestamp = Date.now();

  constructor(
    private commands: Command[],
    readonly description = 'Composite operation',
  ) {}

  execute(): StatePatch {
    return (draft) => {
      for (const cmd of this.commands) {
        const patch = cmd.execute();
        patch(draft);
      }
    };
  }

  undo(): StatePatch {
    return (draft) => {
      // Reverse order for undo
      for (const cmd of [...this.commands].reverse()) {
        const patch = cmd.undo();
        patch(draft);
      }
    };
  }

  merge(): Command | null {
    return null; // Composite commands don't merge
  }

  serialize() {
    return {
      type: 'composite',
      commandCount: this.commands.length,
    };
  }
}

export class Transaction {
  private commands: Command[] = [];
  private committed = false;

  add(command: Command): void {
    if (this.committed) {
      throw new Error('Transaction already committed');
    }
    this.commands.push(command);
  }

  commit(description?: string): Command {
    if (this.committed) {
      throw new Error('Transaction already committed');
    }
    this.committed = true;
    return new CompositeCommand(this.commands, description ?? 'Transaction');
  }

  get size(): number {
    return this.commands.length;
  }
}
