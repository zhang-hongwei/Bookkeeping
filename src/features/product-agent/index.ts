/**
 * Product-Agent Feature
 *
 * This module only contains shared types for Product-Agent tasks.
 * The actual agent implementation is in /agent-core directory.
 *
 * @see /agent-core - Independent Node.js service for task execution
 * @see /packages/README.md - Architecture documentation
 */

// Export only types - no runtime code
export * from './types/task';
