import { SxProps } from "@mui/material";
import { ReactNode } from "react";

export type Order = "asc" | "desc";

export interface ColumnItem<T = any> {
  /**
   * 列的唯一标识符，也作为默认的 dataIndex
   * 如果不指定 dataIndex，将使用 key 作为数据字段名
   */
  key: string;
  /**
   * 数据字段名，用于从 record 中获取值
   * @default key - 如果不提供，默认使用 key 的值
   */
  dataIndex?: string;
  title: ReactNode;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  fixed?: "left" | "right" | boolean;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => ReactNode;
  children?: ColumnItem<T>[];
  ellipsis?: boolean;
  className?: string;
  onHeaderCell?: (
    column: ColumnItem<T>
  ) => React.HTMLAttributes<HTMLTableCellElement>;
  onCell?: (
    record: T,
    rowIndex: number
  ) => React.HTMLAttributes<HTMLTableCellElement>;
}

export interface RowSelectionConfig<T = any> {
  type: "checkbox" | "radio";
  selectedRowKeys?: React.Key[];
  key?: string;
  disabled?: (record: T) => boolean;
  getCheckboxProps?: (record: T) => { disabled?: boolean; name?: string };
  onSelect?: (
    record: T,
    selected: boolean,
    selectedRows: T[],
    nativeEvent: Event
  ) => void;
  onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
  onSelectRow?: (selectedRows: T[]) => void;
  onChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  selectedRows?: T[];
}

export interface ExpandableConfig<T = any> {
  expandedRowKeys?: React.Key[];
  defaultExpandedRowKeys?: React.Key[];
  expandIcon?: (props: {
    expanded: boolean;
    onExpand: Function;
    record: T;
  }) => ReactNode;
  expandedRowRender?: (
    record: T,
    index: number,
    indent: number,
    expanded: boolean
  ) => ReactNode;
  onExpand?: (expanded: boolean, record: T) => void;
  onExpandedRowsChange?: (expandedKeys: React.Key[]) => void;
}

export interface TablePaginationConfig {
  total: number;
  currentPage: number;
  pageSize: number;
  serverSide?: boolean;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  pageSizeOptions?: string[];
}

export interface CustomizedTableProps<T = any> {
  columns: ColumnItem<T>[];
  dataSource: T[];
  loading?: boolean;
  rowSelection?: RowSelectionConfig<T>;
  expandable?: ExpandableConfig<T>;
  pagination?: TablePaginationConfig;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onClickExpand?: (open: boolean) => void;
  expandedRowRender?: () => any;
  onSelect?: (row: T) => any;
  resetSelected?: number;
  sx?: SxProps;
  noDataText?: string;
  nodatasx?: SxProps;
  height?: any;
  headersx?: SxProps;
  stickyHeader?: boolean;
  rowKey?: string | ((record: T) => React.Key);
  className?: string;
  hoverRow?: boolean;
  // 新增属性
  scroll?: { x?: number | string; y?: number | string };
  size?: "small" | "middle" | "large";
  bordered?: boolean;
  showHeader?: boolean;
  locale?: {
    emptyText?: ReactNode;
    selectAll?: string;
    selectInvert?: string;
  };
}

// 内部状态类型
export interface InternalTableState {
  selected: Record<number, React.Key[]>;
  currentPage: number;
  pageSize: number;
  expandedKeys: React.Key[];
  pingedLeft: boolean;
  pingedRight: boolean;
  tableWidth: number;
  colsWidths: Map<React.Key, number>;
}

// Action 类型
export type TableAction =
  | { type: "SET_SELECTED"; payload: { page: number; keys: React.Key[] } }
  | { type: "SET_PAGE"; payload: number }
  | { type: "TOGGLE_EXPAND"; payload: React.Key }
  | { type: "SET_PING_STATE"; payload: { left: boolean; right: boolean } }
  | { type: "SET_TABLE_WIDTH"; payload: number }
  | { type: "UPDATE_COL_WIDTH"; payload: { key: React.Key; width: number } }
  | { type: "RESET_SELECTION" }
  | { type: "SET_EXPANDED_KEYS"; payload: React.Key[] };

// 组件Props类型
export interface TableHeaderProps<T = any> {
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rows: any[];
  rowSelection?: RowSelectionConfig<T>;
  rowCount: number;
  numSelected: number;
  expandable?: ExpandableConfig<T>;
  onColumnResize: (columnKey: React.Key, width: number) => void;
  columnsKey: React.Key[];
  stickyOffsets: any;
  flattenColumns: ColumnItem<T>[];
  headersx?: SxProps;
}

export interface TableBodyProps<T = any> {
  expandable?: ExpandableConfig<T>;
  onTriggerExpand: (record: T, isOpen: boolean) => void;
  dataSource: T[];
  isSelected: (id: React.Key) => boolean;
  isExpanded: (record: T) => boolean;
  cells: ColumnItem<T>[];
  rowSelection?: RowSelectionConfig<T>;
  onClickSelect: (event: any, row: T) => void;
  fixedInfoList: any[];
  pageNo: number;
  noDataText?: string;
  nodatasx?: SxProps;
}

// 分页组件Props
export interface CustomizedPaginationProps {
  total?: number;
  page?: number;
  pageSize?: number;
  sx?: SxProps;
  onClickJumpTo?: (num: number) => void;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

// Hook 选项类型
export interface UseTableSelectionOptions<T = any> {
  dataSource: T[];
  rowSelection?: RowSelectionConfig<T>;
  currentPage: number;
  rowKey?: string | ((record: T) => React.Key);
}

export interface UseTableExpansionOptions<T = any> {
  expandable?: ExpandableConfig<T>;
  rowKey?: string | ((record: T) => React.Key);
}

export interface UseTablePaginationOptions {
  pagination?: TablePaginationConfig;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

// ============================================
// 向后兼容的类型别名
// ============================================

export type CustomizedTablePropsType<T = any> = CustomizedTableProps<T>;
export type CustomizedPaginationPropsType = CustomizedPaginationProps;
export type TablePaginationType = TablePaginationConfig;
export type columnsItem<T = any> = ColumnItem<T>;

// 保留现有接口用于兼容性
export interface Data {
  id: number;
  calories: number;
  carbs: number;
  fat: number;
  name: string;
  protein: number;
}

export interface EnhancedTableToolbarProps {
  numSelected: number;
}

export interface columnItemType {
  name: string;
  key: string;
  render?: () => void;
}
