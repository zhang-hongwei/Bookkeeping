"use client";

import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore, Delete, ContentCopy } from "@mui/icons-material";

import { useChartStore } from "@/stores/charts/chart-store";
import Toast from "@/components/ui/Toast";

// Section components
import { BasicSettingsSection } from "./series-sections/BasicSettingsSection";
import { LineStyleSection } from "./series-sections/LineStyleSection";
import { SymbolStyleSection } from "./series-sections/SymbolStyleSection";
import { AreaStyleSection } from "./series-sections/AreaStyleSection";
import { AdvancedSection } from "./series-sections/AdvancedSection";

// 完整的 Series 配置 schema（基于 ECharts LineSeries）
const seriesSchema = z.object({
  // 基础配置
  name: z.string(),
  type: z.string(),

  // 线条样式
  smooth: z.boolean(),
  smoothMonotone: z.enum(["none", "x", "y"]),
  step: z.enum(["false", "start", "end", "middle"]),
  connectNulls: z.boolean(),
  clip: z.boolean(),

  // 符号配置
  showSymbol: z.boolean(),
  showAllSymbol: z.enum(["auto", "true", "false"]),
  symbol: z.string(),
  symbolSize: z.number().min(1).max(50),
  symbolRotate: z.number().min(0).max(360),
  symbolKeepAspect: z.boolean(),
  symbolOffsetX: z.number().min(-100).max(100),
  symbolOffsetY: z.number().min(-100).max(100),

  // 线条样式
  lineWidth: z.number().min(0.5).max(20),
  lineType: z.enum(["solid", "dashed", "dotted"]),
  lineColor: z.string(),
  lineShadowBlur: z.number().min(0).max(20),
  lineShadowColor: z.string(),
  lineShadowOffsetX: z.number().min(-20).max(20),
  lineShadowOffsetY: z.number().min(-20).max(20),

  // 堆叠
  stack: z.string(),
  stackStrategy: z.enum(["samesign", "all", "positive", "negative"]),

  // 区域样式
  areaStyleEnabled: z.boolean(),
  areaStyleOpacity: z.number().min(0).max(1),
  areaStyleOrigin: z.enum(["auto", "start", "end"]),
  areaColor: z.string(),

  // 标签
  labelShow: z.boolean(),
  labelPosition: z.enum(["top", "bottom", "left", "right", "inside"]),

  // 数据采样
  sampling: z.enum(["none", "average", "max", "min", "sum", "lttb"]),

  // 交互配置
  legendHoverLink: z.boolean(),
  triggerLineEvent: z.boolean(),
  cursor: z.string(),

  // 颜色
  color: z.string(),

  // 其他
  show: z.boolean(),
});

type SeriesData = z.infer<typeof seriesSchema>;

// Series编辑组件
function SeriesEditor({
  index,
  initialData,
  onUpdate,
}: {
  index: number;
  initialData: SeriesData;
  onUpdate: (index: number, data: SeriesData) => void;
}) {
  const form = useForm<SeriesData>({
    resolver: zodResolver(seriesSchema),
    defaultValues: initialData,
  });

  const handleFieldChange = (field: keyof SeriesData, value: any) => {
    const currentValues = form.getValues();
    const newData = { ...currentValues, [field]: value };
    onUpdate(index, newData);
  };

  return (
    <Stack spacing={3}>
      {/* Basic Settings */}
      <BasicSettingsSection
        control={form.control}
        onFieldChange={handleFieldChange}
        defaultExpanded
      />

      {/* Line Style */}
      <LineStyleSection
        control={form.control}
        watch={form.watch}
        onFieldChange={handleFieldChange}
      />

      {/* Symbol Style */}
      <SymbolStyleSection
        control={form.control}
        onFieldChange={handleFieldChange}
      />

      {/* Area Style */}
      <AreaStyleSection
        control={form.control}
        watch={form.watch}
        onFieldChange={handleFieldChange}
      />

      {/* Advanced Settings */}
      <AdvancedSection
        control={form.control}
        watch={form.watch}
        onFieldChange={handleFieldChange}
      />
    </Stack>
  );
}

export function ChartsSeriesManager() {
  const { option, updateSeries, addSeries, removeSeries } = useChartStore();
  const [expandedSeries, setExpandedSeries] = useState<number | false>(false);

  const series =
    option.series && Array.isArray(option.series) ? option.series : [];

  // Series 配置表单（仅用于添加新series）
  const addSeriesForm = useForm<SeriesData>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      name: "",
      type: "line",
      smooth: false,
      smoothMonotone: "none",
      step: "false",
      connectNulls: false,
      clip: true,
      showSymbol: true,
      showAllSymbol: "auto",
      symbol: "emptyCircle",
      symbolSize: 6,
      symbolRotate: 0,
      symbolKeepAspect: false,
      symbolOffsetX: 0,
      symbolOffsetY: 0,
      lineWidth: 2,
      lineType: "solid",
      lineColor: "#5470c6",
      lineShadowBlur: 0,
      lineShadowColor: "rgba(0,0,0,0.5)",
      lineShadowOffsetX: 0,
      lineShadowOffsetY: 0,
      stack: "",
      stackStrategy: "samesign",
      areaStyleEnabled: false,
      areaStyleOpacity: 0.7,
      areaStyleOrigin: "auto",
      areaColor: "rgba(84, 112, 198, 0.3)",
      labelShow: false,
      labelPosition: "top",
      sampling: "none",
      legendHoverLink: true,
      triggerLineEvent: false,
      cursor: "pointer",
      color: "#5470c6",
      show: true,
    },
  });

  const handleAddSeries = useCallback(
    (data: SeriesData) => {
      const newSeries: any = {
        name: data.name,
        type: data.type,
        smooth: data.smooth,
        smoothMonotone:
          data.smoothMonotone === "none" ? undefined : data.smoothMonotone,
        step: data.step === "false" ? false : data.step,
        connectNulls: data.connectNulls,
        clip: data.clip,
        showSymbol: data.showSymbol,
        showAllSymbol:
          data.showAllSymbol === "auto"
            ? "auto"
            : data.showAllSymbol === "true",
        symbol: data.symbol,
        symbolSize: data.symbolSize,
        symbolRotate: data.symbolRotate,
        symbolKeepAspect: data.symbolKeepAspect,
        symbolOffset: [data.symbolOffsetX, data.symbolOffsetY],
        lineStyle: {
          width: data.lineWidth,
          type: data.lineType,
          color: data.lineColor,
          shadowBlur: data.lineShadowBlur,
          shadowColor: data.lineShadowColor,
          shadowOffsetX: data.lineShadowOffsetX,
          shadowOffsetY: data.lineShadowOffsetY,
        },
        sampling: data.sampling === "none" ? undefined : data.sampling,
        legendHoverLink: data.legendHoverLink,
        triggerLineEvent: data.triggerLineEvent,
        cursor: data.cursor,
        show: data.show,
        data: [], // 默认空数据
      };

      // 堆叠配置
      if (data.stack) {
        newSeries.stack = data.stack;
        newSeries.stackStrategy = data.stackStrategy;
      }

      // 区域样式
      if (data.areaStyleEnabled) {
        newSeries.areaStyle = {
          opacity: data.areaStyleOpacity,
          origin: data.areaStyleOrigin,
          color: data.areaColor,
        };
      }

      // 标签
      if (data.labelShow) {
        newSeries.label = {
          show: true,
          position: data.labelPosition,
        };
      }

      // 颜色
      if (data.color) {
        newSeries.itemStyle = {
          color: data.color,
        };
      }

      addSeries(newSeries);
      addSeriesForm.reset();
      Toast.success("Series added successfully");
    },
    [addSeries, addSeriesForm]
  );

  const handleUpdateSeries = useCallback(
    (index: number, data: Partial<SeriesData>) => {
      const updateData: any = {
        name: data.name,
        smooth: data.smooth,
        smoothMonotone:
          data.smoothMonotone === "none" ? undefined : data.smoothMonotone,
        step: data.step === "false" ? false : data.step,
        connectNulls: data.connectNulls,
        clip: data.clip,
        showSymbol: data.showSymbol,
        showAllSymbol:
          data.showAllSymbol === "auto"
            ? "auto"
            : data.showAllSymbol === "true",
        symbol: data.symbol,
        symbolSize: data.symbolSize,
        symbolRotate: data.symbolRotate,
        symbolKeepAspect: data.symbolKeepAspect,
        symbolOffset: [data.symbolOffsetX || 0, data.symbolOffsetY || 0],
        lineStyle: {
          width: data.lineWidth,
          type: data.lineType,
          color: data.lineColor,
          shadowBlur: data.lineShadowBlur,
          shadowColor: data.lineShadowColor,
          shadowOffsetX: data.lineShadowOffsetX,
          shadowOffsetY: data.lineShadowOffsetY,
        },
        sampling: data.sampling === "none" ? undefined : data.sampling,
        legendHoverLink: data.legendHoverLink,
        triggerLineEvent: data.triggerLineEvent,
        cursor: data.cursor,
        show: data.show,
      };

      if (data.stack) {
        updateData.stack = data.stack;
        updateData.stackStrategy = data.stackStrategy;
      }

      if (data.areaStyleEnabled) {
        updateData.areaStyle = {
          opacity: data.areaStyleOpacity,
          origin: data.areaStyleOrigin,
          color: data.areaColor,
        };
      } else {
        updateData.areaStyle = undefined;
      }

      if (data.labelShow) {
        updateData.label = {
          show: true,
          position: data.labelPosition,
        };
      } else {
        updateData.label = { show: false };
      }

      if (data.color) {
        updateData.itemStyle = {
          color: data.color,
        };
      }

      updateSeries(index, updateData);
    },
    [updateSeries]
  );

  const handleRemoveSeries = useCallback(
    (index: number) => {
      const seriesName = series[index]?.name || `Series ${index + 1}`;
      if (confirm(`Are you sure you want to remove "${seriesName}"?`)) {
        removeSeries(index);
        Toast.success("Series removed successfully");
      }
    },
    [series, removeSeries]
  );

  const handleDuplicateSeries = useCallback(
    (index: number) => {
      const seriesToDuplicate = series[index];
      if (seriesToDuplicate) {
        const newSeries = {
          ...seriesToDuplicate,
          name: `${seriesToDuplicate.name || `Series ${index + 1}`} (Copy)`,
        };
        addSeries(newSeries);
        Toast.success("Series duplicated successfully");
      }
    },
    [series, addSeries]
  );

  const getSeriesFormData = useCallback(
    (index: number): SeriesData => {
      const seriesData = series[index];

      return {
        name: seriesData.name || "",
        type: seriesData.type || "line",
        smooth: seriesData.smooth || false,
        smoothMonotone: (seriesData.smoothMonotone || "none") as any,
        step: (seriesData.step || "false") as any,
        connectNulls: seriesData.connectNulls || false,
        clip: seriesData.clip !== false,
        showSymbol: seriesData.showSymbol !== false,
        showAllSymbol: (seriesData.showAllSymbol === "auto"
          ? "auto"
          : seriesData.showAllSymbol
            ? "true"
            : "false") as any,
        symbol: seriesData.symbol || "emptyCircle",
        symbolSize: seriesData.symbolSize ?? 6,
        symbolRotate: seriesData.symbolRotate ?? 0,
        symbolKeepAspect: seriesData.symbolKeepAspect || false,
        symbolOffsetX: Array.isArray(seriesData.symbolOffset)
          ? (seriesData.symbolOffset[0] ?? 0)
          : 0,
        symbolOffsetY: Array.isArray(seriesData.symbolOffset)
          ? (seriesData.symbolOffset[1] ?? 0)
          : 0,
        lineWidth: seriesData.lineStyle?.width ?? 2,
        lineType: (seriesData.lineStyle?.type || "solid") as any,
        lineColor: seriesData.lineStyle?.color || "#5470c6",
        lineShadowBlur: seriesData.lineStyle?.shadowBlur ?? 0,
        lineShadowColor: seriesData.lineStyle?.shadowColor || "rgba(0,0,0,0.5)",
        lineShadowOffsetX: seriesData.lineStyle?.shadowOffsetX ?? 0,
        lineShadowOffsetY: seriesData.lineStyle?.shadowOffsetY ?? 0,
        stack: seriesData.stack || "",
        stackStrategy: (seriesData.stackStrategy || "samesign") as any,
        areaStyleEnabled: !!seriesData.areaStyle,
        areaStyleOpacity: seriesData.areaStyle?.opacity ?? 0.7,
        areaStyleOrigin: (seriesData.areaStyle?.origin || "auto") as any,
        areaColor: seriesData.areaStyle?.color || "rgba(84, 112, 198, 0.3)",
        labelShow: seriesData.label?.show || false,
        labelPosition: (seriesData.label?.position || "top") as any,
        sampling: (seriesData.sampling || "none") as any,
        legendHoverLink: seriesData.legendHoverLink !== false,
        triggerLineEvent: seriesData.triggerLineEvent || false,
        cursor: seriesData.cursor || "pointer",
        color: seriesData.itemStyle?.color || "#5470c6",
        show: seriesData.show !== false,
      };
    },
    [series]
  );

  const getChartTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      line: "Line",
      bar: "Bar",
      scatter: "Scatter",
      area: "Area",
      pie: "Pie",
      radar: "Radar",
    };
    return typeMap[type] || type;
  };

  const renderAddSeriesForm = () => (
    <form
      onSubmit={addSeriesForm.handleSubmit((data) =>
        handleAddSeries(data as unknown as SeriesData)
      )}
    >
      <Stack spacing={3}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">Basic Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Controller
                name="name"
                control={addSeriesForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Series Name"
                    fullWidth
                    size="small"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="type"
                control={addSeriesForm.control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Chart Type</InputLabel>
                    <Select {...field} label="Chart Type">
                      <MenuItem value="line">Line</MenuItem>
                      <MenuItem value="bar">Bar</MenuItem>
                      <MenuItem value="scatter">Scatter</MenuItem>
                      <MenuItem value="area">Area</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Button type="submit" variant="contained" fullWidth>
          Add Series
        </Button>
      </Stack>
    </form>
  );

  return (
    <Paper sx={{ height: "100%", overflow: "auto", p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Series Manager
      </Typography>

      <Stack spacing={2}>
        {/* 添加新 Series */}
        <Accordion defaultExpanded={series.length === 0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Add New Series</Typography>
          </AccordionSummary>
          <AccordionDetails>{renderAddSeriesForm()}</AccordionDetails>
        </Accordion>

        <Divider />

        {/* 现有的 Series */}
        <Typography variant="subtitle1" gutterBottom>
          Existing Series ({series.length})
        </Typography>

        {series.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
            No series added yet. Add your first series above.
          </Box>
        ) : (
          <Stack spacing={1}>
            {series.map((seriesItem: any, index: number) => (
              <Box
                key={index}
                sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                  onClick={() =>
                    setExpandedSeries(expandedSeries === index ? false : index)
                  }
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={getChartTypeLabel(seriesItem.type || "unknown")}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="subtitle2">
                      {seriesItem.name || `Series ${index + 1}`}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateSeries(index);
                      }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSeries(index);
                      }}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Details - 直接显示编辑表单 */}
                {expandedSeries === index && (
                  <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
                    <SeriesEditor
                      index={index}
                      initialData={getSeriesFormData(index)}
                      onUpdate={handleUpdateSeries}
                    />
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
