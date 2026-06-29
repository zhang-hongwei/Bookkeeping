import { TableRow, TableCell } from "@mui/material";
import Empty from "@/components/common/Empty";
import { useEffect } from "react";

const NoDataWrap = (props: any) => {
  const {
    length,
    colSpan,
    sx = {},
    nodatasx = {},
    text = "",
    noDataText = "",
  } = props;

  // 优先使用colSpan，如果没有则使用length
  const cellColSpan = colSpan || length;
  // 合并sx样式

  useEffect(() => {
    console.log("log1===>>>>", "更新", cellColSpan);
  }, [cellColSpan]);

  return (
    <TableRow>
      <TableCell
        colSpan={cellColSpan}
        className="no-data"
        sx={{
          borderBottomWidth: 0,
          textAlign: "center",
          padding: "24px",
          // 防止宽度无限增长
          width: 0, // 设置为0让colSpan自动计算
          minWidth: 0,
          maxWidth: "none",
          overflow: "hidden",
          boxSizing: "border-box",
          // overflow: "hidden",
        }}
      >
        <Empty
          sx={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            flex: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          type={"noData"}
          text={text || noDataText}
        />
      </TableCell>
    </TableRow>
  );
};

export default NoDataWrap;
