/**
 * Glass Center Panel
 * Preview area with background selector and live CSS output
 */

"use client";

import React from "react";
import { Box, Paper, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { CreditCard, Person, Navigation, BarChart } from "@mui/icons-material";
import { useGlassStore } from "@/store/glass";
import type { PreviewTemplate } from "../types";
import { GlassPreview } from "./GlassPreview";
import { generateCSS } from "../utils";

const TEMPLATES: { value: PreviewTemplate; icon: React.ReactElement; label: string }[] = [
  { value: "card", icon: <CreditCard fontSize="small" />, label: "Card" },
  { value: "profile", icon: <Person fontSize="small" />, label: "Profile" },
  { value: "navBar", icon: <Navigation fontSize="small" />, label: "Nav Bar" },
  { value: "stats", icon: <BarChart fontSize="small" />, label: "Stats" },
];

export function GlassCenterPanel() {
  const config = useGlassStore((s) => s.config);
  const setPreviewTemplate = useGlassStore((s) => s.setPreviewTemplate);
  const copied = useGlassStore((s) => s.copied);
  const copyCSS = useGlassStore((s) => s.copyCSS);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Preview */}
      <Paper elevation={0} variant="outlined" sx={{ overflow: "hidden" }}>
        {/* Template selector */}
        <Box sx={{ px: 2, pt: 1.5, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle2">Preview</Typography>
          <ToggleButtonGroup
            value={config.previewTemplate}
            exclusive
            onChange={(_, v) => v && setPreviewTemplate(v)}
            size="small"
          >
            {TEMPLATES.map((t) => (
              <ToggleButton key={t.value} value={t.value} sx={{ px: 1.25, py: 0.25, fontSize: 11 }}>
                {t.icon}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <GlassPreview config={config} />
      </Paper>

      {/* Live CSS output */}
      <Paper elevation={0} variant="outlined" sx={{ position: "relative" }}>
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle2" color="text.secondary">Generated CSS</Typography>
          <Box
            onClick={copyCSS}
            sx={{
              px: 1.5, py: 0.25, borderRadius: 1, cursor: "pointer",
              bgcolor: copied ? "success.main" : "action.hover",
              color: copied ? "success.contrastText" : "text.secondary",
              fontSize: 11, fontWeight: 600, transition: "all 0.2s",
              "&:hover": { bgcolor: copied ? "success.dark" : "action.selected" },
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </Box>
        </Box>
        <Box
          sx={{
            p: 2, fontFamily: "monospace", fontSize: 12, lineHeight: 1.7,
            bgcolor: "action.hover", whiteSpace: "pre-wrap", overflow: "auto",
            maxHeight: 220, borderTop: 1, borderColor: "divider",
          }}
        >
          {generateCSS(config)}
        </Box>
      </Paper>
    </Box>
  );
}
