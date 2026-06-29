import React, { useState, useEffect } from "react"
import { useThemeCreatorSelector } from "@/store/mui-theme-creator/store"
import clsx from "clsx"
import * as monaco from "monaco-editor"
import {
  Snackbar,
  IconButton,
  Collapse,
  Divider,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import Alert from "@mui/material/Alert"
import CloseIcon from "@mui/icons-material/Close"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"

const Root = styled("div")(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  width: "100%",
}))

const ErrorItem = styled(Snackbar)(({ theme }) => ({
  position: "relative",
  bottom: 0,
}))

const StyledAlert = styled(Alert)(({ theme }) => ({
  alignItems: "flex-end",
  width: "100%",
  '& .MuiAlert-icon': {
    padding: 0,
  },
  '& .MuiAlert-message': {
    padding: "4px 0",
    flexGrow: 1,
  },
}))

const AlertDivider = styled(Divider)(({ theme }) => ({
  marginTop: theme.spacing(),
  marginBottom: theme.spacing(),
}))

const ErrorLine = styled("div")(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
}))

const ExpandIcon = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ theme, expanded }) => ({
  transition: theme.transitions.create("transform"),
  ...(expanded && {
    transform: "rotate(180deg)",
  }),
}))

interface EditorErrorsProps {
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor | null>
}

const EditorErrors = ({ editorRef }: EditorErrorsProps) => {
  const errors = useThemeCreatorSelector((state) => state.editor.errors)
  const [open, setOpen] = useState(true)
  const [expanded, setExpanded] = useState(errors.length < 3) // default open if 1 or 2 errors
  const handleClose = () => setOpen(false)
  const handleExpand = () => setExpanded(!expanded)
  const model = editorRef.current?.getModel()

  useEffect(() => {
    if (errors.length > 0) {
      setOpen(true)
    } else {
      setOpen(false)
    }

    if (errors.length < 3) {
      setExpanded(true)
    } else {
      setExpanded(false)
    }
  }, [errors])

  const getErrorString = (error: any) => {
    if (!error.start) {
      return error.messageText
    }
    const pos = model?.getPositionAt(error.start)
    return `Line ${pos.lineNumber}:${pos.column}. ${
      error.messageText.messageText ?? error.messageText
    }`
  }

  const alertIcon = (
    <ExpandIcon
      onClick={handleExpand}
      size="small"
      expanded={expanded}
    >
      <ExpandLessIcon />
    </ExpandIcon>
  )

  const alertAction = (
    <IconButton onClick={handleClose} size="small">
      <CloseIcon />
    </IconButton>
  )

  return (
    <Root>
      <ErrorItem open={open}>
        <StyledAlert
          severity="error"
          icon={alertIcon}
          action={alertAction}
        >
          <Collapse in={expanded}>
            {errors.map(e => (
              <ErrorLine key={`${e.code}-${e.start}`}>
                {getErrorString(e)}
              </ErrorLine>
            ))}
            <AlertDivider />
          </Collapse>
          <div>{`${errors.length} errors preventing save.`}</div>
        </StyledAlert>
      </ErrorItem>
    </Root>
  )
}

export default EditorErrors
