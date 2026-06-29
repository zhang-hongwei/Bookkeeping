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
  Slider,
  Box,
} from "@mui/material";
import { useChartStore } from "@/stores/charts/chart-store";

const legendSchema = z.object({
  show: z.boolean().default(true),
  orient: z.enum(["horizontal", "vertical"]).default("horizontal"),
  left: z.enum(["left", "center", "right", "auto"]).default("auto"),
  top: z.enum(["top", "middle", "bottom", "auto"]).default("auto"),
  align: z.enum(["auto", "left", "right"]).default("auto"),
  padding: z.number().min(0).max(50).default(5),
  itemGap: z.number().min(0).max(50).default(10),
  itemWidth: z.number().min(10).max(50).default(25),
  itemHeight: z.number().min(10).max(50).default(14),
});

type LegendFormData = z.infer<typeof legendSchema>;

export function LegendConfig() {
  const { option, updateLegend } = useChartStore();

  const form = useForm<LegendFormData>({
    resolver: zodResolver(legendSchema),
    defaultValues: {
      show: option.legend?.show !== false,
      orient: (option.legend?.orient as "horizontal" | "vertical") || "horizontal",
      left: "auto",
      top: "auto",
      align: "auto",
      padding: 5,
      itemGap: 10,
      itemWidth: 25,
      itemHeight: 14,
    },
  });

  // Real-time update
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateLegend({
        show: value.show,
        orient: value.orient,
        left: value.left,
        top: value.top,
        align: value.align,
        padding: value.padding,
        itemGap: value.itemGap,
        itemWidth: value.itemWidth,
        itemHeight: value.itemHeight,
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="text.secondary">
        Legend Configuration
      </Typography>

      <Controller
        name="show"
        control={form.control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value} onChange={field.onChange} />}
            label="Show Legend"
          />
        )}
      />

      <Divider />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <Controller
            name="orient"
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Orient"
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </TextField>
            )}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Controller
            name="align"
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Align"
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="auto">Auto</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </TextField>
            )}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <Controller
            name="left"
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Horizontal Position"
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="auto">Auto</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </TextField>
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
                select
                label="Vertical Position"
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="auto">Auto</option>
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
              </TextField>
            )}
          />
        </Grid>
      </Grid>

      <Divider />

      <Typography variant="caption" color="text.secondary">
        Item Style
      </Typography>

      <Controller
        name="itemGap"
        control={form.control}
        render={({ field }) => (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Item Gap: {field.value}px
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

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <Controller
            name="itemWidth"
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
                  min={10}
                  max={50}
                  step={1}
                />
              </Box>
            )}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Controller
            name="itemHeight"
            control={form.control}
            render={({ field }) => (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Height: {field.value}px
                </Typography>
                <Slider
                  {...field}
                  value={field.value}
                  onChange={(_, value) => field.onChange(value as number)}
                  min={10}
                  max={50}
                  step={1}
                />
              </Box>
            )}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
