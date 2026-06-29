"use client";

import { useState, useEffect, useRef } from "react";
import {
  TextField,
  Box,
  Stack,
  Typography,
  Popover,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import ColorPicker, { useColorPicker } from "react-best-gradient-color-picker";
import { HexColorPicker, RgbaColorPicker } from "react-colorful";
import { Close, Gradient, Palette } from "@mui/icons-material";
import { convertGradientObjectToECharts } from "../../utils/gradient-converter";

interface SmartColorPickerProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  onFieldChange?: (field: FieldPath<TFieldValues>, value: any) => void;
  fullWidth?: boolean;
  size?: "small" | "medium";
  defaultValue?: string;
  supportGradient?: boolean; // 是否支持渐变色
  supportAlpha?: boolean; // 是否支持透明度
}

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface SmartColorPickerInnerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  fullWidth: boolean;
  size: "small" | "medium";
  defaultValue: string;
  supportGradient: boolean;
  supportAlpha: boolean;
}

/**
 * 检测颜色值是否是渐变色
 */
function isGradientColor(color: string | any): boolean {
  // 如果是对象，可能已经是 ECharts gradient 对象
  if (typeof color !== "string") {
    return false; // 对象当作非渐变处理
  }

  return (
    color.includes("linear-gradient") ||
    color.includes("radial-gradient") ||
    color.includes("conic-gradient")
  );
}

/**
 * 智能颜色选择器内部组件
 */
function SmartColorPickerInner({
  value,
  onChange,
  label,
  fullWidth,
  size,
  defaultValue,
  supportGradient,
  supportAlpha,
}: SmartColorPickerInnerProps) {
  // 如果 value 是对象（ECharts gradient），使用 defaultValue
  // 确保 initialValue 始终是有效的字符串
  const initialValue =
    typeof value === "string" && value.trim() !== "" ? value : defaultValue;

  // 检测初始值是否是渐变色
  const initialIsGradient = isGradientColor(initialValue);

  const [localValue, setLocalValue] = useState(initialValue);
  const [colorMode, setColorMode] = useState<"solid" | "gradient">(
    initialIsGradient ? "gradient" : "solid"
  );
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isCommittingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 使用 react-best-gradient-color-picker 的 hook 来获取渐变对象
  const { getGradientObject } = useColorPicker(localValue, setLocalValue);

  // 当外部值变化时，同步到本地状态
  useEffect(() => {
    // 只有当 value 是字符串且非空时才同步
    if (
      !isCommittingRef.current &&
      typeof value === "string" &&
      value.trim() !== "" &&
      value !== localValue
    ) {
      setLocalValue(value);
      // 更新颜色模式
      if (supportGradient) {
        setColorMode(isGradientColor(value) ? "gradient" : "solid");
      }
    }
  }, [value, localValue, supportGradient]);

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
  const commitColorChange = (newValue: string) => {
    if (newValue !== value) {
      isCommittingRef.current = true;

      // SmartColorPicker 只提交 CSS 字符串
      // 转换为 ECharts 格式在 chart-store 层级进行
      onChange(newValue);

      setTimeout(() => {
        isCommittingRef.current = false;
      }, 100);
    }
  };

  // 处理颜色变化 - 带防抖
  const handleColorChange = (newValue: string) => {
    // 验证新值是否有效
    if (!newValue || typeof newValue !== "string") {
      console.warn("SmartColorPicker: Invalid color value:", newValue);
      return;
    }

    setLocalValue(newValue);

    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 设置新的定时器，500ms 后提交颜色
    debounceTimerRef.current = setTimeout(() => {
      commitColorChange(newValue);
      debounceTimerRef.current = null;
    }, 500);
  };

  // 处理颜色模式切换
  const handleColorModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: "solid" | "gradient" | null
  ) => {
    if (newMode === null) return;

    setColorMode(newMode);

    // 切换模式时，转换颜色值
    if (newMode === "solid" && isGradientColor(localValue)) {
      // 从渐变色切换到单色，提取第一个颜色
      const solidColor = supportAlpha ? "rgba(84, 112, 198, 1)" : "#5470c6";
      setLocalValue(solidColor);
      handleColorChange(solidColor);
    } else if (newMode === "gradient" && !isGradientColor(localValue)) {
      // 从单色切换到渐变色，创建一个简单的渐变
      const gradientColor = `linear-gradient(90deg, ${localValue} 0%, ${localValue} 100%)`;
      setLocalValue(gradientColor);
      handleColorChange(gradientColor);
    }
  };

  // 处理文本输入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 设置新的定时器
    debounceTimerRef.current = setTimeout(() => {
      commitColorChange(newValue);
      debounceTimerRef.current = null;
    }, 500);
  };

  // RGBA 转换函数
  const rgbaStringToObject = (rgba: string): RgbaColor => {
    const match = rgba.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
    );
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] ? parseFloat(match[4]) : 1,
      };
    }
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

  const open = Boolean(anchorEl);
  const displayValue =
    localValue.length > 50 ? `${localValue.slice(0, 50)}...` : localValue;

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
        {/* 颜色预览框 */}
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
            // 棋盘背景（用于透明色）
            backgroundImage: supportAlpha
              ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
              : "none",
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
              background: localValue,
            },
          }}
        />

        {/* 颜色值输入框 */}
        <TextField
          value={displayValue}
          onChange={handleInputChange}
          label={label}
          fullWidth={fullWidth}
          size={size}
          sx={{
            "& input": {
              fontFamily: "monospace",
              fontSize: isGradientColor(localValue) ? "0.75rem" : "0.875rem",
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
              sx: { p: 2, mt: 1, minWidth: 300 },
            },
          }}
        >
          <Stack spacing={2}>
            {/* 头部：标题和关闭按钮 */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle2">{label}</Typography>
              <IconButton size="small" onClick={handleClose}>
                <Close fontSize="small" />
              </IconButton>
            </Box>

            {/* 颜色模式切换按钮 */}
            {supportGradient && (
              <ToggleButtonGroup
                value={colorMode}
                exclusive
                onChange={handleColorModeChange}
                size="small"
                fullWidth
              >
                <ToggleButton value="solid">
                  <Palette fontSize="small" sx={{ mr: 0.5 }} />
                  Solid
                </ToggleButton>
                <ToggleButton value="gradient">
                  <Gradient fontSize="small" sx={{ mr: 0.5 }} />
                  Gradient
                </ToggleButton>
              </ToggleButtonGroup>
            )}

            {/* 颜色选择器 */}
            {colorMode === "gradient" ? (
              // 渐变色选择器
              <Box>
                <ColorPicker
                  value={
                    localValue ||
                    "linear-gradient(90deg, rgb(84, 112, 198) 0%, rgb(84, 112, 198) 100%)"
                  }
                  onChange={handleColorChange}
                  hideControls={false}
                  hideEyeDrop={false}
                  hideAdvancedSliders={false}
                  hideColorGuide={false}
                  hideInputType={false}
                />

                {/* 增强的角度控制 - 仅在线性渐变时显示 */}
                {localValue.includes("linear-gradient") &&
                  (() => {
                    const gradientObj = getGradientObject(localValue);
                    const currentDegree = Number(gradientObj?.degrees) || 90;

                    return (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          gutterBottom
                        >
                          渐变角度
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <TextField
                            type="number"
                            value={currentDegree}
                            onChange={(e) => {
                              const newDegree = Number(e.target.value);
                              if (newDegree >= 0 && newDegree <= 360) {
                                // 更新渐变角度
                                const newGradient = localValue.replace(
                                  /linear-gradient\((\d+)deg/,
                                  `linear-gradient(${newDegree}deg`
                                );
                                handleColorChange(newGradient);
                              }
                            }}
                            size="small"
                            label="角度"
                            sx={{ width: 100 }}
                            slotProps={{
                              input: {
                                endAdornment: (
                                  <Typography variant="caption">°</Typography>
                                ),
                              },
                              htmlInput: {
                                min: 0,
                                max: 360,
                                step: 1,
                              },
                            }}
                          />
                          <Box
                            sx={{
                              flex: 1,
                              '& input[type="range"]': {
                                width: "100%",
                                height: "8px",
                                cursor: "pointer",
                                accentColor: "primary.main",
                              },
                            }}
                          >
                            <input
                              type="range"
                              min="0"
                              max="360"
                              step="1"
                              value={currentDegree}
                              onChange={(e) => {
                                const newDegree = Number(e.target.value);
                                const newGradient = localValue.replace(
                                  /linear-gradient\((\d+)deg/,
                                  `linear-gradient(${newDegree}deg`
                                );
                                handleColorChange(newGradient);
                              }}
                              title="调整渐变角度"
                              aria-label="渐变角度滑块"
                            />
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })()}
              </Box>
            ) : supportAlpha ? (
              // RGBA 颜色选择器
              <RgbaColorPicker
                color={rgbaStringToObject(localValue)}
                onChange={(newColor) => {
                  const newValue = `rgba(${newColor.r},${newColor.g},${newColor.b},${newColor.a})`;
                  handleColorChange(newValue);
                }}
              />
            ) : (
              // HEX 颜色选择器
              <HexColorPicker
                color={localValue.startsWith("#") ? localValue : "#5470c6"}
                onChange={handleColorChange}
              />
            )}

            {/* 显示当前颜色值 */}
            <TextField
              value={localValue}
              onChange={handleInputChange}
              size="small"
              fullWidth
              multiline={isGradientColor(localValue)}
              rows={isGradientColor(localValue) ? 2 : 1}
              sx={{
                "& textarea, & input": {
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                },
              }}
            />

            {/* 对于 RGBA 显示各通道值 */}
            {!isGradientColor(localValue) && supportAlpha && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 1,
                }}
              >
                {["R", "G", "B", "A"].map((channel, index) => {
                  const rgba = rgbaStringToObject(localValue);
                  const values = [rgba.r, rgba.g, rgba.b, rgba.a];
                  return (
                    <Box key={channel} textAlign="center">
                      <Typography variant="caption" color="text.secondary">
                        {channel}
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace">
                        {index === 3 ? values[index].toFixed(2) : values[index]}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Stack>
        </Popover>
      </Box>
    </Stack>
  );
}

/**
 * 智能颜色选择器组件
 *
 * 特点：
 * 1. 自动检测渐变色 vs 单色
 * 2. 支持切换单色/渐变色模式
 * 3. 渐变色使用 react-best-gradient-color-picker
 * 4. 单色使用 react-colorful (支持 HEX 和 RGBA)
 * 5. 保持防抖优化 (500ms)
 * 6. 支持透明度 (可选)
 */
export function SmartColorPicker<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  onFieldChange,
  fullWidth = true,
  size = "small",
  defaultValue = "#5470c6",
  supportGradient = false,
  supportAlpha = false,
}: SmartColorPickerProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <SmartColorPickerInner
          value={field.value}
          onChange={(newValue) => {
            field.onChange(newValue);
            onFieldChange?.(name, newValue);
          }}
          label={label}
          fullWidth={fullWidth}
          size={size}
          defaultValue={defaultValue}
          supportGradient={supportGradient}
          supportAlpha={supportAlpha}
        />
      )}
    />
  );
}
