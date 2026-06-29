"use client";

import React, { useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import { BorderColorOutlined } from "@mui/icons-material";
import { useThemeMode } from "@/hooks/useThemeMode";
import type {
  BorderBeamSize,
  BorderBeamColorVariant,
  BorderBeamTheme,
} from "border-beam";
import { PropertyPanel } from "./components/PropertyPanel";
import { PreviewPanel } from "./components/PreviewPanel";
import { PresetPanel } from "./components/PresetPanel";
import type { PresetConfig } from "./types";

export default function BorderBeamDemoPage() {
  const { isLight: isPageLight } = useThemeMode();

  const [size, setSize] = useState<BorderBeamSize>("md");
  const [colorVariant, setColorVariant] = useState<BorderBeamColorVariant>("colorful");
  const [beamTheme, setBeamTheme] = useState<BorderBeamTheme>("dark");
  const [strength, setStrength] = useState(1);
  const [duration, setDuration] = useState(1.96);
  const [brightness, setBrightness] = useState(1.3);
  const [active, setActive] = useState(true);
  const [staticColors, setStaticColors] = useState(false);

  const labelColor = isPageLight ? "grey.600" : "grey.400";

  const applyPreset = (preset: PresetConfig) => {
    setSize(preset.size);
    setColorVariant(preset.colorVariant);
    setBeamTheme(preset.theme);
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 页面标题 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <BorderColorOutlined sx={{ fontSize: 36, color: "#a78bfa" }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Border Beam
            </Typography>
            <Typography variant="body2" sx={{ color: labelColor }}>
              React 动画边框光束效果 — 在线调试与预览
            </Typography>
          </Box>
        </Box>

        {/* 三栏布局：属性 | 预览 | 预设 */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "280px 1fr 280px" },
            gap: 3,
            alignItems: "start",
            mt: 3,
          }}
        >
          <PropertyPanel
            isPageLight={isPageLight}
            size={size}
            colorVariant={colorVariant}
            beamTheme={beamTheme}
            strength={strength}
            duration={duration}
            brightness={brightness}
            active={active}
            staticColors={staticColors}
            onSizeChange={setSize}
            onColorVariantChange={setColorVariant}
            onBeamThemeChange={setBeamTheme}
            onStrengthChange={setStrength}
            onDurationChange={setDuration}
            onBrightnessChange={setBrightness}
            onActiveChange={setActive}
            onStaticColorsChange={setStaticColors}
          />

          <PreviewPanel
            isPageLight={isPageLight}
            size={size}
            colorVariant={colorVariant}
            beamTheme={beamTheme}
            strength={strength}
            duration={duration}
            brightness={brightness}
            active={active}
            staticColors={staticColors}
          />

          <PresetPanel
            isPageLight={isPageLight}
            selectedSize={size}
            selectedColorVariant={colorVariant}
            selectedBeamTheme={beamTheme}
            onSelect={applyPreset}
          />
        </Box>
      </Container>
    </Box>
  );
}
