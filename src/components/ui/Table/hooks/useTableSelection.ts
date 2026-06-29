import { useCallback, useMemo } from "react";
import {
  UseTableSelectionOptions,
  RowSelectionConfig,
  InternalTableState,
  TableAction,
} from "../types";
import { getRowKey } from "../utils";
import { getSelectedKeysForPage } from "../context/reducer";

export function useTableSelection<T = any>(
  options: UseTableSelectionOptions<T>,
  state: InternalTableState,
  dispatch: React.Dispatch<TableAction>
) {
  const { dataSource, rowSelection, currentPage, rowKey } = options;

  const selectedKeysForCurrentPage = useMemo(
    () => getSelectedKeysForPage(state, currentPage - 1),
    [state, currentPage]
  );

  const isSelected = useCallback(
    (record: T) => {
      const key = getRowKey(record, rowKey);
      return selectedKeysForCurrentPage.includes(key);
    },
    [selectedKeysForCurrentPage, rowKey]
  );

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (!rowSelection) return;

      const currentPageIndex = currentPage - 1;
      const _selectedRows: T[] = [];

      if (selected) {
        const newSelected = dataSource.map((record) => {
          const key = getRowKey(record, rowKey);
          // 排除disabled项
          const isDisabled = rowSelection.disabled
            ? rowSelection.disabled(record)
            : false;
          if (!isDisabled) {
            _selectedRows.push(record);
          }
          return key;
        });

        dispatch({
          type: "SET_SELECTED",
          payload: { page: currentPageIndex, keys: newSelected },
        });
      } else {
        dispatch({
          type: "SET_SELECTED",
          payload: { page: currentPageIndex, keys: [] },
        });
      }

      rowSelection.onSelectRow?.(_selectedRows);
    },
    [dataSource, rowSelection, currentPage, rowKey, dispatch]
  );

  const handleSelectRow = useCallback(
    (record: T, selected: boolean) => {
      if (!rowSelection) return;

      const currentPageIndex = currentPage - 1;
      const recordKey = getRowKey(record, rowKey);
      const currentSelected = [...selectedKeysForCurrentPage];

      let newSelected: React.Key[];
      if (selected) {
        newSelected = [...currentSelected, recordKey];
      } else {
        newSelected = currentSelected.filter((key) => key !== recordKey);
      }

      dispatch({
        type: "SET_SELECTED",
        payload: { page: currentPageIndex, keys: newSelected },
      });

      // 处理外部数据更新
      if (rowSelection.selectedRows && rowSelection.key) {
        const _selectedRows = [...rowSelection.selectedRows];
        const index = _selectedRows.findIndex(
          (item) =>
            (item as any)[rowSelection.key!] ===
            (record as any)[rowSelection.key!]
        );

        if (selected && index === -1) {
          // 添加到选中行
          rowSelection.onSelectRow?.([..._selectedRows, record]);
        } else if (!selected && index !== -1) {
          // 从选中行中移除
          _selectedRows.splice(index, 1);
          rowSelection.onSelectRow?.(_selectedRows);
        }
      }
    },
    [selectedKeysForCurrentPage, rowSelection, currentPage, rowKey, dispatch]
  );

  const selectedCount = selectedKeysForCurrentPage.length;
  const totalCount = dataSource.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;
  const isAllSelected = selectedCount > 0 && selectedCount === totalCount;

  return {
    selectedKeys: selectedKeysForCurrentPage,
    selectedCount,
    isSelected,
    isIndeterminate,
    isAllSelected,
    handleSelectAll,
    handleSelectRow,
  };
}
