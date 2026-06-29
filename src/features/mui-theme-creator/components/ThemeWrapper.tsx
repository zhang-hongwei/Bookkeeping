import React from "react"
import { ThemeProvider, styled } from "@mui/material/styles"
import { useThemeCreatorStore } from "@/store/mui-theme-creator"
import Paper from "@mui/material/Paper"

interface ThemeWrapperProps {
  children: React.ReactNode | React.ReactNodeArray
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  width: "100%",
  height: "100%",
}))

/**
 * Wraps example content in the dynamically controlled theme
 * set by the theme editor sidebar
 */
const ThemeWrapper = ({ children }: ThemeWrapperProps) => {
  const themeObject = useThemeCreatorStore((state) => state.themeObject)

  return (
    <ThemeProvider theme={themeObject}>
      <ThemeContainer>{children}</ThemeContainer>
    </ThemeProvider>
  )
}

/**
 * Theme container component with background color from theme
 */
const ThemeContainer = ({ children }: ThemeWrapperProps) => {
  return (
    <StyledPaper elevation={0} square>
      {children}
    </StyledPaper>
  )
}

export default ThemeWrapper
