"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Stack,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  IconButton,
} from "@mui/material";
import {
  ExpandMore,
  Add,
  Remove,
  ContentCopy,
} from "@mui/icons-material";

import { useChartStore } from "@/stores/charts/chart-store";
import { ChartsSeriesManager } from "./ChartsSeriesManager";
import Toast from "@/components/ui/Toast";

// 基础配置 schema
const basicConfigSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  animation: z.boolean(),
  animationDuration: z.number().min(0),
});

// 系列配置 schema
const seriesConfigSchema = z.object({
  name: z.string(),
  type: z.string(),
  smooth: z.boolean(),
  showSymbol: z.boolean(),
  symbolSize: z.number().min(1),
  lineWidth: z.number().min(0.5),
  connectNulls: z.boolean(),
  step: z.enum(['false', 'start', 'end', 'middle']),
  stack: z.string().optional(),
});

// 轴配置 schema
const axisConfigSchema = z.object({
  show: z.boolean(),
  name: z.string().optional(),
  type: z.enum(['category', 'value', 'time', 'log']),
  inverse: z.boolean(),
  boundaryGap: z.boolean(),
  axisLine: z.object({
    show: z.boolean(),
  }),
  axisTick: z.object({
    show: z.boolean(),
  }),
  axisLabel: z.object({
    show: z.boolean(),
    rotate: z.number().min(-90).max(90),
  }),
});

type BasicConfigData = z.infer<typeof basicConfigSchema>;
type SeriesConfigData = z.infer<typeof seriesConfigSchema>;
type AxisConfigData = z.infer<typeof axisConfigSchema>;

export function ChartsAdvancedConfig() {
  const { option, updateTitle, updateLegend, updateGrid, updateTooltip, updateXAxis, updateYAxis, updateAnimation, updateColors } = useChartStore();

  // 基础配置表单
  const basicForm = useForm<BasicConfigData>({
    resolver: zodResolver(basicConfigSchema),
    defaultValues: {
      title: (option.title && !Array.isArray(option.title) ? option.title.text : "") || "",
      subtitle: (option.title && !Array.isArray(option.title) ? option.title.subtext : "") || "",
      animation: option.animation !== false,
      animationDuration: option.animationDuration || 1000,
    },
  });

  // 系列配置表单
  const seriesForm = useForm<SeriesConfigData>({
    resolver: zodResolver(seriesConfigSchema),
    defaultValues: {
      name: "",
      type: "line",
      smooth: false,
      showSymbol: true,
      symbolSize: 6,
      lineWidth: 2,
      connectNulls: false,
      step: "false",
    },
  });

  // X轴配置表单
  const xAxisForm = useForm<AxisConfigData>({
    resolver: zodResolver(axisConfigSchema),
    defaultValues: {
      show: true,
      name: "",
      type: "category",
      inverse: false,
      boundaryGap: true,
      axisLine: { show: true },
      axisTick: { show: true },
      axisLabel: { show: true, rotate: 0 },
    },
  });

  // Y轴配置表单
  const yAxisForm = useForm<AxisConfigData>({
    resolver: zodResolver(axisConfigSchema),
    defaultValues: {
      show: true,
      name: "",
      type: "value",
      inverse: false,
      boundaryGap: false,
      axisLine: { show: true },
      axisTick: { show: true },
      axisLabel: { show: true, rotate: 0 },
    },
  });

  const [copiedConfig, setCopiedConfig] = useState(false);

  // Real-time update for basic configuration
  useEffect(() => {
    const subscription = basicForm.watch((value) => {
      updateTitle(value.title || '', value.subtitle);
      updateAnimation(value.animation, value.animationDuration);
    });
    return () => subscription.unsubscribe();
  }, [basicForm, updateTitle, updateAnimation]);

  // Real-time update for X-axis configuration
  useEffect(() => {
    const subscription = xAxisForm.watch((value) => {
      updateXAxis(value);
    });
    return () => subscription.unsubscribe();
  }, [xAxisForm, updateXAxis]);

  // Real-time update for Y-axis configuration
  useEffect(() => {
    const subscription = yAxisForm.watch((value) => {
      updateYAxis(value);
    });
    return () => subscription.unsubscribe();
  }, [yAxisForm, updateYAxis]);

  const handleCopyFullConfig = useCallback(() => {
    const config = JSON.stringify(option, null, 2);
    navigator.clipboard.writeText(config).then(() => {
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
      Toast.success("Full configuration copied to clipboard");
    });
  }, [option]);

  return (
    <Paper sx={{ height: "100%", overflow: "auto", p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Advanced Configuration
      </Typography>

      <Stack spacing={2}>
        {/* 基础配置 */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Basic Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form onSubmit={basicForm.handleSubmit(handleBasicConfigSubmit)}>
              <Stack spacing={3}>
                <Controller
                  name="title"
                  control={basicForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Chart Title"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  name="subtitle"
                  control={basicForm.control}
                  render={({ field }) => (
                    <TextField {...field} label="Chart Subtitle" fullWidth />
                  )}
                />

                <Stack direction="row" spacing={2}>
                  <Controller
                    name="animation"
                    control={basicForm.control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={field.onChange} />}
                        label="Enable Animation"
                      />
                    )}
                  />

                  <Controller
                    name="animationDuration"
                    control={basicForm.control}
                    render={({ field, fieldState }) => (
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Duration (ms)
                        </Typography>
                        <Slider
                          {...field}
                          value={field.value}
                          onChange={(_, value) => field.onChange(value as number)}
                          min={0}
                          max={5000}
                          step={100}
                          marks={[
                            { value: 0, label: '0' },
                            { value: 1000, label: '1s' },
                            { value: 3000, label: '3s' },
                            { value: 5000, label: '5s' },
                          ]}
                        />
                      </Box>
                    )}
                  />
                </Stack>

                <Button type="submit" variant="contained">
                  Apply Basic Config
                </Button>
              </Stack>
            </form>
          </AccordionDetails>
        </Accordion>

        {/* Series 管理 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Series Manager</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <ChartsSeriesManager />
          </AccordionDetails>
        </Accordion>

        {/* X轴配置 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>X-Axis Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form onSubmit={xAxisForm.handleSubmit(handleXAxisConfigSubmit)}>
              <Stack spacing={3}>
                <Controller
                  name="name"
                  control={xAxisForm.control}
                  render={({ field }) => (
                    <TextField {...field} label="X-Axis Name" fullWidth />
                  )}
                />

                <Stack direction="row" spacing={2}>
                  <Controller
                    name="show"
                    control={xAxisForm.control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={field.onChange} />}
                        label="Show Axis"
                      />
                    )}
                  />

                  <Controller
                    name="inverse"
                    control={xAxisForm.control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={field.onChange} />}
                        label="Inverse"
                      />
                    )}
                  />

                  <Controller
                    name="boundaryGap"
                    control={xAxisForm.control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={field.onChange} />}
                        label="Boundary Gap"
                      />
                    )}
                  />
                </Stack>

                <Button type="submit" variant="contained">
                  Apply X-Axis Config
                </Button>
              </Stack>
            </form>
          </AccordionDetails>
        </Accordion>

        {/* Y轴配置 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Y-Axis Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form onSubmit={yAxisForm.handleSubmit(handleYAxisConfigSubmit)}>
              <Stack spacing={3}>
                <Controller
                  name="name"
                  control={yAxisForm.control}
                  render={({ field }) => (
                    <TextField {...field} label="Y-Axis Name" fullWidth />
                  )}
                />

                <Stack direction="row" spacing={2}>
                  <Controller
                    name="show"
                    control={yAxisForm.control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={field.onChange} />}
                        label="Show Axis"
                      />
                    )}
                  />

                  <Controller
                    name="inverse"
                    control={yAxisForm.control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={field.onChange} />}
                        label="Inverse"
                      />
                    )}
                  />

                  <Controller
                    name="boundaryGap"
                    control={yAxisForm.control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={field.onChange} />}
                        label="Boundary Gap"
                      />
                    )}
                  />
                </Stack>

                <Button type="submit" variant="contained">
                  Apply Y-Axis Config
                </Button>
              </Stack>
            </form>
          </AccordionDetails>
        </Accordion>

        {/* 导出配置 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Export Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={handleCopyFullConfig}
                fullWidth
              >
                {copiedConfig ? "Copied!" : "Copy Full Config"}
              </Button>

              <Typography variant="body2" color="text.secondary">
                This copies the complete ECharts configuration including all advanced settings.
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Paper>
  );
}