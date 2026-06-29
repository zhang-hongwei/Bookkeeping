import { TablePagination } from "@mui/material";
import React, { memo } from "react";
import { CustomizedPaginationProps } from "../types";

const CustomizedPagination: React.FC<CustomizedPaginationProps> = (props) => {
  const {
    total = 0,
    page = 1,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
  } = props;

  // 如果没有数据，不渲染分页
  if (total === 0) {
    return null;
  }

  // MUI TablePagination uses 0-based indexing, but our Table uses 1-based
  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange?.(newPage + 1);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPageSize = parseInt(event.target.value, 10);
    onPageSizeChange?.(newPageSize);
  };

  return (
    <TablePagination
      component="div"
      page={page - 1} // Convert from 1-based to 0-based
      count={total}
      rowsPerPage={pageSize}
      onPageChange={handleChangePage}
      rowsPerPageOptions={[5, 10, 25, 50, 100]}
      onRowsPerPageChange={handleChangeRowsPerPage}
      labelRowsPerPage="Lignes par page :"
      labelDisplayedRows={({ from, to, count }) =>
        `${from}-${to} sur ${count}`
      }
      sx={{
        height: '80px'
      }}
    />
  );
};

// 使用 memo 避免不必要的重新渲染
export default memo(CustomizedPagination) as React.FC<CustomizedPaginationProps>;
