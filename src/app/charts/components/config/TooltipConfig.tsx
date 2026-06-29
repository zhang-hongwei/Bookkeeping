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

const tooltipSchema = z.object({
  show: z.boolean().default(true),
  trigger: z.enum(["item", "axis", "none"]).default("axis"),
  axisPointer: z.object({
    type: z.enum(["line", "shadow", "cross", "none"]).default("line"),
  }),
  showContent: z.boolean().default(true),
  triggerOn: z.enum(["mousemove", "click", "mousemove|click", "none"]).default("mousemove|click"),
  showDelay: z.number().min(0).max(1000).default(0),
  hideDelay: z.number().min(0).max(1000).default(100),
  padding: z.number().min(0).max(20).default(5),
  borderWidth: z.number().min(0).max(10).default(1),
  borderColor: z.string().default("#333"),
  backgroundColor: z.string().default("rgba(50,50,50,0.7)"),
});

type TooltipFormData = z.infer<typeof tooltipSchema>;

export function TooltipConfig() {
  const { option, updateTooltip } = useChartStore();

  const form = useForm<TooltipFormData>({
    resolver: zodResolver(tooltipSchema),
    defaultValues: {
      show: option.tooltip?.show !== false,
      trigger: (option.tooltip?.trigger as "item" | "axis" | "none") || "axis",
      axisPointer: {
        type: "line",
      },
      showContent: true,
      triggerOn: "mousemove|click",
      showDelay: 0,
      hideDelay: 100,
      padding: 5,
      borderWidth: 1,
      borderColor: "#333",
      backgroundColor: "rgba(50,50,50,0.7)",
    },
  });

  // Real-time update
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateTooltip({
        show: value.show,
        trigger: value.trigger,
        axisPointer: value.axisPointer,
        showContent: value.showContent,
        triggerOn: value.triggerOn,
        showDelay: value.showDelay,
        hideDelay: value.hideDelay,
        padding: value.padding,
        borderWidth: value.borderWidth,
        borderColor: value.borderColor,
        backgroundColor: value.backgroundColor,
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="text.secondary">
        Tooltip Configuration
      </Typography>

      <Controller
        name="show"
        control={form.control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value} onChange={field.onChange} />}
            label="Show Tooltip"
          />
        )}
      />

      <Controller
        name="showContent"
        control={form.control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value} onChange={field.onChange} />}
            label="Show Content"
          />
        )}
      />

      <Divider />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <Controller
            name="trigger"
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Trigger"
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="item">Item</option>
                <option value="axis">Axis</option>
                <option value="none">None</option>
              </TextField>
            )}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Controller
            name="axisPointer.type"
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Axis Pointer"
                fullWidth
                size="small"
                SelectProps={{ native: true }}
              >
                <option value="line">Line</option>
                <option value="shadow">Shadow</option>
                <option value="cross">Cross</option>
                <option value="none">None</option>
              </TextField>
            )}
          />
        </Grid>
      </Grid>

      <Controller
        name="triggerOn"
        control={form.control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Trigger On"
            fullWidth
            size="small"
            SelectProps={{ native: true }}
          >
            <option value="mousemove">Mouse Move</option>
            <option value="click">Click</option>
            <option value="mousemove|click">Mouse Move or Click</option>
            <option value="none">None</option>
          </TextField>
        )}
      />

      <Divider />

      <Typography variant="caption" color="text.secondary">
        Timing
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <Controller
            name="showDelay"
            control={form.control}
            render={({ field }) => (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Show Delay: {field.value}ms
                </Typography>
                <Slider
                  {...field}
                  value={field.value}
                  onChange={(_, value) => field.onChange(value as number)}
                  min={0}
                  max={1000}
                  step={10}
                />
              </Box>
            )}
          />
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Controller
            name="hideDelay"
            control={form.control}
            render={({ field }) => (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Hide Delay: {field.value}ms
                </Typography>
                <Slider
                  {...field}
                  value={field.value}
                  onChange={(_, value) => field.onChange(value as number)}
                  min={0}
                  max={1000}
                  step={10}
                />
              </Box>
            )}
          />
        </Grid>
      </Grid>

      <Divider />

      <Typography variant="caption" color="text.secondary">
        Style
      </Typography>

      <Controller
        name="backgroundColor"
        control={form.control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Background Color"
            fullWidth
            size="small"
            placeholder="rgba(50,50,50,0.7)"
          />
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
        name="padding"
        control={form.control}
        render={({ field }) => (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Padding: {field.value}px
            </Typography>
            <Slider
              {...field}
              value={field.value}
              onChange={(_, value) => field.onChange(value as number)}
              min={0}
              max={20}
              step={1}
            />
          </Box>
        )}
      />
    </Stack>
  );
}
