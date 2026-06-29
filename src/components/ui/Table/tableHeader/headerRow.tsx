import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import { style, style1 } from "../utils";
import { getCellFixedInfo } from "@/utils/fixUtil";
import clsx from "clsx";
interface Data {
  id: number;
  calories: number;
  carbs: number;
  fat: number;
  name: string;
  protein: number;
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

interface EnhancedTableProps {
  numSelected: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowCount: number;
  rowSelection: any;
  expandable?: object;
  scrollLeft?: number;
  columnsKey?: any;
  onColumnResize?: any;
  fixedInfoList?: any;
  stickyOffsets?: any;
  flattenColumns?: any;
  cells?: any;
  headersx?: any;
}

function CustomizedTableHead(props: EnhancedTableProps) {
  const {
    onSelectAllClick,
    numSelected,
    rowCount,
    stickyOffsets,
    flattenColumns,
    cells,
    headersx,
  } = props;

  const renderLine = (cells: any, index: number) => {
    const cur = cells[index];
    const pre = cells[index - 1];
    if (
      (cur.dataIndex === "expandable" &&
        pre &&
        pre.dataIndex === "selection") ||
      index === 0
    ) {
      return null;
    }

    return (
      <Box
        component="span"
        sx={{
          width: "1px",
          height: "1rem",
          borderLeft: "1px solid rgba(0, 0, 0, 0.20)",
          position: "absolute",
          left: "0",
          top: "50%",
          transform: "translate(0,-50%)",
        }}
      />
    );
  };

  return (
    <>
      <TableRow>
        {cells.map((headCell: any, index: any) => {
          const {
            width,
            dataIndex,
            title,
            titleRender,
            colStart,
            colEnd,
            sx,
            rowSpan,
            colSpan,
            numeric,
            id,
            disablePadding,
            textAlign,
            fixed, // 添加 fixed 属性
          } = headCell;
          let s: any = {};
          const fixedInfo = getCellFixedInfo(
            colStart,
            colEnd,
            flattenColumns,
            stickyOffsets,
            "ltr"
          );
          const { fixLeft, fixRight } = fixedInfo;
          const fixedStyle: React.CSSProperties = {};

          // 修复固定列样式逻辑
          if (fixed) {
            fixedStyle.position = "sticky";
            fixedStyle.zIndex =
              headersx && headersx.zIndex ? headersx.zIndex + 1 : 4;

            if (fixed === "left") {
              // 左侧固定列使用 left 偏移
              fixedStyle.left = typeof fixLeft === "number" ? fixLeft : 0;
            } else if (fixed === "right") {
              // 右侧固定列使用 right 偏移
              fixedStyle.right = typeof fixRight === "number" ? fixRight : 0;
            }
          }
          const cur = cells[index];
          const next = cells[index + 1];
          const pre = cells[index - 1];
          if (cur && cur.fixed === "right" && pre && pre.fixed !== "right") {
            s = style;
          }

          if (cur && cur.fixed === "left" && next && next.fixed !== "left") {
            s = style1;
          }
          return (
            <TableCell
              className={clsx({
                "fix-right-first":
                  cur && cur.fixed === "right" && pre && pre.fixed !== "right",
                "fix-left-first": fixedInfo && fixedInfo.lastFixLeft,
                ellipsis: true,
              })}
              key={id + "" + index}
              align={numeric ? "right" : "left"}
              padding={disablePadding ? "none" : "normal"}
              sx={{
                ...sx,
                minWidth: width,
                maxWidth: width,
                width: width,
                textAlign: textAlign || "left",
                fontSize: "0.875rem !important",
                ...headersx,
                ...s,
              }}
              style={{
                ...fixedStyle,
              }}
              rowSpan={rowSpan || 1}
              colSpan={colSpan || 1}
            >
              {dataIndex === "selection" ? (
                <Checkbox
                  color="primary"
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  checked={rowCount > 0 && numSelected === rowCount}
                  onChange={onSelectAllClick}
                />
              ) : null}
              {dataIndex !== "selection" && dataIndex !== "expandable"
                ? titleRender
                  ? titleRender(title, index)
                  : title
                  ? title
                  : " - -"
                : null}
              {dataIndex === "expandable" ? null : null}
            </TableCell>
          );
        })}
      </TableRow>
    </>
  );
}

export default CustomizedTableHead;
