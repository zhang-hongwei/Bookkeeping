import React from "react"
import { styled } from "@mui/material/styles"
import Paper from "@mui/material/Paper"
import Stepper from "@mui/material/Stepper"
import Step from "@mui/material/Step"
import StepLabel from "@mui/material/StepLabel"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import AddressForm from "./AddressForm"
import PaymentForm from "./PaymentForm"
import Review from "./Review"
import Tooltip from "@mui/material/Tooltip"

const StyledLayout = styled("div")(({ theme }) => ({
  width: "auto",
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
    maxWidth: 600,
    marginLeft: "auto",
    marginRight: "auto",
  },
}))

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(6),
    padding: theme.spacing(3),
  },
}))

const StyledStepper = styled(Stepper)(({ theme }) => ({
  padding: theme.spacing(3, 0, 5),
}))

const StyledButtons = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
})

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginLeft: theme.spacing(1),
}))

const steps = ["Shipping address", "Payment details", "Review your order"]

function getStepContent(step) {
  switch (step) {
    case 0:
      return <AddressForm />
    case 1:
      return <PaymentForm />
    case 2:
      return <Review />
    default:
      throw new Error("Unknown step")
  }
}

export default function Checkout() {
  const [activeStep, setActiveStep] = React.useState(0)

  const handleNext = () => {
    setActiveStep(activeStep + 1)
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1)
  }

  return (
    <StyledLayout>
      <StyledPaper>
        <Tooltip
          title={`<Typography color="textPrimary" variant="h4">`}
          placement="top"
          arrow
        >
          <Typography component="h1" variant="h4" align="center">
            Checkout
          </Typography>
        </Tooltip>
        <StyledStepper activeStep={activeStep}>
          {steps.map(label => (
            <Step key={label}>
              <Tooltip title={`<StepLabel>`} placement="top" arrow>
                <StepLabel>{label}</StepLabel>
              </Tooltip>
            </Step>
          ))}
        </StyledStepper>
        <React.Fragment>
          {activeStep === steps.length ? (
            <React.Fragment>
              <Tooltip
                title={`<Typography color="textPrimary" variant="h5">`}
                placement="left"
                arrow
              >
                <Typography variant="h5" gutterBottom>
                  Thank you for your order.
                </Typography>
              </Tooltip>
              <Tooltip
                title={`<Typography color="textPrimary" variant="subtitle1">`}
                placement="left"
                arrow
              >
                <Typography variant="subtitle1">
                  Your order number is #2001539. We have emailed your order
                  confirmation, and will send you an update when your order has
                  shipped.
                </Typography>
              </Tooltip>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {getStepContent(activeStep)}
              <StyledButtons>
                {activeStep !== 0 && (
                  <Tooltip title={`<Button variant="text">`} arrow>
                    <StyledButton onClick={handleBack} variant="text">
                      Back
                    </StyledButton>
                  </Tooltip>
                )}
                <Tooltip
                  title={`<Button color="primary" variant="contained">`}
                  arrow
                >
                  <StyledButton
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                  >
                    {activeStep === steps.length - 1 ? "Place order" : "Next"}
                  </StyledButton>
                </Tooltip>
              </StyledButtons>
            </React.Fragment>
          )}
        </React.Fragment>
      </StyledPaper>
    </StyledLayout>
  )
}
