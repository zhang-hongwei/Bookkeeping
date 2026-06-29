import React, { useCallback } from "react"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { Button } from "@mui/material"
import { useThemeCreatorActions } from "@/store/mui-theme-creator"

const ErrorRoot = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  height: "100vh",
  overflowY: "auto",
})

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.log("Caught Error", error)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <ErrorRoot>
          <Typography variant="h2">
            Something went wrong, causing the app to crash
          </Typography>
          <Typography variant="h1" gutterBottom>{`:(`}</Typography>
          <Typography variant="h5" gutterBottom>
            This likely is caused by an error on the ThemeOptions object
          </Typography>
          <Typography variant="h5" gutterBottom>
            This can be cleared up by wiping the saved theme data...
          </Typography>
          <Typography variant="h5" gutterBottom>
            but you will lose your saved themes. Sorry :(
          </Typography>
          <Typography variant="h6" gutterBottom>
            Click the button below to reset your local storage data for this
            site
          </Typography>
          <ClearStorageButton />
        </ErrorRoot>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

const ClearStorageButton = () => {
  const { resetSiteData } = useThemeCreatorActions()
  const handleClick = useCallback(() => {
    resetSiteData()
    location.reload()
  }, [resetSiteData])

  return (
    <Button
      variant="contained"
      color="primary"
      size="large"
      onClick={handleClick}
    >
      Reset Site Data
    </Button>
  )
}
