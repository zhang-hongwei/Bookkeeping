import React, { memo, useMemo, useCallback } from "react";
import { TableBody as MuiTableBody } from "@mui/material";
import BodyRow from "../tableBody/bodyRow";
import NoDataWrap from "../tableBody/empty";
import {
  TableBodyProps,
  ColumnItem,
  RowSelectionConfig,
  ExpandableConfig,
} from "../types";
import { getRowKey } from "../utils";

// BodyRow props 接口定义
interface BodyRowProps<T = any> {
  isItemSelected: boolean;
  isItemExpanded: boolean;
  labelId: string;
  data: T;
  rowSelection?: RowSelectionConfig<T>;
  onClickSelect: (event: React.ChangeEvent<HTMLInputElement>, row: T) => void;
  onTriggerExpand: (row: T) => void;
  expandable?: ExpandableConfig<T>;
  cells: ColumnItem<T>[];
  fixedInfoList: any[];
  index: number;
  pageNo?: number;
  selectedRadioValue?: any;
  _index?: number;
}

// 优化的BodyRow组件
const MemoizedBodyRow = memo<BodyRowProps>(
  (props: BodyRowProps) => {
    return <BodyRow {...props} />;
  },
  (prevProps, nextProps) => {
    // 精确比较，避免不必要的重渲染
    return (
      prevProps.isItemSelected === nextProps.isItemSelected &&
      prevProps.isItemExpanded === nextProps.isItemExpanded &&
      prevProps.data === nextProps.data &&
      prevProps.rowSelection === nextProps.rowSelection &&
      prevProps.expandable === nextProps.expandable &&
      prevProps.onClickSelect === nextProps.onClickSelect &&
      prevProps.onTriggerExpand === nextProps.onTriggerExpand
    );
  }
);

MemoizedBodyRow.displayName = "MemoizedBodyRow";

function TableBody<T = any>(props: TableBodyProps<T>) {
  const {
    rowSelection = null,
    expandable,
    onTriggerExpand,
    onClickSelect,
    cells,
    dataSource,
    isSelected,
    isExpanded,
    noDataText = "",
    nodatasx = {},
    fixedInfoList,
    pageNo,
  } = props;

  // 缓存计算列数的结果
  const columnsLength = useMemo(() => {
    let len = cells.length;
    if (expandable) len += 1;
    if (rowSelection) len += 1;
    return len;
  }, [cells.length, expandable, rowSelection]);

  // 优化行选择处理函数
  const handleRowSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, row: T) => {
      onClickSelect?.(event, row);
    },
    [onClickSelect]
  );

  // 优化展开处理函数
  const handleRowExpand = useCallback(
    (row: T) => {
      onTriggerExpand?.(row, !isExpanded(row));
    },
    [onTriggerExpand, isExpanded]
  );

  // 优化数据行渲染
  const renderedRows = useMemo(() => {
    if (!dataSource.length) {
      return null;
    }

    return dataSource.map((row: any, index: number) => {
      const rowKey = getRowKey(row, "id", index);
      const isItemSelected = isSelected ? isSelected(row._id) : false;
      const isItemExpanded = isExpanded ? isExpanded(row) : false;
      const labelId = `enhanced-table-checkbox-${pageNo}-${index}`;

      return (
        <MemoizedBodyRow
          key={`body-row-${pageNo || 0}-${index}-${rowKey}`}
          isItemSelected={isItemSelected}
          isItemExpanded={isItemExpanded}
          labelId={labelId}
          data={row}
          rowSelection={rowSelection || undefined}
          onClickSelect={handleRowSelect}
          onTriggerExpand={handleRowExpand}
          expandable={expandable}
          cells={cells}
          fixedInfoList={fixedInfoList}
          index={index}
        />
      );
    });
  }, [
    dataSource,
    isSelected,
    isExpanded,
    pageNo,
    rowSelection,
    expandable,
    cells,
    fixedInfoList,
    handleRowSelect,
    handleRowExpand,
  ]);

  // 优化空数据组件
  const emptyComponent = useMemo(() => {
    if (dataSource.length > 0) {
      return null;
    }

    return (
      <NoDataWrap
        colSpan={columnsLength}
        noDataText={noDataText}
        nodatasx={nodatasx}
      />
    );
  }, [dataSource.length, columnsLength, noDataText, nodatasx]);

  return (
    <MuiTableBody>
      {renderedRows}
      {emptyComponent}
    </MuiTableBody>
  );
}

// 使用React.memo优化TableBody
export default memo(TableBody, (prevProps, nextProps) => {
  // 比较关键props
  const propsToCompare: Array<keyof TableBodyProps> = [
    "rowSelection",
    "expandable",
    "noDataText",
    "nodatasx",
    "pageNo",
  ];

  for (const prop of propsToCompare) {
    if (prevProps[prop] !== nextProps[prop]) {
      return false;
    }
  }

  // 比较数组props
  if (
    prevProps.dataSource?.length !== nextProps.dataSource?.length ||
    prevProps.cells?.length !== nextProps.cells?.length ||
    prevProps.fixedInfoList?.length !== nextProps.fixedInfoList?.length
  ) {
    return false;
  }

  // 比较函数props（这些应该是稳定的引用）
  if (
    prevProps.isSelected !== nextProps.isSelected ||
    prevProps.isExpanded !== nextProps.isExpanded ||
    prevProps.onTriggerExpand !== nextProps.onTriggerExpand ||
    prevProps.onClickSelect !== nextProps.onClickSelect
  ) {
    return false;
  }

  // 如果数据源相同但引用不同，进行浅比较
  if (prevProps.dataSource !== nextProps.dataSource) {
    if (prevProps.dataSource.length !== nextProps.dataSource.length) {
      return false;
    }

    // 比较每个数据项的引用（假设数据项是不可变的）
    for (let i = 0; i < prevProps.dataSource.length; i++) {
      if (prevProps.dataSource[i] !== nextProps.dataSource[i]) {
        return false;
      }
    }
  }

  return true;
}) as <T = any>(props: TableBodyProps<T>) => JSX.Element;
