"use client";

import { useState, useEffect, useRef } from "react";
import {
  TextField,
  Box,
  Stack,
  Typography,
  Popover,
  IconButton,
} from "@mui/material";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { HexColorPicker, RgbaColorPicker } from "react-colorful";
import { Close } from "@mui/icons-material";

interface OptimizedColorPickerProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  onFieldChange?: (field: FieldPath<TFieldValues>, value: any) => void;
  fullWidth?: boolean;
  size?: "small" | "medium";
  defaultValue?: string;
}

/**
 * 内部颜色选择器组件 - 使用 react-colorful
 */
interface ColorPickerInnerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  fullWidth: boolean;
  size: "small" | "medium";
  defaultValue: string;
}

function ColorPickerInner({
  value,
  onChange,
  label,
  fullWidth,
  size,
  defaultValue,
}: ColorPickerInnerProps) {
  // 本地状态用于临时存储拖动中的颜色
  const [localColor, setLocalColor] = useState(value || defaultValue);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isCommittingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 当外部值变化时，同步到本地状态
  useEffect(() => {
    if (!isCommittingRef.current && value !== localColor) {
      setLocalColor(value || defaultValue);
    }
  }, [value, defaultValue]);

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 打开颜色选择器 Popover
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // 关闭 Popover
  const handleClose = () => {
    setAnchorEl(null);
    // 清理未完成的防抖定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  // 提交颜色变化
  const commitColorChange = (newColor: string) => {
    if (newColor !== value) {
      isCommittingRef.current = true;
      onChange(newColor);

      // 重置标志
      setTimeout(() => {
        isCommittingRef.current = false;
      }, 100);
    }
  };

  // 处理颜色选择器的变化（拖动中）- 带防抖
  const handleColorChange = (newColor: string) => {
    setLocalColor(newColor); // 立即更新本地状态以实时预览

    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 设置新的定时器，500ms 后提交颜色
    debounceTimerRef.current = setTimeout(() => {
      commitColorChange(newColor);
      debounceTimerRef.current = null;
    }, 500);
  };

  // 处理文本输入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setLocalColor(newColor);

    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
      // 清除之前的定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 设置新的定时器，500ms 后提交颜色
      debounceTimerRef.current = setTimeout(() => {
        commitColorChange(newColor);
        debounceTimerRef.current = null;
      }, 500);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: fullWidth ? "100%" : "auto",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {/* 颜色预览框 - 点击打开选择器 */}
        <Box
          onClick={handleClick}
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            backgroundColor: localColor,
            border: "2px solid",
            borderColor: "divider",
            cursor: "pointer",
            transition: "all 0.2s",
            flexShrink: 0,
            "&:hover": {
              borderColor: "primary.main",
              transform: "scale(1.05)",
            },
          }}
        />

        {/* 颜色值输入框 */}
        <TextField
          value={localColor}
          onChange={handleInputChange}
          label={label}
          fullWidth={fullWidth}
          size={size}
          sx={{
            "& input": {
              fontFamily: "monospace",
            },
          }}
        />

        {/* Popover 颜色选择器 */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          slotProps={{
            paper: {
              sx: { p: 2, mt: 1 },
            },
          }}
        >
          <Stack spacing={2}>
            {/* 关闭按钮 */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">{label}</Typography>
              <IconButton size="small" onClick={handleClose}>
                <Close fontSize="small" />
              </IconButton>
            </Box>

            {/* react-colorful 颜色选择器 */}
            <HexColorPicker color={localColor} onChange={handleColorChange} />

            {/* 显示当前颜色值 */}
            <TextField
              value={localColor}
              onChange={handleInputChange}
              size="small"
              fullWidth
              sx={{
                "& input": {
                  fontFamily: "monospace",
                  textAlign: "center",
                },
              }}
            />
          </Stack>
        </Popover>
      </Box>
    </Stack>
  );
}

/**
 * 优化的颜色选择器组件 - 使用 react-colorful
 *
 * 性能优化策略：
 * 1. 使用本地状态存储临时颜色值
 * 2. 拖动时只更新本地状态（实时预览）
 * 3. 关闭 Popover 时才提交到表单
 * 4. 避免在拖动过程中触发昂贵的图表重渲染
 *
 * 使用 react-colorful 提供更好的用户体验
 */
export function OptimizedColorPicker<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  onFieldChange,
  fullWidth = true,
  size = "small",
  defaultValue = "#000000",
}: OptimizedColorPickerProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <ColorPickerInner
          value={field.value}
          onChange={(newValue) => {
            field.onChange(newValue);
            onFieldChange?.(name, newValue);
          }}
          label={label}
          fullWidth={fullWidth}
          size={size}
          defaultValue={defaultValue}
        />
      )}
    />
  );
}

/**
 * 支持 RGBA 颜色的颜色选择器
 *
 * 使用 react-colorful 的 RgbaColorPicker
 * 支持透明度调整
 */
interface RGBAColorPickerProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  onFieldChange?: (field: FieldPath<TFieldValues>, value: any) => void;
  fullWidth?: boolean;
  size?: "small" | "medium";
  defaultValue?: string;
}

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface RGBAColorPickerInnerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  fullWidth: boolean;
  size: "small" | "medium";
  defaultValue: string;
}

function RGBAColorPickerInner({
  value,
  onChange,
  label,
  fullWidth,
  size,
  defaultValue,
}: RGBAColorPickerInnerProps) {
  // 将 rgba 字符串转换为对象
  const rgbaStringToObject = (rgba: string): RgbaColor => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] ? parseFloat(match[4]) : 1,
      };
    }
    // 如果是 hex 格式，转换为 rgba 对象
    if (rgba.startsWith("#")) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(rgba);
      if (result) {
        return {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          a: 1,
        };
      }
    }
    return { r: 0, g: 0, b: 0, a: 1 };
  };

  // 将 rgba 对象转换为字符串
  const rgbaObjectToString = (rgba: RgbaColor): string => {
    return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
  };

  const [localValue, setLocalValue] = useState(value || defaultValue);
  const [localRgba, setLocalRgba] = useState<RgbaColor>(
    rgbaStringToObject(value || defaultValue)
  );
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isCommittingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isCommittingRef.current && value !== localValue) {
      setLocalValue(value || defaultValue);
      setLocalRgba(rgbaStringToObject(value || defaultValue));
    }
  }, [value, defaultValue]);

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    // 清理未完成的防抖定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  // 提交颜色变化
  const commitColorChange = (newRgbaString: string) => {
    if (newRgbaString !== value) {
      isCommittingRef.current = true;
      onChange(newRgbaString);

      setTimeout(() => {
        isCommittingRef.current = false;
      }, 100);
    }
  };

  const handleColorChange = (newColor: RgbaColor) => {
    setLocalRgba(newColor);
    const newRgbaString = rgbaObjectToString(newColor);
    setLocalValue(newRgbaString);

    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 设置新的定时器，500ms 后提交颜色
    debounceTimerRef.current = setTimeout(() => {
      commitColorChange(newRgbaString);
      debounceTimerRef.current = null;
    }, 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    const parsed = rgbaStringToObject(newValue);
    if (parsed) {
      setLocalRgba(parsed);

      // 清除之前的定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 设置新的定时器，500ms 后提交颜色
      debounceTimerRef.current = setTimeout(() => {
        commitColorChange(newValue);
        debounceTimerRef.current = null;
      }, 500);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: fullWidth ? "100%" : "auto",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {/* 颜色预览框 - 点击打开选择器 */}
        <Box
          onClick={handleClick}
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            border: "2px solid",
            borderColor: "divider",
            cursor: "pointer",
            transition: "all 0.2s",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
            // 棋盘背景显示透明度
            backgroundImage:
              "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
            "&:hover": {
              borderColor: "primary.main",
              transform: "scale(1.05)",
            },
            // 实际颜色层
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundColor: localValue,
            },
          }}
        />

        {/* 颜色值输入框 */}
        <TextField
          value={localValue}
          onChange={handleInputChange}
          label={label}
          fullWidth={fullWidth}
          size={size}
          sx={{
            "& input": {
              fontFamily: "monospace",
            },
          }}
        />

        {/* Popover 颜色选择器 */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          slotProps={{
            paper: {
              sx: { p: 2, mt: 1 },
            },
          }}
        >
          <Stack spacing={2}>
            {/* 关闭按钮 */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">{label}</Typography>
              <IconButton size="small" onClick={handleClose}>
                <Close fontSize="small" />
              </IconButton>
            </Box>

            {/* react-colorful RGBA 颜色选择器 */}
            <RgbaColorPicker color={localRgba} onChange={handleColorChange} />

            {/* 显示当前颜色值 */}
            <TextField
              value={localValue}
              onChange={handleInputChange}
              size="small"
              fullWidth
              sx={{
                "& input": {
                  fontFamily: "monospace",
                  textAlign: "center",
                },
              }}
            />

            {/* 显示 RGBA 各个通道的值 */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 1,
              }}
            >
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">
                  R
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {localRgba.r}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">
                  G
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {localRgba.g}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">
                  B
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {localRgba.b}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">
                  A
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {localRgba.a.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Popover>
      </Box>
    </Stack>
  );
}

export function RGBAColorPicker<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  onFieldChange,
  fullWidth = true,
  size = "small",
  defaultValue = "rgba(0,0,0,1)",
}: RGBAColorPickerProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <RGBAColorPickerInner
          value={field.value}
          onChange={(newValue) => {
            field.onChange(newValue);
            onFieldChange?.(name, newValue);
          }}
          label={label}
          fullWidth={fullWidth}
          size={size}
          defaultValue={defaultValue}
        />
      )}
    />
  );
}
