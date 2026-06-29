/**
 * 左侧面板：属性控制（实现方式、渐变类型、滑块、颜色节点）
 */

"use client";

import React, { useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from "@mui/material";
import { ColorStopPanel } from "@/components/shared/color-stop";
import type { ColorStop as SharedColorStop } from "@/components/shared/color-stop";
import { GradientBorderImageOptions } from "./GradientBorderImageOptions";
import { GradientBorderImport } from "./GradientBorderImport";
import { buildGradientCSS, buildInnerBgCSS } from "../utils";
import { useGradientBorderStore, useGradientBorderActions } from "@/store/gradient-border";

// ── 主组件 ───────────────────────────────────────

interface GradientBorderControlsProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function GradientBorderControls({ fileInputRef }: GradientBorderControlsProps) {
  const config = useGradientBorderStore((s) => s.config);
  const selectedStopId = useGradientBorderStore((s) => s.selectedStopId);
  const innerBgSelectedStopId = useGradientBorderStore((s) => s.innerBgSelectedStopId);
  const showBorderImageOptions = useGradientBorderStore((s) => s.showBorderImageOptions);
  const objectUrl = useGradientBorderStore((s) => s.objectUrl);
  const {
    updateConfig, setGradientType, setImplementation,
    addColorStop, removeColorStop, moveColorStop, duplicateColorStop,
    selectColorStop, updateColorStopPartial,
    addInnerBgStop, removeInnerBgStop, moveInnerBgStop, duplicateInnerBgStop,
    selectInnerBgStop, updateInnerBgStopPartial,
  } = useGradientBorderActions();

  // 预计算渐变 CSS 字符串
  const gradientCSS = useMemo(
    () => buildGradientCSS(config.colorStops, config.gradientType, config.angle),
    [config.colorStops, config.gradientType, config.angle],
  );
  const innerBgCSS = useMemo(() => buildInnerBgCSS(config), [config]);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        position: { lg: "sticky" },
        top: 16,
        maxHeight: { lg: "calc(100vh - 100px)" },
        overflow: "auto",
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
      }}
    >
      {/* 导入 CSS */}
      <GradientBorderImport />

      {/* 实现方式 */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="subtitle2" gutterBottom>实现方式</Typography>
        <ToggleButtonGroup
          value={config.implementation}
          exclusive
          onChange={(_, v) => { if (v) setImplementation(v); }}
          size="small"
          fullWidth
        >
          <ToggleButton value="background-clip">裁剪</ToggleButton>
          <ToggleButton value="border-image">图片</ToggleButton>
          <ToggleButton value="pseudo-element">伪元素</ToggleButton>
        </ToggleButtonGroup>
        {config.implementation === "border-image" && (
          <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: "block" }}>
            border-image 不支持 border-radius
          </Typography>
        )}
      </Box>

      {/* 渐变类型 */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="subtitle2" gutterBottom>渐变类型</Typography>
        <ToggleButtonGroup
          value={config.gradientType}
          exclusive
          onChange={(_, v) => { if (v) setGradientType(v); }}
          size="small"
          fullWidth
        >
          <ToggleButton value="linear">线性</ToggleButton>
          <ToggleButton value="radial">径向</ToggleButton>
          <ToggleButton value="conic">锥形</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 边框宽度 */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="subtitle2" gutterBottom>边框宽度: {config.borderWidth}px</Typography>
        <Slider value={config.borderWidth} onChange={(_, v) => updateConfig({ borderWidth: v as number })} min={1} max={20} size="small" />
      </Box>

      {/* 边框圆角 */}
      {config.implementation !== "border-image" && (
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" gutterBottom>边框圆角: {config.borderRadius}px</Typography>
          <Slider value={config.borderRadius} onChange={(_, v) => updateConfig({ borderRadius: v as number })} min={0} max={100} size="small" />
        </Box>
      )}


      {/* border-image 高级选项 */}
      {config.implementation === "border-image" && (
        <GradientBorderImageOptions
          expanded={showBorderImageOptions}
          objectUrl={objectUrl}
          fileInputRef={fileInputRef}
        />
      )}

      <Divider sx={{ my: 2 }} />

      {/* 边框颜色节点 */}
      <ColorStopPanel
        title="颜色节点"
        stops={config.colorStops as SharedColorStop[]}
        selectedStopId={selectedStopId}
        onSelectStop={selectColorStop}
        onAddStop={(position) => addColorStop(position)}
        onMoveStop={moveColorStop}
        onUpdateStop={(updates) => {
          if (selectedStopId) updateColorStopPartial(selectedStopId, updates);
        }}
        onRemoveStop={removeColorStop}
        onDuplicateStop={duplicateColorStop}
        minStops={2}
        gradientCSS={gradientCSS}
        {...(config.gradientType !== "radial" ? {
          angle: config.angle,
          onAngleChange: (a: number) => updateConfig({ angle: a }),
        } : {})}
      />




      {/* 内部背景（仅裁剪模式） */}
      {config.implementation === "background-clip" && (
        <>
          <Divider sx={{ my: 2 }} />
          <ColorStopPanel
            title="内部背景"
            stops={config.innerBgStops as SharedColorStop[]}
            selectedStopId={innerBgSelectedStopId}
            onSelectStop={selectInnerBgStop}
            onAddStop={(position) => addInnerBgStop(position)}
            onMoveStop={moveInnerBgStop}
            onUpdateStop={(updates) => {
              if (innerBgSelectedStopId) updateInnerBgStopPartial(innerBgSelectedStopId, updates);
            }}
            onRemoveStop={removeInnerBgStop}
            onDuplicateStop={duplicateInnerBgStop}
            minStops={1}
            gradientCSS={innerBgCSS}
            angle={config.innerBgAngle}
            onAngleChange={(a) => updateConfig({ innerBgAngle: a })}
          />
        </>
      )}
    </Paper>
  );
}
