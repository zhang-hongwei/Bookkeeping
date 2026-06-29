import React, { useEffect } from "react"
import { styled, darken } from "@mui/material/styles"
import {
  Dialog,
  Typography,
  DialogContent,
  Slide,
  Button,
  Box,
} from "@mui/material"
import { TransitionProps } from "@mui/material/transitions/transition"
import hereBeDragonsImage from "@/features/mui-theme-creator/images/herebedragons.webp"
import { useThemeCreatorStore, useThemeCreatorActions } from "@/store/mui-theme-creator"

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    backgroundColor: darken(theme.palette.error.dark, 0.5),
  },
}))

const StyledDialogContent = styled(DialogContent)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
})

const ExitButtonArea = styled("div")({
  textAlign: "center",
  marginBottom: 32,
  "& > *": {
    fontFamily: '"Press Start 2P"',
  },
})

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

const SmallScreenWarning = () => {
  const warningSeen = useThemeCreatorStore((state) => state.mobileWarningSeen)
  const { setMobileWarningSeen, loadFonts } = useThemeCreatorActions()

  const handleClose = () => {
    setMobileWarningSeen()
  }

  useEffect(() => {
    loadFonts(["Press Start 2P"])
  }, [loadFonts])

  // 完全禁用小屏幕警告
  return null;

  // 原始代码（已禁用）
  /*
  return (
    <Box sx={{ display: { xs: "block", md: "none" } }}>
      <StyledDialog
        fullScreen
        open={!warningSeen}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <StyledDialogContent>
          <Typography variant="h5">Material-UI Theme Creator</Typography>
          <Typography variant="h6">You are using a small screen</Typography>
          <div>
            <Typography align="center" paragraph>
              This is a developer tool, designed for use on large screens
            </Typography>
            <Typography align="center">
              You will likely have issues viewing content or using the tools.
            </Typography>
          </div>
          <img
            src={hereBeDragonsImage}
            alt="Here Be Dragons... (for small screens)"
            width="75%"
          />
          <ExitButtonArea>
            <Typography align="center">Warning to all who enter</Typography>
            <Button variant="outlined" onClick={handleClose}>
              Here be dragons
            </Button>
          </ExitButtonArea>
        </StyledDialogContent>
      </StyledDialog>
    </Box>
  )
  */
}

export default SmallScreenWarning
