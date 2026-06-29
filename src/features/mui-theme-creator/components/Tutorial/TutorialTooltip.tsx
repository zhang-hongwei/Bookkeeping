import React from "react"
import Tooltip from "@mui/material/Tooltip"
import IconButton from "@mui/material/IconButton"
import { styled } from "@mui/material/styles"
import TutorialStepButton from "./TutorialStepButton"
import CloseIcon from "@mui/icons-material/Close"
import { useThemeCreatorActions } from "@/store/mui-theme-creator/store"

const TutorialTooltipContentRoot = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}))

const TutorialTooltipCloseButton = styled(IconButton)(({ theme }) => ({
  alignSelf: "flex-end",
  "& svg": {
    fontSize: "1.2em",
  },
}))

const TutorialTooltipActions = styled("div")(({ theme }) => ({
  marginTop: 8,
  display: "flex",
  justifyContent: "space-between",
}))

const TutorialTooltipContent = styled("div")(({ theme }) => ({
  paddingLeft: 16,
  paddingRight: 16,
}))

interface TooltipContentsProps {
  children: React.ReactNode
}

const TooltipContents = ({ children }: TooltipContentsProps) => {
  const { toggleTutorial } = useThemeCreatorActions()
  return (
    <TutorialTooltipContentRoot>
      <TutorialTooltipCloseButton
        size="small"
        onClick={() => toggleTutorial()}
      >
        <CloseIcon />
      </TutorialTooltipCloseButton>
      <TutorialTooltipContent>{children}</TutorialTooltipContent>
      <TutorialTooltipActions>
        <TutorialStepButton variant="prev" />
        <TutorialStepButton variant="next" />
      </TutorialTooltipActions>
    </TutorialTooltipContentRoot>
  )
}

interface TutorialTooltipProps {
  anchorId: string
  children: React.ReactNode
}

const TutorialTooltipComponent = ({ anchorId, children, ...props }: TutorialTooltipProps) =>
  document.getElementById(anchorId) && (
    <Tooltip
      {...props}
      open
      interactive
      arrow
      title={<TooltipContents>{children}</TooltipContents>}
      PopperProps={{
        anchorEl: document.getElementById(anchorId),
        disablePortal: true,
        modifiers: {
          preventOverflow: {
            boundariesElement: "viewport",
          },
        },
      }}
    >
      <div />
    </Tooltip>
  )

export default styled(TutorialTooltipComponent)(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: theme.palette.background.paper,
    fontSize: "1rem",
    maxWidth: "none",
    border: `4px solid ${theme.palette.primary.main}`,
  },
  '& .MuiTooltip-arrow': {
    color: theme.palette.primary.main,
    fontSize: "2em",
  },
}))
