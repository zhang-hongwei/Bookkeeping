import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import {
  Box,
  Checkbox,
  IconButton,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import clsx from "clsx";
import { Fragment } from "react";
import { style, style1 } from "../utils";
const sx = {
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  border: "1px solid rgba(0, 0, 0, 0)",
  opacity: 1,
  borderRadius: "2px",
  width: "1.125rem",
  height: "1.125rem",
};

const Row = (props: any) => {
  const {
    rowSelection,
    onClickSelect,
    data,
    labelId,
    isItemSelected,
    isItemExpanded,
    expandable,
    onTriggerExpand,
    _index,
    cells,
    fixedInfoList,
    selectedRadioValue,
    pageNo,
  } = props;

  //   const [open, setOpen] = useState(false)
  const open = Boolean(isItemExpanded);

  const handleClickRadio = (event: any) => {
    rowSelection && rowSelection.onSelectRow && rowSelection.onSelectRow(event);
  };

  // 渲染单元格
  const renderCells = (cells: any, row: any) => {
    // rowSelection.selectedRows[0] === row[rowSelection.key])
    // if (rowSelection && rowSelection.selectedRows) {
    //   console.log('log=rowSelection=====>>>', rowSelection.selectedRows[0], row[rowSelection.key])
    // }

    return (
      <Fragment>
        {cells && cells.length
          ? [...cells].map((column: any, index) => {
              // 使用 dataIndex 获取值，如果没有 dataIndex 则使用 key
              const fieldKey = column.dataIndex || column.key;
              let value = row[fieldKey] || "";
              value = value + "";
              const { fixed, key, width, dataIndex } = column;
              const fixedInfo = fixedInfoList[index];
              let fixStyle: any = {};

              const cur = cells[index];
              const next = cells[index + 1];
              const pre = cells[index - 1];

              if (fixed) {
                fixStyle.position = "sticky";
                // fixStyle.zIndex = 2
                if (fixed === "left") {
                  fixStyle.left = fixedInfo.fixLeft;
                  fixStyle.zIndex = 3;
                }

                if (fixed === "right") {
                  fixStyle.right = fixedInfo.fixRight;
                  fixStyle.zIndex = 3;
                }
              }

              let _boxShadowStyle: any = {};

              if (
                cur &&
                cur.fixed === "right" &&
                pre &&
                pre.fixed !== "right"
              ) {
                _boxShadowStyle = style;
              }

              if (
                cur &&
                cur.fixed === "left" &&
                next &&
                next.fixed !== "left"
              ) {
                _boxShadowStyle = style1;
              }

              return (
                <TableCell
                  className={clsx({
                    "fix-right-first":
                      cur &&
                      cur.fixed === "right" &&
                      pre &&
                      pre.fixed !== "right",
                    "fix-left-first": fixedInfo && fixedInfo.lastFixLeft,
                    ellipsis: true,
                  })}
                  key={key}
                  sx={{
                    color: "var(--font-secondary-color)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    minWidth: width,
                    maxWidth: width,
                    // 简化方案：所有单元格都继承行的背景色
                    // 不使用透明背景，避免重叠问题
                    backgroundColor: "inherit",
                    ..._boxShadowStyle,
                    ...fixStyle,
                  }}
                >
                  {dataIndex === "selection" ? (
                    <Checkbox
                      checked={computedSelectedStatus(isItemSelected)}
                      slotProps={{
                        input: {
                          "aria-labelledby": labelId,
                        },
                      }}
                      sx={{
                        input:
                          rowSelection &&
                          rowSelection.disabled &&
                          rowSelection.disabled(data)
                            ? sx
                            : {},
                      }}
                      onClick={(event: any) => onClickSelect(event, data)}
                      disabled={
                        rowSelection && rowSelection.disabled
                          ? rowSelection.disabled(data)
                          : false
                      }
                    />
                  ) : null}

                  {dataIndex === "radio" ? (
                    <Radio
                      color="primary"
                      onChange={(event: any) => {
                        handleClickRadio(row);
                      }}
                      checked={
                        (rowSelection &&
                          rowSelection.selectedRows &&
                          rowSelection.selectedRows[0] ===
                            row[
                              rowSelection && rowSelection.key
                                ? rowSelection.key
                                : "id"
                            ]) ||
                        false
                      }
                      value={
                        row[
                          rowSelection && rowSelection.key
                            ? rowSelection.key
                            : "id"
                        ]
                      }
                      name="radio-buttons"
                      sx={{ margin: "-6px", padding: "6px" }}
                      inputProps={{ "aria-label": labelId }}
                    />
                  ) : null}

                  {/* {dataIndex === 'expandable' && expandable && !expandable.disabled(row) ? (
                  <IconButton
                    aria-label="expand row"
                    
                    onClick={() => {
                      setOpen(!open)
                      handleClickOpen(data, !open, _index)
                    }}
                    sx={{
                      padding: 0,
                      height: '20px',
                    }}
                  >
                    {open ? <TableExpandClose sx={{
                      color: 'rgba(0,0,0,0.9)'
                    }} /> : <TableExpandOpen sx={{
                      color: 'rgba(0,0,0,0.9)'
                    }} />}
                  </IconButton>
                ) : null} */}
                  {renderExpandable(dataIndex, row)}

                  {dataIndex != "radio" &&
                  dataIndex != "selection" &&
                  dataIndex != "expandable"
                    ? column.render
                      ? column.render(row[fieldKey], row, _index)
                      : value || value === 0
                      ? value
                      : " - -"
                    : null}
                </TableCell>
              );
            })
          : null}
      </Fragment>
    );
  };

  // 渲染表格头部
  const renderHead = (cells: any) => {
    return (
      <>
        {cells && cells.length
          ? cells.map((headCell: any) => (
              <TableCell
                key={headCell.key}
                align={headCell.numeric ? "right" : "left"}
                padding={headCell.disablePadding ? "none" : "normal"}
                sx={{
                  ...headCell.sx,
                }}
              >
                {headCell.name}
              </TableCell>
            ))
          : null}
      </>
    );
  };

  // 点击展开按钮
  const handleClickOpen = (row: any, isOpen: boolean, _index: number) => {
    onTriggerExpand && onTriggerExpand(row, isOpen);
    // expandable.onExpand && expandable.onExpand(row, isOpen, _index)
  };

  // 计算是否选中
  const computedSelectedStatus = (isItemSelected: boolean) => {
    if (rowSelection && rowSelection.disabled) {
      // console.log("log===是否选中======>", !rowSelection.disabled(data), isItemSelected)
      return !rowSelection.disabled(data) && isItemSelected;
    } else {
      // console.log("log==是否选中，===>", isItemSelected)
      return isItemSelected;
    }
  };

  //   useEffect(() => {
  //     setOpen(false)
  //   }, [pageNo])

  const renderExpandable = (dataIndex: any, row: any) => {
    if (dataIndex === "expandable") {
      if (expandable && expandable.disabled && expandable.disabled(row)) {
        return;
      }
      if (
        expandable &&
        expandable.rowExpandable &&
        !expandable.rowExpandable(row)
      ) {
        return;
      }
      return (
        <IconButton
          aria-label="expand row"
          onClick={() => {
            //   setOpen(!open)
            handleClickOpen(data, !open, _index);
          }}
          sx={{
            padding: 0,
            height: "20px",
          }}
        >
          {open ? (
            <HiChevronUp size={20} color="rgba(0,0,0,0.9)" />
          ) : (
            <HiChevronDown size={20} color="rgba(0,0,0,0.9)" />
          )}
        </IconButton>
      );
    } else {
      return null;
    }
  };
  return (
    <>
      <TableRow
        hover
        role="checkbox"
        tabIndex={-1}
        sx={{
          // 使用实体背景色，不使用透明
          backgroundColor: "background.paper",
          // hover 状态
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        {renderCells(cells, data)}
      </TableRow>

      {/* 是否存在折叠 */}
      {expandable &&
      (!expandable.rowExpandable || expandable?.rowExpandable(data)) ? (
        <TableRow>
          <TableCell
            style={{ paddingBottom: 0, paddingTop: 0, borderWidth: "0px" }}
            sx={{
              padding: "0 !important",
            }}
            colSpan={cells.length}
          >
            <Collapse
              in={open}
              timeout="auto"
              sx={{
                "&.MuiCollapse-root": {
                  overflow: "clip !important",
                },
              }}
              unmountOnExit
            >
              {/* 自定义 ， 可以是其他元素  */}
              {expandable && expandable.expandedRowRender
                ? expandable.expandedRowRender(data, _index)
                : ""}

              {/* children 属性， 只能生成表格 */}
              {data.children && data.children.length ? (
                <Box sx={{ margin: 1 }}>
                  <Table aria-label="purchases">
                    <TableHead>
                      <TableRow>{renderHead(expandable.cells)}</TableRow>
                    </TableHead>
                    <TableBody>
                      {data.children.map((row: any, index: any) => {
                        return (
                          <TableRow key={index}>
                            {renderCells(expandable.cells, row)}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              ) : null}
            </Collapse>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
};

export default Row;
