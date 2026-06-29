import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";
import { TablePagination } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import { InvoiceFilters } from "./InvoiceFilters";
import { InvoiceTable } from "./InvoiceTable";
import { SelectedRowsInfo } from "./SelectedRowsInfo";
import { InvoiceData } from "../data";

interface InvoiceListProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  selectedRows: string[];
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectRow: (id: string) => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  filteredInvoices: InvoiceData[];
  paginatedData: InvoiceData[];
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeselect: () => void;
}

export function InvoiceList({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  selectedRows,
  onSelectAll,
  onSelectRow,
  isAllSelected,
  isSomeSelected,
  filteredInvoices,
  paginatedData,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onDeselect,
}: InvoiceListProps) {
  return (
    <>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Invoice list
        </Typography>
        <Stack direction="row" spacing={2}>
          <IconButton
            sx={{
              border: "1px solid #E0E0E0",
              borderRadius: 1,
              "&:hover": { bgcolor: "#F5F5F5" },
            }}
          >
            <DownloadIcon />
          </IconButton>
          <IconButton
            sx={{
              border: "1px solid #E0E0E0",
              borderRadius: 1,
              "&:hover": { bgcolor: "#F5F5F5" },
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Card>
        {/* Filters */}
        <InvoiceFilters
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          categoryFilter={categoryFilter}
          onCategoryChange={onCategoryChange}
          statusFilter={statusFilter}
          onStatusChange={onStatusChange}
        />

        {/* Selected rows info */}
        {selectedRows.length > 0 && (
          <SelectedRowsInfo
            count={selectedRows.length}
            onDeselect={onDeselect}
          />
        )}

        {/* Table */}
        <InvoiceTable
          data={paginatedData}
          selectedRows={selectedRows}
          isAllSelected={isAllSelected}
          isSomeSelected={isSomeSelected}
          onSelectAll={onSelectAll}
          onSelectRow={onSelectRow}
        />

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredInvoices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          labelRowsPerPage="Rows per page"
        />
      </Card>
    </>
  );
}
