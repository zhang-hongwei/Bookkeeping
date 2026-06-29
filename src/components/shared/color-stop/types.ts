/**
 * Shared Color Stop Types
 */

/** Single color stop — opacity uses 0-100 range */
export interface ColorStop {
  /** Unique identifier */
  id: string;
  /** Color value (HEX format, e.g. '#6366f1') */
  color: string;
  /** Start position in the gradient (0-100) */
  position: number;
  /** Optional end position for dual-position syntax (0-100), e.g. blue 40% 60% */
  positionEnd?: number;
  /** Opacity (0-100) */
  opacity: number;
}
