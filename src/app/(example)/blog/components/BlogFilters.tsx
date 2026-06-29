import {
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface BlogFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function BlogFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: BlogFiltersProps) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
    >
      <TextField
        size="small"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ width: 300 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#999", fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <Select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          displayEmpty
        >
          <MenuItem value="Latest">Sort By: Latest</MenuItem>
          <MenuItem value="Oldest">Sort By: Oldest</MenuItem>
          <MenuItem value="Popular">Sort By: Popular</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
