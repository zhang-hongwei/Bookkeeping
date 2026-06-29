import React, { useCallback, useEffect } from "react"
import { useThemeCreatorStore, useThemeCreatorActions } from "@/store/mui-theme-creator"

import SmartphoneIcon from "@mui/icons-material/Smartphone"
import TabletIcon from "@mui/icons-material/TabletAndroid"
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows"
import {
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import { styled } from "@mui/material/styles"

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  height: "auto",
  backgroundColor: theme.palette.background.default,
  position: "absolute",
  bottom: 0,
  left: 0,
  zIndex: 1,
  flexDirection: "column",
}))

export const previewSizeControlsId = "preview-size-controls"

const PreviewSizeControls = () => {
  const previewSize = useThemeCreatorStore((state) => state.previewSize)
  const { setPreviewSize } = useThemeCreatorActions()
  const handleOnChange = useCallback(
    (_: any, value: any) => setPreviewSize(value),
    [setPreviewSize]
  )

  const theme = useTheme()
  const screenIsMdDown = useMediaQuery(theme.breakpoints.down("md"))

  // spoof a 'xs' screen size on the preview theme
  // when the user's screen is md breakpoint and below
  useEffect(
    function previewSizeFromScreen() {
      if (screenIsMdDown) {
        handleOnChange(null, "xs")
      }
    },
    [screenIsMdDown]
  )

  return screenIsMdDown ? null : (
    <StyledBottomNavigation
      id={previewSizeControlsId}
      value={previewSize}
      onChange={handleOnChange}
      showLabels
    >
      <BottomNavigationAction
        label="Phone"
        value="xs"
        icon={<SmartphoneIcon />}
      />
      <BottomNavigationAction label="Tablet" value="sm" icon={<TabletIcon />} />
      <BottomNavigationAction
        label="Desktop"
        value={false}
        icon={<DesktopWindowsIcon />}
      />
    </StyledBottomNavigation>
  )
}

export default PreviewSizeControls
