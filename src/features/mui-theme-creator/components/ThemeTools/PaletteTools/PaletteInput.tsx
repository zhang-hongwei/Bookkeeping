import React, { useCallback } from "react"
import ColorInput from "@/features/mui-theme-creator/components/ColorInput"
import { Grid, Button } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useThemeCreatorActions, useThemeValueInfo } from "@/store/mui-theme-creator"

const StyledButton = styled(Button)({
  textTransform: "capitalize",
  "&.Mui-disabled": {
    fontStyle: "italic",
  },
})

interface PaletteInputProps {
  label: string
  path: string
}

export default function PaletteInput({ label, path }: PaletteInputProps) {
  const themeValueInfo = useThemeValueInfo(path)
  const { setThemeOption, removeThemeOption } = useThemeCreatorActions()

  const handleColorChange = useCallback(
    (color: string) => setThemeOption(path, color),
    [setThemeOption, path]
  )

  const handleReset = useCallback(() => removeThemeOption(path), [
    removeThemeOption,
    path,
  ])

  return (
    <Grid container justifyContent="space-between" alignItems="flex-end">
      <Grid>
        <ColorInput
          label={label}
          color={themeValueInfo.value}
          onColorChange={handleColorChange}
        />
      </Grid>
      <Grid>
        <StyledButton
          size="small"
          disabled={!themeValueInfo.modifiedByUser}
          onClick={handleReset}
        >
          {themeValueInfo.modifiedByUser ? "Reset" : "auto"}
        </StyledButton>
      </Grid>
    </Grid>
  )
}
