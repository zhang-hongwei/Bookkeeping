import React from "react"
import {
  TextField,
  InputAdornment,
  Popover,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import ReactColorfulPicker from "./ReactColorfulPicker"
import MaterialColorPicker from "./MaterialColorPicker"
import { colorFromString } from "./utils"
import { ThemeValueChangeEvent } from "@/features/mui-theme-creator/components/ThemeTools/events"

const StyledPopover = styled(Popover)(({ theme }) => ({
  '& .MuiPopover-paper': {
    display: "flex",
    flexDirection: "column",
    borderRadius: 0,
    alignItems: "center",
  },
}))

const ColorSampleAdornment = styled("div")(({ theme }) => ({
  width: "1em",
  height: "1em",
  border: "1px solid grey",
}))

interface ColorInputProps {
  label: string
  color: string
  onColorChange: (color: string) => void
}

/**
 * The base TextField input for selecting colors.
 * onClick opens a popover with components to help pick colors
 */
// 优化：使用 React.memo 包装组件
const ColorInput = React.memo(function ColorInput({ label, color, onColorChange }: ColorInputProps) {
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)

  // 优化：使用 useCallback 缓存事件处理函数
  const handleOpenPopover = React.useCallback((event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClosePopover = React.useCallback(() => {
    setAnchorEl(null)
    document.dispatchEvent(ThemeValueChangeEvent())
  }, [])

  const handleColorChange = (value: string) => onColorChange(value)

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const pastedText = event.clipboardData.getData("text")
    const color = colorFromString(pastedText)
    if (color) {
      handleColorChange(color)
    }
  }

  const popoverOpen = Boolean(anchorEl)
  return (
    <div>
      <TextField
        label={label}
        onClick={handleOpenPopover}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <ColorSampleAdornment
                style={{
                  backgroundColor: color,
                }}
              />
            </InputAdornment>
          ),
        }}
        InputLabelProps={{ shrink: true }}
        size="small"
        value={color}
        onPaste={handlePaste}
      />
      <StyledPopover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        disableAutoFocus
        disableEnforceFocus
      >
        <ColorPicker color={color} onChangeComplete={handleColorChange} />
      </StyledPopover>
    </div>
  )
})

/**
 * Creates the ReactColorfulPicker and MaterialColorPicker
 */
interface ColorPickerProps {
  color: string
  onChangeComplete: (color: string) => void
}

function ColorPicker({ color, onChangeComplete }: ColorPickerProps) {
  return (
    <>
      <MaterialColorPicker
        color={color}
        onChangeComplete={onChangeComplete}
      />
      <ReactColorfulPicker
        color={color}
        onChangeComplete={onChangeComplete}
      />
    </>
  )
}

export default ColorInput
