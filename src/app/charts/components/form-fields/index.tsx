"use client";

import {
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Box,
  Typography,
  Grid,
  SelectProps,
} from "@mui/material";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";

// 通用字段更改处理器类型
type FieldChangeHandler<TFieldValues extends FieldValues> = (
  field: FieldPath<TFieldValues>,
  value: any
) => void;

// FormSwitch - Switch 开关组件
interface FormSwitchProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  onFieldChange?: FieldChangeHandler<TFieldValues>;
}

export function FormSwitch<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  onFieldChange,
}: FormSwitchProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Switch
              checked={field.value}
              onChange={(e) => {
                field.onChange(e);
                onFieldChange?.(name, e.target.checked);
              }}
            />
          }
          label={label}
        />
      )}
    />
  );
}

// FormSelect - 下拉选择组件
interface FormSelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  options: FormSelectOption[];
  onFieldChange?: FieldChangeHandler<TFieldValues>;
  fullWidth?: boolean;
  size?: "small" | "medium";
  native?: boolean;
}

export function FormSelect<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  options,
  onFieldChange,
  fullWidth = true,
  size = "small",
  native = true,
}: FormSelectProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl fullWidth={fullWidth} size={size}>
          <InputLabel>{label}</InputLabel>
          <Select
            {...field}
            onChange={(e) => {
              field.onChange(e);
              onFieldChange?.(name, e.target.value);
            }}
            label={label}
            native={native}
          >
            {native ? (
              options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            ) : (
              options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      )}
    />
  );
}

// FormTextField - 文本输入框组件
interface FormTextFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  onFieldChange?: FieldChangeHandler<TFieldValues>;
  type?: "text" | "number" | "color";
  fullWidth?: boolean;
  size?: "small" | "medium";
  placeholder?: string;
  min?: number;
  max?: number;
}

export function FormTextField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  onFieldChange,
  type = "text",
  fullWidth = true,
  size = "small",
  placeholder,
  min,
  max,
}: FormTextFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          value={field.value ?? ""}
          onChange={(e) => {
            const value = type === "number" ? Number(e.target.value) : e.target.value;
            field.onChange(value);
            onFieldChange?.(name, value);
          }}
          label={label}
          type={type}
          fullWidth={fullWidth}
          size={size}
          placeholder={placeholder}
          slotProps={{
            htmlInput: {
              ...(min !== undefined && { min }),
              ...(max !== undefined && { max }),
            },
          }}
        />
      )}
    />
  );
}

// FormSlider - 滑块组件
interface FormSliderProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  onFieldChange?: FieldChangeHandler<TFieldValues>;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  marks?: { value: number; label: string }[];
}

export function FormSlider<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  onFieldChange,
  min,
  max,
  step = 1,
  unit = "",
  marks,
}: FormSliderProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Box>
          <Typography variant="caption" color="text.secondary">
            {label}: {field.value}{unit}
          </Typography>
          <Slider
            {...field}
            value={field.value}
            onChange={(_, value) => {
              field.onChange(value);
              onFieldChange?.(name, value);
            }}
            min={min}
            max={max}
            step={step}
            marks={marks}
          />
        </Box>
      )}
    />
  );
}

// FormColorPicker - 颜色选择器组件
interface FormColorPickerProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  onFieldChange?: FieldChangeHandler<TFieldValues>;
  fullWidth?: boolean;
  size?: "small" | "medium";
}

/**
 * @deprecated Use OptimizedColorPicker instead for better performance
 */
export function FormColorPicker<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  onFieldChange,
  fullWidth = true,
  size = "small",
}: FormColorPickerProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          value={field.value ?? "#000000"}
          onChange={(e) => {
            field.onChange(e);
            onFieldChange?.(name, e.target.value);
          }}
          label={label}
          type="color"
          fullWidth={fullWidth}
          size={size}
        />
      )}
    />
  );
}

// 导出优化的颜色选择器
export { OptimizedColorPicker, RGBAColorPicker } from "./OptimizedColorPicker";

// 导出智能颜色选择器（支持渐变色）
export { SmartColorPicker } from "./SmartColorPicker";

// FormNumberFields - 数字输入字段组（用于 Offset X/Y 等成对字段）
interface FormNumberFieldsProps<TFieldValues extends FieldValues> {
  nameX: FieldPath<TFieldValues>;
  nameY: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  labelX: string;
  labelY: string;
  onFieldChange?: FieldChangeHandler<TFieldValues>;
  min?: number;
  max?: number;
}

export function FormNumberFields<TFieldValues extends FieldValues>({
  nameX,
  nameY,
  control,
  labelX,
  labelY,
  onFieldChange,
  min,
  max,
}: FormNumberFieldsProps<TFieldValues>) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6 }}>
        <FormTextField
          name={nameX}
          control={control}
          label={labelX}
          type="number"
          onFieldChange={onFieldChange}
          min={min}
          max={max}
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <FormTextField
          name={nameY}
          control={control}
          label={labelY}
          type="number"
          onFieldChange={onFieldChange}
          min={min}
          max={max}
        />
      </Grid>
    </Grid>
  );
}
