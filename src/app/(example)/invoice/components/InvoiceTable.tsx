import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Avatar,
  Typography,
  Stack,
  Chip,
  Box,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { InvoiceData, getStatusConfig, getCategoryIcon } from "../data";

interface InvoiceTableProps {
  data: InvoiceData[];
  selectedRows: string[];
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectRow: (id: string) => void;
}

export function InvoiceTable({
  data,
  selectedRows,
  isAllSelected,
  isSomeSelected,
  onSelectAll,
  onSelectRow,
}: InvoiceTableProps) {
  return (
    <TableContainer component={Box}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#FAFAFA" }}>
            <TableCell padding="checkbox">
              <Checkbox
                size="small"
                checked={isAllSelected}
                indeterminate={isSomeSelected}
                onChange={onSelectAll}
              />
            </TableCell>
            <TableCell>Invoice</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((invoice) => {
            const statusConfig = getStatusConfig(invoice.status);
            const isSelected = selectedRows.includes(invoice.id);

            return (
              <TableRow
                key={invoice.id}
                sx={{
                  bgcolor: isSelected ? "#F5F5F5" : "transparent",
                  "&:hover": { bgcolor: "#FAFAFA" },
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={isSelected}
                    onChange={() => onSelectRow(invoice.id)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {invoice.invoice}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "#E0E0E0",
                        fontSize: 14,
                      }}
                    >
                      {invoice.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {invoice.name}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontSize: 16 }}>
                      {getCategoryIcon(invoice.category)}
                    </Typography>
                    <Typography variant="body2">{invoice.category}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={invoice.status}
                    size="small"
                    sx={{
                      bgcolor: statusConfig.bgcolor,
                      color: statusConfig.color,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {invoice.price}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {invoice.date}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" sx={{ color: "#666" }}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
