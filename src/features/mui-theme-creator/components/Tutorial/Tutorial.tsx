import React, { useEffect, useCallback } from "react"
import Backdrop from "@mui/material/Backdrop"
import Button from "@mui/material/Button"
import Portal from "@mui/material/Portal"
import Typography from "@mui/material/Typography"
import { styled } from "@mui/material/styles"
import CloseIcon from "@mui/icons-material/Close"
import { useThemeCreatorStore, useThemeCreatorActions } from "@/store/mui-theme-creator"

import stepList from "./Steps"
import TutorialStepButton from "./TutorialStepButton"

const Root = styled("div")(({ theme }) => ({
  zIndex: 5000,
  position: "relative",
}))

const Title = styled("div")(({ theme }) => ({
  position: "absolute",
  top: 0,
  textAlign: "center",
  display: "flex",
  alignItems: "baseline",
  "& > *": {
    margin: `0 ${theme.spacing()}px`,
  },
}))

const CloseButton = styled(Button)(({ theme }) => ({
  position: "absolute",
  top: 0,
  right: 0,
  fontSize: "1.5rem",
}))

const CloseIconStyled = styled(CloseIcon)(({ theme }) => ({
  fontSize: "2rem",
}))

export const TutorialContent = () => {
  const previewWindowTab = useThemeCreatorStore((state) => state.activeTab)
  const step = useThemeCreatorStore((state) => state.tutorialStep)
  const { setActiveTab, resetTutorialStep, toggleTutorial } = useThemeCreatorActions()
  const handleClose = useCallback(() => toggleTutorial(), [toggleTutorial])

  useEffect(function onStart() {
    return function onEnd() {
      // reset to the originally opened tab
      setActiveTab(previewWindowTab)
      resetTutorialStep()
    }
  }, [setActiveTab, previewWindowTab, resetTutorialStep])

  const CurrentStep = stepList[step]
  return (
    <Portal>
      <Root>
        <Backdrop open>
          <Title>
            <TutorialStepButton variant="prev" />
            <Typography variant="h3">Tutorial</Typography>
            <Typography>{`(${step + 1}/${stepList.length})`}</Typography>
            <TutorialStepButton variant="next" />
          </Title>

          <CloseButton
            onClick={handleClose}
            endIcon={<CloseIconStyled />}
          >
            Close
          </CloseButton>
          <CurrentStep />
        </Backdrop>
      </Root>
    </Portal>
  )
}

const Tutorial = () => {
  const open = useThemeCreatorStore((state) => state.tutorialOpen)
  return open ? <TutorialContent /> : null
}

export default Tutorial
