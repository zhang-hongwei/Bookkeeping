import {
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import CloseIcon from "@mui/icons-material/Close";

interface FileFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  dateSort: string;
  onDateSortChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  resultsCount: number;
}

export function FileFilters({
  searchQuery,
  onSearchChange,
  dateSort,
  onDateSortChange,
  typeFilter,
  onTypeFilterChange,
  viewMode,
  onViewModeChange,
  resultsCount,
}: FileFiltersProps) {
  return (
    <Stack spacing={2} sx={{ p: 3 }}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
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

        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={dateSort}
              onChange={(e) => onDateSortChange(e.target.value)}
              displayEmpty
            >
              <MenuItem value="Select date">Select date</MenuItem>
              <MenuItem value="newest">Newest first</MenuItem>
              <MenuItem value="oldest">Oldest first</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              displayEmpty
            >
              <MenuItem value="all">All types</MenuItem>
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="doc">Document</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => {
              if (newMode !== null) {
                onViewModeChange(newMode);
              }
            }}
            size="small"
          >
            <ToggleButton value="list">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="grid">
              <ViewModuleIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {/* Results count and active filters */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>{resultsCount}</strong> results found
        </Typography>

        {typeFilter && typeFilter !== "all" && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Types:
            </Typography>
            <Chip
              label={`Image`}
              size="small"
              onDelete={() => onTypeFilterChange("all")}
              deleteIcon={<CloseIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: "#FFE7D9",
                color: "#B72136",
                "& .MuiChip-deleteIcon": {
                  color: "#B72136",
                },
              }}
            />
            <Button
              size="small"
              onClick={() => onTypeFilterChange("all")}
              sx={{
                color: "#FF5630",
                textTransform: "none",
                minWidth: "auto",
                p: 0,
              }}
            >
              Clear
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
