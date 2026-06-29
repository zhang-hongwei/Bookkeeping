import { useMemo } from "react";
// import type { ColumnType, Direction, StickyOffsets } from '../interface'

/**
 * Get sticky column offset width
 */
function useStickyOffsets(colWidths: any, flattenColumns: any, direction: any) {
  const stickyOffsets: any = useMemo(() => {
    const columnCount = flattenColumns.length;

    const getLeftOffsets = (startIndex: number, endIndex: number) => {
      const offsets: number[] = [];
      let total = 0;

      for (let i = startIndex; i < endIndex; i++) {
        offsets.push(total);
        total += colWidths[i] || 0;
      }

      return offsets;
    };

    const getRightOffsets = () => {
      const offsets: number[] = new Array(columnCount).fill(0);
      let total = 0;

      // 从最右侧开始，向左累计宽度
      for (let i = columnCount - 1; i >= 0; i--) {
        offsets[i] = total;
        total += colWidths[i] || 0;
      }

      return offsets;
    };

    const leftOffsets = getLeftOffsets(0, columnCount);
    const rightOffsets = getRightOffsets();

    const result =
      direction === "rtl"
        ? {
            left: rightOffsets,
            right: leftOffsets,
          }
        : {
            left: leftOffsets,
            right: rightOffsets,
          };

    return result;
  }, [colWidths, flattenColumns, direction]);

  return stickyOffsets;
}

export default useStickyOffsets;
