import React from "react"
import {
  ThemeProvider,
  Typography,
  Paper,
  Grid,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { useThemeCreatorStore } from "@/store/mui-theme-creator"

const SampleAreaRoot = styled(Paper)({
  overflow: "auto",
  maxHeight: 200,
  paddingLeft: 4,
})

const SampleAreaPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(0.5),
}))

const StyledTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "smallPreview",
})<{ smallPreview?: boolean }>(({ theme, smallPreview }) => ({
  transition: theme.transitions.create("font-size"),
  ...(smallPreview && {
    fontSize: "1rem",
  }),
}))

interface TypographySampleAreaProps {
  variant: any
  bgText: string
  paperText: string
  smallPreview?: boolean
  className?: string
}

// 优化：使用 React.memo 和选择性订阅提升性能
const TypographySampleArea = React.memo(function TypographySampleArea({
  variant,
  bgText,
  paperText,
  smallPreview,
  className,
  ...typographyProps
}: TypographySampleAreaProps) {
  // 优化：只订阅 themeObject，避免其他状态变化触发重渲染
  const themeObject = useThemeCreatorStore((state) => state.themeObject)

  return (
    <ThemeProvider theme={themeObject}>
      <SampleAreaRoot
        variant="outlined"
        style={{
          backgroundColor: themeObject.palette.background.default,
        }}
      >
        <Grid container wrap="nowrap" alignItems="baseline">
          <Grid>
            <StyledTypography
              variant={variant}
              smallPreview={smallPreview}
              className={className}
              {...typographyProps}
            >
              {bgText}
            </StyledTypography>
          </Grid>
          <Grid>
            <SampleAreaPaper variant="outlined" square>
              <StyledTypography
                variant={variant}
                smallPreview={smallPreview}
                className={className}
                {...typographyProps}
              >
                {paperText}
              </StyledTypography>
            </SampleAreaPaper>
          </Grid>
        </Grid>
      </SampleAreaRoot>
    </ThemeProvider>
  )
})

export default TypographySampleArea
