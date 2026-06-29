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
} from "@mui/material";
import { useChartStore } from "@/stores/charts/chart-store";

const gridSchema = z.object({
  show: z.boolean().default(false),
  left: z.string().default("10%"),
  right: z.string().default("10%"),
  top: z.string().default("60px"),
  bottom: z.string().default("60px"),
  containLabel: z.boolean().default(true),
  backgroundColor: z.string().default("transparent"),
  borderWidth: z.number().min(0).max(10).default(1),
  borderColor: z.string().default("#ccc"),
});

type GridFormData = z.infer<typeof gridSchema>;

export function GridConfig() {
  const { option, updateGrid } = useChartStore();

  const form = useForm<GridFormData>({
    resolver: zodResolver(gridSchema),
    defaultValues: {
      show: option.grid?.show || false,
      left: (option.grid?.left as string) || "10%",
      right: (option.grid?.right as string) || "10%",
      top: (option.grid?.top as string) || "60px",
      bottom: (option.grid?.bottom as string) || "60px",
      containLabel: option.grid?.containLabel !== false,
      backgroundColor: (option.grid?.backgroundColor as string) || "transparent",
      borderWidth: 1,
      borderColor: "#ccc",
    },
  });

  // Real-time update
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateGrid({
        show: value.show,
        left: value.left,
        right: value.right,
        top: value.top,
        bottom: value.bottom,
        containLabel: value.containLabel,
        backgroundColor: value.backgroundColor,
        borderWidth: value.borderWidth,
        borderColor: value.borderColor,
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="text.secondary">
        Grid Configuration
      </Typography>

      <Controller
        name="show"
        control={form.control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value} onChange={field.onChange} />}
            label="Show Grid Border"
          />
        )}
      />

      <Controller
        name="containLabel"
        control={form.control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value} onChange={field.onChange} />}
            label="Contain Label"
          />
        )}
      />

      <Divider />

      <Typography variant="caption" color="text.secondary">
        Grid Position & Size
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <Controller
            name="left"
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Left"
                fullWidth
                size="small"
                placeholder="e.g., 10% or 50px"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Controller
            name="right"
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Right"
                fullWidth
                size="small"
                placeholder="e.g., 10% or 50px"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Controller
            name="top"
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Top"
                fullWidth
                size="small"
                placeholder="e.g., 10% or 50px"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Controller
            name="bottom"
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Bottom"
                fullWidth
                size="small"
                placeholder="e.g., 10% or 50px"
              />
            )}
          />
        </Grid>
      </Grid>

      <Divider />

      <Typography variant="caption" color="text.secondary">
        Grid Style
      </Typography>

      <Controller
        name="backgroundColor"
        control={form.control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Background Color"
            type="color"
            fullWidth
            size="small"
          />
        )}
      />

      <Controller
        name="borderWidth"
        control={form.control}
        render={({ field }) => (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Border Width: {field.value}px
            </Typography>
            <Slider
              {...field}
              value={field.value}
              onChange={(_, value) => field.onChange(value as number)}
              min={0}
              max={10}
              step={1}
            />
          </Box>
        )}
      />

      <Controller
        name="borderColor"
        control={form.control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Border Color"
            type="color"
            fullWidth
            size="small"
          />
        )}
      />
    </Stack>
  );
}
