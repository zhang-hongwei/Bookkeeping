"use client";

import { Card, Box, Stack, Checkbox, IconButton, Typography, Select, MenuItem, FormControl } from "@mui/material";
import Table from "@/components/ui/Table";
import { useState } from "react";
import {
  FileManagerHeader,
  FileFilters,
  useFileColumns,
  mockFiles,
} from "./components";

export default function FileManagerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("image");
  const [dateSort, setDateSort] = useState("Select date");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Handle file selection
  const handleSelectFile = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles([...selectedFiles, id]);
    } else {
      setSelectedFiles(selectedFiles.filter((fileId) => fileId !== id));
    }
  };

  // Toggle star
  const handleToggleStar = (id: string) => {
    // In a real app, this would update the backend
    console.log("Toggle star for:", id);
  };

  // Get table columns
  const columns = useFileColumns({
    selectedFiles,
    onSelectFile: handleSelectFile,
    onToggleStar: handleToggleStar,
  });

  // Filter files
  const getFilteredFiles = () => {
    let filtered = mockFiles;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((file) => file.type === typeFilter);
    }

    return filtered;
  };

  const filteredFiles = getFilteredFiles();

  return (
    <Stack spacing={3}>
      {/* Header */}
      <FileManagerHeader />

      <Card>
        {/* Search and Filters */}
        <FileFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateSort={dateSort}
          onDateSortChange={setDateSort}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultsCount={filteredFiles.length}
        />

        {/* Table */}
        <Box>
          <Table
            columns={columns as any}
            dataSource={filteredFiles}
            rowKey="id"
            pagination={{
              total: filteredFiles.length,
              currentPage: 1,
              pageSize: 10,
              showSizeChanger: true,
            }}
            height={500}
          />
        </Box>

        {/* Footer */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 2, borderTop: "1px solid #f0f0f0" }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Checkbox size="small" />
            <Typography variant="body2" color="text.secondary">
              Dense
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Lignes par page :
            </Typography>
            <FormControl size="small">
              <Select value={10} sx={{ fontSize: 14 }}>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              1-5 sur 5
            </Typography>
            <IconButton size="small">
              <Typography variant="body2">&lt;</Typography>
            </IconButton>
            <IconButton size="small">
              <Typography variant="body2">&gt;</Typography>
            </IconButton>
          </Stack>
        </Stack>
      </Card>
    </Stack>

  );
}
