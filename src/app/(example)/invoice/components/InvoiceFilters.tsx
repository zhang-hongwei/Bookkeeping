import {
  Box,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface InvoiceFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function InvoiceFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
}: InvoiceFiltersProps) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
      sx={{ p: 3, borderBottom: "1px solid #F5F5F5" }}
    >
      <TextField
        size="small"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ width: 300 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#999", fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <Stack direction="row" spacing={2}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            displayEmpty
          >
            <MenuItem value="All categories">All categories</MenuItem>
            <MenuItem value="Marketing">Marketing</MenuItem>
            <MenuItem value="Development">Development</MenuItem>
            <MenuItem value="Design">Design</MenuItem>
            <MenuItem value="Consulting">Consulting</MenuItem>
            <MenuItem value="Support">Support</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            displayEmpty
          >
            <MenuItem value="All status">All status</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Unpaid">Unpaid</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
}
