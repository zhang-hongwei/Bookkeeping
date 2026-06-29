// import type { Direction, FixedType, StickyOffsets } from '../interface'

export interface FixedInfo {
  fixLeft: number | false;
  fixRight: number | false;
  lastFixLeft: boolean;
  firstFixRight: boolean;

  // For Rtl Direction
  lastFixRight: boolean;
  firstFixLeft: boolean;

  isSticky: boolean;
}

export function getCellFixedInfo(
  colStart: number,
  colEnd: number,
  columns: readonly { fixed?: any }[],
  stickyOffsets: any,
  direction: any
): any {
  const startColumn = columns[colStart] || {};
  const endColumn = columns[colEnd] || {};

  let fixLeft: number | false = false;
  let fixRight: number | false = false;

  if (startColumn.fixed === "left") {
    fixLeft = stickyOffsets.left[direction === "rtl" ? colEnd : colStart] || 0;
  } else if (endColumn.fixed === "right") {
    fixRight =
      stickyOffsets.right[direction === "rtl" ? colStart : colEnd] || 0;
  }

  let lastFixLeft: boolean = false;
  let firstFixRight: boolean = false;

  let lastFixRight: boolean = false;
  let firstFixLeft: boolean = false;

  const nextColumn = columns[colEnd + 1];
  const prevColumn = columns[colStart - 1];
  const curColumn = columns[colEnd];
  const curStartColumn = columns[colStart];

  if (direction === "rtl") {
    if (fixLeft !== false) {
      const prevFixLeft = prevColumn && prevColumn.fixed === "left";
      firstFixLeft = !prevFixLeft;
    } else if (fixRight !== false) {
      const nextFixRight = nextColumn && nextColumn.fixed === "right";
      lastFixRight = !nextFixRight;
    }
  } else {
    if (fixLeft !== false) {
      const nextFixLeft = nextColumn && nextColumn.fixed === "left";
      lastFixLeft = !nextFixLeft && curColumn && curColumn.fixed === "left";
    } else if (fixRight !== false) {
      const prevFixRight = prevColumn && prevColumn.fixed === "right";
      firstFixRight =
        !prevFixRight && curStartColumn && curStartColumn.fixed === "right";
    }
  }

  return {
    fixLeft,
    fixRight,
    lastFixLeft,
    firstFixRight,
    lastFixRight,
    firstFixLeft,
    isSticky: stickyOffsets.isSticky,
  };
}
