import React, { memo, useMemo } from 'react';
import TableHead from '@mui/material/TableHead';
import MeasureRow from '../tableHeader/MeasureRow';
import HeaderRow from '../tableHeader/headerRow';
import { TableHeaderProps } from '../types';

// Define proper prop types for HeaderRow
interface HeaderRowProps {
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowSelection: any;
  numSelected: number;
  rowCount: number;
  cells: any;
  index: number;
  stickyOffsets: any;
  flattenColumns: any[];
  expandable: any;
  headersx: any;
}

// Define proper prop types for MeasureRow
interface MeasureRowProps {
  prefixCls: string;
  columnsKey: React.Key[];
  onColumnResize: (columnKey: React.Key, width: number) => void;
}

// 优化的HeaderRow组件
const MemoizedHeaderRow = memo<HeaderRowProps>((props) => {
  return <HeaderRow {...props} />;
}, (prevProps, nextProps) => {
  // 自定义比较函数，只有关键props改变才重新渲染
  return (
    prevProps.numSelected === nextProps.numSelected &&
    prevProps.rowCount === nextProps.rowCount &&
    prevProps.cells === nextProps.cells &&
    prevProps.rowSelection === nextProps.rowSelection
  );
});

MemoizedHeaderRow.displayName = 'MemoizedHeaderRow';

// 优化的MeasureRow组件
const MemoizedMeasureRow = memo<MeasureRowProps>((props) => {
  return <MeasureRow {...props} />;
}, (prevProps, nextProps) => {
  // 只有列key变化时才重新渲染
  return (
    prevProps.columnsKey === nextProps.columnsKey &&
    prevProps.onColumnResize === nextProps.onColumnResize
  );
});

MemoizedMeasureRow.displayName = 'MemoizedMeasureRow';

function TableHeader<T = any>(props: TableHeaderProps<T>) {
  const {
    onSelectAllClick,
    numSelected,
    rowCount,
    rows,
    rowSelection,
    columnsKey,
    onColumnResize,
    stickyOffsets,
    flattenColumns,
    headersx,
    expandable,
  } = props;

  // 优化行渲染，使用useMemo缓存
  const renderedRows = useMemo(() => {
    return rows.map((item: any, index: number) => (
      <MemoizedHeaderRow
        key={`header-row-${index}`}
        onSelectAllClick={onSelectAllClick}
        rowSelection={rowSelection}
        numSelected={numSelected}
        rowCount={rowCount}
        cells={item}
        index={index}
        stickyOffsets={stickyOffsets}
        flattenColumns={flattenColumns}
        expandable={expandable}
        headersx={headersx}
      />
    ));
  }, [
    rows,
    onSelectAllClick,
    rowSelection,
    numSelected,
    rowCount,
    stickyOffsets,
    flattenColumns,
    expandable,
    headersx,
  ]);

  return (
    <TableHead>
      <MemoizedMeasureRow
        prefixCls="mui"
        columnsKey={columnsKey}
        onColumnResize={onColumnResize}
      />
      {renderedRows}
    </TableHead>
  );
}

// 使用React.memo优化TableHeader
export default memo(TableHeader, (prevProps, nextProps) => {
  // 深度比较关键props
  const propsToCompare: Array<keyof TableHeaderProps> = [
    'numSelected',
    'rowCount',
    'rowSelection',
    'expandable',
    'headersx',
  ];

  for (const prop of propsToCompare) {
    if (prevProps[prop] !== nextProps[prop]) {
      return false;
    }
  }

  // 比较数组props
  if (
    prevProps.rows?.length !== nextProps.rows?.length ||
    prevProps.columnsKey?.length !== nextProps.columnsKey?.length ||
    prevProps.flattenColumns?.length !== nextProps.flattenColumns?.length
  ) {
    return false;
  }

  // 比较onColumnResize回调函数的引用
  if (prevProps.onColumnResize !== nextProps.onColumnResize) {
    return false;
  }

  return true;
}) as <T = any>(props: TableHeaderProps<T>) => React.ReactElement;