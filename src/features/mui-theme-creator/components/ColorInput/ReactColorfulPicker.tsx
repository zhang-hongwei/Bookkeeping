import React, { useState, useEffect, useCallback } from "react"
import { HexColorPicker, RgbaColorPicker, RgbaColor } from "react-colorful"
import { Box, TextField, Stack, ToggleButtonGroup, ToggleButton, Paper } from "@mui/material"
import { styled } from "@mui/material/styles"

const PickerContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}))

const StyledColorPicker = styled(Box)({
  "& .react-colorful": {
    width: "100%",
    height: "200px",
  },
  "& .react-colorful__saturation": {
    borderRadius: "8px 8px 0 0",
  },
  "& .react-colorful__hue": {
    height: "24px",
    borderRadius: "4px",
    marginTop: "8px",
  },
  "& .react-colorful__alpha": {
    height: "24px",
    borderRadius: "4px",
    marginTop: "8px",
  },
  "& .react-colorful__pointer": {
    width: "20px",
    height: "20px",
  },
})

interface ReactColorfulPickerProps {
  color: string
  onChange?: (color: string) => void
  onChangeComplete: (color: string) => void
}

type ColorMode = "hex" | "rgba"

/**
 * 将各种颜色格式转换为标准格式
 */
function parseColor(colorString: string): { mode: ColorMode; hex: string; rgba: RgbaColor } {
  // 默认值
  const defaultColor = { mode: "hex" as ColorMode, hex: "#ffffff", rgba: { r: 255, g: 255, b: 255, a: 1 } }

  if (!colorString) return defaultColor

  // 处理 hex 格式
  if (colorString.startsWith("#")) {
    const hex = colorString
    const rgba = hexToRgba(hex)
    return { mode: "hex", hex, rgba }
  }

  // 处理 rgb/rgba 格式
  if (colorString.startsWith("rgb")) {
    const rgba = parseRgbaString(colorString)
    const hex = rgbaToHex(rgba)
    return { mode: rgba.a < 1 ? "rgba" : "hex", hex, rgba }
  }

  return defaultColor
}

/**
 * 将 hex 转换为 rgba
 */
function hexToRgba(hex: string): RgbaColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1,
      }
    : { r: 255, g: 255, b: 255, a: 1 }
}

/**
 * 将 rgba 转换为 hex
 */
function rgbaToHex(rgba: RgbaColor): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }
  return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`
}

/**
 * 解析 rgba 字符串
 */
function parseRgbaString(rgbaString: string): RgbaColor {
  const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] ? parseFloat(match[4]) : 1,
    }
  }
  return { r: 255, g: 255, b: 255, a: 1 }
}

/**
 * 将 rgba 转换为字符串
 */
function rgbaToString(rgba: RgbaColor): string {
  if (rgba.a === 1) {
    return rgbaToHex(rgba)
  }
  return `rgba(${Math.round(rgba.r)},${Math.round(rgba.g)},${Math.round(rgba.b)},${rgba.a.toFixed(2)})`
}

const ReactColorfulPicker: React.FC<ReactColorfulPickerProps> = ({
  color,
  onChange,
  onChangeComplete,
}) => {
  const [internalColor, setInternalColor] = useState(() => parseColor(color))
  const [mode, setMode] = useState<ColorMode>(() => parseColor(color).mode)

  // 当外部 color 改变时更新内部状态
  useEffect(() => {
    const parsed = parseColor(color)
    setInternalColor(parsed)
    setMode(parsed.mode)
  }, [color])

  const handleHexChange = useCallback(
    (newHex: string) => {
      const rgba = hexToRgba(newHex)
      const newColor = { mode: "hex" as ColorMode, hex: newHex, rgba }
      setInternalColor(newColor)
      onChange?.(newHex)
    },
    [onChange]
  )

  const handleRgbaChange = useCallback(
    (newRgba: RgbaColor) => {
      const hex = rgbaToHex(newRgba)
      const newColor = { mode: "rgba" as ColorMode, hex, rgba: newRgba }
      setInternalColor(newColor)
      const colorString = rgbaToString(newRgba)
      onChange?.(colorString)
    },
    [onChange]
  )

  const handleModeChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newMode: ColorMode | null) => {
      if (newMode !== null) {
        setMode(newMode)
      }
    },
    []
  )

  const handleChangeComplete = useCallback(() => {
    const colorString = mode === "hex" ? internalColor.hex : rgbaToString(internalColor.rgba)
    onChangeComplete(colorString)
  }, [mode, internalColor, onChangeComplete])

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newColorString = event.target.value
      const parsed = parseColor(newColorString)
      setInternalColor(parsed)
      onChange?.(newColorString)
    },
    [onChange]
  )

  return (
    <PickerContainer elevation={0}>
      <Stack spacing={2}>
        {/* 颜色模式切换 */}
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          aria-label="color mode"
          size="small"
          fullWidth
        >
          <ToggleButton value="hex" aria-label="hex mode">
            HEX
          </ToggleButton>
          <ToggleButton value="rgba" aria-label="rgba mode">
            RGBA
          </ToggleButton>
        </ToggleButtonGroup>

        {/* 颜色选择器 */}
        <StyledColorPicker>
          {mode === "hex" ? (
            <HexColorPicker
              color={internalColor.hex}
              onChange={handleHexChange}
              onMouseUp={handleChangeComplete}
              onTouchEnd={handleChangeComplete}
            />
          ) : (
            <RgbaColorPicker
              color={internalColor.rgba}
              onChange={handleRgbaChange}
              onMouseUp={handleChangeComplete}
              onTouchEnd={handleChangeComplete}
            />
          )}
        </StyledColorPicker>

        {/* 颜色值输入框 */}
        <TextField
          value={mode === "hex" ? internalColor.hex : rgbaToString(internalColor.rgba)}
          onChange={handleInputChange}
          onBlur={handleChangeComplete}
          size="small"
          fullWidth
          label="Color Value"
        />
      </Stack>
    </PickerContainer>
  )
}

export default ReactColorfulPicker
