import { useCallback, useMemo, useEffect } from "react";
import {
  UseTableExpansionOptions,
  InternalTableState,
  TableAction,
} from "../types";
import { getRowKey } from "../utils";
import { getIsExpanded } from "../context/reducer";

export function useTableExpansion<T = any>(
  options: UseTableExpansionOptions<T>,
  state: InternalTableState,
  dispatch: React.Dispatch<TableAction>
) {
  const { expandable, rowKey } = options;

  const isExpanded = useCallback(
    (record: T) => {
      const key = getRowKey(record, rowKey);
      return getIsExpanded(state, key);
    },
    [state.expandedKeys, rowKey]
  );

  const handleToggleExpand = useCallback(
    (record: T) => {
      const key = getRowKey(record, rowKey);
      const currentlyExpanded = getIsExpanded(state, key);

      dispatch({
        type: "TOGGLE_EXPAND",
        payload: key,
      });

      // 调用外部回调
      expandable?.onExpand?.(!currentlyExpanded, record);

      // 更新后的keys需要重新计算
      const newExpandedKeys = currentlyExpanded
        ? state.expandedKeys.filter((k) => k !== key)
        : [...state.expandedKeys, key];

      expandable?.onExpandedRowsChange?.(newExpandedKeys);
    },
    [state.expandedKeys, expandable, rowKey, dispatch]
  );

  // 初始化展开状态
  useEffect(() => {
    if (
      expandable?.defaultExpandedRowKeys &&
      expandable.defaultExpandedRowKeys.length > 0
    ) {
      dispatch({
        type: "SET_EXPANDED_KEYS",
        payload: expandable.defaultExpandedRowKeys,
      });
    }
  }, [expandable?.defaultExpandedRowKeys, dispatch]);

  // 同步外部控制的展开状态
  useEffect(() => {
    if (expandable?.expandedRowKeys) {
      dispatch({
        type: "SET_EXPANDED_KEYS",
        payload: expandable.expandedRowKeys,
      });
    }
  }, [expandable?.expandedRowKeys, dispatch]);

  return {
    expandedKeys: state.expandedKeys,
    isExpanded,
    handleToggleExpand,
  };
}
