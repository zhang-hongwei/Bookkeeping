import React from "react"
import { Paper } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useThemeCreatorStore } from "@/store/mui-theme-creator"
import ThemeWrapper from "@/features/mui-theme-creator/components/ThemeWrapper"
import PreviewSizeControls from "./PreviewSizeControls"

const PreviewWrapperRoot = styled("div")({
  height: "100%",
  position: "relative",
})

const LetterBox = styled("div")(({ theme }) => ({
  backgroundColor: "#212121",
  padding: theme.spacing(2),
  height: "100%",
}))

interface PreviewWrapperProps {
  children: React.ReactNode
}

/**
 * Wraps children in ThemeWrapper and creates a letterbox around the component
 */
const PreviewWrapper = ({ children }: PreviewWrapperProps) => {
  return (
    <>
      <PreviewWrapperRoot>
        <PreviewSizeControls />
        <ThemeWrapper>
          <LetterBox>
            <PreviewBackground>{children}</PreviewBackground>
          </LetterBox>
        </ThemeWrapper>
      </PreviewWrapperRoot>
    </>
  )
}

export default PreviewWrapper

const PreviewArea = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  maxWidth: 1000,
  height: "100%",
  overflowY: "scroll",
  margin: "auto",
  position: "relative", // for FAB positioning
  "&.xs": {
    maxWidth: 375,
  },
  "&.sm": {
    maxWidth: 650,
  },
  "&.md": {
    maxWidth: 1000,
  },
}))

interface PreviewBackgroundProps {
  children: React.ReactNode
}

/**
 * Creates a Paper component with a backgroundColor of `palette.background.default`
 * adds 'rtl' as a className if required by the theme to enable RTL styles.
 */
const PreviewBackground = ({ children }: PreviewBackgroundProps) => {
  // if the theme has `direction` set to 'rtl', then add 'rtl' as a classname
  // to the Paper component, so that RTL styles will be enabled
  const directionIsRTL = useThemeCreatorStore(
    (state) => state.themeOptions.direction === "rtl"
  )
  const previewSize = useThemeCreatorStore((state) => state.previewSize)
  return (
    <PreviewArea
      elevation={8}
      square
      className={previewSize || ""}
      dir={directionIsRTL ? "rtl" : ""}
    >
      {children}
    </PreviewArea>
  )
}
