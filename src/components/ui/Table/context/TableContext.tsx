import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import {
  InternalTableState,
  TableAction,
  CustomizedTableProps,
} from "../types";
import { tableReducer, initialTableState } from "./reducer";
import { useTableSelection } from "../hooks/useTableSelection";
import { useTableExpansion } from "../hooks/useTableExpansion";
import { useTablePagination } from "../hooks/useTablePagination";

interface TableContextValue<T = any> {
  // 状态
  state: InternalTableState;
  dispatch: React.Dispatch<TableAction>;

  // Selection相关
  selection: {
    selectedKeys: React.Key[];
    selectedCount: number;
    isSelected: (record: T) => boolean;
    isIndeterminate: boolean;
    isAllSelected: boolean;
    handleSelectAll: (selected: boolean) => void;
    handleSelectRow: (record: T, selected: boolean) => void;
  };

  // Expansion相关
  expansion: {
    expandedKeys: React.Key[];
    isExpanded: (record: T) => boolean;
    handleToggleExpand: (record: T) => void;
  };

  // Pagination相关
  pagination: {
    currentPage: number;
    pageSize: number;
    handlePageChange: (page: number) => void;
    handlePageSizeChange: (pageSize: number) => void;
    handleJumpToPage: (page: number) => void;
  };

  // 表格配置
  config: {
    columns: any[];
    dataSource: T[];
    rowKey?: string | ((record: T) => React.Key);
    loading?: boolean;
    rowSelection?: any;
    expandable?: any;
    pagination?: any;
  };
}

const TableContext = createContext<TableContextValue | null>(null);

interface TableProviderProps<T = any>
  extends Pick<
    CustomizedTableProps<T>,
    | "columns"
    | "dataSource"
    | "rowSelection"
    | "expandable"
    | "pagination"
    | "onPageChange"
    | "onPageSizeChange"
    | "rowKey"
    | "loading"
  > {
  children: ReactNode;
}

export function TableProvider<T = any>({
  children,
  columns,
  dataSource,
  rowSelection,
  expandable,
  pagination,
  onPageChange,
  onPageSizeChange,
  rowKey,
  loading,
}: TableProviderProps<T>) {
  const [state, dispatch] = useReducer(tableReducer, initialTableState);

  // 计算当前页码
  const currentPage = pagination?.currentPage || state.currentPage;

  // 使用useCallback优化回调函数
  const stableOnPageChange = useCallback(
    (newPage: number) => {
      onPageChange?.(newPage);
    },
    [onPageChange]
  );

  const stableOnPageSizeChange = useCallback(
    (pageSize: number) => {
      onPageSizeChange?.(pageSize);
    },
    [onPageSizeChange]
  );

  // Selection hook
  const selection = useTableSelection(
    {
      dataSource,
      rowSelection,
      currentPage,
      rowKey,
    },
    state,
    dispatch
  );

  // Expansion hook
  const expansion = useTableExpansion(
    {
      expandable,
      rowKey,
    },
    state,
    dispatch
  );

  // Pagination hook - 使用稳定的回调函数
  const paginationHook = useTablePagination(
    {
      pagination,
      onPageChange: stableOnPageChange,
      onPageSizeChange: stableOnPageSizeChange,
    },
    state,
    dispatch
  );

  // 使用useMemo优化config对象，只有关键deps变化才重新创建
  const config = useMemo(
    () => ({
      columns,
      dataSource,
      rowKey,
      loading,
      rowSelection,
      expandable,
      pagination,
    }),
    [columns, dataSource, rowKey, loading, rowSelection, expandable, pagination]
  );

  const contextValue = useMemo(
    (): TableContextValue<T> => ({
      state,
      dispatch,
      selection,
      expansion,
      pagination: paginationHook,
      config,
    }),
    [state, dispatch, selection, expansion, paginationHook, config]
  );

  return (
    <TableContext.Provider value={contextValue}>
      {children}
    </TableContext.Provider>
  );
}

export function useTableContext<T = any>(): TableContextValue<T> {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTableContext must be used within a TableProvider");
  }
  return context as TableContextValue<T>;
}

// 专用的hooks，方便组件使用
export function useTableSelectionContext<T = any>() {
  const context = useTableContext<T>();
  return context.selection;
}

export function useTableExpansionContext<T = any>() {
  const context = useTableContext<T>();
  return context.expansion;
}

export function useTablePaginationContext<T = any>() {
  const context = useTableContext<T>();
  return context.pagination;
}

export function useTableConfig<T = any>() {
  const context = useTableContext<T>();
  return context.config;
}

export function useTableState() {
  const context = useTableContext();
  return { state: context.state, dispatch: context.dispatch };
}
