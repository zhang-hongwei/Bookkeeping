import React, { useCallback } from "react"
import { useThemeCreatorSelector, useThemeCreatorActions } from "@/store/mui-theme-creator/store"
import Button from "@mui/material/Button"
import stepList from "./Steps"

const TutorialStepButton = ({ variant }) => {
  const tutorialStep = useThemeCreatorSelector((state) => state.tutorialStep)
  const { incrementTutorialStep, decrementTutorialStep, toggleTutorial } = useThemeCreatorActions()

  const handleNext = useCallback(() => {
    incrementTutorialStep()
  }, [incrementTutorialStep])

  const handlePrev = useCallback(() => {
    decrementTutorialStep()
  }, [decrementTutorialStep])

  const handleClose = useCallback(() => {
    toggleTutorial()
  }, [toggleTutorial])

  if (variant === "next" && tutorialStep === stepList.length - 1) {
    return <Button onClick={handleClose}>Finish</Button>
  }

  return (
    <Button
      disabled={
        (variant === "prev" && tutorialStep === 0) ||
        (variant === "next" && tutorialStep === stepList.length - 1)
      }
      onClick={
        variant === "next"
          ? handleNext
          : variant === "prev"
          ? handlePrev
          : undefined
      }
    >
      {variant === "next" && "Next"}
      {variant === "prev" && "Prev"}
    </Button>
  )
}

export default TutorialStepButton
