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
  Slider,
  Box,
  Divider,
} from "@mui/material";
import { useChartStore } from "@/stores/charts/chart-store";

const titleSchema = z.object({
  text: z.string(),
  subtext: z.string().optional(),
  left: z.enum(["left", "center", "right", "auto"]).default("auto"),
  top: z.enum(["top", "middle", "bottom", "auto"]).default("auto"),
  textStyle: z.object({
    fontSize: z.number().min(12).max(48).default(18),
    fontWeight: z.enum(["normal", "bold", "bolder", "lighter"]).default("normal"),
    color: z.string().default("#333"),
  }),
});

type TitleFormData = z.infer<typeof titleSchema>;

export function TitleConfig() {
  const { option, updateTitle } = useChartStore();

  const form = useForm<TitleFormData>({
    resolver: zodResolver(titleSchema),
    defaultValues: {
      text: (option.title && !Array.isArray(option.title) ? option.title.text : "") || "",
      subtext: (option.title && !Array.isArray(option.title) ? option.title.subtext : "") || "",
      left: "auto",
      top: "auto",
      textStyle: {
        fontSize: 18,
        fontWeight: "normal",
        color: "#333",
      },
    },
  });

  // Real-time update
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateTitle(value.text || "", value.subtext);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="text.secondary">
        Title Configuration
      </Typography>

      <Controller
        name="text"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Title"
            fullWidth
            size="small"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name="subtext"
        control={form.control}
        render={({ field }) => (
          <TextField {...field} label="Subtitle" fullWidth size="small" />
        )}
      />

      <Divider />

      <Controller
        name="left"
        control={form.control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Horizontal Alignment"
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

      <Controller
        name="top"
        control={form.control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Vertical Alignment"
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

      <Divider />

      <Typography variant="caption" color="text.secondary">
        Text Style
      </Typography>

      <Controller
        name="textStyle.fontSize"
        control={form.control}
        render={({ field }) => (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Font Size: {field.value}px
            </Typography>
            <Slider
              {...field}
              value={field.value}
              onChange={(_, value) => field.onChange(value as number)}
              min={12}
              max={48}
              step={1}
              marks={[
                { value: 12, label: "12" },
                { value: 24, label: "24" },
                { value: 36, label: "36" },
                { value: 48, label: "48" },
              ]}
            />
          </Box>
        )}
      />

      <Controller
        name="textStyle.fontWeight"
        control={form.control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Font Weight"
            fullWidth
            size="small"
            SelectProps={{ native: true }}
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="bolder">Bolder</option>
            <option value="lighter">Lighter</option>
          </TextField>
        )}
      />

      <Controller
        name="textStyle.color"
        control={form.control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Text Color"
            type="color"
            fullWidth
            size="small"
          />
        )}
      />
    </Stack>
  );
}
