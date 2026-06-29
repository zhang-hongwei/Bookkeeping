/**
 * Data Editor
 * Inline editing of series data points
 */

"use client";

import React, { useCallback } from "react";
import { Box, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useChartEditorStore } from "@/store/chart-editor";

interface DataEditorProps {
  seriesId: string;
  data: number[];
}

export function DataEditor({ seriesId, data }: DataEditorProps) {
  const updateSeriesData = useChartEditorStore((s) => s.updateSeriesData);
  const addDataPoint = useChartEditorStore((s) => s.addDataPoint);
  const removeDataPoint = useChartEditorStore((s) => s.removeDataPoint);

  const handleDataChange = useCallback(
    (index: number, raw: string) => {
      const value = raw === "" ? 0 : Number(raw);
      if (!Number.isNaN(value)) {
        updateSeriesData(seriesId, index, value);
      }
    },
    [seriesId, updateSeriesData],
  );

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          Data Points ({data.length})
        </Typography>
        <Box>
          <Tooltip title="Add data point">
            <IconButton size="small" onClick={() => addDataPoint(seriesId)}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove last point">
            <span>
              <IconButton
                size="small"
                disabled={data.length === 0}
                onClick={() => removeDataPoint(seriesId, data.length - 1)}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          overflowX: "auto",
          pb: 0.5,
          "&::-webkit-scrollbar": { height: 4 },
        }}
      >
        {data.map((value, i) => (
          <TextField
            key={i}
            type="number"
            value={value}
            onChange={(e) => handleDataChange(i, e.target.value)}
            size="small"
            sx={{
              minWidth: 60,
              maxWidth: 60,
              flexShrink: 0,
              "& input": { py: 0.5, px: 0.75, fontSize: 12, textAlign: "center" },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
