import { useCallback } from "react";
import {
  UseTablePaginationOptions,
  InternalTableState,
  TableAction,
} from "../types";

export function useTablePagination(
  options: UseTablePaginationOptions,
  state: InternalTableState,
  dispatch: React.Dispatch<TableAction>
) {
  const { pagination, onPageChange, onPageSizeChange } = options;

  const currentPage = pagination?.currentPage || state.currentPage;

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch({
        type: "SET_PAGE",
        payload: page,
      });
      onPageChange?.(page);
    },
    [dispatch, onPageChange]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      // 页面大小改变时重置到第一页
      dispatch({
        type: "SET_PAGE",
        payload: 1,
      });
      onPageSizeChange?.(pageSize);
    },
    [dispatch, onPageSizeChange]
  );

  const handleJumpToPage = useCallback(
    (page: number) => {
      dispatch({
        type: "SET_PAGE",
        payload: page,
      });
      onPageChange?.(page);
    },
    [dispatch, onPageChange]
  );

  const pageSize = pagination?.pageSize || state.pageSize;

  return {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    handleJumpToPage,
  };
}
