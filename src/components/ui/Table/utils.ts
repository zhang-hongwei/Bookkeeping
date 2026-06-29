import { ColumnItem } from "./types";

/**
 * 获取行的唯一标识符
 */
export function getRowKey<T = any>(
  record: T,
  rowKey?: string | ((record: T) => React.Key),
  index?: number
): React.Key {
  if (typeof rowKey === "function") {
    return rowKey(record);
  }

  if (typeof rowKey === "string") {
    return (record as any)[rowKey];
  }

  // 默认使用 id 或 _id 或索引
  return (record as any).id ?? (record as any)._id ?? index ?? 0;
}

/**
 * 为数据源添加内部字段
 */
export function addInternalFields<T = any>(
  dataSource: T[],
  rowSelection?: any,
  pagination?: any
): (T & { _id: React.Key; _index: number; _disabled: boolean })[] {
  if (!dataSource || !Array.isArray(dataSource)) {
    return [];
  }

  return dataSource.map((item, index) => {
    let _id: React.Key = "";

    if (rowSelection?.key) {
      _id = (item as any)[rowSelection.key];
    } else {
      _id = pagination?.currentPage
        ? `${pagination.currentPage}_${index}`
        : index;
    }

    return {
      ...item,
      _id,
      _index: index,
      _disabled: rowSelection?.disabled ? rowSelection.disabled(item) : false,
    };
  });
}

/**
 * 规范化列配置，确保 dataIndex 存在
 */
export function normalizeColumns<T = any>(
  columns: ColumnItem<T>[]
): ColumnItem<T>[] {
  return columns.map((column) => {
    // 如果没有 dataIndex，使用 key 作为 dataIndex
    const normalizedColumn = {
      ...column,
      dataIndex: column.dataIndex || column.key,
    };

    // 递归处理子列
    if (column.children && column.children.length > 0) {
      normalizedColumn.children = normalizeColumns(column.children);
    }

    return normalizedColumn;
  });
}

/**
 * 合并选择列和展开列到原始列中
 */
export function mergeSelectionAndExpandColumns<T = any>(
  columns: ColumnItem<T>[],
  rowSelection?: any,
  expandable?: any
): ColumnItem<T>[] {
  // 先规范化列配置
  let mergedColumns: ColumnItem<T>[] = normalizeColumns([...columns]);

  // 添加选择列
  if (rowSelection) {
    const selectionColumn: ColumnItem<T> = {
      title: rowSelection.type === "radio" ? " " : "复选框",
      key: rowSelection.type === "radio" ? "radio" : "selection",
      dataIndex: rowSelection.type === "radio" ? "radio" : "selection",
      width: "50px",
      maxWidth: "50px",
      fixed: "left",
    };
    mergedColumns.unshift(selectionColumn);
  }

  // 添加展开列
  if (expandable) {
    const expandColumn: ColumnItem<T> = {
      title: "展开",
      key: "expandable",
      dataIndex: "expandable",
      width: "50px",
      maxWidth: "50px",
      fixed: "left",
    };

    const insertIndex = rowSelection ? 1 : 0;
    mergedColumns.splice(insertIndex, 0, expandColumn);
  }

  return mergedColumns;
}

/**
 * 深拷贝函数
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as any;
  }

  if (typeof obj === "object") {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 获取列的显示优先级（用于响应式）
 */
export function getColumnPriority<T = any>(
  column: ColumnItem<T>
): "high" | "medium" | "low" {
  // 固定列通常是高优先级
  if (column.fixed) {
    return "high";
  }

  // 可以根据列的重要性、宽度等因素判断优先级
  return "medium";
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// ============================================
// 固定列样式常量
// ============================================

/**
 * 右侧固定列阴影样式（左边显示阴影）
 */
export const fixedColumnRightShadow = {
  overflow: "unset",
  borderCollapse: "separate",
  ["table.ping-right > thead > tr > &::after, table.ping-right > tbody > tr > &::after"]:
    {
      boxShadow: "inset -15px 0 8px -8px rgba(5, 5, 5, 0.06)",
    },
  "&::after": {
    position: "absolute",
    top: 0,
    left: 0,
    width: "30px",
    height: "100%",
    display: "block",
    transform: " translateX(-100%)",
    content: "''",
    pointerEvents: "none",
    transition: "box-shadow 0.3",
  },
};

/**
 * 左侧固定列阴影样式（右边显示阴影）
 */
export const fixedColumnLeftShadow = {
  overflow: "unset",
  borderCollapse: "separate",
  ["table.ping-left > thead > tr > &::after, table.ping-left > tbody > tr > &::after"]:
    {
      boxShadow: "inset 15px -1px 8px -8px rgba(5, 5, 5, 0.06)",
    },
  "&::after": {
    position: "absolute",
    top: 0,
    right: 0,
    width: "30px",
    height: "100%",
    display: "block",
    transform: " translateX(100%)",
    content: "''",
    pointerEvents: "none",
    transition: "box-shadow 0.3",
  },
};

// 向后兼容的导出别名
export const style = fixedColumnRightShadow;
export const style1 = fixedColumnLeftShadow;

// ============================================
// 表头解析函数
// ============================================

/**
 * 解析多级表头，计算 colSpan 和 rowSpan
 * @param rootColumns 根列配置
 * @returns 解析后的表头行数组
 */
export const parseHeaderRows = (rootColumns: any) => {
  const rows: any = [];

  function fillRowCells(
    columns: any,
    colIndex: number,
    rowIndex: number = 0
  ): number[] {
    // Init rows
    rows[rowIndex] = rows[rowIndex] || [];

    let currentColIndex = colIndex;
    const colSpans: number[] = columns.filter(Boolean).map((column: any) => {
      const cell: any = {
        key: column.key,
        className: column.className || "",
        title: column.title,
        colStart: currentColIndex,
        column,
        ...column,
      };

      let colSpan: number = 1;

      const subColumns = column.children;
      if (subColumns && subColumns.length > 0) {
        colSpan = fillRowCells(
          subColumns,
          currentColIndex,
          rowIndex + 1
        ).reduce((total, count) => total + count, 0);
        cell.hasSubColumns = true;
      }

      if ("colSpan" in column) {
        ({ colSpan } = column);
      }

      if ("rowSpan" in column) {
        cell.rowSpan = column.rowSpan;
      }

      cell.colSpan = colSpan;
      cell.colEnd = cell.colStart + colSpan - 1;
      rows[rowIndex].push(cell);

      currentColIndex += colSpan;

      return colSpan;
    });

    return colSpans;
  }

  // Generate `rows` cell data
  fillRowCells(rootColumns, 0);

  // Handle `rowSpan`
  const rowCount = rows.length;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    rows[rowIndex].forEach((cell: any) => {
      if (!("rowSpan" in cell) && !cell.hasSubColumns) {
        cell.rowSpan = rowCount - rowIndex;
      }
    });
  }

  return rows;
};

/**
 * 计算表格列的总宽度
 */
export function calculateTotalWidth<T = any>(columns: ColumnItem<T>[]): number {
  return columns.reduce((total, column) => {
    if (typeof column.width === "number") {
      return total + column.width;
    }
    if (typeof column.width === "string") {
      const numValue = parseInt(column.width, 10);
      return isNaN(numValue) ? total + 100 : total + numValue; // 默认100px
    }
    return total + 100; // 默认列宽
  }, 0);
}
