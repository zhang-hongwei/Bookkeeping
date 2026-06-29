import React, { useState } from "react"
import FileCopyIcon from "@mui/icons-material/FileCopy"
import DownloadIcon from "@mui/icons-material/GetApp"
import SaveIcon from "@mui/icons-material/Save"
import RedoIcon from "@mui/icons-material/Redo"
import UndoIcon from "@mui/icons-material/Undo"
import Typography from "@mui/material/Typography"
import Tooltip from "@mui/material/Tooltip"
import {
  IconButton,
  Divider,
  Snackbar,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { useThemeCreatorStore } from "@/store/mui-theme-creator"
import Alert from "@mui/material/Alert"
import EditorButton from "./EditorSettings"

const EditorControlRoot = styled("div")(({ theme }) => ({
  paddingRight: theme.spacing(),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}))

const EditorControlActions = styled("div")(({ theme }) => ({
  display: "flex",
}))

interface EditorControlsProps {
  onRedo: () => void
  onUndo: () => void
  onSave: () => void
}

function EditorControls({ onRedo, onUndo, onSave }: EditorControlsProps) {
  const canUndo = useThemeCreatorStore((state) => state.editor.canUndo)
  const canRedo = useThemeCreatorStore((state) => state.editor.canRedo)
  const canSave = useThemeCreatorStore((state) => state.editor.lastVersion !== state.editor.savedVersion)
  return (
    <EditorControlRoot>
      <EditorControlActions>
        <EditorButton />
        <CopyButton />
        <Divider orientation="vertical" flexItem />
        <Tooltip title="Undo (Ctrl + Z)">
          <span>
            <IconButton disabled={!canUndo} onClick={onUndo}>
              <UndoIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo (Ctrl + Y)">
          <span>
            <IconButton disabled={!canRedo} onClick={onRedo}>
              <RedoIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Save Changes (Ctrl + S)">
          <span>
            <IconButton disabled={!canSave} onClick={onSave}>
              <SaveIcon />
            </IconButton>
          </span>
        </Tooltip>
      </EditorControlActions>
      <Typography
        variant="body2"
        color={canSave ? "textPrimary" : "textSecondary"}
        display="inline"
      >
        {canSave ? "* Unsaved Changes" : "All changes saved"}
      </Typography>
    </EditorControlRoot>
  )
}

export default EditorControls

const CopyButton = ({}) => {
  const themeInput = useThemeCreatorStore((state) => state.editor.themeInput)
  const outputTypescript = useThemeCreatorStore(
    (state) => state.editor.outputTypescript
  )
  const [open, setOpen] = useState(false)
  const copyToClipboard = () => {
    let codeToCopy = themeInput
    if (!outputTypescript) {
      // naively strip out typescript (first three lines)
      codeToCopy = [
        `export const themeOptions = {`,
        ...themeInput.split("\n").slice(3),
      ].join("\n")
    }
    navigator.clipboard.writeText(codeToCopy).then(() => setOpen(true))
  }

  return (
    <>
      <Tooltip title="Copy theme code">
        <IconButton color="primary" onClick={copyToClipboard}>
          <FileCopyIcon />
        </IconButton>
      </Tooltip>
      <Snackbar
        open={open}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={() => setOpen(false)}
      >
        <Alert variant="filled" severity="success">
          Copied theme code to clipboard!
        </Alert>
      </Snackbar>
    </>
  )
}
