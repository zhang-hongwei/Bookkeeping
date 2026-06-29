/**
 * Contrast Checker Page
 * WCAG color contrast checker for accessibility compliance
 */

"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
  TextField,
  Button,
  Chip,
} from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import { checkContrast, calculateContrastRatio, getWCAGLevel } from "./utils";
import type { ContrastResult, WCAGLevel } from "./types";

const PRESET_COLORS = [
  { name: "Black/White", fg: "#000000", bg: "#ffffff" },
  { name: "White/Black", fg: "#ffffff", bg: "#000000" },
  { name: "Dark Blue/White", fg: "#1e3a5e", bg: "#ffffff" },
  { name: "White/Dark Blue", fg: "#ffffff", bg: "#1e3a5e" },
  { name: "Red/White", fg: "#dc2626", bg: "#ffffff" },
  { name: "Green/White", fg: "#16a34a", bg: "#ffffff" },
];

export default function ContrastCheckerPage() {
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [result, setResult] = useState<ContrastResult>(() => checkContrast("#000000", "#ffffff"));

  const handleCheck = () => {
    const checkResult = checkContrast(foreground, background);
    setResult(checkResult);
  };

  const handlePreset = (fg: string, bg: string) => {
    setForeground(fg);
    setBackground(bg);
    const checkResult = checkContrast(fg, bg);
    setResult(checkResult);
  };

  const handleSwap = () => {
    const temp = foreground;
    setForeground(background);
    setBackground(temp);
    const checkResult = checkContrast(background, foreground);
    setResult(checkResult);
  };

  const getLevelColor = (level: WCAGLevel): "success" | "warning" | "error" => {
    switch (level) {
      case "AAA":
      case "AA":
        return "success";
      case "AA Large":
        return "warning";
      default:
        return "error";
    }
  };

  const wcagRequirements = [
    {
      level: "AAA",
      ratio: 7,
      description: "Enhanced - Best for standard text",
      normalText: true,
      largeText: true,
    },
    {
      level: "AA",
      ratio: 4.5,
      description: "Minimum - Standard text",
      normalText: true,
      largeText: true,
    },
    {
      level: "AA Large",
      ratio: 3,
      description: "Minimum - Large text (18pt+ or bold)",
      normalText: false,
      largeText: true,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Page header */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              WCAG Contrast Checker
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ensure your colors meet accessibility standards for better readability
            </Typography>
          </Box>

          <Divider />

          {/* Color inputs */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Foreground Color"
                value={foreground}
                onChange={(e) => setForeground(e.target.value)}
                size="small"
                type="color"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Background Color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                size="small"
                type="color"
                sx={{ flex: 1 }}
              />
              <Button variant="outlined" onClick={handleSwap}>
                Swap
              </Button>
              <Button variant="contained" onClick={handleCheck}>
                Check Contrast
              </Button>
            </Stack>

            {/* Presets */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Presets
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {PRESET_COLORS.map((preset) => (
                  <Chip
                    key={preset.name}
                    label={preset.name}
                    onClick={() => handlePreset(preset.fg, preset.bg)}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </Paper>

          {/* Preview */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              minHeight: 300,
              backgroundColor: background,
              color: foreground,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Typography
              variant="h2"
              sx={{ color: "inherit", textAlign: "center" }}
            >
              Sample Text Preview
            </Typography>
            <Typography variant="body1" sx={{ color: "inherit", textAlign: "center" }}>
              This is how your foreground color looks on front of your background color.
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "inherit", textAlign: "center", opacity: 0.8 }}
            >
              Make sure text is readable and accessible for all users.
            </Typography>
          </Paper>

          {/* Results */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h4">
                Contrast Ratio: {result.ratio.toFixed(2)}:1
              </Typography>
              <Chip
                label={`WCAG ${result.level}`}
                color={getLevelColor(result.level)}
                icon={result.passing ? <Check /> : <Close />}
              />
            </Box>

            <Typography variant="body2" color="text.secondary">
              {result.passing
                ? "Your colors meet WCAG requirements."
                : "Your colors do not meet minimum WCAG requirements. Consider adjusting for better contrast."}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* WCAG requirements table */}
            <Typography variant="subtitle2" gutterBottom>
              WCAG Requirements
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {wcagRequirements.map((req) => {
                const passes = result.ratio >= req.ratio;
                return (
                  <Paper
                    key={req.level}
                    variant="outlined"
                    sx={{
                      p: 2,
                      flex: 1,
                      minWidth: 200,
                      borderColor: passes ? "success.main" : "error.main",
                      bgcolor: passes ? "success.light" : "error.light",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      Level {req.level}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {req.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Ratio: {req.ratio}:1
                    </Typography>
                    <Chip
                      size="small"
                      label={passes ? "PASS" : "FAIL"}
                      color={passes ? "success" : "error"}
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                );
              })}
            </Box>
          </Paper>

          {/* Tips */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: "info.light",
              color: "info.contrastText",
            }}
          >
            <Typography variant="body2" gutterBottom fontWeight="bold">
              Tips:
            </Typography>
            <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
              <Typography component="li" variant="caption">
                Level AAA (7:1) is recommended for normal text
              </Typography>
              <Typography component="li" variant="caption">
                Level AA (4.5:1) is the minimum for normal text
              </Typography>
              <Typography component="li" variant="caption">
                Level AA Large (3:1) is acceptable for large/bold text (18pt+)
              </Typography>
              <Typography component="li" variant="caption">
                Always test with real content and users when possible
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
