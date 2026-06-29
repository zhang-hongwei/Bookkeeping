/**
 * Title Config
 * Configuration panel for chart title
 */

"use client";

import React from "react";
import { FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import { useChartEditorStore } from "@/store/chart-editor";

export function TitleConfig() {
  const title = useChartEditorStore((s) => s.config.title);
  const updateConfig = useChartEditorStore((s) => s.updateConfig);

  const update = (partial: Partial<typeof title>) => {
    updateConfig({ title: { ...title, ...partial } });
  };

  return (
    <>
      <FormControlLabel
        control={
          <Switch
            checked={title.show}
            onChange={(e) => update({ show: e.target.checked })}
            size="small"
          />
        }
        label={<Typography variant="caption">Show Title</Typography>}
        sx={{ mb: 0.5 }}
      />

      <TextField
        label="Title"
        value={title.text}
        onChange={(e) => update({ text: e.target.value })}
        size="small"
        fullWidth
        sx={{ mb: 1.5 }}
      />

      <TextField
        label="Subtitle"
        value={title.subtext}
        onChange={(e) => update({ subtext: e.target.value })}
        size="small"
        fullWidth
      />
    </>
  );
}
