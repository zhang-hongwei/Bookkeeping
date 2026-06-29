"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Stack,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Box,
  Slider,
  Tabs,
  Tab,
} from "@mui/material";
import { useState } from "react";
import { useChartStore } from "@/stores/charts/chart-store";

const axisSchema = z.object({
  show: z.boolean().default(true),
  name: z.string().optional(),
  nameLocation: z.enum(["start", "middle", "end"]).default("end"),
  nameGap: z.number().min(0).max(50).default(15),
  type: z.enum(["category", "value", "time", "log"]).default("category"),
  inverse: z.boolean().default(false),
  boundaryGap: z.boolean().default(true),
  axisLine: z.object({
    show: z.boolean().default(true),
    lineStyle: z.object({
      color: z.string().default("#333"),
      width: z.number().min(1).max(10).default(1),
    }),
  }),
  axisTick: z.object({
    show: z.boolean().default(true),
    length: z.number().min(1).max(20).default(5),
  }),
  axisLabel: z.object({
    show: z.boolean().default(true),
    rotate: z.number().min(-90).max(90).default(0),
    margin: z.number().min(0).max(50).default(8),
  }),
  splitLine: z.object({
    show: z.boolean().default(true),
    lineStyle: z.object({
      color: z.string().default("#e0e0e0"),
      width: z.number().min(1).max(10).default(1),
    }),
  }),
});

type AxisFormData = z.infer<typeof axisSchema>;

export function AxisConfig() {
  const [activeTab, setActiveTab] = useState(0);
  const { option, updateXAxis, updateYAxis } = useChartStore();

  const xAxisForm = useForm<AxisFormData>({
    resolver: zodResolver(axisSchema),
    defaultValues: {
      show: true,
      name: "",
      nameLocation: "end",
      nameGap: 15,
      type: "category",
      inverse: false,
      boundaryGap: true,
      axisLine: {
        show: true,
        lineStyle: { color: "#333", width: 1 },
      },
      axisTick: {
        show: true,
        length: 5,
      },
      axisLabel: {
        show: true,
        rotate: 0,
        margin: 8,
      },
      splitLine: {
        show: false,
        lineStyle: { color: "#e0e0e0", width: 1 },
      },
    },
  });

  const yAxisForm = useForm<AxisFormData>({
    resolver: zodResolver(axisSchema),
    defaultValues: {
      show: true,
      name: "",
      nameLocation: "end",
      nameGap: 15,
      type: "value",
      inverse: false,
      boundaryGap: false,
      axisLine: {
        show: true,
        lineStyle: { color: "#333", width: 1 },
      },
      axisTick: {
        show: true,
        length: 5,
      },
      axisLabel: {
        show: true,
        rotate: 0,
        margin: 8,
      },
      splitLine: {
        show: true,
        lineStyle: { color: "#e0e0e0", width: 1 },
      },
    },
  });

  // Real-time update for X-Axis
  useEffect(() => {
    const subscription = xAxisForm.watch((value) => {
      updateXAxis(value as any);
    });
    return () => subscription.unsubscribe();
  }, [xAxisForm]);

  // Real-time update for Y-Axis
  useEffect(() => {
    const subscription = yAxisForm.watch((value) => {
      updateYAxis(value as any);
    });
    return () => subscription.unsubscribe();
  }, [yAxisForm]);

  const renderAxisForm = (form: typeof xAxisForm) => (
    <Stack spacing={3}>
      <Controller
        name="show"
        control={form.control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value} onChange={field.onChange} />}
            label="Show Axis"
          />
        )}
      />

      <Divider />

      <Typography variant="caption" color="text.secondary">
        Basic Settings
      </Typography>

      <Controller
        name="name"
        control={form.control}
        render={({ field }) => (
          <TextField {...field} label="Axis Name" fullWidth size="small" />
        )}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Type"
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="category">Category</option>
                <option value="value">Value</option>
                <option value="time">Time</option>
                <option value="log">Log</option>
              </TextField>
            )}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Controller
            name="nameLocation"
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Name Location"
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="start">Start</option>
                <option value="middle">Middle</option>
                <option value="end">End</option>
              </TextField>
            )}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <Controller
            name="inverse"
            control={form.control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={field.onChange} />}
                label="Inverse"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Controller
            name="boundaryGap"
            control={form.control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={field.onChange} />}
                label="Boundary Gap"
              />
            )}
          />
        </Grid>
      </Grid>

      <Divider />

      <Typography variant="caption" color="text.secondary">
        Axis Line
      </Typography>

      <Controller
        name="axisLine.show"
        control={form.control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value} onChange={field.onChange} />}
            label="Show Axis Line"
          />
        )}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <Controller
            name="axisLine.lineStyle.color"
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Line Color"
                type="color"
                fullWidth
                size="small"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Controller
            name="axisLine.lineStyle.width"
            control={form.control}
            render={({ field }) => (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Width: {field.value}px
                </Typography>
                <Slider
                  {...field}
                  value={field.value}
                  onChange={(_, value) => field.onChange(value as number)}
                  min={1}
                  max={10}
                  step={1}
                />
              </Box>
            )}
          />
        </Grid>
      </Grid>

      <Divider />

      <Typography variant="caption" color="text.secondary">
        Axis Tick
      </Typography>

      <Controller
        name="axisTick.show"
        control={form.control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value} onChange={field.onChange} />}
            label="Show Axis Tick"
          />
        )}
      />

      <Controller
        name="axisTick.length"
        control={form.control}
        render={({ field }) => (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Tick Length: {field.value}px
            </Typography>
            <Slider
              {...field}
              value={field.value}
              onChange={(_, value) => field.onChange(value as number)}
              min={1}
              max={20}
              step={1}
            />
          </Box>
        )}
      />

      <Divider />

      <Typography variant="caption" color="text.secondary">
        Axis Label
      </Typography>

      <Controller
        name="axisLabel.show"
        control={form.control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value} onChange={field.onChange} />}
            label="Show Axis Label"
          />
        )}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <Controller
            name="axisLabel.rotate"
            control={form.control}
            render={({ field }) => (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Rotate: {field.value}°
                </Typography>
                <Slider
                  {...field}
                  value={field.value}
                  onChange={(_, value) => field.onChange(value as number)}
                  min={-90}
                  max={90}
                  step={15}
                  marks={[
                    { value: -90, label: "-90" },
                    { value: 0, label: "0" },
                    { value: 90, label: "90" },
                  ]}
                />
              </Box>
            )}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Controller
            name="axisLabel.margin"
            control={form.control}
            render={({ field }) => (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Margin: {field.value}px
                </Typography>
                <Slider
                  {...field}
                  value={field.value}
                  onChange={(_, value) => field.onChange(value as number)}
                  min={0}
                  max={50}
                  step={1}
                />
              </Box>
            )}
          />
        </Grid>
      </Grid>

      <Divider />

      <Typography variant="caption" color="text.secondary">
        Split Line
      </Typography>

      <Controller
        name="splitLine.show"
        control={form.control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value} onChange={field.onChange} />}
            label="Show Split Line"
          />
        )}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <Controller
            name="splitLine.lineStyle.color"
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Line Color"
                type="color"
                fullWidth
                size="small"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Controller
            name="splitLine.lineStyle.width"
            control={form.control}
            render={({ field }) => (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Width: {field.value}px
                </Typography>
                <Slider
                  {...field}
                  value={field.value}
                  onChange={(_, value) => field.onChange(value as number)}
                  min={1}
                  max={10}
                  step={1}
                />
              </Box>
            )}
          />
        </Grid>
      </Grid>
    </Stack>
  );

  return (
    <Box>
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
        <Tab label="X-Axis" />
        <Tab label="Y-Axis" />
      </Tabs>
      <Box sx={{ pt: 3 }}>
        {activeTab === 0 && renderAxisForm(xAxisForm)}
        {activeTab === 1 && renderAxisForm(yAxisForm)}
      </Box>
    </Box>
  );
}
