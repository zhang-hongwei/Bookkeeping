"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Divider,
} from "@mui/material";
import {
  ExpandMore,
  Title as TitleIcon,
  LegendToggle,
  GridOn,
  Timeline,
  Category,
  Info as TooltipIcon,
} from "@mui/icons-material";
import { TitleConfig } from "./config/TitleConfig";
import { LegendConfig } from "./config/LegendConfig";
import { GridConfig } from "./config/GridConfig";
import { AxisConfig } from "./config/AxisConfig";
import { SeriesConfig } from "./config/SeriesConfig";
import { TooltipConfig } from "./config/TooltipConfig";

export function ChartsConfigPanel() {
  const [expanded, setExpanded] = useState<string | false>("title");

  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Paper
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.default",
        }}
      >
        <Typography variant="h6">Chart Configuration</Typography>
        <Typography variant="caption" color="text.secondary">
          Configure your chart based on ECharts options
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 1,
        }}
      >
        {/* Title Configuration */}
        <Accordion
          expanded={expanded === "title"}
          onChange={handleChange("title")}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: "action.hover",
              "&:hover": { backgroundColor: "action.selected" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TitleIcon fontSize="small" />
              <Typography>title</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <TitleConfig />
          </AccordionDetails>
        </Accordion>

        {/* Legend Configuration */}
        <Accordion
          expanded={expanded === "legend"}
          onChange={handleChange("legend")}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: "action.hover",
              "&:hover": { backgroundColor: "action.selected" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LegendToggle fontSize="small" />
              <Typography>legend</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <LegendConfig />
          </AccordionDetails>
        </Accordion>

        {/* Grid Configuration */}
        <Accordion
          expanded={expanded === "grid"}
          onChange={handleChange("grid")}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: "action.hover",
              "&:hover": { backgroundColor: "action.selected" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <GridOn fontSize="small" />
              <Typography>grid</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <GridConfig />
          </AccordionDetails>
        </Accordion>

        {/* Axis Configuration (xAxis & yAxis) */}
        <Accordion
          expanded={expanded === "axis"}
          onChange={handleChange("axis")}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: "action.hover",
              "&:hover": { backgroundColor: "action.selected" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Timeline fontSize="small" />
              <Typography>xAxis / yAxis</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <AxisConfig />
          </AccordionDetails>
        </Accordion>

        {/* Tooltip Configuration */}
        <Accordion
          expanded={expanded === "tooltip"}
          onChange={handleChange("tooltip")}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: "action.hover",
              "&:hover": { backgroundColor: "action.selected" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TooltipIcon fontSize="small" />
              <Typography>tooltip</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <TooltipConfig />
          </AccordionDetails>
        </Accordion>

        {/* Series Configuration */}
        <Accordion
          expanded={expanded === "series"}
          onChange={handleChange("series")}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: "action.hover",
              "&:hover": { backgroundColor: "action.selected" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Category fontSize="small" />
              <Typography>series</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <SeriesConfig />
          </AccordionDetails>
        </Accordion>
      </Box>
    </Paper>
  );
}
