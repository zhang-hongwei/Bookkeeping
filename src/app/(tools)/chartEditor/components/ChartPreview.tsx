/**
 * Chart Preview Component
 * Center panel with live chart rendering and collapsible JSON output
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useChartEditorStore } from "@/store/chart-editor";
import { Charts } from "@/components/ui/Charts";
import { buildEChartsOption } from "../utils";

export function ChartPreview() {
  const config = useChartEditorStore((s) => s.config);
  const [jsonExpanded, setJsonExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const chartOption = useMemo(() => buildEChartsOption(config), [config]);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(chartOption, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy JSON:", err);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Chart preview */}
      <Paper elevation={0} variant="outlined" sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            px: 2,
            pt: 1.5,
            pb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle2">Preview</Typography>
        </Box>
        <Box sx={{ height: 450, width: "100%" }}>
          <Charts option={chartOption} height={450} width="100%" />
        </Box>
      </Paper>

      {/* Option JSON accordion */}
      <Accordion
        expanded={jsonExpanded}
        onChange={() => setJsonExpanded(!jsonExpanded)}
        elevation={0}
        variant="outlined"
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}>
          <Typography variant="subtitle2">Option JSON</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0, position: "relative" }}>
          <Tooltip title={copied ? "Copied!" : "Copy JSON"}>
            <IconButton
              size="small"
              onClick={handleCopyJson}
              sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
            >
              {copied ? (
                <CheckIcon fontSize="small" color="success" />
              ) : (
                <CopyIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Box
            sx={{
              p: 2,
              fontFamily: "monospace",
              fontSize: 12,
              lineHeight: 1.6,
              bgcolor: "grey.900",
              color: "common.white",
              whiteSpace: "pre-wrap",
              overflow: "auto",
              maxHeight: 300,
            }}
          >
            <pre style={{ margin: 0 }}>
              <code>{JSON.stringify(chartOption, null, 2)}</code>
            </pre>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
