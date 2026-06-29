"use client";

import {
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Control, FieldValues, FieldPath, UseFormWatch } from "react-hook-form";
import {
  FormSwitch,
  FormSelect,
  FormSlider,
  FormNumberFields,
  SmartColorPicker,
  RGBAColorPicker,
} from "../form-fields";

interface LineStyleSectionProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  watch: UseFormWatch<TFieldValues>;
  onFieldChange: (field: FieldPath<TFieldValues>, value: any) => void;
}

export function LineStyleSection<TFieldValues extends FieldValues>({
  control,
  watch,
  onFieldChange,
}: LineStyleSectionProps<TFieldValues>) {
  const smoothValue = watch("smooth" as FieldPath<TFieldValues>);

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="subtitle2">Line Style</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {/* Smooth & Connect Nulls */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <FormSwitch
                name={"smooth" as FieldPath<TFieldValues>}
                control={control}
                label="Smooth Line"
                onFieldChange={onFieldChange}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormSwitch
                name={"connectNulls" as FieldPath<TFieldValues>}
                control={control}
                label="Connect Nulls"
                onFieldChange={onFieldChange}
              />
            </Grid>
          </Grid>

          {/* Smooth Monotone - 仅在 smooth=true 时显示 */}
          {smoothValue && (
            <FormSelect
              name={"smoothMonotone" as FieldPath<TFieldValues>}
              control={control}
              label="Smooth Monotone"
              options={[
                { value: "none", label: "None" },
                { value: "x", label: "X Axis" },
                { value: "y", label: "Y Axis" },
              ]}
              onFieldChange={onFieldChange}
              native={false}
            />
          )}

          {/* Step */}
          <FormSelect
            name={"step" as FieldPath<TFieldValues>}
            control={control}
            label="Step"
            options={[
              { value: "false", label: "None" },
              { value: "start", label: "Start" },
              { value: "middle", label: "Middle" },
              { value: "end", label: "End" },
            ]}
            onFieldChange={onFieldChange}
            native={false}
          />

          {/* Line Width */}
          <FormSlider
            name={"lineWidth" as FieldPath<TFieldValues>}
            control={control}
            label="Line Width"
            min={0.5}
            max={20}
            step={0.5}
            unit="px"
            onFieldChange={onFieldChange}
          />

          {/* Line Type */}
          <FormSelect
            name={"lineType" as FieldPath<TFieldValues>}
            control={control}
            label="Line Type"
            options={[
              { value: "solid", label: "Solid" },
              { value: "dashed", label: "Dashed" },
              { value: "dotted", label: "Dotted" },
            ]}
            onFieldChange={onFieldChange}
            native={false}
          />

          {/* Line Color - 支持渐变色 */}
          <SmartColorPicker
            name={"lineColor" as FieldPath<TFieldValues>}
            control={control}
            label="Line Color"
            onFieldChange={onFieldChange}
            defaultValue="#5470c6"
            supportGradient={true}
          />

          {/* Line Shadow Subsection */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            Line Shadow
          </Typography>

          <FormSlider
            name={"lineShadowBlur" as FieldPath<TFieldValues>}
            control={control}
            label="Shadow Blur"
            min={0}
            max={20}
            step={1}
            unit="px"
            onFieldChange={onFieldChange}
          />

          {/* Shadow Color - 使用 RGBA 颜色选择器 */}
          <RGBAColorPicker
            name={"lineShadowColor" as FieldPath<TFieldValues>}
            control={control}
            label="Shadow Color"
            onFieldChange={onFieldChange}
            defaultValue="rgba(0,0,0,0.5)"
          />

          <FormNumberFields
            nameX={"lineShadowOffsetX" as FieldPath<TFieldValues>}
            nameY={"lineShadowOffsetY" as FieldPath<TFieldValues>}
            control={control}
            labelX="Shadow Offset X"
            labelY="Shadow Offset Y"
            min={-20}
            max={20}
            onFieldChange={onFieldChange}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
