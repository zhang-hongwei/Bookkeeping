import React, { useCallback } from "react"
import { Typography, Switch } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useThemeCreatorActions, useThemeValue } from "@/store/mui-theme-creator"
import { ThemeValueChangeEvent } from "../events"

const InputRoot = styled("div")({
  display: "flex",
  alignItems: "center",
})

const StyledSwitch = styled(Switch)({
  "& .MuiSwitch-switchBase": {
    color: "#fff",
  },
})

export default function ThemeTypeInput() {
  const themeIsDark = useThemeValue("palette.type") === "dark"
  const { setThemeOption } = useThemeCreatorActions()

  const toggleThemeType = useCallback(() => {
    setThemeOption("palette.type", themeIsDark ? "light" : "dark")
    document.dispatchEvent(ThemeValueChangeEvent())
  }, [setThemeOption, themeIsDark])

  return (
    <InputRoot>
      <Typography
        variant="body2"
        color={themeIsDark ? "textSecondary" : "textPrimary"}
      >
        Light
      </Typography>
      <StyledSwitch
        checked={themeIsDark}
        onClick={toggleThemeType}
        color="default"
      />
      <Typography
        variant="body2"
        color={!themeIsDark ? "textSecondary" : "textPrimary"}
      >
        Dark
      </Typography>
    </InputRoot>
  )
}
