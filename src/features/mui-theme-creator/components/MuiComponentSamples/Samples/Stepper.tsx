import React from "react"
import { styled } from "@mui/material/styles"
import Stepper from "@mui/material/Stepper"
import Step from "@mui/material/Step"
import StepLabel from "@mui/material/StepLabel"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"

const StepperRoot = styled("div")({
  width: "100%",
})

const StyledButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(1),
}))

const Instructions = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}))

function getSteps() {
  return ["Select campaign settings", "Create an ad group", "Create an ad"]
}

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return "Select campaign settings..."
    case 1:
      return "What is an ad group anyways?"
    case 2:
      return "This is the bit I really care about!"
    default:
      return "Unknown step"
  }
}

export default function StepperExample() {
  const [activeStep, setActiveStep] = React.useState(0)
  const [skipped, setSkipped] = React.useState(new Set<number>())
  const steps = getSteps()

  const isStepOptional = (step: number) => {
    return step === 1
  }

  const isStepSkipped = (step: number) => {
    return skipped.has(step)
  }

  const handleNext = () => {
    let newSkipped = skipped
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values())
      newSkipped.delete(activeStep)
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1)
    setSkipped(newSkipped)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.")
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1)
    setSkipped(prevSkipped => {
      const newSkipped = new Set(prevSkipped.values())
      newSkipped.add(activeStep)
      return newSkipped
    })
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  return (
    <StepperRoot>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {}
          const labelProps: { optional?: React.ReactNode } = {}
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            )
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          )
        })}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <div>
            <Instructions>
              All steps completed - you&apos;re finished
            </Instructions>
            <StyledButton onClick={handleReset}>
              Reset
            </StyledButton>
          </div>
        ) : (
          <div>
            <Instructions>
              {getStepContent(activeStep)}
            </Instructions>
            <div>
              <StyledButton
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </StyledButton>
              {isStepOptional(activeStep) && (
                <StyledButton
                  variant="contained"
                  color="primary"
                  onClick={handleSkip}
                >
                  Skip
                </StyledButton>
              )}
              <StyledButton
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </StyledButton>
            </div>
          </div>
        )}
      </div>
    </StepperRoot>
  )
}
