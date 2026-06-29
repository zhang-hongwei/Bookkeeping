"use client";
import Loading from "../Loading";
import {
  flatColumns,
  getColumnsKey,
  useLayoutState,
  useFixedInfo,
  useStickyOffsets,
} from "@/hooks";
import { Stack, Table, TableContainer } from "@mui/material";
import clsx from "clsx";
import ResizeObserver from "rc-resize-observer";
import useEvent from "rc-util/lib/hooks/useEvent";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseHeaderRows } from "./utils";
import OptimizedTableHeader from "./components/OptimizedTableHeader";
import OptimizedTableBody from "./components/OptimizedTableBody";
import OptimizedPagination from "./components/pagination";
import { useTableVirtualize } from "./hooks/useVirtualize";
import { CustomizedTableProps } from "./types";
import { addInternalFields, mergeSelectionAndExpandColumns } from "./utils";
import {
  withErrorBoundary,
  createCustomErrorFallback,
} from "@/components/common/ErrorBoundary";
import {
  TableProvider,
  useTableSelectionContext,
  useTableExpansionContext,
  useTablePaginationContext,
  useTableConfig,
  useTableContext,
} from "./context";

// 内部表格组件，使用Context
const InternalTable = <T extends Record<string, any> = any>(props: {
  height?: any;
  sx?: any;
  headersx?: any;
  noDataText?: string;
  nodatasx?: any;
  stickyHeader?: boolean;
  className?: string;
  hoverRow?: boolean;
}) => {
  const selection = useTableSelectionContext<T>();
  const expansion = useTableExpansionContext<T>();
  const paginationHook = useTablePaginationContext<T>();
  const { columns, dataSource, loading } = useTableConfig<T>();

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [pingedLeft, setPingedLeft] = useState(false);
  const [pingedRight, setPingedRight] = useState(false);
  const [tableWidth, setTableWidth] = useState<number>(0);

  // 获取props
  const {
    height,
    sx,
    headersx,
    noDataText,
    nodatasx,
    stickyHeader = true,
    className,
    hoverRow = true,
  } = props;

  // 获取Context - 必须在组件顶层调用
  const context = useTableContext();

  // 合并复选框/展开列
  const _columns = useMemo(() => {
    const rowSelection = context.config.rowSelection
      ? {
        type: "checkbox" as const,
        selectedRowKeys: context.selection.selectedKeys,
        onChange: () => {
          // 通过Context处理选择变化
        },
      }
      : null;
    const expandable =
      context.expansion.expandedKeys.length > 0
        ? {
          expandedRowKeys: context.expansion.expandedKeys,
          onExpand: context.expansion.handleToggleExpand,
        }
        : undefined;
    return mergeSelectionAndExpandColumns(columns, rowSelection, expandable);
  }, [columns, context.selection, context.expansion]);

  // 解析合并行
  const _rows = useMemo(() => {
    return parseHeaderRows(_columns);
  }, [_columns]);

  // 获取body column
  const flattenColumns = useMemo(() => flatColumns(_columns), [_columns]);

  // 列宽管理
  const [colsWidths, updateColsWidths] = useLayoutState(
    new Map<React.Key, number>()
  );

  const colsKeys = getColumnsKey(flattenColumns);
  const pureColWidths = colsKeys.map((columnKey, index) => {
    const storedWidth = colsWidths.get(columnKey);
    if (storedWidth !== undefined) {
      return storedWidth;
    }
    // 如果没有存储的宽度，使用列定义中的默认宽度
    const column = flattenColumns[index];
    return column?.width || 100; // 默认宽度100
  });
  const colWidths = useMemo(() => pureColWidths, [pureColWidths.join("_")]);
  const stickyOffsets = useStickyOffsets(colWidths, flattenColumns, "ltr");
  const fixedInfoList = useFixedInfo(flattenColumns, stickyOffsets, "ltr");

  // 处理数据源
  const _dataSource = useMemo(() => {
    return addInternalFields(dataSource, null, null); // 暂时传入null
  }, [dataSource]);

  // 列宽调整回调 - 使用useCallback优化
  const onColumnResize = useCallback(
    (columnKey: React.Key, width: number) => {
      updateColsWidths((widths: Map<React.Key, number>) => {
        if (widths.get(columnKey) !== width) {
          const newWidths = new Map(widths);
          newWidths.set(columnKey, width);
          // 列宽变化后延迟触发滚动检查，确保固定列样式更新
          setTimeout(() => {
            triggerOnScroll();
          }, 0);
          return newWidths;
        }
        return widths;
      });
    },
    [updateColsWidths]
  );

  // 样式相关 - 使用useMemo优化
  const memoTableContainerSx = useMemo(() => {
    const baseSx = {
      borderRadius: 0,
      boxShadow: " 0px 1px 2px rgba(0, 0, 0, 0)",
      height: "100%",
      width: "100%",
      maxWidth: "100%",
      overflow: "auto",
    };

    return sx ? { ...baseSx, ...sx } : baseSx;
  }, [sx]);

  const memoRowHoverSx = useMemo(() => {
    if (!hoverRow) return {};
    return {
      "& > tbody > tr.MuiTableRow-hover:hover": {
        "& > td.MuiTableCell-root": {},
      },
    };
  }, [hoverRow]);

  // 滚动处理
  const onInternalScroll = useEvent(
    ({
      currentTarget,
      scrollLeft,
    }: {
      currentTarget: HTMLElement;
      scrollLeft?: number;
    }) => {
      const mergedScrollLeft =
        typeof scrollLeft === "number" ? scrollLeft : currentTarget.scrollLeft;
      const measureTarget = currentTarget;
      if (measureTarget) {
        const scrollWidth = measureTarget.scrollWidth;
        const clientWidth = measureTarget.clientWidth;
        if (scrollWidth === clientWidth) {
          setPingedLeft(false);
          setPingedRight(false);
          return;
        }
        setPingedLeft(mergedScrollLeft > 0);
        setPingedRight(mergedScrollLeft < scrollWidth - clientWidth);
      }
    }
  );

  const onBodyScroll = useEvent((e: React.UIEvent<HTMLDivElement>) => {
    onInternalScroll(e);
  });

  const triggerOnScroll = () => {
    if (tableContainerRef.current) {
      onInternalScroll({
        currentTarget: tableContainerRef.current,
        scrollLeft: tableContainerRef.current?.scrollLeft,
      });
    } else {
      setPingedLeft(false);
      setPingedRight(false);
    }
  };

  // 满足条件则使用虚拟化
  const _virtualize = useTableVirtualize(_dataSource, {
    containerHeight: typeof height === "number" ? height : 400,
    enabled: _dataSource.length > 100, // 超过100行才启用虚拟化
  });
  const onFullTableResize = (tableProps: any) => {
    const { width } = tableProps;

    // Use setTimeout with cleanup if component unmounts
    const timer = setTimeout(() => {
      if (tableContainerRef.current) {
        let tableContainerWidth =
          tableContainerRef.current.clientWidth || width;
        setTableWidth(tableContainerWidth);

        const tableWidth = tableContainerRef.current.scrollWidth || 0;
        if (tableWidth !== tableContainerWidth) {
          triggerOnScroll();
        } else {
          setPingedLeft(false);
          setPingedRight(false);
        }
      }
    }, 100);

    // Cleanup function should be handled by parent component if needed
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerOnScroll();
    }, 100);

    return () => clearTimeout(timer);
  }, [_dataSource]);

  // 当列宽变化时，重新计算固定列样式
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerOnScroll();
    }, 50);

    return () => clearTimeout(timer);
  }, [colWidths]);

  return (
    <Loading
      loading={loading ?? false}
      sx={{
        height: height ? height : "100%",
      }}
    >
      <Stack
        className={clsx("table-container", className)}
        sx={{
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <ResizeObserver onResize={onFullTableResize}>
          <TableContainer
            ref={tableContainerRef}
            onScroll={onBodyScroll}
            sx={memoTableContainerSx}
          >
            <Table
              sx={{
                borderCollapse: "separate",
                ...memoRowHoverSx,
              }}
              className={clsx({
                "ping-left": pingedLeft,
                "ping-right": pingedRight,
              })}
              aria-label="simple table"
              stickyHeader={stickyHeader}
            >
              <OptimizedTableHeader
                onSelectAllClick={(event) =>
                  selection.handleSelectAll(event.target.checked)
                }
                rows={_rows}
                rowSelection={undefined}
                rowCount={_dataSource.length}
                numSelected={selection.selectedCount}
                expandable={undefined}
                onColumnResize={onColumnResize}
                columnsKey={colsKeys}
                stickyOffsets={stickyOffsets}
                flattenColumns={flattenColumns}
                headersx={headersx}
              />

              <OptimizedTableBody
                expandable={undefined}
                onTriggerExpand={expansion.handleToggleExpand}
                dataSource={_dataSource}
                isSelected={(id: React.Key) =>
                  selection.selectedKeys.includes(id)
                }
                isExpanded={expansion.isExpanded}
                cells={flattenColumns}
                rowSelection={undefined}
                onClickSelect={(
                  row: T & {
                    _id: React.Key;
                    _index: number;
                    _disabled: boolean;
                  }
                ) =>
                  selection.handleSelectRow(
                    row,
                    !selection.selectedKeys.includes(row._id)
                  )
                }
                fixedInfoList={fixedInfoList}
                pageNo={paginationHook.currentPage}
                noDataText={noDataText}
                nodatasx={{
                  minHeight:
                    (tableContainerRef?.current?.clientHeight ?? 0) -
                    36 * _rows.length -
                    12,
                  position: "sticky",
                  left: "0px",
                  margin: "0 -12px",
                  width: tableWidth,
                  visibility: tableWidth == 0 ? "hidden" : "visible",
                  ...nodatasx,
                }}
              />
            </Table>
          </TableContainer>
        </ResizeObserver>

        <OptimizedPagination
          onClickJumpTo={paginationHook.handleJumpToPage}
          total={context.config.pagination?.total || 0}
          onPageChange={paginationHook.handlePageChange}
          page={paginationHook.currentPage}
          pageSize={paginationHook.pageSize}
          onPageSizeChange={paginationHook.handlePageSizeChange}
        />
      </Stack>
    </Loading>
  );
};

// 主组件，提供Context
const CustomizedTable = <T extends Record<string, any> = any>(
  props: CustomizedTableProps<T>
) => {
  const {
    columns = [],
    dataSource = [],
    loading = false,
    rowSelection = undefined,
    expandable,
    pagination,
    onPageChange,
    onPageSizeChange,
    rowKey,
    ...restProps
  } = props;

  return (
    <TableProvider
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowSelection={rowSelection}
      expandable={expandable}
      pagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      rowKey={rowKey}
    >
      <InternalTable<T> {...restProps} />
    </TableProvider>
  );
};

export default withErrorBoundary(CustomizedTable, {
  fallback: createCustomErrorFallback(
    "表格加载失败",
    "表格组件遇到了意外错误，请尝试重新加载数据"
  ),
  onError: (error, errorInfo) => {
    console.error("Table component error:", error, errorInfo);
  },
});

// 导出所有类型定义
export * from "./types";
