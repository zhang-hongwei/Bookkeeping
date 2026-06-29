/**
 * Chart Controls
 * Left panel with collapsible configuration sections
 */

"use client";

import React from "react";
import {
  Accordion, AccordionDetails, AccordionSummary, Button, Paper, Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import IosShareIcon from "@mui/icons-material/IosShare";
import { useChartEditorStore } from "@/store/chart-editor";
import { SeriesEditor } from "./controls/SeriesEditor";
import { AxisConfig } from "./controls/AxisConfig";
import { TitleConfig } from "./controls/TitleConfig";
import { LegendConfig } from "./controls/LegendConfig";
import { TooltipConfig } from "./controls/TooltipConfig";
import { GridConfig } from "./controls/GridConfig";

const SECTION_LABELS = {
  title: "Title",
  series: "Series",
  xAxis: "X Axis",
  yAxis: "Y Axis",
  legend: "Legend",
  tooltip: "Tooltip",
  grid: "Grid",
} as const;

export function ChartControls() {
  const config = useChartEditorStore((s) => s.config);
  const updateConfig = useChartEditorStore((s) => s.updateConfig);
  const setExportDialogOpen = useChartEditorStore((s) => s.setExportDialogOpen);

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: 2,
        maxHeight: "calc(100vh - 120px)",
        overflow: "auto",
        position: "sticky",
        top: 16,
      }}
    >
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Configuration
      </Typography>

      {/* Title */}
      <Accordion disableGutters elevation={0} variant="outlined">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={600}>{SECTION_LABELS.title}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <TitleConfig />
        </AccordionDetails>
      </Accordion>

      {/* Series */}
      <Accordion disableGutters elevation={0} variant="outlined" defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={600}>
            {SECTION_LABELS.series} ({config.series.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <SeriesEditor />
        </AccordionDetails>
      </Accordion>

      {/* X Axis */}
      <Accordion disableGutters elevation={0} variant="outlined">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={600}>{SECTION_LABELS.xAxis}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <AxisConfig
            axis={config.xAxis}
            axisLabel="X Axis"
            onUpdate={(update) => updateConfig({ xAxis: { ...config.xAxis, ...update } })}
          />
        </AccordionDetails>
      </Accordion>

      {/* Y Axis */}
      <Accordion disableGutters elevation={0} variant="outlined">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={600}>{SECTION_LABELS.yAxis}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <AxisConfig
            axis={config.yAxis}
            axisLabel="Y Axis"
            onUpdate={(update) => updateConfig({ yAxis: { ...config.yAxis, ...update } })}
          />
        </AccordionDetails>
      </Accordion>

      {/* Legend */}
      <Accordion disableGutters elevation={0} variant="outlined">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={600}>{SECTION_LABELS.legend}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <LegendConfig />
        </AccordionDetails>
      </Accordion>

      {/* Tooltip */}
      <Accordion disableGutters elevation={0} variant="outlined">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={600}>{SECTION_LABELS.tooltip}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <TooltipConfig />
        </AccordionDetails>
      </Accordion>

      {/* Grid */}
      <Accordion disableGutters elevation={0} variant="outlined">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={600}>{SECTION_LABELS.grid}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <GridConfig />
        </AccordionDetails>
      </Accordion>

      {/* Export button */}
      <Button
        variant="contained"
        startIcon={<IosShareIcon />}
        onClick={() => setExportDialogOpen(true)}
        fullWidth
        sx={{ mt: 2 }}
      >
        Export
      </Button>
    </Paper>
  );
}
