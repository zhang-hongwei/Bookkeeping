/**
 * Series Editor
 * List of all series with add/remove/select actions
 */

"use client";

import React from "react";
import {
  Box, Button, Divider, IconButton, List, ListItem, ListItemButton,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useChartEditorStore } from "@/store/chart-editor";
import { SeriesItemEditor } from "./SeriesItemEditor";

export function SeriesEditor() {
  const config = useChartEditorStore((s) => s.config);
  const selectedSeriesId = useChartEditorStore((s) => s.selectedSeriesId);
  const addSeries = useChartEditorStore((s) => s.addSeries);
  const removeSeries = useChartEditorStore((s) => s.removeSeries);
  const selectSeries = useChartEditorStore((s) => s.selectSeries);

  const selectedSeries = config.series.find((s) => s.id === selectedSeriesId) ?? null;

  return (
    <Box>
      {/* Series list */}
      <List disablePadding dense>
        {config.series.map((s) => (
          <ListItem
            key={s.id}
            disablePadding
            secondaryAction={
              <IconButton
                edge="end"
                size="small"
                disabled={config.series.length <= 1}
                onClick={() => removeSeries(s.id)}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            }
          >
            <ListItemButton
              selected={s.id === selectedSeriesId}
              onClick={() => selectSeries(s.id)}
              sx={{ borderRadius: 1, py: 0.25, "&.Mui-selected": { bgcolor: "action.selected" } }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: s.color,
                  mr: 1,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" noWrap>{s.name}</Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={addSeries}
        sx={{ mt: 1, mb: 1.5 }}
      >
        Add Series
      </Button>

      {/* Selected series editor */}
      {selectedSeries && (
        <>
          <Divider sx={{ mb: 1 }} />
          <SeriesItemEditor series={selectedSeries} />
        </>
      )}
    </Box>
  );
}
